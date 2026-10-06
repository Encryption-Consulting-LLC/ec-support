---
title: "47-Day SSL/TLS Certificate Validity: Full Timeline from 2026 to 2029"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "Publicly trusted SSL/TLS server certificates, all public CAs, CertSecure Manager"
summary: "The CA/B Forum 47-day SSL/TLS certificate timeline explained: 200 days from March 2026, 100 days in 2027, 47 days in 2029, and how to prepare with automation."
keywords: ["47-day certificates", "SSL certificate validity", "SC-081v3", "CA/B Forum", "certificate lifespan", "certificate automation"]
primary_keyword: "47-day SSL certificate"
secondary_keywords: ["SSL/TLS certificate validity timeline", "CA/B Forum ballot SC-081v3", "200-day certificate validity", "domain validation reuse period", "certificate lifespan reduction", "certificate renewal automation"]
last_reviewed: "2026-10-06"
---

# 47-Day SSL/TLS Certificate Validity: Full Timeline from 2026 to 2029

Public Secure Sockets Layer and Transport Layer Security (SSL/TLS) certificates are getting much shorter lives. This article explains the 47-day SSL certificate timeline set by the CA/Browser Forum (CA/B Forum), what has already changed, what comes next, and how operations teams can prepare. It is written for PKI owners, IT operations, and security leaders.

## Key takeaways

- CA/B Forum Ballot SC-081v3 sets a stepped reduction of the maximum validity of public TLS certificates.
- On March 15, 2026, the maximum dropped from 398 days to 200 days. This step is already in effect.
- The next step is 100 days on March 15, 2027. The final step is 47 days on March 15, 2029.
- Domain Control Validation (DCV) reuse also shrinks, ending at 10 days in 2029.
- Manual renewal will not scale. Automation, such as the Automated Certificate Management Environment (ACME) protocol, is now a practical requirement.
- Private PKI certificates (for example from Microsoft Active Directory Certificate Services) are not covered by this ballot.

## What is the 47-day SSL certificate rule?

The 47-day rule is the end state of CA/B Forum Ballot SC-081v3, which was approved in April 2025. The ballot changes the Baseline Requirements that every publicly trusted Certificate Authority (CA) must follow. From March 15, 2029, a public TLS certificate cannot be valid for more than 47 days.

The number 47 comes from one maximum month (31 days), plus half of a 30-day month (15 days), plus one day of margin. It gives organizations a monthly renewal rhythm with some buffer.

## What is the full SSL/TLS certificate validity timeline?

| Effective date | Maximum certificate validity | Maximum DCV reuse period | Status as of October 2026 |
|---|---|---|---|
| Before March 15, 2026 | 398 days | 398 days | Replaced |
| March 15, 2026 | 200 days | 200 days | In effect |
| March 15, 2027 | 100 days | 100 days | Upcoming |
| March 15, 2029 | 47 days | 10 days | Upcoming |

Subject Identity Information (SII), such as the validated organization name in Organization Validated (OV) and Extended Validation (EV) certificates, can be reused for up to 398 days from March 2026.

> **Note:** The dates refer to when a certificate is issued. A 398-day certificate issued before March 15, 2026 stays valid until it expires. Renewals after that date follow the new limit.

## Why is the CA/B Forum shortening certificate lifespans?

Shorter certificates reduce risk in several ways:

1. **Less time for misuse.** A stolen or wrongly issued certificate is useful to an attacker for a shorter time.
2. **Revocation is weak in practice.** Many clients do not check revocation reliably. Short lifetimes limit the damage when revocation fails.
3. **Fresher validation data.** Domain ownership is checked more often, so stale or transferred domains are caught sooner.
4. **Crypto agility.** Frequent replacement makes it easier to move to new algorithms, including future post-quantum algorithms.

## What does the 200-day limit mean right now?

Since March 15, 2026, every new public TLS certificate has a maximum life of 200 days. In practice, most organizations now renew public certificates about twice a year instead of once. Teams that still track certificates in spreadsheets have already seen the workload grow. In March 2027 the workload doubles again, and by 2029 renewals will happen roughly every month for each certificate.

