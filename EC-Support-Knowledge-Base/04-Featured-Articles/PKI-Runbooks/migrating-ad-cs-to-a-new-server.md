---
title: "Migrating AD CS to a New Server with an HSM-Protected CA Key"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025; Entrust nShield and Thales Luna KSPs"
summary: "Move a Microsoft AD CS certification authority, its database and its HSM-protected key to a new Windows Server while keeping the same CA name and certificate."
keywords: ["AD CS migration", "move CA", "certutil -backup", "certutil -restoreDB", "HSM", "nShield", "Luna", "Windows Server"]
last_reviewed: "2026-10-06"
---

# Migrating AD CS to a New Server with an HSM-Protected CA Key

This runbook moves an existing Certification Authority (CA) to a new Windows Server while keeping the same CA name, CA certificate and HSM key. It is for PKI administrators doing an operating system refresh or hardware replacement.

## Overview

A CA is made of four parts. All four must move:

| Part | Where it lives | How it moves |
|---|---|---|
| CA certificate and key | HSM (key), local computer Personal store (certificate) | Make the HSM key available on the new server, import the certificate |
| CA database and logs | `%windir%\System32\CertLog` by default | `certutil -backupDB` and `certutil -restoreDB` |
| CA configuration | `HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration` | Registry export and import |
| Policy file and templates | `%windir%\CAPolicy.inf`, template list on the CA | Copy file, record `certutil -CATemplates` |

With an HSM, the private key never leaves the HSM. The new server only needs the HSM client software and access to the same key.

## Applies to

- Enterprise and standalone CAs. Keeping the same server name is the simplest path. A new server name is supported, but every CDP and AIA URL built from the server name must be checked.

## Prerequisites

- Enterprise Admin rights (for an enterprise CA) and local Administrator on both servers.
- New server built, patched and joined to the same domain (for an enterprise CA).
- HSM client software installed on the new server, same or supported version:
  - nShield: Security World software installed, the module enrolled (`nethsmenroll` for a Connect), the CNG providers registered with the CNG configuration wizard or `cngregister`.
  - Luna: Luna client installed, Network Trust Link (NTL) set up, the partition assigned, and the KSP registered with `KspConfig.exe` for the accounts that will run the CA service.
- A change window with a freeze on revocation and issuance.

## Before starting

1. Record the current state:

```cmd
certutil -cainfo > C:\Migration\cainfo.txt
certutil -CATemplates > C:\Migration\templates.txt
certutil -getreg CA\CSP\Provider
```

2. Publish a fresh CRL with `certutil -CRL` so that clients are covered during the move.
3. Confirm a recent backup of the HSM key material exists (nShield Key Management Data, Luna partition backup).

## Procedure

### Phase 1: Back up the old CA

1. Back up the database:

```cmd
certutil -backupDB C:\Migration\DB
```

2. Export the registry:

```cmd
reg export HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration C:\Migration\CAConfig.reg
```

3. Export the CA certificate (public part only) from the local computer Personal store, or copy it from `%windir%\System32\CertSrv\CertEnroll`.
4. Copy `%windir%\CAPolicy.inf` if present.
5. Stop the service: `net stop certsvc`.

### Phase 2: Remove the role from the old server

6. Remove the CA role:

```powershell
Uninstall-AdcsCertificationAuthority -Force
```

The CA objects in Active Directory remain. The HSM key is not deleted. For a same-name migration, rename or remove the old server from the domain before joining the new one with that name.

### Phase 3: Make the key available on the new server

7. nShield: copy the CA key blob (`key_caping_machine--<hash>`) and the `world` file into `C:\ProgramData\nCipher\Key Management Data\local`, or run `rfs-sync --update` from the Remote File System. Run `nfkminfo --name-list` to confirm the key is visible.
8. Luna: open `lunacm` and confirm the partition shows the CA key objects.
9. Import the CA certificate into the local computer Personal store and bind it to the key:

```cmd
certutil -addstore My Contoso-Issuing-CA-01.cer
certutil -repairstore -csp "<KSP name>" My <CACertSerial>
```

Use `nCipher Security World Key Storage Provider` or `SafeNet Key Storage Provider`. The output must show `Signature test passed`.

### Phase 4: Install AD CS with the existing key

10. Copy `CAPolicy.inf` to `%windir%`.
11. Install the role and point it at the existing certificate:

```powershell
Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
Install-AdcsCertificationAuthority -CAType EnterpriseSubordinateCa -CertificateID <CACertThumbprint>
```

Use `StandaloneSubordinateCa` or the root types as needed. Server Manager can also be used: choose **Use existing private key** and **Select a certificate and use its associated private key**.

### Phase 5: Restore data and configuration

12. Stop the service, restore the database and import the registry:

```cmd
net stop certsvc
certutil -f -restoreDB C:\Migration\DB
reg import C:\Migration\CAConfig.reg
```

13. Review imported values that contain paths or host names (`DBDirectory`, `CRLPublicationURLs`, `CACertPublicationURLs`) and correct them for the new server.
14. Start the service and publish: `net start certsvc` then `certutil -CRL`.
15. Re-add certificate templates if the list differs from `templates.txt`.

## Verification

- `certutil -verifykeys` passes for each CA certificate.
- The CA console lists previously issued and revoked certificates.
- A test enrollment succeeds and a test revocation appears in the next CRL.
- `pkiview.msc` shows **OK** for all locations.

## Rollback

Stop and uninstall AD CS on the new server. Reinstall the role on the old server with the existing key, restore the same database backup and registry export, then start the service. The HSM key is unchanged by either step.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Install wizard does not list the CA certificate | Certificate not bound to the key | Run `certutil -repairstore` with the correct `-csp` value. |
| Service fails with keyset not found | Wrong CSP registry value or Luna slot not registered for the service account | Check `CA\CSP\Provider` and `KspConfig.exe` registrations. |
| `-restoreDB` fails | Service running or version mismatch | Stop `certsvc`; restore to the same or newer Windows version only. |
| Clients cannot reach CDP after a rename | URLs built from the old server name | Update CDP and AIA or keep a DNS alias for the old name. |

## Related articles

- [AD CS Backup and Restore Best Practices](../../02-General/PKI/ad-cs-backup-and-restore-best-practices.md)
- [Configuring AD CS with an HSM KSP](../HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
- [Enrolling a Client with an nShield Connect](../HSM-Runbooks/enrolling-a-client-with-an-nshield-connect.md)
- [Decommissioning a Certificate Authority](decommissioning-a-certificate-authority.md)
- [certutil Command Reference](certutil-command-reference.md)
