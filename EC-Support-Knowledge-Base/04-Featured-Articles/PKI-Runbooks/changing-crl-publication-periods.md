---
title: "Changing CRL Publication Periods in AD CS"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025"
summary: "Change base CRL, delta CRL and overlap periods on a Microsoft AD CS CA with certutil -setreg, restart the service, publish a new CRL and confirm the new dates."
keywords: ["CRLPeriodUnits", "CRLPeriod", "CRLDeltaPeriod", "CRLOverlapPeriod", "certutil -setreg", "AD CS", "CRL validity"]
last_reviewed: "2026-10-06"
---

# Changing CRL Publication Periods in AD CS

This runbook explains how to change how often a Microsoft Active Directory Certificate Services (AD CS) Certification Authority (CA) publishes its Certificate Revocation List (CRL) and how long each CRL stays valid. It is for PKI administrators tuning revocation timing.

## Overview

AD CS uses registry values under the CA configuration key to control CRL timing:

| Value | Meaning | Example |
|---|---|---|
| `CRLPeriodUnits` and `CRLPeriod` | Base CRL validity | `1` and `Weeks` |
| `CRLDeltaPeriodUnits` and `CRLDeltaPeriod` | Delta CRL validity. Units `0` turns delta CRLs off | `1` and `Days` |
| `CRLOverlapUnits` and `CRLOverlapPeriod` | Extra time added to the base CRL so clients can get the next one before the current one expires | `2` and `Days` |
| `CRLDeltaOverlapUnits` and `CRLDeltaOverlapPeriod` | Overlap for delta CRLs | `12` and `Hours` |

Valid period strings are `Hours`, `Days`, `Weeks`, `Months` and `Years`.

Typical values:

| CA type | Base CRL | Delta CRL | Overlap |
|---|---|---|---|
| Offline root | 26 to 52 weeks | None | 2 to 4 weeks |
| Policy or intermediate CA (offline) | 26 weeks | None | 2 to 4 weeks |
| Online issuing CA | 1 week | 1 day or none | 1 to 2 days |

The organization's Certification Practice Statement (CPS) has the final say.

## Applies to

- AD CS root and subordinate CAs. On a CA with a Hardware Security Module (HSM), the key must be available to publish the CRL.

## Prerequisites

- CA Administrator rights on the CA.
- A change record. The change affects how fast revocations reach clients.

## Before starting

- Shorter periods mean revocations reach clients faster, but the CA and the CDP web servers must be more available. Longer periods mean a CA outage hurts less, but revoked certificates stay trusted longer.
- If delta CRLs are turned on, make sure IIS allows double escaping for the `+` in the delta file name. See [High Availability CDP and AIA](high-availability-cdp-and-aia.md).
- Back up the CA registry key: `reg export HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration C:\Backup\CAConfig.reg`.

## Procedure

1. Read the current values:

```cmd
certutil -getreg CA\CRLPeriodUnits
certutil -getreg CA\CRLPeriod
certutil -getreg CA\CRLDeltaPeriodUnits
certutil -getreg CA\CRLDeltaPeriod
certutil -getreg CA\CRLOverlapUnits
certutil -getreg CA\CRLOverlapPeriod
```

2. Set new values. Example for an online issuing CA:

```cmd
certutil -setreg CA\CRLPeriodUnits 1
certutil -setreg CA\CRLPeriod "Weeks"
certutil -setreg CA\CRLDeltaPeriodUnits 1
certutil -setreg CA\CRLDeltaPeriod "Days"
certutil -setreg CA\CRLOverlapUnits 2
certutil -setreg CA\CRLOverlapPeriod "Days"
```

To turn off delta CRLs, set `CRLDeltaPeriodUnits` to `0`.

3. Restart the CA service so it reads the new values:

```cmd
net stop certsvc && net start certsvc
```

4. Publish a new CRL:

```cmd
certutil -CRL
```

5. Copy the new CRL files to every HTTP CRL Distribution Point (CDP), unless the CA publishes there directly.

> **Note:** `certutil -CRL` also accepts a one-time validity in days and hours, for example `certutil -CRL 7:00` for 7 days. This does not change the registry values. Use it only for a one-off need.

> **Tip:** The same values can be set in `CAPolicy.inf` under `[certsrv_server]` (for example `CRLPeriod` and `CRLPeriodUnits`) before installing a new CA.

## Verification

1. Dump the new CRL:

```cmd
certutil -dump %windir%\System32\CertSrv\CertEnroll\<CAName>.crl
```

Check that the time from This Update to Next Update is about the base period plus the overlap, that **Next CRL Publish** is about one base period after This Update, and that the CRL Number went up.

2. In the Certification Authority console, right-click **Revoked Certificates** > **Properties** and confirm the intervals.
3. Open `pkiview.msc` and confirm **OK** for every CDP.

## Rollback

Import the registry backup, restart the CA service and publish a CRL with `certutil -CRL`.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| New values not used | Service not restarted | Restart `certsvc` and publish again. |
| Delta CRL still published after setting units to 0 | Old delta CRL still on the web server | Delta files expire on their own. The base CRL no longer points to them. |
| Delta CRL returns HTTP 404.11 | IIS double escaping blocked | Enable `allowDoubleEscaping` on the CDP site. |
| `-CRL` fails with key error | HSM unavailable | Restore HSM access, then publish. |

## Related articles

- [Root CA CRL Renewal for an Offline Root CA](root-ca-crl-renewal-offline-root.md)
- [Recovering from an Expired CRL](recovering-from-an-expired-crl.md)
- [certutil Command Reference](certutil-command-reference.md)
- [CRL vs OCSP](../../02-General/PKI/crl-vs-ocsp.md)
- [PKI Security Best Practices](../../02-General/PKI/pki-security-best-practices.md)
