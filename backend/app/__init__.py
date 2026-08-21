"""
EC Support Portal — backend app factory.

One blueprint (support cases) plus the introspecting session decorator
in app/auth/session.py. Auth itself lives on the existing EC auth
service; this app never sees passwords or talks to Keycloak.

Run:
    gunicorn -w 2 -b 127.0.0.1:8006 wsgi:app
"""

import os

from flask import Flask

from .extensions import mongo

# Config keys forwarded from the environment into app.config. The
# blueprint and mailer also fall back to os.environ directly, so
# setting env vars alone works — this pass-through just makes values
# visible/overridable the Flask way too.
_ENV_PASSTHROUGH = (
    "AUTH_VALIDATE_URL",
    "SUPPORT_ATTACHMENT_DIR",
    "SUPPORT_SMTP_HOST",
    "SUPPORT_SMTP_PORT",
    "SUPPORT_SMTP_USERNAME",
    "SUPPORT_SMTP_PASSWORD",
    "SUPPORT_SMTP_STARTTLS",
    "SUPPORT_SMTP_SSL",
    "SUPPORT_INBOX",
    "SUPPORT_MAIL_FROM",
    "SUPPORT_MAIL_DOMAIN",
    "PORTAL_BASE_URL",
)


def create_app():
    app = Flask(__name__)
    app.config["MONGO_URI"] = os.environ.get(
        "MONGO_URI", "mongodb://localhost:27017/ec_support"
    )
    for key in _ENV_PASSTHROUGH:
        if os.environ.get(key) is not None:
            app.config[key] = os.environ[key]

    mongo.init_app(app)

    # CORS is only needed if the SPA is served from a DIFFERENT origin
    # than this API. The recommended nginx topology (deploy/) keeps
    # everything same-origin, in which case PORTAL_ORIGIN stays unset
    # and no CORS headers are emitted at all.
    portal_origin = os.environ.get("PORTAL_ORIGIN")
    if portal_origin:
        from flask_cors import CORS

        CORS(
            app,
            origins=[o.strip() for o in portal_origin.split(",") if o.strip()],
            allow_headers=["Authorization", "Content-Type"],
        )

    from .api.support import support_bp

    app.register_blueprint(support_bp, url_prefix="/api/v1/support")

    _ensure_indexes(app)

    @app.get("/api/v1/healthz")
    def healthz():
        return {"ok": True}

    return app


def _ensure_indexes(app):
    """Idempotent index creation at boot. Wrapped so the app can still
    start when Mongo isn't reachable yet (container build, cold start
    ordering) — the first real request will fail loudly instead."""
    try:
        with app.app_context():
            db = mongo.db
            db.support_cases.create_index("case_no", unique=True)
            db.support_cases.create_index(
                [("requester.sub", 1), ("created_at", -1)]
            )
            db.support_cases.create_index([("org_id", 1), ("created_at", -1)])
    except Exception:  # noqa: BLE001
        app.logger.warning(
            "could not ensure support indexes at boot; is Mongo up?",
            exc_info=True,
        )
