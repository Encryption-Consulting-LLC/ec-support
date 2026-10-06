---
title: "PKI-as-a-Service Overview"
category: "Products"
section: "PKI-as-a-Service"
article_type: "Overview"
applies_to: "Encryption Consulting PKI-as-a-Service (PKIaaS), all deployment models"
summary: "Overview of EC PKI-as-a-Service: a managed, HSM-backed private PKI with root and issuing CAs, ACME, SCEP, Intune, and AD CS integration for enterprises."
keywords: ["PKI-as-a-Service", "PKIaaS", "managed PKI", "private CA", "HSM-backed CA"]
last_reviewed: "2026-10-06"
---

# PKI-as-a-Service Overview

This article introduces Encryption Consulting (EC) PKI-as-a-Service (PKIaaS). It explains what the service is, what it can do, and how it fits into an existing environment. It is for IT, security, and PKI teams who are evaluating PKIaaS or are new to it.

## What it is

PKIaaS is a private Public Key Infrastructure (PKI) that EC builds and operates for a customer. A PKI is the set of Certificate Authorities (CAs), policies, and services that issue and manage digital certificates. With PKIaaS, EC runs the CA infrastructure, the Hardware Security Modules (HSMs) that protect CA keys, and the revocation services. The customer keeps ownership of the CA and decides who may get which certificates.

PKIaaS is a good fit for organizations that need internal certificates (for devices, users, servers, and mutual TLS) but do not want to staff and run a full PKI themselves.

## Key capabilities

- **Managed CA hierarchy:** EC operates a root CA and one or more subordinate (issuing) CAs. The design is agreed during onboarding.
- **HSM-backed keys:** CA private keys are generated and kept in FIPS 140-3 Level 3 validated HSMs. Federal Information Processing Standard (FIPS) 140-3 is the US standard for cryptographic modules.
- **Single-tenant design:** Each customer gets a dedicated CA hierarchy. Keys are not shared with other customers.
- **Full lifecycle:** Issuance, enrollment, renewal, and revocation for many certificate types, including hybrid certificates that pair ML-DSA with RSA or ECDSA for post-quantum readiness.
- **Enrollment protocols:** Automated Certificate Management Environment (ACME), Simple Certificate Enrollment Protocol (SCEP), Enrollment over Secure Transport (EST), and Windows Enrollment Web Services (WSTEP).
- **Microsoft integration:** Active Directory Certificate Services (AD CS) integration, including multi-forest and hybrid Active Directory (AD), Network Device Enrollment Service (NDES), and Microsoft Intune.
- **Policy and governance:** Certificate policies, validity periods, and key usage rules are set centrally and enforced at issuance.
- **Audit trail:** Every issuance and revocation is logged for audits.

## How it works

1. The customer and EC agree on a CA hierarchy, certificate profiles, and policies.
2. EC generates the root and issuing CA keys inside HSMs during a recorded key ceremony.
3. EC publishes the Certificate Revocation List (CRL) and Authority Information Access (AIA) files, and runs Online Certificate Status Protocol (OCSP) responders if included.
4. The customer distributes the root CA certificate to its trust stores (for example through Group Policy or a Mobile Device Management (MDM) platform).
5. Devices, users, and servers request certificates through ACME, SCEP, EST, Intune, or AD CS enrollment.
6. EC monitors the CAs, patches the platform, and keeps CRLs fresh. The customer approves requests and manages who may enroll.

For full details, see [PKIaaS architecture and shared responsibility](pkiaas-architecture-and-shared-responsibility.md).

## Supported integrations

| Area | Examples |
|---|---|
| Directory and Windows | AD CS, multi-forest AD, hybrid AD, autoenrollment |
| Mobile and endpoint | Microsoft Intune (SCEP and PKCS), NDES, other UEM/MDM platforms |
| Automation | ACME clients (certbot, win-acme, acme.sh), EST, SCEP |
| Certificate lifecycle | EC CertSecure Manager |
| Use cases | mTLS, Wi-Fi and VPN client auth, S/MIME, device identity (IEEE 802.1AR IDevID and LDevID) |

Exact connector versions and supported platforms: {{TBD: PKIaaS supported integrations and version matrix}}.

## Deployment options

| Model | Description |
|---|---|
| SaaS | CAs and HSMs run in EC-managed cloud infrastructure. No hardware to buy. |
| On-premises managed | CAs and HSMs run in the customer data center. EC operates them remotely. |
| Managed PKIaaS (custom) | A tailored hierarchy and service scope for complex enterprises. |

Hosting regions, availability targets, and pricing are agreed in the contract: {{TBD: PKIaaS hosting regions}}, {{TBD: PKIaaS availability SLA}}, {{TBD: PKIaaS pricing model}}. A 15-day free trial is offered on the EC website.

## Getting help

- Open a case through the support portal. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).
- For outages such as an expired CRL or failed issuance, use the highest fitting severity. See [Support severity levels and response targets](../../00-Working-with-EC-Support/support-severity-levels-and-response-targets.md).
- PKIaaS support contact: {{TBD: PKIaaS support queue or contact}}.

## Related articles

- [PKIaaS architecture and shared responsibility](pkiaas-architecture-and-shared-responsibility.md)
- [Onboarding to PKIaaS](onboarding-to-pkiaas.md)
- [Enrolling certificates with PKIaaS: ACME, SCEP, and Intune](enrolling-certificates-with-pkiaas-acme-scep-intune.md)
- [PKIaaS FAQ](pkiaas-faq.md)
- [PKI fundamentals](../../02-General/PKI/pki-fundamentals.md)
- [Two-tier vs three-tier PKI hierarchy](../../02-General/PKI/two-tier-vs-three-tier-pki-hierarchy.md)
