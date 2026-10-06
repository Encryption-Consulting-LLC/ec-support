---
title: "HSMaaS High Availability and Backup"
category: "Products"
section: "HSM-as-a-Service"
article_type: "Runbook"
applies_to: "Encryption Consulting HSMaaS; Thales Luna Network HSM 7 and Luna Cloud HSM; Entrust nShield Connect; AWS CloudHSM; Azure Managed HSM"
summary: "How high availability and backup work in HSMaaS for Luna HA groups, nShield load sharing, AWS CloudHSM clusters, and Azure Managed HSM, with checks and fixes."
keywords: ["HSM high availability", "Luna HA group", "nShield load sharing", "CloudHSM backup", "Managed HSM backup"]
last_reviewed: "2026-10-06"
---

# HSMaaS High Availability and Backup

This runbook explains how Encryption Consulting (EC) HSM-as-a-Service (HSMaaS) keeps keys available and recoverable. It covers High Availability (HA) and backup for each supported Hardware Security Module (HSM) platform, and the client-side steps the customer performs. It is for application owners and HSM administrators.

## Overview

HA keeps applications running when one HSM fails. Backup lets keys be restored after a disaster or a mistaken delete. In HSMaaS, EC designs and runs both on the HSM side. The customer points applications at the HA endpoint and agrees backup retention.

| Platform | HA method | Backup method |
|---|---|---|
| Thales Luna Network HSM 7 | HA group across partitions on two or more appliances | Partition backup to a Luna Backup HSM or backup partition |
| Thales Luna Cloud HSM | HA group across Cloud HSM partitions | Backup to a Luna Backup HSM or another partition |
| Entrust nShield | Several modules in one Security World, load sharing | Encrypted Security World and key files, plus card sets |
| AWS CloudHSM | Cluster of HSMs in two or more Availability Zones (AZs) | Automatic encrypted cluster backups |
| Azure Managed HSM | Built-in multi-partition HA in the region; optional multi-region replication | Full backup to Azure Storage; restore needs the security domain |

## Applies to

All HSMaaS subscriptions with HA or backup in scope. Recovery targets: {{TBD: HSMaaS RTO and RPO targets}}. Backup retention: {{TBD: HSMaaS default backup retention}}.

## Prerequisites

- Client connected to every HSM in the HA design. See [Onboarding to HSMaaS](onboarding-to-hsmaas.md).
- Partition or user credentials for the customer role.
- A change window for HA reconfiguration.

## Before starting

> **Warning:** A misconfigured HA group can make applications write keys to only one member. Always run a synchronize and a failover test after any change.

- Agree with EC which side runs each step. HSM-side changes are EC tasks. Client-side changes are customer tasks.
- Take a fresh backup before changing HA membership.
- Record current slot numbers and labels.

## Procedure

### Part A: Thales Luna HA group (client side)

1. Open lunacm and confirm each member partition appears as a slot:

```text
lunacm:> slot list
```

2. Create the HA group from the first member and add the second:

```text
lunacm:> hagroup creategroup -label <ha_group_label> -slot <slot_1>
lunacm:> hagroup addmember -group <ha_group_label> -slot <slot_2>
```

3. Turn on HA-only mode so applications see only the virtual HA slot, and set recovery:

```text
lunacm:> hagroup haonly -enable
lunacm:> hagroup recoveryMode -mode activeEnhanced
```

4. Synchronize members and list status:

```text
lunacm:> hagroup synchronize -group <ha_group_label>
lunacm:> hagroup listgroups
```

5. Point applications at the HA virtual slot (or use its label).

HA settings are written to `Chrystoki.conf` (Linux) or `crystoki.ini` (Windows) in the `VirtualToken` and `HASynchronize` sections. See [Configuring Luna HA groups](../../04-Featured-Articles/HSM-Runbooks/configuring-luna-ha-groups.md).

### Part B: Thales Luna backup (EC side)

EC backs up partitions to a Luna Backup HSM or backup partition, for example:

