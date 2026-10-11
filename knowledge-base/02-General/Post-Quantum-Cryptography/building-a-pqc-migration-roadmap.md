---
title: "Building a PQC Migration Roadmap"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "How-to"
applies_to: "Security leaders, PQC program managers, PKI, HSM and application owners"
summary: "Step-by-step guide to building a post-quantum cryptography migration roadmap: governance, CBOM inventory, risk ranking, pilots, phased migration and tracking."
keywords: ["PQC migration roadmap", "quantum migration plan", "PQC program", "CBOM", "crypto-agility", "CNSA 2.0"]
last_reviewed: "2026-10-06"
---

# Building a PQC Migration Roadmap

A post-quantum cryptography (PQC) migration roadmap is the plan that takes an organization from today's RSA and ECC estate to quantum-safe cryptography. This article gives a practical, phased method to build one. It is for program managers, security architects and the owners of PKI, HSM and application platforms.

## Overview

The roadmap answers five questions: who owns the work, what cryptography exists, what is most at risk, what to change first, and how progress is measured. It should line up with external deadlines, such as NIST IR 8547 (draft: deprecation of quantum-vulnerable algorithms after 2030, disallowance after 2035) and NSA CNSA 2.0 (new National Security System acquisitions compliant from January 1, 2027; all NSS quantum resistant by 2035).

## Applies to

Any organization that uses public key cryptography. The depth of each phase scales with size and risk.

## Prerequisites

- An executive sponsor and a named program owner.
- Access to system owners across IT, application development, network, PKI and HSM teams.
- A baseline maturity score. See [PQC maturity model](pqc-maturity-model.md).

## Before starting

- **Scope.** Decide which business units, environments and partners are in scope.
- **Avoid big-bang changes.** PQC changes affect handshakes, certificate sizes and device memory. Every production change needs testing and a rollback plan.
- **Expect vendor gaps.** Some products will not support PQC for years. The roadmap must include exceptions and compensating controls.

## Procedure

### Phase 1: Govern

1. Approve a charter with goals, scope, budget and target dates.
2. Form a steering group with security, risk, IT, development, procurement and legal.
3. Publish a crypto policy that lists approved, deprecated and disallowed algorithms with dates.
4. Add quantum risk to the enterprise risk register.

### Phase 2: Discover

1. Run automated discovery to build a Cryptographic Bill of Materials (CBOM). Cover source code, binaries, keystores, HSMs, key managers, cloud key services, network endpoints, SSH and directories. See [How CBOM works](../CBOM/how-cbom-works.md).
2. Map each cryptographic asset to its system owner and business service.
3. Collect vendor PQC roadmaps for every product that performs cryptography.
4. Flag quantum-vulnerable algorithms (RSA, ECDSA, ECDH, DH) and weak legacy ones (SHA-1, 3DES, short RSA keys).

### Phase 3: Assess and prioritize

1. Classify data by how long it must stay secret.
2. Apply Mosca's theorem (if X + Y > Z, act now) to each system. See [Quantum risk assessment and Mosca's theorem](quantum-risk-assessment-and-moscas-theorem.md).
3. Combine time risk with business impact to rank systems.
4. Group systems into migration waves.

### Phase 4: Prepare and pilot

1. Build a lab with PQC-capable libraries (for example OpenSSL 3.5 or later). See [Testing PQC algorithms in a lab](testing-pqc-algorithms-in-a-lab.md).
2. Check HSM firmware and CA software for ML-KEM and ML-DSA support. See [PQC readiness for PKI and HSM](pqc-readiness-for-pki-and-hsm.md).
3. Pilot hybrid TLS key exchange (X25519MLKEM768) on a low-risk service.
4. Pilot a test PQC or composite CA hierarchy.
5. Measure handshake time, certificate size, CPU use, and failure rates with old clients and middleboxes.
6. Add PQC requirements to Requests for Proposal (RFPs) and contract renewals.

### Phase 5: Migrate in waves

1. **Wave 1: key exchange for long-lived data.** Enable hybrid key exchange on external and internal TLS, VPN and data transfer links that carry data with a long shelf life.
2. **Wave 2: infrastructure.** Upgrade HSM firmware, CA software and central crypto services. Stand up PQC-capable CA hierarchies where needed.
3. **Wave 3: signatures with long lives.** Move code signing, firmware signing and root CA keys as ecosystem support allows (LMS, XMSS, ML-DSA or SLH-DSA).
4. **Wave 4: the long tail.** Applications, databases, partner links and embedded devices. Replace or isolate systems that cannot be upgraded.

### Phase 6: Sustain crypto-agility

1. Keep the CBOM continuous, including in CI/CD pipelines.
2. Enforce the crypto policy with automated checks.
3. Re-score the maturity model every 6 to 12 months.
4. Rehearse an algorithm change to prove agility. See [Crypto-agility explained](crypto-agility-explained.md).

### Example roadmap view

| Period | Focus | Example milestones |
|---|---|---|
| Year 1 | Govern, discover, assess | Owner named, CBOM for critical systems, risk ranking approved |
| Year 1 to 2 | Pilot and prepare | Hybrid TLS pilot, HSM firmware plan, PQC test CA |
| Year 2 to 4 | Migrate waves 1 and 2 | Hybrid key exchange on priority links, PQC-capable infrastructure |
| Year 3 to 2030 | Migrate waves 3 and 4 | Signature migration, long-tail remediation |
| 2030 to 2035 | Complete and sustain | No quantum-vulnerable algorithms in approved use |

> **Tip:** Align the dates with regulatory deadlines for the sector. For National Security Systems, follow CNSA 2.0 dates, which are earlier for software and firmware signing (exclusive use by 2030) and web, browser and cloud services (exclusive use by 2033).

## Verification

- Each phase has an owner, dates and measurable exit criteria.
- The share of quantum-vulnerable assets in the CBOM falls over time.
- Pilot results are documented and accepted.
- The maturity level rises at each review.

## Rollback

Every production PQC change should have a tested rollback. For hybrid TLS, this usually means removing the hybrid group from the server configuration. For certificates, keep the previous classical chain available until clients are confirmed working.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| TLS handshakes fail after enabling hybrid groups | Middlebox or old load balancer cannot handle larger ClientHello messages | Update or bypass the device; keep a classical fallback group |
| Program stalls after awareness | No inventory or no owner | Fund discovery and name an owner (Levels 1 to 2 of the maturity model) |
| Vendor has no PQC date | Product roadmap gap | Record an exception, add contract terms, plan replacement |
| HSM cannot generate ML-DSA keys | Firmware too old | Plan a firmware upgrade or HSM refresh |
| Certificates too large for device | Memory or field size limits | Test smaller parameter sets or replace the device |

## Related articles

- [PQC maturity model](pqc-maturity-model.md)
- [Quantum risk assessment and Mosca's theorem](quantum-risk-assessment-and-moscas-theorem.md)
- [PQC readiness for PKI and HSM](pqc-readiness-for-pki-and-hsm.md)
- [What is a CBOM?](../CBOM/what-is-a-cbom.md)
- [PQC Advisory and readiness assessment](../../03-Services/pqc-advisory-and-readiness-assessment.md)
- [PQC readiness checklist 2026](../../05-Popular-Right-Now/pqc-readiness-checklist-2026.md)
