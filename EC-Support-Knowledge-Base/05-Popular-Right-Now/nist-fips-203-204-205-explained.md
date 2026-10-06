---
title: "NIST FIPS 203, 204, and 205 Explained: ML-KEM, ML-DSA, and SLH-DSA"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Concept"
applies_to: "Post-quantum cryptography, TLS, PKI, code signing, HSMs, application developers"
summary: "Plain-language guide to NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (SLH-DSA): what each does, parameter sets, sizes, and when to use them."
keywords: ["FIPS 203", "FIPS 204", "FIPS 205", "ML-KEM", "ML-DSA", "SLH-DSA", "NIST PQC standards"]
primary_keyword: "FIPS 203 204 205"
secondary_keywords: ["ML-KEM explained", "ML-DSA explained", "SLH-DSA explained", "NIST post-quantum standards", "Kyber Dilithium SPHINCS+", "FIPS 206 FN-DSA", "PQC parameter sets"]
last_reviewed: "2026-10-06"
---

# NIST FIPS 203, 204, and 205 Explained: ML-KEM, ML-DSA, and SLH-DSA

On August 13, 2024, the National Institute of Standards and Technology (NIST) published its first three post-quantum cryptography (PQC) standards: FIPS 203, FIPS 204, and FIPS 205. These algorithms are designed to stay secure even against large quantum computers. This article explains what each standard does, how they differ, and where each fits. It is written for architects, developers, and PKI and HSM teams.

## Key takeaways

- FIPS 203 defines ML-KEM, a key encapsulation mechanism for setting up shared secret keys. It was based on CRYSTALS-Kyber.
- FIPS 204 defines ML-DSA, the main general-purpose digital signature. It was based on CRYSTALS-Dilithium.
- FIPS 205 defines SLH-DSA, a hash-based signature with conservative security but larger signatures. It was based on SPHINCS+.
- All three were finalized on August 13, 2024 and are approved for use now.
- FIPS 206 (FN-DSA, based on Falcon) is still a draft as of October 2026. HQC was selected in March 2025 as a backup key encapsulation mechanism.
- PQC keys and signatures are much larger than RSA and elliptic curve equivalents, which affects protocols, storage, and hardware.

## Why did NIST create new standards?

Today's public-key algorithms, RSA and Elliptic Curve Cryptography (ECC), rely on math problems that a large quantum computer could solve with Shor's algorithm. NIST ran an open competition from 2016 to select replacements. The winners rely on different math, such as lattices and hash functions, that has no known efficient quantum attack.

## What is FIPS 203 (ML-KEM)?

The Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM) lets two parties agree on a shared secret over an open network. That secret then keys a symmetric cipher such as AES. It replaces Diffie-Hellman, ECDH, and RSA key transport.

| Parameter set | NIST security category | Encapsulation key | Ciphertext | Shared secret |
|---|---|---|---|---|
| ML-KEM-512 | 1 | 800 bytes | 768 bytes | 32 bytes |
| ML-KEM-768 | 3 | 1,184 bytes | 1,088 bytes | 32 bytes |
| ML-KEM-1024 | 5 | 1,568 bytes | 1,568 bytes | 32 bytes |

ML-KEM-768 is the common default, for example in the X25519MLKEM768 TLS hybrid used by Chrome. ML-KEM-1024 is required by the NSA CNSA 2.0 suite.

## What is FIPS 204 (ML-DSA)?

The Module-Lattice-Based Digital Signature Algorithm (ML-DSA) is the main replacement for RSA and ECDSA signatures. It is fast for both signing and verification and fits most uses: certificates, documents, code, and authentication.

| Parameter set | NIST security category | Public key | Signature |
|---|---|---|---|
| ML-DSA-44 | 2 | 1,312 bytes | 2,420 bytes |
| ML-DSA-65 | 3 | 1,952 bytes | 3,309 bytes |
| ML-DSA-87 | 5 | 2,592 bytes | 4,627 bytes |

For comparison, an ECDSA P-256 signature is about 64 bytes and an RSA-3072 signature is 384 bytes.

## What is FIPS 205 (SLH-DSA)?

The Stateless Hash-Based Digital Signature Algorithm (SLH-DSA) relies only on the security of hash functions. That makes its security very well understood, which is why it is a strong backup if a weakness is ever found in lattices. The trade-off is size and speed.

