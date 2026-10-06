---
title: "PQC Readiness Checklist 2026: Post-Quantum Migration Steps for Enterprises"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "Enterprise cryptography programs, PKI, HSMs, TLS, code signing, applications, vendors"
summary: "A practical 2026 post-quantum cryptography readiness checklist: governance, inventory, risk, quick wins, PKI and HSM, vendors, and key deadlines."
keywords: ["PQC readiness checklist", "post-quantum migration", "quantum readiness", "PQC roadmap", "cryptographic inventory", "crypto agility"]
primary_keyword: "PQC readiness checklist"
secondary_keywords: ["post-quantum migration checklist", "quantum readiness assessment", "PQC migration steps 2026", "cryptographic inventory CBOM", "crypto agility", "PQC roadmap enterprise"]
last_reviewed: "2026-10-06"
---

# PQC Readiness Checklist 2026: Post-Quantum Migration Steps for Enterprises

Post-quantum cryptography (PQC) has moved from research to planning deadlines. NIST standards are final, browsers already use post-quantum key exchange, and government timelines point to 2030 and 2035. This checklist gives organizations a practical way to measure readiness and decide next steps in 2026. It is written for security leaders, program managers, and PKI, HSM, and application owners.

## Key takeaways

- The core standards exist: FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA), final since August 13, 2024.
- NIST IR 8547 (draft) deprecates 112-bit quantum-vulnerable algorithms after 2030 and disallows all of them after 2035.
- CNSA 2.0 expects new National Security Systems acquisitions to be compliant from January 1, 2027.
- The first real step is a cryptographic inventory, usually recorded as a Cryptographic Bill of Materials (CBOM).
- Quick wins exist today: hybrid ML-KEM key exchange in TLS, AES-256, and PQC requirements in procurement.
- Crypto agility, the ability to change algorithms without major rework, is the long-term goal.

## Why does PQC readiness matter in 2026?

Three pressures meet in 2026:

1. **Harvest now, decrypt later.** Data captured today can be decrypted once a quantum computer exists. See [Harvest now, decrypt later explained](harvest-now-decrypt-later-explained.md).
2. **Regulatory dates.** Federal and defense timelines are fixed, and regulators in finance and critical infrastructure are publishing their own expectations.
3. **Long migration cycles.** Replacing cryptography in PKI, HSMs, firmware, and applications commonly takes 5 to 10 years.

## What are the key PQC dates to plan around?

| Date | Milestone | Status as of October 2026 |
|---|---|---|
| August 13, 2024 | FIPS 203, 204, 205 published | Done |
| November 2024 | Chrome 131 uses X25519MLKEM768 by default | Done |
| September 21, 2026 | FIPS 140-2 certificates move to CMVP Historical list | Done |
| January 1, 2027 | New NSS acquisitions expected to be CNSA 2.0 compliant | Upcoming |
| 2030 | CNSA 2.0 exclusive use for software and firmware signing and networking equipment; NIST deprecation of 112-bit RSA and ECC | Upcoming |
| 2033 | CNSA 2.0 exclusive use for web, cloud, operating systems, and most other categories | Upcoming |
| 2035 | NIST disallows quantum-vulnerable algorithms; NSS fully quantum resistant | Upcoming |

## PQC readiness checklist

Use the checklist below to score current status. Mark each item as Done, In progress, or Not started.

### 1. Governance

- [ ] An executive sponsor owns the PQC program.
- [ ] A cross-functional team (security, PKI, infrastructure, development, procurement, legal) is named.
- [ ] PQC is in the risk register with an agreed risk appetite.
- [ ] A budget and multi-year plan exist.
- [ ] Internal policy names approved post-quantum algorithms and parameter sets.

### 2. Inventory and discovery

