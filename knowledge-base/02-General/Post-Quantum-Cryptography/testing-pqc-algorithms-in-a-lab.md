---
title: "Testing PQC Algorithms in a Lab"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "How-to"
applies_to: "OpenSSL 3.5 and later (native ML-KEM, ML-DSA, SLH-DSA); Open Quantum Safe oqs-provider; Linux lab hosts"
summary: "Hands-on lab steps for testing ML-KEM, ML-DSA and SLH-DSA with OpenSSL 3.5: key generation, test certificates, KEM encapsulation and hybrid TLS."
keywords: ["OpenSSL 3.5 PQC", "ML-DSA OpenSSL", "ML-KEM OpenSSL", "X25519MLKEM768", "oqs-provider", "PQC lab"]
last_reviewed: "2026-10-06"
---

# Testing PQC Algorithms in a Lab

This article shows how to build a small lab to try the NIST post-quantum cryptography (PQC) algorithms with OpenSSL. It covers key generation, test certificates, key encapsulation, and hybrid TLS key exchange. It is for engineers, PKI administrators and developers who want hands-on experience before planning production changes.

## Overview

OpenSSL 3.5.0 (released April 8, 2025, a Long Term Support release) added native support for:

- ML-KEM (FIPS 203) key encapsulation.
- ML-DSA (FIPS 204) signatures.
- SLH-DSA (FIPS 205) signatures.

OpenSSL 3.5 also changed TLS defaults: the default supported groups now include and prefer hybrid PQC groups, and the default key shares offered are X25519MLKEM768 and X25519.

For algorithms not built into OpenSSL (for example FN-DSA (Falcon), HQC, or composite signatures from IETF drafts), the Open Quantum Safe project's oqs-provider can be loaded as an OpenSSL 3 provider.

## Applies to

- OpenSSL 3.5.0 or later on Linux, macOS or Windows.
- oqs-provider (optional) with liboqs, for experimental algorithms.

## Prerequisites

- An isolated lab host or virtual machine. Do not use production systems.
- OpenSSL 3.5 or later. Check with the command below.
- Basic familiarity with the OpenSSL command line.

```bash
openssl version
openssl list -kem-algorithms
openssl list -signature-algorithms | grep -i -E "ML-DSA|SLH-DSA"
```

> **Note:** Many Linux distributions still ship OpenSSL 3.0 or 3.2. Use a distribution that ships 3.5 or later, a container image with OpenSSL 3.5, or build from source in a separate prefix so the system OpenSSL is not replaced.

## Before starting

- Keys created in this lab are software keys. They are for testing only and must never protect real data.
- Record the OpenSSL version and build options with each result, because behavior can change between releases.

## Procedure

### Phase 1: ML-DSA keys and a test certificate

1. Generate an ML-DSA-65 private key.

   ```bash
   openssl genpkey -algorithm ML-DSA-65 -out mldsa65-key.pem
   ```

2. View the key details and sizes.

   ```bash
   openssl pkey -in mldsa65-key.pem -text -noout | head -20
   ```

3. Create a self-signed test root certificate.

   ```bash
   openssl req -x509 -new -key mldsa65-key.pem -subj "/CN=Contoso-PQC-Test-Root" -days 30 -out mldsa65-root.pem
   ```

4. Inspect the certificate. The signature algorithm should show ML-DSA-65.

   ```bash
   openssl x509 -in mldsa65-root.pem -text -noout
   ```

5. Compare file sizes against an ECDSA certificate to see the size effect.

   ```bash
   openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout ec-key.pem -subj "/CN=Contoso-EC-Test" -days 30 -out ec-root.pem
   ls -l mldsa65-root.pem ec-root.pem
   ```

### Phase 2: Sign and verify data

1. Sign a file with ML-DSA.

   ```bash
   echo "test message" > msg.txt
   openssl pkeyutl -sign -inkey mldsa65-key.pem -in msg.txt -out msg.sig
   ```

2. Verify the signature with the certificate's public key.

   ```bash
   openssl pkeyutl -verify -certin -inkey mldsa65-root.pem -in msg.txt -sigfile msg.sig
   ```

3. Repeat with SLH-DSA to compare signing time and signature size.

   ```bash
   openssl genpkey -algorithm SLH-DSA-SHA2-128s -out slhdsa-key.pem
   time openssl pkeyutl -sign -inkey slhdsa-key.pem -in msg.txt -out msg-slh.sig
   ls -l msg.sig msg-slh.sig
   ```

