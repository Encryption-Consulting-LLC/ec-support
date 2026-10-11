---
title: "Updating HSM Firmware"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Entrust nShield Connect XC, nShield 5c, Solo XC, nShield 5s; Thales Luna Network HSM 7 appliance software and firmware; Luna PCIe HSM 7"
summary: "Runbook for updating Entrust nShield and Thales Luna HSM firmware and appliance software, with VSN, rollback, FIPS and Security World restore guidance."
keywords: ["HSM firmware upgrade", "nethsmadmin upgrade-image", "nShield Upgrade system", "hsmadmin upgrade", "lunash package update", "hsm firmware upgrade", "FIPS validated firmware"]
last_reviewed: "2026-10-06"
---

# Updating HSM Firmware

This runbook explains how to update firmware on Entrust nShield and Thales Luna Hardware Security Modules (HSMs). It covers planning, backups, the update commands for each model, verification, and what rollback options exist. It is for HSM administrators and change managers.

## Overview

| Platform | What is updated | Main tool |
|---|---|---|
| nShield Connect XC and nShield 5c | Image file (includes firmware) | Front panel **System > Upgrade system**, `nethsmadmin`, or KeySafe 5 |
| nShield Solo XC | Monitor and firmware | `nfloadmon`, `loadrom` |
| nShield 5s | Firmware package (.npkg) | `hsmadmin upgrade` |
| Luna Network HSM 7 | Appliance software, then HSM firmware | LunaSH `package update`, then `hsm firmware upgrade` |
| Luna PCIe HSM 7 | HSM firmware (.fuf) | LunaCM `hsm updatefw` |

## Applies to

- Entrust nShield Security World releases 12.x and 13.x and later.
- Thales Luna Network HSM 7 and Luna PCIe HSM 7.

Supported upgrade paths, file names, and steps change between releases. Read the release notes for both the current and the target version before starting. Some target versions need an intermediate version first.

## Prerequisites

- The firmware or package files from the vendor support portal, with their checksums or authentication codes.
- Matching client software (nShield Security World software, Luna HSM Client) at a version supported with the target firmware.
- nShield: a working quorum of the Administrator Card Set (ACS). Entrust warns that without it the HSM cannot be restored to the Security World after the upgrade.
- Luna: HSM Security Officer (SO) credential (password or blue PED key and PED).
- An Uninterruptible Power Supply (UPS). Both vendors warn that power loss during an update can damage the HSM.

## Before starting

> **Warning:** Firmware cannot be freely downgraded. nShield firmware carries a Version Security Number (VSN), and an HSM refuses firmware with a lower VSN. Luna allows only one step back to the previous firmware, and that rollback erases all keys.

> **Warning:** Not every firmware version is FIPS validated. If the organization must run FIPS 140-2 or FIPS 140-3 validated firmware, confirm that the exact target version is listed on the NIST Cryptographic Module Validation Program (CMVP) certificate before upgrading. FIPS 140-2 certificates move to the CMVP Historical list on September 21, 2026, so new deployments should target FIPS 140-3 validated versions.

Pre-change checklist:

1. Record the current versions: `enquiry` (nShield) or `hsm show` (Luna).
2. Back up all key material. nShield: back up `kmdata/local` and use `nvram-backup` for any keys or SEE data in NVRAM. Luna: back up every partition to a Backup HSM.
3. Confirm ACS cards and passphrases (nShield) or SO credentials (Luna) are present and tested.
4. For HA deployments, plan a rolling upgrade, one member at a time.
5. Book a change window and stop client applications.
6. Finalize audit logs if audit logging is enabled.
7. Check the system clock.

## Procedure

### Phase 1: nShield Connect XC and nShield 5c

The Security World and key data stay on the Remote File System (RFS), but the HSM must be restored to the Security World after the upgrade.

