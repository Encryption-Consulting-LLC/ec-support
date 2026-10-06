---
title: "Chrome Root Program CA Distrust: What It Means and What to Do"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "Public SSL/TLS certificates, Chrome Root Store, Entrust, Chunghwa Telecom, NetLock, CertSecure Manager"
summary: "How Chrome distrusts a CA, recent cases (Entrust, Chunghwa Telecom, NetLock), root term limits, and a step-by-step plan to replace affected certificates."
keywords: ["Chrome distrust", "Chrome Root Store", "Entrust distrust", "Chunghwa Telecom", "NetLock", "CA replacement"]
primary_keyword: "Chrome CA distrust"
secondary_keywords: ["Chrome Root Store removal", "Entrust certificates distrusted Chrome", "Chunghwa Telecom NetLock distrust", "SCT-based distrust", "replace distrusted SSL certificates", "root CA 15-year term limit"]
last_reviewed: "2026-10-06"
---

# Chrome Root Program CA Distrust: What It Means and What to Do

When the Chrome Root Program loses confidence in a Certificate Authority (CA), Chrome stops trusting new certificates from that CA. Websites that keep using those certificates show a full-page security warning. This article explains how a distrust works, the recent cases, root age limits, and a practical response plan. It is written for PKI owners, web operations, and security teams.

## Key takeaways

- Chrome distrust actions usually affect only certificates issued after a cutoff date. Older certificates stay trusted until they expire.
- The cutoff is based on the earliest Signed Certificate Timestamp (SCT), which records when the certificate was logged in Certificate Transparency.
- Entrust public TLS certificates with an earliest SCT after November 11, 2024 are distrusted in Chrome 131 and later.
- Chunghwa Telecom and NetLock TLS certificates with an earliest SCT after July 31, 2025 are distrusted in Chrome 139 and later.
- Chrome also removes roots whose keys are older than 15 years, on a published schedule.
- The fix is to find every affected certificate and replace it with one from a trusted CA before it causes an outage.

## What does Chrome CA distrust mean?

The Chrome Root Store is the list of root certificates that Chrome trusts for TLS server authentication. The Chrome Root Program decides which roots are included. When a CA shows a pattern of compliance failures, slow incident response, or other concerns, Chrome can:

1. Block new certificates from the CA after a cutoff date (a constrained distrust).
2. Remove the root completely.

Chrome usually announces these actions months in advance on the Google Security Blog.

## Which CAs has Chrome recently distrusted?

| CA | Chrome version | Cutoff (earliest SCT after) | Announced |
|---|---|---|---|
| Entrust (several public TLS roots) | Chrome 131 and later | November 11, 2024 | June 2024 |
| Chunghwa Telecom (ePKI Root Certification Authority, HiPKI Root CA - G1) | Chrome 139 and later | July 31, 2025 | May 2025 |
| NetLock (Arany Class Gold root) | Chrome 139 and later | July 31, 2025 | May 2025 |

The distrust applies on Windows, macOS, ChromeOS, Android, and Linux. Chrome on iOS uses the Apple trust store and is not covered.

> **Note:** Other browsers and operating systems run their own root programs. Mozilla, Apple, and Microsoft may take similar or different actions. Check each program for current status.

## What is the Chrome root term limit?

Chrome Root Program Policy (version 1.8, February 2026) removes any root whose key material was generated more than 15 years ago. The schedule is:

| Removal date | Root keys generated in | Status as of October 2026 |
|---|---|---|
| April 15, 2026 | 2006 to 2007 | Done |
| April 15, 2027 | 2008 to 2009 | Upcoming |
| April 15, 2028 | 2010 to 2011 | Upcoming |
| April 15, 2029 | 2012 to April 2014 | Upcoming |
| Ongoing | After April 15, 2014 | 15 years after generation |

CAs normally move customers to newer roots before removal. Systems that pin an old root or ship a fixed trust bundle may still break.

## What happens to sites that use a distrusted certificate?

Chrome shows a full-page interstitial warning that the connection is not private. Most visitors leave. APIs called from Chrome-based applications also fail. Systems that do not use the Chrome Root Store, such as many server-to-server clients, may keep working, which hides the problem until a browser user reports it.

## How to respond to a Chrome CA distrust

### Phase 1: Assess

1. **Build an inventory** of every public TLS certificate. Include load balancers, CDNs, cloud certificate services, and appliances.
2. **Filter by issuer** for the affected CA and root.
3. **Check issuance dates and SCTs.** Certificates logged before the cutoff are still trusted until expiry. Certificates logged after it are already broken in Chrome.

### Phase 2: Choose a new CA

1. Select one or more trusted public CAs. Having two CAs ready reduces risk in future distrust events.
2. Set up accounts, domain validation, and Automated Certificate Management Environment (ACME) or API access.

### Phase 3: Replace

1. Replace certificates issued after the cutoff first, since they are failing now.
2. Replace remaining certificates before they expire, rather than renewing with the distrusted CA.
3. Update any certificate pinning, trust bundles, or partner allow-lists that reference the old CA.

### Phase 4: Verify

```bash
openssl s_client -connect <hostname>:443 -servername <hostname> -showcerts </dev/null | openssl x509 -noout -issuer -dates
```

Confirm the new issuer and test in a current Chrome version.

> **Tip:** Enterprises can keep trusting an affected root for internal testing by installing it as a locally trusted root through Group Policy, as Chrome 127 and later honors local trust. This does not help public visitors.

## How to avoid being caught by the next distrust

- Keep a complete, current certificate inventory with issuer details.
- Automate issuance and deployment so switching CAs is a configuration change, not a project.
- Maintain a second approved CA.
- Monitor Chrome, Mozilla, and CA/Browser Forum announcements.

## How EC can help

- [CertSecure Manager overview](../01-Products/CertSecure-Manager/certsecure-manager-overview.md): issuer-based inventory and bulk replacement.
- [Connecting CertSecure Manager to public CAs](../01-Products/CertSecure-Manager/connecting-certsecure-manager-to-public-cas.md): set up alternate CAs.
- [Certificate discovery in CertSecure Manager](../01-Products/CertSecure-Manager/certificate-discovery-in-certsecure-manager.md): find certificates from a specific CA.
- [Certificate management assessment](../03-Services/certificate-management-assessment.md): a review of CA dependency and agility.
- [Chrome client authentication EKU removal](chrome-client-authentication-eku-removal-june-2026.md): another current Chrome root program change.

## Frequently asked questions

### Do existing Entrust certificates still work in Chrome?

Entrust certificates with an earliest SCT on or before November 11, 2024 remain trusted until they expire. Certificates logged after that date are distrusted in Chrome 131 and later. Entrust now delivers public TLS certificates through a partner CA, so check the issuer of any recent certificate.

### How can an organization tell if a certificate is affected?

Check the root and issuing CA in the certificate chain and the date of the earliest SCT, then compare with the published cutoff. A CLM tool can do this across the whole inventory.

### Does a Chrome distrust affect private or internal certificates?

No. Private CAs are not in the Chrome Root Store, so these actions do not apply. Root term limits also apply only to public roots.

### Why does Chrome use SCT dates instead of the notBefore date?

The notBefore date is set by the CA and could be backdated. The SCT is set by an independent Certificate Transparency log, so it is a more reliable record of when a certificate was issued.

### Will Firefox and Safari also distrust the same CA?

Not always. Each browser has its own root program. Mozilla and Apple sometimes take matching actions, but timing and scope can differ.
