---
title: "NIST SP 800-57 Key Management Guidelines: Cryptoperiods, Key States, and Revision 6"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "Key management programs, PKI, HSMs, KMS, compliance (PCI DSS, FIPS, SOC 2, ISO 27001)"
summary: "NIST SP 800-57 explained: the three parts, recommended cryptoperiods, key states, security strength tables, and what the December 2025 Revision 6 draft changes."
keywords: ["NIST SP 800-57", "key management guidelines", "cryptoperiod", "key lifecycle", "security strength", "SP 800-57 Rev 6"]
primary_keyword: "NIST SP 800-57"
secondary_keywords: ["SP 800-57 cryptoperiods", "NIST key management recommendations", "key lifecycle states", "SP 800-57 Part 1 Revision 6", "security strength equivalence table", "key management policy"]
last_reviewed: "2026-10-06"
---

# NIST SP 800-57 Key Management Guidelines: Cryptoperiods, Key States, and Revision 6

NIST Special Publication (SP) 800-57, "Recommendation for Key Management," is the most widely used reference for managing cryptographic keys. Auditors, standards such as PCI DSS, and internal policies often point to it for cryptoperiods, key states, and algorithm strength. This article summarizes what it covers and what the Revision 6 draft changes. It is written for security architects, PKI and HSM teams, and compliance staff.

## Key takeaways

- SP 800-57 has three parts: Part 1 (general guidance), Part 2 (best practices for organizations), and Part 3 (application-specific guidance).
- Part 1 Revision 5 (May 2020) is the current final version. Revision 6 was released as an Initial Public Draft on December 5, 2025, with comments closed on February 5, 2026.
- The guidance defines a cryptoperiod for each key type, for example 1 to 3 years for a private signature key.
- Keys move through defined states: pre-activation, active, suspended, deactivated, compromised, and destroyed.
- Security strength tables show equivalent key sizes, for example RSA-3072 and ECC P-256 both give 128 bits of security.
- Revision 6 adds post-quantum algorithms (FIPS 203, 204, 205) and Ascon, and moves algorithm approval dates to SP 800-131A.

## What is NIST SP 800-57?

SP 800-57 gives practical recommendations for the whole lifecycle of cryptographic keys: generation, distribution, storage, use, backup, archiving, and destruction. It does not mandate a product or tool. It sets out principles that organizations turn into policy.

| Part | Title | Latest final | Focus |
|---|---|---|---|
| Part 1 | General | Revision 5, May 2020 (Revision 6 in draft) | Key types, cryptoperiods, key states, security strength |
| Part 2 | Best Practices for Key Management Organizations | Revision 1, May 2019 | Policies, roles, key management infrastructure |
| Part 3 | Application-Specific Key Management Guidance | Revision 1, January 2015 | PKI, IPsec, TLS, S/MIME, Kerberos, DNSSEC, and more |

## What is a cryptoperiod?

A cryptoperiod is the time a key is authorized for use. Limiting it reduces the amount of data exposed if a key is compromised and limits the time available for attacks. SP 800-57 separates the originator usage period (when a key can protect new data) from the recipient usage period (when it can still be used to process protected data, for example to decrypt).

## What cryptoperiods does SP 800-57 recommend?

Selected recommendations from Part 1 Revision 5:

| Key type | Suggested cryptoperiod |
|---|---|
| Private signature key | 1 to 3 years |
| Public signature verification key | Several years, depending on key size |
| Private authentication key | 1 to 2 years |
| Symmetric data encryption key | Up to 2 years for originator use, up to 3 more years for recipient use |
| Symmetric key wrapping key | Up to 2 years for originator use, up to 3 more years for recipient use |
| Symmetric master key | About 1 year |
| Private key transport key | Up to 2 years |
| Private and public static key agreement keys | 1 to 2 years |

> **Note:** These are starting points. The document lists risk factors (data volume, key exposure, environment, and the cost of rekeying) that can justify shorter or longer periods.

## What are the key states in SP 800-57?