```text
lunacm:> partition archive backup -slot <source_slot> -partition <backup_partition_label>
```

Backups are encrypted under the partition domain and can only be restored to a partition with the same domain. See [Backing up a Luna partition](../../04-Featured-Articles/HSM-Runbooks/backing-up-a-luna-partition.md).

### Part C: Entrust nShield

1. EC enrolls two or more nShield Connects into the same Security World.
2. Each client enrolls every Connect with `nethsmenroll` and runs `rfs-sync --update`.
3. For PKCS#11 apps, set load sharing in `/opt/nfast/cknfastrc`:

```text
CKNFAST_LOADSHARING=1
```

4. Keys are stored as encrypted files in `%NFAST_KMDATA%\local` (Windows) or `/opt/nfast/kmdata/local` (Linux). EC backs up these files and the Remote File System (RFS). The files are useless without the Security World and the right card sets, so card set custody is part of backup.

### Part D: AWS CloudHSM

1. EC keeps at least two HSMs in different AZs in the cluster.
2. The client SDK balances load and fails over across cluster HSMs on its own.
3. AWS takes an automatic cluster backup at least once every 24 hours. Retention is set by a backup retention policy on the cluster. Backups can be copied to another AWS Region for disaster recovery.

### Part E: Azure Managed HSM

1. HA within the region is built in.
2. EC can add a secondary region with multi-region replication.
3. EC runs full backups to an Azure Storage container:

```bash
az keyvault backup start --hsm-name <hsm_name> --storage-account-name <account> --blob-container-name <container> --storage-container-SAS-token <sas_token>
```

4. A restore to a new Managed HSM needs the security domain file and a quorum of its wrapping keys. Keep these safe and separate from backups.

## Verification

- **Luna:** `hagroup listgroups` shows all members "alive" and in sync. Unplug or disable one member in a test window; the application keeps working.
- **nShield:** `enquiry` shows every module "operational". `nfkminfo` lists all modules in the Security World.
- **CloudHSM:** the AWS console or `aws cloudhsmv2 describe-clusters` shows two or more HSMs in "ACTIVE" state in different AZs, and recent backups in `aws cloudhsmv2 describe-backups`.
- **Managed HSM:** `az keyvault backup start` returns a job that ends in "Succeeded".
- EC runs restore tests on a schedule: {{TBD: HSMaaS restore test frequency}}.

## Rollback

- **Luna:** remove a bad member with `hagroup removemember -group <ha_group_label> -slot <slot>`, or disable HA-only mode with `hagroup haonly -disable` to use member slots directly.
- **nShield:** remove a Connect from a client with `nethsmenroll --remove <Connect_IP>`.
- For cloud platforms, open a support case. EC reverts cluster or replication changes.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Luna: key exists on one member only | Synchronize not run, or member was down | Run `hagroup synchronize` |
| Luna: HA slot missing after reboot | HA-only setting lost or member unreachable | Check NTLS to each member; rerun `hagroup haonly -enable` |
| nShield: "key not found" after failover | Load sharing off or client not enrolled to all modules | Set `CKNFAST_LOADSHARING=1`; enroll all Connects |
| CloudHSM: errors in one AZ | Only one HSM in cluster | Ask EC to add an HSM in a second AZ |
| Managed HSM: restore fails | Wrong or incomplete security domain quorum | Provide the required number of wrapping keys |

## Related articles

- [HSM-as-a-Service overview](hsm-as-a-service-overview.md)
- [Connecting applications to HSMaaS: PKCS#11, CNG, and JCE](connecting-applications-to-hsmaas-pkcs11-cng-jce.md)
- [Configuring Luna HA groups](../../04-Featured-Articles/HSM-Runbooks/configuring-luna-ha-groups.md)
- [Key recovery and restoration utilities](../../04-Featured-Articles/HSM-Runbooks/key-recovery-and-restoration-utilities.md)
- [HSM health check and monitoring](../../04-Featured-Articles/HSM-Runbooks/hsm-health-check-and-monitoring.md)