- There are 12 parameter sets, using SHA-2 or SHAKE, at three security levels (128, 192, and 256 bits).
- "s" variants give smaller signatures but slower signing. "f" variants sign faster but produce larger signatures.
- Public keys are tiny (32 to 64 bytes), but signatures range from about 7.8 KB to about 50 KB.

SLH-DSA suits long-lived roots of trust and uses where signing is infrequent.

## How do FIPS 203, 204, and 205 compare?

| Feature | FIPS 203 ML-KEM | FIPS 204 ML-DSA | FIPS 205 SLH-DSA |
|---|---|---|---|
| Purpose | Key establishment | Digital signatures | Digital signatures |
| Math basis | Module lattices | Module lattices | Hash functions |
| Former name | CRYSTALS-Kyber | CRYSTALS-Dilithium | SPHINCS+ |
| Replaces | ECDH, DH, RSA key transport | RSA and ECDSA signatures | RSA and ECDSA signatures |
| Size | Moderate | Moderate | Small keys, large signatures |
| Speed | Very fast | Fast | Slow signing |
| Typical use | TLS, VPN, key wrapping | Certificates, code, documents | Root CAs, firmware, backup option |

## What about FIPS 206, HQC, LMS, and XMSS?

- **FIPS 206 (FN-DSA):** based on Falcon, with smaller signatures than ML-DSA. NIST submitted the draft for approval in August 2025. As of October 2026 it is not yet final.
- **HQC:** a code-based key encapsulation mechanism selected on March 11, 2025 as a backup to ML-KEM. NIST plans a draft standard first, with a final standard expected around 2027.
- **LMS and XMSS:** stateful hash-based signatures defined in NIST SP 800-208. They are approved now and required by CNSA 2.0 for firmware and software signing. They need careful state management, usually inside a Hardware Security Module (HSM).

## How should organizations start using these standards?

1. **Inventory current cryptography** to find RSA and ECC usage.
2. **Use hybrid key exchange first.** Enable X25519MLKEM768 in TLS to address "harvest now, decrypt later" risk.
3. **Test ML-DSA in private PKI** and in code signing pipelines in a lab.
4. **Check hardware.** HSMs need firmware with ML-KEM and ML-DSA support and FIPS 140-3 validation.
5. **Plan for larger data.** Review certificate size limits, database fields, and network packet assumptions.

> **Tip:** OpenSSL 3.5 and later includes native ML-KEM, ML-DSA, and SLH-DSA, which makes lab testing easier.

## How EC can help

- [NIST PQC standards: ML-KEM, ML-DSA, SLH-DSA](../02-General/Post-Quantum-Cryptography/nist-pqc-standards-ml-kem-ml-dsa-slh-dsa.md): deeper technical reference.
- [Testing PQC algorithms in a lab](../02-General/Post-Quantum-Cryptography/testing-pqc-algorithms-in-a-lab.md): hands-on steps with OpenSSL 3.5.
- [PQC readiness for PKI and HSM](../02-General/Post-Quantum-Cryptography/pqc-readiness-for-pki-and-hsm.md): what to check in CAs and HSMs.
- [CodeSign Secure overview](../01-Products/CodeSign-Secure/codesign-secure-overview.md): HSM-backed signing that supports crypto agility.
- [PQC advisory and readiness assessment](../03-Services/pqc-advisory-and-readiness-assessment.md): help selecting algorithms and parameter sets.

## Frequently asked questions

### What is the difference between FIPS 203 and FIPS 204?

FIPS 203 (ML-KEM) is for agreeing on secret keys. FIPS 204 (ML-DSA) is for digital signatures. Most systems need both.

### Is Kyber the same as ML-KEM?

ML-KEM is the standardized version of CRYSTALS-Kyber. NIST made small changes during standardization, so implementations of the older Kyber drafts do not interoperate with ML-KEM.

### Which ML-DSA parameter set should be used?

ML-DSA-65 is a common general choice. ML-DSA-87 is required for national security systems under CNSA 2.0. ML-DSA-44 gives the smallest size at a lower security category.

### When should SLH-DSA be used instead of ML-DSA?

Use SLH-DSA where very conservative security matters more than size or speed, such as long-lived root keys or firmware that is signed rarely.

### Are FIPS 203, 204, and 205 approved for production use?

Yes. All three became final on August 13, 2024. Products also need FIPS 140-3 module validation for use in regulated environments.
