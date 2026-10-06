---
title: "Troubleshooting Revocation Server Offline Errors"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Troubleshooting"
applies_to: "Windows clients and servers; Microsoft AD CS on Windows Server 2016 to 2025; IIS; Online Responder"
summary: "Diagnose and fix CRYPT_E_REVOCATION_OFFLINE (0x80092013) and related revocation errors with certutil, CAPI2 logs, pkiview and CRL, AIA and OCSP URL checks."
keywords: ["revocation server offline", "0x80092013", "CRYPT_E_REVOCATION_OFFLINE", "CAPI2", "certutil -verify", "CRL", "OCSP", "pkiview"]
last_reviewed: "2026-10-06"
---

# Troubleshooting Revocation Server Offline Errors

This article helps administrators find out why Windows reports "The revocation function was unable to check revocation because the revocation server was offline", and how to fix it. It is for PKI administrators, server and network teams, and support engineers.

## Overview

The error code is `CRYPT_E_REVOCATION_OFFLINE` (0x80092013). Windows shows it when it cannot get a usable Certificate Revocation List (CRL) or Online Certificate Status Protocol (OCSP) answer for a certificate in the chain. The name says "offline", but the cause is often something else: an expired CRL, a blocked URL, a proxy, or a bad file on the web server.

A related error, `CRYPT_E_NO_REVOCATION_CHECK` (0x80092012), means no revocation information was found or the check could not run at all.

## Applies to

- Any Windows system that validates certificates: domain controllers, VPN and RADIUS servers, web servers, and clients.

## Prerequisites

- A copy of the failing certificate (`.cer`).
- Local Administrator rights on an affected machine.
- Access to the CA and CRL Distribution Point (CDP) web servers.

## Before starting

- Note which application fails and which user or computer is affected. Collect the time of the error.
- Do not disable revocation checking as a fix.

## Procedure

### Step 1: Reproduce with certutil

```cmd
certutil -verify -urlfetch <Cert>.cer > verify.txt
```

The output lists each certificate in the chain, every CDP, Authority Information Access (AIA) and OCSP URL, and the result for each. Look for "Expired", "Unable to download", or an HTTP error code.

### Step 2: Use the URL retrieval tool

```cmd
certutil -URL <Cert>.cer
```

Select **CRLs (from CDP)**, **Certs (from AIA)** and **OCSP (from AIA)** and choose **Retrieve** for each. Every row should show **Verified**.

### Step 3: Read the CAPI2 log

Enable and review **Event Viewer** > **Applications and Services Logs** > **Microsoft** > **Windows** > **CAPI2** > **Operational**. The log shows each URL tried, the result and the time taken. Turn it off again after collecting data, because it is verbose.

### Step 4: Check the network path

```cmd
netsh winhttp show proxy
curl -I http://pki.contoso.com/CertEnroll/Contoso-Issuing-CA-01.crl
```

Services that run as SYSTEM use the WinHTTP proxy, not the user's browser proxy. Make sure the CDP and OCSP host names are reachable, or bypassed, from that context.

### Step 5: Check the CA side

- Open `pkiview.msc` and look for **Expired**, **Expiring** or **Unable to Download**.
- Dump the CRL and confirm Next Update is in the future: `certutil -dump <CRL>.crl`.
- On the CA, check that the service runs and the HSM is available (`enquiry` for nShield, `lunacm` slot list for Luna).

### Step 6: Clear caches after the fix

```cmd
certutil -urlcache * delete
certutil -setreg chain\ChainCacheResyncFiletime @now
```

## Common causes and fixes

| Symptom | Likely cause | Resolution |
|---|---|---|
| CRL shows "Expired" | CA did not publish, publishing failed, or offline root CRL not renewed | See [Recovering from an Expired CRL](recovering-from-an-expired-crl.md). |
| Delta CRL fails with HTTP 404.11 | IIS blocks the `+` in the delta CRL file name | Set `allowDoubleEscaping` to true on the CDP site. See [High Availability CDP and AIA](high-availability-cdp-and-aia.md). |
| Works on domain machines only | LDAP-only CDP or AIA | Add HTTP URLs and reissue certificates. |
| Works for users, fails for services | WinHTTP proxy not set or blocked | Set the WinHTTP proxy (`netsh winhttp set proxy`) or allow direct access. |
| Fails from the internet only | CDP host only resolves internally | Publish CDP and AIA on a public DNS name. |
| Long delay, then error | First URL in the list times out | Remove dead URLs and put the most available HTTP URL first in new certificates. |
| OCSP "unauthorized" or no response | Online Responder signing certificate or revocation configuration broken | Check the array in the Online Responder console. See [Configuring an Online Responder (OCSP) with an HSM](configuring-an-online-responder-ocsp-with-hsm.md). |
| CA cannot publish, CA log shows key errors | HSM unavailable | Restore HSM service, then run `certutil -CRL`. |
| One load-balanced node serves an old CRL | Replication or copy failed | Fix replication and copy the CRL to all nodes. |
| Error only for the root CA | Root certificate has a CDP or the root CRL expired | Renew the root CRL. Root CA certificates normally should not contain a CDP. |

## Verification

- `certutil -verify -urlfetch` shows every URL as verified and ends with the chain valid.
- The application works again.
- `pkiview.msc` shows **OK** for every location.

## Getting help

If the cause is still unclear, open a support case and attach `verify.txt`, a CAPI2 log export, `pkiview` screenshots and HSM status output. See [Collecting HSM and PKI Diagnostics for Support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

## Related articles

- [Recovering from an Expired CRL](recovering-from-an-expired-crl.md)
- [High Availability CDP and AIA](high-availability-cdp-and-aia.md)
- [certutil Command Reference](certutil-command-reference.md)
- [CRL vs OCSP](../../02-General/PKI/crl-vs-ocsp.md)
- [Collecting HSM and PKI Diagnostics for Support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md)
