#!/usr/bin/env python3
"""
Verify the mail relay configured in backend/.env, and explain any refusal.

  python3 deploy/test-smtp.py                 # connect + authenticate only
  python3 deploy/test-smtp.py --send you@x    # also send one test message

Reads the credentials from backend/.env so they never reach the shell
history. Stdlib only -- runs before the venv exists.
"""

import argparse
import re
import smtplib
import socket
import ssl
import sys
from email.message import EmailMessage
from pathlib import Path

ENV = Path(__file__).resolve().parent.parent / "backend" / ".env"

# Exchange Online returns a small set of enhanced status codes here, and each
# one has a completely different fix. Guessing between them wastes hours.
HINTS = (
    ("5.7.139", "basic auth",
     "Basic authentication for SMTP AUTH (client submission) is disabled on "
     "this tenant or mailbox. Microsoft permanently disabled it in Exchange "
     "Online, so a username/password will never work here. Use OAuth2 "
     "(XOAUTH2 with an Entra app), Microsoft Graph sendMail, Direct Send, or "
     "a transactional relay such as SES/Postmark/SendGrid."),
    ("5.7.139", "conditional access",
     "Blocked by a Conditional Access policy or MFA on the account. A "
     "password alone cannot satisfy it."),
    ("5.7.57", None,
     "The server wanted an authenticated session but got an anonymous one -- "
     "STARTTLS or AUTH did not actually happen. Check SUPPORT_SMTP_STARTTLS=true."),
    ("5.7.3", None,
     "SMTP AUTH is disabled for this specific mailbox. It can be re-enabled "
     "per-mailbox in Exchange admin, but only if tenant-wide basic auth is "
     "still permitted."),
    ("5.7.60", None,
     "SendAsDenied: the From address is not the authenticated mailbox and no "
     "'Send As' permission is granted. Set SUPPORT_MAIL_FROM to the "
     "authenticated mailbox, or grant Send As on the From mailbox."),
    ("5.2.252", None,
     "SendAsDenied (same cause as 5.7.60)."),
)


def load_env(path):
    if not path.exists():
        sys.exit(f"not found: {path}")
    cfg = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        cfg[k.strip()] = v
    return cfg


def explain(text):
    low = text.lower()
    for code, needle, hint in HINTS:
        if code in text and (needle is None or needle in low):
            return hint
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--send", metavar="RECIPIENT",
                    help="also send one test message to this address")
    args = ap.parse_args()

    cfg = load_env(ENV)
    host = cfg.get("SUPPORT_SMTP_HOST", "")
    port = int(cfg.get("SUPPORT_SMTP_PORT") or 25)
    user = cfg.get("SUPPORT_SMTP_USERNAME") or ""
    pw = cfg.get("SUPPORT_SMTP_PASSWORD") or ""
    starttls = (cfg.get("SUPPORT_SMTP_STARTTLS") or "").lower() in {"1", "true", "yes", "on"}
    use_ssl = (cfg.get("SUPPORT_SMTP_SSL") or "").lower() in {"1", "true", "yes", "on"}
    sender = cfg.get("SUPPORT_MAIL_FROM") or user
    inbox = cfg.get("SUPPORT_INBOX", "")

    if not host:
        sys.exit("SUPPORT_SMTP_HOST is empty in backend/.env")

    print(f"host       {host}:{port}")
    print(f"username   {user or '(anonymous)'}")
    print(f"password   {'set, ' + str(len(pw)) + ' chars' if pw else '(none)'}")
    print(f"starttls   {starttls}   ssl {use_ssl}")
    print(f"From       {sender}")
    print(f"support    {inbox}")
    print()

    print(f"[1] TCP connect to {host}:{port}")
    try:
        with socket.create_connection((host, port), timeout=15) as s:
            print(f"    ok, local address {s.getsockname()[0]}")
    except Exception as e:
        print(f"    FAILED: {type(e).__name__}: {e}")
        print("    Egress on this port is likely blocked, or DNS is wrong.")
        return 1

    try:
        cls = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
        with cls(host, port, timeout=30) as smtp:
            print("[2] EHLO")
            smtp.ehlo()
            if starttls and not use_ssl:
                print("[3] STARTTLS")
                smtp.starttls(context=ssl.create_default_context())
                smtp.ehlo()
                print("    ok")
            mechs = smtp.esmtp_features.get("auth", "(none advertised)")
            print(f"[4] AUTH mechanisms offered: {mechs}")
            if user:
                print(f"[5] AUTH LOGIN as {user}")
                smtp.login(user, pw)
                print("    AUTH SUCCEEDED")
            else:
                print("[5] skipped (anonymous relay)")

            if args.send:
                print(f"[6] sending one test message to {args.send}")
                msg = EmailMessage()
                msg["From"] = sender
                msg["To"] = args.send
                msg["Subject"] = "EC Support Portal relay test"
                msg.set_content(
                    "This is a relay test from the EC Support Portal deployment.\n"
                    "If you are reading it, outbound mail works.\n"
                )
                smtp.send_message(msg)
                print("    SENT (check the mailbox, including Junk)")
    except smtplib.SMTPAuthenticationError as e:
        text = f"{e.smtp_code} {e.smtp_error.decode(errors='replace')}"
        print(f"    AUTH REFUSED: {text}")
        hint = explain(text)
        if hint:
            print(f"\n    -> {hint}")
        return 1
    except smtplib.SMTPSenderRefused as e:
        text = f"{e.smtp_code} {e.smtp_error.decode(errors='replace')}"
        print(f"    SENDER REFUSED: {text}")
        hint = explain(text)
        if hint:
            print(f"\n    -> {hint}")
        return 1
    except smtplib.SMTPException as e:
        print(f"    SMTP ERROR: {type(e).__name__}: {e}")
        hint = explain(str(e))
        if hint:
            print(f"\n    -> {hint}")
        return 1
    except Exception as e:
        print(f"    ERROR: {type(e).__name__}: {e}")
        return 1

    print("\nRelay is usable with the settings in backend/.env.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