### Phase 3: ML-KEM encapsulation

1. Generate an ML-KEM-768 key pair and export the public key.

   ```bash
   openssl genpkey -algorithm ML-KEM-768 -out mlkem-key.pem
   openssl pkey -in mlkem-key.pem -pubout -out mlkem-pub.pem
   ```

2. Encapsulate a shared secret to the public key. This produces a ciphertext and a secret.

   ```bash
   openssl pkeyutl -encap -pubin -inkey mlkem-pub.pem -out ciphertext.bin -secret secret-sender.bin
   ```

3. Decapsulate with the private key.

   ```bash
   openssl pkeyutl -decap -inkey mlkem-key.pem -in ciphertext.bin -secret secret-receiver.bin
   ```

4. Confirm both sides derived the same 32 byte secret.

   ```bash
   cmp secret-sender.bin secret-receiver.bin && echo "Shared secrets match"
   ```

### Phase 4: Hybrid TLS key exchange

1. Start a test server with the ML-DSA certificate, offering the hybrid group.

   ```bash
   openssl s_server -accept 4443 -cert mldsa65-root.pem -key mldsa65-key.pem -groups X25519MLKEM768 -www
   ```

2. In a second terminal, connect with the hybrid group.

   ```bash
   openssl s_client -connect localhost:4443 -groups X25519MLKEM768 -CAfile mldsa65-root.pem </dev/null
   ```

3. In the output, check the negotiated group (look for X25519MLKEM768) and the peer signature type (ML-DSA-65).

4. To test a public site that supports hybrid key exchange, connect with the group list and check the negotiated group.

   ```bash
   openssl s_client -connect <hostname>:443 -groups X25519MLKEM768:X25519 </dev/null 2>/dev/null | grep -i -E "group|Protocol"
   ```

### Phase 5 (optional): oqs-provider

1. Build and install liboqs and oqs-provider by following the Open Quantum Safe project documentation for the installed OpenSSL version.
2. Load the provider next to the default provider and list the extra algorithms.

   ```bash
   openssl list -signature-algorithms -provider oqsprovider -provider default
   ```

> **Warning:** oqs-provider and liboqs are research and prototyping tools. The Open Quantum Safe project does not recommend them for production use. Use them only in the lab.

## Verification

- `openssl list` shows ML-KEM, ML-DSA and SLH-DSA algorithms.
- The test certificate shows an ML-DSA signature algorithm.
- Signature verification returns "Signature Verified Successfully".
- The two ML-KEM secrets match.
- `s_client` shows the X25519MLKEM768 group was negotiated.

## What to measure

| Measure | Why it matters |
|---|---|
| Certificate and chain size | Affects TLS handshake size and device memory |
| Handshake time and CPU use | Capacity planning for load balancers and servers |
| Signing time (ML-DSA vs SLH-DSA) | Choice of algorithm for CAs and code signing |
| Compatibility with clients and middleboxes | Older devices may reject large ClientHello messages |

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| "unsupported" or "unknown algorithm" error | OpenSSL older than 3.5, or the wrong binary on PATH | Run `openssl version` and use the 3.5 or later binary |
| `-encap` option not recognized | OpenSSL older than 3.5 | Upgrade the lab OpenSSL |
| `s_client` negotiates X25519 instead of the hybrid group | Server does not support or prefer the hybrid group | Check the server group list; confirm with `-groups X25519MLKEM768` only |
| Handshake fails through a proxy or load balancer | Device cannot handle a larger ClientHello | Test direct, then update or reconfigure the device |
| oqs-provider fails to load | Provider built against a different OpenSSL version | Rebuild oqs-provider against the installed OpenSSL |

## Related articles

- [NIST PQC standards: ML-KEM, ML-DSA and SLH-DSA](nist-pqc-standards-ml-kem-ml-dsa-slh-dsa.md)
- [Hybrid and composite certificates](hybrid-and-composite-certificates.md)
- [PQC readiness for PKI and HSM](pqc-readiness-for-pki-and-hsm.md)
- [Building a PQC migration roadmap](building-a-pqc-migration-roadmap.md)
- [Chrome ML-KEM hybrid key exchange](../../05-Popular-Right-Now/chrome-ml-kem-hybrid-key-exchange.md)
