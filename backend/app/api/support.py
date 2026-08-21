"""
Support case API — client-facing ticketing for the Resource Hub.

Endpoints (mounted at /api/v1/support — see registration note below):

    POST /cases                          create a case (multipart or JSON)
    GET  /cases                          caller's cases (?scope=all for admins)
    GET  /cases/<case_no>                one case, scoped to requester/org/admin
    POST /cases/<case_no>/comments       append a client comment
    GET  /cases/<case_no>/attachments/<idx>   download one attachment

Register in app/__init__.py alongside the other blueprints:

    from app.api.support import support_bp
    app.register_blueprint(support_bp, url_prefix="/api/v1/support")

Design notes
------------
* Case numbers are EC-<year>-<5 digit seq>, minted from an atomic
  counter document so two concurrent submissions can't collide. The
  case number — not the Mongo _id — is the public identifier: it goes
  in URLs, email subjects, and the plus-addressed Reply-To.
* Email dispatch (support inbox notification + client acknowledgement)
  happens on a daemon thread AFTER the case is committed, so a slow or
  down SMTP relay can never block or fail the API call. Dispatch
  results are written back onto the case doc under `email_dispatch`
  for troubleshooting.
* Attachments are stored on disk under SUPPORT_ATTACHMENT_DIR/<case_no>/
  with random stored names (uuid + sanitized extension), so nothing the
  client controls ever becomes a filesystem path. Originals' filenames
  live only in metadata.
"""

import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone, timedelta

from flask import Blueprint, current_app, g, jsonify, request, send_file  # noqa: F401
from werkzeug.utils import secure_filename

from app.services.support_mailer import (
    send_new_case_notifications,
    send_client_comment_notification,
    send_case_resolved_ack,
    send_case_reopened_notification,
)

# ---------------------------------------------------------------------------
# INTEGRATION SEAMS — the only two lines that need adjusting to drop this
# module into the Resource Hub backend.
# ---------------------------------------------------------------------------

# 1) Session decorator. Use the same one the admin_*.py / vault blueprints
#    use — it must populate g.current_user for the request.
from app.auth.session import require_session  # noqa: E402  (adjust import path)


def _db():
    # 2) Return the PyMongo Database handle the rest of the app uses.
    #    Kept behind one function so this module has a single DB seam.
    from app.extensions import mongo  # adjust to your project

    return mongo.db


support_bp = Blueprint("support", __name__)

# ---------------------------------------------------------------------------
# Vocabulary + limits
# ---------------------------------------------------------------------------

INQUIRY_TYPES = {"incident", "question", "feature_request", "account"}

PRODUCTS = {
    "certsecuremanager",
    "codesignsecure",
    "sshsecure",
    "hsmasaservice",
    "cbomsecure",
    "pkiasaservice",
    "other",
}

SEVERITIES = {"sev1", "sev2", "sev3", "sev4"}

# new       — just submitted, nobody has picked it up
# in_progress / waiting_on_client / resolved / closed — worked via ops.
# v1 only ever *creates* "new"; transitions are an EC-side follow-up
# (portal admin UI or direct DB ops) and deliberately out of scope here.
STATUSES = {"new", "in_progress", "waiting_on_client", "resolved", "closed"}

MAX_SUBJECT_LEN = 200
MAX_DESCRIPTION_LEN = 20000
MAX_COMMENT_LEN = 10000
MAX_CC = 10

MAX_FILES = 5
MAX_FILE_BYTES = 10 * 1024 * 1024          # 10 MB per file
MAX_TOTAL_BYTES = 20 * 1024 * 1024         # 20 MB per case

# Log/diagnostic-shaped allowlist. Executables and scripts are refused —
# a support inbox is exactly where you don't want .exe/.ps1 riding in.
ALLOWED_EXTENSIONS = {
    ".log", ".txt", ".csv", ".json", ".xml", ".yaml", ".yml",
    ".zip", ".gz", ".7z",
    ".png", ".jpg", ".jpeg", ".gif",
    ".pdf", ".docx", ".xlsx", ".pptx",
    ".pcap", ".pcapng", ".evtx", ".cer", ".crt", ".pem", ".csr",
}

