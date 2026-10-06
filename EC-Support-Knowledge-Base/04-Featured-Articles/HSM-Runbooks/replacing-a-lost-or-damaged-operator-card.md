---
title: "Replacing a Lost or Damaged Operator Card"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Entrust nShield Security World Operator Card Sets (OCS) and softcards; Thales Luna black Crypto Officer PED keys"
summary: "Runbook to replace a lost or damaged nShield Operator Card Set with createocs and rocs, recover passphrases, and handle a lost Luna black PED key."
keywords: ["lost operator card", "replace OCS", "rocs", "createocs", "cardpp recover", "lost black PED key", "role resetpw"]
last_reviewed: "2026-10-06"
---

# Replacing a Lost or Damaged Operator Card

This runbook explains what to do when an Entrust nShield Operator Card Set (OCS) card is lost, stolen, damaged, or its passphrase is forgotten. It also covers the Thales Luna equivalent, a lost black Crypto Officer (CO) PED key. It is for HSM administrators, application owners, and security officers.

## Overview

An OCS is a set of smart cards that protects application keys. With a K of N OCS, K cards must be presented to load the keys. A lost card is both an availability risk (fewer spares) and a security risk (someone else may hold it).

Entrust nShield does not allow single cards to be copied or added to an existing OCS. The standard fix is to create a new OCS and move the keys to it with `rocs`. `rocs` uses the Administrator Card Set (ACS), not the old OCS, so it works even if the old cards are all gone.

| Situation | Action |
|---|---|
| One card lost, quorum still available | Replace the whole OCS with `createocs` and `rocs` |
| Quorum lost (fewer than K cards) | Same: `rocs` with the ACS, if recovery is enabled |
| Passphrase forgotten, card present | `cardpp --recover` (if passphrase recovery is enabled) |
| Card damaged, cannot be read | Treat as lost |
| Luna black CO key lost | Use a duplicate, or Partition SO resets CO if HSM policy 15 is on |

## Applies to

- nShield Security World software 12.x, 13.x, and later with Solo XC, Connect XC, nShield 5s, and nShield 5c.
- Luna Network HSM 7 and Luna PCIe HSM 7 in PED mode.

Check the management guide for the installed version.

## Prerequisites

- nShield: a quorum of the ACS with passphrases; blank smart cards for the new OCS; a copy of `kmdata/local`; recovery enabled in the Security World (`Recovery` flag in `nfkminfo -w`).
- Luna: a duplicate black key, or the Partition SO credential and HSM policy 15 enabled.
- An incident or change record.

## Before starting

> **Warning:** If the Security World was created with `--no-recovery`, or the keys were created as non-recoverable, `rocs` cannot move the keys. If the OCS quorum is also lost, those keys are gone for good. Plan to generate new keys and reissue certificates.

> **Warning:** Treat a lost card as a security incident. Even though a card alone is not enough without its passphrase and the key blobs, replace the set promptly and record the event.

1. Report the loss to security and record the card label and when it was last seen.
2. Run `nfkminfo -w` (recovery state) and `nfkminfo -c` (card set list and quorum).
3. Run `nfkminfo -l` to list the keys protected by the affected OCS.
4. Back up `kmdata/local`.
5. Book a change window. Applications that load keys from the old OCS will need the new cards.

## Procedure

### Phase 1: nShield, create the new OCS

1. Create the new OCS. The K/N can be the same as before or new:

   ```bash
   createocs -m <module_id> -Q <K>/<N> -N <new_cardset_name>
   ```

   Match the old set's options where needed, for example `-p` for persistent, `-T <time>` for a timeout, or `-q` for remotely readable.
2. Set a passphrase for each card. Label cards and record them.

### Phase 2: nShield, move keys with rocs

1. Start `rocs` and run:

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

2. Present the ACS quorum and new OCS cards when prompted.
3. If a key was marked by mistake, use `revert <key_spec>` before `save`.
4. Keys protected by an OCS can only move to another OCS, not to a softcard.

### Phase 3: nShield, distribute and clean up

1. Sync Security World data to the RFS and clients:

   ```bash
   rfs-sync --commit
   rfs-sync --update
   ```

2. Update application settings if they refer to the card set name.
3. Test the application with the new OCS.
4. Erase remaining old OCS cards:

   ```bash
   createocs -m <module_id> -e
   ```

5. Remove the old card set from the Security World. If not all old cards could be erased, remove the old card set files from `kmdata/local` as the vendor guide describes, then sync again.

### Phase 4: nShield, recover a forgotten passphrase

If the card is present but the passphrase is forgotten, and the world has passphrase recovery (`PINRecovery` in `nfkminfo -w`):

```bash
cardpp --recover -m <module_id>
```

Present the ACS quorum and set a new passphrase. To change a known passphrase, use `cardpp --change -m <module_id>`.

### Phase 5: Luna, lost black CO PED key

1. If a duplicate black key exists, use it and make a new duplicate at once. Then change the CO secret so the lost key no longer works:

   ```bash
   lunacm:> role login -name co
   lunacm:> role changepw -name co
   ```

2. If no duplicate exists and HSM policy 15 (Enable SO reset of partition PIN) is on, the Partition SO can reset the CO credential:

   ```bash
   lunacm:> role login -name po
   lunacm:> role resetpw -name co
   ```

   Thales notes policy 15 is off by default and turning it on is destructive, so it cannot be turned on after the loss without erasing the HSM.
3. If neither option is possible, restore keys to a new partition from backup. See [Key recovery and restoration utilities](key-recovery-and-restoration-utilities.md).
4. In HA groups, change the CO secret on every member, then reactivate if activation is used.

## Verification

- nShield: `nfkminfo -c` shows the new card set; `nfkminfo -l` shows keys under it; the application loads keys with the new cards; old cards fail.
- Luna: CO login works with the new key; the old key is rejected; HA members are all in sync.
- Incident record closed with details of the new card set.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `rocs` shows no keys to recover | Recovery disabled or keys non-recoverable | Keys cannot be moved; generate new keys |
| `rocs` will not target a softcard | OCS keys can only go to an OCS | Create a new OCS target |
| `cardpp --recover` not allowed | Passphrase recovery not enabled | Replace the OCS with `rocs` instead |
| Application still asks for old card set | Config refers to old name or files not synced | Update config; run `rfs-sync --update` |
| Luna `role resetpw` refused | HSM policy 15 off | Use a duplicate key or restore from backup |
| Old card still loads keys | Old card set not removed | Erase old cards and remove old card set files |

## Related articles

- [How to update the quorum in an HSM](how-to-update-the-quorum-in-an-hsm.md)
- [How to replace the Administrator Card Set](how-to-replace-the-administrator-card-set.md)
- [Key recovery and restoration utilities](key-recovery-and-restoration-utilities.md)
- [Luna PED keys explained](luna-ped-keys-explained.md)
- [Entrust nShield Security World concepts](../../02-General/HSM/entrust-nshield-security-world-concepts.md)
