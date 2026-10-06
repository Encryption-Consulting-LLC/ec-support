---
title: "Moving a CA Private Key from Software to an HSM"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025; Entrust nShield (cngimport); Thales Luna (ms2Luna)"
summary: "Steps to move a Microsoft AD CS CA key from a software provider into an nShield or Luna HSM, including the safer path of renewal with a new HSM key."
keywords: ["CA key migration", "software key to HSM", "cngimport", "ms2Luna", "AD CS", "KSP", "renewal with new key"]
last_reviewed: "2026-10-06"
---

# Moving a CA Private Key from Software to an HSM

This runbook explains how to bring an existing Certification Authority (CA) that stores its key in software under Hardware Security Module (HSM) protection. It is for PKI administrators and HSM operators planning an HSM adoption project.

## Overview

There are two ways to get a CA key into an HSM:

| Option | What happens | Main trade-off |
|---|---|---|
| A. Renew the CA with a new key generated in the HSM | The CA gets a new key pair created inside the HSM | Cleanest. The key has never existed outside hardware. Clients must trust the new CA certificate through the existing root. |
| B. Import the existing software key into the HSM | The current key is exported and wrapped into the HSM | CA certificate does not change. The key has existed in software, so it cannot be described as "generated in hardware". |

Option A is recommended for most organizations, and is often required by audit or by policies that say the key must be generated in a FIPS validated module. Option B fits when the CA certificate must not change before a planned retirement.

## Applies to

- AD CS CAs using a software provider such as "Microsoft Software Key Storage Provider" or a legacy CryptoAPI CSP.
- Entrust nShield Security World software with the `cngimport` utility.
- Thales Luna client with the `ms2Luna` utility and the SafeNet Key Storage Provider.

## Prerequisites

- HSM installed, the client connected, and the KSP registered on the CA server (see [Configuring AD CS with an HSM KSP](../HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)).
- Decided key protection: nShield module, Operator Card Set (OCS) or softcard; Luna partition and authentication model.
- A full CA backup, including a password-protected PFX of the software key from `certutil -backupKey`.
- A change window and an approved change record.

## Before starting

- Store the PFX backup offline and under dual control. It is the software copy of the key and must be destroyed once the move is complete and verified, according to policy.
- Check whether the software key is marked exportable. If it is not, Option B is not possible without vendor tooling that reads the existing key store. Use Option A.

## Procedure

### Option A: Renew with a new HSM key

1. Change the CA provider to the HSM KSP. The simplest method is to set the CA configuration values and renew:

```cmd
certutil -getreg CA\CSP\Provider
certutil -setreg CA\CSP\Provider "<HSM KSP name>"
```

KSP names: `nCipher Security World Key Storage Provider` or `SafeNet Key Storage Provider`.

2. Also review `CA\CSP\ProviderType`, `CA\CSP\CNGHashAlgorithm` and the matching `CA\EncryptionCSP` values. A CNG KSP uses `ProviderType` 0. Export the whole registry key first so the change can be reverted.
3. Restart the CA, then renew with a new key:

```cmd
net stop certsvc
certutil -renewCert
```

4. Complete the renewal at the parent CA, install the new certificate and publish a CRL as described in [Issuing CA Certificate Renewal with an HSM](issuing-ca-certificate-renewal.md).
5. The old software key is still needed to sign CRLs for certificates issued under the old CA certificate until they expire. Keep it protected until then, or plan to revoke and replace those certificates.

### Option B: Import the existing key

1. Back up the CA and stop the service:

```cmd
certutil -backupKey C:\Migration\Key
net stop certsvc
```

2. Import the key into the HSM with the vendor tool. Follow the vendor procedure for the installed version:
   - **nShield**: `cngimport` imports an existing CNG or CAPI key into the Security World. Choose module or OCS protection during import.
   - **Luna**: `ms2Luna` migrates an existing Microsoft CA key to the Luna partition and updates the key container mapping.
3. Bind the CA certificate to the HSM key:

```cmd
certutil -repairstore -csp "<HSM KSP name>" My <CACertSerial>
```

4. Update the CA provider values (`CA\CSP\Provider`, `CA\CSP\ProviderType` and `CA\EncryptionCSP` values) to the HSM KSP.
5. Start the CA: `net start certsvc`.
6. Delete the software key container from the server after verification. Destroy temporary PFX files according to policy.

## Verification

- `certutil -verifykeys` reports that each CA certificate matches its key. For Option A, this must pass for both the old (software) and new (HSM) CA certificates, because the CA keeps signing a CRL for each key.
- `certutil -store My <CACertSerial>` shows the HSM provider and `Signature test passed`.
- `certutil -CRL` succeeds and the new CRL verifies with `certutil -verify -urlfetch` on an issued certificate.
- HSM audit or log output shows signing operations from the CA.

## Rollback

Restore the exported CA registry key and the software key from the PFX backup (`certutil -restoreKey`), then restart the service. For Option A, if the renewed certificate has not been installed, simply restore the registry key.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| CA service fails: keyset does not exist | Provider registry values still point to the software provider | Check `CA\CSP\Provider` and `CA\EncryptionCSP\Provider`. |
| `-repairstore` lists no key | Import did not complete or wrong KSP named | Run `cnglist --list-keys` (nShield) or check objects in `lunacm`. |
| Renewal request signed with old key | `ReuseKeys` used by mistake | Rerun `certutil -renewCert -f` without `ReuseKeys`. |
| Import tool rejects the key | Key not exportable or unsupported key type | Use Option A. |

## Related articles

- [Issuing CA Certificate Renewal with an HSM](issuing-ca-certificate-renewal.md)
- [Configuring AD CS with an HSM KSP](../HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
- [What Is an HSM](../../02-General/HSM/what-is-an-hsm.md)
- [Key Ceremonies Explained](../../02-General/HSM/key-ceremonies-explained.md)
- [certutil Command Reference](certutil-command-reference.md)