1. Copy the image file to the RFS:
   - Linux: `/opt/nfast/nethsm-firmware/<version>/`
   - Windows: `%NFAST_HOME%\nethsm-firmware\<version>\`
2. Choose one method:
   - **Front panel:** select **System > Upgrade system**, choose the image directory, and check the image version, HSM version, and VSN before confirming.
   - **Privileged client:**

     ```bash
     nethsmadmin -m <module_id> -s <rfs_ip> -l
     nethsmadmin -m <module_id> -s <rfs_ip> --upgrade-image=nethsm-firmware/<version>/<image_file>.nff
     ```

   - **KeySafe 5:** upload the package under **Hardware Management > Firmware Images**, then install it on the HSM from the HSM's Firmware tab. A dry run is available.
3. Wait for the HSM to reboot and reconnect. Entrust advises allowing about 30 minutes.
4. Restore the HSM to the Security World: front panel **Security World mgmt > Module initialization > Load Security World**, then present the ACS quorum.

### Phase 2: nShield Solo XC

1. Put the HSM in pre-initialization (maintenance) mode and confirm with `enquiry`.
2. Upgrade the monitor and firmware, or firmware only:

   ```bash
   nfloadmon -m<module_id> --automode <monitor_file>.nff <firmware_file>.nff
   loadrom -m<module_id> <firmware_file>.nff
   ```

3. Keep power on the host and HSM until the process ends. Some versions reboot the module more than once.
4. Restore the Security World with `new-world -l -m <module_id>` and the ACS quorum.

### Phase 3: nShield 5s

1. Optionally test first:

   ```bash
   hsmadmin upgrade --dry-run <firmware_file>.npkg
   hsmadmin upgrade <firmware_file>.npkg
   ```

2. Upgrade the Primary firmware first. Test. Upgrade the Recovery firmware in a separate step. Entrust warns never to upgrade both at the same time.
3. Restore the HSM to the Security World, or run `initunit` for a standalone HSM.

> **Note:** `loadmache` is not a firmware tool. It loads a Secure Execution Engine (SEE) machine into an SEE-enabled HSM.

### Phase 4: Luna Network HSM 7

Update the appliance software first, then the HSM firmware.

1. Copy the package to the appliance:

   ```bash
   scp <package>.spkg admin@<appliance_ip>:
   ```

2. Log in to LunaSH as `admin` and install the package:

   ```bash
   lunash:> package verify <package>.spkg -authcode <auth_code>
   lunash:> package update <package>.spkg -authcode <auth_code>
   ```

   Before 7.7.0, reboot with `sysconf appliance reboot`. From 7.7.0 the appliance reboots on its own. Thales states that appliance software cannot be rolled back directly.

3. Update the HSM firmware:

   ```bash
   lunash:> hsm login
   lunash:> hsm firmware show
   lunash:> hsm stc disable
   lunash:> hsm firmware upgrade
   ```

   Run `hsm stc disable` only if Secure Trusted Channel (STC) is used on the HSM admin channel. Older SafeNet Luna SA 5.x and 6.x releases used a different command (`hsm update firmware`). Check the LunaSH command reference for the installed version.

### Phase 5: Luna PCIe HSM 7

1. Copy the `.fuf` firmware file and the `.txt` authentication code file into the Luna HSM Client directory.
2. In LunaCM:

   ```bash
   lunacm:> slot set -slot <slot_number>
   lunacm:> role login -name so
   lunacm:> hsm updatefw -fuf <firmware_file>.fuf -authcode <authcode_file>.txt
   ```

## Verification

- nShield: run `enquiry` and confirm the new version and `mode operational`. Run `nfkminfo -w` and confirm the world is `Usable`. Load a test key.
- Luna: run `hsm show` and confirm the firmware version. Run `partition list` and test client access. In HA, confirm all members show as up with `hagroup listgroups`.
- Update the asset register with new versions and FIPS status.

## Rollback

- nShield: firmware with a lower VSN cannot be loaded. Rollback means restoring an equal or higher VSN image supported by Entrust. Plan forward fixes instead.
- Luna firmware: `hsm firmware rollback` returns only to the immediately previous version. Thales states it zeroizes the HSM and erases all objects, and it is not supported on HSMs that ever enabled HSM policy 50 (Functionality Modules). Restore keys from backup afterward.
- Luna appliance software: no direct rollback. Contact Thales support.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| nShield refuses the image | Lower VSN than installed | Use an image with equal or higher VSN |
| Connect does not list the image | File not in `nethsm-firmware` on the RFS | Copy the file to the right folder; rerun `nethsmadmin -l` |
| HSM works but keys are not usable after upgrade | HSM not restored to the Security World | Load the Security World with the ACS quorum |
| Upgrade stopped by power loss | Power cut during update | Restore power and restart the command; contact vendor if the HSM fails |
| Luna `package update` fails verification | Wrong authentication code or corrupt file | Recopy the file; check the code from the portal |
| Appliance unreachable after 7.7.0 update | Routing changes in new software | Use serial console; remove duplicate default routes |
| `hsm firmware rollback` refused | Functionality Modules policy was enabled | Rollback not possible; restore forward |

## Related articles

- [HSM health check and monitoring](hsm-health-check-and-monitoring.md)
- [Backing up a Luna partition](backing-up-a-luna-partition.md)
- [Key recovery and restoration utilities](key-recovery-and-restoration-utilities.md)
- [FIPS 140-3 security levels explained](../../02-General/HSM/fips-140-3-security-levels-explained.md)
- [Maintenance windows and release notes policy](../../00-Working-with-EC-Support/maintenance-windows-and-release-notes-policy.md)
