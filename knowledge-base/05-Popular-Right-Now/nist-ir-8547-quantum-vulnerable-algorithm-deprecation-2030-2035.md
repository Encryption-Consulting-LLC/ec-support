---
title: "NIST IR 8547: RSA and ECC Deprecation in 2030 and Disallowance in 2035"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "RSA, ECDSA, EdDSA, ECDH, DH, PKI, HSMs, TLS, code signing, federal and regulated systems"
summary: "NIST IR 8547 explained: which quantum-vulnerable algorithms are deprecated after 2030 and disallowed after 2035, what replaces them, and how to plan the move."
keywords: ["NIST IR 8547", "RSA deprecation 2030", "ECC disallowed 2035", "quantum-vulnerable algorithms", "PQC transition", "SP 800-131A"]
primary_keyword: "NIST IR 8547"
secondary_keywords: ["RSA deprecated 2030", "ECDSA disallowed 2035", "quantum-vulnerable algorithms NIST", "transition to post-quantum cryptography standards", "112-bit security deprecation", "NIST PQC migration timeline"]
last_reviewed: "2026-10-06"
---

# NIST IR 8547: RSA and ECC Deprecation in 2030 and Disallowance in 2035

NIST Internal Report (IR) 8547 sets out how the United States federal government plans to move from today's public-key algorithms to post-quantum cryptography (PQC). It names dates when RSA and elliptic curve algorithms become deprecated and then disallowed. This article explains the timeline, what it covers, and how organizations can plan. It is written for security leaders, PKI and HSM owners, and compliance teams.

## Key takeaways

- NIST published IR 8547 as an Initial Public Draft in November 2024. As of October 2026 it remains a draft, but it is widely used as the planning baseline.
- Quantum-vulnerable algorithms that provide 112 bits of security (for example RSA-2048) are deprecated after 2030.
- All quantum-vulnerable public-key algorithms (RSA, ECDSA, EdDSA, Diffie-Hellman, and ECDH) are disallowed after 2035, at every key size.
- Replacements are ML-KEM (FIPS 203) for key establishment and ML-DSA (FIPS 204), SLH-DSA (FIPS 205), LMS, and XMSS for signatures.
- Symmetric algorithms such as AES are not removed. AES-128, AES-192, and AES-256 remain acceptable.
- Migration takes many years, so inventory and planning should start now.

## What is NIST IR 8547?

NIST IR 8547, "Transition to Post-Quantum Cryptography Standards," explains how NIST expects federal agencies and their suppliers to retire classical public-key algorithms. It builds on the August 2024 release of the first three PQC standards and links to the algorithm transition rules in NIST Special Publication (SP) 800-131A.

The report matters well beyond government. Many industries follow NIST guidance, and product vendors align their roadmaps to these dates.

## What do "deprecated" and "disallowed" mean?

| Term | Meaning in NIST guidance |
|---|---|
| Acceptable | Approved for use with no known security risk at this time |
| Deprecated | Still allowed, but the user must accept some risk. Organizations should be actively moving away. |
| Disallowed | No longer allowed for the stated purpose in systems that follow NIST guidance |

## What is the NIST IR 8547 timeline?

### Digital signatures

| Algorithm | Parameters | Status after 2030 | Status after 2035 |
|---|---|---|---|
| ECDSA (FIPS 186-5) | 112-bit security | Deprecated | Disallowed |
| ECDSA | 128-bit security or more (for example P-256, P-384) | Acceptable | Disallowed |
| EdDSA (FIPS 186-5) | 128-bit security or more (Ed25519, Ed448) | Acceptable | Disallowed |
| RSA (FIPS 186-5) | 112-bit security (RSA-2048) | Deprecated | Disallowed |
| RSA | 128-bit security or more (RSA-3072 and larger) | Acceptable | Disallowed |

### Key establishment

| Algorithm | Parameters | Status after 2030 | Status after 2035 |
|---|---|---|---|
| Finite field DH and MQV (SP 800-56A) | 112-bit security | Deprecated | Disallowed |
| Finite field DH and MQV | 128-bit security or more | Acceptable | Disallowed |
| ECDH and ECMQV (SP 800-56A) | 112-bit security | Deprecated | Disallowed |
| ECDH and ECMQV | 128-bit security or more | Acceptable | Disallowed |
| RSA key transport (SP 800-56B) | 112-bit security | Deprecated | Disallowed |
| RSA key transport | 128-bit security or more | Acceptable | Disallowed |

