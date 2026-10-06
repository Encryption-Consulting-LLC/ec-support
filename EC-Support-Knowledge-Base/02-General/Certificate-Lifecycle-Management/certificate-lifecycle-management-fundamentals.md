---
title: "Certificate Lifecycle Management Fundamentals"
category: "General"
section: "Certificate Lifecycle Management"
article_type: "Concept"
applies_to: "Public and private TLS, client, code signing, and device certificates across on-premises and cloud environments"
summary: "Learn the stages of certificate lifecycle management: discovery, request, issuance, deployment, monitoring, renewal, revocation, and why automation is required."
keywords: ["certificate lifecycle management", "CLM", "certificate discovery", "certificate renewal automation", "machine identity management"]
last_reviewed: "2026-10-06"
---

# Certificate Lifecycle Management Fundamentals

This article explains Certificate Lifecycle Management (CLM): the stages every certificate goes through, the problems CLM solves, and how automation fits in. It is for PKI teams, infrastructure and application owners, and security leaders who manage certificates at scale.

## What it is

CLM is the practice of tracking and controlling every digital certificate in an organization, from request to retirement. It covers public TLS certificates, private certificates from internal Certificate Authorities (CAs), client and device certificates, code signing certificates, and the keys behind them. CLM is also called machine identity management.

## Why it matters

- **Outages.** An expired certificate can stop a website, API, VPN, or payment system. Many large outages have been caused by a single forgotten certificate.
- **Scale.** Enterprises often have tens or hundreds of thousands of certificates across servers, load balancers, cloud services, containers, and devices.
- **Shorter lifetimes.** Under CA/Browser (CA/B) Forum Ballot SC-081v3, the maximum validity for public TLS certificates is 200 days from March 15 2026, 100 days from March 15 2027, and 47 days from March 15 2029. Manual renewal does not scale at these lifetimes.
- **Security.** Unknown certificates, weak keys, and unapproved CAs create risk. A compromised key needs fast replacement.
- **Compliance.** Auditors ask for inventories, ownership, and evidence of policy enforcement.
- **Crypto agility.** Moving to Post-Quantum Cryptography (PQC) or away from a distrusted CA requires knowing where every certificate is.

## How it works

1. **Discover.** Scan networks, CAs, cloud accounts, load balancers, and key stores to find every certificate, including ones that were issued outside official processes.
2. **Inventory and assign owners.** Record each certificate's subject, issuer, expiry, key type, location, and business owner.
3. **Define policy.** Set approved CAs, key algorithms and sizes, validity periods, and naming rules.
4. **Request and approve.** Users or systems request certificates through a self-service portal, API, or protocol such as Automated Certificate Management Environment (ACME), Simple Certificate Enrollment Protocol (SCEP), or Enrollment over Secure Transport (EST). Requests are checked against policy and approved where needed.
5. **Issue.** The CA issues the certificate.
6. **Deploy.** The certificate and key are installed on the target (web server, load balancer, application, device) and bound to the right service.
7. **Monitor.** Expiry, revocation status, configuration, and policy compliance are tracked, with alerts before problems occur.
8. **Renew or replace.** Before expiry, a new certificate is issued and deployed, ideally with a new key.
9. **Revoke and retire.** Certificates for retired systems or compromised keys are revoked and removed.

## Manual vs automated CLM

| Area | Manual (spreadsheets, calendar reminders) | Automated CLM |
|---|---|---|
| Inventory | Incomplete, quickly out of date | Continuous discovery |
| Renewal | Ticket-driven, error-prone | Scheduled or event-driven, end to end |
| Deployment | Manual copy and bind | Agents, APIs, or ACME clients push and bind |
| Policy | Checked by people, if at all | Enforced at request time |
| Short lifetimes | Unworkable at 47 days | Designed for it |
| Incident response | Days to weeks to replace | Hours, in bulk |

## Key terms

| Term | Meaning |
|---|---|
| CLM | Certificate Lifecycle Management |
| Certificate inventory | Central record of all certificates and their attributes |
| Shadow certificates | Certificates issued outside approved processes, often unknown to the PKI team |
| ACME | Protocol for automated certificate issuance and renewal (RFC 8555) |
| SCEP and EST | Enrollment protocols often used for devices |
| Crypto agility | The ability to change algorithms, keys, or CAs quickly |

## Common questions

### Where should a CLM program start?
With discovery. It is not possible to manage certificates that are unknown. Then assign owners and automate the most critical renewals first.

### Is ACME enough on its own?
ACME automates issuance and renewal on servers that support a client. A CLM platform adds inventory, policy, reporting, and deployment to systems that cannot run an ACME client, such as some appliances. See [ACME protocol explained](acme-protocol-explained.md).

### Does CLM cover private PKI?
Yes. Internal CAs such as Microsoft Active Directory Certificate Services (AD CS) usually issue most certificates in an enterprise.

### How can EC help?
[CertSecure Manager](../../01-Products/CertSecure-Manager/certsecure-manager-overview.md) provides discovery, inventory, automated renewal and deployment, alerts, and policy enforcement across public and private CAs. EC's [certificate management assessment](../../03-Services/certificate-management-assessment.md) reviews current processes.

## Related articles

- [ACME protocol explained](acme-protocol-explained.md)
- [Preventing certificate outages](preventing-certificate-outages.md)
- [PKI fundamentals](../PKI/pki-fundamentals.md)
- [47-day SSL/TLS certificate validity timeline](../../05-Popular-Right-Now/47-day-ssl-tls-certificate-validity-timeline.md)
- [Preparing for 47-day certificates with CertSecure Manager](../../01-Products/CertSecure-Manager/preparing-for-47-day-certificates-with-certsecure-manager.md)
- [Certificate discovery in CertSecure Manager](../../01-Products/CertSecure-Manager/certificate-discovery-in-certsecure-manager.md)
