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
sudo ls -lt /var/lib/ec-support/maildump | head
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

Run it in a private window (no cached login), then again signed in. Do
every step in light and dark mode at least once, on Chrome and Edge, and
on a phone. Hard refresh (Ctrl+Shift+R) after each deploy.

### 1. Knowledge base, signed out

- [ ] `/` opens the KB home, not the login page.
- [ ] Home: dark hero, "How can we help?" (signed in: "What are you working on?"), one search pill, common searches, "Browse by product" list with six products and article counts, "Beyond products" links, "Still stuck?" band at the bottom.
- [ ] Typing two letters in the home search shows up to 3 suggestions and "Not finding it? Sign in to open a case". Clicking away closes the list.
- [ ] Enter opens `/kb/search?q=...`: "N answers for ...", type pills with counts, results grouped by section, "N more in X" link.
- [ ] Type pills filter; "N more in X" shows the whole section; "Search everything" clears it; Back restores the previous filters.
- [ ] A search with no results ("zzzz") shows the "No articles match" message.
- [ ] Every product row and "Beyond products" link opens its section page; every section lists its articles.
- [ ] An article shows: breadcrumb, title, summary, type pill, review date; "In this section" menu (current article black); "On this page" with the blue dot following the scroll; code blocks; tables; images; "Still stuck?" band.
- [ ] The top nav search appears on article and section pages only (not on the KB home or search page) and works the same way.
- [ ] Links inside articles: links to other articles open in the portal; external links open in a new tab.
- [ ] Tab title changes per article (browser tab shows the article title).
- [ ] An unknown URL (`/kb/nope`) shows "Article not found".
- [ ] No "Session expired" dialog anywhere in the KB.
- [ ] Top bar: logo, Knowledge base, theme toggle, Sign in. No Cases links.
- [ ] `/support`, `/support/new`, `/support/guide` all redirect to `/login`.
- [ ] "Open a case" in the "Still stuck?" band goes to login when signed out, and to the Open a case form when signed in.

### 2. Login and session

- [ ] Azure SSO login (EC account) lands on Cases.
- [ ] Username and password login lands on Cases.
- [ ] Wrong password shows an error and the button stops spinning.
- [ ] MFA (TOTP or WebAuthn) for an account that has it.
- [ ] Account icon (top right) opens the menu; Sign out returns to login and `/support` is blocked again.
- [ ] Leave a session idle past expiry: the "Session expired" dialog appears on a case page.

### 3. Cases, signed in (must behave exactly as before the redesign)

Compare each step side by side with the live portal.

- [ ] Top bar: Cases, Open a case, How support works, Knowledge base, theme toggle, account icon.
- [ ] Cases list loads; search box filters; sort columns; table scrolls sideways on a phone.
- [ ] Open a case: every inquiry type and product appears in the dropdowns; required-field errors show; Sev 1 note shows.
- [ ] Submit with a CC and 2 attachments. Case number appears; the case shows in the list; two `.eml` files appear in `/var/lib/ec-support/maildump` (acknowledgement and support copy).
- [ ] Attachment limits: a 6th file, an 11 MB file, more than 20 MB total are each refused with a message.
- [ ] Case detail: details, description, attachments download and open, add an update (another `.eml`), refresh button.
- [ ] Mark as resolved, then Reopen case: status changes, a system line appears in Activity, emails are sent.
- [ ] Admin account: sees other people's cases and internal comments the same way as live.
- [ ] How support works page: contact cards (email shows info@encryptionconsulting.com), steps, severity table, plans table all display.
- [ ] "Documentation and knowledge base" buttons open the right KB product page in a new tab.

### 4. Look and layout

- [ ] Phone width (about 390 px): top bar wraps into two rows inside the pill, nothing scrolls sideways, buttons readable.
- [ ] Tablet width (about 800 px): article side menu hides, "On this page" hides below about 990 px.
- [ ] Dark and light mode on every page: text readable, no white boxes on dark pages, code blocks black.
- [ ] Browser console (F12) shows no red errors on any page.

### 5. Before go-live (not testable on the VM, but blocking)

- [ ] `npm run test` passes: restore or remove the 15 missing images in `04-Featured-Articles/PKI-Runbooks/emergency-crl-signing.md`.
- [ ] No `{{TBD}}` left in published articles (search the knowledge-base folder for `{{TBD`).
- [ ] Live `backend/.env` and `frontend/.env` hold live values (real SMTP, live portal URL), not the test VM ones.
- [ ] Keycloak: Microsoft provider locked to EC's tenant; first-login "user already exists" flow set to re-authenticate.
- [ ] Auth service: `callback_url` checked against an allow-list.
- [ ] Mailbox password rotated and `.env` files no longer tracked in git.
