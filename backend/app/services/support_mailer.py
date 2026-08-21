"""
Support mailer — outbound email for the support-case blueprint.

Two mails per new case:

  1. Notification → SUPPORT_INBOX (support@encryptionconsulting.com)
     Full case detail, attachments attached (within a size cap), and
     Reply-To set to the client so an agent can hit Reply in Outlook
     and land in the client's mailbox immediately.

  2. Acknowledgement → client (+ their CC list)
     Case number, summary, and the response target for the severity.
     Marked Auto-Submitted so out-of-office responders don't answer it
     and X-Auto-Response-Suppress for Exchange — this is what prevents
     the classic auto-reply mail loop.

Threading: every mail about a case carries a deterministic root
Message-ID (<case-EC-2026-00042@domain>). The new-case notification IS
that root; comment notifications reference it via In-Reply-To /
References, so the support mailbox shows one conversation per case
instead of a scatter of unrelated mails. Reply-To on the acknowledgement
is plus-addressed (support+EC-2026-00042@domain) — inert today, but the
ticket key is already in the address the day inbound parsing is added.

Config (Flask app.config, falling back to environment):

  SUPPORT_SMTP_HOST        required — relay hostname/IP
  SUPPORT_SMTP_PORT        default 25 (2525 also common for local relays)
  SUPPORT_SMTP_USERNAME    optional — leave unset for an anonymous relay
  SUPPORT_SMTP_PASSWORD    optional
  SUPPORT_SMTP_STARTTLS    "true"/"false", default true when a username is set
  SUPPORT_SMTP_SSL         "true"/"false", default false (implicit-TLS, port 465)
  SUPPORT_INBOX            default support@encryptionconsulting.com
  SUPPORT_MAIL_FROM        default "Encryption Consulting Support <SUPPORT_INBOX>"
  SUPPORT_MAIL_DOMAIN      default encryptionconsulting.com (Message-ID / Reply-To)
  PORTAL_BASE_URL          default https://resourcehub.encryptionconsulting.com

Deliverability note: whatever mailbox/relay you send through must have
SPF/DKIM/DMARC aligned for the From domain, or the acknowledgement will
land in clients' Junk folders and the portal will look broken.
"""

import html
import os
import smtplib
import ssl
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import formataddr, make_msgid

from flask import current_app

# Response targets quoted in the acknowledgement. Business-hours SLA
# language — adjust to whatever the signed support agreements actually
# say before go-live.
SEVERITY_RESPONSE_TARGET = {
    "sev1": "2 business hours",
    "sev2": "4 business hours",
    "sev3": "1 business day",
    "sev4": "2 business days",
    None: "1 business day",
}

SEVERITY_LABEL = {
    "sev1": "Sev1 — Critical",
    "sev2": "Sev2 — Major",
    "sev3": "Sev3 — Minor",
    "sev4": "Sev4 — Question / cosmetic",
}

INQUIRY_LABEL = {
    "incident": "Incident",
    "question": "Question",
    "feature_request": "Feature request",
    "account": "Licensing / account",
}

PRODUCT_LABEL = {
    "certsecuremanager": "CertSecure Manager",
    "codesignsecure": "CodeSign Secure",
    "sshsecure": "SSH Secure",
    "hsmasaservice": "HSM As A Service",
    "cbomsecure": "CBOM Secure",
    "pkiasaservice": "PKI As A Service",
    "other": "Other",
}

# Cap on what gets ATTACHED to the support notification. Files always
# remain downloadable from the portal; this only bounds the email size
# so a 19 MB pcap doesn't get the whole notification rejected by the
# receiving MTA.
MAX_EMAIL_ATTACH_BYTES = 15 * 1024 * 1024


# ---------------------------------------------------------------------------
# Config / transport
# ---------------------------------------------------------------------------


def _cfg(key, default=None):
    value = current_app.config.get(key)
    if value is None:
        value = os.environ.get(key)
    return value if value is not None else default