# Cases a single user may open per rolling hour. Generous for humans,
# a wall for a stuck retry loop or an abusive script.
RATE_LIMIT_PER_HOUR = 20

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _now():
    return datetime.now(timezone.utc)


def _iso(dt):
    """Serialize a datetime as UTC ISO-8601 WITH the Z suffix.

    We insert timezone-aware UTC datetimes, but PyMongo returns them
    NAIVE on read (tz_aware defaults to False). A naive isoformat() has
    no Z/offset, and JavaScript parses suffix-less ISO strings as LOCAL
    time — which shifted every timestamp in the portal by the viewer's
    UTC offset (a case opened "just now" showed as hours old). All
    stored datetimes here are UTC by construction, so stamping UTC onto
    a naive value is correct, not a guess."""
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


def _caller():
    """Normalize g.current_user (dict or object) into one shape.

    The auth framework has stored user info as both an attr-object and a
    plain dict across branches; read defensively so this module doesn't
    care which one it gets.
    """
    u = getattr(g, "current_user", None) or {}

    def pick(*names):
        for n in names:
            v = u.get(n) if isinstance(u, dict) else getattr(u, n, None)
            if v:
                return v
        return None

    roles = pick("roles") or []
    if not isinstance(roles, list):
        roles = [roles]
    return {
        "sub": pick("sub", "id", "user_id"),
        "email": pick("email", "username"),
        "name": pick("name", "display_name", "full_name") or pick("username"),
        "username": pick("username", "email"),
        "org_id": pick("org_id", "organization_id"),
        "roles": [str(r).lower() for r in roles],
    }


def _is_admin(caller):
    return "admin" in caller["roles"]


def _clean_line(value, max_len):
    """Single-line, header-safe string. CR/LF are stripped rather than
    rejected because the only way they show up in a subject is either an
    accident (paste) or an email-header-injection attempt — both should
    just be neutralized."""
    if not isinstance(value, str):
        return ""
    return value.replace("\r", " ").replace("\n", " ").strip()[:max_len]


def _clean_block(value, max_len):
    if not isinstance(value, str):
        return ""
    return value.replace("\r\n", "\n").strip()[:max_len]


def _parse_cc(raw):
    """Accept a JSON array or a comma/semicolon separated string; return
    (emails, error). Deduplicates case-insensitively, caps at MAX_CC."""
    if raw is None or raw == "":
        return [], None
    items = None
    if isinstance(raw, list):
        items = raw
    else:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                items = parsed
        except (TypeError, ValueError):
            pass
        if items is None:
            items = re.split(r"[,;]", str(raw))
    out, seen = [], set()
    for item in items:
        email = _clean_line(str(item), 254)
        if not email:
            continue
        if not _EMAIL_RE.match(email):
            return None, f"'{email}' is not a valid email address."
        key = email.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(email)
    if len(out) > MAX_CC:
        return None, f"At most {MAX_CC} CC addresses are allowed."
    return out, None


