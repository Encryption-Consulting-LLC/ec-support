# EC Support Portal — Overview

Client-facing support/ticketing portal for Encryption Consulting. Clients log
in with their existing EC (Keycloak) credentials, open support cases with
attachments, track them, comment, and resolve/reopen them. Every case is
routed by email to `support@encryptionconsulting.com` and acknowledged to the
client — agents work cases from the support mailbox; the portal and the mail
thread stay in step.

| | |
|---|---|
| **Public URL** | https://support.encryptionconsulting.com (Cloudflare Tunnel) |
| **LAN URL** | https://192.168.1.17 (self-signed cert — browser warning is expected) |
| **Host** | Ubuntu 22.04 VM `192.168.1.17` (VMware, 2 vCPU / 8 GB / 12 GB) |
| **Repo on host** | `/home/ec/ec-support-portal` |
| **Deployed app** | backend `/opt/ec-support/backend`, SPA `/var/www/ec-support-portal/dist` |
| **Support inbox** | support@encryptionconsulting.com |
| **Hotline (shown in portal)** | +1 469 815 4136 (Mon–Fri, 8 AM–5 PM CST) |

---

## Quick start / stop

```bash
# start everything (pulls up mongod + nginx via Wants=)
sudo systemctl start ecsupport

# stop the portal API (mongod and nginx stay up — they are shared services)
sudo systemctl stop ecsupport

# restart after a config change
sudo systemctl restart ecsupport

# full-stack status at a glance (services, health, case count, disk, mail)
ecsupport-status

# live API log
journalctl -u ecsupport -f
```

The stack self-heals: `ecsupport-health.timer` probes every 2 minutes and
restarts whichever component is down (see Monitoring below). To stop the
portal *and keep it stopped*, disable the timer too:

```bash
sudo systemctl stop ecsupport && sudo systemctl stop ecsupport-health.timer
# bring it back:
sudo systemctl start ecsupport && sudo systemctl start ecsupport-health.timer
```

---

## Architecture

```
Browser ── https://support.encryptionconsulting.com
              │  Cloudflare edge (trusted cert for clients)
              ▼
        Cloudflare Tunnel  ── connector currently runs on the Windows
              │               machine 192.168.1.23 → if that machine is
              ▼               off, the DOMAIN is down (LAN IP still works)
        nginx :443 on 192.168.1.17   (self-signed origin cert, /etc/ssl/ec/)
              │
              ├── /api/v1/auth/*  ──►  resourcehubapi.encryptionconsulting.com
              ├── /api/v1/user/*       (existing EC auth backend — Keycloak,
              │                         passwords never touch this VM)
              ├── /api/v1/support/* ─► gunicorn 127.0.0.1:8006 (Flask)
              │                            │
              │                            ├── MongoDB 127.0.0.1:27017 / ec_support
              │                            ├── attachments → /var/lib/ec-support/attachments
              │                            └── SMTP → smtp.office365.com:587 (STARTTLS)
              └── everything else  ──►  SPA  /var/www/ec-support-portal/dist
```

Single-origin design: one domain serves the SPA and fronts both API families,
so the browser never does CORS and the vendored Client-Portal login code runs
unmodified. **Authentication is never reimplemented here** — each request's
bearer session is introspected against the auth service's `/auth/validate`
(60 s cache; see `backend/app/auth/session.py`).

Port 80 exists only to 301 visitors to HTTPS (healthz stays answerable over
HTTP for the health probe).

## Stack

- **Frontend** — React 19 + PrimeReact 10 + primeflex, Vite. Vendored EC
  login stack (Keycloak, TOTP/WebAuthn required-action handoff, session
  rotation). Centered 1200 px shell, hero bands, card surfaces, dark mode via
  `data-theme` tokens.
- **Backend** — Flask 3 + Flask-PyMongo, gunicorn (gthread 2×8 — threads
  because every request makes a blocking auth-introspection call).
- **Database** — MongoDB 8.0, database `ec_support`, collections
  `support_cases` + `counters`. Bound to localhost only.
