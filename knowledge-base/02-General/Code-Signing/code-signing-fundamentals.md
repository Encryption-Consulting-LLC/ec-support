---
title: "Code Signing Fundamentals"
category: "General"
section: "Code Signing"
article_type: "Concept"
applies_to: "Code signing for Windows (Authenticode), Java, macOS, Linux packages, containers, and firmware"
summary: "How code signing works: hashes, signatures, certificates, timestamps, OV vs EV, public vs private signing, and how operating systems verify signed software."
keywords: ["code signing fundamentals", "Authenticode", "code signing certificate", "timestamping", "signtool"]
last_reviewed: "2026-10-06"
---

# Code Signing Fundamentals

This article explains what code signing is, how a signature is created and checked, and which certificates and services are involved. It is for developers, release engineers, and security teams who are new to code signing or need to explain it to others.

## What it is

Code signing is the use of a digital signature to prove two things about software:

- **Authenticity:** who published it.
- **Integrity:** that it has not changed since it was signed.

The publisher signs a hash of the software with a private key. A code signing certificate, issued by a Certificate Authority (CA), links the matching public key to the publisher's verified identity. Operating systems, browsers, package managers, and app stores check the signature before installing or running the software.

## Why it matters

- **User and system trust.** Windows SmartScreen, macOS Gatekeeper, and many enterprise allow-list tools use signatures to decide whether software may run.
- **Supply chain security.** Signatures detect tampering between build and install.
- **Platform rules.** Some platforms require signatures, for example Windows kernel drivers, Android apps, and macOS apps distributed outside the App Store (which also need Apple notarization).
- **Risk.** A stolen code signing key lets attackers sign malware that looks legitimate. Several major supply chain attacks used stolen or misused signing keys.

## How it works

### Signing

1. The build produces the final file (for example an `.exe`, `.msi`, `.jar`, `.apk`, `.rpm`, or container image).
2. The signing tool computes a cryptographic hash of the file content, for example SHA-256.
3. The hash is signed with the publisher's private key. For public code signing certificates, this key must be in a Hardware Security Module (HSM) or similar hardware.
4. The tool requests a **timestamp** from a Time Stamping Authority (TSA) using RFC 3161. The TSA signs the hash with the current time.
5. The signature, the signing certificate chain, and the timestamp are stored in the file (embedded signature) or beside it (detached signature, for example `.sig` or `.asc`).

### Verifying

1. The verifier recomputes the hash of the file.
2. It checks the signature with the public key from the certificate.
3. It builds the certificate chain to a trusted root and checks that the certificate has the code signing Extended Key Usage (EKU).
4. It checks revocation status.
5. It checks the timestamp. If a valid timestamp shows the file was signed while the certificate was valid, the signature stays valid after the certificate expires.

### Example: sign and verify with Windows SignTool

```cmd
signtool sign /fd SHA256 /tr <TimestampURL> /td SHA256 /sha1 <CertThumbprint> <file.exe>
signtool verify /pa /v <file.exe>
```

When the key is in an HSM, SignTool uses the HSM's Cryptography API: Next Generation (CNG) Key Storage Provider or a signing service. See [Signing Windows binaries with SignTool](../../01-Products/CodeSign-Secure/signing-windows-binaries-with-signtool.md).

## Types of code signing certificates

| Type | Validation | Notes |
|---|---|---|
| Organization Validation (OV) | The CA verifies the organization exists | Standard public code signing certificate |
| Extended Validation (EV) | Stricter identity checks | Historically gave faster Windows SmartScreen reputation. Check current Microsoft guidance, as reputation behavior has changed |
| Individual Validation (IV) | The CA verifies a named person | For individual developers |
| Private (internal) | Issued by the organization's own CA | Trusted only where the organization deploys its root, for example internal scripts and line-of-business apps |
| Platform-issued | Issued by the platform owner | For example Apple Developer ID, Microsoft attestation signing for drivers |

Since June 1 2023, private keys for publicly trusted OV and EV code signing certificates must be generated and stored in hardware. Since March 1 2026, these certificates may be valid for at most 460 days. See [CA/B Forum code signing key storage requirements](ca-b-forum-code-signing-key-storage-requirements.md).

## Common signing formats

| Ecosystem | Tool or format |
|---|---|
| Windows | Authenticode with SignTool; MSIX and AppX; ClickOnce; PowerShell scripts |
| Java | `jarsigner` |
| Android | `apksigner` |
| macOS and iOS | `codesign` plus Apple notarization |
| Linux packages | GNU Privacy Guard (GPG) signatures for Debian and RPM packages |
| Containers | Sigstore cosign, Notary Project (Notation) |
| NuGet | `nuget sign` or `dotnet nuget sign` |

## Key terms

| Term | Meaning |
|---|---|
| Hash | A fixed-length fingerprint of data. Any change produces a different hash |
| Digital signature | A hash encrypted with a private key, verifiable with the public key |
| Code signing certificate | Certificate with the code signing EKU (1.3.6.1.5.5.7.3.3) |
| TSA | Time Stamping Authority, signs a trusted time under RFC 3161 |
| Embedded vs detached signature | Signature inside the file vs in a separate file |
| Notarization | Apple's service that scans software and issues a ticket |

## Common questions

### What happens when a code signing certificate expires?
Files signed **with a timestamp** stay valid. Files signed **without** a timestamp fail verification after expiry. Always timestamp. See [Timestamping for code signing](../../01-Products/CodeSign-Secure/timestamping-for-code-signing.md).

### What happens if a certificate is revoked?
Depending on the revocation reason and date, verifiers may reject files signed after the revocation date, or all files. Key compromise usually means all signatures are distrusted.

### Can developers keep signing keys on their laptops?
Not for public certificates. Hardware key storage is required. Central signing services such as [CodeSign Secure](../../01-Products/CodeSign-Secure/codesign-secure-overview.md) keep keys in HSMs and give developers controlled access.

## Related articles

- [Code signing best practices](code-signing-best-practices.md)
- [CA/B Forum code signing key storage requirements](ca-b-forum-code-signing-key-storage-requirements.md)
- [How CodeSign Secure works](../../01-Products/CodeSign-Secure/how-codesign-secure-works.md)
- [Timestamping for code signing](../../01-Products/CodeSign-Secure/timestamping-for-code-signing.md)
- [What is an HSM](../HSM/what-is-an-hsm.md)
