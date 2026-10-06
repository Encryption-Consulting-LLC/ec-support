---
title: "Luna PED Keys Explained"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Reference"
applies_to: "Thales Luna Network HSM 7, Luna PCIe HSM 7, and Luna Backup HSM with multifactor (PED) authentication"
summary: "Reference for Thales Luna PED keys: blue SO, red domain, black CO, gray CU, orange RPV and white audit keys, M of N splits, PINs and safe handling."
keywords: ["Luna PED keys", "blue PED key", "red domain key", "black PED key", "orange RPV", "white audit key", "M of N"]
last_reviewed: "2026-10-06"
---

# Luna PED Keys Explained

This article explains the PIN Entry Device (PED) keys used by Thales Luna Hardware Security Modules (HSMs) with multifactor authentication. It covers each key color, what it unlocks, M of N splits, and how to handle and store the keys. It is for HSM administrators, key custodians, and auditors.

## Overview

On a password-authenticated Luna HSM, roles log in with a password. On a multifactor (PED) authenticated Luna HSM, each role's secret is stored on a small USB token called a PED key (iKey). The secret is written and read through a Luna PED, a trusted keypad device, so the secret never passes through the host computer keyboard.

The PED connects to the HSM directly (local PED) or over the network through PEDserver (remote PED).

## Applies to

- Luna Network HSM 7, Luna PCIe HSM 7, and Luna Backup HSM in multifactor (PED) mode.
- The authentication method is chosen at HSM initialization. Behavior can differ by firmware and PED firmware version, so check the release notes for the installed version.

## PED key colors and roles

| Color | Role or secret | What it allows | Required? |
|---|---|---|---|
| Blue | HSM Security Officer (SO) and Partition SO | HSM and partition administration, policies, partition creation | Yes |
| Red | Cloning domain (HSM or partition) | Cloning, backup, restore and High Availability (HA) between HSMs that share the domain | Yes |
| Black | Crypto Officer (CO) | Read and write use of partition objects: create, use and delete keys | Yes |
| Gray | Crypto User (CU) | Read-only use of partition objects (sign, decrypt) | Optional |
| Orange | Remote PED Vector (RPV) | Authorizes a remote PED connection through PEDserver | Optional (needed for remote PED) |
| White | Auditor | Manages audit logging only, separate from all other roles | Optional |

> **Note:** Keys are labeled by color by convention. The secret, not the color of the plastic, decides what the key unlocks. Always label each key with role, HSM or partition, set number, and copy number.

## PED PINs

When a key is created, the PED can also set a PED PIN of 4 to 48 digits. The PIN adds a second factor: something held (the key) and something known (the PIN). Thales warns that forgetting a PED PIN is the same as losing the key. The PIN can only be changed by changing the secret.

## M of N split secrets

A role secret can be split across N keys so that any M of them are needed to log in. N can be up to 16.

- Example: 3 of 5 means any three custodians out of five must be present.
- M equal to N is not recommended, because one missing key holder blocks the role.
- Duplicates of the same split key cannot be used twice in one login to meet M. Present M different keys.
- Each split key can have its own PED PIN, held by its own custodian.

To change M or N later, change the role secret and choose new values when the PED asks. See [How to update the quorum in an HSM](how-to-update-the-quorum-in-an-hsm.md).

## Shared and reused secrets

The PED can write a new secret or reuse an existing keyset. Reusing a keyset lets one secret work on several HSMs or partitions. This is common for:

- Red domain keys, which must match on every member of an HA group and on the Backup HSM.
- Blue SO keys, when one team manages a fleet of HSMs.

Reuse makes management simpler but means one lost key affects more systems. Record which HSMs and partitions share each secret.

## Common tasks

### Duplicate a PED key

Have the key to copy and a blank or rewritable key ready. On the PED, in Admin mode, press **1** to log in to the key, then press **7** and follow the prompts. Duplicates can also be made when a secret is first created.

### Connect a remote PED

On the client computer that holds the PED, start PEDserver. Then, in LunaSH:

```bash
lunash:> hsm ped connect -ip <pedserver_ip> -port <pedserver_port>
lunash:> hsm ped show
```

The default PEDserver port is 1503.

The first remote connection needs the orange RPV key. The RPV is created or changed with:

```bash
lunash:> hsm login
lunash:> hsm ped vector init
```

### Change a role secret

| Role | Tool | Commands |
|---|---|---|
| HSM SO (blue) | LunaSH | `hsm login`, then `hsm changepw` |
| Partition SO (blue) | LunaCM | `role login -name po`, then `role changepw -name po` |
| Crypto Officer (black) | LunaCM | `role login -name co`, then `role changepw -name co` |
| Crypto User (gray) | LunaCM | `role login -name cu`, then `role changepw -name cu` |
| Auditor (white) | LunaSH | `audit login`, then `audit changepwd` |
| RPV (orange) | LunaSH | `hsm login`, then `hsm ped vector init` |
| Domain (red) | Not possible | HSM needs factory reset; partition must be recreated |

## Safe handling and storage

1. Keep at least two copies (or two full M of N sets) of every role key, stored in different secure locations, such as two safes in two buildings.
2. Keep a key inventory log: key label, role, secret, holder, location, and date of each check-out.
3. Store keys in tamper-evident bags. Record bag numbers in the log.
4. Keep keys away from heat, humidity, dust and vibration. Use the key cap to protect the USB connector.
5. Test spare keys at least once a year in a change window.
6. When a holder leaves, change the secret, do not just hand over the key.
7. Keep at least one copy of an old keyset until every HSM and partition is moved to the new secret.

> **Warning:** If every copy of the HSM SO blue key (or its M of N quorum) is lost, the HSM cannot be administered and must be factory reset, which destroys all partitions and keys. If every red domain key is lost, new backups and new HA members cannot join the domain.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| PED reports wrong key or invalid key | Key holds a different secret or role | Check labels; use the key that matches the HSM or partition |
| Login fails after M keys | A duplicate was presented twice | Present M different split keys |
| Remote PED will not connect | PEDserver not running, port blocked, or wrong RPV | Check PEDserver, firewall, and orange key; run `hsm ped show` |
| Cloning or HA sync fails | Red domain differs between members | Partitions must be created with the same red domain key |
| Remote PED times out during a long M of N ceremony | Remote PED operation timeout reached | Stage custodians and keys in advance; check `hsm ped timeout show`. Thales notes a fixed 600-second limit in releases 7.7.0 to 7.9.0 |
| Role locked after bad attempts | Too many failed logins | Follow vendor reset steps; partition SO can reset CO only if HSM policy 15 allows |

## Related articles

- [How to update the quorum in an HSM](how-to-update-the-quorum-in-an-hsm.md)
- [How HSM partitions work](how-hsm-partitions-work.md)
- [Configuring Luna HA groups](configuring-luna-ha-groups.md)
- [Backing up a Luna partition](backing-up-a-luna-partition.md)
- [Thales Luna HSM concepts](../../02-General/HSM/thales-luna-hsm-concepts.md)
- [Key ceremonies explained](../../02-General/HSM/key-ceremonies-explained.md)
