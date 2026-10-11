---
title: "Chrome Client Authentication EKU Removal: June 2026 and March 2027 Deadlines Explained"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "Public SSL/TLS certificates used for mutual TLS or client authentication, private PKI, Microsoft AD CS"
summary: "Why public TLS certificates are losing the clientAuth EKU, the June 15 2026 and March 15 2027 Chrome deadlines, and how to move mTLS to private PKI."
keywords: ["clientAuth EKU", "Chrome Root Program", "mTLS", "client authentication certificate", "private PKI", "serverAuth"]
primary_keyword: "Chrome client authentication EKU removal"
secondary_keywords: ["clientAuth EKU public TLS certificates", "Chrome Root Program Policy", "dedicated TLS server authentication hierarchy", "mutual TLS private PKI", "serverAuth only certificates", "June 15 2026 Chrome deadline"]
last_reviewed: "2026-10-06"
---

# Chrome Client Authentication EKU Removal: June 2026 and March 2027 Deadlines Explained

Public SSL/TLS certificates are losing the Client Authentication Extended Key Usage (clientAuth EKU). This change breaks systems that reuse public web server certificates to prove a client's identity, such as server-to-server mutual TLS (mTLS). This article explains the Chrome Root Program rules, the deadlines, and how to move client authentication to private PKI. It is written for PKI teams, application owners, and network engineers.

## Key takeaways

- The Chrome Root Program requires public TLS hierarchies to be dedicated to TLS server authentication only.
- Since June 15, 2026, new subordinate CAs disclosed under a Chrome-trusted root must assert only the serverAuth EKU.
- From March 15, 2027, every newly issued public TLS subscriber (leaf) certificate must assert only the serverAuth EKU.
- Most public CAs removed clientAuth from default certificate profiles during 2025 and 2026, ahead of the Chrome deadline. Let's Encrypt ended all clientAuth issuance on July 8, 2026.
- Certificates already issued stay valid until expiry, but renewals come back without clientAuth.
- Move mTLS, VPN, Wi-Fi, and device authentication to a private Certificate Authority (CA).

## What is the clientAuth EKU?

The Extended Key Usage (EKU) extension lists what a certificate may be used for. Two values matter here:

| EKU name | Object identifier | Purpose |
|---|---|---|
| id-kp-serverAuth | 1.3.6.1.5.5.7.3.1 | Proves a server's identity in TLS |
| id-kp-clientAuth | 1.3.6.1.5.5.7.3.2 | Proves a client's identity in TLS |

For many years, public CAs placed both values in TLS certificates by default. Some organizations then used the same public certificate on a server that also acted as a TLS client, for example in partner integrations or between internal services.

## What did Chrome change, and when?

Chrome Root Program Policy version 1.6 (February 2025) introduced the phase-out of multi-purpose roots. Version 1.8 (February 5, 2026) is the current policy and sets these dates:

| Date | Requirement | Status as of October 2026 |
|---|---|---|
| June 15, 2026 | Subordinate CA certificates disclosed on or after this date must assert only serverAuth | In effect |
| June 15, 2026 | Chrome begins phasing out hierarchies found in violation, with a phase-out date 90 days after detection | In effect |
| March 15, 2027 | All newly issued subscriber certificates must assert only serverAuth | Upcoming |

> **Note:** Early industry coverage described June 15, 2026 as the date for leaf certificates. The current policy text (v1.8) sets March 15, 2027 for subscriber certificates. In practice, most public CAs already stopped issuing clientAuth in their default profiles before June 2026, so organizations should not plan on public clientAuth certificates being available.

## Why is Chrome removing client authentication from public certificates?

Chrome's root store exists only to secure TLS server connections in the browser. Multi-purpose hierarchies create problems:

1. A rule change for web security can break unrelated client authentication systems, which slows down needed security changes.
2. Client authentication has different validation needs than website identity. Public CAs validate domains, not devices or users.
3. Dedicated hierarchies are simpler to audit, to rotate, and to move to new algorithms.

## How did public CAs handle the transition?