def _bool_cfg(key, default):
    raw = _cfg(key)
    if raw is None:
        return default
    return str(raw).strip().lower() in {"1", "true", "yes", "on"}


def _domain():
    return _cfg("SUPPORT_MAIL_DOMAIN", "encryptionconsulting.com")


def _inbox():
    return _cfg("SUPPORT_INBOX", f"support@{_domain()}")


def _from_addr():
    return _cfg(
        "SUPPORT_MAIL_FROM",
        formataddr(("Encryption Consulting Support", _inbox())),
    )


def _portal_url(case_no):
    base = _cfg("PORTAL_BASE_URL", "https://resourcehub.encryptionconsulting.com")
    return f"{base.rstrip('/')}/support/{case_no}"


def _root_message_id(case_no):
    """Deterministic conversation root for a case. All case mail either
    carries this ID or references it, which is what makes mail clients
    thread everything about one case together."""
    return f"<case-{case_no}@{_domain()}>"


def _send(messages):
    """Send one or more EmailMessage objects over a single SMTP session.

    Anonymous relays (no auth, often plain port 25/2525 inside the
    perimeter) are first-class here: login/STARTTLS only happen when
    configured, mirroring how internal Exchange/Postfix relays are
    typically exposed.
    """
    host = _cfg("SUPPORT_SMTP_HOST")
    if not host:
        raise RuntimeError("SUPPORT_SMTP_HOST is not configured")
    port = int(_cfg("SUPPORT_SMTP_PORT", 25))
    username = _cfg("SUPPORT_SMTP_USERNAME")
    password = _cfg("SUPPORT_SMTP_PASSWORD")
    use_ssl = _bool_cfg("SUPPORT_SMTP_SSL", False)
    use_starttls = _bool_cfg("SUPPORT_SMTP_STARTTLS", bool(username))

    # Verify the relay's certificate. Left to its own devices, smtplib
    # builds its TLS context with ssl._create_stdlib_context(), which sets
    # check_hostname=False and verify_mode=CERT_NONE -- so the SMTP AUTH
    # password below would cross an unauthenticated session that anything
    # on the path could intercept. Passing an explicit default context
    # fixes that for both implicit TLS and STARTTLS.
    context = ssl.create_default_context()

    if use_ssl:
        session = smtplib.SMTP_SSL(host, port, timeout=30, context=context)
    else:
        session = smtplib.SMTP(host, port, timeout=30)

    with session as smtp:
        if use_starttls and not use_ssl:
            smtp.starttls(context=context)
        if username:
            smtp.login(username, password or "")
        for msg in messages:
            # send_message() returns a dict of the recipients the relay
            # REFUSED -- empty means it accepted responsibility for all of
            # them. Logging it is the difference between "we think it sent"
            # and knowing which mailbox Exchange actually took, which is
            # the first question when someone says the acknowledgement
            # never arrived.
            refused = smtp.send_message(msg)
            current_app.logger.info(
                "relay accepted mail: to=%s cc=%s subject=%r refused=%s",
                msg.get("To"),
                msg.get("Cc") or "-",
                msg.get("Subject"),
                refused if refused else "none",
            )


def _mark(case_no, field, value):
    """Best-effort write of dispatch status back onto the case doc."""
    try:
        from app.api.support import _db  # late import — avoids a cycle at load

        _db().support_cases.update_one(
            {"case_no": case_no},
            {"$set": {f"email_dispatch.{field}": value,
                      "email_dispatch.at": datetime.now(timezone.utc)}},
        )
    except Exception:  # noqa: BLE001
        current_app.logger.exception("could not record email dispatch status")


# ---------------------------------------------------------------------------
# Body builders
# ---------------------------------------------------------------------------