> **Note:** The draft states that dates may be adjusted for specific uses. Check the final version of IR 8547 and SP 800-131A when they are published.

## Why 2030 and 2035?

The dates balance two pressures. A Cryptographically Relevant Quantum Computer (CRQC) could break RSA and elliptic curve cryptography with Shor's algorithm. Nobody knows exactly when one will exist, but data with a long confidentiality life is already at risk from "harvest now, decrypt later" attacks. At the same time, replacing cryptography across every system takes many years. The 2035 date also matches the goal in U.S. National Security Memorandum 10 (NSM-10) to move federal systems to quantum-resistant cryptography by 2035.

## What replaces RSA and ECC?

| Use | Replacement | Standard |
|---|---|---|
| Key establishment | ML-KEM-512, ML-KEM-768, ML-KEM-1024 | FIPS 203 |
| General digital signatures | ML-DSA-44, ML-DSA-65, ML-DSA-87 | FIPS 204 |
| Conservative hash-based signatures | SLH-DSA | FIPS 205 |
| Firmware and software signing | LMS, XMSS (stateful hash-based) | SP 800-208 |
| Compact signatures (planned) | FN-DSA | FIPS 206 (draft) |

See [NIST FIPS 203, 204, and 205 explained](nist-fips-203-204-205-explained.md) for details.

## Does IR 8547 affect symmetric encryption and hashing?

Only lightly. Grover's algorithm gives a quantum computer a smaller speed-up against symmetric keys. NIST keeps AES-128, AES-192, and AES-256 and the SHA-2 and SHA-3 hash families as acceptable. Organizations following the National Security Agency (NSA) CNSA 2.0 suite should use AES-256 and SHA-384 or SHA-512. See [CNSA 2.0 timeline and requirements](cnsa-2-0-timeline-and-requirements.md).

## How should organizations plan for 2030 and 2035?

1. **Build a cryptographic inventory.** Find every use of RSA, ECDSA, ECDH, and DH in applications, PKI, HSMs, network devices, and cloud services. A Cryptographic Bill of Materials (CBOM) is the standard way to record this.
2. **Rank by risk.** Systems that protect long-lived secrets or have long replacement cycles come first.
3. **Retire 112-bit algorithms early.** Move RSA-2048 to RSA-3072 or larger, or straight to PQC, where 2030 deprecation would matter.
4. **Check vendors.** Ask HSM, CA, and application vendors for PQC roadmaps and FIPS 140-3 validation plans.
5. **Pilot hybrid approaches.** Use hybrid TLS key exchange and test ML-DSA in private PKI.
6. **Build crypto agility.** Design so algorithms can change through configuration instead of code rewrites.

## How EC can help

- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): finds quantum-vulnerable algorithms across code, keystores, HSMs, and cloud.
- [Using CBOM Secure for PQC readiness](../01-Products/CBOM-Secure/using-cbom-secure-for-pqc-readiness.md): turn findings into a plan.
- [Building a PQC migration roadmap](../02-General/Post-Quantum-Cryptography/building-a-pqc-migration-roadmap.md): a phased approach.
- [PQC advisory and readiness assessment](../03-Services/pqc-advisory-and-readiness-assessment.md): expert support aligned with NIST timelines.
- [PQC readiness checklist 2026](pqc-readiness-checklist-2026.md): a practical starting list.

## Frequently asked questions

### Is NIST IR 8547 final?

No. As of October 2026, IR 8547 is still an Initial Public Draft published in November 2024. Many organizations already use its dates for planning.

### Is RSA-2048 banned in 2030?

Not banned. RSA-2048 becomes deprecated after 2030, which means it can still be used with accepted risk. It becomes disallowed after 2035, along with all other RSA key sizes.

### Is ECDSA P-256 still allowed after 2030?

Yes. P-256 gives 128-bit classical security and stays acceptable until 2035, when all quantum-vulnerable algorithms become disallowed.

### Does IR 8547 apply to private companies?

It is written for federal systems and suppliers. However, regulators, auditors, and vendors often adopt NIST guidance, so the dates affect most industries in practice.

### Is AES-128 disallowed by IR 8547?

No. AES-128, AES-192, and AES-256 remain acceptable. Some frameworks, such as CNSA 2.0, require AES-256.
