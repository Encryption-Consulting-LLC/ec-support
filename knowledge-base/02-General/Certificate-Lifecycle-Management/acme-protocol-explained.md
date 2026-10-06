---
title: "ACME Protocol Explained"
category: "General"
section: "Certificate Lifecycle Management"
article_type: "Concept"
applies_to: "ACME (RFC 8555) with public CAs and private CAs, ACME clients such as Certbot, acme.sh, win-acme, and cert-manager"
summary: "How the ACME protocol (RFC 8555) automates certificate issuance and renewal: accounts, orders, HTTP-01, DNS-01 and TLS-ALPN-01 challenges, EAB, and ARI."
keywords: ["ACME protocol", "RFC 8555", "HTTP-01 challenge", "DNS-01 challenge", "ACME renewal information", "certificate automation"]
last_reviewed: "2026-10-06"
---

# ACME Protocol Explained

This article explains the Automated Certificate Management Environment (ACME) protocol: what it does, how a certificate is issued step by step, and how challenge types differ. It is for system administrators, DevOps engineers, and PKI teams planning to automate certificate issuance and renewal.

## What it is

ACME is an open protocol, published by the Internet Engineering Task Force (IETF) as RFC 8555 in 2019, that lets software request, validate, renew, and revoke certificates without human steps. It was created for Let's Encrypt and is now supported by many public Certificate Authorities (CAs) and private CA platforms.

An ACME **client** runs on or near the server that needs a certificate. An ACME **server** runs at the CA. They talk over HTTPS using JSON messages signed with the client's account key.

## Why it matters

Public TLS certificate lifetimes are falling to 200 days in 2026, 100 days in 2027, and 47 days in 2029. Domain validation reuse periods are shrinking too, down to 10 days in 2029. Manual renewal at this pace is not realistic. ACME makes renewal routine and repeatable, which removes the most common cause of certificate outages.

## How it works

1. **Directory.** The client reads the CA's directory URL, which lists the endpoints for new accounts, new orders, nonces, revocation, and key change.
2. **Account.** The client creates an ACME account with its own key pair and agrees to the CA's terms. Commercial and private CAs often require **External Account Binding (EAB)**, which links the ACME account to an existing customer account using a key ID and HMAC key provided by the CA.
3. **Order.** The client submits a new order listing the identifiers (domain names) it wants in the certificate.
4. **Authorizations and challenges.** For each identifier, the CA returns an authorization with one or more challenges. The client proves control of the domain by completing one challenge.
5. **Validation.** The client tells the CA the challenge is ready. The CA checks it, often from several network locations.
6. **Finalize.** Once all authorizations are valid, the client sends a Certificate Signing Request (CSR).
7. **Download.** The CA issues the certificate and the client downloads the certificate chain and installs it.
8. **Renew.** The client repeats the order before expiry, usually when about one third of the lifetime is left, or when the CA suggests a time through ARI.

## Challenge types

| Challenge | How control is proven | Good for | Limits |
|---|---|---|---|
| HTTP-01 | Client places a token file at `http://<domain>/.well-known/acme-challenge/<token>` on port 80 | Single web servers reachable from the internet | No wildcard certificates; needs port 80 open |
| DNS-01 | Client creates a TXT record at `_acme-challenge.<domain>` | Wildcards, internal servers, load-balanced sites | Needs DNS API access; DNS propagation delays |
| TLS-ALPN-01 (RFC 8737) | Client serves a special certificate on port 443 using the `acme-tls/1` protocol | Servers where only port 443 is reachable | No wildcards; client must control the TLS listener |

## ACME Renewal Information (ARI)

RFC 9773 (published 2025) adds ACME Renewal Information. The CA publishes a suggested renewal window for each certificate. Clients that support ARI renew inside that window, which spreads load and lets the CA ask for early renewal, for example before a mass revocation.

## Common ACME clients

| Client | Platform |
|---|---|
| Certbot | Linux and Unix web servers |
| acme.sh | Shell script for Linux and Unix, many DNS providers |
| win-acme | Windows and IIS |
| cert-manager | Kubernetes |
| Caddy, Traefik | Web servers and proxies with built-in ACME |
| Posh-ACME | PowerShell |

### Example: request a certificate with Certbot using HTTP-01

```bash
sudo certbot certonly --webroot -w /var/www/html -d <www.example.com> --server <ACME_directory_URL>
```

### Example: test automatic renewal

```bash
sudo certbot renew --dry-run
```

## ACME in a private PKI

Microsoft Active Directory Certificate Services (AD CS) does not support ACME natively. Organizations add ACME through a gateway or a CLM platform that accepts ACME requests and forwards them to the internal CA. This brings the same automation to internal servers, Kubernetes clusters, and development environments.

## Key terms

| Term | Meaning |
|---|---|
| ACME client | Software that requests and renews certificates |
| ACME server | The CA endpoint that handles ACME requests |
| Directory | JSON document listing ACME endpoints |
| Order | A request for a certificate covering one or more identifiers |
| Authorization | Proof that the account controls an identifier |
| EAB | External Account Binding, links an ACME account to a CA customer account |
| ARI | ACME Renewal Information, CA-suggested renewal windows |

## Common questions

### Is ACME only for free certificates?
No. Many commercial CAs support ACME for OV and DV certificates, usually with EAB.

### Can ACME issue client or code signing certificates?
ACME is designed mainly for TLS server certificates. Extensions exist for other identifier types, but support varies by CA.

### What if a server cannot run an ACME client?
A CLM platform can request the certificate centrally and push it to the device through APIs. See [Automating certificate renewal and deployment](../../01-Products/CertSecure-Manager/automating-certificate-renewal-and-deployment.md).

### Does EC support ACME?
Yes. [CertSecure Manager](../../01-Products/CertSecure-Manager/acme-enrollment-with-certsecure-manager.md) and [PKI-as-a-Service](../../01-Products/PKI-as-a-Service/enrolling-certificates-with-pkiaas-acme-scep-intune.md) both support ACME enrollment.

## Related articles

- [Certificate lifecycle management fundamentals](certificate-lifecycle-management-fundamentals.md)
- [Preventing certificate outages](preventing-certificate-outages.md)
- [ACME enrollment with CertSecure Manager](../../01-Products/CertSecure-Manager/acme-enrollment-with-certsecure-manager.md)
- [Enrolling certificates with PKIaaS (ACME, SCEP, Intune)](../../01-Products/PKI-as-a-Service/enrolling-certificates-with-pkiaas-acme-scep-intune.md)
- [47-day SSL/TLS certificate validity timeline](../../05-Popular-Right-Now/47-day-ssl-tls-certificate-validity-timeline.md)
