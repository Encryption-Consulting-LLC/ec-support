---
title: "Preparing for 47-Day Certificates with CertSecure Manager"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager; publicly trusted TLS certificates under CA/Browser Forum Ballot SC-081v3"
summary: "A practical plan to use CertSecure Manager to get ready for 200, 100, and 47-day public TLS certificate validity under CA/Browser Forum Ballot SC-081v3."
keywords: ["47-day certificates", "SC-081v3", "certificate validity", "certificate automation", "CertSecure Manager"]
last_reviewed: "2026-10-06"
---

# Preparing for 47-Day Certificates with CertSecure Manager

This article explains how public TLS certificate lifetimes are getting shorter and how to use CertSecure Manager to prepare. It gives a phased plan from inventory to full automation. It is for PKI owners, infrastructure leads, and anyone responsible for public websites and APIs.

## Overview

The CA/Browser Forum approved Ballot SC-081v3, which reduces the maximum validity of publicly trusted Transport Layer Security (TLS) certificates in steps. It also shortens how long a Certificate Authority (CA) may reuse earlier domain validation.

| Effective date | Maximum certificate validity | Domain validation reuse |
|---|---|---|
| Before March 15, 2026 | 398 days | 398 days |
| March 15, 2026 | 200 days | 200 days |
| March 15, 2027 | 100 days | 100 days |
| March 15, 2029 | 47 days | 10 days |

Subject identity information (organization details) may be reused for 398 days from March 2026.

As of October 2026, the 200-day limit is already in force. In 2029, a public certificate will need renewal roughly every month, and domain control must be proven again almost every time. Manual renewal does not scale to that pace.

> **Note:** These rules apply to publicly trusted TLS certificates. Private PKI certificates (for example, from an internal Microsoft AD CS CA) are not bound by SC-081v3, but many organizations choose to shorten them too.

## Applies to

- Public TLS certificates from DigiCert, Sectigo, Let's Encrypt, Google Public CA, AWS Certificate Manager, and other public CAs.
- All endpoint types that present public certificates.

## Prerequisites

- CertSecure Manager connected to the public CAs in use. See [Connecting CertSecure Manager to public CAs](connecting-certsecure-manager-to-public-cas.md).
- Discovery running across internet-facing ranges. See [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md).
- Endpoint owners identified.

## Before starting

- Set a target date for each phase that comes well before March 15, 2027 (100 days).
- Agree with change management that automated renewals are standard changes. Monthly change tickets per certificate are not workable.
- Check Chrome root program changes at the same time. Under Chrome Root Program Policy v1.8, public TLS certificates issued on or after March 15, 2027 must carry only the server authentication Extended Key Usage (EKU), and most public CAs already removed client authentication in 2026. Move mutual TLS (mTLS) and client authentication to private PKI.

## Procedure

### Phase 1: Build a complete inventory

1. Run network discovery on all public ranges and hostnames.
2. Import issued certificates from every public CA account.
3. Tag each certificate as public or private, and by business service.
4. Assign an owner to every public certificate.

### Phase 2: Measure renewal readiness

For each public certificate, record:

| Question | Why it matters |
|---|---|
| Is renewal automated end to end? | Manual steps fail at monthly frequency |
| Is domain validation automated (DNS API or ACME)? | Validation reuse drops to 10 days in 2029 |
| Can the endpoint take a new certificate without downtime? | Frequent reloads must be safe |
| Is the certificate pinned anywhere (mobile apps, partner systems)? | Pinning to a leaf breaks on every renewal |
| Is the certificate copied to many places by hand? | Every copy needs automated deployment |

Use reports and tags in CertSecure Manager to track the share of certificates that are fully automated. Report name: {{TBD: CertSecure Manager automation coverage report name}}.

### Phase 3: Automate validation

1. Move public domains to DNS-based validation through a DNS provider API, or to ACME challenges.
2. Remove email-based validation from automated workflows.
3. Test validation for wildcard certificates (these need DNS validation under ACME).

### Phase 4: Automate renewal and deployment

1. Connect each endpoint type (F5 BIG-IP, IIS, NGINX, Apache, Tomcat, cloud load balancers). See [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md).
2. Where an endpoint cannot be integrated directly, use an ACME client on the host. See [ACME enrollment with CertSecure Manager](acme-enrollment-with-certsecure-manager.md).
3. Set renewal windows as a percentage of lifetime (for example, renew when one third remains).
4. Enable alerts only for failures on automated certificates. See [Configuring expiry alerts and notifications](configuring-expiry-alerts-and-notifications.md).

### Phase 5: Reduce lifetimes early

1. Issue new public certificates with shorter validity than the maximum (for example, 90 days) before the rules require it.
2. Watch failure rates. Fix weak points while there is still margin.

### Phase 6: Remove blockers

- Replace leaf certificate pinning with pinning to a CA or public key set the organization controls, or remove pinning.
- Move internal-only names to private PKI.
- Move client authentication certificates to private PKI.

## Verification

- The automation coverage report shows all public certificates as automated.
- A test renewal of a short-lived certificate completes without manual steps.
- No public certificate has validity longer than the current limit.
- Failure alerts reach the right team and ITSM queue.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| CA rejects order for 1-year certificate | Requested validity above the current maximum | Set profile validity to 200 days or less now, 100 days or less from March 15, 2027 |
| Frequent domain validation failures | Manual or email validation still in use | Switch to DNS API or ACME validation |
| Outage after renewal on a partner system | Partner pinned the old leaf certificate | Agree a pinning change with the partner |
| Renewal volume overloads change process | Each renewal raised as a normal change | Approve automated renewals as standard changes |
| Some certificates never renew | Endpoint not integrated | Integrate the endpoint or use an ACME client |

## Related articles

- [47-day SSL/TLS certificate validity timeline](../../05-Popular-Right-Now/47-day-ssl-tls-certificate-validity-timeline.md)
- [Chrome client authentication EKU removal (June 2026)](../../05-Popular-Right-Now/chrome-client-authentication-eku-removal-june-2026.md)
- [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md)
- [ACME enrollment with CertSecure Manager](acme-enrollment-with-certsecure-manager.md)
- [Certificate lifecycle management fundamentals](../../02-General/Certificate-Lifecycle-Management/certificate-lifecycle-management-fundamentals.md)
