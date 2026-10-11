#!/usr/bin/env bash
#
# Enable HTTPS for support-ec.encryptionconsulting.com on this host.
#
#   sudo bash deploy/enable-https.sh            # uses certs already in place
#   sudo bash deploy/enable-https.sh --certbot  # Let's Encrypt instead
#
# Default mode expects the certificate to already exist at:
#   /etc/ssl/ec/support-portal.crt   (certificate + chain, PEM)
#   /etc/ssl/ec/support-portal.key   (private key, PEM)
#
# Where the cert comes from — pick ONE:
#
#  A) Cloudflare Origin CA (recommended: matches how resourcehub* is
#     fronted, works even though this VM has a private address).
#     Cloudflare dashboard -> SSL/TLS -> Origin Server -> Create
#     Certificate (hostname support-ec.encryptionconsulting.com, 15y).
#     Save the two PEM blocks to the paths above, set the zone's SSL
#     mode to "Full (strict)", and proxy the DNS record (orange cloud).
#
#  B) Let's Encrypt (only if the domain's DNS points straight at a
#     public IP that forwards ports 80+443 to this VM):
#     sudo bash deploy/enable-https.sh --certbot
#
# LAN access at http://<this VM IP> keeps working either way — the dev
# server block still answers requests addressed to the bare IP.

set -euo pipefail

SRC="/home/ec/ec-support-portal"
# Override per host, e.g. on the test VM:
#   sudo DOMAIN=support-test.encryptionconsulting.com HOST_IP=192.168.1.40 bash deploy/enable-https.sh --self-signed
DOMAIN="${DOMAIN:-support-ec.encryptionconsulting.com}"
HOST_IP="${HOST_IP:-192.168.1.17}"
CRT="/etc/ssl/ec/support-portal.crt"
KEY="/etc/ssl/ec/support-portal.key"

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }

if [ "${1:-}" = "--self-signed" ]; then
    # Starter certificate so HTTPS is live before a real cert exists.
    # Browsers will show a warning until either (a) Cloudflare proxies
    # the domain with SSL mode "Full" — visitors then get Cloudflare's
    # trusted edge cert and never see this one — or (b) this file pair
    # is replaced with an Origin CA / Let's Encrypt cert (just re-run
    # this script without flags afterwards).
    # NOTE: Cloudflare "Full (strict)" will NOT accept a self-signed
    # origin — use plain "Full" until a real cert is in place.
    install -d -m 0755 /etc/ssl/ec
    if [ -s "$CRT" ] && [ -s "$KEY" ]; then
        echo "cert files already exist at $CRT — refusing to overwrite."
        echo "delete them first if you really want a fresh self-signed pair."
        exit 1
    fi
    openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1         -keyout "$KEY" -out "$CRT" -days 730 -nodes         -subj "/O=Encryption Consulting LLC/CN=$DOMAIN"         -addext "subjectAltName=DNS:$DOMAIN,IP:$HOST_IP"         -addext "basicConstraints=CA:FALSE" 2>/dev/null
    echo "generated self-signed pair (2y, SAN: $DOMAIN + $HOST_IP)"
    # fall through to the normal install path below
elif [ "${1:-}" = "--certbot" ]; then
    apt-get install -y -qq certbot python3-certbot-nginx
    certbot --nginx -d "$DOMAIN" --redirect
    echo "certbot manages the cert + renewal; done."
    exit 0
fi

if [ ! -s "$CRT" ] || [ ! -s "$KEY" ]; then
    echo "Certificate not found." >&2
    echo "  expected: $CRT and $KEY" >&2
    echo "  create /etc/ssl/ec and place the PEM files there (see header" >&2
    echo "  of this script for the Cloudflare Origin CA walkthrough)," >&2
    echo "  or run with --certbot for Let's Encrypt." >&2
    exit 1
fi

chmod 0644 "$CRT"
chmod 0600 "$KEY"
chown root:root "$CRT" "$KEY"

# Sanity: key must match cert.
crt_pub=$(openssl x509 -in "$CRT" -pubkey -noout 2>/dev/null | sha256sum | cut -d' ' -f1)
key_pub=$(openssl pkey -in "$KEY" -pubout 2>/dev/null | sha256sum | cut -d' ' -f1)
[ "$crt_pub" = "$key_pub" ] || { echo "cert and key do NOT match" >&2; exit 1; }
echo "cert/key pair verified: $(openssl x509 -in "$CRT" -noout -subject -enddate | tr '\n' ' ')"

install -m 0644 "$SRC/deploy/nginx-support-portal-ssl.conf" \
    /etc/nginx/sites-available/ec-support-ssl
ln -sfn /etc/nginx/sites-available/ec-support-ssl /etc/nginx/sites-enabled/ec-support-ssl
nginx -t
systemctl reload nginx

# The mail links + SSO callback now point at the domain; restart the API
# so it re-reads PORTAL_BASE_URL.
rsync -a --exclude '.venv' --exclude '__pycache__' --exclude '.env' \
    "$SRC/backend/" /opt/ec-support/backend/ >/dev/null 2>&1 || true
install -m 0640 -o root -g ecsupport "$SRC/backend/.env" /opt/ec-support/backend/.env
systemctl restart ecsupport

echo
echo "HTTPS enabled. Verify:"
echo "  curl -sk --resolve $DOMAIN:443:127.0.0.1 https://$DOMAIN/api/v1/healthz"
echo
echo "Still needed on YOUR side:"
echo "  1. DNS: point $DOMAIN at this origin (Cloudflare proxied record"
echo "     -> your edge must forward 443 to $HOST_IP, or use a"
echo "     cloudflared tunnel if no inbound port can be opened)."
echo "  2. Auth backend: allow https://$DOMAIN as a post-login redirect"
echo "     origin, or TOTP-setup/WebAuthn/SSO flows will bounce users to"
echo "     the Resource Hub."
