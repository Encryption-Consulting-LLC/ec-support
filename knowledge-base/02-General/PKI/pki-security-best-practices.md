---
title: "PKI Security Best Practices"
category: "General"
section: "PKI"
article_type: "Concept"
applies_to: "Enterprise PKI, Microsoft AD CS, offline root and issuing CAs, HSM-protected CA keys"
summary: "Practical PKI security best practices: protect CA keys in HSMs, harden AD CS, tier administration, secure templates, monitor revocation, and plan for PQC."
keywords: ["PKI security best practices", "AD CS hardening", "CA key protection", "offline root CA", "PKI governance"]
last_reviewed: "2026-10-06"
---

# PKI Security Best Practices

This article collects the most important practices for keeping a Public Key Infrastructure (PKI) secure and reliable. It is for PKI owners, security architects, and auditors who want a checklist to compare against an existing deployment.

## What it is

PKI security covers the Certificate Authority (CA) keys, the CA servers, the people who run them, the rules for issuance, and the services that publish revocation data. A weakness in any one area can let an attacker issue trusted certificates or cause a wide outage.

## Why it matters

A CA issues identities. If an attacker controls a CA, or can trick it into issuing a certificate for a privileged account, the attacker can impersonate users and servers across the organization. Microsoft Active Directory Certificate Services (AD CS) is a frequent target because it is tightly linked to Active Directory (AD) authentication.

## How it works: the practices

### 1. Protect CA private keys

- Store root and issuing CA keys in a Hardware Security Module (HSM) validated to Federal Information Processing Standard (FIPS) 140-3 (Level 3 is common for CA keys). FIPS 140-2 certificates move to the historical list on September 21 2026, so new purchases should target FIPS 140-3.
- Use quorum (K of N or M of N) authentication for HSM administration so no single person can use or export CA keys.
- Generate CA keys during a documented, witnessed key ceremony. See [Key ceremonies explained](../HSM/key-ceremonies-explained.md).

### 2. Design the hierarchy for containment

- Keep the root CA offline. Power it on only for planned ceremonies.
- Use at least two tiers. See [Two-tier vs three-tier PKI hierarchy](two-tier-vs-three-tier-pki-hierarchy.md).
- Use path length and, where useful, name constraints on subordinate CAs.

### 3. Treat CA servers as Tier 0

- Online Enterprise CAs are as sensitive as domain controllers. Manage them only from privileged access workstations.
- Limit local administrators, CA Administrators (ManageCA), and Certificate Managers (ManageCertificates) to a small named group.
- Apply role separation where possible, so CA administration, certificate management, auditing, and backup are held by different people.
- Patch the operating system and keep endpoint protection active.

### 4. Lock down templates and CA settings

- Review every published template for risky combinations: enrollee-supplied subject, client authentication EKU, and broad enrollment rights.
- Remove the `EDITF_ATTRIBUTESUBJECTALTNAME2` flag from CAs unless there is a strong, documented reason.
- Protect web enrollment and Certificate Enrollment Web Service endpoints against NTLM relay, or remove them if not needed.
- Unpublish unused templates.

See [Common AD CS misconfigurations (ESC1 to ESC8)](common-ad-cs-misconfigurations-esc1-to-esc8.md) and [Certificate templates in AD CS](certificate-templates-in-ad-cs.md).

### 5. Enable auditing and monitoring

- Turn on CA auditing for all events:

  ```cmd
  certutil -setreg CA\AuditFilter 127
  ```

  Then enable "Audit Certification Services" (success and failure) in the advanced audit policy and restart the CA service.
- Forward CA security events (for example 4886, 4887, 4888, 4898, 4899, 4900) to a Security Information and Event Management (SIEM) system.
- Alert on template changes, new CA administrators, and certificates issued for privileged accounts.

### 6. Keep revocation healthy

- Publish CRLs over HTTP to more than one web server.
- Monitor the Next Update time of every CRL, including the offline root.
- Monitor Online Responder signing certificates. See [CRL vs OCSP](crl-vs-ocsp.md).

### 7. Govern with documents and inventory

- Maintain a Certificate Policy (CP) and Certification Practice Statement (CPS).
- Keep a full inventory of certificates and their owners. Lifecycle tools such as [CertSecure Manager](../../01-Products/CertSecure-Manager/certsecure-manager-overview.md) automate discovery and renewal.
- Document runbooks for CA renewal, CRL signing, and disaster recovery, and test them.

### 8. Back up and test recovery

- Back up the CA database, keys (or HSM backup), registry configuration, and templates. See [AD CS backup and restore best practices](ad-cs-backup-and-restore-best-practices.md).
- Practice a restore in a lab at least once a year.

### 9. Plan for change

- Shorter public certificate lifetimes (200 days in 2026, 47 days by 2029) mean automation is required.
- Post-Quantum Cryptography (PQC) will change CA algorithms. Track algorithm use with a Cryptographic Bill of Materials (CBOM). See [PQC readiness for PKI and HSM](../Post-Quantum-Cryptography/pqc-readiness-for-pki-and-hsm.md).

## Key terms

| Term | Meaning |
|---|---|
| Tier 0 | The most privileged administrative tier, including domain controllers and Enterprise CAs |
| Role separation | AD CS setting that prevents one person from holding more than one CA role |
| ManageCA | CA permission to change CA configuration |
| ManageCertificates | CA permission to approve, issue, and revoke certificates |
| CP and CPS | Policy and practice documents that govern a PKI |

## Common questions

### Is an HSM required for a private CA?
Not technically, but software keys can be copied by anyone with administrator access to the server. An HSM is strongly recommended for any CA trusted for authentication.

### How often should a PKI be reviewed?
At least yearly, and after major changes such as a new CA, new templates, or a merger. EC's [PKI assessment](../../03-Services/pki-assessment.md) covers design, configuration, and operations.

### What tools find AD CS weaknesses?
Open source tools such as Locksmith, PSPKIAudit, Certify, and Certipy report risky templates and CA settings. Run them only with authorization.

## Related articles

- [Common AD CS misconfigurations (ESC1 to ESC8)](common-ad-cs-misconfigurations-esc1-to-esc8.md)
- [Certificate templates in AD CS](certificate-templates-in-ad-cs.md)
- [AD CS backup and restore best practices](ad-cs-backup-and-restore-best-practices.md)
- [What is an HSM](../HSM/what-is-an-hsm.md)
- [PKI assessment](../../03-Services/pki-assessment.md)
- [Configuring AD CS with an HSM KSP](../../04-Featured-Articles/HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
