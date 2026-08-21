#!/usr/bin/env bash
# One-shot human-readable status of the whole portal stack.
# Installed as /usr/local/bin/ecsupport-status -- run it any time.
set -uo pipefail

bold=$(tput bold 2>/dev/null || true); rst=$(tput sgr0 2>/dev/null || true)

echo "${bold}EC Support Portal — stack status${rst}"
printf '%s\n' "-------------------------------------------------------------"
for u in mongod ecsupport-maildump ecsupport nginx; do
    state=$(systemctl is-active "$u" 2>/dev/null)
    since=$(systemctl show -p ActiveEnterTimestamp --value "$u" 2>/dev/null)
    printf '  %-22s %-10s %s\n' "$u" "$state" "${since:-}"
done
printf '%s\n' "-------------------------------------------------------------"

printf '  %-22s ' "API (direct :8006)"
curl -fsS --max-time 5 http://127.0.0.1:8006/api/v1/healthz 2>/dev/null || echo -n "NO ANSWER"; echo
printf '  %-22s ' "API (via nginx :80)"
curl -fsS --max-time 5 http://127.0.0.1/api/v1/healthz 2>/dev/null || echo -n "NO ANSWER"; echo
printf '  %-22s ' "SPA index"
curl -fsS -o /dev/null -w "HTTP %{http_code}" --max-time 5 http://127.0.0.1/ 2>/dev/null || echo -n "NO ANSWER"; echo
printf '  %-22s ' "auth backend"
curl -fsS -o /dev/null -w "HTTP %{http_code} (401 expected)" --max-time 10 \
    http://127.0.0.1/api/v1/auth/validate 2>/dev/null || echo -n "unreachable"; echo

printf '%s\n' "-------------------------------------------------------------"
cases=$(mongosh --quiet --eval 'db.support_cases.countDocuments({})' \
        "mongodb://127.0.0.1:27017/ec_support" 2>/dev/null | tr -dc '0-9')
echo "  cases in Mongo:      ${cases:-unavailable}"
echo "  attachments:         $(du -sh /var/lib/ec-support/attachments 2>/dev/null | cut -f1 || echo n/a)"
echo "  mail dumped:         $(ls -1 /var/lib/ec-support/maildump/*.eml 2>/dev/null | wc -l) .eml files"
echo "  disk (/var/lib):     $(df -h --output=pcent,avail /var/lib/ec-support 2>/dev/null | tail -1)"
echo
echo "  last health probe:"
journalctl -u ecsupport-health -n 3 --no-pager -o cat 2>/dev/null | sed 's/^/    /'
echo
echo "  next probe:  $(systemctl show -p NextElapseUSecRealtime --value ecsupport-health.timer 2>/dev/null)"
