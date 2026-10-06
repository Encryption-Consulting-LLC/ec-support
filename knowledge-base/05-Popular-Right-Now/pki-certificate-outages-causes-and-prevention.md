---
title: "Certificate Outages: Common Causes and How to Prevent Them"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Concept"
applies_to: "Public and private PKI, TLS certificates, Microsoft AD CS, CRL and OCSP services, CertSecure Manager"
summary: "Why certificate outages happen (expired certificates, CRLs, chains, root changes) and a prevention plan built on inventory, automation, and monitoring."
keywords: ["certificate outage", "expired certificate", "certificate expiration", "PKI outage", "CRL expired", "certificate lifecycle management"]
primary_keyword: "certificate outages"
secondary_keywords: ["expired SSL certificate outage", "prevent certificate expiration", "PKI outage causes", "expired CRL outage", "certificate monitoring", "certificate lifecycle automation"]
last_reviewed: "2026-10-06"
---

# Certificate Outages: Common Causes and How to Prevent Them

A certificate outage happens when a digital certificate, or the PKI service behind it, fails and breaks a connection. Users see browser warnings, APIs stop working, and devices drop off the network. This article explains the most common causes and a practical prevention plan. It is written for PKI administrators, IT operations, and site reliability teams.

## Key takeaways

- Expired certificates are the most common cause of certificate outages, but expired Certificate Revocation Lists (CRLs), broken chains, and trust store changes also cause major incidents.
- Most outages come from certificates nobody knew about or nobody owned.
- Shorter public certificate lifetimes (200 days since March 15, 2026, 100 days from March 2027, 47 days from March 2029) multiply the number of renewals.
- Prevention needs four things: a complete inventory, clear ownership, automation, and monitoring.
- Private PKI services, such as CRL distribution points and Online Certificate Status Protocol (OCSP) responders, need the same attention as certificates.
- Runbooks for emergency renewal and emergency CRL signing shorten recovery time.

## What is a certificate outage?

A certificate outage is any service failure caused by a certificate problem. Well-known public examples include a widely used collaboration service going down in February 2020 after an authentication certificate expired, a December 2018 mobile network outage across several countries caused by an expired certificate in network software, and widespread connection errors on older devices when the DST Root CA X3 root expired on September 30, 2021.

## What are the most common causes of certificate outages?

| Cause | What happens | Typical root problem |
|---|---|---|
| Expired leaf certificate | TLS handshake fails, browser warning | No inventory or missed alert |
| Expired intermediate or root | Every certificate under it fails | Long-lived certificate forgotten |
| Expired or unreachable CRL | Clients that check revocation reject certificates | CRL not published, offline root CRL not renewed |
| OCSP responder failure | Revocation checks fail or time out | Responder signing certificate expired or service down |
| Incomplete chain | Some clients fail, others work | Intermediate not installed on the server |
| Wrong certificate deployed | Name mismatch errors | Manual deployment mistake |
| Trust store change | Certificates from a distrusted or removed CA fail | CA distrust or root removal |
| EKU change | Client authentication fails after renewal | Public CAs removing clientAuth EKU |
| Key or algorithm rejected | Clients refuse weak keys or algorithms | Old RSA-1024 or SHA-1 certificates |
| Renewal not deployed | New certificate issued but old one still in use | Renewal automated, deployment not |

## Why are certificate outages getting more likely?

1. **Shorter lifetimes.** Public TLS certificates now last at most 200 days, falling to 47 days by 2029. More renewals means more chances to miss one. See [47-day SSL/TLS certificate validity timeline](47-day-ssl-tls-certificate-validity-timeline.md).
2. **More certificates.** Cloud services, containers, microservices, and Internet of Things (IoT) devices all need certificates.
3. **Root program changes.** Chrome distrust actions, root age limits, and the removal of client authentication from public certificates change what clients accept.
4. **Staff turnover.** Knowledge about where certificates live often leaves with people.

## How to prevent certificate outages

### 1. Build a complete inventory

Discover certificates on networks, load balancers, cloud services, CAs, and keystores. Include private CA certificates, CA certificates, and OCSP signing certificates, not only public TLS certificates.

### 2. Assign an owner to every certificate

Each certificate needs a responsible team, a contact for alerts, and a record of where it is installed.

### 3. Automate renewal and deployment

Use the Automated Certificate Management Environment (ACME) protocol, CA APIs, or a certificate lifecycle management (CLM) platform. Automate installation and service reload, not only issuance.

### 4. Monitor and alert in layers

| Alert | Suggested timing |
|---|---|
| Upcoming expiry (long-lived certificates) | 60, 30, 14, and 7 days before |
| Upcoming expiry (short-lived, automated) | When renewal has not succeeded by two thirds of the lifetime |
| Renewal or deployment failure | Immediately |
| CRL next update approaching | Several days before, based on publication interval |
| OCSP responder health | Continuous |

Send alerts to a team queue or IT Service Management (ITSM) system, not to one person's mailbox.

### 5. Protect PKI infrastructure

- Publish CRLs well before they expire and monitor CRL Distribution Points (CDP) and Authority Information Access (AIA) locations.
- Schedule offline root CRL renewal on a calendar with owners and reminders.
- Run OCSP responders in high availability.

### 6. Prepare runbooks

Write and test procedures for emergency certificate replacement, emergency CRL signing, and CA certificate renewal before they are needed.

### 7. Test changes before production

Test new chains, new CAs, and new certificate profiles with representative clients, including older devices.

## How to respond during a certificate outage

1. Confirm the cause: check certificate dates, chain, and revocation status.
2. Issue and deploy a replacement certificate, or publish a fresh CRL.
3. Restart or reload the affected services.
4. Verify with external and internal clients.
5. Run a post-incident review and add the missing certificate or process to monitoring.

```bash
openssl s_client -connect <hostname>:443 -servername <hostname> </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -enddate
```

```powershell
certutil -URL <certificate.cer>
```

## How EC can help

- [CertSecure Manager overview](../01-Products/CertSecure-Manager/certsecure-manager-overview.md): discovery, alerts, and automated renewal.
- [Configuring expiry alerts and notifications](../01-Products/CertSecure-Manager/configuring-expiry-alerts-and-notifications.md): set up layered alerts.
- [Preventing certificate outages](../02-General/Certificate-Lifecycle-Management/preventing-certificate-outages.md): deeper practitioner guidance.
- [Emergency CRL signing](../04-Featured-Articles/PKI-Runbooks/emergency-crl-signing.md): restore revocation service fast.
- [Recovering from an expired CRL](../04-Featured-Articles/PKI-Runbooks/recovering-from-an-expired-crl.md): step-by-step recovery.
- [PKI managed support](../03-Services/pki-managed-support.md): ongoing expert operation of PKI.

## Frequently asked questions

### What is the most common cause of certificate outages?

An expired certificate that was not in any inventory or had no owner. Automation and discovery address this directly.

### Can an expired CRL cause an outage?

Yes. Clients that require revocation checking, such as many VPN, Wi-Fi, and smart card logon systems, reject certificates when the CRL has expired, even if the certificates themselves are valid.

### How far in advance should certificates be renewed?

For automated short-lived certificates, renew at about two thirds of the lifetime. For long-lived certificates, start at least 30 days before expiry, with earlier alerts for CA certificates.

### Are spreadsheets enough to track certificates?

Not at scale. Spreadsheets go out of date quickly and do not detect unknown certificates. Shorter certificate lifetimes make manual tracking impractical.

### Do private PKI certificates cause outages too?

Yes. Internal certificates, CA certificates, CRLs, and OCSP responders are frequent causes because they are often less visible than public certificates.
