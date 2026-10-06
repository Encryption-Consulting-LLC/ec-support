---
title: "certutil Command Reference for AD CS and HSM Operations"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Reference"
applies_to: "Microsoft AD CS and Windows clients on Windows Server 2016 to 2025 and Windows 10 and 11"
summary: "Quick reference of the certutil commands PKI teams use most for CA backup, renewal, CRL publishing, key checks, URL testing and cache clearing, with HSM notes."
keywords: ["certutil", "certutil commands", "AD CS", "CRL", "certutil -sign", "certutil -verify", "certutil -backup", "HSM"]
last_reviewed: "2026-10-06"
---

# certutil Command Reference for AD CS and HSM Operations

This reference lists the `certutil` commands that come up most often when running a Microsoft Active Directory Certificate Services (AD CS) Certification Authority (CA), especially one that uses a Hardware Security Module (HSM). It is for PKI administrators and support engineers who need the right syntax quickly. Full syntax is in the Microsoft Learn `certutil` page.

## How to read this page

- Run commands in an elevated command prompt on the CA unless noted.
- `-config <Machine>\<CAName>` targets a remote CA where the command supports it.
- `-f` forces an action (overwrite or ignore a warning).
- Values in `<angle brackets>` are placeholders.

## CA information and service

| Task | Command |
|---|---|
| Show CA name, type and certificate count | `certutil -cainfo` |
| Ping the CA request interface | `certutil -ping` |
| Stop the CA service | `certutil -shutdown` or `net stop certsvc` |
| List templates the CA issues | `certutil -CATemplates` |
| Read a CA registry value | `certutil -getreg CA\<ValueName>` |
| Set a CA registry value | `certutil -setreg CA\<ValueName> <Value>` |

## Backup and restore

| Task | Command | Notes |
|---|---|---|
| Back up database and key | `certutil -p <Password> -backup <Folder>` | With an HSM the key is not exportable. Back up the HSM side instead. |
| Back up database only | `certutil -backupDB <Folder>` | Add `Incremental` or `KeepLog` if needed |
| Back up CA certificate and key to PFX | `certutil -p <Password> -backupKey <Folder>` | Software keys only |
| Restore database and key | `certutil -restore <Folder>` | Stop the service first |
| Restore database only | `certutil -f -restoreDB <Folder>` | |
| Restore key from PFX | `certutil -restoreKey <Folder or PFX>` | |

Also export `HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration` with `reg export`.

## CA certificate renewal

```cmd
rem Renew with the same key
certutil -renewCert ReuseKeys

rem Renew with a new key (in the HSM if the CA uses an HSM KSP)
certutil -renewCert

rem Install the signed certificate
certutil -installCert <NewCACert>.cer
```

`CAPolicy.inf` in `%windir%` is read during renewal. `RenewalKeyLength` applies to new keys. `RenewalValidityPeriod` and `RenewalValidityPeriodUnits` apply to root CAs only.

## CRL operations

| Task | Command |
|---|---|
| Publish base and delta CRLs | `certutil -CRL` |
| Publish with a one-time validity | `certutil -CRL <dd:hh>` |
| Republish the most recent CRLs | `certutil -CRL republish` |
| Publish delta only | `certutil -CRL delta` |
| Publish a CRL file to Active Directory | `certutil -dspublish -f <CRLFile> <CAHostName>` |
| Dump a CRL | `certutil -dump <CRLFile>` |

### Re-signing a CRL with certutil -sign

```cmd
certutil -sign <InCRL> <OutCRL> now+<dd:hh> [-<OIDList>] [+<SerialList>]
```

- `now+7:00` sets This Update to now and Next Update 7 days and 0 hours later. The format is days:hours.
- A minus sign removes extensions (by OID) or serial numbers. A plus sign adds serial numbers.
- `-2.5.29.46` removes the Freshest CRL extension, which points a base CRL to its delta CRL.
- `2.5.29.27` is the Delta CRL Indicator. It identifies a delta CRL and is not in a base CRL.
- `-Cert <CertId>` selects the signing certificate.

See [Emergency CRL Signing](emergency-crl-signing.md) for the full procedure.

## Keys and certificate stores

| Task | Command |
|---|---|
| Check each CA certificate against its key | `certutil -verifykeys` |
| Show a certificate and its key provider | `certutil -store My <SerialNumber>` |
| Verify a certificate in a store | `certutil -verifystore -v My <SerialNumber>` |
| Add a certificate to the computer Personal store | `certutil -addstore My <CertFile>` |
| Bind a certificate to an existing key | `certutil -repairstore [-csp "<KSP>"] My <SerialNumber>` |
| Remove a certificate from a store | `certutil -delstore My <SerialNumber>` |
| List keys for a provider | `certutil -csp "<KSP>" -key` |
| Import a PFX into a provider | `certutil -csp "<KSP>" -importPFX My <PFXFile>` |

HSM provider names: `nCipher Security World Key Storage Provider` (Entrust nShield) and `SafeNet Key Storage Provider` (Thales Luna).

## Revocation and URL testing

| Task | Command |
|---|---|
| Build the chain and fetch every CRL, AIA and OCSP URL | `certutil -verify -urlfetch <CertFile>` |
| Interactive URL retrieval tool | `certutil -URL <CertFile>` |
| Revoke a certificate | `certutil -revoke <SerialNumber> <ReasonCode>` |
| Clear the URL cache | `certutil -urlcache * delete` |
| Flush cached CRLs in the chain engine | `certutil -setreg chain\ChainCacheResyncFiletime @now` |
| Trigger autoenrollment | `certutil -pulse` |

## Common errors

| Code | Name | Meaning |
|---|---|---|
| 0x80092013 | CRYPT_E_REVOCATION_OFFLINE | Revocation server offline, or CRL expired or unreachable |
| 0x80092012 | CRYPT_E_NO_REVOCATION_CHECK | No revocation information or no check possible |
| 0x80092010 | CRYPT_E_REVOKED | The certificate is revoked |
| 0x800b0109 | CERT_E_UNTRUSTEDROOT | Chain ends in a root that is not trusted |
| 0x8009000d | NTE_NO_KEY | Key does not exist or cannot be reached (check HSM) |

## Related articles

- [Emergency CRL Signing](emergency-crl-signing.md)
- [Changing CRL Publication Periods](changing-crl-publication-periods.md)
- [Issuing CA Certificate Renewal with an HSM](issuing-ca-certificate-renewal.md)
- [Troubleshooting Revocation Server Offline Errors](troubleshooting-revocation-server-offline-errors.md)
- [AD CS Backup and Restore Best Practices](../../02-General/PKI/ad-cs-backup-and-restore-best-practices.md)
- [Collecting HSM and PKI Diagnostics for Support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md)