- **Mail** — Exchange Online basic auth (`sam@encryptionconsulting.com`) over
  verified STARTTLS. `SUPPORT_MAIL_FROM` must stay the authenticated mailbox
  unless Send-As on `support@` is granted (else `550 5.7.60 SendAsDenied`).

## Features

**Client side** (`/support`, `/support/new`, `/support/:case_no`,
`/support/guide`):

- Case list — searchable, sortable (newest update first), relative dates
  with full timestamp on hover, case numbers are real links.
- Open a case — inquiry type → product → severity (incidents only) → subject
  → CC (commits on blur *and* Enter) → description → attachments (button,
  drag-drop, **and Ctrl+V paste**; 5 files / 10 MB each / 20 MB total,
  extension allowlist, no executables). Guidance panel: severity matrix,
  Sev1 call-first note with `tel:` hotline, per-product KB link, data-privacy
  note.
- Case detail — meta, description, attachment downloads, activity thread
  (system notes styled distinctly), comment box, **Mark as resolved /
  Reopen** with confirm dialogs, refresh button.
- "Working with EC Support" guide — contact cards, 4-step process, official
  severity/response-target table (Standard / Premium / Premium Plus), plan
  comparison matrix, coverage tile grid with scope caveat, KB links out to
  encryptionconsulting.com.
- Knowledge base is deliberately **not hosted here** — the portal links to
  product pages and the Education Center on encryptionconsulting.com.

**Email flow** (all mail threads under one deterministic Message-ID
`<case-EC-YYYY-NNNNN@encryptionconsulting.com>`):

| Event | To | Notes |
|---|---|---|
| Case created | support@ | Full detail, files attached (15 MB email cap), Reply-To = client+CCs so a plain Reply reaches them |
| Case created | requester + CCs | Branded confirmation, files attached, Reply-To plus-addressed `support+EC-…@` |
| Client comments | support@ | Threaded "client update" |
| Client resolves | requester + CCs **only** | Confirmation; support is deliberately not mailed |
| Client reopens | support@ | Alert — agents work from the mailbox, a silent reopen would be a black hole |

SMTP failure never fails the API — the case persists and the outcome is
recorded on the document under `email_dispatch`; the health probe flags any
`failed` dispatch within 2 minutes.

**Guardrails** — org/requester scoping (foreign case numbers 404), admin
`?scope=all`, email-header-injection stripping, CC validation (max 10),
UUID-named attachment storage with realpath containment, 20 cases/user/hour
rate limit, internal comments hidden from clients, atomic case numbering.

## Services (systemd)

| Unit | What | Notes |
|---|---|---|
| `ecsupport.service` | gunicorn API on 127.0.0.1:8006 | Entry point; `Wants=` mongod + nginx; `Restart=always`, crash-loop backstop; hardened (`ProtectSystem=strict`, writes only `/var/lib/ec-support`) |
| `mongod.service` | MongoDB 8.0 | Shared host service — portal stop must not take it down |
| `nginx.service` | TLS edge + SPA + proxy | Sites: `ec-support` (port 80 redirect), `ec-support-ssl` (443) |
| `ecsupport-health.timer` → `.service` | Probe every 2 min | See Monitoring |
| `ecsupport-maildump.service` | Dev SMTP sink | **Disabled** — real relay in use. Re-enable only for offline testing with `SUPPORT_SMTP_HOST=127.0.0.1` |

## Monitoring

`ecsupport-health.sh` (installed at `/opt/ec-support/bin/`, run by the timer)
checks, in order: mongod → API directly on :8006 (restart + re-probe) → the
mail sink only if enabled → nginx *and* a probe through it (catches a broken
proxy config while nginx looks "active") → any case in the last 24 h whose
`email_dispatch` recorded `failed` (a dead relay is otherwise invisible —
case creation still returns 201 by design) → disk ≥ 90 % on
`/var/lib/ec-support`.

```bash
journalctl -u ecsupport-health --since "1 hour ago"   # probe history
sudo systemctl start ecsupport-health                  # probe right now
systemctl list-units --failed                          # failed probes land here
```

## Configuration

