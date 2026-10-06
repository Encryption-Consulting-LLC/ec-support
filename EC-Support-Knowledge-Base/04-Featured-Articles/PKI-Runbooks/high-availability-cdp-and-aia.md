---
title: "High Availability CDP and AIA for Microsoft AD CS"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025; IIS; DFS Replication; Online Responder arrays"
summary: "Design highly available CRL Distribution Points, AIA and OCSP for Microsoft AD CS with multiple HTTP URLs, load balancing, replication and pkiview checks."
keywords: ["CDP", "AIA", "high availability", "allowDoubleEscaping", "delta CRL", "IIS", "OCSP array", "pkiview"]
last_reviewed: "2026-10-06"
---

# High Availability CDP and AIA for Microsoft AD CS

This runbook explains how to make CRL Distribution Points (CDP) and Authority Information Access (AIA) locations highly available for a Microsoft Active Directory Certificate Services (AD CS) PKI. It is for PKI and infrastructure administrators who design or repair revocation publishing.

## Overview

Clients read two URLs from each certificate:

- **CDP**: where to download the Certificate Revocation List (CRL).
- **AIA**: where to download the issuing CA certificate, and optionally the Online Certificate Status Protocol (OCSP) responder URL.

If these URLs are down, clients report "revocation server offline" and may reject the certificate. Because the URLs are baked into every issued certificate, the hosting design must be right before certificates are issued.

Good practice:

1. Use **HTTP** as the primary CDP and AIA protocol. HTTP works for domain and non-domain clients.
2. Use a DNS alias (for example `pki.contoso.com`) instead of a server name.
3. Put that alias behind a load balancer or several web servers with the same content.
4. Avoid **LDAP-only** CDPs. Non-domain devices, Linux, mobile and external partners cannot read LDAP paths in Active Directory.
5. Add OCSP through an Online Responder array for fast status checks.

## Applies to

- AD CS enterprise and standalone CAs.
- IIS web servers hosting `CertEnroll` content, DFS Replication, and hardware or software load balancers.

## Prerequisites

- CA Administrator rights on each CA.
- At least two web servers (IIS or another HTTP server) and a DNS alias.
- A plan for how CRL files reach the web servers: direct publication by the CA to a file share, DFS Replication, or a scheduled copy.

## Before starting

- Changing CDP or AIA settings affects **new** certificates only. Existing certificates keep their old URLs, so old URLs must stay available until those certificates expire.
- Keep the URL list short. Clients try URLs in the order listed and may wait on each one that fails. Put the most available HTTP URL first.
- Plan a change window to restart the CA service.

## Procedure

### Phase 1: Build the web tier

1. Install IIS on two or more servers and create a virtual directory such as `/CertEnroll` or `/pki`.
2. Allow anonymous read access. Do not require HTTPS for CRL and AIA downloads. Clients may need to check revocation for the HTTPS certificate itself, which creates a loop.
3. **Enable double escaping** if the CA publishes delta CRLs. Delta CRL file names contain a plus sign (`Contoso-Issuing-CA-01+.crl`). IIS request filtering blocks this by default and returns HTTP 404.11. Run on each IIS server:

```cmd
%windir%\system32\inetsrv\appcmd.exe set config "Default Web Site/CertEnroll" -section:system.webServer/security/requestFiltering -allowDoubleEscaping:true
```

4. Add MIME types if needed: `.crl` as `application/pkix-crl` and `.crt` as `application/pkix-cert`.

### Phase 2: Keep the content in sync

5. Choose one method:

| Method | How it works | Notes |
|---|---|---|
| CA publishes to a UNC path | Add a `file://\\WEB01\CertEnroll\<CaName><CRLNameSuffix><DeltaCRLAllowed>.crl` publication location | CA computer account needs write rights on the share. One entry per web server. |
| DFS Replication | CA writes to one share, DFS-R copies to the others | Replication delay must be well below the CRL overlap period. |
| Scheduled copy | Task runs `robocopy` after each CRL publish | Simple, but monitor the task. |

### Phase 3: Configure the CA

6. List current settings:

```powershell
Get-CACrlDistributionPoint
Get-CAAuthorityInformationAccess
```

7. Add the HTTP URL that goes into certificates. The variables are AD CS publication tokens:

```powershell
Add-CACrlDistributionPoint -Uri "http://pki.contoso.com/CertEnroll/<CaName><CRLNameSuffix><DeltaCRLAllowed>.crl" -AddToCertificateCdp -AddToFreshestCrl -Force
Add-CAAuthorityInformationAccess -Uri "http://pki.contoso.com/CertEnroll/<ServerDNSName>_<CaName><CertificateName>.crt" -AddToCertificateAia -Force
```

8. Add a second HTTP URL on a separate DNS name or site only if a single alias cannot be made highly available.
9. For OCSP, add the responder URL:

```powershell
Add-CAAuthorityInformationAccess -Uri "http://ocsp.contoso.com/ocsp" -AddToCertificateOcsp -Force
```

10. Restart the CA and publish:

```cmd
net stop certsvc && net start certsvc
certutil -CRL
```

### Phase 4: Add an OCSP array

11. Install the Online Responder role on two or more servers and join them in one **Array Configuration** in the Online Responder console.
12. Put the OCSP DNS name behind the load balancer. Each member signs responses with its own OCSP signing certificate.
13. See [Configuring an Online Responder (OCSP) with an HSM](configuring-an-online-responder-ocsp-with-hsm.md) for HSM-backed signing keys.

## Verification

1. Issue a test certificate and run `certutil -URL <TestCert>.cer`. Retrieve CRLs, certificates (AIA) and OCSP. Every row should show **Verified**.
2. Run `certutil -verify -urlfetch <TestCert>.cer` from a non-domain machine.
3. Open `pkiview.msc` (Enterprise PKI). Every CA should show **OK** for AIA and CDP locations, with no **Expiring** or **Unable to Download** status.
4. Stop one web server and repeat Step 1 to prove failover.

## Monitoring

- Run `pkiview.msc` checks on a schedule, or monitor CRL Next Update with a script that downloads each CRL and reads it with `certutil -dump`.
- Alert when a CRL has less than its overlap period left.
- Monitor HTTP 200 responses for each CDP and AIA URL from inside and outside the network.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Delta CRL returns HTTP 404.11 | IIS double escaping blocked | Set `allowDoubleEscaping` to true (Phase 1, Step 3). |
| Non-domain clients report revocation offline | LDAP-only CDP | Add an HTTP CDP and reissue certificates. |
| One web server serves an old CRL | Replication or copy failed | Check DFS-R backlog or copy task logs. |
| `pkiview` shows **Unable to Download** | DNS alias, firewall or load balancer health probe | Test the URL with a browser and `certutil -URL`. |
| OCSP responds "unauthorized" | Array member lacks a valid signing certificate or revocation configuration | Check the array status in the Online Responder console. |

## Related articles

- [Troubleshooting Revocation Server Offline Errors](troubleshooting-revocation-server-offline-errors.md)
- [Configuring an Online Responder (OCSP) with an HSM](configuring-an-online-responder-ocsp-with-hsm.md)
- [Changing CRL Publication Periods](changing-crl-publication-periods.md)
- [CRL vs OCSP](../../02-General/PKI/crl-vs-ocsp.md)
- [PKI Security Best Practices](../../02-General/PKI/pki-security-best-practices.md)
