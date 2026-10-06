---
title: "Using CBOM Secure for PQC Readiness"
category: "Products"
section: "CBOM Secure"
article_type: "How-to"
applies_to: "CBOM Secure (all deployment models), used for post-quantum cryptography planning against NIST and CNSA 2.0 timelines"
summary: "How to use CBOM Secure findings to measure post-quantum readiness, rank quantum-vulnerable assets, and feed a PQC roadmap aligned to NIST and CNSA 2.0."
keywords: ["PQC readiness", "quantum-vulnerable algorithms", "CBOM Secure PQC", "ML-KEM migration", "NIST IR 8547"]
last_reviewed: "2026-10-06"
---

# Using CBOM Secure for PQC Readiness

This article explains how to use CBOM Secure to prepare for Post-Quantum Cryptography (PQC). It covers finding quantum-vulnerable cryptography, ranking it, mapping it to NIST replacements, and tracking progress. It is for PQC program leads, security architects, and PKI owners.

## Overview

A large quantum computer could break today's public key algorithms (RSA, ECDSA, ECDH, and Diffie-Hellman). Attackers can also record encrypted traffic now and decrypt it later ("harvest now, decrypt later"). Key dates:

- **August 13, 2024:** NIST published FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA).
- **NIST IR 8547 (draft):** quantum-vulnerable algorithms deprecated after 2030 and disallowed after 2035.
- **NSA CNSA 2.0:** software and firmware signing should prefer CNSA 2.0 algorithms now and use them exclusively by 2030. National Security Systems should be quantum resistant by 2035.

CBOM Secure supplies the inventory step of a PQC program: it shows where vulnerable algorithms are, who depends on them, and how ready each area is.

## Applies to

CBOM Secure in all deployment models.

## Prerequisites

- Scans completed across the main sources. See [Running a first cryptographic scan](running-a-first-cryptographic-scan.md).
- Application owners identified for the scanned systems.
- A data sensitivity classification (for example how long data must stay confidential).

## Before starting

- PQC readiness is a program, not a single scan. Plan for repeated scans over several years.
- Do not replace algorithms based on scan results alone. Test changes, because PQC keys and signatures are larger and may break protocols, devices, or storage limits.

## Procedure

### Phase 1: Check the PQC readiness view

1. Open the PQC readiness dashboard: {{TBD: console menu path for PQC readiness view}}.
2. Note the readiness scores for the three asset classes CBOM Secure measures: keys, certificates, and protocol cipher suites.
3. Export the baseline for later comparison.

### Phase 2: Filter quantum-vulnerable assets

Filter the inventory for assets where the CycloneDX field `nistQuantumSecurityLevel` is `0`, or by algorithm family. The main families to find are:

| Use | Vulnerable today | NIST or CNSA 2.0 replacement |
|---|---|---|
| Key establishment | RSA key transport, ECDH, DH | ML-KEM (FIPS 203). Hybrid such as X25519MLKEM768 during transition. CNSA 2.0 specifies ML-KEM-1024. |
| Digital signatures (general) | RSA, ECDSA, EdDSA | ML-DSA (FIPS 204) or SLH-DSA (FIPS 205). CNSA 2.0 specifies ML-DSA-87. |
| Firmware and code signing | RSA, ECDSA | LMS or XMSS (NIST SP 800-208), or ML-DSA |
| Symmetric encryption | AES-128 (weakened, not broken) | AES-256 (required by CNSA 2.0) |
| Hashing | SHA-256 (acceptable for most uses) | SHA-384 or SHA-512 for CNSA 2.0 |

NIST security categories for reference: ML-KEM-512 is category 1, ML-KEM-768 is 3, ML-KEM-1024 is 5. ML-DSA-44 is 2, ML-DSA-65 is 3, ML-DSA-87 is 5.

### Phase 3: Prioritize

Rank assets using these factors:

1. **Data lifetime:** data that must stay secret for 10 or more years is at risk from harvest now, decrypt later. Prioritize key exchange that protects it.
2. **Trust anchors with long lives:** root CAs, firmware signing keys, and device identities last many years and are hard to replace.
3. **Exposure:** internet-facing TLS and VPN endpoints.
4. **Reachability:** code findings that are reachable in production paths come before dormant code.
5. **Compliance deadlines:** CNSA 2.0 for National Security Systems, NIST IR 8547 for federal systems, and sector rules.

### Phase 4: Find blockers

Use dependencies in the CBOM to find what must change before an algorithm can be replaced:

- Crypto libraries without PQC support (check versions, for example OpenSSL 3.5 adds native ML-KEM and ML-DSA).
- HSMs whose firmware does not support ML-KEM or ML-DSA.
- Hard-coded algorithms in code (low crypto agility).
- Partners or devices that cannot accept larger keys or certificates.

### Phase 5: Build and track the roadmap

1. Group assets into migration waves by owner and platform.
2. Record target dates in the roadmap. See [Building a PQC migration roadmap](../../02-General/Post-Quantum-Cryptography/building-a-pqc-migration-roadmap.md).
3. Rescan after each wave and compare readiness scores with the baseline.
4. Report progress with CBOM exports and dashboard trends.

## Verification

- A baseline readiness score is recorded and dated.
- Every high-priority quantum-vulnerable asset has an owner, a target algorithm, and a target date.
- Later scans show the count of vulnerable assets going down.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Readiness score does not change after migration | Old assets still present in other locations, or no rescan | Rescan all sources. Check for leftover keys and certificates. |
| Hybrid TLS groups not shown as PQC | Endpoint scan did not offer hybrid groups, or version not recognized | Confirm the endpoint configuration. Report the case to EC support. |
| Too many findings to act on | Scope too broad for first wave | Filter to reachable, internet-facing, and long-lived assets first. |

## Related articles

- [Reading a CBOM report](reading-a-cbom-report.md)
- [What is post-quantum cryptography](../../02-General/Post-Quantum-Cryptography/what-is-post-quantum-cryptography.md)
- [PQC maturity model](../../02-General/Post-Quantum-Cryptography/pqc-maturity-model.md)
- [NIST FIPS 203, 204, 205 explained](../../05-Popular-Right-Now/nist-fips-203-204-205-explained.md)
- [PQC advisory and readiness assessment](../../03-Services/pqc-advisory-and-readiness-assessment.md)
