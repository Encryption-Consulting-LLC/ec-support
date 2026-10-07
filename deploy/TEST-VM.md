# Test VM runbook

The test VM is a copy of the live portal for checking every release before
it reaches customers. It runs the same scripts as live, with three
differences: its own database, a mail catcher instead of the real mailbox,
and its own hostname behind Cloudflare Access.

The same steps work for a second (dev) VM. Use a different hostname and IP.

## What you need from other people

| Who | What |
|---|---|
| Whoever runs VMware | Ubuntu 22.04 VM, 2 vCPU, 4–8 GB RAM, 40 GB disk, on the same LAN as live (192.168.1.x). A fixed IP. A sudo user named `ec`. |
| Cloudflare admin | A hostname, e.g. `support-test.encryptionconsulting.com`, on the existing tunnel, pointing at `https://<test VM IP>` (no TLS verify, like live). A Cloudflare Access policy on it: EC staff only. |
| Auth-service (Keycloak) owner | Allow `https://<test hostname>` as a post-login redirect. Optional: a username/password test user with no admin role and no pending required actions. |

Cloudflare Access also keeps search engines out, so the test site needs no
`noindex` setup.

## 1. Get the code onto the VM

Log in as `ec`. The repo is private, so the VM needs read access first: create
an SSH key on the VM (`ssh-keygen -t ed25519`) and add its public half to the
GitHub repo as a read-only deploy key (Settings, Deploy keys).

The scripts expect the repo at exactly this path.

```bash
git clone git@github.com:Encryption-Consulting-LLC/ec-support.git /home/ec/ec-support-portal
```

```bash
cd /home/ec/ec-support-portal && git checkout <branch-or-tag-to-test>
```

Always use `git clone` / `git pull`. Do not copy the folder from a Windows
machine: Windows line endings break the shell scripts.

## 2. Write the test VM's config files

These files are not in git. Never copy the live `backend/.env` here.

`backend/.env` (start from `backend/.env.example`):

```ini
MONGO_URI=mongodb://localhost:27017/ec_support
AUTH_VALIDATE_URL=https://resourcehubapi.encryptionconsulting.com/api/v1/auth/validate

# Mail catcher: setup.sh turns it on because the host is loopback.
# Every email lands as an .eml file in /var/lib/ec-support/maildump.
SUPPORT_SMTP_HOST=127.0.0.1
SUPPORT_SMTP_PORT=2525
SUPPORT_SMTP_USERNAME=
SUPPORT_SMTP_PASSWORD=
SUPPORT_SMTP_STARTTLS=false
SUPPORT_SMTP_SSL=false
SUPPORT_INBOX=support@encryptionconsulting.com
SUPPORT_MAIL_FROM=EC Support TEST <support@encryptionconsulting.com>
SUPPORT_MAIL_DOMAIN=encryptionconsulting.com

PORTAL_BASE_URL=https://support-test.encryptionconsulting.com
SUPPORT_ATTACHMENT_DIR=/var/lib/ec-support/attachments
```

`frontend/.env`:

```ini
VITE_SITE_BACKEND_URL=/api/v1
VITE_SITE_FRONTEND_URL=https://support-test.encryptionconsulting.com
```

## 3. Provision

```bash
sudo bash /home/ec/ec-support-portal/deploy/setup.sh
```

It installs MongoDB, Node and nginx, builds the frontend, starts the API, and
enables the mail catcher. It is safe to re-run.

## 4. HTTPS

Self-signed origin certificate, the same as live. Replace the hostname and IP:

```bash
sudo DOMAIN=support-test.encryptionconsulting.com HOST_IP=<test VM IP> bash /home/ec/ec-support-portal/deploy/enable-https.sh --self-signed
```

## 5. Check it works

```bash
curl -sk https://127.0.0.1/api/v1/healthz
```

Expect `{"ok":true}`. Then open the test hostname, pass Cloudflare Access, and
sign in. Open one case and confirm an `.eml` file appears:

```bash
ls -lt /var/lib/ec-support/maildump | head
```

## Deploying a new version to test

```bash
cd /home/ec/ec-support-portal && git fetch && git checkout <branch-or-tag> && git pull
```

```bash
sudo bash deploy/redeploy-frontend.sh
```

```bash
sudo bash deploy/redeploy-backend.sh
```

Run only the script for the part that changed. Knowledge-base content is part
of the frontend build.

## Release routine

1. Merge the change to `main` (PR with passing checks and one review).
2. Deploy `main` to the test VM.
3. Run the checklist below on the test VM.
4. Tag the release: `git tag v1.2.0 && git push origin v1.2.0`.
5. Deploy that tag to live with the same redeploy scripts.
6. If live breaks, deploy the previous tag the same way.

## Test checklist

Signed out:

- [ ] `/kb` loads; search suggestions appear while typing; Enter opens results.
- [ ] Search filters (type, section) and paging work; Back restores filters.
- [ ] An article shows breadcrumb, table of contents, code blocks and images.
- [ ] No "Session expired" dialog on KB pages.
- [ ] Top bar shows Knowledge base, theme toggle, Sign in. Dark mode readable.
- [ ] `/support` redirects to `/login`.

Signed in (Azure and username/password):

- [ ] Login lands on Cases. Top bar shows Cases, Open a case, How support works, Knowledge base.
- [ ] Open a case with an attachment and a CC. Case number appears; two `.eml` files appear in the mail catcher.
- [ ] Case detail: add an update, download the attachment, mark resolved, reopen.
- [ ] "Documentation and knowledge base" buttons and "Looking for documentation instead?" open the right KB product page in a new tab.
- [ ] Sign out returns to login.

Phone width (about 390 px): top bar wraps, tables scroll, nothing overflows.
