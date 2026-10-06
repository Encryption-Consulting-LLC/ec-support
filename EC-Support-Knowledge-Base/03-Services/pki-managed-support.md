---
title: "PKI Managed Support"
category: "Services"
section: "PKI Services"
article_type: "Service Guide"
applies_to: "Customer-owned Microsoft AD CS and HSM-backed PKI, on-premises, cloud, and hybrid"
summary: "How EC PKI Managed Support helps run a customer-owned PKI: monitoring, CRL and CA renewals, incident help, health checks, and reporting, with onboarding steps."
keywords: ["PKI managed support", "PKI support services", "AD CS support", "CRL renewal", "PKI health check"]
last_reviewed: "2026-10-06"
---

# PKI Managed Support

This article describes PKI Managed Support from Encryption Consulting (EC). EC experts give ongoing, proactive help to keep a customer-owned Public Key Infrastructure (PKI) healthy. It is for organizations that own their Certificate Authorities (CAs) but want expert help with daily operations, planned tasks, and incidents.

## What the service covers

PKI Managed Support covers a PKI that the customer owns and hosts. If the organization prefers EC to host and run the PKI, see [PKI-as-a-Service overview](../01-Products/PKI-as-a-Service/pki-as-a-service-overview.md).

Typical support activities include:

- **Incident help:** troubleshooting enrollment failures, revocation check errors, CA service failures, and Hardware Security Module (HSM) connection problems.
- **Planned operations:** offline root Certificate Revocation List (CRL) signing, issuing CA certificate renewal, certificate template changes, and Online Certificate Status Protocol (OCSP) signing certificate renewal.
- **Monitoring and alerting guidance:** watching CRL expiry, CA certificate expiry, CRL Distribution Point (CDP) and Authority Information Access (AIA) availability, and CA service health.
- **Health checks:** periodic reviews of configuration, backups, logs, and template security.
- **Change support:** reviewing and supporting planned changes such as server migrations, HSM firmware updates, or moving a CA key into an HSM.
- **Documentation:** keeping runbooks and the operations guide current.
- **Advice:** guidance on industry changes, such as shorter certificate lifetimes and post-quantum cryptography (PQC).

The exact list of tasks, hours, and coverage is set in the support agreement: {{TBD: PKI managed support service tiers and included tasks}}.

## Who it is for

- Organizations with a small PKI team or a single PKI expert.
- Organizations that recently built a PKI with EC and want continued help.
- Teams that need planned tasks, such as offline root CRL signing, done on time every period.

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and onboarding | Collect PKI documents, contacts, and access details. Agree on scope and communication paths. | Onboarding checklist and contact list |
| 2. Baseline health check | Review the current state against Microsoft AD CS best practices and the organization's Certificate Policy (CP) and Certification Practice Statement (CPS). | Baseline report and risk register |
| 3. Runbook alignment | Create or update runbooks for planned tasks and common incidents. | Runbook set |
| 4. Steady-state support | Handle cases, planned tasks, and changes. | Case records and change records |
| 5. Periodic review | Health checks, service reviews, and recommendations. | Service review report and updated roadmap |

## Deliverables

- Onboarding checklist and support contact matrix
- Baseline health check report and risk register
- Runbooks for planned operations and common incidents
- Calendar of planned tasks, such as CRL signing and CA renewals
- Periodic service review reports
- Recommendations and an updated roadmap

## What EC needs from the customer

**Stakeholders**

- A named PKI owner and named support contacts.
- Access to Active Directory, network, and HSM administrators when a case needs them.
- A change manager contact for production changes.

**Documents**

- PKI design document, CP, and CPS.
- CA hierarchy diagram and server list.
- HSM details and key custodian list (names and roles only).
- Existing runbooks and backup procedures.

**Access**

- Remote access method agreed with the customer security team, such as screen share or a jump host.
- Change windows for planned work.
- A secure way to share diagnostic files. See [Collecting HSM and PKI diagnostics for support](../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

## Typical timeline

Onboarding duration: {{TBD: typical onboarding duration for PKI managed support}}. Contract term: {{TBD: standard contract term for PKI managed support}}. Response targets follow the support plan. See [Support severity levels and response targets](../00-Working-with-EC-Support/support-severity-levels-and-response-targets.md).

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md). Existing customers open cases as described in [How to open a support case](../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [Support plans and coverage](../00-Working-with-EC-Support/support-plans-and-coverage.md)
- [Root CA CRL renewal for an offline root](../04-Featured-Articles/PKI-Runbooks/root-ca-crl-renewal-offline-root.md)
- [Issuing CA certificate renewal](../04-Featured-Articles/PKI-Runbooks/issuing-ca-certificate-renewal.md)
- [Recovering from an expired CRL](../04-Featured-Articles/PKI-Runbooks/recovering-from-an-expired-crl.md)
- [PKI assessment](pki-assessment.md)
