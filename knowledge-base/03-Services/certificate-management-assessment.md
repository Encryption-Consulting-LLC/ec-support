---
title: "Certificate Management Assessment"
category: "Services"
section: "Assessments"
article_type: "Service Guide"
applies_to: "Public and private TLS certificates, certificate lifecycle processes, and CLM tooling across on-premises and cloud"
summary: "How the EC Certificate Management Assessment finds certificates, reviews lifecycle processes, and plans automation for 47-day TLS validity and fewer outages."
keywords: ["certificate management assessment", "certificate lifecycle", "CLM assessment", "47-day certificates", "certificate outage prevention"]
last_reviewed: "2026-10-06"
---

# Certificate Management Assessment

This article describes the Certificate Management Assessment from Encryption Consulting (EC). The assessment finds the certificates an organization uses, checks how they are issued and renewed, and plans the automation needed to avoid outages. It is for infrastructure, PKI, and application teams responsible for certificates.

## What the service covers

- **Discovery:** find TLS certificates on networks, servers, load balancers, and cloud services, plus certificates from internal and public Certificate Authorities (CAs).
- **Inventory quality:** owners, locations, expiry dates, key sizes, algorithms, and issuing CA.
- **Lifecycle processes:** request, approval, issuance, deployment, renewal, and revocation.
- **Automation readiness:** use of Automatic Certificate Management Environment (ACME), APIs, and integration with Information Technology Service Management (ITSM) tools and continuous integration and continuous delivery (CI/CD) pipelines.
- **Policy:** certificate policy, allowed CAs, key lengths, and validity periods.
- **Monitoring and alerting:** how teams learn about upcoming expiry.
- **Outage history:** root causes of past certificate outages.
- **Industry change readiness:**
  - CA/Browser (CA/B) Forum ballot SC-081v3 cuts the maximum public TLS certificate validity to 200 days from March 15 2026, 100 days from March 15 2027, and 47 days from March 15 2029.
  - Chrome Root Program Policy v1.8: public TLS certificates issued on or after March 15 2027 must carry only the server authentication Extended Key Usage (EKU), and most public CAs already dropped client authentication in 2026, so mutual TLS (mTLS) and client authentication should move to a private PKI.
  - Distrust events for some public CAs, which can force mass replacement.

## Who it is for

- Organizations that had an outage caused by an expired certificate.
- Teams that track certificates in spreadsheets or not at all.
- Organizations preparing for shorter certificate lifetimes.
- Teams evaluating a Certificate Lifecycle Management (CLM) platform such as [CertSecure Manager](../01-Products/CertSecure-Manager/certsecure-manager-overview.md).

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and data gathering | Run discovery scans on agreed network ranges and CAs. Interview certificate owners. | Certificate inventory |
| 2. Current state assessment | Review processes, tools, owners, and outage history. | Current state report |
| 3. Gap analysis | Compare with CA/B Forum Baseline Requirements, Chrome Root Program Policy, NIST Special Publication (SP) 1800-16 (TLS server certificate management), and internal policy. | Gap analysis and risk register |
| 4. Recommendations and roadmap | Plan automation, ownership, and policy changes, ordered by risk and by industry deadlines. | Prioritized roadmap |
| 5. Implementation support (optional) | Help deploy CLM tooling and ACME automation. | Target architecture and runbooks |

## Deliverables

- Certificate inventory with owners and expiry dates
- Current state report
- Risk register, including certificates at near-term risk of expiry
- Gap analysis
- Readiness plan for 200-day, 100-day, and 47-day validity
- Prioritized automation roadmap
- Certificate management policy and runbooks (when in scope)

## What EC needs from the customer

**Stakeholders**

- PKI owner and an infrastructure lead.
- Network, load balancer, web server, and cloud administrators.
- Application owners for key services.
- Security operations contact for monitoring.

**Documents**

- Certificate policy and any existing inventory.
- List of public CA accounts and private CAs.
- Records of recent certificate outages.

**Access**

- Approval and network access to run discovery scans on agreed ranges.
- Read-only access to CA databases or CA portals, when agreed.
- Interview time with owners.

## Typical timeline

Duration depends on network size and the number of CAs. EC confirms the timeline during scoping.

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md).

## Related articles

- [Certificate lifecycle management fundamentals](../02-General/Certificate-Lifecycle-Management/certificate-lifecycle-management-fundamentals.md)
- [Preventing certificate outages](../02-General/Certificate-Lifecycle-Management/preventing-certificate-outages.md)
- [47-day SSL/TLS certificate validity timeline](../05-Popular-Right-Now/47-day-ssl-tls-certificate-validity-timeline.md)
- [Chrome client authentication EKU removal June 2026](../05-Popular-Right-Now/chrome-client-authentication-eku-removal-june-2026.md)
- [CertSecure Manager overview](../01-Products/CertSecure-Manager/certsecure-manager-overview.md)
