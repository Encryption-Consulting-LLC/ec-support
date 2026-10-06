---
title: "HSM-as-a-Service Overview"
category: "Products"
section: "HSM-as-a-Service"
article_type: "Overview"
applies_to: "Encryption Consulting HSM-as-a-Service (HSMaaS); Thales Luna, Entrust nShield, AWS CloudHSM, Azure Managed HSM and Cloud HSM, Google Cloud HSM, OCI"
summary: "Overview of EC HSM-as-a-Service: managed FIPS 140-3 HSMs (Luna, nShield, cloud HSMs), key lifecycle, HA, integrations, and the EC versus customer split."
keywords: ["HSM-as-a-Service", "HSMaaS", "managed HSM", "cloud HSM", "FIPS 140-3 HSM"]
last_reviewed: "2026-10-06"
---

# HSM-as-a-Service Overview

This article introduces Encryption Consulting (EC) HSM-as-a-Service (HSMaaS). It explains what the service includes, which HSM platforms it covers, and how responsibilities are split. It is for security architects, application owners, and teams that need HSM protection without running HSMs themselves.

## What it is

A Hardware Security Module (HSM) is a tamper-resistant device that creates, stores, and uses cryptographic keys so the keys never leave the hardware in plain form. HSMaaS gives an organization HSM-backed key protection that EC deploys, integrates, and operates. The HSMs can be in the cloud, in the customer data center, or both. The customer keeps administrative control over its keys, users, and access policies.

## Key capabilities

- **Validated hardware:** FIPS 140-3 validated HSMs. Federal Information Processing Standard (FIPS) 140-3 replaces FIPS 140-2; FIPS 140-2 certificates move to the Cryptographic Module Validation Program (CMVP) Historical list on September 21, 2026.
- **Vendor choice:** Thales Luna, Entrust nShield, AWS CloudHSM, Azure Managed HSM and Azure Cloud HSM, Google Cloud HSM, and Oracle Cloud Infrastructure (OCI) Vault HSM. EC picks the platform that fits the workload.
- **Key lifecycle management:** Generation, rotation, backup, archival, and destruction of keys under policy.
- **High availability:** Clustering, HA groups, and multi-zone designs with failover testing. See [HSMaaS high availability and backup](hsmaas-high-availability-and-backup.md).
- **Post-quantum readiness:** Support for ML-KEM and ML-DSA where the HSM firmware provides it.
- **Monitoring:** Health checks, alerts on unusual activity, and log forwarding to a Security Information and Event Management (SIEM) system.
- **Strong access control:** Multi-factor authentication (MFA) and quorum controls for sensitive actions.

## How it works

1. EC and the customer agree the HSM platform, location, and partition or key store layout.
2. EC deploys and initializes the HSMs (for example a Luna partition, an nShield Security World, or a cloud HSM cluster).
3. The customer receives credentials for its own roles (for example the Luna Crypto Officer or the AWS CloudHSM crypto user).
4. Applications connect through standard interfaces: PKCS#11, Microsoft Cryptography API: Next Generation (CNG) Key Storage Provider (KSP), and Java Cryptography Architecture and Extension (JCA/JCE) providers. See [Connecting applications to HSMaaS](connecting-applications-to-hsmaas-pkcs11-cng-jce.md).
5. EC patches firmware, monitors health, and manages backups. The customer manages its keys and application access.

## Shared responsibility model

| Area | EC responsibility | Customer responsibility |
|---|---|---|
| Hardware and hosting | Provide, rack, or subscribe to HSMs; physical security for EC-hosted units | Physical security for customer-hosted units |
| Initialization | Initialize HSM, Security World, or cluster; run key ceremonies | Name custodians; hold assigned quorum cards or Luna PIN Entry Device (PED) keys |
| Firmware and client software | Plan and apply firmware and HSM software updates | Approve change windows; update client software on application servers |
| Partitions and key stores | Create partitions, slots, or key stores to the agreed design | Request changes; manage partition user passwords |
| Application keys | Advise on key types and policy | Create, use, rotate, and delete application keys |
| Application integration | Guide and validate PKCS#11, CNG, and JCE setup | Install HSM clients, configure applications, keep credentials safe |
| Network | Run HSM-side network and firewall | Open client-side firewall paths to the HSM endpoints |
| High availability | Design and maintain clusters and HA groups | Configure applications to use HA slots or cluster endpoints |
| Backup | Run HSM backups and test restores | Agree retention; approve restores |
| Monitoring | Monitor HSM health, capacity, and tamper events | Monitor application errors and usage |
| Access and audit | Control EC operator access; keep audit logs | Review audit logs; manage own users |
| Incident response | Report HSM incidents and tamper events | Report suspected credential or key misuse at once |

## Supported integrations

Microsoft Active Directory Certificate Services (AD CS), F5 BIG-IP, CyberArk Vault, TLS offload, code signing (including EC CodeSign Secure), database Transparent Data Encryption (TDE), IoT, and cloud key managers (AWS KMS, Azure Key Vault, Google Cloud KMS) for customer-supplied key (BYOK) models. Full matrix: {{TBD: HSMaaS integration and version matrix}}.

## Deployment options

| Model | Description |
|---|---|
| Cloud HSMaaS | EC-hosted or cloud provider HSMs, no hardware for the customer to run |
| On-premises | HSMs in the customer data center, operated by EC |
| Hybrid | A mix of cloud and on-premises HSMs, for example on-premises primary with cloud DR |

Regions, SLAs, and pricing: {{TBD: HSMaaS hosting regions}}, {{TBD: HSMaaS availability SLA}}, {{TBD: HSMaaS pricing model}}. A 15-day free trial is offered on the EC website.

## Getting help

Open a case in the support portal. For HSM cases, see [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md). Never send HSM passwords, PED keys, or smart cards to support.

## Related articles

- [Onboarding to HSMaaS](onboarding-to-hsmaas.md)
- [Connecting applications to HSMaaS: PKCS#11, CNG, and JCE](connecting-applications-to-hsmaas-pkcs11-cng-jce.md)
- [HSMaaS high availability and backup](hsmaas-high-availability-and-backup.md)
- [HSMaaS FAQ](hsmaas-faq.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
- [FIPS 140-3 security levels explained](../../02-General/HSM/fips-140-3-security-levels-explained.md)
