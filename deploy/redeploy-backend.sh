#!/usr/bin/env bash
#
# Fast path for backend-only changes: push Python code to /opt and restart
# the API. No apt, no npm, no SPA rebuild.
#
#   sudo bash /home/ec/ec-support-portal/deploy/redeploy-backend.sh
#
# Use deploy/setup.sh instead when frontend code, nginx config, or a
# systemd unit changed -- this script touches none of those.

set -euo pipefail

SRC="/home/ec/ec-support-portal"
APP_DIR="/opt/ec-support"
SVC_USER="ecsupport"

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }

# --exclude '.venv' keeps --delete from removing the virtualenv, and
# excluding .env stops the repo copy's permissions from overwriting the
# 0640 root:ecsupport one installed below.
rsync -a --delete \
    --exclude '.venv' --exclude '__pycache__' --exclude '.env' \
    "$SRC/backend/" "$APP_DIR/backend/"

install -m 0755 -o "$SVC_USER" -g "$SVC_USER" \
    "$SRC/deploy/maildump.py" "$APP_DIR/bin/maildump.py"
install -m 0755 "$SRC/deploy/ecsupport-health.sh" "$APP_DIR/bin/ecsupport-health.sh"
install -m 0755 "$SRC/deploy/ecsupport-status.sh" /usr/local/bin/ecsupport-status

"$APP_DIR/backend/.venv/bin/pip" install -q -r "$APP_DIR/backend/requirements.txt"

chown -R "$SVC_USER:$SVC_USER" "$APP_DIR/backend"
# .env last: it must stay root-owned so the service user cannot read the
# mailbox password off disk, only systemd can.
install -m 0640 -o root -g "$SVC_USER" "$SRC/backend/.env" "$APP_DIR/backend/.env"

systemctl restart ecsupport

for i in $(seq 1 15); do
    curl -fsS --max-time 3 -o /dev/null http://127.0.0.1:8006/api/v1/healthz && break
    [ "$i" -eq 15 ] && { journalctl -u ecsupport -n 30 --no-pager; exit 1; }
    sleep 1
done
echo "ecsupport restarted and healthy: $(curl -fsS http://127.0.0.1/api/v1/healthz)"
