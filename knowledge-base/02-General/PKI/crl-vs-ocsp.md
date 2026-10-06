---
title: "CRL vs OCSP"
category: "General"
section: "PKI"
article_type: "Concept"
applies_to: "Microsoft AD CS, Online Responder, public and private certificate authorities"
summary: "Understand how Certificate Revocation Lists and OCSP check certificate status, how they differ, their trade-offs, and how to design revocation in a private PKI."
keywords: ["CRL vs OCSP", "certificate revocation list", "OCSP responder", "delta CRL", "revocation checking"]
last_reviewed: "2026-10-06"
---

# CRL vs OCSP

This article explains the two standard ways to publish certificate revocation status: the Certificate Revocation List (CRL) and the Online Certificate Status Protocol (OCSP). It is for PKI administrators and application owners who need to design, run, or troubleshoot revocation checking.

## What it is

A certificate can become untrustworthy before it expires, for example when its private key is exposed or the server is retired. The Certificate Authority (CA) then revokes it. Relying parties need a way to learn about that revocation.

- **CRL (RFC 5280):** a file signed by the CA that lists the serial numbers of all revoked, unexpired certificates. Clients download the whole list and cache it until its Next Update time.
- **OCSP (RFC 6960):** a protocol where a client asks an OCSP responder about one certificate and receives a signed answer: good, revoked, or unknown.

## Why it matters

If revocation information cannot be reached, or the CRL has expired, many clients fail closed. Smart card logon, VPN, Wi-Fi, and TLS connections can all stop working at once. Revocation design is as important to availability as it is to security.

## How it works

### CRL flow

1. The CA publishes a base CRL on a schedule (for example weekly) and, optionally, a delta CRL that lists only changes since the last base CRL (for example daily).
2. The CRL location is placed in each issued certificate's CRL Distribution Point (CDP) extension, usually an HTTP URL.
3. The client reads the CDP, downloads the CRL, checks the signature and the Next Update time, and searches for the certificate serial number.
4. The client caches the CRL until it expires, so later checks are local and fast.

### OCSP flow

1. The OCSP responder address is placed in the certificate's Authority Information Access (AIA) extension.
2. The client sends a request with the certificate's issuer and serial number.
3. The responder answers with a signed status. In Microsoft AD CS, the Online Responder role builds its answers from the CA's CRLs and signs them with an OCSP Signing certificate.
4. With **OCSP stapling**, the TLS server fetches its own OCSP response and attaches it to the handshake, so clients do not need to contact the responder.

## Comparison

| Factor | CRL | OCSP |
|---|---|---|
| What the client gets | Full list of revoked serials | Status of one certificate |
| Size | Grows with the number of revocations | Small, fixed-size response |
| Freshness | As fresh as the last publication and client cache | As fresh as the responder's data (often built from CRLs anyway) |
| Infrastructure | Static HTTP or LDAP hosting | A responder service with its own signing certificate |
| Offline use | Works offline once cached | Needs a live responder unless stapled |
| Privacy | The CA does not learn which certificate is checked | The responder sees which certificate is checked (stapling avoids this) |
| Failure risk | Expired CRL breaks validation | Responder outage or expired signing certificate breaks validation |

## Public web trends

The CA/Browser (CA/B) Forum made OCSP optional for publicly trusted TLS certificates and made CRLs mandatory (Ballot SC-063, effective March 15 2024). Several public CAs, including Let's Encrypt in 2025, have since ended OCSP service for TLS. Browsers mostly rely on their own CRL-based systems such as Chrome CRLSets and Mozilla CRLite. Short-lived certificates further reduce the need for real-time revocation.

For private PKI, the picture is different. Windows and many enterprise applications still check CRLs and OCSP directly, so both remain important.

## Design guidance for a private PKI

- Publish CRLs over **HTTP**, not only Lightweight Directory Access Protocol (LDAP). HTTP works for non-domain clients and across networks.
- Host CDP and AIA on **more than one web server** behind a load balancer or DNS name. See [High availability CDP and AIA](../../04-Featured-Articles/PKI-Runbooks/high-availability-cdp-and-aia.md).
- Set an **overlap period** so a new CRL is published well before the old one expires. Monitor the Next Update time of every CRL, including the offline root CRL.
- Use **delta CRLs** only if clients need faster updates and the infrastructure can serve them reliably.
- Deploy an **Online Responder** where applications need OCSP, and protect its signing key, ideally in a Hardware Security Module (HSM). See [Configuring an Online Responder with HSM](../../04-Featured-Articles/PKI-Runbooks/configuring-an-online-responder-ocsp-with-hsm.md).
- Monitor OCSP signing certificate expiry. Renewal can be automated with the OCSP Response Signing template.

## Useful commands

Check a certificate's chain and fetch every CDP and AIA URL it contains:

```cmd
certutil -verify -urlfetch <certificate.cer>
```

View the contents and Next Update time of a CRL:

```cmd
certutil -dump <crlfile.crl>
```

Publish a new CRL on a Microsoft CA:

```cmd
certutil -crl
```

## Key terms

| Term | Meaning |
|---|---|
| Base CRL | The full list of revoked certificates |
| Delta CRL | A smaller list of revocations since the last base CRL |
| Next Update | The time after which a CRL must not be used |
| CDP | CRL Distribution Point extension in a certificate |
| AIA | Authority Information Access extension, holds issuer and OCSP URLs |
| OCSP stapling | The server includes an OCSP response in the TLS handshake |
| Online Responder | Microsoft's OCSP responder role in AD CS |

## Common questions

### Should a private PKI use CRL, OCSP, or both?
Most AD CS deployments publish CRLs to HTTP and add an Online Responder for applications that prefer OCSP. CRLs are the base layer, because the Online Responder reads them.

### What happens if the root CRL expires?
Validation of every certificate under that root can fail. See [Recovering from an expired CRL](../../04-Featured-Articles/PKI-Runbooks/recovering-from-an-expired-crl.md) and [Emergency CRL signing](../../04-Featured-Articles/PKI-Runbooks/emergency-crl-signing.md).

### Can CRL publication be monitored automatically?
Yes. Certificate lifecycle tools such as [CertSecure Manager](../../01-Products/CertSecure-Manager/certsecure-manager-overview.md) and general monitoring tools can alert before CRLs and certificates expire.

## Related articles

- [PKI fundamentals](pki-fundamentals.md)
- [Changing CRL publication periods](../../04-Featured-Articles/PKI-Runbooks/changing-crl-publication-periods.md)
- [Troubleshooting revocation server offline errors](../../04-Featured-Articles/PKI-Runbooks/troubleshooting-revocation-server-offline-errors.md)
- [High availability CDP and AIA](../../04-Featured-Articles/PKI-Runbooks/high-availability-cdp-and-aia.md)
- [PKI security best practices](pki-security-best-practices.md)