- [ ] Cryptographic use is discovered in source code, binaries, and libraries.
- [ ] Certificates, keys, and keystores are inventoried (including JKS and PKCS#12 files).
- [ ] HSMs, key managers, and cloud KMS keys are included.
- [ ] Network protocols (TLS, SSH, IPsec VPN) are mapped by endpoint.
- [ ] Results are stored in a CBOM, for example in CycloneDX format, and kept current.

### 3. Risk assessment

- [ ] Data is classified by how long it must stay confidential.
- [ ] Mosca's theorem (data lifetime plus migration time versus time to a quantum computer) is applied to key systems.
- [ ] Systems are ranked by exposure, data sensitivity, and replacement difficulty.
- [ ] Third-party and supply chain dependencies are included.

### 4. Quick wins

- [ ] Hybrid key exchange (X25519MLKEM768) is enabled on public web servers, load balancers, and CDNs.
- [ ] Middleboxes are tested for large TLS ClientHello messages.
- [ ] AES-256 is the default for new data at rest.
- [ ] RSA-2048 is not used for new long-lived keys.
- [ ] New contracts require a vendor PQC roadmap.

### 5. PKI and certificates

- [ ] CA hierarchy, key sizes, and algorithms are documented.
- [ ] ML-DSA and hybrid certificates are tested in a lab private PKI.
- [ ] Certificate lifecycle management is automated, which also supports 47-day public certificates.
- [ ] Clients and relying parties are checked for large certificate support.
- [ ] A plan exists for root CA replacement, since roots are long-lived.

### 6. HSMs and key management

- [ ] HSM models and firmware versions are known, with FIPS 140-3 status.
- [ ] Vendor support for ML-KEM, ML-DSA, LMS, and XMSS is confirmed.
- [ ] A firmware upgrade or replacement plan exists where support is missing.
- [ ] Key wrapping schemes that rely on RSA are identified.

### 7. Code signing and firmware

- [ ] All signing keys and their algorithms are inventoried.
- [ ] A plan exists for LMS or XMSS (CNSA 2.0) or ML-DSA signing.
- [ ] Signing keys stay in HSMs with state management for stateful schemes.

### 8. Applications and vendors

- [ ] Applications use cryptographic libraries that support PQC (for example OpenSSL 3.5 or later).
- [ ] Hard-coded algorithms are removed or wrapped in configurable interfaces.
- [ ] Key vendors have answered a PQC questionnaire with dates.

### 9. People and testing

- [ ] Teams have PQC training.
- [ ] A test lab exists for PQC interoperability and performance.
- [ ] Rollback plans exist for each pilot.

## How to read the results

| Result | Meaning | Next step |
|---|---|---|
| Few items done | Aware but not started | Appoint an owner and start inventory |
| Inventory done, no plan | Inventoried | Complete risk ranking and build a roadmap |
| Pilots under way | Planned and piloting | Expand quick wins and vendor engagement |
| Production migrations under way | Migrating | Track progress against 2030 and 2035 dates |
| Algorithms change by configuration | Crypto-agile | Maintain inventory and monitor standards |

These stages line up with the EC [PQC maturity model](../02-General/Post-Quantum-Cryptography/pqc-maturity-model.md).

## How EC can help

- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): automated cryptographic discovery and CBOM output.
- [PQC advisory and readiness assessment](../03-Services/pqc-advisory-and-readiness-assessment.md): inventory, quantum risk, algorithm selection, and a phased roadmap.
- [Building a PQC migration roadmap](../02-General/Post-Quantum-Cryptography/building-a-pqc-migration-roadmap.md): how to sequence the work.
- [Crypto agility explained](../02-General/Post-Quantum-Cryptography/crypto-agility-explained.md): design principles for future change.
- [Free EC tools](../00-Working-with-EC-Support/free-ec-tools-csr-generator-and-decoders.md): includes the 20-question PQC Readiness Assessment.

## Frequently asked questions

### What is the first step in PQC readiness?

Build a cryptographic inventory. Without knowing where RSA and elliptic curve algorithms are used, it is not possible to plan or prioritize.

### How long does a PQC migration take?

Large organizations should expect several years. Many estimates range from 5 to 10 years, depending on the number of systems and vendors involved.

### Should organizations wait for more standards before starting?

No. ML-KEM, ML-DSA, and SLH-DSA are final. Inventory, risk assessment, and hybrid key exchange do not depend on future standards.

### What is the quickest PQC win?

Enabling hybrid ML-KEM key exchange in TLS 1.3. It protects traffic against harvest now, decrypt later and works with existing certificates.

### Do small organizations need a PQC plan?

Yes, at a scale that fits. Most will rely on vendors, so the main tasks are inventory, asking vendors for PQC roadmaps, and keeping software up to date.
