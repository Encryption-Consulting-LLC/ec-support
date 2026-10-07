"""Fake auth service for LOCAL DEVELOPMENT ONLY.

Stands in for resourcehubapi.encryptionconsulting.com so the portal can be
used signed-in on a laptop without Keycloak or Azure. Any username and any
password log in. A username containing "admin" gets the admin role.

    python tools/mock_auth.py            # listens on 127.0.0.1:8007

Then point the two halves of the portal at it, each in its own terminal:
  frontend:  $env:MOCK_AUTH = "1"; npm run dev
  backend:   $env:AUTH_VALIDATE_URL = "http://127.0.0.1:8007/api/v1/auth/validate"

Never deploy this or point a server at it: it lets anyone in.
Standard library only, so it needs no install.
"""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

HOST, PORT = "127.0.0.1", 8007  # loopback only: unreachable from other machines
TOKEN_PREFIX = "mock."  # session ids look like "mock.testadmin"


def user_for(username):
    """The fake user behind a session. Field names match what the real
    validate endpoint returns (backend/app/api/support.py _caller reads them)."""
    name = username or "dev"
    return {
        "sub": f"mock-{name}",
        "username": name,
        "email": f"{name}@example.test",
        "name": name.replace(".", " ").title(),
        "roles": ["admin"] if "admin" in name.lower() else [],
    }


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _json_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        try:
            return json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            return {}

    def _session_user(self):
        header = self.headers.get("Authorization", "")
        token = header[7:].strip() if header.lower().startswith("bearer ") else ""
        if not token.startswith(TOKEN_PREFIX):
            return None
        return user_for(token[len(TOKEN_PREFIX):])

    def _route(self, method):
        path = urlparse(self.path).path.rstrip("/")
        body = self._json_body() if method in ("POST", "PATCH") else {}

        if path == "/api/v1/auth/login-precheck":
            return self._send(200, {"exists": True, "requires_totp": False,
                                    "requires_webauthn": False, "realm_name": "mock"})
        if path == "/api/v1/auth/login":
            username = str(body.get("username") or "dev").strip()
            return self._send(200, {"session_id": TOKEN_PREFIX + username})
        if path == "/api/v1/auth/sso/providers":
            return self._send(200, {"success": True, "data": {}})  # no SSO buttons
        if path in ("/api/v1/auth/logout", "/api/v1/auth/sso/logout/callback"):
            return self._send(200, {"success": True})

        user = self._session_user()
        if user is None:
            return self._send(401, {"error": "Session expired or invalid."})
        if path == "/api/v1/auth/validate":
            return self._send(200, {"user_info": user})
        if path == "/api/v1/auth/refresh":
            return self._send(200, {"session_id": TOKEN_PREFIX + user["username"]})
        if path == "/api/v1/user/me":
            return self._send(200, user)
        if path == "/api/v1/user/me/config":
            return self._send(200, {"config": {}})
        return self._send(404, {"error": f"mock auth has no {method} {path}"})

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")

    def do_PATCH(self):
        self._route("PATCH")


if __name__ == "__main__":
    print(f"MOCK AUTH on http://{HOST}:{PORT}  (local dev only, accepts any login)")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
