---
title: "PKI Design and Implementation"
category: "Services"
section: "PKI Services"
article_type: "Service Guide"
applies_to: "Microsoft AD CS, HSM-backed CAs, Intune and Windows Hello for Business integrations, on-premises and hybrid"
summary: "How EC designs and builds a private PKI: hierarchy design, CP/CPS writing, HSM-backed key ceremonies, AD CS build, testing, and handover documents."
keywords: ["PKI design", "PKI implementation", "AD CS deployment", "CP CPS development", "key ceremony"]
last_reviewed: "2026-10-06"
---

# PKI Design and Implementation

This article describes the Public Key Infrastructure (PKI) Design and Implementation service from Encryption Consulting (EC). EC designs a new PKI or rebuilds an existing one, then helps build, test, and hand it over. It is for infrastructure and security teams that need a secure, well-documented private PKI.

## What the service covers

- **PKI design:** Certificate Authority (CA) hierarchy (two-tier or three-tier), offline root, issuing CAs, key algorithms and sizes, validity periods, naming, and certificate profiles.
- **Revocation design:** Certificate Revocation List (CRL) schedules, CRL Distribution Point (CDP) and Authority Information Access (AIA) locations, and Online Certificate Status Protocol (OCSP) responders with high availability.
- **Key protection:** CA keys generated and stored in a Hardware Security Module (HSM) validated to Federal Information Processing Standard (FIPS) 140-3, such as Entrust nShield or Thales Luna.
- **Policy documents:** Certificate Policy (CP) and Certification Practice Statement (CPS) development, following the RFC 3647 framework.
- **Build:** installation and configuration of Microsoft Active Directory Certificate Services (AD CS), certificate templates, auto-enrollment, and Network Device Enrollment Service (NDES) or Simple Certificate Enrollment Protocol (SCEP) where needed.
- **Key ceremonies:** scripted and witnessed root and issuing CA key generation.
- **Integrations:** Microsoft Intune certificate deployment, Windows Hello for Business, and certificate lifecycle management tools.
- **Migration:** moving from an old PKI to the new one with minimal disruption.

## Who it is for

- Organizations building a first private PKI.
- Organizations replacing a PKI that has weak keys, no HSM, or poor documentation.
- Teams moving client authentication and mutual TLS (mTLS) certificates from public CAs to a private PKI. Under Chrome Root Program Policy v1.8, public TLS certificates issued on or after March 15 2027 must carry only the server authentication Extended Key Usage (EKU), and most public CAs already stopped including client authentication in 2026.
- Teams that want a design ready for post-quantum cryptography (PQC) and crypto-agility.

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and requirements | Gather use cases, certificate volumes, forests, sites, and compliance needs. Review any existing PKI. | Requirements document |
| 2. Current state assessment (if a PKI exists) | Review the existing PKI. See [PKI assessment](pki-assessment.md). | Current state summary |
| 3. Architecture and design | Design the hierarchy, revocation, HSM integration, templates, and security controls. Align with Microsoft AD CS best practices and NIST Special Publication (SP) 800-57. | Target architecture and design document |
| 4. Policy development | Write or update the CP and CPS. | CP and CPS documents |
| 5. Build and key ceremonies | Build CA servers, run key ceremonies, issue CA certificates, publish CRLs and AIA. | Build records and key ceremony scripts and logs |
| 6. Testing | Test enrollment, renewal, revocation checking, and failover. | Test plan and results |
| 7. Migration and handover | Move workloads, decommission old CAs, train administrators. | Runbooks, operations guide, and training |

## Deliverables

- Requirements document
- Target architecture and detailed design document
- CP and CPS documents
- Key ceremony scripts and signed ceremony records
- Build and configuration records
- Test plan and test results
- Operational runbooks, for example CRL renewal, issuing CA renewal, and backup and restore
- Administrator knowledge transfer sessions

## What EC needs from the customer

**Stakeholders**

- PKI owner and a project manager.
- Active Directory, Windows server, network, and HSM administrators.
- Key ceremony participants: ceremony administrator, witnesses, and custodians for HSM cards or keys.
- Security, compliance, and change management contacts.

**Documents**

- Security policies and any existing CP, CPS, or PKI design.
- Network diagrams, firewall rules process, and DNS details for CDP and AIA hosts.
- HSM model, firmware version, and support contract details.

**Access and resources**

- Servers or virtual machines that meet the agreed specification.
- HSMs, or an HSM service such as HSM-as-a-Service, ready before key ceremonies.
- Administrative access for EC engineers during build, under customer change control.
- Change windows for production work.

> **Warning:** Plan key ceremonies with care. Card or key custodians, witnesses, and backup media must be available on the day. Rescheduling a ceremony can delay the whole project.

## Typical timeline

Duration depends on hierarchy size, number of forests, HSM readiness, and migration scope. EC confirms the timeline during scoping.

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md). For a fully managed alternative, see [PKI-as-a-Service overview](../01-Products/PKI-as-a-Service/pki-as-a-service-overview.md).

## Related articles

- [Two-tier vs three-tier PKI hierarchy](../02-General/PKI/two-tier-vs-three-tier-pki-hierarchy.md)
- [Key ceremonies explained](../02-General/HSM/key-ceremonies-explained.md)
- [Configuring AD CS with an HSM KSP](../04-Featured-Articles/HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
- [High availability CDP and AIA](../04-Featured-Articles/PKI-Runbooks/high-availability-cdp-and-aia.md)
- [PKI managed support](pki-managed-support.md)
- [PKI assessment](pki-assessment.md)
