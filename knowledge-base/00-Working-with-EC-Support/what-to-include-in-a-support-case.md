---
title: "What to Include in a Support Case"
category: "Working with EC Support"
section: "Support Cases"
article_type: "How-to"
applies_to: "All Encryption Consulting products and services"
summary: "A checklist of details, logs, and screenshots to include in an EC support case so engineers can start fast, plus what never to send, such as private keys."
keywords: ["support case checklist", "case details", "logs for support", "faster resolution", "redact secrets"]
last_reviewed: "2026-10-06"
---

# What to Include in a Support Case

A complete case is the fastest way to a fix. This article lists the details Encryption Consulting (EC) engineers need, what to attach for each product area, and what must never be sent. It is for anyone opening a case.

## Overview

Most delays in support come from missing basics: the version number, the exact error, or the time the problem started. Collect the items below before opening the case, or add them right after.

## Applies to

All EC products, managed services, and PKI or HSM managed support.

## Prerequisites

- Access to the affected systems, or to someone who can collect logs from them.
- A way to remove secrets from files before sending.

## Before starting

> **Warning:** Never send private keys, PFX or PKCS#12 files with private keys, HSM PINs, partition passwords, passphrases, smartcard (nShield card) credentials, Luna PIN Entry Device (PED) keys or PED PINs, API keys, or service account passwords. EC will never ask for these. If one is sent by mistake, tell EC at once so the file can be deleted, and rotate the secret.

## Procedure

### Step 1: Describe the problem

Include these points in the case description:

1. **What is happening.** Copy the exact error text. Screenshots help, but text can be searched.
2. **What should happen.** The expected result.
3. **When it started.** Date, time, and time zone.
4. **What changed.** Recent upgrades, patches, certificate renewals, firewall changes, HSM firmware updates, or policy changes.
5. **Scope.** One server, one site, or all users. Production or test.
6. **Business impact.** For example, "Users cannot connect to VPN" or "Release build blocked".
7. **Steps to reproduce.** Numbered steps, if the problem can be repeated.
8. **What has been tried.** Restarts, rollbacks, and their results.

### Step 2: Add environment details

| Item | Example |
|---|---|
| EC product and version | CertSecure Manager, with the exact version shown in the console |
| Deployment type | SaaS, on-premises, or EC-managed |
| Operating system | Windows Server 2022, Red Hat Enterprise Linux 9 |
| Database | SQL Server 2019, PostgreSQL 15 |
| CA type | Microsoft AD CS, DigiCert, Let's Encrypt, AWS Private CA |
| HSM model and firmware | Entrust nShield 5c, Thales Luna Network HSM 7 |
| Client software version | nShield Security World software, Luna Client |
| Integration targets | F5 BIG-IP, IIS, GitHub Actions, ServiceNow |

### Step 3: Attach logs and diagnostics

Pick the right guide:

- EC product logs: [Collecting diagnostic logs for EC products](collecting-diagnostic-logs-for-ec-products.md).
- HSM and Microsoft Active Directory Certificate Services (AD CS) outputs: [Collecting HSM and PKI diagnostics for support](collecting-hsm-and-pki-diagnostics-for-support.md).

Tips for useful logs:

- Turn on debug logging only as long as needed, then reproduce the problem once.
- Note the exact time of the reproduction so the engineer can find it in the log.
- Include logs from the full time window, starting a few minutes before the problem.
- Compress large files into a single .zip archive.

### Step 4: Add certificate details, if relevant

For certificate problems, attach the **public** certificate only (.cer, .crt, or .pem). A public certificate is safe to share. Also helpful:

```cmd
certutil -dump <certificate-file.cer>
```

```bash
openssl x509 -in <certificate-file.pem> -noout -text
```

Never attach a .pfx or .p12 file, because these usually contain the private key.

### Step 5: Redact sensitive data

Before upload, search files for and mask:

- Passwords and connection strings.
- API tokens and bearer tokens.
- Personal data that support does not need.
- Internal host names or IP addresses, if policy requires it. Use a consistent replacement (for example "server-A") so the logs stay readable.

Large or sensitive files should go through [Secure file sharing with EC support](secure-file-sharing-with-ec-support.md).

## Verification

A complete case includes: a clear subject, exact error text, version numbers, time of first occurrence, business impact, and at least one relevant log file.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Engineer keeps asking for more information | Missing basics | Use this checklist when opening the next case |
| Log does not show the error | Wrong time window or log level | Raise the log level, reproduce, and note the time |
| Upload rejected | File too large or blocked type | Compress the file or use secure file sharing |

## Related articles

- [How to open a support case](how-to-open-a-support-case.md)
- [Collecting diagnostic logs for EC products](collecting-diagnostic-logs-for-ec-products.md)
- [Collecting HSM and PKI diagnostics for support](collecting-hsm-and-pki-diagnostics-for-support.md)
- [Secure file sharing with EC support](secure-file-sharing-with-ec-support.md)
- [Support severity levels and response targets](support-severity-levels-and-response-targets.md)
