---
title: "Key Recovery and Restoration Utilities"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Entrust nShield Security World (rocs, new-world, cardpp, migrate-world); Thales Luna HSM 7 with Luna Backup HSM; Microsoft AD CS Key Recovery Agent"
summary: "How to recover HSM keys: nShield rocs and Security World restore with the ACS, Luna Backup HSM restore and cloning, plus AD CS Key Recovery Agent basics."
keywords: ["HSM key recovery", "rocs", "restore Security World", "kmdata", "partition archive restore", "Luna Backup HSM", "Key Recovery Agent"]
last_reviewed: "2026-10-06"
---

# Key Recovery and Restoration Utilities

This runbook explains the tools used to recover and restore keys held in Entrust nShield and Thales Luna Hardware Security Modules (HSMs). It also briefly covers the Microsoft Active Directory Certificate Services (AD CS) Key Recovery Agent (KRA), which is often confused with HSM recovery. It is for HSM administrators and PKI engineers handling a failed HSM, a lost card, or a site rebuild.

## Overview

| Scenario | nShield tool | Luna tool |
|---|---|---|
| HSM hardware failed, keys must run on a new HSM | `new-world -l` or front panel **Load Security World**, with `kmdata/local` backup and ACS quorum | Restore partition from Luna Backup HSM (`partition archive restore`) |
| Lost or broken operator card set | `rocs` to a new OCS | Use a duplicate PED key, or PO resets CO if HSM policy 15 is on |
| Forgotten card passphrase | `cardpp --recover` | Change role secret with a duplicate key |
| Copy keys to another HSM | Add HSM to the same Security World | `partition clone`, or HA group sync |
| Move keys to a new trust domain | `migrate-world` | Cloning is only possible inside the same domain |

## Applies to

- Entrust nShield Solo XC, Connect XC, nShield 5s, and nShield 5c with Security World software 12.x, 13.x, and later.
- Thales Luna Network HSM 7, Luna PCIe HSM 7, and Luna Backup HSM 7 or Backup HSM G5.

Check the release notes for the installed version; options and limits change over time.

## Prerequisites

- nShield: a backup copy of `kmdata/local` (Linux `/opt/nfast/kmdata/local`, Windows `%NFAST_KMDATA%\local`), a quorum of the Administrator Card Set (ACS) with passphrases, and blank cards.
- Luna: the Backup HSM and its backup partition credentials, the red cloning domain key or domain string, and the Crypto Officer (CO) credential of the target partition.
- A change window and an approved incident or change record.

## Before starting

> **Warning:** Recovery only works if it was planned in advance. nShield OCS replacement needs a Security World created with recovery enabled (the default, unless `--no-recovery` was used), and keys created as recoverable. This cannot be added later. Luna restore needs a backup taken before the failure, in the same cloning domain.

> **Warning:** Losing the ACS quorum, or every copy of the Luna red domain key and SO keys, is unrecoverable. Keep spares in separate locations.

1. Confirm what is lost: hardware, cards, passphrases, or files.
2. Check recovery status (nShield): `nfkminfo -w` should list the `Recovery` flag.
3. Copy the current `kmdata` folder and Luna backup inventory before changing anything.
4. Gather the needed custodians.

## Procedure

### Phase 1: nShield, restore the Security World on a new or replaced HSM

Security World data on disk is encrypted with the Security World key, so the backup is safe to store but useless without an HSM and the ACS.

1. Install the HSM and Security World software. Put the HSM in pre-initialization mode (local HSMs).
2. Restore the `kmdata/local` backup to the client (or to the Remote File System for network HSMs).
3. Program the HSM into the existing Security World:
   - Local HSM (Solo XC, 5s):

     ```bash
     new-world -l -m <module_id>
     ```

   - Network HSM (Connect XC, 5c): on the front panel select **Security World mgmt > Module initialization > Load Security World**.
4. Present the ACS quorum and passphrases when prompted.
5. Return the HSM to operational mode, then sync clients with `rfs-sync --update`.
6. If keys were stored in NVRAM, restore them from the `nvram-backup` copy.