def _next_case_no(db):
    """EC-<year>-<seq>, atomic per year. findOneAndUpdate with upsert is
    the standard Mongo counter pattern — two concurrent creates each get
    a distinct seq even on a replica set."""
    year = _now().year
    doc = db.counters.find_one_and_update(
        {"_id": f"support_case:{year}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,  # pymongo.ReturnDocument.AFTER under the hood
    )
    seq = doc["seq"] if isinstance(doc, dict) else doc.seq
    return f"EC-{year}-{seq:05d}"


def _attachment_dir(case_no):
    base = current_app.config.get(
        "SUPPORT_ATTACHMENT_DIR", "/var/lib/resourcehub/support-attachments"
    )
    path = os.path.join(base, case_no)
    os.makedirs(path, exist_ok=True)
    return path


def _serialize(case, caller):
    """Public shape for the SPA. Internal-only comments (EC agent notes)
    are stripped for non-admin callers — clients must never see them."""
    admin = _is_admin(caller)
    comments = [
        {
            "author": c.get("author", {}).get("name")
            or c.get("author", {}).get("email"),
            "author_email": c.get("author", {}).get("email"),
            "body": c.get("body", ""),
            "is_internal": bool(c.get("is_internal")),
            "is_system": bool(c.get("is_system")),
            "created_at": _iso(c.get("created_at")),
        }
        for c in case.get("comments", [])
        if admin or not c.get("is_internal")
    ]
    return {
        "case_no": case["case_no"],
        "org_id": case.get("org_id"),
        "requester": {
            "name": case.get("requester", {}).get("name"),
            "email": case.get("requester", {}).get("email"),
        },
        "inquiry_type": case.get("inquiry_type"),
        "product": case.get("product"),
        "severity": case.get("severity"),
        "subject": case.get("subject"),
        "cc": case.get("cc", []),
        "description": case.get("description"),
        "status": case.get("status"),
        "attachments": [
            {
                "index": i,
                "filename": a.get("filename"),
                "size": a.get("size"),
                "content_type": a.get("content_type"),
            }
            for i, a in enumerate(case.get("attachments", []))
        ],
        "comments": comments,
        "created_at": _iso(case.get("created_at")),
        "updated_at": _iso(case.get("updated_at")),
    }


def _load_case_scoped(db, case_no, caller):
    """Fetch a case the caller is allowed to see: the requester, anyone
    in the same org, or an admin. Returns (case, error_response)."""
    case = db.support_cases.find_one({"case_no": case_no})
    if not case:
        return None, (jsonify({"error": "Case not found."}), 404)
    if _is_admin(caller):
        return case, None
    same_requester = caller["sub"] and case.get("requester", {}).get("sub") == caller["sub"]
    same_org = (
        caller["org_id"]
        and case.get("org_id")
        and case.get("org_id") == caller["org_id"]
    )
    if same_requester or same_org:
        return case, None
    # Existence of a case number is not information a stranger should
    # have — indistinguishable from not-found.
    return None, (jsonify({"error": "Case not found."}), 404)


def _dispatch_async(target, *args):
    """Run mailer work on a daemon thread with an app context. The
    request that triggered it has long since returned by the time SMTP
    finishes (or times out) — which is the point."""
    app_obj = current_app._get_current_object()

    def run():
        with app_obj.app_context():
            try:
                target(*args)
            except Exception:  # noqa: BLE001 — never let mail kill a worker
                current_app.logger.exception("support mail dispatch failed")

    threading.Thread(target=run, daemon=True).start()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@support_bp.route("/cases", methods=["POST"])
@require_session
def create_case():
    db = _db()
    caller = _caller()
    if not caller["email"]:
        return jsonify({"error": "Your session has no email address; contact support."}), 400

    # -- rate limit ---------------------------------------------------------
    window_start = _now() - timedelta(hours=1)
    recent = db.support_cases.count_documents(
        {"requester.sub": caller["sub"], "created_at": {"$gte": window_start}}
    )
    if recent >= RATE_LIMIT_PER_HOUR:
        return (
            jsonify({"error": "Case limit reached. Please wait before opening another case."}),
            429,
        )

    # -- fields (multipart form or JSON body both accepted) ------------------
    src = request.form if request.form else (request.get_json(silent=True) or {})

    inquiry_type = _clean_line(src.get("inquiry_type", ""), 40)
    product = _clean_line(src.get("product", ""), 40)
    severity = _clean_line(src.get("severity", ""), 10).lower() or None
    subject = _clean_line(src.get("subject", ""), MAX_SUBJECT_LEN)
    description = _clean_block(src.get("description", ""), MAX_DESCRIPTION_LEN)
    cc, cc_err = _parse_cc(src.get("cc"))
    if cc_err:
        return jsonify({"error": cc_err}), 400

    if inquiry_type not in INQUIRY_TYPES:
        return jsonify({"error": "Choose what type of inquiry this is."}), 400
    if product not in PRODUCTS:
        return jsonify({"error": "Choose the product your inquiry relates to."}), 400
    if inquiry_type == "incident":
        if severity not in SEVERITIES:
            return jsonify({"error": "Choose a severity for the incident."}), 400
    else:
        # Severity is an incident concept; ignore anything sent for
        # questions/feature requests rather than erroring on it.
        severity = severity if severity in SEVERITIES else None
    if not subject:
        return jsonify({"error": "Subject is required."}), 400
    if not description:
        return jsonify({"error": "Description is required."}), 400

    # -- attachments ---------------------------------------------------------
    files = request.files.getlist("attachments") if request.files else []
    files = [f for f in files if f and f.filename]
    if len(files) > MAX_FILES:
        return jsonify({"error": f"At most {MAX_FILES} attachments are allowed."}), 400

    staged = []  # (file_storage, original_name, ext)
    for f in files:
        original = secure_filename(f.filename) or "attachment"
        ext = os.path.splitext(original)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return (
                jsonify({"error": f"File type '{ext or 'unknown'}' is not accepted. "
                                  f"Zip it if you need to send it."}),
                400,
            )
        staged.append((f, original, ext))

    case_no = _next_case_no(db)
    attach_dir = _attachment_dir(case_no)
    attachments_meta, attachment_paths, total = [], [], 0
    for f, original, ext in staged:
        stored_name = f"{uuid.uuid4().hex}{ext}"
        dest = os.path.join(attach_dir, stored_name)
        f.save(dest)
        size = os.path.getsize(dest)
        total += size
        if size > MAX_FILE_BYTES or total > MAX_TOTAL_BYTES:
            # Clean up everything staged for this case and refuse — a
            # half-saved attachment set is worse than none.
            for p in attachment_paths + [dest]:
                try:
                    os.remove(p)
                except OSError:
                    pass
            limit = "10 MB per file" if size > MAX_FILE_BYTES else "20 MB total"
            return jsonify({"error": f"Attachments exceed the {limit} limit."}), 400
        attachments_meta.append(
            {
                "filename": original,
                "stored_name": stored_name,
                "size": size,
                "content_type": f.mimetype or "application/octet-stream",
            }
        )
        attachment_paths.append(dest)

    # -- persist -------------------------------------------------------------
    now = _now()
    case = {
        "case_no": case_no,
        "org_id": caller["org_id"],
        "requester": {
            "sub": caller["sub"],
            "email": caller["email"],
            "name": caller["name"],
            "username": caller["username"],
        },
        "inquiry_type": inquiry_type,
        "product": product,
        "severity": severity,
        "subject": subject,
        "cc": cc,
        "description": description,
        "status": "new",
        "attachments": attachments_meta,
        "comments": [],
        "email_dispatch": {"support": "pending", "ack": "pending"},
        "created_at": now,
        "updated_at": now,
    }
    db.support_cases.insert_one(case)

    # -- notify (async): full details to support@, acknowledgement to client --
    _dispatch_async(send_new_case_notifications, case, attachment_paths)

    return jsonify({"case": _serialize(case, caller)}), 201


@support_bp.route("/cases", methods=["GET"])
@require_session
def list_cases():
    db = _db()
    caller = _caller()
    scope = request.args.get("scope", "me")

    if scope == "all" and _is_admin(caller):
        query = {}
    elif scope == "org" and caller["org_id"]:
        # Everyone in the client org can see the org's cases — mirrors
        # how the Vault scopes by membership. Flip to requester-only by
        # deleting this branch if a client asks for stricter visibility.
        query = {"org_id": caller["org_id"]}
    else:
        query = {"requester.sub": caller["sub"]}

    cursor = (
        db.support_cases.find(query)
        .sort("created_at", -1)
        .limit(200)
    )
    return jsonify({"cases": [_serialize(c, caller) for c in cursor]})


@support_bp.route("/cases/<case_no>", methods=["GET"])
@require_session
def get_case(case_no):
    db = _db()
    caller = _caller()
    case, err = _load_case_scoped(db, case_no, caller)
    if err:
        return err
    return jsonify({"case": _serialize(case, caller)})


@support_bp.route("/cases/<case_no>/comments", methods=["POST"])
@require_session
def add_comment(case_no):
    db = _db()
    caller = _caller()
    case, err = _load_case_scoped(db, case_no, caller)
    if err:
        return err
    if case.get("status") == "closed":
        return jsonify({"error": "This case is closed. Open a new case instead."}), 409

    body = _clean_block((request.get_json(silent=True) or {}).get("body", ""), MAX_COMMENT_LEN)
    if not body:
        return jsonify({"error": "Comment cannot be empty."}), 400

    comment = {
        "author": {
            "sub": caller["sub"],
            "email": caller["email"],
            "name": caller["name"],
        },
        "body": body,
        "is_internal": False,
        "created_at": _now(),
    }
    db.support_cases.update_one(
        {"case_no": case_no},
        {"$push": {"comments": comment}, "$set": {"updated_at": _now()}},
    )
    # Let the support inbox know the client added context — threads on
    # the original notification via References/In-Reply-To.
    _dispatch_async(send_client_comment_notification, case, comment)

    case = db.support_cases.find_one({"case_no": case_no})
    return jsonify({"case": _serialize(case, caller)}), 201




@support_bp.route("/cases/<case_no>/status", methods=["POST"])
@require_session
def update_status(case_no):
    """Client-driven resolution: the requester (or an org colleague /
    admin) can mark their own case resolved, and reopen a resolved or
    closed one. Status stays otherwise agent-owned — this endpoint
    accepts exactly these two transitions and nothing else."""
    db = _db()
    caller = _caller()
    case, err = _load_case_scoped(db, case_no, caller)
    if err:
        return err

    action = _clean_line(
        (request.get_json(silent=True) or {}).get("action", ""), 10
    ).lower()
    status = case.get("status")

    if action == "resolve":
        if status in ("resolved", "closed"):
            return jsonify({"error": "This case is already resolved."}), 409
        new_status = "resolved"
        note = f"Case marked as resolved by {caller['name'] or caller['email']}."
    elif action == "reopen":
        if status not in ("resolved", "closed"):
            return jsonify({"error": "Only a resolved or closed case can be reopened."}), 409
        new_status = "in_progress"
        note = f"Case reopened by {caller['name'] or caller['email']}."
    else:
        return jsonify({"error": "Unknown action."}), 400

    # The transition is recorded in the activity thread so both sides
    # see WHO changed the status and when, not just the tag flipping.
    system_comment = {
        "author": {"sub": caller["sub"], "email": caller["email"], "name": caller["name"]},
        "body": note,
        "is_internal": False,
        "is_system": True,
        "created_at": _now(),
    }
    db.support_cases.update_one(
        {"case_no": case_no},
        {
            "$set": {"status": new_status, "updated_at": _now()},
            "$push": {"comments": system_comment},
        },
    )
    case = db.support_cases.find_one({"case_no": case_no})

    if action == "resolve":
        # Per product decision: resolution confirmation goes to the
        # CLIENT side only (requester + CCs) — support is not mailed.
        _dispatch_async(send_case_resolved_ack, case)
    else:
        # A reopen without a signal to support would be a black hole —
        # nobody watches the portal, the case mail thread is the queue.
        _dispatch_async(send_case_reopened_notification, case, caller["name"] or caller["email"])

    return jsonify({"case": _serialize(case, caller)}), 200


@support_bp.route("/cases/<case_no>/attachments/<int:index>", methods=["GET"])
@require_session
def download_attachment(case_no, index):
    db = _db()
    caller = _caller()
    case, err = _load_case_scoped(db, case_no, caller)
    if err:
        return err
    attachments = case.get("attachments", [])
    if index < 0 or index >= len(attachments):
        return jsonify({"error": "Attachment not found."}), 404
    meta = attachments[index]

    base = os.path.realpath(_attachment_dir(case_no))
    path = os.path.realpath(os.path.join(base, meta["stored_name"]))
    # stored_name is server-minted (uuid+ext) so traversal shouldn't be
    # possible — but a realpath containment check costs nothing.
    if not path.startswith(base + os.sep) or not os.path.isfile(path):
        return jsonify({"error": "Attachment not found."}), 404

    return send_file(
        path,
        as_attachment=True,
        download_name=meta.get("filename") or "attachment",
        mimetype=meta.get("content_type") or "application/octet-stream",
    )
