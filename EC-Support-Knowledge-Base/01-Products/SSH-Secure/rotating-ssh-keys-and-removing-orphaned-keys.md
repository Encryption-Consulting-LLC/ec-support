---
title: "Rotating SSH Keys and Removing Orphaned Keys"
category: "Products"
section: "SSH Secure"
article_type: "Runbook"
applies_to: "SSH Secure; OpenSSH on Linux, Unix, and Windows"
summary: "A safe runbook for rotating SSH keys and removing orphaned or over-privileged keys with SSH Secure, including testing, staged rollout, and rollback steps."
keywords: ["SSH key rotation", "orphaned SSH keys", "remove SSH keys", "SSH Secure", "authorized_keys cleanup"]
last_reviewed: "2026-10-06"
---

# Rotating SSH Keys and Removing Orphaned Keys

This runbook explains how to rotate Secure Shell (SSH) keys and remove orphaned or over-privileged keys with SSH Secure without locking out people or automated jobs. It is for SSH Secure administrators, server owners, and application teams that rely on SSH for automation.

## Overview

Rotation replaces an old key pair with a new one. Removal deletes a public key from `authorized_keys` so it no longer grants access. Both changes can break automated jobs (backups, file transfers, deployment scripts) if the dependent system is not updated at the same time. The safe pattern is always:

1. **Add** the new key alongside the old one.
2. **Switch** the client to the new private key.
3. **Test** access with the new key.
4. **Remove** the old public key.

SSH Secure runs these steps as one job, on demand or on a schedule, and records each step in the audit log.

## Applies to

- User and service account keys on OpenSSH servers (Linux, Unix, Windows).
- Keys discovered and owned in the SSH Secure inventory. See [Discovering SSH keys with SSH Secure](discovering-ssh-keys-with-ssh-secure.md).

## Prerequisites

- A complete, reviewed inventory with owners for each key.
- Rotation and removal permissions in SSH Secure through role-based access control (RBAC).
- For automation keys: the client host is also managed by SSH Secure, or the application owner can update the private key on the client.
- An approved change request for production hosts.

## Before starting

- **Lockout risk:** Never remove the last working key for an account used by automation or for emergency access. Keep a second access path (console, out-of-band management, or a break-glass account) open during the change.
- **Back up** the `authorized_keys` file on each target before changes.
- **Change window:** Run the first wave in a low-traffic window with the application owner available.
- **Quarantine before delete:** For orphaned keys, disable first and delete later (see Phase 3).

## Procedure

### Phase 1: Plan the wave

1. Filter the inventory for the target set (for example, all keys older than the policy maximum on non-production hosts).
2. Check dependencies. For each key, list the client hosts and jobs that use it. SSH Secure shows trust relationships between client and server accounts.
3. Split into waves: non-production first, then low-risk production, then critical systems.

### Phase 2: Rotate keys

1. Go to the **Key Rotation** page.
2. Select the keys and the new key type. Ed25519 is a good default. Use RSA 3072 bits or more where Ed25519 is not supported.
3. Choose whether the private key is generated on the client host, stored in a Hardware Security Module (HSM), or issued as a short-lived key.
4. Keep or add restrictions on the new `authorized_keys` entry, such as `from="<client-ip>"` and `command="<allowed-command>"` for automation keys.
5. Choose on-demand or scheduled execution.
6. Run the job on the first wave.

The job adds the new public key, deploys or activates the new private key on the client, tests the connection, and then removes the old public key.

### Phase 3: Remove orphaned and over-privileged keys

1. Filter for keys flagged as orphaned (no owner and no matching known private key).
2. Publish the list to server owners and give a short review period. Unknown keys sometimes belong to vendor support processes.
3. **Disable** the keys first. Options include moving them to a quarantine list in SSH Secure or commenting them out.
4. Watch authentication logs for failed logins that match the disabled keys during the agreed period:

```bash
sudo grep -i "publickey" /var/log/auth.log    # Debian and Ubuntu
sudo grep -i "publickey" /var/log/secure      # RHEL family
sudo journalctl -u ssh -u sshd --since "<YYYY-MM-DD>" | grep -i publickey
```

5. If no valid use appears, **delete** the keys.
6. For over-privileged keys (for example, keys that grant root), move access to a named account with sudo rights, or add `from=` and `command=` restrictions.

### Phase 4: Make it routine

1. Set scheduled rotation by policy (for example, every 90 or 180 days for automation keys).
2. Alert on new keys that appear outside SSH Secure.
3. Consider short-lived keys or SSH certificates for human access, so standing keys are not needed.

## Verification

From the client, test the new key in a non-interactive way:

```bash
ssh -i <path-to-new-private-key> -o BatchMode=yes -o IdentitiesOnly=yes <user>@<host> 'echo ok'
```

On the server, confirm only the new fingerprint is present:

```bash
ssh-keygen -l -f /home/<user>/.ssh/authorized_keys
```

In SSH Secure, confirm the job shows success and the inventory shows the new key with the new creation date.

## Rollback

1. Restore the backed-up `authorized_keys` file, or re-add the old public key from the SSH Secure record.
2. Point the client back to the old private key if it was kept.
3. Check file permissions after restore: `~/.ssh` set to 700 and `authorized_keys` set to 600, owned by the account. With `StrictModes yes` (the default), wrong permissions make sshd ignore the file.
4. Record the cause and fix the dependency before trying again.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Automated job fails after rotation | Client still uses the old private key path | Update the job or client configuration to the new key |
| "Permission denied (publickey)" after restore | Wrong owner or permissions on `.ssh` or `authorized_keys` | Fix ownership, set 700 and 600 |
| Rotation fails on Windows host | Admin user keys live in `administrators_authorized_keys`, or file ACLs too open | Update the correct file and restrict its ACL to Administrators and SYSTEM |
| New key rejected by server | Algorithm not allowed by server settings, for example RSA with SHA-1 signatures on OpenSSH 8.8 and later | Use Ed25519 or RSA with SHA-2 signatures |
| Orphaned key removal broke a vendor process | Key had no owner recorded | Restore the key, assign an owner, then rotate properly |
| Job fails part way on some hosts | Host offline or agent stopped | Re-run for failed hosts after checking connectivity |

## Related articles

- [Discovering SSH keys with SSH Secure](discovering-ssh-keys-with-ssh-secure.md)
- [SSH Secure overview](ssh-secure-overview.md)
- [SSH Secure FAQ](ssh-secure-faq.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
- [Escalation process](../../00-Working-with-EC-Support/escalation-process.md)
