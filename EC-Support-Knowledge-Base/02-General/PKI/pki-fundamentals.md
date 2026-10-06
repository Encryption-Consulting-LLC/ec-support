---
title: "PKI Fundamentals"
category: "General"
section: "PKI"
article_type: "Concept"
applies_to: "Public Key Infrastructure (PKI), Microsoft AD CS, public and private certificate authorities"
summary: "Learn the basics of Public Key Infrastructure: key pairs, X.509 certificates, certificate authorities, chains of trust, revocation, and how trust is built."
keywords: ["PKI fundamentals", "public key infrastructure", "X.509 certificate", "certificate authority", "chain of trust"]
last_reviewed: "2026-10-06"
---

# PKI Fundamentals

This article explains the core ideas behind Public Key Infrastructure (PKI): what it is, the parts it is made of, and how a certificate becomes trusted. It is written for administrators, application owners, and security staff who are new to PKI or need a refresher before working on a Certificate Authority (CA).

## What it is

PKI is the set of roles, policies, software, hardware, and procedures used to create, manage, distribute, use, store, and revoke digital certificates. A digital certificate binds a public key to an identity, such as a server name, a user, a device, or a software publisher. A trusted third party, the CA, vouches for that binding by signing the certificate.

PKI rests on asymmetric (public key) cryptography. Each identity has a key pair:

- The **private key** stays secret with its owner. It is used to sign data or decrypt data.
- The **public key** is shared freely inside the certificate. It is used to verify signatures or encrypt data for the owner.

What one key does, only the other key can undo. That property makes digital signatures and secure key exchange possible.

## Why it matters

PKI is the trust layer behind most enterprise security:

- **Transport Layer Security (TLS)** for websites, APIs, and internal services.
- **Authentication** of users, devices, and workloads (smart cards, Wi-Fi 802.1X, VPN, mutual TLS).
- **Code signing**, so operating systems can confirm who published software and that it was not changed.
- **Email security** with Secure/Multipurpose Internet Mail Extensions (S/MIME).
- **Document signing** and **encryption** of files and disks.

When PKI fails, services fail with it. An expired certificate, an unreachable Certificate Revocation List (CRL), or a compromised CA key can take down applications or let attackers impersonate trusted systems.

## How it works

1. **Key generation.** An entity (server, user, device) generates a key pair. For high-value keys, generation happens inside a Hardware Security Module (HSM).
2. **Certificate request.** The entity creates a Certificate Signing Request (CSR). The CSR holds the public key and requested identity details and is signed with the private key to prove possession.
3. **Validation.** A Registration Authority (RA) or the CA checks that the requester is allowed to have the requested identity. For public TLS this means domain validation. In an enterprise CA, it often means Active Directory permissions on a certificate template.
4. **Issuance.** The CA signs the certificate with its own private key. The certificate follows the X.509 version 3 format defined in RFC 5280.
5. **Use.** The entity presents the certificate during TLS handshakes, signing operations, or authentication.
6. **Validation by relying parties.** A relying party (browser, operating system, application) builds a chain from the certificate up to a trusted root CA, checks each signature, the validity dates, key usage, and revocation status.
7. **Renewal or revocation.** Before expiry, the certificate is renewed. If the key is compromised or the certificate is no longer needed, the CA revokes it and publishes that status through a CRL or the Online Certificate Status Protocol (OCSP).

### The chain of trust

Relying parties keep a list of trusted root CA certificates, called a trust store. A root CA rarely issues end-entity certificates directly. Instead it signs one or more subordinate (intermediate or issuing) CA certificates, and those CAs issue certificates to servers and users. During validation, the relying party walks from the end-entity certificate, through each intermediate, up to a root it already trusts. If any link is missing, expired, revoked, or has a bad signature, validation fails.

### What is inside a certificate

| Field | Purpose |
|---|---|
| Subject | The identity the certificate is for |
| Subject Alternative Name (SAN) | DNS names, IP addresses, email addresses, or User Principal Names (UPNs) the certificate covers. Modern clients check the SAN, not the Common Name |
| Issuer | The CA that signed the certificate |
| Serial number | Unique number assigned by the issuing CA |
| Validity (Not Before, Not After) | The period the certificate is valid |
| Public key | The subject's public key and algorithm (RSA, ECDSA, and in future ML-DSA) |
| Key Usage and Extended Key Usage (EKU) | What the key may be used for, for example digital signature, server authentication, client authentication, code signing |
| CRL Distribution Point (CDP) | Where to download the CRL |
| Authority Information Access (AIA) | Where to download the issuer certificate and, if available, the OCSP responder address |
| Basic Constraints | Whether the certificate is a CA certificate and how many CA levels may sit below it |

## Key terms

| Term | Meaning |
|---|---|
| Certificate Authority (CA) | The trusted entity that signs certificates |
| Root CA | The top of a hierarchy. Its certificate is self-signed and placed in trust stores |
| Issuing CA | A subordinate CA that issues end-entity certificates |
| Registration Authority (RA) | A function that verifies requester identity before issuance |
| CSR | A signed request that contains a public key and requested identity |
| CRL | A signed list of revoked certificate serial numbers |
| OCSP | A protocol to ask a responder for the status of one certificate |
| Certificate Policy (CP) and Certification Practice Statement (CPS) | Documents that define the rules of the PKI and how the CA follows them |
| HSM | A hardened device that generates and protects private keys |
| Public PKI vs private PKI | Public CAs are trusted by browsers and operating systems by default. Private CAs, such as Microsoft Active Directory Certificate Services (AD CS), are trusted only where the organization deploys its root |

## Common questions

### Is a public CA or a private CA better?
They serve different purposes. Public certificates are needed for websites and services used by the public. Private CAs suit internal servers, devices, users, mutual TLS, and client authentication. Under Chrome Root Program Policy v1.8, public TLS certificates issued on or after March 15 2027 must carry only the server authentication EKU, and most public CAs have already dropped client authentication. Client authentication use cases belong on a private PKI.

### How long should certificates last?
Public TLS certificates are limited by the CA/Browser (CA/B) Forum. The maximum is 200 days from March 15 2026, dropping to 100 days in 2027 and 47 days in 2029. Private PKI lifetimes are set by internal policy, but shorter lifetimes with automation reduce risk.

### Where should CA private keys live?
In an HSM validated to Federal Information Processing Standard (FIPS) 140-3, especially for root and issuing CAs. See [What is an HSM](../HSM/what-is-an-hsm.md).

### Who can help design or run a PKI?
EC offers [PKI design and implementation](../../03-Services/pki-design-and-implementation.md), [PKI assessments](../../03-Services/pki-assessment.md), and a fully managed [PKI-as-a-Service](../../01-Products/PKI-as-a-Service/pki-as-a-service-overview.md).

## Related articles

- [Two-tier vs three-tier PKI hierarchy](two-tier-vs-three-tier-pki-hierarchy.md)
- [CRL vs OCSP](crl-vs-ocsp.md)
- [Certificate templates in AD CS](certificate-templates-in-ad-cs.md)
- [PKI security best practices](pki-security-best-practices.md)
- [Certificate lifecycle management fundamentals](../Certificate-Lifecycle-Management/certificate-lifecycle-management-fundamentals.md)
- [What is an HSM](../HSM/what-is-an-hsm.md)
