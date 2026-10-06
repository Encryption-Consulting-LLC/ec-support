---
title: "AD CS Backup and Restore Best Practices"
category: "General"
section: "PKI"
article_type: "How-to"
applies_to: "Microsoft AD CS on Windows Server 2016, 2019, 2022, 2025; software keys and HSM-protected keys"
summary: "Best practices to back up and restore a Microsoft AD CS CA: database, CA keys, registry, CAPolicy.inf, templates, HSM keys, and restore testing."
keywords: ["AD CS backup", "CA restore", "certutil -backup", "Backup-CARoleService", "CA disaster recovery"]
last_reviewed: "2026-10-06"
---

# AD CS Backup and Restore Best Practices

This article lists what to back up on a Microsoft Active Directory Certificate Services (AD CS) Certificate Authority (CA), how to take the backup, and how to restore it. It is for PKI administrators who own CA operations and disaster recovery plans.

## Overview

A full CA recovery needs more than the CA database. It needs the CA private key, the CA certificate, the CA configuration in the registry, the policy file, the list of published templates, and the files that clients download from CRL Distribution Point (CDP) and Authority Information Access (AIA) locations. When the key lives in a Hardware Security Module (HSM), the HSM's own backup is also part of the recovery set.

## Applies to

- Enterprise and standalone CAs on Windows Server 2016 and later.
- Offline root CAs and online issuing CAs.
- CAs with software keys and CAs with keys in Entrust nShield or Thales Luna HSMs.

## Prerequisites

- Local Administrator rights on the CA, or the Backup Operators right granted in the CA security settings.
- A secure, access-controlled backup location, separate from the CA server.
- For HSM-protected keys: the HSM backup material and quorum cards or credentials (for example nShield Administrator Card Set, Luna backup HSM and Partition Security Officer credentials).

## Before starting

- **Protect key backups like the CA itself.** A PKCS#12 (PFX) file of the CA key gives full control of the CA. Store it encrypted, offline, with dual control.
- **Back up after every change** to CA configuration, templates, or keys (for example after a CA certificate renewal).
- **Schedule database backups** for online issuing CAs. Daily is common. Offline roots need a backup after each ceremony.
- **Test restores** at least once a year in an isolated lab.

## Procedure

### Phase 1: Record the current state

1. Record the CA name, the CA certificate thumbprints, and the CA type:

   ```cmd
   certutil -cainfo
   ```

2. Save the list of published templates:

   ```cmd
   certutil -catemplates > C:\<BackupFolder>\catemplates.txt
   ```

3. Copy `%windir%\CAPolicy.inf`, if it exists.

### Phase 2: Back up the CA database and key

4. Back up the database and logs:

   ```cmd
   certutil -backupDB C:\<BackupFolder>\Database
   ```

5. For a **software key**, back up the CA certificate and private key to a password-protected file:

   ```cmd
   certutil -p "<StrongPassword>" -backupKey C:\<BackupFolder>\Key
   ```

   The same can be done in PowerShell:

   ```powershell
   Backup-CARoleService -Path C:\<BackupFolder> -Password (Read-Host -AsSecureString "Key password")
   ```

6. For an **HSM key**, the private key cannot be exported to a PFX file. Back up the CA certificate, and follow the HSM vendor backup process:
   - Entrust nShield: back up the `kmdata` folder (by default `/opt/nfast/kmdata` on Linux, `C:\ProgramData\nCipher\Key Management Data` on Windows) from the Remote File System (RFS) or client, and keep the Administrator Card Set safe. The Security World file and key blobs are encrypted and only usable with the Security World.
   - Thales Luna: back up the partition to a Luna Backup HSM or through the configured backup method.

   See [Key recovery and restoration utilities](../../04-Featured-Articles/HSM-Runbooks/key-recovery-and-restoration-utilities.md).

### Phase 3: Back up the configuration

7. Export the CA registry configuration:

   ```cmd
   reg export HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration C:\<BackupFolder>\CertSvc-Config.reg
   ```

8. Copy CDP and AIA content (CRL files and CA certificates), usually from `%windir%\System32\CertSrv\CertEnroll` and from the web servers that host them.
9. For Enterprise CAs, template definitions live in Active Directory. Keep a record of custom template settings (`certutil -v -dstemplate > templates-full.txt`), since AD backups restore them only with a forest restore.
10. Copy the backup set to secure storage and record a checksum.

## Restore procedure (summary)

1. Build a server with the same name (recommended) and join it to the domain for an Enterprise CA.
2. For an HSM key, install and configure the HSM client and confirm the key is visible to the CA's Key Storage Provider.
3. Install the AD CS role with **an existing private key**: import the PFX, or select the existing HSM key and certificate.
4. Stop the service:

   ```cmd
   net stop certsvc
   ```

5. Restore the database:

   ```cmd
   certutil -f -restoreDB C:\<BackupFolder>\Database
   ```

6. Import the registry file, then review paths (database location, CDP, AIA) for the new server.
7. Start the service, publish a new CRL, and confirm templates are published:

   ```cmd
   net start certsvc
   certutil -crl
   ```

See [Migrating AD CS to a new server](../../04-Featured-Articles/PKI-Runbooks/migrating-ad-cs-to-a-new-server.md) for the full runbook.

## Verification

- `certutil -cainfo` shows the expected name and certificate.
- `certutil -verify -urlfetch <issued-cert.cer>` succeeds for a recently issued certificate.
- A test enrollment from each critical template works.
- Issued and revoked certificates appear in the CA database.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| CA service will not start after restore | Key not found or wrong provider | Confirm the key is installed, the provider name in the registry matches, and the HSM client works |
| `-restoreDB` fails | Service running or database path mismatch | Stop `certsvc` and check `DBDirectory` in the registry |
| Clients report revocation offline | CRL not republished or CDP files missing | Run `certutil -crl` and copy CRLs to all CDP locations |
| Templates missing on CA | Templates not republished | Re-add templates from the saved `catemplates.txt` list |
| PFX import fails | Wrong password or corrupt file | Use the documented key custodian process to retrieve the right backup |

## Related articles

- [Migrating AD CS to a new server](../../04-Featured-Articles/PKI-Runbooks/migrating-ad-cs-to-a-new-server.md)
- [PKI security best practices](pki-security-best-practices.md)
- [Key recovery and restoration utilities](../../04-Featured-Articles/HSM-Runbooks/key-recovery-and-restoration-utilities.md)
- [certutil command reference](../../04-Featured-Articles/PKI-Runbooks/certutil-command-reference.md)
- [PKI managed support](../../03-Services/pki-managed-support.md)
