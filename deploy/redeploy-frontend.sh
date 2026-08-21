#!/usr/bin/env bash
#
# Fast path for frontend-only changes: rebuild the SPA as the unprivileged
# 'ec' user and publish dist/ to the nginx root. No apt, no backend restart.
#
#   sudo bash /home/ec/ec-support-portal/deploy/redeploy-frontend.sh
#
# Use deploy/setup.sh when backend code, nginx config, or systemd units
# changed too.

set -euo pipefail

SRC="/home/ec/ec-support-portal"
WEB_DIR="/var/www/ec-support-portal"
BUILD_USER="ec"

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }

runuser -u "$BUILD_USER" -- env HOME="/home/$BUILD_USER" bash -lc "
    set -e
    cd '$SRC/frontend'
    npm run build
"
[ -f "$SRC/frontend/dist/index.html" ] || { echo "build produced no dist/index.html" >&2; exit 1; }

rsync -a --delete "$SRC/frontend/dist/" "$WEB_DIR/dist/"
chown -R root:root "$WEB_DIR"
chmod -R a+rX "$WEB_DIR"

bundle=$(grep -oE '/assets/index-[^"]+\.js' "$WEB_DIR/dist/index.html")
echo "published bundle: $bundle"
echo "remind the browser side: hard refresh with Ctrl+Shift+R"