| File | Holds |
|---|---|
| `/opt/ec-support/backend/.env` | Mongo URI, `AUTH_VALIDATE_URL`, SMTP host/creds, `SUPPORT_INBOX`, `SUPPORT_MAIL_FROM`, `PORTAL_BASE_URL` (used in email links), attachment dir. **Contains the mailbox password** — `0640 root:ecsupport`. Read by systemd: no trailing `#` comments on value lines. |
| `frontend/.env` (repo) | `VITE_SITE_BACKEND_URL=/api/v1` (relative — works on every origin), `VITE_SITE_FRONTEND_URL` (absolute; the SSO/required-action callback — must match the origin users log in from) |
| `/etc/nginx/sites-available/ec-support{,-ssl}` | Port 80 redirect / 443 vhost |
| `/etc/ssl/ec/support-portal.{crt,key}` | Origin cert (self-signed, SANs: domain + IP). Replace with a Cloudflare Origin CA pair for "Full (strict)" |
| `frontend/src/features/support/supportMeta.js` | Hotline, severity matrix, response targets, plan matrix, KB URLs — the single place to edit portal-facing facts |

Edit the repo copies under `/home/ec/ec-support-portal`, then redeploy —
`setup.sh`/`redeploy-backend.sh` overwrite `/opt` from the repo.

## Deploy scripts (`deploy/`)

```bash
sudo bash deploy/redeploy-backend.sh    # backend code or backend/.env changed
sudo bash deploy/redeploy-frontend.sh   # frontend changed (rebuild + publish; hard-refresh browser after)
sudo bash deploy/setup.sh               # full idempotent provision — safe to re-run any time
sudo bash deploy/enable-https.sh        # (re)install cert + 443 vhost; --self-signed generates a pair
python3 deploy/test-smtp.py             # verify the mail relay (reads backend/.env; --send addr to test-send)
```

## Troubleshooting

| Symptom | Check |
|---|---|
| Domain down, IP fine | Cloudflare Tunnel connector (runs on the Windows machine 192.168.1.23) is off. Long-term fix: also install `cloudflared` on this VM — one tunnel supports multiple connectors. |
| 525 on the domain | Cloudflare isn't reaching the tunnel — DNS record for the hostname must be a CNAME to `<tunnel>.cfargotunnel.com`, and the tunnel must show HEALTHY. |
| Case created but no email | `journalctl -u ecsupport \| grep -iE "smtp\|mail"` and the case's `email_dispatch` field; `python3 deploy/test-smtp.py`. Ack "sent" but not seen → check Outlook Other tab/Junk, then Exchange message trace. |
| Login bounces to the wrong site | `VITE_SITE_FRONTEND_URL` doesn't match the origin, or the auth backend's redirect-origin allowlist is missing this portal's URL. |
| Browser shows stale UI after deploy | Hard refresh (`Ctrl+Shift+R`) — `index.html` is no-store but an open tab keeps its bundle. |
| Attachment upload refused | Extension not on the allowlist, >10 MB/file, >20 MB total, or >5 files. |
| Everything down | `ecsupport-status`, then `systemctl list-units --failed`; the health timer usually restarts things within 2 min. |

## Known gaps / next steps

- **Status-change emails from the agent side** — an agent changing a case in
  Mongo today notifies nobody; highest-leverage next feature.
- **Inbound email parsing** — client replies to the plus-addressed
  `support+EC-…@` land in the support mailbox but aren't ingested into the
  case thread (threading + addressing are already in place for it).
- **Comment attachments** — clients can attach files only at case creation.
- **`org_id` is always null** — the auth service doesn't emit one, so
  "colleagues see each other's cases" is inert (fails closed to
  requester-only; not a leak).
- **Tunnel resilience** — install `cloudflared` on this VM.
- **Credential hygiene** — the `sam@` mailbox password was shared in chat
  during setup; rotate it, and prefer a service identity for sending.
- **Cert** — replace the self-signed origin pair with Cloudflare Origin CA
  and switch the zone to Full (strict).
- Disk is 12 GB total — attachments only grow; watch `ecsupport-status`.

See `INTEGRATION.md` for the original deployment guide and email-flow detail.
