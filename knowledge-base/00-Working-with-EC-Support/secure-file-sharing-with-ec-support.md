---
title: "Secure File Sharing with EC Support"
category: "Working with EC Support"
section: "Diagnostics"
article_type: "How-to"
applies_to: "All Encryption Consulting products and services"
summary: "How to share logs and large diagnostic files with EC support securely: redaction, encryption, size limits, approved transfer methods, and data retention."
keywords: ["secure file sharing", "upload logs", "redact logs", "encrypt files for support", "data retention"]
last_reviewed: "2026-10-06"
---

# Secure File Sharing with EC Support

Support cases often need logs, configuration exports, and screenshots. This article explains how to share these files with Encryption Consulting (EC) safely, which methods are approved, and how EC protects and deletes the data. It is for anyone sending files to EC support.

## Overview

| Method | Use for | Size limit |
|---|---|---|
| Case attachment on the portal | Most files | Portal upload limit |
| Secure file transfer link | Large files or sensitive data | Large files supported |
| Email attachment | Small, non-sensitive files only | Small files only (per your mail system limits) |

EC is certified to ISO/IEC 27001:2022, SOC 2 Type II, and PCI DSS. Files are handled under those controls.

## Applies to

All cases for EC products, managed services, and PKI or HSM managed support.

## Prerequisites

- An open case number.
- Permission under the organization's data handling policy to share the data with a vendor.
- A tool for creating .zip or .tar.gz archives.

## Before starting

> **Warning:** Never share private keys, .pfx or .p12 files that contain private keys, HSM PINs, partition passwords, passphrases, nShield smartcards or their passphrases, Luna PIN Entry Device (PED) keys or PED PINs, CA or HSM backup files, API keys, or passwords. No support task needs them. EC will never ask for them.

Things that are generally safe to share after review:
- Public certificates (.cer, .crt, .pem without a private key block).
- Certificate Signing Requests (CSRs).
- Certificate Revocation Lists (CRLs).
- Diagnostic outputs such as `enquiry`, `nfdiag.zip`, `hsm show`, and `certutil` reports.

## Procedure

### Phase 1: Prepare the files

1. Gather only the files that relate to the case and the time window.
2. Name the archive with the case number, for example `EC-<case-number>-logs.zip`.
3. Search for secrets and remove them:

```bash
grep -rniE "password|passwd|pwd=|secret|apikey|api_key|token|BEGIN (RSA |EC |ENCRYPTED )?PRIVATE KEY" <folder>
```

```powershell
Get-ChildItem -Path <folder> -Recurse -File |
  Select-String -Pattern 'password','passwd','pwd=','secret','apikey','token','PRIVATE KEY' |
  Select-Object Path, LineNumber, Line
```

4. Replace secrets with a marker such as `[REDACTED]`. Keep the rest of the line so the context stays clear.
5. If policy requires, mask host names, IP addresses, and user names with consistent stand-ins.

### Phase 2: Choose a method

- **Small and non-sensitive:** attach to the case on the portal.
- **Large or sensitive:** reply in the case asking for a secure transfer link. EC sends a secure transfer link that is tied to the case and expires after 7 days.
- **Customer-hosted share:** if policy requires the organization's own file sharing service, share the link in the case and limit access to the assigned EC engineer.

### Phase 3: Encrypt, if required

If the data is sensitive or policy requires encryption, encrypt the archive before upload:

```bash
# 7-Zip with AES-256 and encrypted file names
7z a -tzip -mem=AES256 -p EC-<case-number>-logs.zip <folder>
```

Send the archive password through a different channel from the file, such as a phone call with the engineer. Never put the password in the case.

### Phase 4: Upload and confirm

1. Upload the file.
2. Reply in the case with the file name, what it contains, and the time window it covers.
3. Wait for the engineer to confirm the file opened correctly.

## Data retention and deletion

- EC keeps case files after the case closes for the period set by its data retention policy, then deletes them.
- To ask for earlier deletion, reply in the case or email info@encryptionconsulting.com.
- If a secret was sent by mistake, tell EC right away. EC deletes the file and confirms. Rotate the exposed secret anyway.

## Verification

- The engineer confirms receipt.
- The archive opened and matched the description.
- No secrets were included.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Upload fails part way | File too large or network timeout | Split the archive or ask for a secure transfer link |
| File blocked by mail filter | Archive or file type blocked | Use the portal or secure transfer link |
| Engineer cannot open the archive | Wrong password or unsupported format | Confirm the password by phone, or use standard .zip |
| Transfer link expired | Link time limit passed | Ask for a new link in the case |

## Related articles

- [What to include in a support case](what-to-include-in-a-support-case.md)
- [Collecting diagnostic logs for EC products](collecting-diagnostic-logs-for-ec-products.md)
- [Collecting HSM and PKI diagnostics for support](collecting-hsm-and-pki-diagnostics-for-support.md)
- [How to open a support case](how-to-open-a-support-case.md)
- [PKI security best practices](../02-General/PKI/pki-security-best-practices.md)
