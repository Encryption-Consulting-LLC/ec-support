---
title: "What Is a CBOM?"
category: "General"
section: "CBOM"
article_type: "Concept"
applies_to: "Security, PKI, application and compliance teams; CycloneDX 1.6 CBOM"
summary: "Plain-language explanation of a Cryptographic Bill of Materials (CBOM): what it records, why it matters for PQC and compliance, and how it is produced."
keywords: ["CBOM", "cryptographic bill of materials", "cryptographic inventory", "CycloneDX", "PQC readiness", "crypto discovery"]
last_reviewed: "2026-10-06"
---

# What Is a CBOM?

A Cryptographic Bill of Materials (CBOM) is a structured inventory of the cryptography used across an organization's software, systems and infrastructure. It shows which algorithms, keys, certificates, protocols and libraries are in use, and where. This article explains what a CBOM contains and why it matters. It is for security leaders, architects, and compliance teams.

## What it is

A CBOM answers a simple question: "What cryptography is running, and where?" It records each cryptographic asset and its context in a machine-readable file. The most widely used format is CycloneDX 1.6, which added native CBOM support in 2024. CycloneDX 1.6 is also published as the Ecma International standard ECMA-424.

A CBOM typically records four kinds of asset:

| Asset type | Examples | Typical details recorded |
|---|---|---|
| Algorithms | RSA, ECDSA, AES, SHA-256, ML-KEM, ML-DSA | Key size or parameter set, mode, padding, classical and quantum security level |
| Certificates | TLS server certificates, CA certificates, code signing certificates | Subject, issuer, validity dates, signature algorithm, public key algorithm |
| Protocols | TLS 1.2, TLS 1.3, SSH, IPsec | Version, cipher suites, key exchange groups |
| Related crypto material | Private keys, public keys, secret keys, tokens | Type, size, location (HSM, key vault, file), state, creation and expiry dates |

Each asset is linked to the component that uses it, such as an application, a library, a server or an HSM.

> **Note:** A CBOM records metadata about keys, not the key values. Private and secret key material must never be placed in a CBOM.

## Why it matters

- **Post-quantum cryptography (PQC) migration starts here.** An organization cannot replace RSA and ECC if it does not know where they are. Every major PQC guide, including NIST, CISA and NSA guidance, lists inventory as the first step.
- **Compliance.** Regulations and standards such as PCI DSS v4.0, DORA, NIS2 and ISO/IEC 27001:2022 expect organizations to know and control their cryptography. See [CBOM use cases and compliance drivers](cbom-use-cases-and-compliance-drivers.md).
- **Weak and deprecated algorithms.** A CBOM exposes SHA-1, 3DES, RSA-1024, old TLS versions and hard-coded keys that should already be gone.
- **Outage prevention.** Certificate expiry dates and locations in the CBOM help prevent outages.
- **Faster response.** When an algorithm or library is found to be weak, a CBOM shows every affected system in minutes instead of weeks.

## How it works

1. **Discover.** Scanners collect cryptographic data from code, binaries, keystores, HSMs, key managers, cloud key services, network endpoints and directories.
2. **Classify.** Findings are normalized into standard asset types and names.
3. **Enrich.** Each asset gets risk details, such as quantum vulnerability, key strength, and whether it breaks policy.
4. **Output.** The results are written as a CycloneDX 1.6 CBOM and shown in dashboards and reports.
5. **Keep current.** Scans run on a schedule and in CI/CD pipelines so the CBOM stays up to date.

For the full process, see [How CBOM works](how-cbom-works.md).

## Key terms

| Term | Meaning |
|---|---|
| CBOM | Cryptographic Bill of Materials |
| SBOM | Software Bill of Materials: an inventory of software components |
| CycloneDX | An open Bill of Materials standard from OWASP; version 1.6 supports CBOM |
| Cryptographic asset | Any algorithm, key, certificate, protocol or related material |
| Quantum-vulnerable | An algorithm that a large quantum computer could break (RSA, ECDSA, ECDH, DH) |

## Common questions

### Is a CBOM the same as an SBOM?

No. An SBOM lists software components. A CBOM lists cryptographic assets and how they are used. CycloneDX can hold both in one file. See [CBOM vs SBOM](cbom-vs-sbom.md).

### Can a CBOM be built by hand?

A spreadsheet can start the effort, but it goes out of date quickly and misses cryptography hidden in code and libraries. Automated discovery is needed for a complete and current CBOM.

### Who owns the CBOM?

Usually the security architecture team or the PQC program owner, with input from application, infrastructure, PKI and HSM teams.

### How does EC help?

EC's CBOM Secure discovers cryptographic assets across code, binaries, keystores, HSMs, key managers, cloud services, directories, SSH and databases, and exports a CycloneDX 1.6 CBOM. See [CBOM Secure overview](../../01-Products/CBOM-Secure/cbom-secure-overview.md).

## Related articles

- [How CBOM works](how-cbom-works.md)
- [CBOM vs SBOM](cbom-vs-sbom.md)
- [CBOM use cases and compliance drivers](cbom-use-cases-and-compliance-drivers.md)
- [PQC maturity model](../Post-Quantum-Cryptography/pqc-maturity-model.md)
- [Reading a CBOM report](../../01-Products/CBOM-Secure/reading-a-cbom-report.md)
