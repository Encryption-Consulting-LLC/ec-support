---
title: "PKI Assessment"
category: "Services"
section: "Assessments"
article_type: "Service Guide"
applies_to: "Microsoft AD CS and other private PKI deployments, on-premises, cloud, and hybrid"
summary: "How the EC PKI Assessment reviews governance, architecture, operations, and security of a private PKI, including AD CS, and the deliverables it produces."
keywords: ["PKI assessment", "AD CS assessment", "PKI health check", "PKI gap analysis", "certificate authority review"]
last_reviewed: "2026-10-06"
---

# PKI Assessment

This article describes the Public Key Infrastructure (PKI) Assessment from Encryption Consulting (EC). The assessment reviews how a PKI is designed, secured, and operated, and gives a prioritized list of fixes. It is for PKI owners, infrastructure teams, and security leaders who run Microsoft Active Directory Certificate Services (AD CS) or another private Certificate Authority (CA).

## What the service covers

EC reviews the PKI across eight areas:

| Area | What EC looks at |
|---|---|
| Governance oversight | Ownership, roles, Certificate Policy (CP) and Certification Practice Statement (CPS), change control |
| Architecture design | CA hierarchy, tiers, offline root, key lengths, algorithms, validity periods |
| Operations | Day-to-day tasks, monitoring, Certificate Revocation List (CRL) publishing, documentation |
| Risk and compliance | Alignment with policy, audit needs, and industry practice |
| Lifecycle management | Enrollment, renewal, revocation, certificate templates, inventory |
| Disaster readiness | Backups, key recovery, CA restore tests, business continuity |
| Stakeholder discovery | Who relies on the PKI and what they need from it |
| Strategic recommendations | Target state and next steps |

Typical technical checks include:

- Root and issuing CA key protection, including use of a Hardware Security Module (HSM).
- CRL Distribution Point (CDP) and Authority Information Access (AIA) availability, and Online Certificate Status Protocol (OCSP) setup.
- Certificate template permissions and known AD CS misconfigurations (ESC1 to ESC8).
- CA database size, backup status, and audit logging.
- Readiness for post-quantum cryptography (PQC) and for shorter certificate lifetimes.

## Who it is for

- Organizations with an AD CS deployment that was built years ago and has not been reviewed.
- Teams that had a PKI outage, such as an expired CRL or expired CA certificate.
- Organizations preparing for an audit or a PKI migration.
- Teams that want to move a CA private key into an HSM or move to a managed PKI.

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and data gathering | Kickoff, document request, CA configuration exports, stakeholder interviews. | Data collection checklist |
| 2. Current state assessment | Review CA hierarchy, templates, revocation, HSM use, backups, and operations. | Current state report |
| 3. Gap analysis | Compare with Microsoft AD CS best practices, NIST Special Publication (SP) 800-57, Federal Information Processing Standard (FIPS) 140-3 for key protection, RFC 5280 profiles, and the organization's CP and CPS. | Gap analysis and risk register |
| 4. Recommendations and roadmap | Prioritize fixes by risk and effort. | Prioritized roadmap |
| 5. Readout and optional implementation support | Present findings. Help fix high-risk items when agreed. | Final report, briefing, and runbooks |

## Deliverables

- Current state report with a diagram of the CA hierarchy
- Risk register with rating, impact, and recommended fix for each finding
- Template and permission review results
- Gap analysis against agreed frameworks
- Prioritized roadmap and, if needed, a target architecture
- Executive summary

## What EC needs from the customer

**Stakeholders**

- PKI owner and CA administrators.
- Active Directory, network, and HSM administrators.
- Application owners who rely on certificates.
- Security or compliance contact.

**Documents**

- Existing CP, CPS, and PKI design documents.
- Key ceremony records and backup procedures.
- Recent audit findings for the PKI.

**Access and data**

- Output of standard CA commands, collected by a CA administrator. Examples:

```cmd
certutil -getreg CA
certutil -CAInfo
certutil -v -template > templates.txt
```

- Screen-share sessions with CA administrators, or read-only access when agreed.
- A secure file exchange channel. See [Secure file sharing with EC support](../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md).

> **Note:** EC does not need the CA private key or HSM credentials for an assessment. Never send key material or smart card PINs.

## Typical timeline

Duration depends on the number of CAs, forests, and sites. Typical duration: {{TBD: typical duration for a PKI assessment}}.

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md).

## Related articles

- [PKI design and implementation](pki-design-and-implementation.md)
- [PKI managed support](pki-managed-support.md)
- [PKI security best practices](../02-General/PKI/pki-security-best-practices.md)
- [Common AD CS misconfigurations ESC1 to ESC8](../02-General/PKI/common-ad-cs-misconfigurations-esc1-to-esc8.md)
- [certutil command reference](../04-Featured-Articles/PKI-Runbooks/certutil-command-reference.md)
