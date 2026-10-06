---
title: "What Is an HSM and How Does It Work? Hardware Security Modules Explained"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Concept"
applies_to: "Hardware Security Modules (Entrust nShield, Thales Luna, cloud HSMs), PKI, code signing, payments, key management"
summary: "A plain-language guide to Hardware Security Modules (HSMs): how they protect keys, common use cases, HSM types, FIPS 140-3 levels, and how to choose one."
keywords: ["what is an HSM", "hardware security module", "HSM use cases", "cloud HSM", "FIPS 140-3", "key management"]
primary_keyword: "what is an HSM"
secondary_keywords: ["hardware security module explained", "how does an HSM work", "HSM vs KMS", "cloud HSM", "HSM use cases PKI", "FIPS 140-3 HSM", "network HSM"]
last_reviewed: "2026-10-06"
---

# What Is an HSM and How Does It Work? Hardware Security Modules Explained

A Hardware Security Module (HSM) is a tamper-resistant device that creates, stores, and uses cryptographic keys without ever exposing them in plain form. HSMs protect the most important keys in an organization, such as Certificate Authority (CA) keys, code signing keys, and payment keys. This article explains how HSMs work, where they are used, and how to choose one. It is written for IT and security staff who are new to HSMs, and for managers who need a clear overview.

## Key takeaways

- An HSM keeps private keys inside protected hardware. Applications send data in and get results out, but the key never leaves.
- HSMs are tested against FIPS 140-3. Level 3 is the common choice for enterprise and PKI use.
- Common uses include PKI and CA keys, code signing, TLS key protection, database and payment encryption, and key management.
- Form factors include network appliances, PCIe cards, USB devices, and cloud HSM services.
- Applications connect through standard interfaces such as PKCS#11, Microsoft CNG, and Java JCE.
- HSMs need careful operations: quorum-based administration, backups, firmware updates, and monitoring.

## What is a hardware security module?

An HSM is a dedicated computer built for one job: protecting cryptographic keys and doing cryptographic operations safely. It has:

- A hardened enclosure with sensors that detect physical tampering. Many models erase keys if tampering is detected.
- A secure processor and true random number generator for strong key generation.
- Firmware that only allows approved operations, defined by policy.
- Strong access controls, often requiring several people (a quorum) for sensitive actions.

Software keys stored in files can be copied by anyone with administrator access or malware on the server. Keys inside an HSM cannot be copied out in usable form.

## How does an HSM work?

A typical signing operation works like this:

