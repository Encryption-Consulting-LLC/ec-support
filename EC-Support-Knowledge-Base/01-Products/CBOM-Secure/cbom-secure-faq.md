---
title: "CBOM Secure FAQ"
category: "Products"
section: "CBOM Secure"
article_type: "FAQ"
applies_to: "CBOM Secure (all deployment models)"
summary: "Answers to common CBOM Secure questions on scan sources, agents, data safety, CycloneDX export, risk scoring, PQC readiness, compliance, and deployment."
keywords: ["CBOM Secure FAQ", "cryptographic inventory questions", "CBOM export", "PQC readiness tool", "crypto discovery agent"]
last_reviewed: "2026-10-06"
---

# CBOM Secure FAQ

This article answers frequent questions about CBOM Secure, the cryptographic discovery and inventory product from Encryption Consulting (EC). It is for new customers, administrators, and security teams using the product.

### What is CBOM Secure?

A product that finds cryptography across code, binaries, keystores, Hardware Security Modules (HSMs), key managers, cloud services, directories, and databases, then builds a Cryptographic Bill of Materials (CBOM). See [CBOM Secure overview](cbom-secure-overview.md).

### What is a CBOM?

A machine-readable list of cryptographic assets (algorithms, certificates, keys, protocols) and how they relate to applications. See [What is a CBOM](../../02-General/CBOM/what-is-a-cbom.md).

### Which sources can be scanned?

Source code repositories (GitHub, Bitbucket, Git, archives), binaries, keystores (JKS, PKCS#12, JCEKS, BouncyCastle), HSMs (Thales Luna, Entrust nShield, AWS CloudHSM, Azure Dedicated HSM, Google Cloud HSM, IBM Crypto Express, YubiHSM 2), key managers (HashiCorp Vault, CipherTrust Manager, Oracle Key Vault, Fortanix), cloud key services, directories, SSH and PGP keys, TLS endpoints, and databases. See [CBOM Secure supported scan sources](cbom-secure-supported-scan-sources.md).

### Does CBOM Secure read or copy private keys?

No. It collects metadata such as algorithm, key size, labels, dates, and protection type. Private key values are not exported.

### Are scanning agents required?

Agents run inside the customer network to reach internal sources. Some cloud sources may be scanned through API connectors. Agent host requirements, and which sources need an agent, are listed in the CBOM Secure installation guide for your version.

### Can it scan air-gapped networks?

Discovery works from hyperscale cloud to air-gapped infrastructure. For air-gapped networks, contact EC support to agree how scan results are moved out of the isolated network.

### Which export formats are supported?

CycloneDX 1.6 and 1.7. See [Exporting CBOM in CycloneDX format](exporting-cbom-in-cyclonedx-format.md).

### How is risk scored?

Assets are placed in one of four risk bands based on algorithm strength, key size, quantum exposure, NIST alignment, sensitivity, key reuse, and whether keys are in an HSM or in software. The bands are **Critical**, **High**, **Medium**, and **Low**, from most to least urgent.

### How does CBOM Secure help with post-quantum readiness?

It flags quantum-vulnerable algorithms such as RSA, ECDSA, and ECDH, scores readiness for keys, certificates, and protocol cipher suites, and maps findings to NIST replacements (ML-KEM, ML-DSA, SLH-DSA). See [Using CBOM Secure for PQC readiness](using-cbom-secure-for-pqc-readiness.md).

### Which compliance frameworks are mapped?

FIPS 140-3, CMMC 2.0, CNSA 2.0, NIST IR 8547, PCI DSS 4.0, ISO 27001, and SOC 2.

### Will scans slow down production systems?

Scans are read-only and light, but HSMs, databases, and large repositories should be scanned in quiet hours at first. See [Running a first cryptographic scan](running-a-first-cryptographic-scan.md).

### How often should scans run?

Common practice is weekly for TLS endpoints, monthly for HSMs and key managers, and on every release for code. Adjust to the rate of change.

### What deployment options exist?

SaaS, cloud, on-premises, and hybrid.

### How is a CBOM different from a Software Bill of Materials (SBOM)?

An SBOM lists software components and versions. A CBOM lists the cryptography those components use, plus keys, certificates, and protocols found in the environment. Both can live in the same CycloneDX file. See [CBOM vs SBOM](../../02-General/CBOM/cbom-vs-sbom.md).

### Can CBOM Secure help after a crypto library vulnerability is announced?

Yes. Search the inventory for the affected library or function. Dependency mapping and call graph reachability show which applications actually use it, so patching can start with the exposed systems.

### What should be sent to EC support when a scan fails?

The source type, the agent name, the time of the scan, the error shown in the console, and the agent logs. Do not send passwords or tokens. See [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md).

### Is there a free way to estimate value before buying?

EC offers a free CBOM ROI calculator. See [Free EC tools](../../00-Working-with-EC-Support/free-ec-tools-csr-generator-and-decoders.md).

## Related articles

- [CBOM Secure overview](cbom-secure-overview.md)
- [How CBOM Secure works](how-cbom-secure-works.md)
- [Reading a CBOM report](reading-a-cbom-report.md)
- [CBOM vs SBOM](../../02-General/CBOM/cbom-vs-sbom.md)
- [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md)