### Phase 2: nShield, recover OCS-protected keys onto a new OCS

`rocs` uses the ACS, not the old OCS, so it works even when the old cards are lost.

1. Create the new OCS (its K/N can differ from the old one):

   ```bash
   createocs -m <module_id> -Q <K>/<N> -N <new_cardset_name>
   ```

2. Run `rocs` interactively:

   ```text
   module <module_id>
   list cardsets
   target <new_cardset_name>
   list keys
   mark <key_spec>
   recover
   save
   quit
   ```

   Use `revert <key_spec>` before `save` to undo a wrong transfer. In command-line mode (`rocs -m <module_id> -t <target> -k <keys>`) all keys are recovered and saved at once.
3. OCS keys can only go to another OCS, not to a softcard.
4. Erase the old cards and remove the old card set from the Security World.

### Phase 3: nShield, recover a forgotten passphrase

If the Security World has passphrase recovery (`PINRecovery` in `nfkminfo -w`), set a new OCS card passphrase with ACS approval:

```bash
cardpp --recover -m <module_id>
```

### Phase 4: Luna, restore a partition from a Backup HSM

1. Create and initialize a target partition in the same cloning domain as the backup (same red key or domain string).
2. Connect the Luna Backup HSM to the client and find its slot with `slot list`.
3. Log in to the target partition as CO and restore:

   ```bash
   lunacm:> slot set -slot <target_slot>
   lunacm:> role login -name co
   lunacm:> partition archive restore -slot <backup_slot> -partition <backup_partition_name> -password <backup_partition_password>
   ```

   On PED-authenticated HSMs, omit the password and use the PED. Use `-objects <handles>` to restore selected objects (Luna HSM Client 10.3.0 or later), or `-smkonly` to restore only the SKS Master Key (firmware 7.7.0 or later).

### Phase 5: Luna, clone objects between live partitions

If a healthy partition in the same domain still holds the keys, clone them:

```bash
lunacm:> partition clone -objects all -slot <target_slot>
```

In an HA group, a replaced member is added back with `hagroup addmember`, then `hagroup synchronize` copies the objects.

### Phase 6: AD CS Key Recovery Agent (not an HSM process)

The AD CS KRA recovers archived user private keys (for example, encryption certificates) from the CA database. It does not recover the CA's own key from an HSM. A CA administrator retrieves the blob and a KRA decrypts it:

```cmd
certutil -getkey <certificate_serial_number> <output_blob_file>
certutil -recoverkey <output_blob_file> <recovered_key.pfx>
```

## Verification

- nShield: `enquiry` shows `mode operational`; `nfkminfo -w` shows `Usable`; `nfkminfo -l` lists keys; the application can load keys.
- Luna: `partition contents` lists the expected objects; test a sign or decrypt operation; for a CA, run `certutil -verifykeys`.
- Record the recovery in the incident log.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `rocs` lists no recoverable keys | World or keys created without recovery | Keys cannot be recovered; reissue keys and certificates |
| Load Security World fails | Wrong `kmdata/local` or wrong ACS | Use the backup from the same world; check ACS cards with `cardpp --examine` |
| Keys missing after restore | `kmdata/local` backup is older than key creation | Use a newer backup; back up after every key change |
| Luna restore fails with domain error | Target partition in a different domain | Recreate the target partition with the correct red key or domain string |
| Restore reports object already exists | Same object already on target | Check OUIDs; remove duplicates or restore selected objects |
| Partition SO cannot reset CO | HSM policy 15 not enabled | Use a duplicate black key; policy 15 change is destructive |

## Related articles

- [Backing up a Luna partition](backing-up-a-luna-partition.md)
- [Replacing a lost or damaged operator card](replacing-a-lost-or-damaged-operator-card.md)
- [How to replace the Administrator Card Set](how-to-replace-the-administrator-card-set.md)
- [How to update the quorum in an HSM](how-to-update-the-quorum-in-an-hsm.md)
- [AD CS backup and restore best practices](../../02-General/PKI/ad-cs-backup-and-restore-best-practices.md)
