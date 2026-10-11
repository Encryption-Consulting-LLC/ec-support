---
title: "CBOM vs SBOM"
category: "General"
section: "CBOM"
article_type: "Concept"
applies_to: "Security, DevSecOps, supply chain and compliance teams; CycloneDX 1.6, SPDX"
summary: "How a Cryptographic Bill of Materials (CBOM) differs from a Software Bill of Materials (SBOM), what each records, and how to use them together."
keywords: ["CBOM vs SBOM", "SBOM", "CBOM", "CycloneDX", "SPDX", "software supply chain", "cryptographic inventory"]
last_reviewed: "2026-10-06"
---

# CBOM vs SBOM

A Software Bill of Materials (SBOM) and a Cryptographic Bill of Materials (CBOM) are both inventories, but they answer different questions. An SBOM lists the software components inside a product. A CBOM lists the cryptography a product or estate uses. This article compares the two and explains how they work together. It is for DevSecOps, supply chain security, and compliance teams.

## What it is

- **SBOM:** a list of software components, libraries and their versions, suppliers, licenses and dependencies. It answers "What is this software made of?"
- **CBOM:** a list of cryptographic assets (algorithms, keys, certificates, protocols and related material), their properties and where they are used. It answers "What cryptography does this use, and is it safe?"

A CBOM can be thought of as a specialized extension of an SBOM. In CycloneDX 1.6, both can live in the same document: cryptographic assets are components of type `cryptographic-asset` and can be linked to the software components that use them.

## Why it matters

- An SBOM may show that an application includes OpenSSL 3.0. It will not show whether the application uses RSA-1024, TLS 1.0, or a hard-coded AES key.
- A CBOM shows the actual cryptographic choices, which is what post-quantum cryptography (PQC) migration and crypto policy checks need.
- Together they let teams trace a weak algorithm back to the exact library, version and supplier.

## Side-by-side comparison

| Aspect | SBOM | CBOM |
|---|---|---|
| Main question | What components are in this software? | What cryptography is in use, and where? |
| Main items | Packages, libraries, versions, licenses, suppliers | Algorithms, keys, certificates, protocols, related crypto material |
| Main risks found | Known vulnerabilities (CVEs), license issues, outdated components | Quantum-vulnerable algorithms, weak key sizes, deprecated ciphers, expiring certificates, unprotected keys |
| Scope | Usually one software product or release | A product, or the whole estate (servers, HSMs, cloud, network) |
| Common formats | SPDX, CycloneDX | CycloneDX 1.6 (ECMA-424) |
| Typical owner | Product security, DevSecOps | Security architecture, PQC program, PKI and crypto teams |
| Key drivers | US Executive Order 14028, NTIA minimum elements, EU Cyber Resilience Act | PQC migration (NIST, CISA, NSA CNSA 2.0), PCI DSS v4.0, DORA, NIS2 |
| Update trigger | New build or release | New build, configuration change, key rotation, certificate renewal |

## How it works together

1. **Generate the SBOM** during the build to list components and versions.
2. **Generate the CBOM** from the same code and binaries, plus infrastructure sources such as keystores, HSMs, cloud key services and network endpoints.
3. **Link them.** In CycloneDX, dependency links show which software component uses or provides which cryptographic asset.
4. **Analyze together.** When a library vulnerability or algorithm weakness is announced, the SBOM finds affected components and the CBOM shows how they use cryptography.
5. **Store both with the release** so auditors and customers can review them.

### Example

| Finding | Found by | Action |
|---|---|---|
| Application bundles an old crypto library with a known CVE | SBOM | Upgrade the library |
| Application signs tokens with RSA-2048 | CBOM | Plan move to ML-DSA or a hybrid scheme |
| Server certificate uses SHA-1 signature | CBOM | Reissue with SHA-256 or stronger |
| Private key stored in a plain file next to the application | CBOM | Move key to an HSM or key manager |

## Key terms

| Term | Meaning |
|---|---|
| SBOM | Software Bill of Materials |
| CBOM | Cryptographic Bill of Materials |
| SPDX | Software Package Data Exchange, a Linux Foundation SBOM standard (ISO/IEC 5962) |
| CycloneDX | OWASP Bill of Materials standard; version 1.6 supports CBOM and is published as ECMA-424 |
| CVE | Common Vulnerabilities and Exposures: public identifiers for known vulnerabilities |

## Common questions

### Does an SBOM tool produce a CBOM?

Usually not. SBOM tools read package manifests. A CBOM needs deeper analysis of code, configuration, keystores, HSMs and network endpoints.

### Is a separate file needed for the CBOM?

Not always. CycloneDX 1.6 allows one document with both software and cryptographic components. Some teams keep separate files for different audiences.

### Can SPDX hold a CBOM?

SPDX is mainly used for SBOM and license data. For detailed cryptographic properties, CycloneDX 1.6 is the common choice today. Verify the current SPDX specification for any newer crypto support.

### Where does EC's product fit?

CBOM Secure produces a CycloneDX 1.6 CBOM that can sit alongside an existing SBOM. See [Exporting CBOM in CycloneDX format](../../01-Products/CBOM-Secure/exporting-cbom-in-cyclonedx-format.md).

## Related articles

- [What is a CBOM?](what-is-a-cbom.md)
- [How CBOM works](how-cbom-works.md)
- [CBOM use cases and compliance drivers](cbom-use-cases-and-compliance-drivers.md)
- [CBOM Secure overview](../../01-Products/CBOM-Secure/cbom-secure-overview.md)
- [Code signing best practices](../Code-Signing/code-signing-best-practices.md)
