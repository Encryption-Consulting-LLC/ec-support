---
title: "Preventing Certificate Outages"
category: "General"
section: "Certificate Lifecycle Management"
article_type: "Concept"
applies_to: "Public and private TLS certificates, CRLs, intermediate CAs, client certificates, and load balancers"
summary: "Common causes of certificate outages, such as expiry, chain errors, expired CRLs, and CA distrust, and the practical steps and checks that prevent them."
keywords: ["certificate outages", "expired certificate", "certificate expiry monitoring", "certificate chain error", "CRL expired"]
last_reviewed: "2026-10-06"
---

# Preventing Certificate Outages

This article explains why certificate-related outages happen and the controls that prevent them. It is for operations teams, PKI administrators, and service owners who are responsible for uptime of TLS-protected services.

## What it is

A certificate outage is any service failure caused by a certificate, its chain, its key, or its revocation data. The service itself may be healthy, but clients refuse to connect because validation fails.

## Why it matters

Certificate outages are common, sudden, and often affect many users at once. They are also preventable. As public TLS lifetimes fall from 200 days (2026) to 100 days (2027) and 47 days (2029), the number of renewals rises sharply, and so does the chance of a miss without automation.

## Common causes

| Cause | What happens | Typical example |
|---|---|---|
| Expired end-entity certificate | Clients reject the connection | Certificate on a load balancer or API gateway renewed on the server but not on the device in front of it |
| Missing or wrong intermediate | Some clients fail to build the chain | New certificate deployed without the new intermediate CA certificate |
| Expired or unreachable CRL | Revocation check fails, many clients fail closed | Offline root CA CRL not re-signed before Next Update |
| Expired OCSP signing certificate | OCSP responses are rejected | Online Responder signing certificate not renewed |
| Hostname mismatch | Name not in the Subject Alternative Name (SAN) | New DNS alias added without updating the certificate |
| Key and certificate mismatch | Service fails to start or bind | Certificate installed with the wrong private key |
| CA distrust | Browsers stop trusting a CA | Chrome distrust of Entrust public TLS certificates with earliest Signed Certificate Timestamp (SCT) after November 11 2024 |
| Policy change | Certificates no longer accepted for a use | Chrome Root Program Policy v1.8 requires public TLS certificates issued from March 15 2027 to carry only the server authentication EKU (hierarchy phase-out began June 15 2026) |
| Mass revocation | A CA must revoke certificates on short notice after a mis-issuance | CA/B Forum rules require revocation within 24 hours or 5 days, depending on the reason |
| Pinned certificates or keys | Clients that pin an old certificate fail after renewal | Mobile apps pinning a leaf certificate |

## How it works: prevention steps

1. **Discover everything.** Scan networks, cloud accounts, load balancers, CAs, and Certificate Transparency (CT) logs to find all certificates, not only the ones on the known list.
2. **Assign owners.** Every certificate needs a named team and an escalation contact.
3. **Monitor expiry with tiers of alerts.** For example at 30, 14, 7, and 1 days for short-lived certificates, and earlier for long-lived ones. Send alerts to team channels and ticketing, not to one person's mailbox.
4. **Automate renewal and deployment.** Use the Automated Certificate Management Environment (ACME) protocol, autoenrollment, or a Certificate Lifecycle Management (CLM) platform to renew and install certificates without manual steps.
5. **Monitor the whole chain.** Track intermediate CA certificates, root CRLs, delta CRLs, and OCSP signing certificates, not only end-entity certificates.
6. **Verify after every deployment.** Check from outside the server that the new certificate, chain, and SAN are served correctly.
7. **Stay crypto agile.** Be able to switch CAs quickly in case of distrust or mass revocation. Keep at least one backup CA relationship.
8. **Avoid leaf pinning.** If pinning is needed, pin to a CA public key and include backups.
9. **Write and test runbooks** for emergency replacement, CRL re-signing, and CA changes.

## Useful checks

Check a live server certificate's dates and chain:

```bash
openssl s_client -connect <host>:443 -servername <host> -showcerts </dev/null | openssl x509 -noout -subject -issuer -dates
```

List certificates in the Windows local machine store that expire within 30 days:

```powershell
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.NotAfter -lt (Get-Date).AddDays(30) } | Select-Object Subject, NotAfter, Thumbprint
```

Check chain and revocation for a certificate file:

```cmd
certutil -verify -urlfetch <certificate.cer>
```

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| "Certificate expired" in browsers | Leaf certificate past Not After | Renew and deploy; check every device in the path |
| Works in one browser, fails in another or on mobile | Missing intermediate | Serve the full chain from the server |
| "Revocation server offline" on Windows | CRL expired or CDP not reachable | Publish a new CRL; fix CDP hosting. See [Troubleshooting revocation server offline errors](../../04-Featured-Articles/PKI-Runbooks/troubleshooting-revocation-server-offline-errors.md) |
| Name mismatch error | Hostname not in SAN | Reissue with the correct SAN |
| Service fails to start after renewal | Wrong key, wrong permissions on key, or wrong binding | Rebind certificate; check key access for the service account |

## Key terms

| Term | Meaning |
|---|---|
| Not After | The expiry date of a certificate |
| Intermediate CA | A CA between the root and the end-entity certificate |
| CT logs | Public logs of issued TLS certificates, useful for discovery |
| SCT | Signed Certificate Timestamp, proof a certificate was logged |
| Certificate pinning | A client accepts only specific certificates or keys |

## Common questions

### Are calendar reminders enough?
Not at modern scale. Reminders miss certificates nobody listed, and lifetimes are getting shorter. Automated discovery and renewal are needed.

### How far ahead should renewal start?
Renew when about one third of the lifetime is left, or follow the CA's ACME Renewal Information (ARI) window.

### How can EC help?
[CertSecure Manager](../../01-Products/CertSecure-Manager/certsecure-manager-overview.md) discovers certificates, alerts before expiry, and automates renewal and deployment. See also [Configuring expiry alerts and notifications](../../01-Products/CertSecure-Manager/configuring-expiry-alerts-and-notifications.md).

## Related articles

- [Certificate lifecycle management fundamentals](certificate-lifecycle-management-fundamentals.md)
- [ACME protocol explained](acme-protocol-explained.md)
- [CRL vs OCSP](../PKI/crl-vs-ocsp.md)
- [PKI certificate outages: causes and prevention](../../05-Popular-Right-Now/pki-certificate-outages-causes-and-prevention.md)
- [Recovering from an expired CRL](../../04-Featured-Articles/PKI-Runbooks/recovering-from-an-expired-crl.md)
- [Chrome Root Program CA distrust: what to do](../../05-Popular-Right-Now/chrome-root-program-ca-distrust-what-to-do.md)
