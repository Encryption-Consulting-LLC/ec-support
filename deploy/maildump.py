#!/usr/bin/env python3
"""
Dev-only SMTP sink for the EC Support Portal.

Accepts anything on 127.0.0.1:2525 and writes each message verbatim to
SUPPORT_MAILDUMP_DIR as a timestamped .eml. That makes the whole
"route the ticket to support@" path verifiable on a box with no real
relay: open a case, then read the exact message that would have gone to
support@encryptionconsulting.com, plus the client acknowledgement.

To go live, point SUPPORT_SMTP_HOST/_PORT in backend/.env at the real
relay and stop this unit. No application code changes.
"""

import os
import re
import threading
from datetime import datetime, timezone
from email import message_from_bytes
from email.header import decode_header, make_header
from pathlib import Path

from aiosmtpd.controller import Controller

DUMP_DIR = Path(os.environ.get("SUPPORT_MAILDUMP_DIR", "/var/lib/ec-support/maildump"))
HOST = os.environ.get("SUPPORT_MAILDUMP_HOST", "127.0.0.1")
PORT = int(os.environ.get("SUPPORT_MAILDUMP_PORT", "2525"))

_UNSAFE = re.compile(r"[^A-Za-z0-9._-]+")


def _slug(value, limit):
    return _UNSAFE.sub("-", (value or "").strip()).strip("-")[:limit] or "none"


def _subject(msg):
    raw = msg.get("Subject", "")
    try:
        return str(make_header(decode_header(raw)))
    except Exception:  # noqa: BLE001 -- malformed headers must not drop mail
        return raw


class DumpHandler:
    async def handle_DATA(self, server, session, envelope):
        DUMP_DIR.mkdir(parents=True, exist_ok=True)
        raw = envelope.original_content
        msg = message_from_bytes(raw)
        subject = _subject(msg)
        rcpts = envelope.rcpt_tos or ["unknown"]
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S_%f")
        name = f"{stamp}__{_slug(rcpts[0], 60)}__{_slug(subject, 70)}.eml"
        (DUMP_DIR / name).write_bytes(raw)
        print(
            f"[maildump] accepted {len(raw)}B  to={','.join(rcpts)}  "
            f"subject={subject!r}  file={name}",
            flush=True,
        )
        return "250 Message accepted for delivery"


def main():
    controller = Controller(DumpHandler(), hostname=HOST, port=PORT)
    controller.start()
    print(f"[maildump] listening on {HOST}:{PORT} -> {DUMP_DIR}", flush=True)
    # Controller.start() runs the asyncio loop on its own thread; park the
    # main thread so systemd sees a long-running process.
    threading.Event().wait()


if __name__ == "__main__":
    main()
