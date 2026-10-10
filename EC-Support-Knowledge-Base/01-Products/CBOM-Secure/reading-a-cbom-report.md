---
title: "Reading a CBOM Report"
category: "Products"
section: "CBOM Secure"
article_type: "How-to"
applies_to: "CBOM Secure reports and CycloneDX 1.6 CBOM exports"
summary: "How to read a CBOM Secure report and a CycloneDX CBOM: asset types, algorithm fields, risk bands, dependencies, and turning findings into actions."
keywords: ["read CBOM report", "CBOM fields", "cryptoProperties", "crypto risk findings", "CycloneDX cryptographic asset"]
last_reviewed: "2026-10-06"
---

# Reading a CBOM Report

This article explains how to read the results of a CBOM Secure scan, both in the console reports and in an exported CycloneDX Cryptographic Bill of Materials (CBOM). It shows what the main fields mean and how to turn findings into a prioritized action list. It is for security analysts, PKI owners, and application teams.

## Overview

A CBOM report answers four questions:

1. **What** cryptography exists (algorithms, keys, certificates, protocols)?
2. **Where** is it (repository, host, HSM, cloud account)?
3. **Who depends** on it (applications, services, other assets)?
4. **How risky** is it (weak, expiring, quantum-vulnerable, non-compliant)?

## Applies to

CBOM Secure console reports and CycloneDX 1.6 exports. CycloneDX 1.7 exports use the same core cryptographic fields.

## Prerequisites

- A completed scan. See [Running a first cryptographic scan](running-a-first-cryptographic-scan.md).
- Console access with permission to view inventory and reports.
- For exported files, a JSON viewer or a tool such as `jq`.

## Before starting

- Know which sources were in scope. Missing results often mean a source was not scanned, not that there is no cryptography.
- Agree on owners for each application, so findings can be assigned.

## Procedure

### Phase 1: Start with the summary dashboard

1. Open the **Dashboard** in the console.
2. Note totals by asset type: algorithms, certificates, keys, protocols.
3. Note counts by risk band. CBOM Secure uses a four-band scale: **Critical**, **High**, **Medium**, and **Low**, from most to least urgent.
4. Note the PQC readiness score for keys, certificates, and protocol cipher suites.

### Phase 2: Understand the asset types

In CycloneDX 1.6, every cryptographic item is a component with `"type": "cryptographic-asset"`. Its `cryptoProperties.assetType` is one of four values:

| assetType | What it describes | Examples |
|---|---|---|
| `algorithm` | A cryptographic algorithm and its parameters | AES-256-GCM, RSA-2048, ML-KEM-768, SHA-256 |
| `certificate` | An X.509 or other certificate | TLS server certificate, code signing certificate |
| `protocol` | A protocol and its settings | TLS 1.2 with listed cipher suites, SSH, IPsec |
| `related-crypto-material` | Keys and other material | Private key, public key, secret key, token, password |

### Phase 3: Read algorithm details

Important `algorithmProperties` fields:

| Field | Meaning | Example values |
|---|---|---|
| `primitive` | Type of algorithm | `block-cipher`, `signature`, `hash`, `pke`, `kem`, `key-agree`, `mac`, `ae`, `kdf`, `drbg` |
| `parameterSetIdentifier` | Key size or parameter set | `128`, `256`, `2048`, `65` (as in ML-DSA-65) |
| `curve` | Elliptic curve name | `secp256r1`, `x25519` |
| `mode` | Block cipher mode | `gcm`, `cbc`, `ecb`, `ctr` |
| `padding` | Padding scheme | `oaep`, `pkcs1v15`, `pkcs7` |
| `cryptoFunctions` | Operations used | `encrypt`, `decrypt`, `sign`, `verify`, `keygen`, `encapsulate` |
| `executionEnvironment` | Where it runs | `software-plain-ram`, `hardware` |
| `certificationLevel` | Validation status | `fips140-3-l3`, `cc-eal4+`, `none` |
| `classicalSecurityLevel` | Classical strength in bits | `112`, `128`, `256` |
| `nistQuantumSecurityLevel` | NIST PQC security category, 0 to 6 | `0` means not quantum-safe, `3` for ML-KEM-768 |

