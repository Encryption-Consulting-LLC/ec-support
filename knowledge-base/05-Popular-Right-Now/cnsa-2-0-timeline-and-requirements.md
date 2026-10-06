---
title: "CNSA 2.0 Timeline and Requirements: NSA Quantum-Resistant Algorithm Deadlines"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "National Security Systems (NSS), defense suppliers, software and firmware signing, network equipment, HSMs, PKI"
summary: "CNSA 2.0 explained: NSA algorithms (ML-KEM-1024, ML-DSA-87, LMS, XMSS, AES-256), the 2025 to 2035 timeline by system type, and the 2027 acquisition rule."
keywords: ["CNSA 2.0", "NSA quantum-resistant algorithms", "CNSA 2.0 timeline", "ML-KEM-1024", "ML-DSA-87", "LMS XMSS"]
primary_keyword: "CNSA 2.0 timeline"
secondary_keywords: ["CNSA 2.0 requirements", "Commercial National Security Algorithm Suite 2.0", "CNSA 2.0 algorithms", "CNSA 2.0 software signing 2030", "National Security Systems quantum 2035", "CNSA 2.0 January 2027"]
last_reviewed: "2026-10-06"
---

# CNSA 2.0 Timeline and Requirements: NSA Quantum-Resistant Algorithm Deadlines

The Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) is the National Security Agency (NSA) list of quantum-resistant algorithms for U.S. National Security Systems (NSS). It also sets deadlines, by type of system, for when vendors and operators must support and then use only these algorithms. This article summarizes the algorithms, the timeline, and the practical impact. It is written for defense suppliers, product teams, and security leaders in regulated sectors.

## Key takeaways

- NSA announced CNSA 2.0 in September 2022 and has updated its guidance and FAQ since.
- Required algorithms: ML-KEM-1024, ML-DSA-87, LMS or XMSS (for firmware and software signing), AES-256, and SHA-384 or SHA-512.
- Software and firmware signing and web browsers, servers, and cloud services were expected to support and prefer CNSA 2.0 by 2025.
- From January 1, 2027, new NSS equipment acquisitions are expected to be CNSA 2.0 compliant by default.
- Exclusive use deadlines are 2030 for signing and networking equipment and 2033 for most other categories.
- The overall goal is quantum-resistant NSS by 2035, in line with National Security Memorandum 10 (NSM-10).

## What is CNSA 2.0?

CNSA 2.0 replaces CNSA 1.0, which used RSA, Elliptic Curve Diffie-Hellman (ECDH), and ECDSA. Those algorithms are vulnerable to a future Cryptographically Relevant Quantum Computer (CRQC). CNSA 2.0 lists the algorithms approved for protecting classified and national security information, and the Committee on National Security Systems (CNSS) policy makes it mandatory for NSS.

Commercial organizations are not bound by CNSA 2.0 unless they sell to or operate NSS. Many still follow it because it is the most demanding public PQC benchmark.

## What algorithms does CNSA 2.0 require?

| Function | Algorithm | Standard | Required parameters |
|---|---|---|---|
| Symmetric encryption | AES | FIPS 197 | 256-bit keys |
| Hashing | SHA-2 | FIPS 180-4 | SHA-384 or SHA-512 |
| Key establishment | ML-KEM | FIPS 203 | ML-KEM-1024 |
| General digital signatures | ML-DSA | FIPS 204 | ML-DSA-87 |
| Software and firmware signing | LMS or XMSS | NIST SP 800-208 | All approved parameters (SHA-256/192 recommended for LMS) |

> **Note:** CNSA 2.0 requires the highest security level parameter sets (category 5) for ML-KEM and ML-DSA. ML-KEM-768 and ML-DSA-65, which are common in commercial products, do not meet CNSA 2.0. SLH-DSA is not part of CNSA 2.0.

## What is the CNSA 2.0 timeline?

| System type | Support and prefer CNSA 2.0 by | Use CNSA 2.0 exclusively by |
|---|---|---|
| Software and firmware signing | 2025 | 2030 |
| Web browsers, servers, and cloud services | 2025 | 2033 |
| Traditional networking equipment (VPNs, routers) | 2026 | 2030 |
| Operating systems | 2027 | 2033 |
| Niche equipment (constrained devices, large PKI systems) | 2030 | 2033 |
| Custom applications and legacy equipment | Update or replace | 2033 |

