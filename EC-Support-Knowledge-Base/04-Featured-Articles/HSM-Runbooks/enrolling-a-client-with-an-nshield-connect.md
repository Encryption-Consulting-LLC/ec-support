---
title: "Enrolling a Client with an nShield Connect"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "How-to"
applies_to: "Entrust nShield Connect XC and nShield 5c network HSMs with Security World software on Windows or Linux clients"
summary: "How to set up the Remote File System and enroll a client with an Entrust nShield Connect XC or 5c using anonkneti, rfs-setup and nethsmenroll."
keywords: ["nethsmenroll", "rfs-setup", "anonkneti", "nShield Connect client", "Remote File System", "rfs-sync", "KNETI"]
last_reviewed: "2026-10-06"
---

# Enrolling a Client with an nShield Connect

This article explains how to connect a client computer to an Entrust nShield Connect XC or nShield 5c network Hardware Security Module (HSM). It covers the Remote File System (RFS), the HSM client configuration, client enrollment with `nethsmenroll`, and client cooperation. It is for HSM administrators and application server administrators.

## Overview

A network HSM serves cryptography to clients over the network. Three parts work together:

| Part | Role |
|---|---|
| nShield Connect XC or 5c | Runs the cryptography; holds no application key blobs |
| Remote File System (RFS) | A host that stores the master copy of Security World data (`kmdata`), firmware images, and HSM config |
| Client | Runs the hardserver and the application; loads key blobs from its own `kmdata/local` |

The HSM and client authenticate each other with the HSM's KNETI key (an identity key for network impath connections). Each side checks the other's Electronic Serial Number (ESN) and key hash.

## Applies to

- nShield Connect XC and nShield 5c.
- nShield Security World software 12.x, 13.x, and later on Windows Server and supported Linux distributions.

Menu names and options vary by release and HSM model. Check the HSM user guide for the installed version.

## Prerequisites

- Security World software installed on the client and the RFS (they can be the same machine).
- Network access from the client to the HSM on TCP port 9004 (the default `nethsmenroll` port).
- Front panel access (or remote administration) to the HSM.
- The HSM IP address.
- Local administrator (Windows) or root (Linux) on the client.
- For privileged clients, approval to grant privileged access. Privileged clients can perform administration such as firmware upgrades.

## Before starting

> **Warning:** Always check the ESN and KNETI hash returned by `anonkneti` against the values shown on the HSM front panel. Accepting an unverified hash could let a rogue device impersonate the HSM.

> **Note:** Grant privileged access only to administration hosts. Application servers usually need unprivileged access.

1. Record the HSM ESN and KNETI hash from the HSM display.
2. Decide which host is the RFS and which clients will be cooperating clients.
3. Confirm firewall rules for port 9004 between the HSM, the RFS, and the clients.
4. Back up the existing `kmdata` folder on the RFS if a Security World already exists.

## Procedure

### Phase 1: Set up the RFS

1. On the RFS, get the HSM ESN and KNETI hash:

   ```bash
   anonkneti <hsm_ip>
   ```

2. Compare the output with the HSM front panel. If they match, create the RFS configuration:

   ```bash
   rfs-setup --force <hsm_ip> <hsm_esn> <kneti_hash>
   ```

3. On the HSM front panel, select **System > System configuration > Remote file system**. Enter the RFS IP address and port.

### Phase 2: Allow the client on the HSM

1. On the HSM front panel, select **System > System configuration > Client config > New client**.
2. Enter the client IP address.
3. Choose the connection type: unprivileged, privileged on low ports, or privileged on any ports.
4. Optionally require client authentication with an nToken or software-based key, and check the key hash shown against `enquiry -m0` or `ntokenenroll -H` on the client.

### Phase 3: Enroll the client

1. On the client, enroll the HSM. With automatic discovery:

   ```bash
   nethsmenroll <hsm_ip>
   ```

   Confirm the ESN and hash when prompted. To give the values directly and verify them:

   ```bash
   nethsmenroll -V <hsm_ip> <hsm_esn> <kneti_hash>
   ```

   For a privileged connection, add `-p` (`--privileged`). To use an nToken to authenticate the client, add `--ntoken-esn <ntoken_esn>`. To reconfigure an HSM the client already knows, add `-f`.

2. Restart the hardserver if the change does not take effect:

   ```bash
   /opt/nfast/sbin/init.d-ncipher restart
   ```

   On Windows:

   ```cmd
   net stop nfast_server
   net start nfast_server
   ```

### Phase 4: Allow the client to share the RFS (client cooperation)

1. On the RFS, allow the client. With an authenticated client:

   ```bash
   rfs-setup --gang-client <client_ip> <ntoken_esn_or_empty> <client_keyhash>
   ```

   Without client authentication (only on trusted networks):

   ```bash
   rfs-setup --gang-client --write-noauth <client_ip>
   ```

   Add `--readonly` to limit the client to read-only access.
2. On the client, point to the RFS and pull the Security World:

   ```bash
   rfs-sync --setup <rfs_ip>
   rfs-sync --update
   ```

   Add `--authenticate` to `--setup` if the client authenticates to the RFS.

## Verification

1. Run `enquiry` on the client. The HSM should appear as a module with `mode operational` and the correct serial number.
2. Run `nfkminfo` and confirm the Security World shows `Initialised` and `Usable`.
3. Run `rfs-sync --show` to confirm the RFS settings.
4. Test the application (for example, a PKCS#11 or CNG key load).

## Rollback

- Remove the HSM from the client: `nethsmenroll -r <hsm_ip>`.
- Remove the client from the HSM front panel client list.
- Return a cooperating client to standalone: `rfs-sync --remove`.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `enquiry` shows the module as failed or unreachable | Port 9004 blocked or wrong IP | Check firewall and routing; test reachability to the HSM |
| HSM rejects the client | Client IP not added on HSM, or NAT changes the source IP | Add the real source IP under **Client config** |
| Admin commands fail with permission errors | Client enrolled as unprivileged | Re-add client as privileged on HSM; run `nethsmenroll -f -p` |
| ESN or hash mismatch warning | Wrong HSM IP, replaced HSM, or tampering | Stop. Verify on the front panel before continuing |
| Client cannot see keys | `kmdata/local` not synced | Run `rfs-sync --update` |
| `rfs-sync --commit` refused | Client not set up as gang client, or read-only | Rerun `rfs-setup --gang-client` without `--readonly` |

## Related articles

- [How to replace the Administrator Card Set](how-to-replace-the-administrator-card-set.md)
- [HSM health check and monitoring](hsm-health-check-and-monitoring.md)
- [Updating HSM firmware](updating-hsm-firmware.md)
- [Configuring AD CS with an HSM KSP](configuring-ad-cs-with-an-hsm-ksp.md)
- [Entrust nShield Security World concepts](../../02-General/HSM/entrust-nshield-security-world-concepts.md)
- [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md)
