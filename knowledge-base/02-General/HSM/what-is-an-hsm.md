---
title: "What Is an HSM"
category: "General"
section: "HSM"
article_type: "Concept"
applies_to: "Hardware Security Modules: Entrust nShield, Thales Luna, cloud HSMs (AWS CloudHSM, Azure, Google Cloud HSM)"
summary: "What a Hardware Security Module (HSM) is, how it protects cryptographic keys, common form factors, APIs such as PKCS#11 and CNG, and typical use cases."
keywords: ["what is an HSM", "hardware security module", "PKCS#11", "key protection", "FIPS 140-3 HSM"]
last_reviewed: "2026-10-06"
---

# What Is an HSM

This article explains what a Hardware Security Module (HSM) is, how it keeps keys safe, and where organizations use one. It is for administrators, developers, and security staff who are starting to work with HSMs or need to explain them to others.

## What it is

An HSM is a dedicated, hardened computer built to generate, store, and use cryptographic keys. Keys are created inside the HSM and, for sensitive keys, never leave it in plain form. Applications send data to the HSM and ask it to sign, decrypt, or wrap that data. The HSM returns the result, not the key.

HSMs are designed to resist physical and logical attacks. Most enterprise HSMs are validated under Federal Information Processing Standard (FIPS) 140-3 or the older FIPS 140-2, and some also hold Common Criteria certification.

## Why it matters

Software keys stored in files or operating system key stores can be copied by malware or anyone with administrator access. Once copied, the theft is often invisible. An HSM changes this:

- **Keys stay inside a protected boundary.** Even administrators of the host server cannot extract them.
- **Use is controlled.** Keys can require one or more authorized people (a quorum) before they are loaded or used.
- **Activity is logged.** Many HSMs keep tamper-evident audit logs.
- **Compliance.** Standards and rules such as PCI DSS, eIDAS, the CA/Browser Forum code signing requirements, and many internal policies expect or require hardware key protection.

## How it works

1. **Initialization.** Administrators initialize the HSM and create its security domain (for example an Entrust nShield Security World or a Thales Luna partition). Administrative roles and quorums are defined at this step.
2. **Client connection.** Application servers install the HSM client software and establish a trusted connection to the HSM, often with mutual authentication.
3. **Key generation.** An application asks the HSM to create a key. The HSM uses its internal random number generator and stores the key internally or as an encrypted blob that only the HSM can open.
4. **Key use.** The application calls a standard API. The HSM checks that the caller is authorized, performs the operation inside its boundary, and returns the output.
5. **Backup and recovery.** Keys are backed up in encrypted form (for example nShield key blobs protected by the Security World, or Luna partition backups to a backup HSM). The backup is useless without the HSM security domain and its credentials.
6. **Tamper response.** If the device detects physical tampering, it can erase its secrets.

## Form factors

| Type | Description | Example |
|---|---|---|
| Network-attached | Appliance on the network shared by many clients | nShield Connect, nShield 5c, Luna Network HSM |
| PCIe card | Card installed inside one server | nShield Solo, nShield 5s, Luna PCIe HSM |
| USB | Small, portable device, often for offline roots | nShield Edge, Luna USB HSM |
| Cloud HSM | Dedicated or managed HSM run by a cloud provider | AWS CloudHSM, Azure Managed HSM, Google Cloud HSM, Thales Data Protection on Demand (DPoD) |

## Common APIs

| API | Used by |
|---|---|
| PKCS#11 (Cryptoki) | Linux and cross-platform applications, OpenSSL providers, Java via SunPKCS11, many signing tools |
| Microsoft Cryptography API: Next Generation (CNG) Key Storage Provider (KSP) | Windows applications, Microsoft AD CS, IIS, SQL Server |
| Java Cryptography Extension (JCE) | Java applications through a vendor provider |
| Key Management Interoperability Protocol (KMIP) | Key managers and storage encryption |
| Vendor native APIs | nShield nCore, Luna native tools |

## Common use cases

- Certificate Authority (CA) root and issuing keys.
- Code signing keys.
- TLS private keys for high-value sites and load balancers.
- Database Transparent Data Encryption (TDE) master keys.
- Payment processing (PIN and card keys, with payment HSMs).
- Customer-supplied keys for cloud services (often called BYOK).
- Document and e-signature keys.

## Key terms

| Term | Meaning |
|---|---|
| Security boundary | The protected area inside which keys exist in plain form |
| Quorum (K of N, M of N) | A minimum number of credential holders needed to authorize an action |
| Key wrapping | Encrypting one key with another so it can be stored or moved safely |
| Tamper evidence and response | Signs of physical attack, and automatic erasure of secrets |
| FIPS 140-3 | The current US and Canadian standard for cryptographic module security |

## Common questions

### Is an HSM the same as a key manager?
No. A key manager organizes key lifecycle and policy across many systems. An HSM is the hardware root of trust that protects and uses keys. Many key managers use an HSM underneath.

### Is a cloud HSM as secure as an on-premises HSM?
Cloud HSMs from major providers are FIPS validated. The difference is mostly in who controls the hardware and how access is managed. Review the provider's validation level and shared responsibility model.

### Which FIPS level is needed?
It depends on the use case and regulation. CA keys usually use Level 3. See [FIPS 140-3 security levels explained](fips-140-3-security-levels-explained.md).

### Can EC provide or manage HSMs?
Yes. EC offers [HSM-as-a-Service](../../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md) and [HSM services for deployment and integration](../../03-Services/hsm-services-deployment-and-integration.md).

## Related articles

- [FIPS 140-3 security levels explained](fips-140-3-security-levels-explained.md)
- [Entrust nShield Security World concepts](entrust-nshield-security-world-concepts.md)
- [Thales Luna HSM concepts](thales-luna-hsm-concepts.md)
- [Key ceremonies explained](key-ceremonies-explained.md)
- [What is an HSM and how does it work](../../05-Popular-Right-Now/what-is-an-hsm-and-how-does-it-work.md)
- [Connecting applications to HSMaaS (PKCS#11, CNG, JCE)](../../01-Products/HSM-as-a-Service/connecting-applications-to-hsmaas-pkcs11-cng-jce.md)
