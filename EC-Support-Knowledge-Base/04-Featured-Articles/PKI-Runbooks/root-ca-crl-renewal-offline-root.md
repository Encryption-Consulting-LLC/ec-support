---
title: "Root CA CRL Renewal for an Offline Root CA"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS standalone offline root CA on Windows Server 2016 to 2025; Entrust nShield and Thales Luna HSMs"
summary: "Routine runbook to power on an offline AD CS root CA, publish a new root CRL with an HSM-protected key, and copy it to every HTTP and LDAP distribution point."
keywords: ["offline root CA", "root CRL", "certutil -CRL", "dspublish", "AD CS", "HSM", "CRL renewal"]
last_reviewed: "2026-10-06"
---

# Root CA CRL Renewal for an Offline Root CA

This runbook describes the scheduled task of publishing a new Certificate Revocation List (CRL) from an offline root Certification Authority (CA). It is for PKI administrators and HSM custodians who take part in the root CA ceremony. Missing this task is one of the most common causes of PKI-wide outages.

## Overview

An offline root CA stays powered off or disconnected from the network. It still has to publish a CRL before the current one expires. If the root CRL expires, clients cannot confirm that the issuing CA certificates are not revoked, and every certificate under the root can fail validation.

A typical root CRL validity is 6 to 12 months, with renewal planned 1 to 2 months before Next Update. The exact values come from the organization's Certification Practice Statement (CPS).

## Applies to

- Standalone (non domain-joined) root CAs running Microsoft Active Directory Certificate Services (AD CS).
- Root keys in Entrust nShield (module, OCS or softcard protection) or Thales Luna (password or PED authenticated partitions).

## Prerequisites

- Physical access to the root CA and its HSM, under the dual control required by policy.
- HSM credentials:
  - nShield: the Operator Card Set (OCS) quorum and passphrases if the root key is OCS protected.
  - Luna: the partition role credential (Crypto Officer password or the black PED key and PIN) to activate the partition.
- Approved removable media for moving the CRL.
- A domain-joined workstation with Enterprise Admin rights (or delegated rights on the CDP container) for LDAP publishing.
- The ceremony log template.

## Before starting

- **Check the clock.** The offline root has no network time. A wrong clock produces a CRL with a wrong This Update and Next Update. Set the time manually from a trusted source and record it.
- **Check the current CRL.** Run `certutil -dump <current>.crl` on any machine and note Next Update and CRL Number.
- **Schedule the next renewal.** Book the next ceremony before closing this one.

## Procedure

### Phase 1: Start the root CA

1. Power on the root CA and its HSM. Log on with the ceremony account.
2. Bring the HSM online:
   - nShield: run `enquiry` and confirm the module mode is `operational`.
   - Luna: open `lunacm`, select the slot, and run `partition login` or activate the partition as required.
3. Start the CA service if it is not running:

```cmd
net start certsvc
```

For an OCS-protected nShield key, insert the OCS cards when the service starts and the key is loaded.

### Phase 2: Review CRL settings

4. Confirm the CRL period:

```cmd
certutil -getreg CA\CRLPeriodUnits
certutil -getreg CA\CRLPeriod
certutil -getreg CA\CRLOverlapUnits
certutil -getreg CA\CRLOverlapPeriod
```

5. If the period must change, set it and restart the service. Example for 26 weeks:

```cmd
certutil -setreg CA\CRLPeriodUnits 26
certutil -setreg CA\CRLPeriod "Weeks"
net stop certsvc && net start certsvc
```

### Phase 3: Publish the CRL

6. If any issuing CA certificate must be revoked, revoke it first in the Certification Authority console or with `certutil -revoke <SerialNumber> <ReasonCode>`.
7. Publish the CRL:

```cmd
certutil -CRL
```

8. The new file is written to `%windir%\System32\CertSrv\CertEnroll`, for example `Contoso-Root-CA.crl`.
9. Check the file:

```cmd
certutil -dump %windir%\System32\CertSrv\CertEnroll\Contoso-Root-CA.crl
```

Confirm This Update is now, Next Update matches the plan, and the CRL Number increased by one.

10. Copy the CRL to the removable media. Also copy the root CA certificate if it changed.

### Phase 4: Shut down the root CA

11. Stop the service with `net stop certsvc`.
12. Log out of the HSM (Luna: `partition logout`; nShield: remove OCS cards).
13. Shut down the server and return the HSM credentials and media to secure storage.

### Phase 5: Publish online

14. Copy the CRL to every HTTP CRL Distribution Point (CDP) web server.
15. If the root CRL is listed with an LDAP URL, publish it to Active Directory from a domain-joined machine:

```cmd
certutil -dspublish -f Contoso-Root-CA.crl <RootCAHostName>
```

`<RootCAHostName>` is the root CA computer name used in the LDAP CDP path.

## Verification

1. Download the CRL from each HTTP URL and run `certutil -dump` on it.
2. Run `certutil -URL <IssuingCACert>.crt` and use **Retrieve** on the CRLs option. All CDP rows should show **Verified**.
3. Open `pkiview.msc` on a domain-joined machine. The root CA node should show **OK** for every CDP location.
4. Record the CRL Number, Next Update and next ceremony date in the log.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| CA service will not start | HSM not activated or OCS not inserted | Activate the Luna partition or insert the OCS, then restart `certsvc`. |
| CRL dates are wrong | Root CA clock is off | Correct the system time, run `certutil -CRL` again. |
| `pkiview` shows the old CRL | Web server cache, file not replaced, or AD replication delay | Replace the file on each server, wait for replication, clear the client cache with `certutil -urlcache * delete`. |
| `dspublish` access denied | Account lacks rights on the CDP container | Use an Enterprise Admin account or delegate rights. |
| Issuing CA fails with revocation offline | Root CRL expired before publishing | Complete Phase 5, then restart the issuing CA service. |

## Related articles

- [Changing CRL Publication Periods](changing-crl-publication-periods.md)
- [Recovering from an Expired CRL](recovering-from-an-expired-crl.md)
- [High Availability CDP and AIA](high-availability-cdp-and-aia.md)
- [Key Ceremonies Explained](../../02-General/HSM/key-ceremonies-explained.md)
- [Luna PED Keys Explained](../HSM-Runbooks/luna-ped-keys-explained.md)