Additional milestones:

| Date | Milestone | Status as of October 2026 |
|---|---|---|
| 2025 | Signing, web, and cloud: support and prefer CNSA 2.0 | Passed |
| 2026 | Networking equipment: support and prefer CNSA 2.0 | In progress |
| January 1, 2027 | New NSS acquisitions expected to be CNSA 2.0 compliant by default | Upcoming |
| 2035 | All NSS quantum resistant | Upcoming |

"Support and prefer" means the product can use CNSA 2.0 algorithms and uses them by default when the other side supports them. "Exclusively" means classical public-key algorithms are no longer used.

## Why does software and firmware signing come first?

Signing keys protect code that may run for many years, such as device firmware and boot loaders. If an attacker could forge signatures in the future, they could push malicious updates to devices still in the field. Hash-based signatures like LMS and XMSS have very well understood security and were standardized before the lattice algorithms, which made early adoption possible.

> **Warning:** LMS and XMSS are stateful. Reusing a one-time signature state can break security. Keep state inside a Hardware Security Module (HSM) that manages it safely, and plan backups carefully.

## How does CNSA 2.0 relate to NIST IR 8547?

Both push the same move away from RSA and ECC, but on different paths. NIST IR 8547 (draft) covers federal systems in general, deprecating 112-bit quantum-vulnerable algorithms after 2030 and disallowing all of them after 2035. CNSA 2.0 is stricter for NSS: it requires specific top-level parameter sets and sets earlier exclusive-use dates for several categories. See [NIST IR 8547 quantum-vulnerable algorithm deprecation](nist-ir-8547-quantum-vulnerable-algorithm-deprecation-2030-2035.md).

## Does CNSA 2.0 allow hybrid cryptography?

NSA guidance focuses on pure CNSA 2.0 algorithms as the end state. NSA has accepted hybrid approaches in some protocols where standards require them, mainly for interoperability during the transition. Check the current NSA CNSA 2.0 FAQ and the relevant protocol profile before choosing a design.

## What should suppliers and operators do now?

1. **Inventory cryptography** in products and systems, including firmware signing, TLS, VPN, and PKI.
2. **Prioritize signing.** Move firmware and software signing to LMS or XMSS, backed by an HSM, ahead of the 2030 exclusive date.
3. **Check HSM and library support** for ML-KEM-1024, ML-DSA-87, and LMS, together with FIPS 140-3 validation.
4. **Update procurement language** so new purchases meet the January 1, 2027 expectation.
5. **Plan PKI changes.** Large PKI systems fall under the niche equipment category, with exclusive use by 2033.
6. **Track updates.** NSA revises its FAQ and protocol guidance as standards mature.

## How EC can help

- [CodeSign Secure overview](../01-Products/CodeSign-Secure/codesign-secure-overview.md): HSM-backed code signing that supports a move to quantum-resistant signing.
- [HSM-as-a-Service overview](../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md): FIPS 140-3 validated HSMs for PQC keys.
- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): find non-CNSA algorithms across the estate.
- [PQC advisory and readiness assessment](../03-Services/pqc-advisory-and-readiness-assessment.md): a roadmap mapped to CNSA 2.0 dates.
- [Compliance advisory services](../03-Services/compliance-advisory-services.md): alignment with federal and industry requirements.

## Frequently asked questions

### Who must comply with CNSA 2.0?

Owners and operators of U.S. National Security Systems, and vendors that supply products to them. Other organizations often use it as a best-practice benchmark.

### What happens on January 1, 2027?

From that date, new acquisitions of NSS equipment are expected to be CNSA 2.0 compliant by default, unless otherwise noted. Vendors without CNSA 2.0 support may lose eligibility for new NSS purchases.

### Is ML-KEM-768 allowed under CNSA 2.0?

No. CNSA 2.0 requires ML-KEM-1024 for key establishment and ML-DSA-87 for general signatures.

### Is SLH-DSA part of CNSA 2.0?

No. For hash-based signatures, CNSA 2.0 uses the stateful LMS and XMSS schemes from NIST SP 800-208.

### When must all National Security Systems be quantum resistant?

The target is 2035, consistent with NSM-10. Most categories must use CNSA 2.0 exclusively by 2033, and signing and networking equipment by 2030.
