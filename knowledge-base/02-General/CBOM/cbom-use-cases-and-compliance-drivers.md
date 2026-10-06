---
title: "CBOM Use Cases and Compliance Drivers"
category: "General"
section: "CBOM"
article_type: "Concept"
applies_to: "Security, risk, audit and compliance teams; PCI DSS v4.0, DORA, NIS2, ISO/IEC 27001:2022, US federal PQC mandates, CNSA 2.0"
summary: "Common CBOM use cases (PQC readiness, audits, outage prevention, incident response) and the regulations and standards that drive cryptographic inventory."
keywords: ["CBOM use cases", "CBOM compliance", "cryptographic inventory requirement", "PCI DSS 12.3.3", "DORA cryptography", "NIS2 cryptography", "OMB M-23-02"]
last_reviewed: "2026-10-06"
---

# CBOM Use Cases and Compliance Drivers

A Cryptographic Bill of Materials (CBOM) is useful well beyond post-quantum cryptography (PQC) planning. This article lists the most common use cases and the regulations and standards that expect organizations to know and control their cryptography. It is for security leaders, risk and compliance teams, and auditors.

## What it is

A CBOM is a current, machine-readable inventory of algorithms, keys, certificates, protocols and related cryptographic material, linked to the systems that use them. See [What is a CBOM?](what-is-a-cbom.md). The use cases below all depend on that single source of truth.

## Why it matters

Regulators and standards bodies increasingly ask two questions: "What cryptography is in use?" and "How is it controlled?" A CBOM answers both with evidence, instead of with spreadsheets that are out of date.

## Use cases

| Use case | How the CBOM helps | Typical users |
|---|---|---|
| PQC readiness and migration | Finds every quantum-vulnerable algorithm (RSA, ECDSA, ECDH, DH), links it to systems and data, and tracks progress | PQC program, architects |
| Crypto policy enforcement | Compares the live estate against approved, deprecated and disallowed algorithm lists; can block builds in CI/CD | Security architecture, DevSecOps |
| Audit evidence | Produces an exportable inventory for auditors | Compliance, internal audit |
| Certificate outage prevention | Shows certificates, owners and expiry dates across the estate | PKI and operations teams |
| Incident response | When an algorithm, library or CA is found to be weak or distrusted, shows every affected system quickly | Security operations |
| Key management hygiene | Finds keys stored outside HSMs or key managers, hard-coded secrets, and keys that are never rotated | Key management, application teams |
| Mergers and acquisitions | Gives a quick view of an acquired company's crypto risk | Security leadership |
| Cloud migration | Shows which keys and certificates must move, and to which key services | Cloud and platform teams |
| Vendor and supply chain risk | Supplier CBOMs show the cryptography inside purchased products | Procurement, vendor risk |

## Compliance drivers

| Driver | What it expects | Link to CBOM |
|---|---|---|
| US National Security Memorandum 10 (NSM-10, May 2022) | Federal agencies prepare for migration to quantum-resistant cryptography | Inventory of quantum-vulnerable systems is the first step |
| OMB Memorandum M-23-02 (November 2022) | Federal agencies submit an annual inventory of quantum-vulnerable cryptographic systems | A CBOM provides this inventory |
| Quantum Computing Cybersecurity Preparedness Act (December 2022) | Federal migration to PQC | Requires knowing what to migrate |
| NSA CNSA 2.0 | National Security Systems move to ML-KEM-1024, ML-DSA-87, LMS/XMSS, AES-256, SHA-384/512; new acquisitions compliant from January 1, 2027; all NSS quantum resistant by 2035 | Shows which systems are not yet compliant |
| NIST IR 8547 (draft) | Quantum-vulnerable algorithms deprecated after 2030, disallowed after 2035 | Identifies affected algorithms and key sizes |
| PCI DSS v4.0 | Requirement 12.3.3: document and review cipher suites and protocols in use at least once every 12 months. Requirement 4.2.1.1: keep an inventory of trusted keys and certificates used to protect cardholder data in transit | A CBOM provides the inventory and review evidence |
| EU DORA (Digital Operational Resilience Act) | Financial entities manage ICT risk, including cryptographic controls and key management | Inventory supports policy, key lifecycle and audit evidence |
| EU NIS2 Directive | Article 21 requires policies and procedures on the use of cryptography and, where appropriate, encryption | Shows how cryptography is used and controlled |
| EU coordinated PQC roadmap (2025) | Member states start transition by the end of 2026, protect high-risk use cases by 2030, and complete as much as feasible by 2035 | Inventory is the first step in the roadmap |
| ISO/IEC 27001:2022 | Annex A control 8.24, Use of cryptography: rules for effective use of cryptography and key management | Evidence for the control |
| FIPS 140-3 and NIST SP 800-57 | Use of validated modules and sound key management | Shows which keys sit in validated HSMs and which do not |

> **Note:** This table is a summary, not legal advice. Confirm the exact wording and scope of each requirement with the compliance team. EC Compliance Advisory Services can help map requirements to controls. See [Compliance advisory services](../../03-Services/compliance-advisory-services.md).

## How it works in practice

1. **Pick the driver.** Start with the most pressing requirement, such as a PCI DSS assessment or a PQC deadline.
2. **Define scope.** List the systems the requirement covers.
3. **Run discovery** across those systems and produce a CBOM.
4. **Map findings to controls.** Tag each finding with the requirement it affects.
5. **Fix and track.** Assign owners, set dates, and re-scan to prove closure.
6. **Report.** Export evidence for auditors and leadership.

## Key terms

| Term | Meaning |
|---|---|
| CBOM | Cryptographic Bill of Materials |
| DORA | Digital Operational Resilience Act (EU Regulation 2022/2554) |
| NIS2 | EU Directive 2022/2555 on network and information security |
| CNSA 2.0 | NSA Commercial National Security Algorithm Suite 2.0 |
| NSS | National Security Systems |

## Common questions

### Does any regulation require a CBOM by name?

Most rules require an inventory of cryptography or keys, not a file called "CBOM". A CycloneDX 1.6 CBOM is a practical, standard way to meet those inventory requirements.

### How often should the CBOM be refreshed for compliance?

At least as often as the strictest requirement (for example yearly for PCI DSS 12.3.3). Continuous scanning is better because the estate changes daily.

### How can the business case be estimated?

EC offers a free CBOM ROI calculator. See [Free EC tools](../../00-Working-with-EC-Support/free-ec-tools-csr-generator-and-decoders.md). EC's CBOM Secure produces the inventory; see [Using CBOM Secure for PQC readiness](../../01-Products/CBOM-Secure/using-cbom-secure-for-pqc-readiness.md).

## Related articles

- [What is a CBOM?](what-is-a-cbom.md)
- [How CBOM works](how-cbom-works.md)
- [Quantum risk assessment and Mosca's theorem](../Post-Quantum-Cryptography/quantum-risk-assessment-and-moscas-theorem.md)
- [CNSA 2.0 timeline and requirements](../../05-Popular-Right-Now/cnsa-2-0-timeline-and-requirements.md)
- [NIST SP 800-57 key management guidelines](../../05-Popular-Right-Now/nist-sp-800-57-key-management-guidelines.md)