1. An application, such as a CA, calls a cryptographic interface (for example PKCS#11 or Microsoft CNG).
2. The client library sends the request to the HSM over a secure channel.
3. The HSM checks that the caller is authorized to use the requested key.
4. The HSM performs the signature inside its secure boundary.
5. The HSM returns only the result (the signature) to the application.

The private key stays inside the HSM the whole time. For backup and high availability, keys are exported only in encrypted form, wrapped by keys that themselves stay inside HSM hardware or vendor-specific secure structures.

## What are HSMs used for?

| Use case | What the HSM protects |
|---|---|
| Public Key Infrastructure (PKI) | Root and issuing CA private keys, Online Certificate Status Protocol (OCSP) signing keys |
| Code signing | Private keys for software, firmware, and container signing (required for public code signing certificates) |
| TLS and web | Server private keys for high-value sites and load balancers |
| Database and application encryption | Master keys for Transparent Data Encryption (TDE) and application-level encryption |
| Payments | PIN processing and card keys (payment HSMs) |
| Cloud key management | Customer-supplied keys (BYOK) and customer-held keys (HYOK) for cloud services |
| Post-quantum cryptography | New ML-KEM and ML-DSA keys, and stateful LMS or XMSS signing state |

## What types of HSM are available?

| Type | Description | Typical use |
|---|---|---|
| Network-attached HSM | Rack-mounted appliance shared by many applications over the network | Enterprise PKI, code signing, shared services |
| PCIe card HSM | Card installed in a single server | Offline root CAs, single high-performance applications |
| USB HSM | Small portable device | Offline root CAs, small deployments, labs |
| Cloud HSM | Dedicated HSM hardware offered as a cloud service | Cloud workloads, HSM capacity without owning hardware |
| Payment HSM | Specialized for card and PIN standards | Banking and payments |

Well-known general-purpose families include Entrust nShield and Thales Luna. Cloud options include AWS CloudHSM, Azure Managed HSM, and Google Cloud HSM.

## What are FIPS 140-3 security levels?

Federal Information Processing Standard (FIPS) 140-3 defines four security levels for cryptographic modules:

| Level | Summary |
|---|---|
| Level 1 | Basic security, approved algorithms, no physical protection requirements |
| Level 2 | Tamper evidence and role-based authentication |
| Level 3 | Tamper resistance and response, identity-based authentication, separation of key entry |
| Level 4 | Full envelope protection against physical and environmental attacks |

FIPS 140-2 certificates moved to the CMVP Historical list on September 21, 2026, so new purchases should target FIPS 140-3. See [FIPS 140-2 sunset and FIPS 140-3 migration](fips-140-2-sunset-september-2026-fips-140-3-migration.md).

## What is the difference between an HSM and a KMS?

A Key Management Service (KMS) or key manager organizes keys: it tracks, rotates, and controls access to many keys, often for cloud services. An HSM is the hardware root of trust that protects keys and performs operations. Many cloud KMS products use HSMs underneath. Organizations that need exclusive control, specific FIPS levels, or custom key ceremonies usually choose a dedicated HSM.

## How do applications connect to an HSM?

Applications use standard interfaces provided by the HSM vendor client software:

- **PKCS#11** for Linux, Unix, and many cross-platform applications.
- **Microsoft Cryptography API: Next Generation (CNG)** and its Key Storage Provider (KSP) for Windows, including Active Directory Certificate Services (AD CS).
- **Java Cryptography Extension (JCE)** for Java applications.
- **Vendor REST APIs** for some cloud HSMs.

## How to choose an HSM

1. **Define the use cases** and performance needs (operations per second).
2. **Check compliance needs**, such as FIPS 140-3 Level 3, Common Criteria, or PCI requirements.
3. **Check algorithm support**, including post-quantum algorithms on the vendor roadmap.
4. **Decide on deployment**: on-premises, cloud, or HSM-as-a-Service.
5. **Plan operations**: administrator quorum, backup, high availability, firmware updates, and monitoring.
6. **Check integrations** with CAs, code signing tools, databases, and cloud key services.

> **Tip:** Plan key backup before generating production keys. A lost HSM key with no backup cannot be recovered.

## How EC can help

- [HSM-as-a-Service overview](../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md): managed HSMs in cloud or on-premises.
- [What is an HSM (technical concept article)](../02-General/HSM/what-is-an-hsm.md): deeper detail for practitioners.
- [HSM services: deployment and integration](../03-Services/hsm-services-deployment-and-integration.md): selection, deployment, and support.
- [Configuring AD CS with an HSM KSP](../04-Featured-Articles/HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md): protect CA keys with an HSM.
- [Key ceremonies explained](../02-General/HSM/key-ceremonies-explained.md): how root keys are created safely.

## Frequently asked questions

### What does HSM stand for?

HSM stands for Hardware Security Module, a tamper-resistant device that generates, stores, and uses cryptographic keys.

### Why use an HSM instead of software keys?

Keys in software can be copied by attackers or administrators. An HSM keeps keys inside protected hardware, enforces access controls, and provides audit evidence that auditors and standards often require.

### Is a cloud HSM as secure as an on-premises HSM?

Cloud HSMs use validated HSM hardware and can meet FIPS 140-3 Level 3. The main differences are physical control and the shared responsibility model with the cloud provider.

### Are HSMs required for code signing certificates?

Yes. Since June 1, 2023, CA/Browser Forum rules require private keys for publicly trusted code signing certificates to be generated and stored in FIPS 140-2 Level 2, Common Criteria EAL4+, or equivalent hardware.

### Do HSMs support post-quantum cryptography?

Many vendors now offer firmware with ML-KEM and ML-DSA, and support for LMS or XMSS. Validation status varies, so check the vendor documentation for the installed version.
