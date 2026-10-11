---
title: "Hybrid and Composite Certificates"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "Concept"
applies_to: "PKI architects and administrators planning PQC certificates and hybrid TLS; IETF LAMPS and TLS drafts"
summary: "How hybrid key exchange, composite ML-DSA certificates, dual certificates and pure PQC certificates differ, with the IETF drafts and trade-offs for each."
keywords: ["hybrid certificates", "composite certificates", "composite ML-DSA", "X25519MLKEM768", "hybrid TLS", "PQC PKI"]
last_reviewed: "2026-10-06"
---

# Hybrid and Composite Certificates

During the move to post-quantum cryptography (PQC), many systems will run classical and PQC algorithms side by side. This article explains the main ways to do that: hybrid key exchange in TLS, composite certificates, dual certificate chains, alternative key extensions, and pure PQC certificates. It is for PKI architects and administrators who must choose an approach.

## What it is

"Hybrid" means using a classical algorithm (such as ECDH, RSA or ECDSA) together with a PQC algorithm (such as ML-KEM or ML-DSA). The goal is safety during the transition: if the new PQC algorithm turns out to have a flaw, the classical part still protects the data, and if a quantum computer breaks the classical part, the PQC part still holds.

There are two separate problems:

- **Key exchange** (confidentiality). This is solved mainly in the TLS protocol, not in certificates.
- **Authentication** (signatures). This needs changes to certificates and Certificate Authorities (CAs).

## Why it matters

- Key exchange protects against harvest now, decrypt later attacks, so it is urgent and already widely deployed.
- Certificates and signatures affect the whole trust chain (root CA, issuing CA, end entity and relying parties). Every client that validates a certificate must understand the new algorithm.
- The approach chosen affects compatibility, certificate size, CA software and HSM requirements.

## How it works

### 1. Hybrid key exchange in TLS 1.3

The client and server combine an Elliptic Curve Diffie-Hellman (ECDHE) share and an ML-KEM share into one key exchange "group". The final secret depends on both. The certificate does not change.

The IETF draft draft-ietf-tls-ecdhe-mlkem defines these groups:

| Group name | Classical part | PQC part |
|---|---|---|
| X25519MLKEM768 | X25519 | ML-KEM-768 |
| SecP256r1MLKEM768 | NIST P-256 | ML-KEM-768 |
| SecP384r1MLKEM1024 | NIST P-384 | ML-KEM-1024 |

X25519MLKEM768 is enabled by default in Chrome (since Chrome 131) and in OpenSSL 3.5 and later, and is supported by major Content Delivery Networks (CDNs). The general design is described in draft-ietf-tls-hybrid-design. A pure ML-KEM option (without a classical part) is described in draft-ietf-tls-mlkem.

> **Note:** IETF drafts change. Check the current status of each draft on datatracker.ietf.org before relying on code points in production.

### 2. Composite certificates

A composite certificate holds one public key that is really two keys (for example ML-DSA-65 plus ECDSA P-256) under a single algorithm identifier (OID). The CA signs it with a composite signature, which contains both signatures. A verifier must check both, and both must pass.

- Defined in draft-ietf-lamps-pq-composite-sigs (composite ML-DSA). A related draft, draft-ietf-lamps-pq-composite-kem, defines composite ML-KEM for encryption use.
- **Pros:** one certificate, one chain, no protocol change; security holds while either algorithm stays strong.
- **Cons:** clients that do not understand the composite OID cannot use the certificate at all. Certificates are larger. CA, HSM and library support is still growing.

### 3. Dual certificates (parallel chains)

The server holds two certificates: one classical, one PQC. The client and server negotiate which to use, for example through TLS signature algorithm negotiation.

- **Pros:** old clients keep working; new clients get PQC.
- **Cons:** two chains to issue, renew and monitor. Without careful policy, an attacker could force a downgrade to the classical chain. The IETF draft draft-ietf-lamps-cert-binding-for-multi-auth describes a way to link related certificates.

### 4. Alternative key extensions ("Catalyst" style)

The 2019 edition of ITU-T X.509 defines optional extensions that hold a second public key and a second CA signature inside one certificate. Legacy clients ignore the non-critical extensions and use the classical key. PQC-aware clients can use the second key.

- **Pros:** backward compatible.
- **Cons:** limited support in common libraries; the IETF has focused on composite and pure PQC approaches instead.

### 5. Pure PQC certificates

The certificate uses only ML-DSA (or SLH-DSA) for the subject key and the CA signature. The IETF LAMPS working group has specified algorithm identifiers for ML-DSA and SLH-DSA in X.509.

- **Pros:** simplest long-term end state.
- **Cons:** every relying party must support the algorithm; no fallback if the algorithm is weakened.

## Comparison

| Approach | Changes certificate | Backward compatible | Main use today |
|---|---|---|---|
| Hybrid TLS key exchange | No | Yes (negotiated) | Production web and API traffic |
| Composite | Yes | No | Closed ecosystems, high-assurance internal PKI pilots |
| Dual chains | Yes (two certs) | Yes | Transitional deployments with mixed clients |
| Alternative key extensions | Yes | Yes | Limited, vendor specific |
| Pure PQC | Yes | No | Internal PKI, IoT, code and firmware signing pilots |

## The public web is different

Google announced in February 2026 that Chrome will not add traditional PQC X.509 certificates to the Chrome Root Store. Instead Chrome plans a path based on Merkle Tree Certificates (MTC), with a Chrome Quantum-resistant Root Store (CQRS). Public TLS certificate plans should follow that program. Private PKI can move earlier because the organization controls both ends. See [Chrome quantum-safe HTTPS and Merkle Tree Certificates](../../05-Popular-Right-Now/chrome-quantum-safe-https-merkle-tree-certificates.md).

## Key terms

| Term | Meaning |
|---|---|
| Hybrid | Classical and PQC algorithms used together |
| Composite | One key or signature object made of two algorithms under one OID |
| OID | Object Identifier: a unique number that names an algorithm or extension |
| Downgrade attack | Forcing a connection to use a weaker option |
| MTC | Merkle Tree Certificates |

## Common questions

### Which approach should a private PKI start with?

Most organizations start with hybrid TLS key exchange (no PKI change), then build a test PQC or composite hierarchy in a lab. The choice for production depends on which clients must validate the certificates. EC PKI Services can help assess this. See [PKI design and implementation](../../03-Services/pki-design-and-implementation.md).

### Does Microsoft AD CS issue ML-DSA or composite certificates?

Verify against the Microsoft documentation for the installed Windows Server version. Support for PQC in AD CS, CNG and the Windows certificate stack is still evolving.

## Related articles

- [NIST PQC standards: ML-KEM, ML-DSA and SLH-DSA](nist-pqc-standards-ml-kem-ml-dsa-slh-dsa.md)
- [PQC readiness for PKI and HSM](pqc-readiness-for-pki-and-hsm.md)
- [Testing PQC algorithms in a lab](testing-pqc-algorithms-in-a-lab.md)
- [Chrome ML-KEM hybrid key exchange](../../05-Popular-Right-Now/chrome-ml-kem-hybrid-key-exchange.md)
- [PKI fundamentals](../PKI/pki-fundamentals.md)