def _case_rows(case):
    return [
        ("Case", case["case_no"]),
        ("Status", case.get("status", "new")),
        ("Inquiry type", INQUIRY_LABEL.get(case.get("inquiry_type"), case.get("inquiry_type"))),
        ("Product", PRODUCT_LABEL.get(case.get("product"), case.get("product"))),
        ("Severity", SEVERITY_LABEL.get(case.get("severity"), "—")),
        ("Requester", f"{case['requester'].get('name') or ''} <{case['requester'].get('email')}>".strip()),
        ("CC", ", ".join(case.get("cc", [])) or "—"),
        ("Opened", case.get("created_at").strftime("%Y-%m-%d %H:%M UTC")
                   if case.get("created_at") else "—"),
        ("Portal link", _portal_url(case["case_no"])),
    ]


def _paragraphs(text):
    """Render a plain-text block as HTML paragraphs, keeping the single
    line breaks inside each one."""
    out = []
    for para in [b.strip() for b in (text or "").split("\n\n") if b.strip()]:
        out.append(
            "<p style='margin:0 0 12px'>"
            + html.escape(para).replace("\n", "<br>")
            + "</p>"
        )
    return "".join(out)


def _plain_body(case, heading, extra_block=None, intro_block=None):
    lines = []
    if intro_block:
        lines += [intro_block, ""]
    lines += [heading, ""]
    lines += [f"{label}: {value}" for label, value in _case_rows(case)]
    lines += ["", "Description:", "-" * 40, case.get("description", ""), "-" * 40]
    if extra_block:
        lines += ["", extra_block]
    return "\n".join(lines)


def _html_body(case, heading, extra_block=None, intro_block=None):
    rows = "".join(
        f"<tr><td style='padding:4px 12px 4px 0;color:#555;white-space:nowrap'>{html.escape(label)}</td>"
        f"<td style='padding:4px 0'>{html.escape(str(value))}</td></tr>"
        for label, value in _case_rows(case)
    )
    extra = _paragraphs(extra_block)
    intro = _paragraphs(intro_block)
    description = html.escape(case.get("description", "")).replace("\n", "<br>")
    return f"""\
<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#1a1c20;max-width:680px">
  <div style="background:#101828;color:#fff;padding:14px 20px;border-radius:8px 8px 0 0">
    <strong>Encryption Consulting Support</strong> &nbsp;·&nbsp; {html.escape(heading)}
  </div>
  <div style="border:1px solid #e4e7ec;border-top:0;padding:20px;border-radius:0 0 8px 8px">
    {intro}
    <table style="border-collapse:collapse;font-size:14px">{rows}</table>
    <p style="margin:16px 0 4px"><strong>Description</strong></p>
    <div style="background:#f5f6f8;border:1px solid #e4e7ec;border-radius:6px;padding:12px;white-space:normal">{description}</div>
    {extra}
  </div>
</div>"""


# ---------------------------------------------------------------------------
# Public entry points (called from support.py on a background thread)
# ---------------------------------------------------------------------------


def _attach_files(msg, case, attachment_paths):
    """Attach the case's files to a message, within the email size cap.
    Used by the support notification AND the client acknowledgement --
    the filename list was dropped from the bodies, so the files
    themselves are the record. Oversized files stay in the portal."""
    attached = 0
    for meta, path in zip(case.get("attachments", []), attachment_paths):
        try:
            size = os.path.getsize(path)
            if attached + size > MAX_EMAIL_ATTACH_BYTES:
                continue
            with open(path, "rb") as fh:
                data = fh.read()
            maintype, _, subtype = (meta.get("content_type") or "application/octet-stream").partition("/")
            msg.add_attachment(
                data,
                maintype=maintype or "application",
                subtype=subtype or "octet-stream",
                filename=meta["filename"],
            )
            attached += size
        except OSError:
            current_app.logger.exception("could not attach %s to case mail", path)


