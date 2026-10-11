---
title: "PKIaaS Architecture and Shared Responsibility"
category: "Products"
section: "PKI-as-a-Service"
article_type: "Concept"
applies_to: "Encryption Consulting PKI-as-a-Service (PKIaaS), SaaS and on-premises managed models"
summary: "How EC PKIaaS is built (root CA, issuing CAs, HSMs, CRL, OCSP, enrollment) and which tasks EC owns versus the customer in a shared responsibility model."
keywords: ["PKIaaS architecture", "shared responsibility", "managed CA", "CRL OCSP", "HSM-backed PKI"]
last_reviewed: "2026-10-06"
---

# PKIaaS Architecture and Shared Responsibility

This article describes the main building blocks of Encryption Consulting (EC) PKI-as-a-Service (PKIaaS) and how they connect. It also sets out which tasks EC performs and which tasks stay with the customer. It is for architects, PKI owners, and security teams.

## What it is

PKIaaS is a private Public Key Infrastructure (PKI) operated by EC. The design follows the same patterns as a well-run in-house PKI: an offline or tightly protected root Certificate Authority (CA), one or more online issuing CAs, Hardware Security Modules (HSMs) for key protection, and highly available revocation services. The difference is who runs it day to day.

## Why it matters

Most PKI outages come from operational gaps: an expired Certificate Revocation List (CRL), a missed CA renewal, or an unpatched server. A clear split of duties removes guesswork. Each task in the table below has one owner, so nothing falls between teams.

## How it works

1. **Root CA.** The root CA key is generated in an HSM during a witnessed key ceremony. The root CA signs only subordinate CA certificates and its own CRL. It is kept offline or isolated when not in use.
2. **Issuing CAs.** One or more issuing CAs sign end-entity certificates. Their keys also live in FIPS 140-3 Level 3 validated HSMs. Issuing CAs can be Microsoft Active Directory Certificate Services (AD CS) based or EC platform based, depending on the agreed design.
3. **HSM layer.** EC deploys, patches, and monitors the HSMs. Key material never leaves the HSM in plain form. Backups are encrypted under HSM-protected keys.
4. **Revocation services.** CRLs and Authority Information Access (AIA) files are published to highly available HTTP endpoints. Online Certificate Status Protocol (OCSP) responders answer status checks when included in scope.
5. **Enrollment layer.** Clients request certificates over Automated Certificate Management Environment (ACME), Simple Certificate Enrollment Protocol (SCEP), Enrollment over Secure Transport (EST), Windows enrollment (DCOM or WSTEP), or Microsoft Intune connectors.
6. **Customer connectivity.** The customer network reaches the enrollment and revocation endpoints over the internet or a private link.
7. **Monitoring and logging.** EC monitors CA health, HSM health, CRL freshness, and certificate expiry of CA certificates. Audit logs can be exported to the customer Security Information and Event Management (SIEM) system.

### Typical hierarchy

```text
Contoso-Root-CA (offline, HSM)
 ├── Contoso-Issuing-CA-01 (online, HSM)  -> servers, mTLS, Wi-Fi
 └── Contoso-Issuing-CA-02 (online, HSM)  -> Intune devices, users
```

## Shared responsibility model

| Area | EC responsibility | Customer responsibility |
|---|---|---|
| CA hierarchy design | Propose design, document Certificate Policy (CP) and Certification Practice Statement (CPS) drafts | Approve design, CP, and CPS; own the CA legally |
| Key ceremonies | Run root and issuing CA key ceremonies, record evidence | Name witnesses, attend or approve ceremonies |
| HSMs | Deploy, patch firmware, monitor, back up, and secure HSMs | Hold any quorum cards or credentials assigned to the customer |
| CA servers and platform | Install, harden, patch, and monitor CA servers | Provide network and directory access for on-premises models |
| CA certificate renewal | Plan and perform CA renewals before expiry | Approve change windows; redistribute new CA certificates |
| CRL and OCSP | Publish CRLs on schedule, keep CDP and AIA available | Ensure clients can reach CDP, AIA, and OCSP URLs |
| Certificate templates and profiles | Build and maintain approved templates and profiles | Define requirements, approve changes |
| Enrollment and approval | Run enrollment endpoints (ACME, SCEP, EST, connectors) | Decide who may enroll; approve or reject requests; install client-side connectors |
| Revocation of end-entity certificates | Process revocation, publish updated CRL | Request revocation promptly when keys are lost or staff leave |
| Trust distribution | Supply root and issuing CA certificates | Push certificates to trust stores (GPO, MDM, Linux, Java) |
| Endpoint certificates and keys | None | Protect end-entity private keys; install and renew certificates on endpoints |
| Access control | Manage EC operator access, enforce multi-factor authentication (MFA) and least privilege | Manage customer admin accounts, review access regularly |
| Audit and compliance | Keep audit logs, supply evidence for audits | Run own audits; meet own regulatory duties |
| Disaster recovery | Maintain backups and recovery plan for CAs and HSMs | Test business recovery of dependent applications |
| Incident response | Detect and report platform incidents | Report suspected key compromise or misuse to EC at once |

Contract terms may change some lines. The signed service description wins in case of conflict.

## Key terms

| Term | Meaning |
|---|---|
| Root CA | Top CA in the chain; its certificate is the trust anchor |
| Issuing CA | CA that signs end-entity certificates |
| CDP | CRL Distribution Point, the URL where CRLs are published |
| AIA | Authority Information Access, the URL where CA certificates are published |
| OCSP | A protocol that returns the status of a single certificate |
| CP / CPS | Documents that state the rules and the practices of the CA |
| Key ceremony | A scripted, witnessed process for creating or using critical keys |

## Common questions

**Does EC hold the CA private keys?** The keys stay inside HSMs operated by EC. The customer owns the CA and its keys under the contract.

**Can PKIaaS sit alongside an existing AD CS?** Yes. Many customers run both during migration and cross-issue or move templates in phases.

**Is the service multi-tenant?** No. Each customer gets a dedicated CA hierarchy.

## Related articles

- [PKI-as-a-Service overview](pki-as-a-service-overview.md)
- [Onboarding to PKIaaS](onboarding-to-pkiaas.md)
- [CRL vs OCSP](../../02-General/PKI/crl-vs-ocsp.md)
- [Key ceremonies explained](../../02-General/HSM/key-ceremonies-explained.md)
- [PKI security best practices](../../02-General/PKI/pki-security-best-practices.md)
- [High availability CDP and AIA](../../04-Featured-Articles/PKI-Runbooks/high-availability-cdp-and-aia.md)
