# EC Support Portal (frontend)

Standalone client-facing support/ticketing portal. Auth (Keycloak via the
EC auth backend) is vendored from the Client Portal, so clients sign in
with the same credentials.

    cp .env.example .env   # point VITE_SITE_BACKEND_URL at your API
    npm install
    npm run dev            # or: npm run build → dist/

See ../INTEGRATION.md for backend + nginx wiring.
