---
title: "Encryption Assessment"
category: "Services"
section: "Assessments"
article_type: "Service Guide"
applies_to: "Data at rest, data in transit, and key management controls in on-premises, cloud, and hybrid environments"
summary: "What the EC Encryption Assessment reviews, how it runs, the frameworks it uses, the deliverables produced, and what the customer must provide to start."
keywords: ["encryption assessment", "key management assessment", "data protection gap analysis", "PCI DSS encryption", "NIST SP 800-57"]
last_reviewed: "2026-10-06"
---

# Encryption Assessment

This article describes the Encryption Assessment from Encryption Consulting (EC). The assessment gives an independent view of how well sensitive data is encrypted and how well the keys are managed. It is for security, risk, and compliance teams who need a clear baseline before an audit, a platform change, or a new data protection program.

## What the service covers

The assessment looks at encryption and key management across the environment and answers three questions: where is sensitive data, is it protected, and are the keys managed safely. Areas in scope usually include:

- **Data at rest:** databases, file shares, storage arrays, backups, laptops, and cloud storage.
- **Data in transit:** Transport Layer Security (TLS) versions and cipher suites, internal service traffic, and file transfers.
- **Key management:** key generation, storage, distribution, rotation, backup, recovery, and destruction.
- **Key storage:** use of Hardware Security Modules (HSMs), cloud Key Management Services (KMS), and software keystores.
- **Algorithms and key lengths:** weak or deprecated algorithms, and algorithms that are vulnerable to quantum computers.
- **Governance:** policies, roles, separation of duties, and audit logging.
- **Data discovery (optional):** a mapping exercise to find where sensitive data is stored.

## Who it is for

- Organizations preparing for a Payment Card Industry Data Security Standard (PCI DSS) assessment or another audit.
- Organizations that grew through mergers and now have many encryption tools.
- Teams planning a move to a central key manager or to the cloud.
- Teams that want a baseline before starting post-quantum cryptography (PQC) planning.

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and data gathering | Kickoff, stakeholder list, document request, and questionnaires. | Document register and interview schedule |
| 2. Current state assessment | Interviews and workshops. Review of configurations and reports. Mapping of encryption by data store and data flow. | Current state summary |
| 3. Gap analysis | Compare the current state with NIST Special Publication (SP) 800-57 (key management), PCI DSS v4.0.1 Requirements 3 and 4, Federal Information Processing Standard (FIPS) 140-3 for cryptographic modules, and the customer's own policies. | Gap analysis and risk register |
| 4. Recommendations and roadmap | Rate each finding by risk and effort. Group fixes into "do now", "do next", and "do later". | Prioritized roadmap |
| 5. Readout | Present results to the technical team and to leadership. | Final report and executive briefing |

> **Note:** PCI DSS v4.0.1 Requirement 12.3.3 asks organizations to document and review the cryptographic cipher suites and protocols in use at least once every 12 months. The assessment output can support that review.

## Deliverables

- Current state report with an encryption coverage map
- Risk register listing each finding, its risk rating, and an owner
- Gap analysis against the agreed frameworks
- Prioritized remediation roadmap
- Executive summary
- Optional: data discovery results and a cryptographic inventory

## What EC needs from the customer

**Stakeholders**

- Executive sponsor and a day-to-day project lead.
- Owners for databases, storage, backups, applications, networks, cloud, identity, and key management.
- A compliance or risk contact who knows the audit scope.

**Documents**

- Encryption, key management, and data classification policies.
- Architecture and data flow diagrams for in-scope systems.
- A list of HSMs, key managers, and cloud KMS accounts.
- Prior audit and penetration test findings.

**Access**

- Interview time with each owner.
- Read-only access to key manager and cloud KMS reports, when agreed.
- Approval to run discovery tools, if data discovery is in scope. EC tools such as CBOM Secure can support this. See [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md).

## Typical timeline

Duration depends on the number of systems and locations in scope. Typical duration: {{TBD: typical duration for an encryption assessment}}.

## How to request

Request a scoping call through EC. See [How to request a service engagement](how-to-request-a-service-engagement.md).

## Related articles

- [Encryption advisory services](encryption-advisory-services.md)
- [Compliance advisory services](compliance-advisory-services.md)
- [Cloud data protection services](cloud-data-protection-services.md)
- [NIST SP 800-57 key management guidelines](../05-Popular-Right-Now/nist-sp-800-57-key-management-guidelines.md)
- [What is a CBOM](../02-General/CBOM/what-is-a-cbom.md)
