---
title: "Backing Up a Luna Partition"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Thales Luna Network HSM 7 and Luna PCIe HSM 7 with Luna Backup HSM 7 or Luna Backup HSM G5, Luna HSM Client 10.x"
summary: "Runbook to back up and test-restore a Thales Luna partition to a Luna Backup HSM with LunaCM partition archive commands, with V0 and V1 partition notes."
keywords: ["Luna partition backup", "partition archive backup", "partition archive restore", "Luna Backup HSM", "cloning domain", "V1 partition SMK"]
last_reviewed: "2026-10-06"
---

# Backing Up a Luna Partition

This runbook explains how to back up a Thales Luna application partition to a Luna Backup HSM, and how to prove the backup works with a test restore. It is for HSM administrators and key custodians responsible for disaster recovery.

## Overview

A Luna backup copies partition objects, by secure cloning, into a backup partition on a Luna Backup HSM. Objects never leave Luna hardware in plain form. Because cloning is used, the source partition and the backup partition must share the same cloning domain.

Supported backup targets for Luna Network HSM 7 include:

| Target | Notes |
|---|---|
| Luna Backup HSM 7 | Current dedicated backup device. Version 1 needs Luna HSM Client 10.1.0 or later; version 2 needs 10.4.0 or later |
| Luna Backup HSM G5 | Older backup device |
| Another Luna 7 partition | Partition-to-partition cloning |
| Remote Backup Service (RBS) | Backup HSM at a remote site, reached over the network |

This runbook uses a Backup HSM connected by USB to a Luna HSM Client computer. A Backup HSM can also be connected directly to a Luna Network HSM appliance and driven from LunaSH. Older SafeNet Luna SA 5.x and 6.x releases used a LunaSH `partition backup` command. Syntax differs by release, so check the LunaSH command reference for the installed version before using the appliance-connected method.

## Applies to

- Luna Network HSM 7 and Luna PCIe HSM 7.
- Luna Backup HSM 7 and Luna Backup HSM G5. Thales lists Backup HSM 7 firmware 7.7.1 or Backup HSM G5 firmware 6.28.0 for V0 and V1 partition backups.

Check the release notes and version dependency tables for the installed client and firmware.

## Prerequisites

- Luna HSM Client installed with the Backup and USB options.
- The Backup HSM initialized, with its HSM Security Officer (SO) credential.
- The source partition Crypto Officer (CO) credential.
- The source partition cloning domain (domain string or red PED key).
- PED-authenticated HSMs: a PED, the black CO key, blue SO key for the Backup HSM, and red domain key. For remote PED, the orange Remote PED Vector (RPV) key.
- Partition policies that allow cloning: policy 0 (private keys) and policy 4 (secret keys) on V0 partitions.

## Before starting

> **Warning:** A backup that has never been restored is not a proven backup. Thales recommends testing recovery every six months.

> **Warning:** Store at least two backup copies, with one off site. Store the Backup HSM and its credentials apart from the production HSM credentials.

> **Note:** On V1 partitions (Scalable Key Storage), only the SKS Master Key (SMK) is cloned during backup. Key objects stay in the external SKS database, so that database must also be backed up.

Pre-change checklist:

1. List source partition contents: `partition contents` and record the object count.
2. Confirm policies with `partition showpolicies`.
3. Confirm credentials and PED keys are present and tested.
4. Decide between `-append` (add new objects to an existing backup) and `-replace` (replace the whole backup).
5. Pick a backup partition name that shows source and date, for example `contoso-ca-01-20261006`.

## Procedure

### Phase 1: Connect the Backup HSM

1. Connect the Backup HSM to the client by USB and power it on.
2. In LunaCM, list slots and note the Backup HSM slot:

   ```bash
   lunacm:> slot list
   ```

### Phase 2: Run the backup

1. Select the source partition and log in as CO:

   ```bash
   lunacm:> slot set -slot <source_slot>
   lunacm:> role login -name co
   ```

2. Run the backup to the Backup HSM:

   ```bash
   lunacm:> partition archive backup -slot <backup_slot> -partition <backup_partition_name>
   ```

   - On the first backup, the backup partition is created. Provide the Backup HSM SO credential (`-sopassword`, or blue PED key) and the domain (`-domain <domain>`, or red PED key).
   - Add `-append` to add new objects to an existing backup partition, or `-replace` to replace it.
   - Add `-objects <handles>` to back up selected objects only.
   - On V1 partitions, add `-smkonly` to back up only the SMK.

3. Confirm the command ends with `Command Result : No Error` and note the number of objects cloned.

### Phase 3: Record and store

1. Record the date, source partition, backup partition name, object count, and operators in the backup log.
2. Disconnect the Backup HSM and store it in a secure location. Store the PED keys or passwords separately.

### Phase 4: Test the restore

Restore to a test partition in the same cloning domain, never to production unless required:

```bash
lunacm:> slot set -slot <test_partition_slot>
lunacm:> role login -name co
lunacm:> partition archive restore -slot <backup_slot> -partition <backup_partition_name>
```

Then run `partition contents` and compare the object count. Test a sign or decrypt with a restored key.

## Verification

- The backup command reports no error and the expected object count.
- The test restore lists the same objects as the source.
- An application can use a restored key on the test partition.
- The backup log is updated and signed.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Backup HSM not in `slot list` | Client installed without Backup or USB options, or driver issue | Reinstall Luna HSM Client with Backup and USB options; reconnect device |
| Backup fails with a domain error | Backup partition created with a different domain | Use the correct domain or red key; create a new backup partition |
| Some objects not backed up | Policy 0 or 4 is off, or objects are non-extractable by policy | Check `partition showpolicies`; adjust policy only if approved |
| Only the SMK is backed up | V1 partition (SKS) | Expected; back up the SKS database as well |
| Restore finds objects that already exist | Same objects on target | Restore to an empty test partition, or select objects with `-objects` |
| Backup HSM firmware not supported | Old Backup HSM firmware | Update Backup HSM firmware per vendor release notes |

## Related articles

- [Key recovery and restoration utilities](key-recovery-and-restoration-utilities.md)
- [Configuring Luna HA groups](configuring-luna-ha-groups.md)
- [How HSM partitions work](how-hsm-partitions-work.md)
- [Luna PED keys explained](luna-ped-keys-explained.md)
- [HSMaaS high availability and backup](../../01-Products/HSM-as-a-Service/hsmaas-high-availability-and-backup.md)