| Certificates in estate | Renewals per year at 398 days | At 200 days | At 100 days | At 47 days |
|---|---|---|---|---|
| 500 | about 500 | about 1,000 | about 2,000 | about 4,000 to 6,000 |
| 5,000 | about 5,000 | about 10,000 | about 20,000 | about 40,000 to 60,000 |

The 47-day range assumes renewal before expiry, typically every 30 to 45 days.

## Does the 47-day rule apply to private certificates?

No. The ballot applies only to certificates that chain to publicly trusted roots in browser trust stores. Certificates issued by an internal CA, such as Microsoft AD CS or a managed private PKI, follow the organization's own policy. Many organizations still choose shorter lifetimes for private certificates because the same automation can serve both.

## How should organizations prepare for 47-day certificates?

Use this phased plan:

1. **Discover every certificate.** Scan networks, load balancers, cloud accounts, and CAs to build a complete inventory. Unknown certificates cause most outages.
2. **Assign owners.** Every certificate needs an accountable team and a contact for alerts.
3. **Automate issuance and renewal.** Use ACME, CA APIs, or a certificate lifecycle management (CLM) platform. Start with the highest-volume endpoints.
4. **Automate deployment.** Renewal is only half the job. The new certificate must be installed and the service reloaded without manual steps.
5. **Monitor and alert.** Alert well before expiry and on failed renewals, not only on expiry date.
6. **Plan DCV automation.** With a 10-day DCV reuse window in 2029, domain validation must also be automatic, for example through DNS-based validation.
7. **Test with short lifetimes now.** Issue 47-day or shorter certificates in a test environment to find systems that cannot handle frequent change.

> **Tip:** Appliances and legacy applications that need a manual certificate import are the hardest part. List them early and plan either automation agents or replacement.

## What happens if a certificate is not renewed in time?

The browser shows a full-page warning, APIs fail Transport Layer Security handshakes, and mobile apps lose connections. Shorter lifetimes mean these failures can happen more often if renewal is manual. See [PKI certificate outages: causes and prevention](pki-certificate-outages-causes-and-prevention.md) for common failure patterns.

## How EC can help

Encryption Consulting (EC) supports the full move to short-lived certificates:

- [CertSecure Manager overview](../01-Products/CertSecure-Manager/certsecure-manager-overview.md): discovery, inventory, automated renewal, and deployment across public and private CAs.
- [Preparing for 47-day certificates with CertSecure Manager](../01-Products/CertSecure-Manager/preparing-for-47-day-certificates-with-certsecure-manager.md): a step-by-step readiness guide.
- [ACME enrollment with CertSecure Manager](../01-Products/CertSecure-Manager/acme-enrollment-with-certsecure-manager.md): standards-based automation.
- [Certificate management assessment](../03-Services/certificate-management-assessment.md): an expert review of current processes and gaps.
- [ACME protocol explained](../02-General/Certificate-Lifecycle-Management/acme-protocol-explained.md): background on the protocol most CAs support.

## Frequently asked questions

### When do 47-day SSL certificates start?

The 47-day maximum applies to public TLS certificates issued on or after March 15, 2029. Before that, the limit is 200 days (from March 15, 2026) and then 100 days (from March 15, 2027).

### Do existing 398-day certificates stop working on March 15, 2026?

No. Certificates issued before March 15, 2026 remain valid until their original expiry date. Only new and renewed certificates follow the 200-day limit.

### Does the 47-day limit apply to code signing or S/MIME certificates?

No. Ballot SC-081v3 covers TLS server certificates only. Code signing certificates have a separate limit of 460 days, effective March 1, 2026, under CA/B Forum Ballot CSC-31.

### Is ACME required for 47-day certificates?

The ballot does not mandate a specific protocol. However, ACME or another automated method is the only realistic way to renew thousands of certificates every month without errors.

### Why 47 days and not 30 or 90?

The value gives a monthly renewal cycle (31 days plus 15 days of slack plus 1 day of margin). It balances security benefits against operational effort.

### Will EV and OV certificates still exist?

Yes. OV and EV certificates are still available. Their organization details can be reused for up to 398 days, but the certificates themselves follow the same maximum validity as Domain Validated (DV) certificates.
