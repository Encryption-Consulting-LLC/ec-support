---
title: "What Is Post-Quantum Cryptography?"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "Concept"
applies_to: "All organizations that use public key cryptography: PKI, TLS, code signing, VPN, SSH, HSMs"
summary: "Plain-language introduction to post-quantum cryptography (PQC): why quantum computers threaten RSA and ECC, what replaces them, and where to start."
keywords: ["post-quantum cryptography", "PQC", "quantum computing", "Shor's algorithm", "harvest now decrypt later", "ML-KEM", "ML-DSA"]
last_reviewed: "2026-10-06"
---

# What Is Post-Quantum Cryptography?

Post-quantum cryptography (PQC) is a set of public key algorithms designed to stay secure even against a large quantum computer. This article explains the quantum threat, what PQC changes, and what organizations should do first. It is written for security leaders, PKI and HSM administrators, and architects who are new to the topic.

## What it is

Most of today's secure systems rely on two families of public key algorithms:

- **RSA** (Rivest, Shamir, Adleman), used for signatures and key transport.
- **Elliptic Curve Cryptography (ECC)**, such as Elliptic Curve Digital Signature Algorithm (ECDSA) and Elliptic Curve Diffie-Hellman (ECDH), used for signatures and key exchange.

Both rest on math problems (factoring large numbers and computing discrete logarithms) that classical computers cannot solve in practical time. A large, error-corrected quantum computer running Shor's algorithm could solve them quickly. Such a machine is often called a Cryptographically Relevant Quantum Computer (CRQC).

PQC algorithms are built on different math problems, such as structured lattices and hash functions, for which no efficient quantum attack is known. They run on ordinary computers and ordinary hardware. No quantum equipment is needed to use them.

> **Note:** PQC is not the same as quantum key distribution (QKD). QKD uses physics and special hardware to share keys. PQC is software and firmware math that runs on existing systems.

## Why it matters

### Harvest now, decrypt later

An attacker can record encrypted traffic today and store it. When a CRQC exists, the attacker can break the recorded key exchange and read the data. Any data that must stay secret for many years (health records, trade secrets, government data, long-term financial records) is already at risk. See [Harvest now, decrypt later explained](../../05-Popular-Right-Now/harvest-now-decrypt-later-explained.md).

### Trust now, forge later

Signatures face a different risk. Once a CRQC exists, an attacker could forge signatures made with RSA or ECDSA keys. This affects root Certificate Authorities (CAs), firmware signing keys, and code signing keys that have long lives and are hard to replace.

### Deadlines are already set

- The US National Institute of Standards and Technology (NIST) published the first PQC standards in August 2024: FIPS 203 (ML-KEM), FIPS 204 (ML-DSA) and FIPS 205 (SLH-DSA).
- NIST IR 8547 (draft) proposes that quantum-vulnerable algorithms such as RSA, ECDSA and ECDH be deprecated after 2030 and disallowed after 2035.
- The US National Security Agency (NSA) Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) requires new National Security System (NSS) acquisitions to be CNSA 2.0 compliant from January 1, 2027, and all NSS to be quantum resistant by 2035.

### Migration is slow

Replacing algorithms touches CAs, HSMs, applications, network devices, partner integrations and embedded devices. Large organizations have historically needed 5 to 10 years for major cryptographic changes, such as the move from SHA-1 to SHA-2.

## How it works

The PQC transition follows a simple pattern:

1. **Key exchange moves first.** Key Encapsulation Mechanisms (KEMs) such as ML-KEM replace ECDH and RSA key transport. This blocks harvest now, decrypt later attacks. Hybrid modes combine a classical algorithm with ML-KEM so that security holds if either one stays strong. For example, Chrome has used the hybrid X25519MLKEM768 key exchange by default since Chrome 131 (November 2024).
2. **Signatures follow.** ML-DSA, SLH-DSA, and stateful hash-based signatures (LMS and XMSS) replace RSA and ECDSA signatures in certificates, code signing and firmware signing.
3. **Symmetric algorithms mostly stay.** Grover's algorithm only weakens symmetric ciphers and hashes by about half their bit strength. AES-256 and SHA-384 or SHA-512 remain strong. CNSA 2.0 requires AES-256 and SHA-384 or SHA-512.
4. **Infrastructure is upgraded.** CAs, HSMs, TLS libraries, and protocols must support the new algorithms and their larger keys and signatures.

### What changes in practice

| Item | Classical example | PQC example | Practical effect |
|---|---|---|---|
| Key exchange | ECDH P-256 (64 byte public key) | ML-KEM-768 (1,184 byte public key) | Larger TLS handshakes |
| Signature | ECDSA P-256 (about 64 byte signature) | ML-DSA-65 (3,309 byte signature) | Larger certificates and chains |
| Hash-based signature | Not applicable | SLH-DSA-SHA2-128s (7,856 byte signature) | Very small keys, large and slow signatures |

## Key terms

| Term | Meaning |
|---|---|
| CRQC | Cryptographically Relevant Quantum Computer: a quantum computer able to break RSA or ECC in practice |
| KEM | Key Encapsulation Mechanism: a method to agree on a shared secret key |
| ML-KEM | Module-Lattice-Based KEM (FIPS 203), formerly CRYSTALS-Kyber |
| ML-DSA | Module-Lattice-Based Digital Signature Algorithm (FIPS 204), formerly CRYSTALS-Dilithium |
| SLH-DSA | Stateless Hash-Based Digital Signature Algorithm (FIPS 205), formerly SPHINCS+ |
| Hybrid | Using a classical and a PQC algorithm together in one operation |
| Crypto-agility | The ability to swap algorithms quickly without redesigning systems |
| CBOM | Cryptographic Bill of Materials: an inventory of cryptographic assets |

## Common questions

### Is a quantum computer able to break RSA today?

No public quantum computer can do so today. Estimates of when a CRQC may appear vary widely. Because data recorded today can be decrypted later, the timeline of the data matters more than the exact arrival date. See [Quantum risk assessment and Mosca's theorem](quantum-risk-assessment-and-moscas-theorem.md).

### Is AES broken by quantum computers?

No. AES-128 is weakened, which is why AES-256 is recommended for long-term protection. AES-256 is considered quantum safe.

### Where should an organization start?

Start with an inventory. An organization cannot migrate cryptography it cannot see. A Cryptographic Bill of Materials (CBOM) shows where each algorithm and key is used. See [What is a CBOM?](../CBOM/what-is-a-cbom.md) and [PQC maturity model](pqc-maturity-model.md).

### Does PQC need new hardware?

Often not for servers and clients, because PQC runs in software. HSMs usually need firmware that supports the new algorithms. Embedded and Internet of Things (IoT) devices with small memory may need hardware refresh. See [PQC readiness for PKI and HSM](pqc-readiness-for-pki-and-hsm.md).

## Related articles

- [NIST PQC standards: ML-KEM, ML-DSA and SLH-DSA](nist-pqc-standards-ml-kem-ml-dsa-slh-dsa.md)
- [PQC maturity model](pqc-maturity-model.md)
- [Crypto-agility explained](crypto-agility-explained.md)
- [Building a PQC migration roadmap](building-a-pqc-migration-roadmap.md)
- [PQC Advisory and readiness assessment](../../03-Services/pqc-advisory-and-readiness-assessment.md)
- [NIST IR 8547: quantum-vulnerable algorithm deprecation](../../05-Popular-Right-Now/nist-ir-8547-quantum-vulnerable-algorithm-deprecation-2030-2035.md)
