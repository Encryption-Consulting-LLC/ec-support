---
title: "Collecting HSM and PKI Diagnostics for Support"
category: "Working with EC Support"
section: "Diagnostics"
article_type: "How-to"
applies_to: "Entrust nShield (Solo, Connect, 5c, 5s), Thales Luna Network HSM 7 and Luna Client, Microsoft AD CS on Windows Server"
summary: "Commands to collect Entrust nShield, Thales Luna HSM, and Microsoft AD CS diagnostics (nfdiag, enquiry, lunacm, lunash, certutil) for an EC support case."
keywords: ["nfdiag", "nShield enquiry nfkminfo", "lunash hsm supportInfo", "certutil -getreg CA", "AD CS diagnostics"]
last_reviewed: "2026-10-06"
---

# Collecting HSM and PKI Diagnostics for Support

This article lists the commands Encryption Consulting (EC) support engineers most often ask for when a case involves a Hardware Security Module (HSM) or a Microsoft Active Directory Certificate Services (AD CS) certificate authority (CA). It covers Entrust nShield, Thales Luna, and AD CS. It is for HSM and PKI administrators.

## Overview

| Platform | Main tools | Main output |
|---|---|---|
| Entrust nShield | `enquiry`, `nfkminfo`, `nfdiag`, hardserver log | Module state, Security World state, diagnostic .zip |
| Thales Luna client | `lunacm` | Slots, HSM and partition details |
| Thales Luna Network HSM appliance | `lunash` | Appliance status, syslog, supportInfo file |
| Microsoft AD CS | `certutil`, `pkiview.msc`, Event Viewer | CA configuration, CA health, revocation checks, CA events |

## Applies to

- Entrust nShield Security World software on Windows and Linux clients, with nShield Solo, Connect, 5c, or 5s modules.
- Thales Luna Client (lunacm) and Luna Network HSM 7 appliances (lunash).
- AD CS on Windows Server 2016, 2019, 2022, and 2025.

Exact options can differ between releases. Verify against the vendor documentation for the installed version.

## Prerequisites

- nShield: membership of the nShield administrators group on Windows, or root or the `nfast` group on Linux.
- Luna client: local administrator or root on the client. Partition role login is **not** needed for the commands below.
- Luna appliance: an SSH login as `admin` (or a role with read access) to lunash.
- AD CS: local administrator on the CA server, or at least read access to the CA configuration.

## Before starting

> **Warning:** Never send private keys, key blobs from the Key Management Data folder, smartcards or their passphrases, Administrator Card Set (ACS) or Operator Card Set (OCS) details, Luna partition passwords, crypto officer PINs, PIN Entry Device (PED) keys or PED PINs, CA backup files (.p12 or .pfx), or CA database backups. The commands below do not need any of these.

- Run diagnostics as soon as possible after the problem, before restarts clear useful state.
- Note the time and time zone of the failure.
- Save every output to a text file named with the case number.

## Procedure

### Part 1: Entrust nShield

All tools are in `/opt/nfast/bin` on Linux and `%NFAST_HOME%\bin` on Windows (usually `C:\Program Files\nCipher\nfast\bin`).

1. Check module and hardserver state:

```bash
/opt/nfast/bin/enquiry > enquiry.txt
```

```cmd
"%NFAST_HOME%\bin\enquiry" > enquiry.txt
```

Look at the `mode` line for each module. It should be `operational`. Note the firmware version and serial number.

2. Check the Security World and card state:

```bash
/opt/nfast/bin/nfkminfo > nfkminfo.txt
```

The `state` line shows whether the world is `Initialised` and `Usable`. The output lists the world settings and module state, but no secrets.

3. Run the full diagnostic collector:

```bash
/opt/nfast/bin/nfdiag
```

```cmd
"%NFAST_HOME%\bin\nfdiag"
```

`nfdiag` creates a file named `nfdiag.zip` (use `-f <file-name>` to set another name). It gathers system details, module information, and logs. Entrust documents that it does not capture passphrases. Entrust also notes it is normally run only when support asks for it.

4. Collect the hardserver log, if not already in the nfdiag output:

| Platform | Default log location |
|---|---|
| Linux | `/opt/nfast/log/hardserver.log` |
| Windows | `%NFAST_LOGDIR%`, usually `C:\ProgramData\nCipher\Log Files\hardserver.log` |

If the `NFAST_LOGDIR` environment variable is set, the log is in that folder instead.

5. For nShield Connect network modules, also note the Remote File System (RFS) host name and the client's enrollment status. EC may ask for the output of `nethsmenroll` tests in a later step.

### Part 2: Thales Luna client (lunacm)

1. Start lunacm:

```bash
/usr/safenet/lunaclient/bin/lunacm
```

```cmd
"C:\Program Files\SafeNet\LunaClient\lunacm.exe"
```

2. Run these commands and copy the output to a text file:

