---
title: "Cloud Data Protection Services"
category: "Services"
section: "Advisory Services"
article_type: "Service Guide"
applies_to: "Amazon Web Services (AWS), Microsoft Azure, Google Cloud, and multi-cloud environments"
summary: "How EC Cloud Data Protection Services assess, plan, and implement encryption and key management in AWS, Azure, and Google Cloud, including BYOK and HYOK."
keywords: ["cloud data protection", "cloud key management", "BYOK", "HYOK", "AWS KMS", "Azure Key Vault", "Google Cloud KMS"]
last_reviewed: "2026-10-06"
---

# Cloud Data Protection Services

This article describes the Cloud Data Protection Services from Encryption Consulting (EC). EC helps organizations protect sensitive data in Amazon Web Services (AWS), Microsoft Azure, and Google Cloud with consistent encryption and key management. It is for cloud architects, security teams, and compliance owners working in single-cloud or multi-cloud environments.

## What the service covers

The service has three modules that can run together or on their own:

- **Cloud data protection assessment:** review how data is encrypted and how keys are managed in each cloud. Identify risks and suggest fixes.
- **Cloud data protection strategy:** design a consistent approach for all clouds that meets security and compliance needs.
- **Cloud data protection implementation:** deploy and configure the chosen controls and document how to run them.

Topics often in scope:

- Use of cloud Key Management Services (KMS): AWS Key Management Service, Azure Key Vault and Azure Managed HSM, and Google Cloud Key Management Service (Cloud KMS) with Cloud HSM.
- Key ownership models:
  - **Provider-managed keys:** the cloud provider creates and manages the keys.
  - **Customer-managed keys:** keys live in the cloud KMS but the customer controls their policy and lifecycle.
  - **BYOK (customer-supplied key import):** the customer generates keys, often in its own Hardware Security Module (HSM), and imports them into the cloud KMS.
  - **HYOK (customer-held keys) or external key management:** keys stay outside the cloud provider, for example with AWS KMS External Key Store or Google Cloud External Key Manager. Check the provider documentation for supported services.
- Key policies, access control, separation of duties, and key rotation.
- Encryption for storage, databases, and backups, and Transport Layer Security (TLS) for data in transit.
- Logging and monitoring of key use.
- Multi-cloud consistency and central key management.

## Who it is for

- Organizations moving regulated data to the cloud.
- Teams that run workloads in more than one cloud and need one key management approach.
- Organizations that must prove control of their keys to regulators or customers.
- Teams evaluating BYOK or HYOK.

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and data gathering | Identify cloud accounts, subscriptions, projects, and sensitive data stores. | Scope and inventory |
| 2. Current state assessment | Review encryption settings, key types, key policies, rotation, and logging in each cloud. | Current state report |
| 3. Gap analysis | Compare with NIST Special Publication (SP) 800-57, Payment Card Industry Data Security Standard (PCI DSS) v4.0.1, Federal Information Processing Standard (FIPS) 140-3, provider best practice, and internal policy. | Gap analysis and risk register |
| 4. Recommendations and roadmap | Group risks into "do now", "do next", and "do later". | Prioritized roadmap |
| 5. Strategy and target architecture | Choose key ownership models per data class. Design central key management. | Target architecture |
| 6. Implementation support | Configure KMS, HSM, BYOK or HYOK, policies, and monitoring. | Deployment guides and runbooks |

## Deliverables

- Cloud data protection assessment report
- Risk register with "do now", "do next", and "do later" priorities
- Cloud key management strategy and target architecture
- Prioritized roadmap
- Technical deployment guides
- Operations and maintenance runbooks

## What EC needs from the customer

**Stakeholders**

- Cloud platform owners for each provider.
- Security architecture, identity, and data owners.
- Compliance contact.

**Documents**

- Cloud architecture diagrams and account or subscription structure.
- Data classification policy and list of sensitive data stores.
- Encryption and key management policies.

**Access**

- Read-only access to cloud consoles or exported configuration reports, under the customer's access policy.
- Interview time with cloud and application teams.
- For implementation: an agreed change process and appropriate deployment access.

## Typical timeline

Duration depends on the number of clouds, accounts, and data stores. EC confirms the timeline during scoping.

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md).

## Related articles

- [Encryption advisory services](encryption-advisory-services.md)
- [Enterprise encryption platforms](enterprise-encryption-platforms.md)
- [HSM services: deployment and integration](hsm-services-deployment-and-integration.md)
- [HSM-as-a-Service overview](../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md)
- [Compliance advisory services](compliance-advisory-services.md)
