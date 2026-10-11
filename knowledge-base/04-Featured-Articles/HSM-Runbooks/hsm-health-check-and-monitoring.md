---
title: "HSM Health Check and Monitoring"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Entrust nShield Solo XC, Connect XC, nShield 5s, nShield 5c; Thales Luna Network HSM 7 and Luna PCIe HSM 7"
summary: "Routine health check for Entrust nShield and Thales Luna HSMs: status commands, logs, HA checks, credential and backup checks, and what to alert on."
keywords: ["HSM health check", "enquiry", "nfkminfo", "nfdiag", "lunash hsm show", "status sensors", "syslog tail", "HSM monitoring"]
last_reviewed: "2026-10-06"
---

# HSM Health Check and Monitoring

This runbook gives a repeatable health check for Entrust nShield and Thales Luna Hardware Security Modules (HSMs), and lists what to monitor between checks. It is for HSM administrators, operations teams, and anyone preparing a support case.

## Overview

A health check looks at five areas:

| Area | Question |
|---|---|
| Hardware | Is the HSM up, not tampered, and within temperature and fan limits? |
| Software | Are firmware and client versions supported and expected? |
| Trust domain | Is the Security World or partition usable and in sync? |
| Credentials | Are cards, PED keys, and spares present and working? |
| Recovery | Is there a recent, tested backup? |

Run the quick checks weekly, and the full check monthly or quarterly, as the organization's policy requires.

## Applies to

- nShield Security World software 12.x, 13.x, and later.
- Luna Network HSM 7 appliance (LunaSH) and Luna HSM Client (LunaCM).

Output fields can differ between releases. Check the vendor documentation for the installed version.

## Prerequisites

- nShield: a client with Security World software; membership of the nShield admin group (Windows) or root or `nfast` group (Linux).
- Luna: SSH access to LunaSH as `admin`, `operator`, or `monitor`; LunaCM on a client.
- A health check record template.

## Before starting

> **Note:** Read-only checks are safe during business hours. Do not run self-tests, reboots, or log clears outside a change window.

1. Open the previous health check record to compare results.
2. Confirm access to the HSM and clients.

## Procedure

### Phase 1: nShield checks

1. **Module status.**

   ```bash
   enquiry
   ```

   Check for each module: `mode operational`, expected `version`, expected `serial number`, `hardware status OK`. For network HSMs, check `connection status`.

2. **Security World status.**

   ```bash
   nfkminfo -w
   nfkminfo -c
   ```

   Check that the world shows `Initialised` and `Usable`, and that the expected card sets and quorums are listed.

3. **Statistics.** Run `stattree` to view module and hardserver counters, such as command counts and errors.

4. **Logs.** Review the hardserver log for errors:
   - Linux: `/opt/nfast/log/logfile`
   - Windows: `%NFAST_HOME%\log\logfile`

5. **RFS sync.** On cooperating clients, run `rfs-sync --show` and confirm the RFS address is correct.

6. **Network HSM front panel.** Check for warnings or alerts on the display.

### Phase 2: Luna checks

1. **HSM status.**

   ```bash
   lunash:> hsm show
   ```

   Check firmware version, serial number, authentication method, partition count, and that the HSM is not in a zeroized or tamper state.

2. **Appliance health.**

   ```bash
   lunash:> status sensors
   lunash:> status sysstat show
   lunash:> hsm tamper show
   lunash:> status disk
   lunash:> status time
   ```

   Check temperatures, fans, power supplies, tamper state, disk space, and time.

3. **Network Trust Link Service (NTLS).**

   ```bash
   lunash:> ntls information show
   ```

   Check that operational status is up and that failed client connections are not rising.

4. **Logs.**

   ```bash
   lunash:> syslog tail -logname messages -entries 100
   lunash:> syslog tail -logname lunalogs -search ALM
   ```

   `ALM` finds HSM alarm messages.

5. **Client and HA.** On a client:

   ```bash
   lunacm:> slot list
   lunacm:> hagroup listgroups
   ```

   Check that every partition and HA member is present and that HA members are in sync.

### Phase 3: Credential and recovery checks

1. Confirm the inventory of nShield ACS and OCS cards, or Luna PED keys, against the custody log.
2. Confirm spare cards or duplicate keys are in their secure locations (tamper-evident bag numbers match).
3. Confirm the date of the last backup (nShield `kmdata/local`, Luna Backup HSM) and the last successful test restore.
4. Check firmware and client versions against vendor support status and the FIPS validation needed.

### Phase 4: Record and follow up

Record results, deviations, and actions. Open a support case for any hardware alarm, tamper event, or unexpected state.

## What to monitor continuously

| Signal | nShield source | Luna source | Alert when |
|---|---|---|---|
| Module up and operational | `enquiry`, application errors | `hsm show`, NTLS status | Not operational or unreachable |
| Hardware sensors | Front panel, logs | `status sensors`, Simple Network Management Protocol (SNMP) | Out of range fan, temperature, power |
| Tamper | Logs, front panel | `hsm tamper show`, syslog | Any tamper event |
| HA status | Application and client logs | `hagroup listgroups`, HA log | Member down or out of sync |
| Errors | Hardserver log | syslog `messages`, `lunalogs` | Repeated errors or failed logins |
| Certificates | Client and HSM certificates | NTLS server certificate | Within 60 days of expiry |
| Capacity | Key count, NVRAM | Partition object count, license limits | Near limits |

Forward syslog (Luna) and hardserver logs (nShield) to a central log platform where possible.

## Collecting diagnostics for support

- nShield: run `nfdiag` and attach `nfdiag.zip`. It does not capture passphrases.
- Luna: run `hsm supportinfo` in LunaSH and attach the support info file.

See [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `enquiry` shows `mode pre-initialisation` | HSM left in maintenance mode | Switch to operational mode and restart hardserver |
| `enquiry` shows module failed or unreachable | Network or hardserver issue | Check network on port 9004; restart hardserver |
| `nfkminfo -w` shows `!Usable` | No HSM in the world is available | Check modules; reload Security World if HSM was replaced |
| Luna `status sensors` shows fan or PSU fault | Hardware fault | Open a vendor case; plan failover |
| NTLS failed connections rising | Client certificate or network issues | Check client registration and certificates |
| HA member missing | Member down, auto-recovery off | Check member; run `hagroup recover`; set retry count |
| Clock drift | NTP not configured | Configure NTP; check `status time` |

## Related articles

- [Updating HSM firmware](updating-hsm-firmware.md)
- [Configuring Luna HA groups](configuring-luna-ha-groups.md)
- [Enrolling a client with an nShield Connect](enrolling-a-client-with-an-nshield-connect.md)
- [Backing up a Luna partition](backing-up-a-luna-partition.md)
- [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
