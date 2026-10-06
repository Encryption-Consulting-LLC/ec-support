---
title: "How CBOM Works"
category: "General"
section: "CBOM"
article_type: "Concept"
applies_to: "Cryptographic discovery and inventory programs; CycloneDX 1.6 CBOM; CI/CD pipelines"
summary: "Walkthrough of how a CBOM is built: discovery sources, parsing and classification, risk enrichment, CycloneDX 1.6 output, and continuous use in CI/CD."
keywords: ["how CBOM works", "CBOM generation", "cryptographic discovery", "CycloneDX 1.6", "CBOM CI/CD", "quantum vulnerable algorithms"]
last_reviewed: "2026-10-06"
---

# How CBOM Works

A Cryptographic Bill of Materials (CBOM) is built in five stages: discovery, parsing and classification, enrichment, output, and continuous use. This article walks through each stage, with examples of what is collected and how it is reported in CycloneDX 1.6. It is for security engineers, architects, and DevSecOps teams who build or use a CBOM.

## What it is

CBOM generation is an automated pipeline. It collects raw evidence of cryptography from many sources, turns that evidence into standard records, adds risk information, and publishes the result in a standard format. Done well, it runs continuously so the inventory always matches reality.

## Why it matters

- Cryptography is spread across code, libraries, configuration files, keystores, HSMs, cloud services and network endpoints. No single team can see all of it.
- Manual inventories go stale within weeks.
- Post-quantum cryptography (PQC) planning, compliance audits and incident response all depend on accurate, current data.

## How it works

### 1. Discovery

Scanners and connectors collect evidence from each type of source.

