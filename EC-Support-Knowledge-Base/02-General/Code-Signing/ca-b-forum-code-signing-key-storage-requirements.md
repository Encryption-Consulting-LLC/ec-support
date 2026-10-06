---
title: "CA/B Forum Code Signing Key Storage Requirements"
category: "General"
section: "Code Signing"
article_type: "Concept"
applies_to: "Publicly trusted OV and EV code signing certificates under the CA/B Forum Code Signing Baseline Requirements"
summary: "The CA/B Forum rule that code signing keys live in FIPS 140-2 Level 2 or EAL 4+ hardware since June 2023, CA verification methods, and the 460-day limit."
keywords: ["CA/B Forum code signing", "code signing key storage", "June 1 2023", "460 days", "key attestation", "FIPS 140-2 Level 2"]
last_reviewed: "2026-10-06"
---

# CA/B Forum Code Signing Key Storage Requirements

This article explains the CA/Browser (CA/B) Forum rules for where code signing private keys must be stored, how a Certificate Authority (CA) checks them, and the newer limit on certificate validity. It is for release engineers, security teams, and certificate owners who buy or renew publicly trusted code signing certificates.

## What it is

The CA/B Forum publishes the "Baseline Requirements for the Issuance and Management of Publicly-Trusted Code Signing Certificates" (Code Signing Baseline Requirements, or CSBR). Public CAs that issue code signing certificates must follow them.

Two rules matter most to subscribers today:

1. **Hardware key storage (since June 1 2023).** The private key for every publicly trusted code signing certificate, both Organization Validation (OV) and Extended Validation (EV), must be generated and kept in suitable hardware. EV certificates already had this rule. The change extended it to OV. The date was first set for November 15 2022 and then moved to June 1 2023.
2. **Maximum validity of 460 days (since March 1 2026).** Ballot CSC-31, adopted November 17 2025, cut the maximum validity of new code signing certificates from 39 months to 460 days. Certificates issued before the change keep their original expiry dates.

## Why it matters

Stolen signing keys let attackers sign malware that looks legitimate. Software keys in files (for example `.pfx` files on build servers) were a common source of theft. The hardware rule closes that gap. Shorter validity limits how long a compromised or misused certificate can be abused and forces regular renewal.

Organizations that still sign with exported key files can no longer obtain or renew public code signing certificates for that setup.

## How it works

### Allowed key storage options

A subscriber must use one of these:

| Option | Description |
|---|---|
| Hardware crypto module | A device the subscriber operates, validated to at least FIPS 140-2 Level 2 or Common Criteria EAL 4+. FIPS 140-3 Level 2 or higher modules also qualify. Examples: on-premises HSMs and hardware tokens |
| Cloud-based key generation and protection | A cloud service that generates and keeps the key inside its HSMs and logs access, for example cloud HSM or key vault services backed by validated HSMs |
| Signing service | A service that meets the CSBR signing service requirements and signs on the subscriber's behalf |

### How the CA verifies the key is in hardware

Before issuing, the CA must confirm the key is protected. Accepted methods include:

1. The CA ships the subscriber a pre-configured hardware token or HSM with the key generated inside it.
2. The subscriber provides a **key attestation** from the hardware that proves the key was generated inside it and cannot be exported. Many HSMs (for example Entrust nShield and Thales Luna) and cloud HSM services can produce attestations.
3. The subscriber uses a CA-prescribed crypto library together with suitable hardware.
4. The subscriber provides an internal or external IT audit report showing the key is only in suitable hardware.
5. The subscriber provides a suitable report for a cloud-based key protection solution.
6. An approved auditor witnesses the key generation in suitable hardware and reports it.
7. The subscriber signs an agreement to use a compliant signing service.

Each CA chooses which of these it supports. Check the CA's enrollment instructions before generating a key.

### Typical flow with an HSM

1. Generate the key pair inside the HSM as non-exportable.
2. Create a Certificate Signing Request (CSR) from the HSM key.
3. Produce the key attestation file, if the CA uses attestation.
4. Submit the CSR and attestation to the CA, and complete organization validation.
5. Install the issued certificate with the HSM key, and sign through the HSM's PKCS#11 or Cryptography API: Next Generation (CNG) interface, or through a central signing platform.

## Practical impact

| Area | Impact |
|---|---|
| Build pipelines | Pipelines cannot hold key files. They must call an HSM or signing service |
| Distributed teams | One USB token per developer does not scale. Central signing is easier to control |
| Renewal frequency | With 460-day certificates, plan renewals about every 15 months, or sooner |
| Key rotation | New certificates can use new keys; plan for attestation each time |
| Audits | Keep attestation files, HSM logs, and signing logs for evidence |

> **Note:** The CSBR also sets stricter rules for CA and Time Stamping Authority (TSA) keys. Those apply to CAs and TSAs, not to subscribers.

## Key terms

| Term | Meaning |
|---|---|
| CSBR | CA/B Forum Code Signing Baseline Requirements |
| Key attestation | Signed evidence from hardware that a key was generated inside it and is non-exportable |
| FIPS 140-2 Level 2 | Federal Information Processing Standard security level with tamper evidence and role-based authentication |
| Common Criteria EAL 4+ | International security evaluation level |
| Signing service | A service that performs code signing for subscribers with keys in hardware |

## Common questions

### Do existing certificates stored in software stop working?
Certificates issued before June 1 2023 kept working until expiry. Renewals and new certificates need hardware storage.

### Does this apply to private (internal) code signing certificates?
No. The CSBR applies to publicly trusted certificates. Internal certificates follow internal policy, but the same hardware protection is strongly recommended.

### Is the 460-day limit the same as for TLS certificates?
No. TLS certificates follow a different schedule (200 days from March 15 2026, falling to 47 days in 2029). Code signing certificates are capped at 460 days.

### How can EC help meet these rules?
[CodeSign Secure](../../01-Products/CodeSign-Secure/codesign-secure-overview.md) keeps signing keys in HSMs and supports central, policy-based signing. [HSM-as-a-Service](../../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md) provides validated hardware. See also [CodeSign Secure prerequisites and HSM integration](../../01-Products/CodeSign-Secure/codesign-secure-prerequisites-and-hsm-integration.md).

## Related articles

- [Code signing fundamentals](code-signing-fundamentals.md)
- [Code signing best practices](code-signing-best-practices.md)
- [FIPS 140-3 security levels explained](../HSM/fips-140-3-security-levels-explained.md)
- [What is an HSM](../HSM/what-is-an-hsm.md)
- [Code signing assessment](../../03-Services/code-signing-assessment.md)
