---
title: "Troubleshooting Timestamping Errors"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later with SignTool, jarsigner, JSign, NuGet, Mage, and macOS codesign"
summary: "Fix code signing timestamp errors: TSA unreachable, proxy settings for SignTool and Java, files signed without a timestamp, and formats with no timestamp."
keywords: ["timestamp server could not be reached", "signtool timestamp error", "jarsigner -tsa proxy", "RFC 3161", "file not timestamped", "No -tsa or -tsacert is provided"]
last_reviewed: "2026-10-08"
---

# Troubleshooting Timestamping Errors

This article helps you fix errors in the timestamp step of code signing, and find files that were signed without a timestamp. It is for release engineers and build administrators.

## Applies to

CodeSign Secure v3.2.1  and later, with any signing tool that supports RFC 3161 timestamps.

## Who contacts the timestamp server

This is the most important fact for troubleshooting: **the build machine contacts the Time Stamping Authority (TSA) directly, not the CodeSign Secure server.** CodeSign Secure signs the hash in the HSM and returns the signature. The signing tool on the build machine then sends a separate request to the public TSA you name in the command.

So when only the timestamp step fails, look at the network path **from the build machine to the TSA**. The connection to CodeSign Secure is already working.

| Tool | Timestamp option |
|---|---|
| SignTool | `/tr <URL> /td SHA256` |
| jarsigner | `-tsa <URL>` |
| JSign | `--tsaurl <URL> --tsmode RFC3161` |
| NuGet | `-Timestamper <URL>` |
| Mage | `-TimeStampUri <URL>` |
| macOS codesign | `--timestamp` (uses Apple's timestamp service) |

Well-known public TSAs include `http://timestamp.digicert.com` and `http://timestamp.sectigo.com`. Where possible, use the TSA of the CA that issued your certificate.

## Error: "SignTool Error: The specified timestamp server either could not be reached or returned an invalid response."

**Cause.** The build machine can't reach the TSA, the TSA is busy, or the URL is wrong.

**Resolution.**

1. Check the URL for typos. Most TSA URLs use plain HTTP on TCP 80. That is normal, because the timestamp response is itself signed.
2. Test the connection from the build machine:

   ```powershell
   Test-NetConnection timestamp.digicert.com -Port 80
   ```

3. If the build machine uses a proxy, note that SignTool uses the Windows (WinHTTP) proxy settings, not the browser's. Set a machine-wide proxy:

   ```cmd
   netsh winhttp set proxy <proxy-host>:<proxy-port>
   ```

4. Retry. Public TSAs sometimes rate-limit or are briefly unavailable.
5. Keep a second TSA URL in your build scripts and retry with it when the first fails.

## Problem: jarsigner connection or timeout errors with -tsa

**Cause.** Java doesn't use the Windows or system proxy settings by default, so the JVM can't reach the TSA.

**Resolution.** Pass the proxy to the JVM:

```bash
jarsigner -J-Dhttp.proxyHost=proxy.example.com -J-Dhttp.proxyPort=8080 ... -tsa http://timestamp.digicert.com ...
```

Use `-J-Dhttps.proxyHost` and `-J-Dhttps.proxyPort` as well if your TSA URL uses HTTPS.

## Warning: jarsigner "No -tsa or -tsacert is provided and this jar is not timestamped"

**Cause.** The command had no `-tsa` option. The JAR is signed but has no timestamp, so it won't validate after the signing certificate expires.

**Resolution.** Sign again with `-tsa <URL>`.

## Problem: the file is signed but not timestamped

**Symptom.** Signing succeeded, but the file has no timestamp. In SignTool's syntax, `/tr` and `/td` are optional, so leaving them out is not an error.

**Why it matters.** A signature without a timestamp is trusted only while the signing certificate is valid. Publicly trusted code signing certificates issued since March 1, 2026 are valid for at most 460 days, so an untimestamped release can start showing warnings or fail to install within about 15 months.

**Check whether a file is timestamped.**

| Tool | Command | Look for |
|---|---|---|
| SignTool | `signtool verify /pa /v <file>` | "The signature is timestamped:" and a date |
| jarsigner | `jarsigner -verify -verbose <file.jar>` | "Timestamped by" |
| PowerShell | `Get-AuthenticodeSignature <file> \| Format-List` | A `TimeStamperCertificate` value |

**Resolution.**

- Sign the file again with the timestamp options.
- For Authenticode files, you can add a timestamp to an already signed file while the signing certificate is still valid:

  ```cmd
  signtool timestamp /tr http://timestamp.digicert.com /td SHA256 <file>
  ```

- Add a check to your pipeline that fails the build when a released file has no timestamp, for example `signtool verify /pa /tw <file>`. The `/tw` option warns when a signature isn't timestamped.

## Problem: I used /t and the timestamp is SHA-1

**Cause.** `/t` is SignTool's legacy Authenticode timestamp option.

**Resolution.** Use `/tr <URL> /td SHA256` instead. The `/td` value should match `/fd`.

## Formats that can't be timestamped

Some formats have no TSA timestamp. This is expected and not an error:

| Format | Behavior |
|---|---|
| Android APK (apksigner) | APK signatures don't include timestamps. |
| GnuPG detached signatures, Debian and RPM packages | The signature records its creation time, but no TSA is used. |

For these formats, key continuity and certificate planning matter more than timestamps. Check the platform's own rules for how it treats expired signing certificates.

## Information to collect for EC support

- The signing command (remove passwords) and the full output.
- The TSA URL, and whether a proxy is used.
- Output of `Test-NetConnection` or `curl` to the TSA from the build machine.
- The output of the verification command for the signed file.

## Related articles

- [Timestamping for code signing](timestamping-for-code-signing.md)
- [Troubleshooting SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md)
- [Code signing myths and misconceptions](../../02-General/Code-Signing/code-signing-myths-and-misconceptions.md)
- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