def send_new_case_notifications(case, attachment_paths):
    case_no = case["case_no"]
    root_id = _root_message_id(case_no)
    severity_tag = f"[{case['severity'].upper()}] " if case.get("severity") else ""
    requester_email = case["requester"]["email"]

    # ---- 1) full detail → support inbox ------------------------------------
    notify = EmailMessage()
    notify["From"] = _from_addr()
    notify["To"] = _inbox()
    notify["Subject"] = f"[{case_no}] {severity_tag}{case['subject']}"
    # Agent hits Reply → goes straight to the client (and their CCs).
    notify["Reply-To"] = ", ".join([requester_email] + case.get("cc", []))
    notify["Message-ID"] = root_id
    notify["X-EC-Case"] = case_no
    notify.set_content(_plain_body(case, "New support case"))
    notify.add_alternative(_html_body(case, "New support case"), subtype="html")

    _attach_files(notify, case, attachment_paths)

    try:
        _send([notify])
        _mark(case_no, "support", "sent")
    except Exception:  # noqa: BLE001
        current_app.logger.exception("support notification failed for %s", case_no)
        _mark(case_no, "support", "failed")

    # ---- 2) acknowledgement → client (+CC) ----------------------------------
    ack = EmailMessage()
    ack["From"] = _from_addr()
    ack["To"] = requester_email
    if case.get("cc"):
        ack["Cc"] = ", ".join(case["cc"])
    ack["Subject"] = f"[{case_no}] Your support case has been created"
    # Plus-address carries the ticket key for the day inbound parsing
    # exists; today replies are steered to the portal in the body copy.
    ack["Reply-To"] = f"support+{case_no}@{_domain()}"
    ack["Message-ID"] = make_msgid(domain=_domain())
    ack["In-Reply-To"] = root_id
    ack["References"] = root_id
    ack["X-EC-Case"] = case_no
    # OOO-loop protection via the Exchange-specific header only.
    # RFC 3834's Auto-Submitted: auto-generated was here too, but it is
    # also the strongest "not a human, file it away from the Inbox"
    # signal Outlook's Focused Inbox and Clutter act on — acks were
    # accepted by the relay yet never seen by the requester. Dropping it
    # trades a little loop protection for the ack actually being read;
    # X-Auto-Response-Suppress still stops Exchange OOO replies, and an
    # OOO from elsewhere lands in support+<case>@, not back here.
    ack["X-Auto-Response-Suppress"] = "All"

    first_name = (case["requester"].get("name") or "").split(" ")[0] or "there"

    # Written as ONE string used by both the plain-text and HTML
    # alternatives. Previously the greeting lived only in set_content(),
    # so the HTML part -- the one mail clients actually render -- arrived
    # as a bare summary table with no message in it at all.
    ack_intro = (
        f"Hi {first_name},\n\n"
        f"Thank you for contacting Encryption Consulting Support.\n\n"
        f"Your case {case_no} has been created and is now in our support "
        f"queue. An Encryption Consulting consultant will review it and get "
        f"back to you.\n\n"
        f"There is nothing further you need to do — we will be in touch. If "
        f"you would like to add information in the meantime, reply to this "
        f"email or open the case in the portal."
    )
    ack_extra = "Thank you,\nEncryption Consulting Support"

    ack.set_content(
        _plain_body(
            case,
            "Your case summary",
            extra_block=ack_extra,
            intro_block=ack_intro,
        )
        + "\n"
    )
    ack.add_alternative(
        _html_body(
            case,
            f"Case {case_no} received",
            extra_block=ack_extra,
            intro_block=ack_intro,
        ),
        subtype="html",
    )

    _attach_files(ack, case, attachment_paths)

    try:
        _send([ack])
        _mark(case_no, "ack", "sent")
    except Exception:  # noqa: BLE001
        current_app.logger.exception("acknowledgement failed for %s", case_no)
        _mark(case_no, "ack", "failed")


