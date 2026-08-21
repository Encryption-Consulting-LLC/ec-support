"""
require_session for the standalone support backend.

The support portal deliberately does NOT reimplement authentication.
Clients sign in against the SAME auth service the Client Portal uses
(Keycloak-backed; session ids minted by the EC auth backend and rotated
on /auth/refresh). This module validates the bearer session on each
request by calling that service's /auth/validate with the same header,
then caches the answer briefly.

Config:

    AUTH_VALIDATE_URL   e.g. https://resourcehubapi.encryptionconsulting.com/api/v1/auth/validate

Trade-off to know about: results are cached for TTL seconds, so a
session that is logged out elsewhere stays usable HERE for up to that
long. 60s is the right neighborhood for a support portal; drop it if
that ever matters.

Alternative wiring: if you'd rather run the auth blueprints inside this
app (single backend, no introspection hop), register them in
app/__init__.py and replace this module with the real decorator from
that codebase — app/api/support.py only needs g.current_user populated
with sub / email / name / org_id / roles.
"""

import os
import threading
import time
from functools import wraps

import requests
from flask import current_app, g, jsonify, request

_TTL_SECONDS = 60
_NEGATIVE_TTL_SECONDS = 5   # failed lookups cached briefly — a stale or
                            # revoked token can't hammer the auth service
                            # through us at request rate
_MAX_ENTRIES = 2048

_cache = {}                 # token -> (expires_at_epoch, user_info | None)
_lock = threading.Lock()
_UNAVAILABLE = object()     # sentinel: auth service unreachable (503, not 401)


def _validate_url():
    return current_app.config.get("AUTH_VALIDATE_URL") or os.environ.get(
        "AUTH_VALIDATE_URL"
    )


def _evict_if_full(now):
    """Called with _lock held."""
    if len(_cache) < _MAX_ENTRIES:
        return
    for key in [k for k, v in _cache.items() if v[0] <= now]:
        _cache.pop(key, None)
    if len(_cache) >= _MAX_ENTRIES:
        # Pathological (thousands of distinct live tokens) — dropping
        # the cache is safe, it only costs extra validate calls.
        _cache.clear()


def _lookup(token):
    now = time.time()
    with _lock:
        hit = _cache.get(token)
        if hit and hit[0] > now:
            return hit[1]

    url = _validate_url()
    if not url:
        current_app.logger.error("AUTH_VALIDATE_URL is not configured")
        return _UNAVAILABLE

    try:
        resp = requests.get(
            url, headers={"Authorization": f"Bearer {token}"}, timeout=10
        )
    except requests.RequestException:
        current_app.logger.exception("auth validate call failed")
        return _UNAVAILABLE

    if resp.status_code in (401, 403):
        with _lock:
            _evict_if_full(now)
            _cache[token] = (now + _NEGATIVE_TTL_SECONDS, None)
        return None
    if resp.status_code != 200:
        current_app.logger.error(
            "auth validate returned %s", resp.status_code
        )
        return _UNAVAILABLE

    data = resp.json() if resp.content else {}
    # The validate response carries the caller under user_info (roles,
    # sub, email, ...). Pass it through untouched — support.py's
    # _caller() normalizes field names defensively.
    user = data.get("user_info") or data.get("user") or {}
    if not user:
        return None

    with _lock:
        _evict_if_full(now)
        _cache[token] = (now + _TTL_SECONDS, user)
    return user


def require_session(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[7:].strip() if header.lower().startswith("bearer ") else ""
        if not token:
            return jsonify({"error": "Authentication required."}), 401

        user = _lookup(token)
        if user is _UNAVAILABLE:
            return jsonify({"error": "Authentication service unavailable."}), 503
        if not user:
            # 401 (not 403): the SPA's axios interceptor keys the
            # "Session expired" dialog off 401s specifically.
            return jsonify({"error": "Session expired or invalid."}), 401

        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper
