---
title: "Chrome Quantum-Safe HTTPS: Merkle Tree Certificates Explained"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Concept"
applies_to: "Public web PKI, Chrome, TLS server certificates, PQC planning"
summary: "How Chrome plans quantum-safe HTTPS with Merkle Tree Certificates (MTC), the 2026 to 2027 phases, the CQRS root store, and what it means for PKI teams."
keywords: ["Merkle Tree Certificates", "MTC", "quantum-safe HTTPS", "Chrome Quantum-resistant Root Store", "post-quantum certificates", "PLANTS"]
primary_keyword: "Merkle Tree Certificates"
secondary_keywords: ["Chrome quantum-safe HTTPS", "Chrome Quantum-resistant Root Store", "post-quantum TLS certificates", "MTC Cloudflare Chrome", "IETF PLANTS working group", "PQC web PKI"]
last_reviewed: "2026-10-06"
---

# Chrome Quantum-Safe HTTPS: Merkle Tree Certificates Explained

In February 2026, Google announced how Chrome plans to make HTTPS authentication safe against quantum computers. Instead of adding large post-quantum X.509 certificates to the Chrome Root Store, Chrome is building on Merkle Tree Certificates (MTC). This article explains what MTCs are, the published phases, and what PKI teams should do now. It is written for PKI architects, security leaders, and web operations teams.

## Key takeaways

- Google published the plan on February 27, 2026, on the Google Security Blog.
- Chrome has no immediate plan to add traditional X.509 certificates with post-quantum algorithms to the Chrome Root Store.
- Merkle Tree Certificates replace long chains of signatures with compact Merkle tree inclusion proofs.
- Phase 1 (underway) is a feasibility study with Cloudflare. Phase 2 (Q1 2027) invites Certificate Transparency (CT) log operators. Phase 3 (Q3 2027) finalizes requirements for a Chrome Quantum-resistant Root Store (CQRS).
- Post-quantum key exchange (ML-KEM) already protects Chrome traffic today. MTC addresses the separate problem of authentication.
- Chrome plans support for traditional post-quantum X.509 certificates in private PKIs only.

## Why does HTTPS need quantum-safe certificates?

A TLS connection uses cryptography for two jobs:

1. **Key exchange** keeps the session secret. Chrome already protects this with the hybrid X25519MLKEM768 algorithm. See [Chrome ML-KEM hybrid key exchange](chrome-ml-kem-hybrid-key-exchange.md).
2. **Authentication** proves the server is who it claims to be. Today this relies on RSA or Elliptic Curve Digital Signature Algorithm (ECDSA) signatures in certificates.

A large quantum computer running Shor's algorithm could forge RSA and ECDSA signatures. Authentication is not exposed to "harvest now, decrypt later" in the same way as key exchange, because a forged signature only helps an attacker at connection time. But the change takes years, so the work must start well before such a computer exists.

## Why not just put ML-DSA into normal certificates?

Post-quantum signatures are large. A typical TLS handshake carries several signatures and public keys: the leaf certificate, the intermediate CA certificate, signed certificate timestamps, and the handshake signature. Replacing each one with Module-Lattice-Based Digital Signature Algorithm (ML-DSA) values adds many kilobytes to every new connection. That slows page loads, especially on mobile networks, and can trigger problems with middleboxes.

| Item in handshake | Classical (ECDSA P-256) | Post-quantum (ML-DSA-44) |
|---|---|---|
| Public key | 64 bytes | 1,312 bytes |
| Signature | about 64 bytes | 2,420 bytes |

Sizes are from FIPS 186-5 and FIPS 204. A full chain multiplies these numbers several times.

## What are Merkle Tree Certificates?

A Merkle tree is a data structure where many items are hashed together, pair by pair, into a single root hash. Anyone can prove that one item is in the tree with a short list of hashes, called an inclusion proof.

With MTC:

1. A CA collects many certificate requests into a batch.
2. The CA builds a Merkle tree of the batch and signs only the tree, not each certificate.
3. The browser learns trusted tree heads in advance, through an update channel.
4. A server sends its certificate with a short inclusion proof, instead of a chain of signatures.
5. The browser checks the proof against a tree head it already trusts.