```text
lunacm:> slot list
lunacm:> hsm show
lunacm:> partition show
lunacm:> clientconfig listservers
lunacm:> hagroup listgroups
```

- `slot list` shows every slot the client can see, including HA virtual slots.
- `hsm show` shows the HSM model, firmware, and serial number for the current slot.
- `partition show` shows partition settings and object counts. Use `slot set -slot <slot-number>` first to choose a slot.
- `hagroup listgroups` is needed only when high availability (HA) is configured.

3. Attach the client configuration file, after checking it for secrets:

| Platform | File |
|---|---|
| Linux | `/etc/Chrystoki.conf` |
| Windows | `C:\Program Files\SafeNet\LunaClient\crystoki.ini` |

### Part 3: Thales Luna Network HSM appliance (lunash)

1. Connect over SSH:

```bash
ssh admin@<luna-appliance-host>
```

2. Run these commands:

```text
lunash:> hsm show
lunash:> status sysstat show
lunash:> status interface
lunash:> syslog tail -logname messages -entries 200
```

To search the log, add a filter, for example `syslog tail -logname messages -entries 2000 -search ALM` for alarms.

3. Generate the support information file:

```text
lunash:> hsm supportInfo
```

This creates `supportInfo.txt` on the appliance. Retrieve it from a client machine:

```bash
scp admin@<luna-appliance-host>:supportInfo.txt .
```

On Windows, use `pscp.exe` from the Luna Client folder with the same syntax.

4. If EC asks for full logs, create a log archive and copy it the same way:

```text
lunash:> syslog tarlogs
```

```bash
scp admin@<luna-appliance-host>:logs.tgz .
```

### Part 4: Microsoft AD CS

Run these in an elevated Command Prompt on the CA server:

```cmd
certutil -v -getreg CA > ca-registry.txt
certutil -CAInfo > ca-info.txt
certutil -getreg CA\CRLPublicationURLs > crl-urls.txt
certutil -getreg CA\CACertPublicationURLs > aia-urls.txt
certutil -getreg CA\CSP > ca-csp.txt
certutil -catemplates > ca-templates.txt
certutil -ping > ca-ping.txt
```

Check a failing certificate's chain and revocation, including every Certificate Revocation List (CRL), Authority Information Access (AIA), and Online Certificate Status Protocol (OCSP) URL:

```cmd
certutil -verify -urlfetch <certificate-file.cer> > verify-urlfetch.txt
```

Check the whole PKI with Enterprise PKI:

1. Run `pkiview.msc`.
2. Look for any CA, CRL, or AIA location marked **Error** or **Expiring**.
3. Take a screenshot of the results pane for each CA.

Export CA events from Event Viewer (Application log, source **CertificationAuthority**):

```powershell
Get-WinEvent -FilterHashtable @{LogName='Application'; ProviderName='Microsoft-Windows-CertificationAuthority'} -MaxEvents 500 |
  Select-Object TimeCreated, Id, LevelDisplayName, Message |
  Export-Csv -Path .\ca-events.csv -NoTypeInformation
```

If the CA key is in an HSM, also collect the nShield or Luna outputs from Part 1 or Part 2 from the CA server.

## Verification

- Each output file is complete and covers the failure time.
- `enquiry`, `hsm show`, and `certutil -CAInfo` ran without access errors.
- Files have been checked for secrets before upload.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `enquiry` shows the hardserver is not running | nShield hardserver service stopped | Start the hardserver (on Windows, the nFast Server service in services.msc; on Linux, `/opt/nfast/sbin/init.d-ncipher start`) and report the start time |
| `slot list` shows no slots | Client not registered with the appliance, or network blocked | Run `clientconfig listservers` and check the NTLS port to the appliance |
| `hsm supportInfo` not found | Older or newer lunash syntax | Run `help hsm` in lunash and check the vendor documentation for the version |
| `certutil -ping` fails | CertSvc stopped or RPC blocked | Check the Active Directory Certificate Services service and firewall |
| `certutil -verify -urlfetch` shows "Expired" for a CRL | CRL not published or CDP unreachable | See [Recovering from an expired CRL](../04-Featured-Articles/PKI-Runbooks/recovering-from-an-expired-crl.md) |

## Related articles

- [What to include in a support case](what-to-include-in-a-support-case.md)
- [Secure file sharing with EC support](secure-file-sharing-with-ec-support.md)
- [Certutil command reference](../04-Featured-Articles/PKI-Runbooks/certutil-command-reference.md)
- [HSM health check and monitoring](../04-Featured-Articles/HSM-Runbooks/hsm-health-check-and-monitoring.md)
- [Entrust nShield Security World concepts](../02-General/HSM/entrust-nshield-security-world-concepts.md)
- [Thales Luna HSM concepts](../02-General/HSM/thales-luna-hsm-concepts.md)
