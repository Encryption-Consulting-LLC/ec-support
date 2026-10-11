---
title: "Crypto-Agility Explained"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "Concept"
applies_to: "Application, PKI, HSM and platform teams designing systems that must survive algorithm changes"
summary: "What crypto-agility means, why it shortens PQC migration, and the design patterns that let organizations change algorithms by policy instead of by rewrite."
keywords: ["crypto-agility", "cryptographic agility", "PQC migration", "algorithm agility", "crypto policy", "CBOM"]
last_reviewed: "2026-10-06"
---

# Crypto-Agility Explained

Crypto-agility is the ability to change cryptographic algorithms, keys, and parameters quickly and safely, without redesigning the systems that use them. It is the end goal of a post-quantum cryptography (PQC) program. This article explains the idea, why it matters, and the practical patterns that make systems agile.

## What it is

A crypto-agile organization can answer three questions at any time:

1. **Where is cryptography used?** (inventory)
2. **What should be used?** (policy)
3. **How fast can it change?** (mechanism)

Agility is not a single product. It is a mix of architecture, process and tools. NIST discusses the topic in its crypto-agility guidance (NIST CSWP 39, "Considerations for Achieving Cryptographic Agility"); verify the current version on csrc.nist.gov.

## Why it matters

- **The PQC migration is not the last one.** New attacks can weaken algorithms, as happened with MD5, SHA-1 and 1024-bit RSA. NIST already selected a backup KEM (HQC) in case ML-KEM needs replacing.
- **Hard-coded crypto is expensive.** When an algorithm is written into source code, every change needs a code change, a test cycle and a release.
- **Short certificate lives demand automation.** Public TLS certificate validity falls to 200 days in March 2026, 100 days in March 2027 and 47 days in March 2029. Manual processes cannot keep up.
- **It lowers Y in Mosca's theorem.** Shorter migration time means fewer systems fall in the "act now" zone. See [Quantum risk assessment and Mosca's theorem](quantum-risk-assessment-and-moscas-theorem.md).

## How it works

1. **Discover.** Build and maintain a Cryptographic Bill of Materials (CBOM) of algorithms, keys, certificates, protocols and libraries.
2. **Define policy.** Publish a crypto policy that lists approved, deprecated and disallowed algorithms and key sizes, with dates.
3. **Abstract.** Applications call a crypto service or a well-maintained library through a stable interface. They do not name a specific algorithm in code.
4. **Centralize keys and certificates.** Keys live in HSMs or key managers. Certificates are issued and renewed by a Certificate Lifecycle Management (CLM) platform.
5. **Automate change.** Renewals, re-keys and algorithm changes are pushed by automation (ACME, CI/CD pipelines, configuration management).
6. **Verify.** Continuous scans compare the live estate against policy and flag drift.
7. **Rehearse.** Practice an algorithm change in a lab or pilot to prove it can be done in the target time.

### Design patterns

| Pattern | Description | Example |
|---|---|---|
| Configuration over code | Algorithm names live in configuration, not source | TLS groups set in a server config file |
| Crypto service layer | One internal service performs signing, encryption or key exchange | Central signing service backed by an HSM |
| Algorithm identifiers in data | Stored data records which algorithm protected it | Encrypted blobs carry an algorithm ID and key version |
| Negotiation | Protocols agree on algorithms at run time | TLS 1.3 supported groups and signature algorithms |
| Hybrid modes | Classical and PQC run together during transition | X25519MLKEM768 key exchange |
| Room for growth | Fields, buffers and databases allow larger keys and signatures | Allowing several kilobytes for an ML-DSA certificate chain |

## Common anti-patterns

- Algorithm names hard-coded in many services.
- Fixed-size database columns or packet fields that cannot hold PQC keys and signatures.
- Certificates installed by hand with no record of where they are.
- Libraries bundled inside applications and never updated.
- HSMs with firmware that is several years old.
- Vendor products with no PQC roadmap.

## Key terms

| Term | Meaning |
|---|---|
| Crypto policy | Rules on which algorithms and key sizes are allowed |
| CBOM | Cryptographic Bill of Materials |
| CLM | Certificate Lifecycle Management |
| Hybrid | Combining a classical and a PQC algorithm |
| Drift | Difference between the live estate and policy |

## Common questions

### Is crypto-agility only about PQC?

No. It helps with any change: deprecated hashes, weak key sizes, compromised CAs, or a CA distrust event. PQC is simply the largest change in decades.

### How do EC products support agility?

CBOM Secure provides the inventory and policy checks. CertSecure Manager automates certificate issuance and renewal. CodeSign Secure centralizes signing keys in HSMs. See [CBOM Secure overview](../../01-Products/CBOM-Secure/cbom-secure-overview.md) and [CertSecure Manager overview](../../01-Products/CertSecure-Manager/certsecure-manager-overview.md).

### How is agility measured?

Track the time needed to rotate a key, replace a certificate, or change an algorithm in a test system. Level 5 of the [PQC maturity model](pqc-maturity-model.md) sets a target time for such changes.

## Related articles

- [PQC maturity model](pqc-maturity-model.md)
- [How CBOM works](../CBOM/how-cbom-works.md)
- [Building a PQC migration roadmap](building-a-pqc-migration-roadmap.md)
- [Hybrid and composite certificates](hybrid-and-composite-certificates.md)
- [Certificate lifecycle management fundamentals](../Certificate-Lifecycle-Management/certificate-lifecycle-management-fundamentals.md)
