---
title: "How CodeSign Secure Works"
category: "Products"
section: "CodeSign Secure"
article_type: "Concept"
applies_to: "CodeSign Secure (all deployment models)"
summary: "Explains the CodeSign Secure signing flow: client hashing, policy checks, approvals, HSM signing, timestamping, and audit logging, with key terms defined."
keywords: ["CodeSign Secure architecture", "hash signing", "HSM signing flow", "KSP", "PKCS#11"]
last_reviewed: "2026-10-06"
---

# How CodeSign Secure Works

This article explains what happens inside CodeSign Secure from the moment a developer or build job asks for a signature until the signed file is ready. It is for administrators, release engineers, and support staff who need to understand the flow in order to design, operate, or troubleshoot the platform.

## What it is

CodeSign Secure separates the place where code is built from the place where keys live. Build systems and developers keep their normal tools, such as SignTool, jarsigner, or cosign. A small signing client plugs those tools into CodeSign Secure. The CodeSign Secure server decides whether the request is allowed. The Hardware Security Module (HSM) performs the actual private key operation.

## Why it matters

- **Key theft is the main code signing risk.** If an attacker copies a signing key, the attacker can sign malware that looks legitimate. Keeping keys in an HSM prevents copying.
- **Signing must be controlled.** Without central policy, anyone with access to a build server can sign anything. CodeSign Secure adds permissions, approvals, and an audit trail.
- **Industry rules require hardware.** Since June 1, 2023, the CA/Browser Forum (CA/B Forum) requires private keys for publicly trusted code signing certificates to be generated and stored in hardware that meets FIPS 140-2 Level 2 or Common Criteria EAL4+ (or better).

## How it works

1. **Request starts.** A developer or a CI/CD job runs a native signing tool. The tool is configured to use the CodeSign Secure Key Storage Provider (KSP) on Windows or the CodeSign Secure PKCS#11 library on Linux and macOS.
2. **Client authenticates.** The client authenticates to the CodeSign Secure server.
3. **Hash is computed locally.** The signing tool computes a digest (hash) of the file, for example SHA-256. Only this hash is sent to the server, so large binaries stay on the build system.
4. **Policy check.** The server checks the request against the signing policy: user or service identity, project, key, allowed file types, allowed hash algorithms, time windows, and source network.
5. **Approval (if required).** If the policy needs approval, the request waits until the required approvers accept it. Policies can require M of N quorum approval.
6. **HSM signing.** The server asks the HSM to sign the hash with the selected private key. The private key never leaves the HSM.
7. **Signature returned.** The signature (and certificate chain) is returned to the client. The native tool builds the final signed file format, for example an Authenticode signature block or a signed JAR.
8. **Timestamp.** The signing tool contacts a Time Stamping Authority (TSA) using RFC 3161, so the signature stays valid after the certificate expires.
9. **Audit.** The server logs who signed what, with which key, when, and who approved it.

> **Note:** Some file types, such as certain container or package formats, may need different flows. Check the article for each signing tool.

## Key terms

| Term | Meaning |
|---|---|
| Hardware Security Module (HSM) | Tamper-resistant hardware that generates, stores, and uses cryptographic keys. |
| Hash signing | Signing a digest of the file instead of sending the whole file to the signing service. |
| Key Storage Provider (KSP) | A Windows Cryptography API: Next Generation (CNG) plug-in that lets Windows tools use keys stored elsewhere. |
| PKCS#11 | A standard C programming interface for cryptographic tokens and HSMs, widely used on Linux, macOS, and Java. |
| Signing policy | Rules that decide who can sign, with which key, and under what conditions. |
| M of N approval | A request needs M approvals from a group of N approvers. |
| Time Stamping Authority (TSA) | A service that proves a signature existed at a given time (RFC 3161). |
| Role-Based Access Control (RBAC) | Permissions assigned to roles, and roles assigned to users. |

## Common questions

**Does the file get uploaded to CodeSign Secure?**
In hash signing mode, no. Only the hash goes to the server.

**Where do certificates come from?**
Certificates are issued by a public Certificate Authority (CA) for publicly trusted signing, or by an internal CA for internal software. The Certificate Signing Request (CSR) is generated from a key created inside the HSM.

**What happens if the server is down?**
Signing requests fail until the server is back. Plan high availability for production signing. See [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md).

**Is the signature different from a locally made signature?**
No. The result is a standard signature that any verifier (Windows, Java, cosign) accepts.

## Related articles

- [CodeSign Secure overview](codesign-secure-overview.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Timestamping for code signing](timestamping-for-code-signing.md)
- [Code signing fundamentals](../../02-General/Code-Signing/code-signing-fundamentals.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
