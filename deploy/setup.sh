#!/usr/bin/env bash
#
# EC Support Portal -- one-shot provision + deploy for this Ubuntu 22.04 host.
#
#   sudo bash /home/ec/ec-support-portal/deploy/setup.sh
#
# Idempotent: safe to re-run after a failure or a code change. Re-running is
# also how you redeploy (it rebuilds the SPA and restarts the API).
#
# What it does, in order:
#   1. apt packages: python3-venv, nginx, curl/gnupg
#   2. MongoDB 8.0 from the official jammy repo, enabled and started
#   3. Node.js 22 (build-time only -- the server never runs Node)
#   4. ecsupport service account + /opt and /var/lib trees
#   5. Python venv + requirements + aiosmtpd (dev mail sink)
#   6. Builds the SPA as the 'ec' user, publishes dist/ to /var/www
#   7. nginx site (LAN HTTP), replacing the distro default
#   8. systemd: ecsupport.service, ecsupport-maildump.service,
#      ecsupport-health.service + .timer
#   9. Verifies the result and prints where to go

set -euo pipefail

SRC="/home/ec/ec-support-portal"
APP_DIR="/opt/ec-support"
STATE_DIR="/var/lib/ec-support"
WEB_DIR="/var/www/ec-support-portal"
BUILD_USER="ec"
SVC_USER="ecsupport"
NODE_MAJOR=22

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
die()  { printf '\n\033[31mFAILED: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run with sudo"
[ -d "$SRC" ] || die "source tree not found at $SRC"
[ -f "$SRC/backend/.env" ] || die "$SRC/backend/.env is missing"
[ -f "$SRC/frontend/.env" ] || die "$SRC/frontend/.env is missing"

# --------------------------------------------------------------------------
step "1/9  Base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
    python3-venv python3-pip nginx curl ca-certificates gnupg rsync
info "python3-venv, nginx, curl, gnupg, rsync installed"

# --------------------------------------------------------------------------
step "2/9  MongoDB 8.0"
if ! command -v mongod >/dev/null 2>&1; then
    # This host is Ubuntu 22.04 -> the repo suite is 'jammy'. Using 'noble'
    # (24.04) here would 404 at apt update time.
    install -d -m 0755 /usr/share/keyrings
    curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
        | gpg --dearmor -o /usr/share/keyrings/mongodb-8.gpg
    chmod 0644 /usr/share/keyrings/mongodb-8.gpg
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-8.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" \
        > /etc/apt/sources.list.d/mongodb-org-8.0.list
    apt-get update -qq
    apt-get install -y -qq mongodb-org
    info "installed $(mongod --version | head -1)"
else
    info "already present: $(mongod --version | head -1)"
fi
systemctl enable --now mongod
# mongod binds 127.0.0.1 by default in the packaged config -- keep it that
# way; nothing outside this host should reach the database.
systemctl is-active --quiet mongod || die "mongod did not start (journalctl -u mongod)"
info "mongod active, listening on $(grep -E '^\s*bindIp' /etc/mongod.conf | awk '{print $2}')"

# --------------------------------------------------------------------------
step "3/9  Node.js ${NODE_MAJOR} (build toolchain only)"
have_node=0
if command -v node >/dev/null 2>&1; then
    cur=$(node -v | sed 's/^v\([0-9]*\).*/\1/')
    [ "$cur" -ge 20 ] && have_node=1 && info "already present: $(node -v)"
fi
if [ "$have_node" -eq 0 ]; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" -o /tmp/nodesource_setup.sh
    bash /tmp/nodesource_setup.sh >/dev/null
    apt-get install -y -qq nodejs
    rm -f /tmp/nodesource_setup.sh
    info "installed node $(node -v), npm $(npm -v)"
fi

# --------------------------------------------------------------------------
step "4/9  Service account and directories"
if ! id -u "$SVC_USER" >/dev/null 2>&1; then
    useradd --system --create-home --home-dir "$APP_DIR" \
            --shell /usr/sbin/nologin "$SVC_USER"
    info "created system user $SVC_USER"
else
    info "user $SVC_USER already exists"
fi
install -d -m 0755 -o "$SVC_USER" -g "$SVC_USER" "$APP_DIR" "$APP_DIR/bin"
install -d -m 0750 -o "$SVC_USER" -g "$SVC_USER" \
    "$STATE_DIR" "$STATE_DIR/attachments" "$STATE_DIR/maildump"
install -d -m 0755 "$WEB_DIR"

# --------------------------------------------------------------------------
step "5/9  Backend into $APP_DIR/backend"
rsync -a --delete \
    --exclude '.venv' --exclude '__pycache__' --exclude '.env' \
    "$SRC/backend/" "$APP_DIR/backend/"
install -m 0755 -o "$SVC_USER" -g "$SVC_USER" "$SRC/deploy/maildump.py" "$APP_DIR/bin/maildump.py"
install -m 0755 "$SRC/deploy/ecsupport-health.sh" "$APP_DIR/bin/ecsupport-health.sh"
install -m 0755 "$SRC/deploy/ecsupport-status.sh" /usr/local/bin/ecsupport-status

# .env holds SMTP credentials in production -> root-owned, group-readable
# by the service account only. systemd reads EnvironmentFile as root
# before dropping privileges, so 0640 is enough.
install -m 0640 -o root -g "$SVC_USER" "$SRC/backend/.env" "$APP_DIR/backend/.env"

if [ ! -x "$APP_DIR/backend/.venv/bin/python" ]; then
    python3 -m venv "$APP_DIR/backend/.venv"
    info "created venv"
fi
"$APP_DIR/backend/.venv/bin/pip" install -q --upgrade pip wheel
"$APP_DIR/backend/.venv/bin/pip" install -q -r "$APP_DIR/backend/requirements.txt"
# aiosmtpd backs the dev mail sink only; it is not imported by the app.
"$APP_DIR/backend/.venv/bin/pip" install -q aiosmtpd
chown -R "$SVC_USER:$SVC_USER" "$APP_DIR/backend"
chown root:"$SVC_USER" "$APP_DIR/backend/.env"
info "python deps installed: $("$APP_DIR/backend/.venv/bin/pip" list 2>/dev/null | grep -ciE 'flask|gunicorn|pymongo|aiosmtpd') core packages"

# --------------------------------------------------------------------------
step "6/9  Build the SPA (as $BUILD_USER) and publish"
# npm runs unprivileged: node_modules and the npm cache stay in /home/ec and
# no build script ever executes as root.
runuser -u "$BUILD_USER" -- env HOME="/home/$BUILD_USER" bash -lc "
    set -e
    cd '$SRC/frontend'
    npm ci --no-audit --no-fund
    npm run build
" || die "SPA build failed"
[ -f "$SRC/frontend/dist/index.html" ] || die "build produced no dist/index.html"
rsync -a --delete "$SRC/frontend/dist/" "$WEB_DIR/dist/"
chown -R root:root "$WEB_DIR"
chmod -R a+rX "$WEB_DIR"
info "published $(find "$WEB_DIR/dist" -type f | wc -l) files to $WEB_DIR/dist"

# --------------------------------------------------------------------------
step "7/9  nginx site"
install -m 0644 "$SRC/deploy/nginx-support-portal-dev.conf" \
    /etc/nginx/sites-available/ec-support
ln -sfn /etc/nginx/sites-available/ec-support /etc/nginx/sites-enabled/ec-support
# The distro default also claims default_server on :80 -- both cannot bind.
rm -f /etc/nginx/sites-enabled/default
nginx -t || die "nginx config test failed"
systemctl enable --now nginx
systemctl reload nginx
info "nginx configured and reloaded"

# --------------------------------------------------------------------------
step "8/9  systemd units"
for unit in ecsupport.service ecsupport-maildump.service \
            ecsupport-health.service ecsupport-health.timer; do
    install -m 0644 "$SRC/deploy/$unit" "/etc/systemd/system/$unit"
done
systemctl daemon-reload
# The local sink is only for hosts with no relay. Enable it iff
# SUPPORT_SMTP_HOST is loopback, otherwise make sure a previously-enabled
# sink is not left running against a now-real relay.
if grep -qE '^SUPPORT_SMTP_HOST=(127\.0\.0\.1|localhost)\s*$' "$SRC/backend/.env"; then
    systemctl enable --now ecsupport-maildump.service
    info "local mail sink ENABLED (SUPPORT_SMTP_HOST is loopback)"
else
    systemctl disable --now ecsupport-maildump.service >/dev/null 2>&1 || true
    info "real relay configured -> local mail sink installed but disabled"
fi
# Starting ecsupport also pulls in mongod + nginx via Wants=.
systemctl enable ecsupport.service
systemctl restart ecsupport.service
systemctl enable --now ecsupport-health.timer
info "units installed and enabled"

# --------------------------------------------------------------------------
step "9/9  Verify"
ok=1
for i in $(seq 1 20); do
    curl -fsS --max-time 3 -o /dev/null http://127.0.0.1:8006/api/v1/healthz && break
    [ "$i" -eq 20 ] && ok=0
    sleep 1
done
[ "$ok" -eq 1 ] || { journalctl -u ecsupport -n 40 --no-pager; die "API never answered on :8006"; }
info "API healthz (direct):  $(curl -fsS http://127.0.0.1:8006/api/v1/healthz)"
info "API healthz (nginx):   $(curl -fsS http://127.0.0.1/api/v1/healthz)"
info "SPA:                   HTTP $(curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1/)"
info "support API unauth'd:  HTTP $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/api/v1/support/cases) (401 expected)"
info "auth backend via edge: HTTP $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/api/v1/auth/validate) (401 expected)"

printf '\n\033[32mDone.\033[0m Portal: http://%s/\n' "$(hostname -I | awk '{print $1}')"
printf 'Status any time:  ecsupport-status\n'
printf 'Logs:             journalctl -u ecsupport -f\n'
printf 'Health history:   journalctl -u ecsupport-health --since "1 hour ago"\n\n'
