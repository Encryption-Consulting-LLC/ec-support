---
title: "PQC Advisory and Readiness Assessment"
category: "Services"
section: "Advisory Services"
article_type: "Service Guide"
applies_to: "Enterprise cryptography, PKI, HSMs, applications, and protocols planning a post-quantum migration"
summary: "How the EC PQC Advisory Service finds quantum-vulnerable cryptography, rates risk, and builds a phased migration roadmap aligned with FIPS 203, 204, and 205."
keywords: ["PQC advisory", "post-quantum readiness assessment", "quantum risk", "PQC migration roadmap", "crypto-agility"]
last_reviewed: "2026-10-06"
---

# PQC Advisory and Readiness Assessment

This article describes the Post-Quantum Cryptography (PQC) Advisory Service and Readiness Assessment from Encryption Consulting (EC). The service helps an organization find cryptography that a future quantum computer could break, decide what to fix first, and plan a safe migration. It is for security leaders, architects, and PKI and application owners who must plan for quantum-safe cryptography.

## What the service covers

- **Cryptographic discovery and classification:** find certificates, keys, algorithms, protocols, and libraries across the environment and flag those that are quantum-vulnerable, such as RSA, Elliptic Curve Digital Signature Algorithm (ECDSA), and Elliptic Curve Diffie-Hellman (ECDH).
- **Inventory:** build a Cryptographic Bill of Materials (CBOM). EC can use CBOM Secure for automated scanning.
- **Risk assessment:** rate assets by data sensitivity, how long data must stay secret, and exposure to "harvest now, decrypt later" attacks.
- **Strategy and crypto-agility design:** an architecture that lets algorithms change without large rewrites.
- **Roadmap:** a phased migration plan with milestones.
- **Proof of Concept (POC):** test of the NIST algorithms, Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM, FIPS 203), Module-Lattice-Based Digital Signature Algorithm (ML-DSA, FIPS 204), and Stateless Hash-Based Digital Signature Algorithm (SLH-DSA, FIPS 205), including hybrid modes.
- **Implementation planning and pilots:** validate changes on a small scale before an enterprise rollout.
- **Governance:** policies and ownership that keep the program on track.

A free 20-question PQC Readiness Assessment is also available from EC as a quick self-check before a full engagement. See [Free EC tools](../00-Working-with-EC-Support/free-ec-tools-csr-generator-and-decoders.md).

## Who it is for

- Organizations that must meet NSA Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) timelines.
- Organizations planning for NIST IR 8547 (draft), which proposes deprecating quantum-vulnerable algorithms after 2030 and disallowing them after 2035.
- Organizations that hold data that must stay confidential for many years, such as health, financial, or government data.
- PKI and HSM owners who need to know when their platforms will support PQC.

## Engagement phases

EC follows an eight-step approach:

| Phase | Main activities | Output |
|---|---|---|
| 1. Project kickoff | Confirm scope, stakeholders, and success criteria. | Project plan |
| 2. Cryptographic discovery | Interviews, questionnaires, and automated scans of code, keystores, HSMs, key managers, and cloud services. | Cryptographic inventory (CBOM) |
| 3. Risk assessment | Rate quantum risk for each asset. Use data longevity classification and Mosca's theorem. | Quantum risk register |
| 4. Strategy development | Define target algorithms, hybrid approach, and crypto-agility principles. Compare with NIST FIPS 203, 204, 205, NIST SP 800-227, and CNSA 2.0. | PQC strategy |
| 5. Roadmap design | Order the work by risk and dependency. | Prioritized migration roadmap |
| 6. Proof of concept | Test PQC or hybrid algorithms in a lab with key systems, such as PKI, HSM, TLS, and code signing. | POC results |
| 7. Implementation planning | Plan pilots and rollout with minimal disruption. | Implementation plan |
| 8. Crypto-agility enablement | Put governance, standards, and tooling in place to support future algorithm changes. | Governance framework and policies |

## Deliverables

- Cryptographic asset inventory with quantum vulnerability flags
- Quantum risk register and data longevity classification
- PQC readiness score, for example against the [PQC maturity model](../02-General/Post-Quantum-Cryptography/pqc-maturity-model.md)
- PQC strategy and target architecture
- Phased migration roadmap with milestones (EC notes that most enterprise roadmaps span 12 to 36 months)
- POC results and recommendations
- Governance framework and updated cryptographic policy
- Executive summary

## What EC needs from the customer

**Stakeholders**

- Executive sponsor and program lead.
- Owners for PKI, HSMs, key management, applications, development, networks, cloud, and procurement or vendor management.
- Risk and compliance contacts.

**Documents**

- Cryptographic and key management policies.
- Application and system inventory, and data classification.
- Vendor list for critical products, to check vendor PQC plans.

**Access**

- Approval and access to run discovery scans on agreed repositories, hosts, and keystores.
- Lab environment for the POC.
- Interview time with system owners.

## Typical timeline

Duration depends on the size of the estate and how many phases are in scope. Typical duration for the readiness assessment: {{TBD: typical duration for a PQC readiness assessment}}.

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md).

## Related articles

- [What is post-quantum cryptography](../02-General/Post-Quantum-Cryptography/what-is-post-quantum-cryptography.md)
- [Building a PQC migration roadmap](../02-General/Post-Quantum-Cryptography/building-a-pqc-migration-roadmap.md)
- [Quantum risk assessment and Mosca's theorem](../02-General/Post-Quantum-Cryptography/quantum-risk-assessment-and-moscas-theorem.md)
- [Using CBOM Secure for PQC readiness](../01-Products/CBOM-Secure/using-cbom-secure-for-pqc-readiness.md)
- [PQC readiness checklist 2026](../05-Popular-Right-Now/pqc-readiness-checklist-2026.md)
