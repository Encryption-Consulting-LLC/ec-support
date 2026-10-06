---
title: "Decommissioning a Certificate Authority"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025; Entrust nShield and Thales Luna HSMs"
summary: "Safely retire a Microsoft AD CS certification authority: stop issuance, publish a final CRL, keep records, remove AD objects and destroy the HSM key."
keywords: ["decommission CA", "retire CA", "AD CS", "final CRL", "NTAuth", "HSM key destruction", "Uninstall-AdcsCertificationAuthority"]
last_reviewed: "2026-10-06"
---

# Decommissioning a Certificate Authority

This runbook explains how to retire a Microsoft Active Directory Certificate Services (AD CS) Certification Authority (CA) without breaking certificates that are still in use, and how to remove its key from a Hardware Security Module (HSM). It is for PKI administrators, HSM custodians and security officers.

## Overview

Decommissioning has five goals:

1. Stop new issuance.
2. Keep revocation working for every certificate that has not expired, or revoke those certificates.
3. Keep records required by policy (database, audit logs, ceremony logs).
4. Remove the CA from Active Directory so clients and enrollment tools stop using it.
5. Destroy the CA private key in a controlled, witnessed way.

## Applies to

- Enterprise and standalone CAs. For a CA that will be replaced, build and test the new CA first.

## Prerequisites

- Enterprise Admin rights (for an enterprise CA) and CA Administrator rights.
- An inventory of unexpired certificates issued by the CA and their owners.
- Approval from the PKI policy authority. HSM custodians and quorum available (nShield Administrator Card Set (ACS) or Operator Card Set (OCS); Luna Security Officer and Crypto Officer credentials).

## Before starting

- Choose a revocation approach:

| Approach | Description | When to use |
|---|---|---|
| Let certificates expire | Keep the CA able to publish CRLs until the last certificate expires | Few risks, long-lived replacement plan |
| Revoke all and publish a long final CRL | Revoke everything, publish one CRL that lasts past the last expiry | CA must go away now |
| Publish a long final CRL without revoking | Final CRL valid until the last certificate expires | Certificates must keep working, CA hardware must go |

- Never destroy the CA key before the final CRL has been signed and checked.
- Check whether the CA archived user keys (key archival). Those keys must be recovered or kept before the database is retired.

## Procedure

### Phase 1: Stop issuance

1. In the Certification Authority console, delete every entry under **Certificate Templates**, or run this on the CA:

```powershell
Get-CATemplate | Remove-CATemplate -Force
```
2. Remove the CA from enrollment tools, CLM platforms and auto-enrollment policies.
3. Record the date and time issuance stopped.

### Phase 2: Final revocation and CRL

4. If revoking, revoke each certificate with reason **Cessation of Operation** (reason code 5):

```cmd
certutil -revoke <SerialNumber> 5
```

5. Set the base CRL validity to cover the last certificate expiry, and turn off delta CRLs:

```cmd
certutil -setreg CA\CRLPeriodUnits <N>
certutil -setreg CA\CRLPeriod "Years"
certutil -setreg CA\CRLDeltaPeriodUnits 0
net stop certsvc && net start certsvc
certutil -CRL
```

6. Check the final CRL with `certutil -dump` and copy it to every HTTP CRL Distribution Point (CDP). Keep CDP and AIA URLs online until the final CRL expires.

### Phase 3: Back up records

7. Back up the database and configuration and store them per the retention policy:

```cmd
certutil -backupDB <Folder>
reg export HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration <Folder>\CAConfig.reg
```

8. Export audit logs and ceremony records.

### Phase 4: Remove the role and AD objects

9. Uninstall AD CS:

```powershell
Uninstall-AdcsCertificationAuthority -Force
```

10. Remove the CA's objects from Active Directory with `pkiview.msc` (**Manage AD Containers**) or ADSI Edit under `CN=Public Key Services,CN=Services,CN=Configuration,<ForestDN>`:
    - **Enrollment Services**: the CA object (stops enrollment).
    - **Certification Authorities** and **AIA**: remove only if the CA certificate should no longer be trusted. Leave them if certificates must still validate.
    - **CDP**: keep while the final CRL is needed.
    - **NTAuthCertificates**: remove the CA certificate to stop smart card and certificate logon:

```cmd
certutil -viewdelstore "ldap:///CN=NTAuthCertificates,CN=Public Key Services,CN=Services,CN=Configuration,<ForestDN>?cACertificate?base?objectClass=certificationAuthority"
```

### Phase 5: Destroy the key

11. Under dual control, delete the CA key:
    - nShield: delete the CA key blob (`key_caping_machine--<hash>`) from `Key Management Data\local` on every server and on the Remote File System, and from all backups covered by the decision. If the key was protected by a dedicated OCS, erase those cards. Verify against the vendor documentation for the installed version.
    - Luna: log in to the partition as Crypto Officer and delete the key objects (for example with `cmu delete`), or delete the whole partition if it was dedicated to the CA. Remove matching objects from backup HSMs.
12. Record the destruction with witnesses, date and evidence (command output).
13. Wipe or rebuild the server according to policy.

## Verification

- `pkiview.msc` no longer lists the CA under enrollment services.
- Enrollment attempts against the CA fail.
- The final CRL downloads from every CDP and has the expected Next Update.
- HSM listings (`nfkminfo --name-list` or `lunacm` object list) no longer show the CA key.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Clients still enroll from the CA | Enrollment Services object remains | Remove it and wait for AD replication. |
| Certificates fail after removal | CA certificate removed from AIA or root store too early | Restore the AIA and CA objects until certificates expire. |
| Final CRL shorter than expected | Period too short or overlap missing | Correct the registry values and republish before key destruction. |
| Key still listed after deletion | Copy on another server or backup | Search every enrolled host, RFS and backup. |

## Related articles

- [Migrating AD CS to a New Server](migrating-ad-cs-to-a-new-server.md)
- [Changing CRL Publication Periods](changing-crl-publication-periods.md)
- [AD CS Backup and Restore Best Practices](../../02-General/PKI/ad-cs-backup-and-restore-best-practices.md)
- [Key Recovery and Restoration Utilities](../HSM-Runbooks/key-recovery-and-restoration-utilities.md)
- [Key Ceremonies Explained](../../02-General/HSM/key-ceremonies-explained.md)
