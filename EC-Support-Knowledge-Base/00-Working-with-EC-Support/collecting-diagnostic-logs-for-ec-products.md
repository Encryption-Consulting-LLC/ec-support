---
title: "Collecting Diagnostic Logs for EC Products"
category: "Working with EC Support"
section: "Diagnostics"
article_type: "How-to"
applies_to: "CertSecure Manager, CodeSign Secure, CBOM Secure, SSH Secure (on-premises and SaaS)"
summary: "How to collect application logs, agent logs, and system details from EC products such as CertSecure Manager and CodeSign Secure, and send them to EC safely."
keywords: ["EC product logs", "CertSecure Manager logs", "CodeSign Secure logs", "debug logging", "support bundle"]
last_reviewed: "2026-10-06"
---

# Collecting Diagnostic Logs for EC Products

This article explains how to collect logs from Encryption Consulting (EC) products for a support case. It covers application server logs, agent logs, web browser details, and basic system information. It is for administrators of on-premises installations and for SaaS customers who run local agents.

## Overview

Each EC product writes logs on the application server and, where used, on agents installed close to the systems being managed or scanned. For SaaS deployments, EC holds the server-side logs, so only agent and browser data are needed from the customer.

| Product | Server logs | Agent or client logs |
|---|---|---|
| CertSecure Manager | {{TBD: CertSecure Manager server log path on Windows and Linux}} | {{TBD: CertSecure Manager agent log path}} |
| CodeSign Secure | {{TBD: CodeSign Secure server log path}} | {{TBD: CodeSign Secure signing client log path}} |
| CBOM Secure | {{TBD: CBOM Secure server log path}} | {{TBD: CBOM Secure scanning agent log path}} |
| SSH Secure | {{TBD: SSH Secure server log path}} | {{TBD: SSH Secure agent log path}} |

> **Note:** If the product includes a built-in support bundle feature, use it first: {{TBD: menu path for generating a support bundle, if available}}.

## Applies to

On-premises and SaaS deployments of CertSecure Manager, CodeSign Secure, CBOM Secure, and SSH Secure. For HSM and Microsoft AD CS outputs, see [Collecting HSM and PKI diagnostics for support](collecting-hsm-and-pki-diagnostics-for-support.md).

## Prerequisites

- Local administrator (Windows) or root or sudo rights (Linux) on the server or agent host.
- Permission to change the product log level: {{TBD: role required to change log level}}.
- An open case number to name the archive.

## Before starting

- Debug logging can grow quickly and may slow busy systems. Turn it on only for the test, then set it back.
- Debug logs may include host names, user names, and request data. Review before sending.
- Never include private keys, keystore files, HSM PINs, passphrases, API keys, or database passwords.

## Procedure

### Phase 1: Raise the log level

1. Sign in to the product console as an administrator.
2. Open {{TBD: menu path to logging settings}} and set the level to **{{TBD: debug level name}}**.
3. If logging is set in a file instead, edit {{TBD: logging configuration file path}} and restart the service: {{TBD: service name}}.

### Phase 2: Reproduce the problem

1. Note the current time and time zone.
2. Repeat the failing action once, such as a renewal job, signing request, or scan.
3. Note the time the error appears.

### Phase 3: Collect the logs

**Windows server or agent (PowerShell, run as administrator):**

```powershell
$case = "<case-number>"
$out  = "C:\Temp\EC-$case"
New-Item -ItemType Directory -Path $out -Force | Out-Null

# Product logs (replace with the path for the product)
Copy-Item -Path "<product-log-folder>\*" -Destination $out -Recurse

# System details
Get-ComputerInfo | Out-File "$out\computerinfo.txt"
Get-Service | Where-Object { $_.DisplayName -like "*<product-name>*" } | Out-File "$out\services.txt"
Get-WinEvent -LogName Application -MaxEvents 2000 | Export-Csv "$out\application-events.csv" -NoTypeInformation
Get-WinEvent -LogName System -MaxEvents 2000 | Export-Csv "$out\system-events.csv" -NoTypeInformation

Compress-Archive -Path "$out\*" -DestinationPath "C:\Temp\EC-$case-logs.zip" -Force
```

**Linux server or agent (bash, run with sudo):**

```bash
CASE="<case-number>"
OUT="/tmp/EC-$CASE"
mkdir -p "$OUT"

# Product logs (replace with the path for the product)
cp -r <product-log-folder>/* "$OUT"/

# System details
uname -a > "$OUT/uname.txt"
cat /etc/os-release > "$OUT/os-release.txt"
systemctl status <service-name> --no-pager > "$OUT/service-status.txt"
journalctl -u <service-name> --since "2 hours ago" --no-pager > "$OUT/journal.txt"
df -h > "$OUT/disk.txt"
free -m > "$OUT/memory.txt"

tar -czf "/tmp/EC-$CASE-logs.tar.gz" -C /tmp "EC-$CASE"
```

### Phase 4: Collect browser details for console issues

For problems in the web console:

1. Open the browser developer tools (F12).
2. On the **Network** tab, turn on **Preserve log**, reproduce the problem, then export the HAR file.
3. On the **Console** tab, copy any red error messages.

> **Warning:** HAR files can contain session cookies and tokens. Sign out of the console after capturing, which ends the session, and mention the HAR file in the case so EC handles it carefully.

### Phase 5: Check connectivity, if the issue involves an integration

```powershell
Test-NetConnection -ComputerName <target-host> -Port <port>
```

```bash
openssl s_client -connect <target-host>:<port> -servername <target-host> </dev/null
```

### Phase 6: Return logging to normal and send

1. Set the log level back to the previous value.
2. Review the archive and remove secrets.
3. Attach it to the case or use [Secure file sharing with EC support](secure-file-sharing-with-ec-support.md).

## Verification

- The archive contains logs covering the reproduction time.
- The log level is back to normal.
- No secrets appear in the files. A quick check:

```bash
grep -rniE "password|passwd|secret|token|BEGIN (RSA |EC |ENCRYPTED )?PRIVATE KEY" /tmp/EC-<case-number>
```

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Log folder is empty | Wrong path or service runs as another account | Check the service configuration for the log path |
| Debug entries do not appear | Service not restarted after a file change | Restart the service and reproduce again |
| Archive too large to upload | Old rotated logs included | Include only logs from the problem window, or use secure file sharing |
| Agent logs missing on SaaS | Agent installed in a non-default folder | Check the agent install folder {{TBD: how to find agent install location}} |

## Related articles

- [What to include in a support case](what-to-include-in-a-support-case.md)
- [Collecting HSM and PKI diagnostics for support](collecting-hsm-and-pki-diagnostics-for-support.md)
- [Secure file sharing with EC support](secure-file-sharing-with-ec-support.md)
- [Troubleshooting CertSecure Manager](../01-Products/CertSecure-Manager/troubleshooting-certsecure-manager.md)
- [Troubleshooting CodeSign Secure](../01-Products/CodeSign-Secure/troubleshooting-codesign-secure.md)
