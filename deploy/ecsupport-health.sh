#!/usr/bin/env bash
#
# Periodic liveness probe for the EC Support Portal, driven by
# ecsupport-health.timer (every 2 minutes). Checks each moving part and
# restarts ONLY the one that is actually down, then re-probes to say
# whether the restart worked.
#
# Read the history with:   journalctl -u ecsupport-health --since "1 hour ago"
# Run it by hand with:     sudo systemctl start ecsupport-health
#
# Exit 0 = everything healthy, 1 = something was wrong (systemd marks the
# unit failed, so `systemctl list-units --failed` surfaces it too).

set -uo pipefail

API_URL="http://127.0.0.1:8006/api/v1/healthz"
EDGE_URL="http://127.0.0.1/api/v1/healthz"
STATE_DIR="/var/lib/ec-support"
rc=0

log() { echo "$*"; }

probe() { curl -fsS --max-time "${2:-5}" -o /dev/null "$1"; }

recycle() {  # recycle <unit> <why>
    log "UNHEALTHY: $2 -- restarting $1"
    systemctl restart "$1" || log "ERROR: restart of $1 failed"
    rc=1
}

# 1. MongoDB first: the API cannot serve anything without it, and it must
#    be up before a restarted API tries to reach it.
if ! systemctl is-active --quiet mongod; then
    recycle mongod "mongod is not active"
    sleep 5
fi

# 2. The API, probed directly on the gunicorn socket so nginx cannot mask
#    a dead backend (or make a live one look dead).
if ! probe "$API_URL"; then
    recycle ecsupport "$API_URL did not answer"
    sleep 6
    if probe "$API_URL" 10; then
        log "RECOVERED: API answering again after restart"
    else
        log "STILL DOWN: API not answering after restart -- see journalctl -u ecsupport"
    fi
fi

# 3. The local mail sink -- only if it is still ENABLED. Once backend/.env
#    points at a real relay the sink gets disabled, and it must not be
#    resurrected every 2 minutes; the is-enabled gate lets one probe serve
#    both the local-sink and real-relay configurations.
if systemctl is-enabled --quiet ecsupport-maildump 2>/dev/null; then
    if ! systemctl is-active --quiet ecsupport-maildump; then
        recycle ecsupport-maildump "local mail sink is enabled but not active"
    fi
fi

# 4. nginx, then a probe THROUGH it, so a config that stopped routing
#    /api/v1/support/ shows up even while nginx itself is "active".
if ! systemctl is-active --quiet nginx; then
    recycle nginx "nginx is not active"
    sleep 3
fi
if ! probe "$EDGE_URL"; then
    log "WARN: edge $EDGE_URL did not answer while the API was reachable directly -- suspect the nginx proxy config"
    rc=1
fi

# 5. Mail dispatch. Case creation returns 201 even when SMTP fails, by
#    design -- which means a dead relay is INVISIBLE from the outside and
#    the portal quietly becomes a black hole. Read the outcome the mailer
#    records on each case instead of guessing.
mail_fail=$(mongosh --quiet "mongodb://127.0.0.1:27017/ec_support" --eval '
  const since = new Date(Date.now() - 24*60*60*1000);
  db.support_cases.countDocuments({
    created_at: { $gte: since },
    $or: [ { "email_dispatch.support": "failed" },
           { "email_dispatch.ack": "failed" } ]
  })' 2>/dev/null | tr -dc '0-9')
if [ -n "${mail_fail:-}" ] && [ "$mail_fail" -gt 0 ]; then
    log "WARN: ${mail_fail} case(s) in the last 24h failed to send mail -- relay problem. Detail: journalctl -u ecsupport | grep -iE 'smtp|mail'"
    rc=1
fi

# 6. Disk. Attachments only ever grow (20 MB per case), and a full volume
#    turns into failed uploads rather than an obvious outage.
use=$(df --output=pcent "$STATE_DIR" 2>/dev/null | tail -1 | tr -dc '0-9')
if [ -n "${use:-}" ] && [ "$use" -ge 90 ]; then
    log "WARN: $STATE_DIR is ${use}% full -- attachment writes will start failing"
    rc=1
fi

if [ "$rc" -eq 0 ]; then
    cases=$(mongosh --quiet --eval 'db.support_cases.countDocuments({})' \
            "mongodb://127.0.0.1:27017/ec_support" 2>/dev/null | tr -dc '0-9')
    log "healthy: mongod + api + nginx up, mail dispatching; cases=${cases:-?}; disk=${use:-?}%"
fi
exit "$rc"
