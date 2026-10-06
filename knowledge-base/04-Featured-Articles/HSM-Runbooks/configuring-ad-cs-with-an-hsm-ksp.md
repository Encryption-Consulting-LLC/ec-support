---
title: "Configuring AD CS with an HSM KSP"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "How-to"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025 with Entrust nShield (CNG KSP) or Thales Luna (SafeNet KSP)"
summary: "How to install a Microsoft AD CS certificate authority with its private key in an Entrust nShield or Thales Luna HSM through the vendor KSP."
keywords: ["AD CS HSM", "Key Storage Provider", "nCipher Security World Key Storage Provider", "SafeNet Key Storage Provider", "KspConfig", "Install-AdcsCertificationAuthority", "certutil -verifykeys"]
last_reviewed: "2026-10-06"
---

# Configuring AD CS with an HSM KSP

This article explains how to install a Microsoft Active Directory Certificate Services (AD CS) certificate authority (CA) so that its private key is created and kept in a Hardware Security Module (HSM). It covers the Entrust nShield and Thales Luna Key Storage Providers (KSPs). It is for PKI engineers and Windows administrators building a new CA.

## Overview

AD CS uses Microsoft Cryptography API: Next Generation (CNG). Each HSM vendor supplies a KSP that plugs into CNG. When the CA setup wizard or PowerShell selects the vendor KSP, the CA key pair is generated inside the HSM and never exists in plain form on the Windows server.

| HSM | KSP name | Setup tool |
|---|---|---|
| Entrust nShield | nCipher Security World Key Storage Provider | CNG configuration wizard (or `cnginstall` and `cngregister`) |
| Thales Luna | SafeNet Key Storage Provider | `KspConfig.exe` |

In AD CS, the provider is chosen as `<algorithm>#<provider name>`, for example `RSA#nCipher Security World Key Storage Provider` or `RSA#SafeNet Key Storage Provider`.

## Applies to

- Windows Server 2016, 2019, 2022, and 2025 with the AD CS role.
- Entrust nShield Security World software with Solo XC, Connect XC, nShield 5s, or nShield 5c.
- Thales Luna HSM Client with Luna Network HSM 7 or Luna PCIe HSM 7.

For moving an existing CA key from software into an HSM, see [Moving a CA private key from software to HSM](../PKI-Runbooks/moving-a-ca-private-key-from-software-to-hsm.md).

## Prerequisites

- The HSM installed, initialized, and reachable from the CA server.
- nShield: the CA server enrolled with the HSM and holding current Security World data. See [Enrolling a client with an nShield Connect](enrolling-a-client-with-an-nshield-connect.md).
- Luna: a partition assigned to the CA server over NTLS, visible in LunaCM, with its Crypto Officer (CO) credential.
- Local administrator on the CA server. Enterprise Admin rights for an Enterprise CA.
- A CA design: CA type, name, key algorithm and size, hash, validity, CRL and AIA locations.

## Before starting

> **Warning:** The CA key is only as recoverable as the HSM backup. Back up the nShield `kmdata/local` folder or the Luna partition right after the CA key is created.

> **Note:** Choose key protection with care. A CA service runs unattended, so it must be able to use the key after a reboot without someone typing a passphrase, unless the organization accepts manual start-up. nShield module protection, or an OCS with no passphrase and a card left in the reader, allow unattended start. Luna partitions with activation allow unattended use on PED HSMs.

1. Confirm the HSM is healthy (`enquiry` or `hsm show`).
2. Confirm the Windows server time and domain membership.
3. Prepare the `CAPolicy.inf` file if used.

## Procedure

### Phase 1A: Entrust nShield KSP

1. Install the Security World software with the CNG components.
2. Run the CNG configuration wizard from the Start menu. On Server Core, the vendor guide runs:

   ```cmd
   cnginstall --install
   cngregister
   ```