A component may also carry an `oid`, the Object Identifier of the algorithm.

**Reading example:**

```json
{
  "type": "cryptographic-asset",
  "bom-ref": "crypto/algorithm/rsa-2048",
  "name": "RSA-2048",
  "cryptoProperties": {
    "assetType": "algorithm",
    "algorithmProperties": {
      "primitive": "pke",
      "parameterSetIdentifier": "2048",
      "executionEnvironment": "software-plain-ram",
      "cryptoFunctions": ["encrypt", "decrypt"],
      "classicalSecurityLevel": 112,
      "nistQuantumSecurityLevel": 0
    },
    "oid": "1.2.840.113549.1.1.1"
  }
}
```

This says: RSA with a 2048-bit key, used for encryption in software memory, about 112 bits of classical strength, and no quantum security. It is a candidate for PQC migration and is in scope for NIST IR 8547 deprecation after 2030.

### Phase 4: Read certificates, keys, and protocols

- **Certificates** (`certificateProperties`): `subjectName`, `issuerName`, `notValidBefore`, `notValidAfter`, `signatureAlgorithmRef`, `subjectPublicKeyRef`, `certificateFormat`. The `Ref` fields point to the algorithm and key components by `bom-ref`.
- **Keys and material** (`relatedCryptoMaterialProperties`): `type` (for example `private-key`, `public-key`, `secret-key`), `size`, `state` (for example `active`, `compromised`, `destroyed`), `algorithmRef`, `creationDate`, `expirationDate`, and `securedBy` (how the material is protected).
- **Protocols** (`protocolProperties`): `type` (for example `tls`, `ssh`, `ipsec`), `version`, and `cipherSuites` with names and linked algorithms.

### Phase 5: Follow dependencies

The `dependencies` section links components with `ref`, `dependsOn`, and (new in 1.6) `provides`. For example, an application `dependsOn` a library, and the library `provides` RSA and AES. Use these links to find which applications are affected by one weak algorithm. In the console, the dependency map view shows the same links.

CBOM Secure also marks whether a code finding is reachable from an application entry point. Reachable findings come first.

### Phase 6: Build the action list

Sort findings in this order:

1. Broken or forbidden: MD5 or SHA-1 for signatures, DES, 3DES, RC4, RSA below 2048 bits, ECB mode for data, hard-coded private keys.
2. Expiring soon: certificates and keys close to `notValidAfter` or `expirationDate`.
3. Policy gaps: software keys where policy requires an HSM, key reuse across systems.
4. Quantum-vulnerable but currently acceptable: RSA, ECDSA, ECDH, DH. Plan these in the PQC roadmap.

Assign each item to the owner of the dependent application.

## Verification

- Every high-risk finding has an owner and a target date.
- A sample of findings has been checked by hand against the real system.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Algorithm shown as `unknown` | Unrecognized custom name or library | Report the sample to EC support so the pattern can be added. |
| Duplicate certificates | Same certificate found in several places | Expected: each location is a separate occurrence of one asset. |
| `nistQuantumSecurityLevel` missing | Field is optional in CycloneDX | Use the CBOM Secure PQC readiness view. |
| Dependency map is empty | Source scanned without code or application context | Add code repositories or application mapping. |

## Related articles

- [Exporting CBOM in CycloneDX format](exporting-cbom-in-cyclonedx-format.md)
- [Using CBOM Secure for PQC readiness](using-cbom-secure-for-pqc-readiness.md)
- [What is a CBOM](../../02-General/CBOM/what-is-a-cbom.md)
- [How CBOM works](../../02-General/CBOM/how-cbom-works.md)
- [NIST IR 8547 quantum-vulnerable algorithm deprecation](../../05-Popular-Right-Now/nist-ir-8547-quantum-vulnerable-algorithm-deprecation-2030-2035.md)
