---
title: "Recovering from an Expired CRL"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025; Windows clients; Entrust nShield and Thales Luna HSMs"
summary: "Incident runbook to find which CRL expired, publish a valid replacement from the CA or an emergency signer, copy it to every CDP and clear cached CRLs."
keywords: ["expired CRL", "CRYPT_E_REVOCATION_OFFLINE", "0x80092013", "certutil -CRL", "AD CS outage", "revocation", "HSM"]
last_reviewed: "2026-10-06"
---

# Recovering from an Expired CRL

This runbook guides administrators through an outage caused by an expired Certificate Revocation List (CRL). It covers finding the expired CRL, getting a new one signed, publishing it, and clearing client caches. It is for PKI administrators and support engineers working an active incident.

## Overview

When a CRL passes its Next Update time, clients that check revocation can no longer prove a certificate is good. Typical symptoms:

- Smart card or Windows Hello for Business certificate logon fails.
- VPN, Wi-Fi (802.1X) or TLS mutual authentication fails.
- `certutil -verify -urlfetch` reports `CRYPT_E_REVOCATION_OFFLINE` (0x80092013), "The revocation function was unable to check revocation because the revocation server was offline".
- `pkiview.msc` shows **Expired** for a CDP location.

The fastest fix depends on why the CRL was not renewed.

| Cause | Fix path |
|---|---|
| CA service running but publishing failed (file share, permissions, replication) | Publish and copy the CRL (Phase 2, path A) |
| CA service stopped because the HSM is unavailable | Restore HSM access, start the CA (path B) |
| Offline root CRL not renewed | Run the root CRL ceremony (path C) |
| CA server lost or cannot start in time | Emergency signing from another server (path D) |

## Applies to

- AD CS root and issuing CAs, Windows clients and servers, and any relying party that downloads CRLs over HTTP or LDAP.

## Prerequisites

- CA Administrator rights and access to the CDP web servers.
- HSM operators and credentials on call (OCS cards for nShield, partition credentials or PED keys for Luna).
- Incident ticket opened. For EC support, see [Collecting HSM and PKI Diagnostics for Support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

## Before starting

- Do not raise CRL validity to extreme values just to stop the alarm. Use a normal or short period and fix the root cause.
- Do not turn off revocation checking on clients as a fix. It hides revoked certificates.

## Procedure

### Phase 1: Find the expired CRL

1. On an affected client, export the failing certificate and run:

```cmd
certutil -verify -urlfetch <Cert>.cer > verify.txt
```

2. Read the output from the top of the chain down. The first CA whose CRL shows "expired" or an offline error is the one to fix. A root CRL problem breaks everything under it.
3. Download the CRL from the URL and check the dates:

```cmd
certutil -dump <Downloaded>.crl
```

### Phase 2: Publish a valid CRL

**Path A: CA running, publishing failed**

4. On the CA, publish and check the output folder:

```cmd
certutil -CRL
dir %windir%\System32\CertSrv\CertEnroll
```

5. Copy the CRL to every HTTP CDP. For LDAP CDPs on an enterprise CA, `certutil -CRL` writes to Active Directory. If that failed, run `certutil -dspublish -f <CRLFile> <CAHostName>`.
6. Fix the root cause: share permissions for the CA computer account, DFS Replication backlog, or a failed copy task.

**Path B: HSM unavailable**

7. Check the HSM:
   - nShield: `enquiry` (module state must be operational); `nfkminfo` (Security World state); check the hardserver service.
   - Luna: `lunacm` > `slot list`; check the Network Trust Link (NTL) and that the partition is activated.
8. Fix the HSM issue, then start the CA with `net start certsvc` and run `certutil -CRL`.

**Path C: Offline root CRL**

9. Follow [Root CA CRL Renewal for an Offline Root CA](root-ca-crl-renewal-offline-root.md).

**Path D: CA cannot start in time**

10. Follow [Emergency CRL Signing](emergency-crl-signing.md) to re-sign the last CRL from a server that can use the CA key.

### Phase 3: Clear client caches

11. Clients and servers cache CRLs until Next Update and may keep a failed result for a while. On key servers (domain controllers, VPN, RADIUS, web servers), clear the cache:

```cmd
certutil -urlcache * delete
certutil -setreg chain\ChainCacheResyncFiletime @now
```

12. Restart services that cache revocation status if needed (for example the Network Policy Server service on RADIUS servers).

## Verification

- `certutil -verify -urlfetch <Cert>.cer` shows each CRL as verified.
- `pkiview.msc` shows **OK** for all CDP locations.
- Users can log on and connect again.

## Preventing a repeat

- Monitor Next Update for every CRL and alert well before expiry.
- Set an overlap period (`CRLOverlapUnits`, `CRLOverlapPeriod`) so new CRLs are published before the old ones expire.
- Keep the offline root CRL ceremony on a shared calendar with named owners.
- Monitor HSM health. See [HSM Health Check and Monitoring](../HSM-Runbooks/hsm-health-check-and-monitoring.md).

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| New CRL published but clients still fail | Cached CRL or cached failure | Run the Phase 3 commands; wait for proxy caches to expire. |
| `certutil -CRL` fails with a key error | HSM not available | Follow path B. |
| CRL correct on one web server only | Load balancer serving a stale node | Copy to every node or fix replication. |
| Root CRL valid but chain still fails | Issuing CA CRL also expired | Repeat Phase 1 for the next CA down the chain. |

## Related articles

- [Emergency CRL Signing](emergency-crl-signing.md)
- [Troubleshooting Revocation Server Offline Errors](troubleshooting-revocation-server-offline-errors.md)
- [Changing CRL Publication Periods](changing-crl-publication-periods.md)
- [Preventing Certificate Outages](../../02-General/Certificate-Lifecycle-Management/preventing-certificate-outages.md)
- [CRL vs OCSP](../../02-General/PKI/crl-vs-ocsp.md)
