---
title: "Chrome ML-KEM Hybrid Key Exchange (X25519MLKEM768) Explained"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Concept"
applies_to: "Chrome, TLS 1.3 servers, load balancers, proxies, OpenSSL 3.5 and later, PQC planning"
summary: "What X25519MLKEM768 is, how Chrome uses ML-KEM hybrid key exchange by default, server and middlebox impacts, and how to enable and test it in TLS 1.3."
keywords: ["X25519MLKEM768", "ML-KEM", "hybrid key exchange", "post-quantum TLS", "Chrome", "TLS 1.3"]
primary_keyword: "X25519MLKEM768 hybrid key exchange"
secondary_keywords: ["Chrome ML-KEM", "post-quantum TLS 1.3", "ML-KEM-768 TLS", "Kyber to ML-KEM Chrome", "enable post-quantum key exchange server", "OpenSSL 3.5 ML-KEM"]
last_reviewed: "2026-10-06"
---

# Chrome ML-KEM Hybrid Key Exchange (X25519MLKEM768) Explained

Chrome protects most HTTPS connections with a post-quantum hybrid key exchange called X25519MLKEM768. It combines the classical X25519 algorithm with the Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM) from NIST FIPS 203. This article explains how it works, what changed in Chrome, and how server teams can enable and test it. It is written for web operations, network, and security engineers.

## Key takeaways

- Chrome has used X25519MLKEM768 by default since Chrome 131 (November 2024). It replaced the earlier pre-standard X25519Kyber768.
- The hybrid design is safe if either X25519 or ML-KEM-768 remains unbroken.
- It protects TLS 1.3 session keys against "harvest now, decrypt later" attacks.
- Servers must opt in. Supported stacks include OpenSSL 3.5 and later, BoringSSL, AWS-LC, Go 1.24 and later, and recent rustls.
- The larger client message (about 1.2 KB of key share) can break old middleboxes that expect a small ClientHello.
- Hybrid key exchange does not make certificates quantum-safe. Authentication is a separate project.

## What is X25519MLKEM768?

X25519MLKEM768 is a TLS 1.3 key exchange group. The client sends two public values in one key share: an X25519 public key and an ML-KEM-768 encapsulation key. The server answers with its X25519 public key and an ML-KEM ciphertext. Both sides then combine the two shared secrets into one session secret.

| Component | Client sends | Server sends |
|---|---|---|
| ML-KEM-768 | Encapsulation key, 1,184 bytes | Ciphertext, 1,088 bytes |
| X25519 | Public key, 32 bytes | Public key, 32 bytes |
| Total key share | 1,216 bytes | 1,120 bytes |

The TLS codepoint for X25519MLKEM768 is 0x11EC. The IETF TLS working group also defines SecP256r1MLKEM768 and SecP384r1MLKEM1024 for organizations that need NIST curves.

## Why use a hybrid instead of pure ML-KEM?

ML-KEM is new. A hybrid gives two layers:

1. If a future attack weakens ML-KEM, X25519 still protects the session against classical attackers.
2. If a quantum computer breaks X25519, ML-KEM still protects the session.

This is a low-risk way to gain quantum resistance now while confidence in the new algorithm grows.

## What is the timeline of post-quantum key exchange in Chrome?

| Date | Chrome version | Change |
|---|---|---|
| August 2023 | Chrome 116 | X25519Kyber768 available behind a flag |
| April 2024 | Chrome 124 | X25519Kyber768 enabled by default on desktop |
| August 13, 2024 | Not applicable | NIST publishes FIPS 203 (ML-KEM) as final |
| November 2024 | Chrome 131 | Switch to standard X25519MLKEM768 by default |

Other clients followed. Firefox enabled ML-KEM hybrid key exchange by default in late 2024, and Apple added support across its 2025 operating system releases. Cloudflare reported in October 2025 that most human-initiated TLS traffic to its network used hybrid post-quantum key exchange.

## Why does it matter for "harvest now, decrypt later"?

An attacker can record encrypted traffic today and store it. If the session keys came from classical key exchange alone, a future quantum computer could recover them and decrypt the recording. With X25519MLKEM768, the recorded session stays protected. See [Harvest now, decrypt later explained](harvest-now-decrypt-later-explained.md).

