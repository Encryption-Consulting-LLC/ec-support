---
title: "Issuing CA Certificate Renewal with an HSM"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025; Entrust nShield and Thales Luna KSPs; two-tier hierarchy with an offline root CA"
summary: "Step-by-step renewal of a Microsoft AD CS issuing CA certificate with the same key or a new HSM key, including CAPolicy.inf settings and offline root signing."
keywords: ["renew issuing CA", "certutil -renewCert", "ReuseKeys", "CAPolicy.inf", "AD CS", "HSM", "nShield", "Luna"]
last_reviewed: "2026-10-06"
---

# Issuing CA Certificate Renewal with an HSM

This runbook covers renewal of a subordinate (issuing) Certification Authority (CA) certificate in Microsoft Active Directory Certificate Services (AD CS) when the CA key is stored in a Hardware Security Module (HSM). It is for PKI administrators who plan and run the renewal, and for HSM operators who must be present for key operations.

## Overview

A Windows CA does not issue a certificate that is valid past the end of its own CA certificate. As the CA certificate nears expiry, issued certificates get shorter and shorter. Renew the issuing CA well before its remaining life drops below the longest template validity. A common rule is to renew at the halfway point of the CA certificate.

There are two renewal options:

| Option | Command | When to use |
|---|---|---|
| Same key | `certutil -renewCert ReuseKeys` | Key size and algorithm are still acceptable and the key has not reached its cryptoperiod limit. CRLs stay under one key. |
| New key | `certutil -renewCert` | Key is old, key size or algorithm must change, or the policy requires a new key. The CA starts a new CRL (file name gets a suffix such as `(1)`). |

## Applies to

- Enterprise and standalone subordinate CAs on Windows Server 2016 to 2025.
- CA keys held in an Entrust nShield HSM (nCipher Security World Key Storage Provider) or a Thales Luna HSM (SafeNet Key Storage Provider).

## Prerequisites

- Enterprise Admin or CA Administrator rights (Enterprise Admin for publishing to Active Directory).
- Access to the parent CA (often an offline root CA), its HSM and its quorum.
- HSM access on the issuing CA:
  - nShield: module healthy (`enquiry`), the Security World loaded, and the Operator Card Set (OCS) available if the CA key is OCS protected.
  - Luna: the partition is reachable and activated, and the KSP slot is registered for the CA service account (check with `KspConfig.exe`).
- A current CA backup (see Before starting).
- A change window. Certificate issuance stops briefly while the CA service restarts.

## Before starting

1. **Back up the CA.** Run `certutil -backupDB <BackupFolder>` and export the CA registry key `HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration`. With an HSM, `certutil -backupkey` does not export the key. Back up the HSM side instead (nShield Key Management Data folder, Luna partition backup).
2. **Check CAPolicy.inf.** Windows reads `%windir%\CAPolicy.inf` during installation and during CA certificate renewal. Relevant `[certsrv_server]` keys:

```ini
[Version]
Signature="$Windows NT$"

[certsrv_server]
RenewalKeyLength=3072
RenewalValidityPeriod=Years
RenewalValidityPeriodUnits=5
```

`RenewalKeyLength` applies only when a new key is generated. `RenewalValidityPeriod` and `RenewalValidityPeriodUnits` apply only to a root CA. For an issuing CA, the parent CA decides the validity, using its `CA\ValidityPeriod` and `CA\ValidityPeriodUnits` registry values.

3. **Check the parent CA settings.** On the parent CA:

```cmd
certutil -getreg CA\ValidityPeriodUnits
certutil -getreg CA\ValidityPeriod
```

4. **Check the parent CRL.** Make sure the parent CA's CRL is valid for the life of the change. The new issuing CA certificate cannot be installed if its chain cannot be validated.

## Procedure

### Phase 1: Create the renewal request

1. On the issuing CA, open an elevated command prompt.
2. Run one of the following:

```cmd
rem Same key
certutil -renewCert ReuseKeys

rem New key, generated in the HSM through the CA's configured KSP
certutil -renewCert
```

3. The CA service stops. For an enterprise CA with an online parent, the request may be sent automatically. For an offline root, Windows writes a request file (`.req`) to the system drive root, for example `C:\ICA01.contoso.com_Contoso-Issuing-CA-01.req`. Note the file name in the output.
4. For a new key on nShield with OCS protection, present the OCS cards when prompted. For Luna, confirm the partition is activated before running the command.

> **Note:** Use `-f` to ignore an older outstanding renewal request and generate a new one.

### Phase 2: Sign the request at the parent CA

5. Copy the `.req` file to the offline root CA using approved removable media.
6. On the root CA:

```cmd
certreq -submit <RequestFile>.req
```

7. If the request is pending, issue it:

```cmd
certutil -resubmit <RequestId>
certreq -retrieve <RequestId> Contoso-Issuing-CA-01-renewed.cer
```

8. Publish an updated root CRL at the same time if it is near its Next Update date.

### Phase 3: Install the new certificate

9. Copy the `.cer` file back to the issuing CA.
10. Install it and start the service:

```cmd
certutil -installCert Contoso-Issuing-CA-01-renewed.cer
net start certsvc
```

11. Publish a fresh CRL: `certutil -CRL`.
12. Copy the new CA certificate (from `%windir%\System32\CertSrv\CertEnroll`) to every HTTP Authority Information Access (AIA) location. For an enterprise CA, check that Active Directory has the new certificate: `certutil -dspublish -f <NewCACert>.crt SubCA`.

## Verification

- `certutil -cainfo` shows the CA certificate count increased (for example `CA cert count: 2`).
- `certutil -verifykeys` reports that each CA certificate matches its key.
- `certutil -verify -urlfetch <NewCACert>.crt` shows the chain and revocation checks pass.
- Enroll a test certificate and confirm it chains to the new CA certificate and has the expected validity.
- Open `pkiview.msc` and confirm all AIA and CDP locations show **OK**.

## Rollback

If installation fails before `-installCert`, the old certificate remains in use. Start the CA with `net start certsvc`. If the new certificate was installed but is wrong, restore the registry export and database backup from Before starting, then restart the service. A new HSM key that is not used can be left in place and removed later under change control.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `-installCert` fails with a revocation error | Parent CRL expired or not reachable | Publish a new root CRL and copy it to the CDP. Test with `certutil -URL`. |
| New certificate shorter than expected | Parent CA validity settings or parent certificate expiry | Adjust `CA\ValidityPeriodUnits` on the parent and reissue. |
| Key generation fails with a provider error | HSM not reachable, OCS missing, Luna slot not registered | Check `enquiry` (nShield) or `KspConfig.exe` and `lunacm` (Luna). |
| CAPolicy.inf ignored | File not in `%windir%`, or wrong section name | Place file in `%windir%` before running `-renewCert`. |
| Clients fail to chain new certificates | New CA certificate not published to AIA | Copy the `.crt` to all AIA URLs and run `certutil -dspublish`. |

## Related articles

- [Root CA CRL Renewal for an Offline Root](root-ca-crl-renewal-offline-root.md)
- [certutil Command Reference](certutil-command-reference.md)
- [High Availability CDP and AIA](high-availability-cdp-and-aia.md)
- [Configuring AD CS with an HSM KSP](../HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
- [Two-Tier vs Three-Tier PKI Hierarchy](../../02-General/PKI/two-tier-vs-three-tier-pki-hierarchy.md)