The result is that the security of the signature algorithm is separated from the size of the data sent in each handshake. A quantum-safe signature on the tree can be large, because it is not sent on every connection.

MTC is being standardized in the Internet Engineering Task Force (IETF) PKI, Logs, And Tree Certificates (PLANTS) working group.

## What is the Chrome MTC timeline?

| Phase | Timing | What happens |
|---|---|---|
| Phase 1 | Underway (announced February 2026) | Feasibility study with Cloudflare. MTC connections are backed by a traditional X.509 certificate as a failsafe. |
| Phase 2 | Q1 2027 | Chrome invites CT log operators to help bootstrap public MTCs. |
| Phase 3 | Q3 2027 | Chrome finalizes requirements for onboarding to the Chrome Quantum-resistant Root Store (CQRS) and adds downgrade protections. |

> **Note:** These dates come from Google's announcement and may change. Check the Chrome Root Program site for current requirements.

## What is the Chrome Quantum-resistant Root Store (CQRS)?

CQRS is a new, separate root store planned for quantum-resistant authentication. It will sit next to the existing Chrome Root Store. CAs that want to issue MTCs for Chrome will need to meet CQRS requirements, which Chrome plans to finalize in Phase 3. The Chrome Root Program Policy already references a draft Chrome Quantum-resistant Root Program.

## What should PKI teams do now?

MTCs are for the public web. Most organizations will consume them through their public CA and CLM tools. Useful steps today:

1. **Keep public certificate automation strong.** MTCs are designed for short-lived, automated issuance. Teams ready for 47-day certificates will be better placed.
2. **Build a cryptographic inventory.** Know where RSA and ECDSA are used across public and private PKI.
3. **Plan private PKI separately.** Chrome plans to support traditional post-quantum X.509 certificates for private PKIs. Internal CAs should test ML-DSA and hybrid certificates in a lab.
4. **Watch vendor roadmaps.** Load balancers, CDNs, and TLS libraries will need MTC support. Ask vendors about plans.
5. **Prioritize key exchange first.** Enable X25519MLKEM768 on servers to stop harvest now, decrypt later risk.

## How EC can help

- [PQC advisory and readiness assessment](../03-Services/pqc-advisory-and-readiness-assessment.md): a roadmap that covers public and private PKI.
- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): find every quantum-vulnerable algorithm in use.
- [Hybrid and composite certificates](../02-General/Post-Quantum-Cryptography/hybrid-and-composite-certificates.md): options for private PKI.
- [PQC readiness for PKI and HSM](../02-General/Post-Quantum-Cryptography/pqc-readiness-for-pki-and-hsm.md): what to check in CAs and HSMs.
- [47-day SSL/TLS certificate validity timeline](47-day-ssl-tls-certificate-validity-timeline.md): automation that also prepares for MTC.

## Frequently asked questions

### What are Merkle Tree Certificates in simple terms?

They are certificates proven by a short membership proof in a CA-signed Merkle tree, instead of by a full chain of signatures. This keeps TLS handshakes small even when the CA uses large post-quantum signatures.

### Will Chrome accept ML-DSA X.509 certificates on public websites?

Google said it has no immediate plan to add traditional X.509 certificates with post-quantum cryptography to the Chrome Root Store. Its plan for the public web is MTC. Support for traditional post-quantum X.509 certificates is planned for private PKIs.

### When will Merkle Tree Certificates be available?

Phase 1 testing with Cloudflare is underway. CT log operators are invited in Q1 2027 and CQRS onboarding requirements are planned for Q3 2027. Broad availability will follow those phases.

### Does MTC replace ML-KEM key exchange?

No. ML-KEM hybrid key exchange protects confidentiality and is already on by default in Chrome. MTC addresses authentication.

### Do internal certificates need to change because of MTC?

Not directly. MTC targets public web PKI. Internal PKI still needs its own post-quantum plan, such as ML-DSA or hybrid certificates.
