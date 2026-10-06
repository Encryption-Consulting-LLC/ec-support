---
title: "NIST PQC Standards: ML-KEM, ML-DSA and SLH-DSA"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "Reference"
applies_to: "FIPS 203, FIPS 204, FIPS 205, draft FIPS 206, NIST SP 800-208, NIST SP 800-227, HQC"
summary: "Reference guide to the NIST post-quantum standards: ML-KEM, ML-DSA, SLH-DSA, FN-DSA, HQC and LMS/XMSS, with parameter sets, sizes and use cases."
keywords: ["FIPS 203", "FIPS 204", "FIPS 205", "ML-KEM", "ML-DSA", "SLH-DSA", "FN-DSA", "HQC", "NIST PQC"]
last_reviewed: "2026-10-06"
---

# NIST PQC Standards: ML-KEM, ML-DSA and SLH-DSA

This article is a quick reference to the post-quantum cryptography (PQC) standards published by the US National Institute of Standards and Technology (NIST). It lists each algorithm, its parameter sets, key and signature sizes, and where it fits. It is for architects, PKI and HSM administrators, and developers choosing algorithms.

## Overview

NIST ran a public PQC competition from 2016. On August 13, 2024 it published the first three final standards. More are in progress.

| Standard | Algorithm | Former name | Type | Status (October 2026) |
|---|---|---|---|---|
| FIPS 203 | ML-KEM (Module-Lattice-Based Key Encapsulation Mechanism) | CRYSTALS-Kyber | Key establishment | Final, August 2024 |
| FIPS 204 | ML-DSA (Module-Lattice-Based Digital Signature Algorithm) | CRYSTALS-Dilithium | Digital signature | Final, August 2024 |
| FIPS 205 | SLH-DSA (Stateless Hash-Based Digital Signature Algorithm) | SPHINCS+ | Digital signature | Final, August 2024 |
| FIPS 206 | FN-DSA (FFT over NTRU-Lattice-Based Digital Signature Algorithm) | Falcon | Digital signature | Draft |
| To be assigned | HQC (Hamming Quasi-Cyclic) | HQC | Key establishment (backup to ML-KEM) | Selected March 11, 2025; draft standard expected |
| SP 800-208 | LMS and XMSS (stateful hash-based signatures) | Not applicable | Digital signature | Final, 2020 |
| SP 800-227 | Recommendations for KEMs | Not applicable | Guidance | Final, September 2025 |

> **Note:** Check csrc.nist.gov for the latest status of FIPS 206 and the HQC standard before making procurement decisions.

## Security categories

NIST rates PQC parameter sets by security category. Each category is compared to the effort of breaking a well-known symmetric primitive.

| Category | Comparable to |
|---|---|
| 1 | Key search on AES-128 |
| 2 | Collision search on SHA-256 |
| 3 | Key search on AES-192 |
| 4 | Collision search on SHA-384 |
| 5 | Key search on AES-256 |

## ML-KEM (FIPS 203)

ML-KEM lets two parties agree on a 32 byte shared secret. It replaces Elliptic Curve Diffie-Hellman (ECDH) and RSA key transport. It is the main defense against harvest now, decrypt later attacks.

| Parameter set | Category | Encapsulation key (public) | Ciphertext | Shared secret |
|---|---|---|---|---|
| ML-KEM-512 | 1 | 800 bytes | 768 bytes | 32 bytes |
| ML-KEM-768 | 3 | 1,184 bytes | 1,088 bytes | 32 bytes |
| ML-KEM-1024 | 5 | 1,568 bytes | 1,568 bytes | 32 bytes |

Typical uses:

- TLS 1.3 key exchange, usually in hybrid form such as X25519MLKEM768.
- Virtual Private Networks (VPNs), such as IKEv2 and IPsec.
- Key wrapping and hybrid public key encryption.
- CNSA 2.0 requires ML-KEM-1024 for National Security Systems.

> **Tip:** ML-KEM is a KEM, not a general encryption or key agreement primitive. Protocols must be designed around the encapsulate and decapsulate model. NIST SP 800-227 explains how to use KEMs safely.

## ML-DSA (FIPS 204)