| Source | What is found | Example evidence |
|---|---|---|
| Source code repositories (GitHub, Bitbucket, Git, archives) | Crypto API calls, algorithm names, hard-coded keys, weak random number use | `Cipher.getInstance("AES/ECB/PKCS5Padding")` |
| Binaries and packages | Bundled crypto libraries and their versions | OpenSSL, BouncyCastle, libsodium versions |
| Keystores (JKS, PKCS#12, JCEKS, BouncyCastle) | Keys and certificates stored in files | RSA-2048 key in a Java keystore |
| HSMs (Thales Luna, Entrust nShield, cloud HSMs) | Key objects and their attributes | ECDSA P-256 signing key, non-exportable |
| Key managers and cloud key services (HashiCorp Vault, AWS KMS, Azure Key Vault, Google Cloud KMS) | Managed keys, rotation settings | AES-256 key, rotation disabled |
| Network endpoints | TLS and SSH versions, cipher suites, certificate chains | TLS 1.2 with RSA key exchange |
| Directories and CAs (Active Directory, AD CS, OpenLDAP) | Issued certificates, templates, CA keys | Template allowing RSA-1024 |
| SSH and PGP | Host keys, user keys, PGP keys | DSA SSH host key |
| Databases | Encryption settings and metadata | Transparent Data Encryption (TDE) with 3DES |

Discovery uses a mix of agents, agentless network scans, and API connectors. For the sources supported by EC's product, see [CBOM Secure supported scan sources](../../01-Products/CBOM-Secure/cbom-secure-supported-scan-sources.md).

### 2. Parsing and classification

Raw findings are turned into standard records.

1. **Parse.** Read certificates (X.509 fields), keystore entries, code patterns, library metadata and TLS handshake results.
2. **Normalize names.** Map many spellings to one name, for example "secp256r1", "prime256v1" and "P-256" all become one curve. Algorithm Object Identifiers (OIDs) are recorded where known.
3. **Classify the asset type.** Algorithm, certificate, protocol, or related crypto material (keys, secrets, tokens).
4. **Link to context.** Tie each asset to its location (repository, host, HSM partition, cloud account), its owner, and the component that uses it.
5. **De-duplicate.** The same certificate found on five servers becomes one certificate record with five usages.

### 3. Enrichment

Each record gets risk and policy information.

| Enrichment | What it adds | Example |
|---|---|---|
| Quantum vulnerability | Whether a large quantum computer could break the algorithm | RSA, ECDSA, ECDH and DH flagged; ML-KEM and ML-DSA marked quantum resistant |
| Key length and strength | Classical security level in bits, compared to policy | RSA-1024 (80-bit) flagged as weak; RSA-2048 (112-bit) flagged for NIST IR 8547 deprecation after 2030 |
| Deprecated or disallowed algorithms | Matches against NIST and internal policy | MD5, SHA-1 signatures, 3DES, RC4, TLS 1.0 and 1.1 |
| Certificate health | Expiry, self-signed, wildcard, weak signature | Certificate expires in 14 days |
| Key handling | Storage and protection | Private key in a plain file instead of an HSM |
| Compliance mapping | Links to controls | PCI DSS, CNSA 2.0, FIPS 140-3 |
| Risk score | Combined priority | High: RSA-2048 key protecting long-lived data on an internet-facing system |

### 4. Output in CycloneDX 1.6

The enriched inventory is exported as a CycloneDX 1.6 document (JSON or XML). CycloneDX 1.6 adds:

- A component type of `cryptographic-asset`.
- A `cryptoProperties` object with an `assetType` of `algorithm`, `certificate`, `protocol`, or `related-crypto-material`.
- Detail objects such as `algorithmProperties` (primitive, parameter set, mode, padding, crypto functions, `classicalSecurityLevel`, `nistQuantumSecurityLevel`) and `certificateProperties`.
- Dependency links, so an application can show which cryptographic assets it uses or provides.

A short example:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "components": [
    {
      "type": "cryptographic-asset",
      "bom-ref": "crypto/algorithm/rsa-2048",
      "name": "RSA-2048",
      "cryptoProperties": {
        "assetType": "algorithm",
        "algorithmProperties": {
          "primitive": "signature",
          "parameterSetIdentifier": "2048",
          "cryptoFunctions": ["sign", "verify"],
          "classicalSecurityLevel": 112,
          "nistQuantumSecurityLevel": 0
        },
        "oid": "1.2.840.113549.1.1.1"
      }
    }
  ]
}
```

A `nistQuantumSecurityLevel` of 0 means the algorithm is not quantum resistant. ML-DSA-65, for comparison, would show level 3.

> **Tip:** Validate CBOM files against the official CycloneDX 1.6 JSON schema before sharing them with other tools.

### 5. Continuous use in CI/CD

A CBOM delivers the most value when it is updated all the time.

1. **Scan on every build.** Add a CBOM scan step to the pipeline (for example GitHub Actions, GitLab CI, Jenkins or Azure DevOps).
2. **Check policy.** Fail or warn the build when it adds a disallowed algorithm, a hard-coded key, or a weak key size.
3. **Store the CBOM** as a build artifact next to the SBOM, tied to the release version.
4. **Compare versions.** Diff the new CBOM against the last release to spot new cryptography.
5. **Feed central views.** Send results to the central inventory, dashboards, and ticketing systems so owners can fix findings.
6. **Rescan infrastructure** on a schedule (for example weekly) to catch changes made outside pipelines.

## Key terms

| Term | Meaning |
|---|---|
| Discovery | Finding evidence of cryptography in a source |
| Normalization | Converting different names for the same thing into one standard name |
| Enrichment | Adding risk, policy and compliance details to each finding |
| `cryptoProperties` | The CycloneDX 1.6 object that describes a cryptographic asset |
| `nistQuantumSecurityLevel` | CycloneDX field for the NIST PQC security category (0 means not quantum resistant) |

## Common questions

### Does discovery need access to private keys?

No. Discovery reads metadata, such as algorithm, size and location. It does not export key values.

### How long does a first scan take?

It depends on the number and size of sources. Start with the most critical systems and expand. See [Running a first cryptographic scan](../../01-Products/CBOM-Secure/running-a-first-cryptographic-scan.md).

### Can the CBOM be imported into other tools?

Yes, if the tool supports CycloneDX 1.6. See [Exporting CBOM in CycloneDX format](../../01-Products/CBOM-Secure/exporting-cbom-in-cyclonedx-format.md).

## Related articles

- [What is a CBOM?](what-is-a-cbom.md)
- [CBOM vs SBOM](cbom-vs-sbom.md)
- [How CBOM Secure works](../../01-Products/CBOM-Secure/how-cbom-secure-works.md)
- [Reading a CBOM report](../../01-Products/CBOM-Secure/reading-a-cbom-report.md)
- [Crypto-agility explained](../Post-Quantum-Cryptography/crypto-agility-explained.md)
