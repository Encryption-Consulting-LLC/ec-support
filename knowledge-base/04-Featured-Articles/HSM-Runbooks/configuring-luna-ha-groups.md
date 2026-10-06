---
title: "Configuring Luna HA Groups"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Thales Luna Network HSM 7 and Luna PCIe HSM 7 with Luna HSM Client (LunaCM)"
summary: "Runbook to build a Thales Luna HA group with LunaCM hagroup commands, covering prerequisites, policies, auto-recovery, HA-only mode and troubleshooting."
keywords: ["Luna HA group", "hagroup creategroup", "hagroup addmember", "haonly", "Luna high availability", "auto recovery", "cloning domain"]
last_reviewed: "2026-10-06"
---

# Configuring Luna HA Groups

This runbook explains how to create a High Availability (HA) group across Thales Luna partitions with LunaCM. An HA group lets applications use several partitions on different HSMs as one virtual slot, with load balancing and failover. It is for HSM administrators and application owners.

## Overview

An HA group is defined on the client, not on the HSM. The Luna HSM Client stores the group in its configuration file (`Chrystoki.conf` on Linux and UNIX, `crystoki.ini` on Windows). The client spreads operations across members and keeps objects in sync by cloning, so all members must share the same cloning domain.

## Applies to

- Luna Network HSM 7 (members reached over NTLS or STC) and Luna PCIe HSM 7.
- Luna PCIe HSM 7 and Luna Network HSM 7 partitions cannot be mixed in one group.

Commands and defaults can change between Luna HSM Client releases. Check the release notes for the installed version.

## Prerequisites

HSM level:

- All HSMs use the same authentication method (all password or all PED).
- HSM policy 7 (Allow Cloning) and policy 16 (Allow Network Replication) set to 1.
- Same firmware and software versions are recommended.
- Time synchronized on all appliances.

Partition level:

- Each member partition on a different HSM.
- All partitions initialized with the same cloning domain (same domain string, or same red PED key).
- Partition policies 0 (Allow private key cloning) and 4 (Allow secret key cloning) set to 1.
- Same partition policies on all members.
- Same Crypto Officer (CO) password or challenge secret on every member.
- PED partitions: policies 22 (Allow activation) and 23 (Allow auto-activation) set to 1, CO activated, same challenge secret.
- All partitions visible in LunaCM (`slot list`).

Client level:

- Administrator rights on the client (LunaCM edits the configuration file).

## Before starting

> **Warning:** When a partition that already holds objects joins a group, LunaCM asks whether to copy or remove them. Choosing remove deletes the objects on that member. Back up every partition before starting.

> **Note:** The primary member's objects are the starting point. Pick the partition that holds the correct, current keys as the primary.

1. Back up all member partitions. See [Backing up a Luna partition](backing-up-a-luna-partition.md).
2. Record serial numbers and slots: `slot list`.
3. Check policies on each member: `partition showpolicies`.
4. Book a change window if applications already use one of the partitions.

## Procedure

### Phase 1: Create the group

1. Create the group with the primary member:

   ```bash
   lunacm:> hagroup creategroup -serialnumber <primary_serial> -label <group_label>
   ```

   Enter the CO password or challenge secret when prompted. If the member has objects, type `copy` to keep and replicate them, `remove` to delete them, or `quit` to stop.

2. Add each other member:

   ```bash
   lunacm:> hagroup addmember -serialnumber <member_serial> -group <group_label>
   ```

3. Synchronize if members hold objects:

   ```bash
   lunacm:> hagroup synchronize -group <group_label>
   ```

### Phase 2: Set recovery and HA-only mode

1. Turn on automatic recovery. The default retry count is 0, which means auto-recovery is off.

   ```bash
   lunacm:> hagroup retry -count -1
   lunacm:> hagroup interval -interval 120
   lunacm:> hagroup recoverymode -mode activeEnhanced
   ```

   `-count -1` retries without limit. The interval range is 60 to 1200 seconds (default 60). `activeEnhanced` also restores sessions and login states; `activeBasic` does not.

2. Turn on HA-only mode so applications see only the virtual HA slot, not the physical slots:

   ```bash
   lunacm:> hagroup haonly -enable
   ```

3. Optional: make a member standby, so it gets replicated keys but no live traffic:

   ```bash
   lunacm:> hagroup addstandby -group <group_label> -serialnumber <member_serial>
   ```

### Phase 3: Point applications at the group

1. Run `slot list` and note the HA virtual slot number.
2. Update application configuration (PKCS#11 slot, label, or KSP registration) to use the HA slot.
3. Restart applications.

## Verification

- `hagroup listgroups` shows the group, every member, and their status.
- `hagroup haonly -show` shows HA-only mode as enabled.
- Create a test object on the HA slot and check that each member's partition holds a copy (`partition contents` on each physical slot).
- Take one member offline in the change window and confirm the application keeps working, then bring it back and confirm it rejoins.

## Rollback

- Remove a member: `hagroup removemember -group <group_label> -serialnumber <member_serial>`.
- Delete the whole group: `hagroup deletegroup -label <group_label>`. Objects stay on the physical partitions.
- Point applications back to a physical slot.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `addmember` fails with a domain or cloning error | Different cloning domain on the member | Recreate the partition with the same domain or red PED key |
| `addmember` fails at login | Different CO password or challenge on the member | Set the same CO credential on all members |
| Failed member never comes back | Auto-recovery off (retry count 0) | Set `hagroup retry -count -1`; run `hagroup recover` |
| Application sees physical slots and HA slot | HA-only mode off | Run `hagroup haonly -enable` |
| Objects missing on a member | Not synchronized | Run `hagroup synchronize -group <group_label>` |
| PED members fail after appliance reboot | Activation or auto-activation not set | Set policies 22 and 23; reactivate the CO |
| Group changes not saved | LunaCM run without admin rights | Rerun LunaCM as administrator or root |

## Related articles

- [Backing up a Luna partition](backing-up-a-luna-partition.md)
- [How HSM partitions work](how-hsm-partitions-work.md)
- [Luna PED keys explained](luna-ped-keys-explained.md)
- [HSM health check and monitoring](hsm-health-check-and-monitoring.md)
- [HSMaaS high availability and backup](../../01-Products/HSM-as-a-Service/hsmaas-high-availability-and-backup.md)