ML-DSA is the general-purpose PQC signature algorithm. It is fast to sign and verify. Its keys and signatures are much larger than ECDSA.

| Parameter set | Category | Public key | Signature |
|---|---|---|---|
| ML-DSA-44 | 2 | 1,312 bytes | 2,420 bytes |
| ML-DSA-65 | 3 | 1,952 bytes | 3,309 bytes |
| ML-DSA-87 | 5 | 2,592 bytes | 4,627 bytes |

Typical uses: X.509 certificates, TLS authentication, document signing, code signing. CNSA 2.0 requires ML-DSA-87.

FIPS 204 also defines a pre-hash variant (HashML-DSA) for cases where the message must be hashed before signing, for example in some HSM workflows. The pure variant is preferred where possible.

## SLH-DSA (FIPS 205)

SLH-DSA relies only on the security of hash functions. This makes it a conservative choice if a weakness is ever found in lattice math. Public keys are tiny, but signatures are large and signing is slow.

FIPS 205 defines 12 parameter sets, built from three choices: hash family (SHA2 or SHAKE), security level (128, 192, or 256), and speed ("s" for small signatures, "f" for fast signing).

| Example parameter set | Category | Public key | Signature |
|---|---|---|---|
| SLH-DSA-SHA2-128s | 1 | 32 bytes | 7,856 bytes |
| SLH-DSA-SHA2-128f | 1 | 32 bytes | 17,088 bytes |
| SLH-DSA-SHA2-256s | 5 | 64 bytes | 29,792 bytes |
| SLH-DSA-SHA2-256f | 5 | 64 bytes | 49,856 bytes |

Typical uses: root CA keys, long-lived firmware signing, and any signature where signing is rare and long-term trust matters.

## Stateful hash-based signatures (LMS and XMSS)

Leighton-Micali Signatures (LMS) and the eXtended Merkle Signature Scheme (XMSS) are defined in RFC 8554, RFC 8391, and NIST SP 800-208. They are already approved and are required by CNSA 2.0 for software and firmware signing.

> **Warning:** LMS and XMSS are stateful. Each one-time key must never be reused. Reusing state breaks security. NIST SP 800-208 requires key generation and signing to happen inside a validated hardware cryptographic module. Plan HSM support and state backup rules carefully.

## FN-DSA and HQC

- **FN-DSA (draft FIPS 206):** a lattice signature with smaller signatures than ML-DSA. It is harder to implement safely because it uses floating-point math. It suits constrained protocols where signature size matters.
- **HQC:** a code-based KEM chosen as a backup to ML-KEM, so that a second, different math family is available.

## Choosing an algorithm

| Need | Common choice |
|---|---|
| TLS key exchange today | Hybrid X25519MLKEM768 |
| High-assurance or CNSA 2.0 key exchange | ML-KEM-1024 |
| General certificates and signing | ML-DSA-65 (or ML-DSA-87 for CNSA 2.0) |
| Root CA or very long-lived signatures | ML-DSA-87 or SLH-DSA |
| Firmware and software signing for NSS | LMS or XMSS (CNSA 2.0), or ML-DSA-87 |

## Common questions

### Are the new algorithms FIPS 140-3 validated?

The algorithms are approved. Each cryptographic module (for example an HSM or library) must still pass Cryptographic Algorithm Validation Program (CAVP) testing and Cryptographic Module Validation Program (CMVP) validation for its PQC implementation. Check the module's certificate on the NIST CMVP site.

### Should RSA and ECC be removed right away?

No. Hybrid deployments keep classical algorithms alongside PQC during the transition. NIST IR 8547 (draft) proposes deprecation after 2030 and disallowance after 2035.

## Related articles

- [What is post-quantum cryptography?](what-is-post-quantum-cryptography.md)
- [Hybrid and composite certificates](hybrid-and-composite-certificates.md)
- [Testing PQC algorithms in a lab](testing-pqc-algorithms-in-a-lab.md)
- [NIST FIPS 203, 204 and 205 explained](../../05-Popular-Right-Now/nist-fips-203-204-205-explained.md)
- [CNSA 2.0 timeline and requirements](../../05-Popular-Right-Now/cnsa-2-0-timeline-and-requirements.md)
