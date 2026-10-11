---
title: "Timestamping for Code Signing"
category: "Products"
section: "CodeSign Secure"
article_type: "Concept"
applies_to: "CodeSign Secure v3.2.1  and later with SignTool, jarsigner, JSign, NuGet, Mage, codesign, and other RFC 3161 capable signing tools"
summary: "RFC 3161 timestamping with CodeSign Secure: why signatures outlive the certificate, which TSA to use, options for each tool, and checks."
keywords: ["code signing timestamp", "RFC 3161", "time stamping authority", "signtool tr td", "jarsigner tsa", "timestamp.digicert.com"]
last_reviewed: "2026-10-08"
---

# Timestamping for Code Signing

This article explains what a code signing timestamp is, why every release signature needs one, and how to add and check timestamps when you sign with CodeSign Secure. It is for release engineers, administrators, and anyone troubleshooting "signature expired" problems.

## What it is

A timestamp is a signed statement from a trusted Time Stamping Authority (TSA) saying that a given signature existed at a given time. The format is defined in RFC 3161, "Internet X.509 Public Key Infrastructure Time-Stamp Protocol (TSP)". The signing tool sends a hash of the signature to the TSA, and the TSA returns a timestamp token that is embedded in the signed file.

## Why it matters

- **Certificates expire.** Since March 1, 2026, CA/Browser Forum (CA/B Forum) Ballot CSC-31 limits new publicly trusted code signing certificates to a maximum validity of 460 days. Software is often used for years after that.
- **Without a timestamp,** a signature is trusted only while the signing certificate is valid. After that, users see warnings, and installers or drivers may fail to load.
- **With a timestamp,** verifiers check that the certificate was valid at the time recorded in the token, so the signature stays valid after the certificate expires, as long as the certificate wasn't revoked with a revocation date before the timestamp.
- **Incident response.** If a key is compromised, the CA sets a revocation date. Files timestamped before that date can remain trusted, while files signed after it are rejected.

## How it works with CodeSign Secure

1. The signing tool sends the file hash to CodeSign Secure through the client (KSP, PKCS#11 Wrapper, or EC KSP for Mac).
2. CodeSign Secure checks access and policy, and the Hardware Security Module (HSM) signs the hash.
3. The signing tool on the **build machine** sends a hash of the signature to the public TSA you named in the command.
4. The TSA adds the current time, signs the response with its own TSA certificate, and returns the token.
5. The tool embeds the token in the signed file.

> **Important:** CodeSign Secure uses public TSAs, and the build machine contacts the TSA **directly**, not through the CodeSign Secure server. Build machines therefore need their own outbound access to the TSA. The timestamp request contains only a hash; the file is never sent to the TSA.

## Which TSA to use

Use the TSA of the Certificate Authority (CA) that issued your certificate where possible. Well-known public TSAs include:

| Provider | URL |
|---|---|
| DigiCert | `http://timestamp.digicert.com` |
| Sectigo | `http://timestamp.sectigo.com` |

Keep a second TSA URL in your build scripts and retry with it if the first fails, so a TSA outage doesn't stop a release.

## Timestamp options by tool

| Tool | Option | Notes |
|---|---|---|
| SignTool | `/tr <URL> /td SHA256` | RFC 3161. Use the same digest as `/fd`. Avoid the legacy `/t` option. |
| jarsigner | `-tsa <URL>` | |
| JSign | `--tsaurl <URL> --tsmode RFC3161` | |
| NuGet | `-Timestamper <URL>` | |
| Mage | `-TimeStampUri <URL>` (or `-ti`) | Optional in Mage, but needed for the signature to outlive the certificate |
| codesign (macOS) | `--timestamp` | Uses Apple's timestamp service |
| apksigner | Not available | APK signatures don't include timestamps |
| GnuPG | Not available | The signature records its creation time, but no TSA is used |

SignTool example:

```cmd
signtool sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f <certificate>.pem /tr http://timestamp.digicert.com /td SHA256 setup.exe
```

Add a timestamp to an already signed Authenticode file, while the signing certificate is still valid:

```cmd
signtool timestamp /tr http://timestamp.digicert.com /td SHA256 <file>
```

## Network requirements

- Build machines need outbound access to the TSA URL, usually HTTP on TCP 80. HTTP is normal for TSAs because the response is itself signed.
- SignTool uses the Windows (WinHTTP) proxy settings. Set a machine-wide proxy with `netsh winhttp set proxy <proxy-host>:<proxy-port>`.
- Java tools don't use the system proxy by default. Pass it to the JVM, for example `jarsigner -J-Dhttp.proxyHost=proxy.example.com -J-Dhttp.proxyPort=8080 ...`.

## Check that a file is timestamped

| Tool | Command | Look for |
|---|---|---|
| SignTool | `signtool verify /pa /v <file>` | "The signature is timestamped:" followed by the date |
| jarsigner | `jarsigner -verify -verbose <file.jar>` | "Timestamped by" |
| PowerShell | `Get-AuthenticodeSignature <file> \| Format-List` | A `TimeStamperCertificate` value |

## Enforce timestamping

CodeSign Secure signs the hash; the signing tool adds the timestamp. Enforce timestamping in your build scripts:

- Include the timestamp option in every release signing command.
- Add a verification step that fails the build if a release file isn't timestamped, for example `signtool verify /pa /tw <file>`. The `/tw` option warns when a signature has no timestamp.

## Key terms

| Term | Meaning |
|---|---|
| Time Stamping Authority (TSA) | A trusted service that issues signed timestamp tokens |
| RFC 3161 | The Internet standard for the Time-Stamp Protocol |
| Timestamp token | The signed TSA response embedded in the signed file |
| `/tr` and `/td` | SignTool options for the RFC 3161 TSA URL and its digest algorithm |
| Revocation date | The date from which a revoked certificate is considered untrusted |

## Common questions

**Can a timestamp be added later?**
Yes, for Authenticode files, with `signtool timestamp`, as long as the signing certificate is still valid. Add it at signing time to avoid gaps.

**Does the timestamp last forever?**
The token is itself signed by a TSA certificate, which also expires. Verifier behavior after the TSA certificate expires varies by platform. Check the vendor documentation for your target platform.

**Why does signing fail only at the timestamp step?**
The build machine can't reach the TSA, usually because of a proxy or firewall. The connection to CodeSign Secure is already working. See [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md).

**Does CodeSign Secure provide its own TSA?**
No. Use a public RFC 3161 TSA, ideally the one run by your certificate's issuing CA.

## Related articles

- [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md)
- [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md)
- [Signing Java JAR files with jarsigner](signing-java-jar-files-with-jarsigner.md)
- [Code signing fundamentals](../../02-General/Code-Signing/code-signing-fundamentals.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
