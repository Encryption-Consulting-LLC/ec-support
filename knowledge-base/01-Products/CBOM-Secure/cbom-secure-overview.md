---
title: "CBOM Secure Overview"
category: "Products"
section: "CBOM Secure"
article_type: "Overview"
applies_to: "CBOM Secure (SaaS, cloud, on-premises, and hybrid deployments)"
summary: "An introduction to EC CBOM Secure: crypto discovery across code, keystores, HSMs, cloud, and databases, risk scoring, PQC readiness, and CBOM export."
keywords: ["CBOM Secure", "cryptographic inventory", "cryptographic bill of materials", "PQC readiness", "CycloneDX CBOM"]
last_reviewed: "2026-10-06"
---

# CBOM Secure Overview

This article introduces CBOM Secure, the cryptographic discovery and inventory product from Encryption Consulting (EC). It explains what the product finds, how it is built, and where it fits in a Post-Quantum Cryptography (PQC) program. It is for security architects, PKI and crypto owners, and compliance teams.

## What it is

CBOM Secure finds the cryptography used across an organization and records it in a Cryptographic Bill of Materials (CBOM). A CBOM lists algorithms, keys, certificates, protocols, and crypto libraries, and shows which applications depend on them. CBOM Secure exports the inventory in the CycloneDX format, which added CBOM support in version 1.6. EC also states support for CycloneDX 1.7 export.

The inventory answers practical questions such as: Where is RSA 1024 still used? Which applications depend on a certificate that expires next month? Which systems will break when quantum-vulnerable algorithms are disallowed?

## Key capabilities

- **Discovery across many sources:** source code, binaries, keystores, Hardware Security Modules (HSMs), Key Management Interoperability Protocol (KMIP) servers, key managers, cloud key services, TLS endpoints, directories, databases, and file systems. EC lists 20+ sensors.
- **Source code analysis:** covers seven programming languages, 70+ cryptographic libraries, and 880+ function patterns.
- **Dependency mapping:** call graph reachability shows whether crypto code is actually used in production paths or is dormant.
- **Risk classification:** a four-band risk scale, key reuse detection, and HSM versus software key analysis.
- **PQC readiness:** flags quantum-vulnerable algorithms (for example RSA, ECDSA, ECDH) in keys, certificates, and protocol cipher suites, and maps them to NIST quantum-safe replacements.
- **Compliance mapping:** FIPS 140-3, CMMC 2.0, CNSA 2.0, NIST IR 8547, PCI DSS 4.0, ISO 27001, and SOC 2.
- **Dashboards:** EC lists 50+ key performance indicators (KPIs) and 30+ dashboard widgets.

## How it works

CBOM Secure has three main parts:

1. **CBOM Secure server:** stores the inventory, runs analysis and risk scoring, and provides the web console, reports, and exports.
2. **Scanning agents and sensors:** connect to each source, collect cryptographic metadata, and send results to the server. Agents can run close to the systems being scanned, including air-gapped networks.
3. **Connectors:** read-only integrations with code repositories, HSMs, key managers, and cloud platforms.

Scans collect metadata only (for example algorithm, key size, expiry, location). Private key material is not read. See [How CBOM Secure works](how-cbom-secure-works.md).

## Supported integrations

| Area | Examples |
|---|---|
| Source code | GitHub, Bitbucket, Git, source archives |
| Keystores | JKS, PKCS#12, JCEKS, BouncyCastle |
| HSMs | Thales Luna, Entrust nShield, AWS CloudHSM, Azure Dedicated HSM, Google Cloud HSM, IBM Crypto Express, YubiHSM 2 |
| Key managers | HashiCorp Vault, Thales CipherTrust Manager, Oracle Key Vault, Fortanix |
| Cloud | AWS Certificate Manager (ACM), AWS Key Management Service (KMS), Azure Key Vault, Google Cloud KMS, Oracle Cloud |
| Directories | Active Directory, AD Certificate Services (AD CS), OpenLDAP |
| Other | SSH and PGP keys, MySQL, MariaDB, Oracle, SQL Server encryption metadata |

Full list: [CBOM Secure supported scan sources](cbom-secure-supported-scan-sources.md).

## Deployment options

| Model | Description |
|---|---|
| SaaS | Managed by EC. Agents run in the customer network. |
| Cloud | Deployed in the customer cloud account. |
| On-premises | Server and agents inside the customer data center. |
| Hybrid | On-premises discovery with central visibility. |

## Getting help

- See [CBOM Secure FAQ](cbom-secure-faq.md).
- Open a case: [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).
- For planning help, see [PQC advisory and readiness assessment](../../03-Services/pqc-advisory-and-readiness-assessment.md).

## Related articles

- [How CBOM Secure works](how-cbom-secure-works.md)
- [Running a first cryptographic scan](running-a-first-cryptographic-scan.md)
- [Using CBOM Secure for PQC readiness](using-cbom-secure-for-pqc-readiness.md)
- [What is a CBOM](../../02-General/CBOM/what-is-a-cbom.md)
- [CBOM vs SBOM](../../02-General/CBOM/cbom-vs-sbom.md)