| State | Meaning |
|---|---|
| Pre-activation | Key exists but is not yet authorized for use |
| Active | Key may be used to protect and process data |
| Suspended | Use is temporarily paused, for example during an investigation |
| Deactivated | Key must not protect new data, but may process existing data, such as decryption or signature verification |
| Compromised | Key is known or suspected to be exposed; use only to process data under strict control |
| Destroyed | Key material is removed; metadata may remain for audit |

Mapping these states into a key management system or HSM policy gives auditors clear evidence of control.

## What are the security strength equivalents?

| Security strength | Symmetric | RSA or finite field | Elliptic curve |
|---|---|---|---|
| 112 bits | (3TDEA, now disallowed for encryption) | 2048 bits | 224 to 255 bits |
| 128 bits | AES-128 | 3072 bits | 256 to 383 bits (for example P-256) |
| 192 bits | AES-192 | 7680 bits | 384 to 511 bits (for example P-384) |
| 256 bits | AES-256 | 15360 bits | 512 bits or more (for example P-521) |

These values cover classical attacks only. RSA and elliptic curve algorithms of every size are vulnerable to a future quantum computer, which is why NIST plans to disallow them after 2035. See [NIST IR 8547 deprecation timeline](nist-ir-8547-quantum-vulnerable-algorithm-deprecation-2030-2035.md).

## What changes in SP 800-57 Part 1 Revision 6?

The December 2025 draft makes these main changes:

1. Adds quantum-resistant algorithms from FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA), plus Ascon lightweight cryptography from SP 800-232.
2. Includes the PQC security categories alongside the classical security strengths.
3. Separates keys used for key establishment from keys used for key storage.
4. Removes algorithm approval timeframes from SP 800-57 and refers to SP 800-131A instead.
5. Adds a new section on mechanisms for storing keying material.

> **Note:** Revision 6 is still a draft as of October 2026. Use Revision 5 for formal compliance until the final version is published, and watch csrc.nist.gov for updates.

## How to apply SP 800-57 in practice

1. **Write a key management policy** that names key types, owners, cryptoperiods, and approved algorithms.
2. **Inventory keys** across HSMs, key managers, cloud KMS, and applications.
3. **Protect high-value keys in hardware,** such as FIPS 140-3 validated HSMs.
4. **Automate rotation** where possible, and track keys that are past their cryptoperiod.
5. **Use separation of duties and quorum** for root and master keys.
6. **Plan backup, archive, and destruction** with records for audit.
7. **Prepare for PQC** by adding ML-KEM and ML-DSA to the approved algorithm list and building crypto agility.

## How EC can help

- [HSM-as-a-Service overview](../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md): FIPS 140-3 key protection with managed lifecycle.
- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): inventory keys and algorithms against policy.
- [Compliance advisory services](../03-Services/compliance-advisory-services.md): map SP 800-57 to PCI DSS, ISO 27001, and other frameworks.
- [Encryption assessment](../03-Services/encryption-assessment.md): review current key management practices.
- [Key ceremonies explained](../02-General/HSM/key-ceremonies-explained.md): controlled generation of high-value keys.

## Frequently asked questions

### What is the latest version of NIST SP 800-57 Part 1?

Revision 5, published in May 2020, is the latest final version. Revision 6 was published as an Initial Public Draft on December 5, 2025.

### What cryptoperiod does NIST recommend for a private signing key?

SP 800-57 suggests 1 to 3 years for a private signature key, adjusted for risk factors.

### Does SP 800-57 require HSMs?

No. It recommends strong protection based on risk. In practice, HSMs are the usual way to meet its guidance for high-value keys.

### Is SP 800-57 mandatory?

It is mandatory for U.S. federal agencies through related policy. For others it is voluntary, but frameworks such as PCI DSS reference it and auditors widely use it.

### Does SP 800-57 cover post-quantum algorithms?

Revision 5 does not. The Revision 6 draft adds ML-KEM, ML-DSA, and SLH-DSA.
