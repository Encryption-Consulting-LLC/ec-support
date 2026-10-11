---
title: "Code Signing Best Practices"
category: "General"
section: "Code Signing"
article_type: "Concept"
applies_to: "Enterprise code signing programs, CI/CD pipelines, public and private code signing certificates"
summary: "Code signing best practices: protect keys in HSMs, centralize signing, enforce approvals, always timestamp, sign in CI/CD safely, monitor use, and plan for PQC."
keywords: ["code signing best practices", "secure code signing", "HSM code signing", "CI/CD signing", "software supply chain"]
last_reviewed: "2026-10-06"
---

# Code Signing Best Practices

This article lists practical controls for running a secure and reliable code signing program. It is for security architects, DevOps and release engineers, and PKI teams who own or review code signing.

## What it is

A code signing program is the set of keys, certificates, tools, people, and rules used to sign software. Good practice protects the private keys, limits who can sign what, records every signature, and keeps signing fast enough that teams do not look for shortcuts.

## Why it matters

Attackers target signing keys because a valid signature makes malware look trusted. Past incidents include stolen keys from developer machines, compromised build servers that signed malicious updates, and leaked certificates found in public code repositories. A single misuse can force revocation, which can break every product signed with that certificate.

## How it works: the practices

### 1. Keep private keys in hardware

- Generate and store signing keys in a Hardware Security Module (HSM) validated to Federal Information Processing Standard (FIPS) 140-3 Level 2 or higher, or in a cloud HSM service. This is mandatory for publicly trusted code signing certificates. See [CA/B Forum code signing key storage requirements](ca-b-forum-code-signing-key-storage-requirements.md).
- Never export signing keys to files, build agents, or developer laptops.
- Protect HSM access with quorum or operator credentials for high-value keys.

### 2. Centralize signing

- Use a central signing service so developers and pipelines send hashes or files for signing instead of holding keys.
- Sign hashes on the client side (client-side hashing) for large files, to cut transfer time without exposing keys.
- Use one consistent toolchain per platform (SignTool, jarsigner, apksigner, cosign, GPG).

### 3. Enforce least privilege and approvals

- Use Role-Based Access Control (RBAC): map each key or certificate to the teams and pipelines allowed to use it.
- Require approval workflows for release signing, especially for production or customer-facing builds.
- Separate test signing (internal CA) from release signing (public CA).

### 4. Always timestamp

- Add an RFC 3161 timestamp to every signature, so signed files stay valid after the certificate expires.
- Use a reliable Time Stamping Authority (TSA), and configure a backup TSA.
- See [Timestamping for code signing](../../01-Products/CodeSign-Secure/timestamping-for-code-signing.md).

### 5. Secure the build pipeline

- Sign only artifacts produced by trusted, hardened build systems.
- Scan code and dependencies before signing. A signature only proves origin, not safety.
- Use short-lived credentials (for example OpenID Connect tokens) for pipelines that call the signing service, not long-lived secrets.
- Verify builds where possible, for example reproducible build checks that compare independent builds before signing.

### 6. Rotate and limit certificate scope

- Public code signing certificates now have a maximum validity of 460 days (since March 1 2026). Plan renewals and key rotation.
- Use separate certificates for different products or risk levels, so one compromise does not affect everything.
- Keep an inventory of all signing certificates and their owners.

### 7. Log, monitor, and audit

- Log every signing request: who, what file or hash, which key, when, and the result.
- Send logs to a Security Information and Event Management (SIEM) system and alert on unusual volume, time, or source.
- Review access rights at least quarterly.

### 8. Prepare for incidents

- Document how to revoke a certificate and re-sign affected releases.
- Know the CA's revocation process and contact details ahead of time.
- Choose revocation dates carefully: revoking back to the compromise date protects users without invalidating older good releases.

### 9. Plan for post-quantum signing

- Track which algorithms and key sizes are used for signing with a Cryptographic Bill of Materials (CBOM).
- The NSA's Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) asks for quantum-resistant software and firmware signing (for example LMS, XMSS, or ML-DSA) to be preferred from 2025 and used exclusively by 2030 for national security systems. See [CNSA 2.0 timeline and requirements](../../05-Popular-Right-Now/cnsa-2-0-timeline-and-requirements.md).

## Quick checklist

| Control | Done? |
|---|---|
| All signing keys in HSMs, non-exportable | |
| Central signing service in use | |
| RBAC and approvals per key | |
| Every signature timestamped | |
| CI/CD uses short-lived credentials | |
| Signing logs sent to SIEM | |
| Certificate inventory with owners and expiry dates | |
| Revocation and re-signing runbook tested | |

## Key terms

| Term | Meaning |
|---|---|
| Central signing service | A service that performs signing on behalf of users without exposing keys |
| Client-side hashing | The client computes the hash and sends only the hash for signing |
| RBAC | Role-Based Access Control |
| Reproducible build | Independent builds of the same source produce identical output |
| TSA | Time Stamping Authority |

## Common questions

### Is a cloud HSM acceptable for public code signing keys?
Yes, if the service meets the CA/B Forum hardware requirements (FIPS 140-2 Level 2, Common Criteria EAL 4+, or equivalent) and the CA can verify key attestation.

### How can EC help?
[CodeSign Secure](../../01-Products/CodeSign-Secure/codesign-secure-overview.md) provides HSM-backed central signing with approvals, RBAC, and audit trails, and the [code signing assessment](../../03-Services/code-signing-assessment.md) reviews an existing program.

## Related articles

- [Code signing fundamentals](code-signing-fundamentals.md)
- [CA/B Forum code signing key storage requirements](ca-b-forum-code-signing-key-storage-requirements.md)
- [Approval workflows and signing policies](../../01-Products/CodeSign-Secure/approval-workflows-and-signing-policies.md)
- [Integrating CodeSign Secure with CI/CD pipelines](../../01-Products/CodeSign-Secure/integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Code signing assessment](../../03-Services/code-signing-assessment.md)