## How to enable X25519MLKEM768 on servers

Steps depend on the TLS stack. General approach:

1. **Check the library version.** OpenSSL 3.5 and later supports ML-KEM natively and includes X25519MLKEM768 in its default group list. Earlier OpenSSL 3.x versions need the Open Quantum Safe provider for testing only.
2. **Configure groups.** Put X25519MLKEM768 first and keep X25519 as a fallback for older clients.
3. **Update load balancers and CDNs.** In many architectures, the TLS connection ends at a load balancer or CDN, not the web server. Check that vendor's documentation for the installed version.
4. **Test.** Confirm the negotiated group.

Example NGINX directive with OpenSSL 3.5 or later:

```bash
ssl_ecdh_curve X25519MLKEM768:X25519:prime256v1;
```

Example test with the OpenSSL client:

```bash
openssl s_client -connect <hostname>:443 -groups X25519MLKEM768 -brief </dev/null
```

The output shows the negotiated group. In Chrome, open Developer Tools, select the Security tab, and look for X25519MLKEM768 in the connection details.

> **Note:** Directive names and defaults vary by product and version. Verify against the vendor documentation for the installed version.

## Can hybrid key exchange break anything?

Yes, in rare cases. The ClientHello grows past a single network packet. Old firewalls, intrusion prevention systems, and TLS inspection proxies that assume a small ClientHello may drop or reset the connection. Common fixes:

| Symptom | Likely cause | Resolution |
|---|---|---|
| Connection resets only in Chrome | Middlebox cannot handle a large ClientHello | Update the middlebox firmware or software |
| TLS inspection proxy fails | Proxy does not support ML-KEM groups | Upgrade the proxy, or let it negotiate a classical group on its own side |
| Server negotiates X25519 only | Library or configuration lacks ML-KEM | Upgrade to a supported library and add the group |

Enterprise administrators can control the Chrome behavior with a browser policy while fixing middleboxes. Use this only as a temporary measure.

## Does this make HTTPS fully quantum-safe?

No. Key exchange protects confidentiality. Server authentication still uses RSA or ECDSA certificates. Google's plan for quantum-safe authentication on the public web is Merkle Tree Certificates. See [Chrome quantum-safe HTTPS: Merkle Tree Certificates](chrome-quantum-safe-https-merkle-tree-certificates.md).

## How EC can help

- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): find TLS endpoints and libraries still limited to classical key exchange.
- [Testing PQC algorithms in a lab](../02-General/Post-Quantum-Cryptography/testing-pqc-algorithms-in-a-lab.md): try ML-KEM with OpenSSL 3.5.
- [NIST PQC standards: ML-KEM, ML-DSA, SLH-DSA](../02-General/Post-Quantum-Cryptography/nist-pqc-standards-ml-kem-ml-dsa-slh-dsa.md): background on FIPS 203.
- [PQC advisory and readiness assessment](../03-Services/pqc-advisory-and-readiness-assessment.md): a prioritized migration plan.

## Frequently asked questions

### Is X25519MLKEM768 enabled by default in Chrome?

Yes. Chrome has negotiated X25519MLKEM768 by default since Chrome 131 in November 2024, when the server supports it.

### What is the difference between X25519Kyber768 and X25519MLKEM768?

X25519Kyber768 used a pre-standard draft of Kyber. X25519MLKEM768 uses the final ML-KEM standard (FIPS 203) and a new codepoint. The two are not compatible.

### Do servers need new certificates for ML-KEM?

No. Hybrid key exchange works with existing RSA and ECDSA certificates. Only the TLS library and configuration change.

### Does X25519MLKEM768 slow down connections?

The extra data is about 2.3 KB per handshake in total. ML-KEM computation is fast, so the impact is usually small for most sites.

### Is X25519MLKEM768 FIPS approved?

ML-KEM is approved in FIPS 203. Whether a specific product is validated depends on its FIPS 140-3 module certificate. Check the vendor's Cryptographic Module Validation Program (CMVP) listing.
