---
title: "How to Update the Quorum in an HSM"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Entrust nShield Security World (Solo XC, Connect XC, nShield 5s, nShield 5c); Thales Luna Network HSM 7 and Luna PCIe HSM 7 with PED authentication"
summary: "Runbook to change the nShield ACS and OCS K of N quorum and the Thales Luna PED M of N quorum, with safety warnings and a pre-change checklist."
keywords: ["HSM quorum change", "nShield K of N", "racs", "rocs", "createocs", "Luna M of N", "hsm changepw PED", "change quorum"]
last_reviewed: "2026-10-06"
---

# How to Update the Quorum in an HSM

This runbook explains how to change the quorum (the number of cards or keys needed to approve an action) on Entrust nShield and Thales Luna Hardware Security Modules (HSMs). It covers the nShield K of N model for the Administrator Card Set (ACS) and Operator Card Set (OCS), and the Luna M of N model for PED keys. It is for HSM administrators and key custodians.

## Overview

A quorum split spreads trust across several people. nShield calls it K of N (K cards out of N), and Luna calls it M of N (M PED keys out of N). How the quorum is changed differs by vendor and credential:

| Credential | Can K/N or M/N be edited in place? | Supported way to change it |
|---|---|---|
| nShield ACS | No | Create a new Security World with the new K/N and migrate keys |
| nShield OCS | No | Create a new OCS with the new K/N, then move keys to it with `rocs` |
| Luna PED role (blue, black, gray, white) | Yes, during a secret change | Change the PED secret and choose new M and N values |
| Luna red domain key | No | Domain cannot be changed (see below) |

## Applies to

- Entrust nShield Security World software and firmware, with nShield Solo XC, Connect XC, nShield 5s, and nShield 5c.
- Thales Luna Network HSM 7 and Luna PCIe HSM 7 that use multifactor (PED) authentication.

Behavior and command options change between releases. Check the release notes and administration guide for the installed version before starting.

## Prerequisites

- A current quorum of the existing ACS, OCS, or PED keys, with passphrases or PED PINs.
- Blank smart cards or PED keys for the new set, plus spares.
- All custodians scheduled, and an approved change in a change window.

## Before starting

> **Warning:** Quorum loss is unrecoverable. If fewer than K (or M) working cards or keys remain, the protected keys or roles cannot be used again, and no vendor or EC support process can bring them back.

> **Warning:** Never start a quorum change without the old quorum in the room. Both vendors need the old credentials to approve the change.

Pre-change checklist:

1. Confirm the current quorum and card count. nShield: run `nfkminfo -w` and `nfkminfo -c`. Luna: check the key inventory log.
2. Test every existing card or PED key and its passphrase or PIN.
3. Back up `kmdata/local` (nShield) and all Luna partitions. Store the backup off the HSM.
4. Confirm that keys are recoverable (nShield): `nfkminfo -w` must show the `Recovery` flag if OCS keys will be moved.
5. Prepare blank cards or PED keys. Plan N plus at least one spare set or duplicate.
6. Pick a new quorum where K (or M) is less than N, so one lost card does not lock the set. Thales notes that M equal to N is not recommended.
7. Book a change window. Stop or drain applications that use the keys.
8. Prepare a ceremony log: date, people present, card or key serial labels, and witness signatures.

## Procedure

### Phase 1: nShield ACS quorum

The `racs` utility replaces the ACS, but Entrust documents that `racs` cannot redefine K or N. The new ACS keeps the original K of N. To change the ACS quorum, a new Security World is needed.

1. Plan a new Security World with the new ACS quorum. On a local HSM (Solo XC or 5s) the world is created with `new-world`, where `-Q` sets the ACS quorum:

   ```bash
   new-world --initialize --module=<module_id> --acs-quorum=<K>/<N>
   ```

   On a Connect XC or nShield 5c, create the world from the front panel, KeySafe 5, or a privileged client as described in the vendor guide. Use separate HSM hardware for the new world, or plan an outage if the same HSM will be reinitialized.

   > **Warning:** `new-world --initialize` replaces the Security World on that module. Do not run it on a production HSM until all keys are backed up and the migration plan is approved.

2. Migrate keys from the old world to the new world with `migrate-world`. It needs two HSMs (firmware 12.50 or later), an ACS quorum for both worlds, and blank cards for new OCSs. Only recoverable keys can be migrated. From version 13.4, the protection name and quorum can be changed during migration if the target protections are created first.

   ```bash
   migrate-world --src-module=<src_module> --dst-module=<dst_module> --source=<path_to_old_kmdata_local> --plan
   migrate-world --src-module=<src_module> --dst-module=<dst_module> --source=<path_to_old_kmdata_local> --perform
   ```