Public CAs set their own schedules ahead of the policy dates. For example, Let's Encrypt removed clientAuth from its default `classic` ACME profile on February 11, 2026, and ended its temporary `tlsclient` profile on July 8, 2026. Other CAs published similar phased schedules. Check the current notice from the issuing CA for exact dates.

## Which systems break when clientAuth is removed?

Look for these patterns:

- **Server-to-server mTLS** where a public web certificate is presented as a client certificate.
- **Business-to-business APIs** where a partner pins or checks a public certificate for client identity.
- **Email servers and gateways** that use the same public certificate for inbound and outbound TLS with client certificate checks.
- **VPN, Wi-Fi (802.1X), and Single Sign-On (SSO)** integrations that accepted public certificates as client credentials.
- **DevOps tooling** that reuses public certificates for agent or runner authentication.

The failure usually shows up only at renewal time, when the new certificate arrives without clientAuth and the remote side rejects the TLS handshake.

## How to find certificates that depend on clientAuth

1. **Inventory public certificates** and filter for those that contain the clientAuth EKU.
2. **Check where each one is used.** A certificate on a web server only is fine. A certificate used by an outbound client is at risk.
3. **Review TLS logs** on API gateways and load balancers for client certificate requests.
4. **Ask partners** whether they validate the EKU of client certificates they receive.

To inspect a certificate's EKU locally:

```bash
openssl x509 -in <certificate.pem> -noout -ext extendedKeyUsage
```

```powershell
certutil -dump <certificate.cer> | Select-String -Pattern "Client Authentication|Server Authentication"
```

## How to move mTLS to private PKI

1. **Choose a private CA.** Options include Microsoft Active Directory Certificate Services (AD CS) or a managed PKI service.
2. **Create a dedicated client authentication template or profile** with only the clientAuth EKU, or both EKUs where a private server also acts as a client.
3. **Distribute the private root** to every system that validates the client certificates. For external partners, share the private CA chain through an agreed process.
4. **Automate issuance and renewal** so private certificates do not become a new outage source.
5. **Cut over** service by service, with rollback to the old certificate while it is still valid.

> **Warning:** Do not wait for the current public certificate to expire. If renewal produces a serverAuth-only certificate, the mTLS connection fails immediately.

## How EC can help

- [PKI-as-a-Service overview](../01-Products/PKI-as-a-Service/pki-as-a-service-overview.md): a managed private PKI for client authentication and mTLS.
- [CertSecure Manager overview](../01-Products/CertSecure-Manager/certsecure-manager-overview.md): finds certificates with clientAuth and automates replacement.
- [Certificate templates in AD CS](../02-General/PKI/certificate-templates-in-ad-cs.md): how to build dedicated client authentication templates.
- [PKI design and implementation](../03-Services/pki-design-and-implementation.md): expert help to design a private PKI.
- [Chrome Root Program CA distrust: what to do](chrome-root-program-ca-distrust-what-to-do.md): related Chrome root store changes.

## Frequently asked questions

### Is the Chrome clientAuth deadline June 15, 2026 or March 15, 2027?

Both dates exist. June 15, 2026 applies to new subordinate CAs in Chrome-trusted hierarchies. March 15, 2027 applies to all newly issued subscriber (leaf) certificates, according to Chrome Root Program Policy v1.8.

### Do existing certificates with clientAuth stop working?

No. Certificates issued before the change remain valid until they expire. The risk appears at renewal, when the new certificate no longer contains clientAuth.

### Can a public CA still issue a certificate with clientAuth?

Most public CAs have already stopped doing so for TLS certificates. Some offer separate client or S/MIME products from non-TLS hierarchies. Confirm options with the issuing CA.

### Does this affect private PKI certificates?

No. Certificates from a private CA that is not in the Chrome Root Store are not affected. Private PKI is the recommended home for client authentication.

### Does this affect browsers other than Chrome?

The rule comes from the Chrome Root Program, but because public CAs serve all browsers from the same hierarchies, the effect is industry wide.