def send_case_resolved_ack(case):
    """Client marked the case resolved → confirmation to the CLIENT side
    only (requester + CCs). Support is deliberately not mailed here —
    the client closed the loop themselves; a mail to the queue would
    just be noise an agent has to triage."""
    case_no = case["case_no"]
    root_id = _root_message_id(case_no)

    msg = EmailMessage()
    msg["From"] = _from_addr()
    msg["To"] = case["requester"]["email"]
    if case.get("cc"):
        msg["Cc"] = ", ".join(case["cc"])
    msg["Subject"] = f"[{case_no}] Your case has been marked as resolved"
    msg["Reply-To"] = f"support+{case_no}@{_domain()}"
    msg["Message-ID"] = make_msgid(domain=_domain())
    msg["In-Reply-To"] = root_id
    msg["References"] = root_id
    msg["X-EC-Case"] = case_no
    msg["X-Auto-Response-Suppress"] = "All"

    first_name = (case["requester"].get("name") or "").split(" ")[0] or "there"
    intro = (
        f"Hi {first_name},\n\n"
        f"Your case {case_no} has been marked as resolved.\n\n"
        f"If everything is working as expected, no further action is needed. "
        f"If the issue is not fully fixed, you can reopen the case from the "
        f"portal at any time and we will pick it up again."
    )
    extra = "Thank you,\nEncryption Consulting Support"
    msg.set_content(
        _plain_body(case, "Case summary", extra_block=extra, intro_block=intro) + "\n"
    )
    msg.add_alternative(
        _html_body(case, f"Case {case_no} resolved", extra_block=extra, intro_block=intro),
        subtype="html",
    )

    try:
        _send([msg])
        _mark(case_no, "resolved_ack", "sent")
    except Exception:  # noqa: BLE001
        current_app.logger.exception("resolved ack failed for %s", case_no)
        _mark(case_no, "resolved_ack", "failed")


def send_case_reopened_notification(case, actor):
    """Client reopened a resolved/closed case → alert the support inbox,
    threaded under the original case mail. Without this, a reopen is
    invisible: agents work out of the mailbox, not the portal."""
    case_no = case["case_no"]
    root_id = _root_message_id(case_no)

    msg = EmailMessage()
    msg["From"] = _from_addr()
    msg["To"] = _inbox()
    msg["Subject"] = f"[{case_no}] Case reopened by client"
    msg["Reply-To"] = ", ".join([case["requester"]["email"]] + case.get("cc", []))
    msg["Message-ID"] = make_msgid(domain=_domain())
    msg["In-Reply-To"] = root_id
    msg["References"] = root_id
    msg["X-EC-Case"] = case_no

    intro = (
        f"{actor} has REOPENED case {case_no}. The issue is not fully "
        f"resolved on the client side — please follow up."
    )
    msg.set_content(_plain_body(case, "Case summary", intro_block=intro) + "\n")
    msg.add_alternative(
        _html_body(case, f"Case {case_no} reopened", intro_block=intro),
        subtype="html",
    )

    try:
        _send([msg])
        _mark(case_no, "reopened_notice", "sent")
    except Exception:  # noqa: BLE001
        current_app.logger.exception("reopen notice failed for %s", case_no)
        _mark(case_no, "reopened_notice", "failed")


def send_client_comment_notification(case, comment):
    """Client added a comment in the portal → nudge the support inbox.
    Threads under the original notification via References."""
    case_no = case["case_no"]
    root_id = _root_message_id(case_no)

    msg = EmailMessage()
    msg["From"] = _from_addr()
    msg["To"] = _inbox()
    msg["Subject"] = f"[{case_no}] Client update: {case['subject']}"
    msg["Reply-To"] = case["requester"]["email"]
    msg["Message-ID"] = make_msgid(domain=_domain())
    msg["In-Reply-To"] = root_id
    msg["References"] = root_id
    msg["X-EC-Case"] = case_no

    author = comment.get("author", {})
    body = (
        f"Case: {case_no}\n"
        f"From: {author.get('name') or ''} <{author.get('email')}>\n"
        f"Portal: {_portal_url(case_no)}\n\n"
        f"{comment.get('body', '')}\n"
    )
    msg.set_content(body)

    try:
        _send([msg])
    except Exception:  # noqa: BLE001
        current_app.logger.exception("comment notification failed for %s", case_no)
