---
title: "Timestamping for Code Signing"
category: "Products"
section: "CodeSign Secure"
article_type: "Concept"
applies_to: "CodeSign Secure with SignTool, jarsigner, and other RFC 3161 capable signing tools"
summary: "Explains RFC 3161 timestamping for code signing, why signed code stays valid after certificate expiry, how to add timestamps, and how to test a TSA."
keywords: ["code signing timestamp", "RFC 3161", "time stamping authority", "signtool tr td", "jarsigner tsa"]
last_reviewed: "2026-10-06"
---

# Timestamping for Code Signing

This article explains what a code signing timestamp is, why every production signature needs one, and how to add and check timestamps when signing with CodeSign Secure. It is for release engineers, administrators, and anyone troubleshooting "signature expired" problems.

## What it is

A timestamp is a signed statement from a trusted Time Stamping Authority (TSA) saying that a given signature existed at a given time. The format is defined in RFC 3161, "Internet X.509 Public Key Infrastructure Time-Stamp Protocol (TSP)". The signing tool sends a hash of the signature to the TSA, and the TSA returns a timestamp token that is embedded in the signed file.

## Why it matters

- **Certificates expire.** Since March 1, 2026, CA/Browser Forum (CA/B Forum) Ballot CSC-31 limits new publicly trusted code signing certificates to a maximum validity of 460 days. Software is often used for many years after that.
- **Without a timestamp,** most verifiers treat the signature as invalid once the signing certificate expires. Users then see warnings, and installers or drivers may fail to load.
- **With a timestamp,** verifiers check that the certificate was valid at the time recorded in the token. The signature stays valid after the certificate expires, as long as the certificate was not revoked with a revocation date before the timestamp.
- **Incident response.** If a key is compromised, the CA can set a revocation date. Files timestamped before that date can remain trusted, while files signed after it are rejected.

## How it works

1. The signing tool creates the signature with the private key (through CodeSign Secure and the Hardware Security Module, HSM).
2. The tool computes a hash of that signature and sends a timestamp request to the TSA URL over HTTP or HTTPS.
3. The TSA adds the current time, signs the response with its own TSA certificate (Extended Key Usage, EKU: `id-kp-timeStamping`), and returns the token.
4. The tool embeds the token in the signed file as an unsigned attribute (countersignature).
5. At verification time, the verifier checks the token, the TSA certificate chain, and the signing certificate validity at the token time.

> **Note:** The timestamp request contains only a hash. The file itself is never sent to the TSA.

## Adding timestamps with common tools

**SignTool (Authenticode, RFC 3161):**

```cmd
signtool sign /sha1 <certificate-thumbprint> /fd SHA256 /tr <tsa-url> /td SHA256 <file>
```

Use `/tr` with `/td SHA256`. The older `/t` option uses the legacy Authenticode timestamp protocol with SHA-1 and should not be used for new signing.

**Add a timestamp to an already signed file:**

```cmd
signtool timestamp /tr <tsa-url> /td SHA256 <file>
```

**jarsigner:**

```bash
jarsigner ... -tsa <tsa-url> -signedjar <signed.jar> <input.jar> <key-alias>
```

**Testing a TSA with OpenSSL:**

```bash
openssl ts -query -data <any-file> -sha256 -cert -out request.tsq
curl -sS -H "Content-Type: application/timestamp-query" --data-binary @request.tsq <tsa-url> -o response.tsr
openssl ts -reply -in response.tsr -text
```

A "Status: Granted." line shows the TSA is working.

## Choosing a TSA

- Use the TSA provided by the Certificate Authority (CA) that issued the signing certificate, or another TSA trusted on the target platforms.
- Configure at least two TSA URLs in build scripts so a TSA outage does not stop releases. Retry with the second URL on failure.
- For internal-only software, an internal TSA can be used if all verifiers trust its root.
- Whether CodeSign Secure provides or proxies a TSA: {{TBD: CodeSign Secure built-in or proxied TSA support and URL}}.

## Key terms

| Term | Meaning |
|---|---|
| Time Stamping Authority (TSA) | A trusted service that issues signed timestamp tokens. |
| RFC 3161 | The Internet standard for the Time-Stamp Protocol. |
| Timestamp token | The signed TSA response embedded in the signed file. |
| Countersignature | A signature over another signature, used to attach the timestamp. |
| `/tr` and `/td` | SignTool options for the RFC 3161 TSA URL and its digest algorithm. |
| Revocation date | The date from which a revoked certificate is considered untrusted. |

## Common questions

**Can a timestamp be added later?**
Yes, for Authenticode files, with `signtool timestamp` as long as the signing certificate is still valid. Add it at signing time to avoid gaps.

**Does the timestamp last forever?**
The token is itself signed by a TSA certificate, which also expires. Verifier behavior after TSA certificate expiry varies by platform. Verify against the vendor documentation for the target platform.

**Why does signing fail only at the timestamp step?**
The TSA is unreachable, often because of a proxy or firewall. See [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md).

**Is timestamping required by CodeSign Secure policy?**
It can be enforced in signing practice. Whether a policy can require it: {{TBD: CodeSign Secure policy option to require timestamps}}.

## Related articles

- [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md)
- [Signing Java JAR files with jarsigner](signing-java-jar-files-with-jarsigner.md)
- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Code signing fundamentals](../../02-General/Code-Signing/code-signing-fundamentals.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