3. Repoint applications to the new world, test, and then retire the old world and erase its cards.

> **Note:** If the goal is only to replace a lost or worn ACS card while keeping the same quorum, use `racs`. See [How to replace the Administrator Card Set](how-to-replace-the-administrator-card-set.md).

### Phase 2: nShield OCS quorum

The OCS K/N cannot be edited, but Entrust states that a replacement OCS does not need the same K/N as the old set.

1. Create the new OCS with the new quorum:

   ```bash
   createocs -m <module_id> -Q <K>/<N> -N <new_cardset_name>
   ```

   Add `-p` for a persistent card set or `-T <time>` for a timeout if the old set used them.

2. Start `rocs` and move the keys to the new card set:

   ```bash
   rocs
   ```

   Inside `rocs`, run these commands in order:

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

   Present the ACS quorum when prompted, then the new OCS cards. Keys protected by an OCS can only be moved to another OCS, not to a softcard.

3. Copy the updated `kmdata/local` files to the Remote File System (RFS) and all clients (for example with `rfs-sync --commit` and `rfs-sync --update`).
4. Test the applications with the new OCS.
5. Erase the old OCS cards with `createocs -m <module_id> -e` and remove the old card set from the Security World, as Entrust recommends.

### Phase 3: Luna M of N (PED secret change)

On Luna, the M of N value is chosen when a PED keyset is created. Changing the secret creates a new keyset, and the PED asks for new M and N values (1 to 16).

1. Connect the PED (local, or remote with `hsm ped connect` and the orange RPV key).
2. For the HSM SO (blue) key, in LunaSH:

   ```bash
   lunash:> hsm login
   lunash:> hsm changepw
   ```

3. For partition roles, in LunaCM:

   ```bash
   lunacm:> slot set -slot <slot_number>
   lunacm:> role login -name <po|co|cu>
   lunacm:> role changepw -name <po|co|cu>
   ```

4. At the PED, present the current keys, then answer **No** when asked to reuse an existing keyset, enter the new M value and N value, set new PED PINs, and write the new keys. Make duplicates when the PED offers.
5. Repeat on every HSM or partition that shares the same secret. Keep at least one copy of the old keyset until every HSM and partition uses the new one.

> **Note:** The red cloning domain cannot be changed on an existing HSM (factory reset needed) or partition (a new partition is needed). The white audit key is changed with `audit changepwd`, and the orange RPV with `hsm ped vector init`.

## Verification

- nShield: `nfkminfo -w` shows the ACS k and n values; `nfkminfo -c` lists card sets and their quorum. Load a key with the new OCS from the application.
- Luna: log in with the new keys (`role login`, `hsm login`) using exactly M keys. Confirm HA and cloning still work across members.
- Update the key custody register and store spares in separate secure locations.

## Rollback

- nShield OCS: until old cards are erased, keys can be recovered back to the old set with `rocs` (use `revert` before `save` to undo a mistaken transfer).
- nShield ACS: the old world stays usable until it is retired. Do not erase old cards until the new world is tested.
- Luna: the old keyset still works on any HSM or partition not yet changed. Do not destroy the old keys until all are changed and tested.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `racs` offers no option to set K or N | By design, `racs` keeps the old K/N | Create a new Security World with `--acs-quorum` and migrate keys |
| `rocs` does not list keys for recovery | World or keys created without recovery | Keys cannot be recovered; plan reissue or new keys |
| `rocs` refuses a softcard target | OCS keys can only go to an OCS | Create an OCS target with `createocs` |
| Clients cannot load keys after the change | Updated `kmdata/local` not copied | Run `rfs-sync --update` on clients |
| Luna login fails after change on one HSM | Other HSMs still use old secret | Use the old keyset there, then change it too |
| PED rejects duplicate keys for M of N | Duplicates of the same split cannot count twice | Present M different keys from the set |

## Related articles

- [How to replace the Administrator Card Set](how-to-replace-the-administrator-card-set.md)
- [Replacing a lost or damaged operator card](replacing-a-lost-or-damaged-operator-card.md)
- [Luna PED keys explained](luna-ped-keys-explained.md)
- [Key recovery and restoration utilities](key-recovery-and-restoration-utilities.md)
- [Key ceremonies explained](../../02-General/HSM/key-ceremonies-explained.md)
- [Entrust nShield Security World concepts](../../02-General/HSM/entrust-nshield-security-world-concepts.md)
