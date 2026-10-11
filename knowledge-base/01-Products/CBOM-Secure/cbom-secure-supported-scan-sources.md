---
title: "CBOM Secure Supported Scan Sources"
category: "Products"
section: "CBOM Secure"
article_type: "Reference"
applies_to: "CBOM Secure scanning agents and connectors (all deployment models)"
summary: "Reference list of CBOM Secure scan sources: code, binaries, keystores, HSMs, key managers, cloud KMS, directories, SSH, and databases, with access needs."
keywords: ["CBOM Secure scan sources", "cryptographic discovery sources", "HSM discovery", "keystore scanning", "cloud KMS inventory"]
last_reviewed: "2026-10-06"
---

# CBOM Secure Supported Scan Sources

This article lists the sources CBOM Secure can scan, what it collects from each, and the access each scan typically needs. It is for administrators planning discovery and for security teams checking coverage. Exact versions and connector settings may change between releases, so confirm against the release notes for the installed version.

## How to use this reference

- Start with the sources that hold the most important or most numerous assets, usually certificates, HSMs, and the main code repositories.
- Use read-only accounts for every connector.
- Supported versions per source are listed in the release notes for the installed version.
- The "Typical access" column shows the usual minimum for that kind of source. Exact permissions for each connector are in the CBOM Secure product documentation, or ask EC support.

## Source code and software

| Source | What is collected | Typical access |
|---|---|---|
| GitHub | Crypto library usage, algorithm calls, key sizes, hard-coded keys and secrets, dependency manifests | Read-only token or GitHub App with repository read |
| Bitbucket | Same as GitHub | Read-only app password or access token |
| Generic Git | Same as GitHub | Read-only clone credential (HTTPS or SSH) |
| Source archives | Same as GitHub, from uploaded or mounted archives | File access on the agent host |
| Binaries | Linked or embedded crypto libraries, algorithm constants, certificates inside packages | File access on the agent host |

CBOM Secure covers seven programming languages, 70+ crypto libraries, and 880+ function patterns. The current language list is in the release notes for the installed version.

## Keystores and files

| Source | What is collected | Typical access |
|---|---|---|
| Java KeyStore (JKS) | Key and certificate entries, algorithms, sizes, expiry | Read access to file, keystore password if entries must be listed |
| PKCS#12 (`.p12`, `.pfx`) | Certificates and key types | Read access, password where needed |
| JCEKS | Secret keys, key pairs, certificates | Read access, password |
| BouncyCastle keystores (BKS, UBER, BCFKS) | Same as JKS | Read access, password |
| File systems | PEM and DER certificates and keys, configuration files | Read access to target folders |

> **Note:** Passwords are used only to list entries and metadata. Private key values are not exported.

## Hardware Security Modules (HSMs)

| Source | What is collected | Typical access |
|---|---|---|
| Thales Luna | Key objects, types, sizes, labels, attributes | PKCS#11 client and a read-capable partition role |
| Entrust nShield | Keys in the Security World, protection method, application type | Security World client access |
| AWS CloudHSM | Key objects and attributes | Crypto user (CU) credential |
| Azure Dedicated HSM | Key objects and attributes | Partition credential |
| Google Cloud HSM | HSM-protected keys in Cloud KMS | IAM viewer roles |
| IBM Crypto Express | Key metadata | Confirm with EC support for your environment |
| YubiHSM 2 | Objects, algorithms, capabilities | Auth key with read capabilities |

## Key managers and KMIP servers

| Source | What is collected | Typical access |
|---|---|---|
| HashiCorp Vault | Transit and PKI keys, key types, versions, certificates | Token with read policy |
| Thales CipherTrust Manager | Keys, algorithms, states | Read-only user |
| Oracle Key Vault | Keys and wallets metadata | Read-only endpoint or user |
| Fortanix Data Security Manager | Security objects and metadata | Read-only app credential |
| Key Management Interoperability Protocol (KMIP) servers | Managed objects and attributes | KMIP client certificate |

## Cloud platforms

| Source | What is collected | Typical access |
|---|---|---|
| AWS Certificate Manager (ACM) | Certificates, key algorithm, expiry, in-use resources | IAM role with ACM read |
| AWS Key Management Service (KMS) | Key specs, usage, rotation, origin | IAM role with KMS list and describe |
| Azure Key Vault | Keys, secrets metadata, certificates | Reader and Key Vault reader roles |
| Google Cloud KMS | Key rings, keys, algorithms, protection level | Cloud KMS viewer role |
| Oracle Cloud Infrastructure (OCI) Vault | Keys and metadata | Read policy |

## Directories and PKI

| Source | What is collected | Typical access |
|---|---|---|
| Active Directory | Published certificates, user and computer certificates | Read-only domain account |
| Active Directory Certificate Services (AD CS) | CA certificates, templates, issued certificates, algorithms | Read access to CA database and templates |
| OpenLDAP | Certificates stored in directory entries | Read-only bind account |

## Network, SSH, and PGP

| Source | What is collected | Typical access |
|---|---|---|
| TLS endpoints | Protocol versions, cipher suites, key exchange groups, certificate chain | Network reach to host and port |
| SSH | Host keys, authorized keys, key types and sizes, server algorithms | SSH account or agent on host |
| PGP | Public keys, algorithms, sizes, expiry | Read access to keyrings |

## Databases

| Source | What is collected | Typical access |
|---|---|---|
| MySQL and MariaDB | Encryption settings, TLS settings, keyring plugin metadata | Read-only database user |
| Oracle Database | Transparent Data Encryption (TDE) metadata, wallet information | Read-only user with catalog access |
| Microsoft SQL Server | TDE, Always Encrypted, certificate and key metadata | Read-only login with VIEW DEFINITION rights |

## Related articles

- [Running a first cryptographic scan](running-a-first-cryptographic-scan.md)
- [How CBOM Secure works](how-cbom-secure-works.md)
- [CBOM Secure overview](cbom-secure-overview.md)
- [CBOM Secure FAQ](cbom-secure-faq.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
