---
title: "HSM Services: Deployment and Integration"
category: "Services"
section: "HSM Services"
article_type: "Service Guide"
applies_to: "Thales Luna, Entrust nShield, Utimaco, Crypto4A, AWS CloudHSM, Azure Dedicated HSM and Managed HSM, and other HSM platforms"
summary: "How EC HSM services assess, select, deploy, integrate, and support Hardware Security Modules, including FIPS 140-3 alignment, phases, and deliverables."
keywords: ["HSM services", "HSM deployment", "HSM integration", "FIPS 140-3", "Thales Luna", "Entrust nShield"]
last_reviewed: "2026-10-06"
---

# HSM Services: Deployment and Integration

This article describes the Hardware Security Module (HSM) services offered by Encryption Consulting (EC). EC helps organizations assess, choose, deploy, integrate, and support HSMs that protect their most important keys. It is for security architects, PKI owners, and infrastructure teams that run or plan to run HSMs.

## What the service covers

EC delivers vendor-neutral HSM services in four areas:

- **Assessment and gap analysis:** review current HSMs, key management practices, and maturity. Check firmware, partitions, quorum or card sets, backups, high availability, and monitoring.
- **Strategy and selection:** match HSM options to business and compliance needs. Compare on-premises HSMs, cloud HSMs, and HSM-as-a-Service. Help with requirements and vendor evaluation.
- **Design and implementation:** architect the HSM deployment, install and configure appliances, set up Federal Information Processing Standard (FIPS) 140-3 Level 2 or Level 3 operation, and run key ceremonies.
- **Integration:** connect applications through standard interfaces, such as Public-Key Cryptography Standards #11 (PKCS#11), Microsoft Cryptography API: Next Generation (CNG) Key Storage Provider (KSP), and Java Cryptography Extension (JCE). Common integrations include Microsoft Active Directory Certificate Services (AD CS), code signing, databases with Transparent Data Encryption (TDE), and TLS offload.
- **Support and optimization:** monitoring, health checks, firmware updates, performance tuning, key rotation, and compliance reporting.

Platforms EC works with include Thales Luna, Entrust nShield, Utimaco, Crypto4A, AWS CloudHSM, and Azure Dedicated HSM and Azure Managed HSM.

> **Note:** FIPS 140-2 certificates move to the Cryptographic Module Validation Program (CMVP) Historical list on September 21 2026. New HSM purchases should target FIPS 140-3 validated modules.

## Who it is for

- Organizations buying their first HSMs or replacing end-of-life models.
- Teams moving CA keys or application keys from software into an HSM.
- Organizations that need to meet Payment Card Industry Data Security Standard (PCI DSS), FIPS 140-3, or code signing key storage rules.
- Teams that want to move to a cloud HSM or to [HSM-as-a-Service](../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md).

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and data gathering | Collect HSM inventory, use cases, key types, and compliance needs. | Requirements and inventory |
| 2. Current state assessment | Review configuration, firmware, roles, quorum, backups, high availability, and logging. | Current state report |
| 3. Gap analysis | Compare with FIPS 140-3, NIST Special Publication (SP) 800-57, PCI DSS v4.0.1, and vendor best practice. | Gap analysis and risk register |
| 4. Strategy and selection | Define target architecture. Evaluate vendors and deployment models. | Target architecture and vendor comparison |
| 5. Implementation | Install, configure, and initialize HSMs. Run key ceremonies. Set up high availability and backup. | Build records and ceremony records |
| 6. Integration and testing | Connect applications. Test failover, backup, and restore. | Integration guides and test results |
| 7. Handover and support | Train administrators and hand over runbooks. Start ongoing support if in scope. | Runbooks and training |

## Deliverables

- HSM current state report and risk register
- Target architecture and deployment design
- Vendor evaluation (when in scope)
- Key ceremony scripts and records
- Integration guides for each connected application
- Runbooks, for example firmware update, quorum change, backup and restore, and card replacement
- Test results for high availability and recovery
- Administrator training (EC also offers formal Thales Luna and Entrust nShield training)

## What EC needs from the customer

**Stakeholders**

- HSM owner and HSM administrators.
- Application owners for each integration.
- Key custodians and witnesses for ceremonies.
- Security, compliance, data center, and network contacts.

**Documents**

- HSM models, serial numbers, firmware versions, and support contracts.
- Current key management policy and any key ceremony records.
- Network diagrams and firewall change process.

**Access and resources**

- Data center access or remote hands for appliance installation.
- Rack space, power, and network ports for appliances.
- Client servers for HSM software installation.
- Card sets, PIN Entry Device (PED) keys, or smart cards ready before ceremonies.

> **Warning:** Never send HSM card set passphrases, PED keys, or partition passwords to EC through a support case or email.

## Typical timeline

Duration depends on the number of HSMs, sites, and integrations. EC confirms the timeline during scoping. Hardware lead times depend on the vendor.

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md).

## Related articles

- [What is an HSM](../02-General/HSM/what-is-an-hsm.md)
- [FIPS 140-3 security levels explained](../02-General/HSM/fips-140-3-security-levels-explained.md)
- [Key ceremonies explained](../02-General/HSM/key-ceremonies-explained.md)
- [Configuring AD CS with an HSM KSP](../04-Featured-Articles/HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
- [HSM health check and monitoring](../04-Featured-Articles/HSM-Runbooks/hsm-health-check-and-monitoring.md)
- [HSM-as-a-Service overview](../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md)