3. In the wizard, confirm the existing Security World and choose the default key protection: module protection, Operator Card Set (OCS), or softcard.
4. Confirm the provider is registered:

   ```cmd
   certutil -csplist
   ```

   The list should include `nCipher Security World Key Storage Provider`.

### Phase 1B: Thales Luna KSP

1. Install the Luna HSM Client with the KSP option.
2. Run `KspConfig.exe` from the KSP folder of the Luna HSM Client install directory.
3. Double-click **Register Or View Security Library**, browse to `cryptoki.dll`, and click **Register**.
4. Double-click **Register HSM Slots**. Select the administrator's domain and user name, enter the partition CO password, and click **Register Slot**.
5. Repeat slot registration for **NT AUTHORITY** domain and **SYSTEM** user with the same password. The CA service runs as SYSTEM and needs this registration.
6. Confirm with `certutil -csplist` that `SafeNet Key Storage Provider` is listed.

### Phase 2: Install the CA

Using Server Manager, on the **Cryptography for CA** page, select the vendor provider (for example `RSA#nCipher Security World Key Storage Provider` or `RSA#SafeNet Key Storage Provider`), the key length, and the hash algorithm.

Or with PowerShell:

```powershell
Install-AdcsCertificationAuthority `
  -CAType <EnterpriseRootCA|EnterpriseSubordinateCA|StandaloneRootCA|StandaloneSubordinateCA> `
  -CACommonName "Contoso-Issuing-CA-01" `
  -CryptoProviderName "RSA#<vendor_ksp_name>" `
  -KeyLength 3072 `
  -HashAlgorithmName SHA256
```

For an OCS-protected nShield key, present the OCS when prompted during key generation.

### Phase 3: Back up

1. nShield: copy `%NFAST_KMDATA%\local` to secure backup storage and sync to the RFS.
2. Luna: back up the partition to a Luna Backup HSM. See [Backing up a Luna partition](backing-up-a-luna-partition.md).
3. Back up the CA database and configuration with `certutil -backupdb <backup_folder>` and export the CA certificate. The private key stays in the HSM.

## Verification

```cmd
sc query certsvc
certutil -verifykeys
certutil -store my
```

- `sc query certsvc` shows `STATE` as `RUNNING`.
- `certutil -verifykeys` passes.
- `certutil -store my` shows the CA certificate with the vendor provider.
- Reboot the server in the change window and confirm the CA starts without manual steps (unless manual start is the design).

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Vendor KSP missing from the provider list | KSP not installed or registered | Rerun the CNG wizard or `cngregister` (nShield); rerun `KspConfig.exe` (Luna) |
| CA service fails after reboot (Luna) | Slot not registered for `NT AUTHORITY\SYSTEM` | Register the slot for SYSTEM in `KspConfig.exe` |
| CA service fails after reboot (nShield) | OCS or softcard needs a passphrase or card | Use module protection or plan manual start; insert the card |
| `certutil -verifykeys` fails | HSM unreachable or key not loaded | Check `enquiry` or `slot list`; check network to HSM |
| Error that the KSP DLL failed to load | Client version mismatch or broken install | Repair the client software; match supported versions |
| Key created but missing on another CA node | Security World data or partition not synced | Sync `kmdata/local`; use HA or cloning for Luna |

## Related articles

- [Moving a CA private key from software to HSM](../PKI-Runbooks/moving-a-ca-private-key-from-software-to-hsm.md)
- [Configuring an Online Responder (OCSP) with HSM](../PKI-Runbooks/configuring-an-online-responder-ocsp-with-hsm.md)
- [Enrolling a client with an nShield Connect](enrolling-a-client-with-an-nshield-connect.md)
- [Backing up a Luna partition](backing-up-a-luna-partition.md)
- [AD CS backup and restore best practices](../../02-General/PKI/ad-cs-backup-and-restore-best-practices.md)
- [PKI security best practices](../../02-General/PKI/pki-security-best-practices.md)
