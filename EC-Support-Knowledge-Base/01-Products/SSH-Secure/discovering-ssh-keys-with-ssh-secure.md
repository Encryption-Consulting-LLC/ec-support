---
title: "Discovering SSH Keys with SSH Secure"
category: "Products"
section: "SSH Secure"
article_type: "How-to"
applies_to: "SSH Secure; OpenSSH on Linux, Unix, and Windows"
summary: "How to plan and run SSH key discovery in SSH Secure with agents or agentless scans, then review orphaned, weak, and over-privileged keys in the inventory."
keywords: ["SSH key discovery", "authorized_keys", "orphaned SSH keys", "SSH Secure", "SSH key inventory"]
last_reviewed: "2026-10-06"
---

# Discovering SSH Keys with SSH Secure

This article explains how to find Secure Shell (SSH) keys across servers with SSH Secure and build a reliable inventory. It covers where keys live, how to choose between agent-based and agentless discovery, and how to review the results. It is for SSH Secure administrators and server owners.

## Overview

SSH access is controlled by key pairs. The private key stays with the user or process. The public key is placed in an `authorized_keys` file on the target account. Whoever holds the private key can sign in as that account without a password. Discovery finds all of these pieces and links them together.

SSH Secure looks in these common locations:

| Item | Typical location (OpenSSH) | Why it matters |
|---|---|---|
| Authorized keys | `~/.ssh/authorized_keys` (and `~/.ssh/authorized_keys2` on older defaults), or the path set by `AuthorizedKeysFile` in `sshd_config` | Defines who can sign in to each account |
| Windows admin keys | `%ProgramData%\ssh\administrators_authorized_keys` for members of the Administrators group | Grants administrator access on Windows OpenSSH |
| User private keys | `~/.ssh/id_rsa`, `id_ecdsa`, `id_ed25519`, and custom names | Shows who can reach other hosts, and whether keys have a passphrase |
| Host keys | `/etc/ssh/ssh_host_*_key` and `.pub` | Identify the server to clients |
| Known hosts | `~/.ssh/known_hosts` | Shows which servers a user has connected to |
| SSH daemon settings | `/etc/ssh/sshd_config` and included files | Can change key locations, or use `AuthorizedKeysCommand` to fetch keys from elsewhere |

## Prerequisites

- SSH Secure platform deployed and reachable.
- A target list of hosts with owners.
- For agentless discovery: a service account on each host that can read every user's `.ssh` directory (usually through a scoped sudo rule on Linux), and network access on TCP 22 or the custom SSH port.
- For agent-based discovery: the agent package and installation method. See {{TBD: SSH Secure agent installation guide}}.
- Approval from the security team, since discovery reads sensitive files.

## Before starting

- **Read-only first.** Run discovery only. Do not enable rotation or removal until the inventory has been reviewed.
- **Private keys:** Confirm the discovery policy. Recording a fingerprint and metadata of private keys is enough for inventory. Copying private key material off hosts is not required for discovery.
- **Choose the collection method:**

| Method | Good for | Points to plan |
|---|---|---|
| Agent-based | Large estates, near real-time inventory, hosts behind strict firewalls | Software deployment and patching of the agent |
| Agentless | Fast start, hosts where no new software is allowed | A privileged service account and inbound SSH from the platform |

## Procedure

### Phase 1: Prepare hosts

**Agentless (Linux example)**
1. Create the service account, for example `svc-sshsecure`.
2. Allow its key from the SSH Secure platform only, using a `from=` restriction on its `authorized_keys` entry:

```text
from="<sshsecure-collector-ip>" ssh-ed25519 <public-key> svc-sshsecure
```

3. Give the account read access to `.ssh` directories through a narrow sudo rule. The exact commands needed: {{TBD: SSH Secure agentless sudo command list}}.

**Agent-based**
1. Install the agent using the organization's software deployment tool.
2. Register the agent with the platform: {{TBD: SSH Secure agent registration steps}}.

### Phase 2: Create the discovery job

1. Go to {{TBD: SSH Secure menu path for discovery jobs}}.
2. Add hosts by name, IP range, or group (for example, from a configuration management database (CMDB) import).
3. Select the collection method and credentials.
4. Set the schedule. Daily discovery keeps the inventory current.
5. Run the job once on demand.

### Phase 3: Review results

Work through the inventory in this order:

1. **Keys granting root or Administrator access.** Highest risk. Confirm every one has a named owner and a business reason.
2. **Orphaned keys.** Public keys in `authorized_keys` with no known owner or matching private key in the inventory.
3. **Weak keys.** RSA keys under 2048 bits and DSA keys. OpenSSH has disabled DSA by default since version 7.0 and removed DSA support in version 10.0.
4. **Unrestricted automation keys.** Keys used by scripts that have no `from=` or `command=` restrictions.
5. **Private keys without a passphrase** on user workstations and jump hosts.
6. **Stale keys.** Keys older than the policy maximum or not used in a long time.

Assign an owner to each key, and tag keys by application and environment.

### Phase 4: Set policy

1. Define allowed algorithms (for example, Ed25519, ECDSA, RSA 3072 bits or more).
2. Set a maximum key age.
3. Turn on alerts for new keys that break policy.

## Verification

Check one host by hand and compare with the inventory:

```bash
# List fingerprints in an authorized_keys file
ssh-keygen -l -f /home/<user>/.ssh/authorized_keys

# Show the effective AuthorizedKeysFile and AuthorizedKeysCommand settings
sudo sshd -T | grep -i authorizedkeys
```

On Windows (PowerShell, run as administrator):

```powershell
Get-Content "$env:ProgramData\ssh\administrators_authorized_keys"
```

The fingerprints and counts should match what SSH Secure shows for the host.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Host shows zero keys but keys exist | Service account cannot read other users' `.ssh` directories | Fix the sudo rule or run the agent with the required rights |
| Keys missing for some users | `AuthorizedKeysFile` points to a custom path, or `AuthorizedKeysCommand` is used | Add the custom path or source to the discovery settings |
| Agentless scan "permission denied (publickey)" | Collector key not in the service account's `authorized_keys`, or wrong file permissions | Add the key; set `~/.ssh` to 700 and `authorized_keys` to 600 |
| Scan times out | Firewall blocks TCP 22 or a custom SSH port | Open the path or use the agent |
| Agent offline | Agent service stopped or outbound path to the platform blocked | Restart the agent and check proxy and firewall rules |
| Windows admin keys not found | Only user profiles scanned | Include `administrators_authorized_keys` in scope |

## Related articles

- [SSH Secure overview](ssh-secure-overview.md)
- [Rotating SSH keys and removing orphaned keys](rotating-ssh-keys-and-removing-orphaned-keys.md)
- [SSH Secure FAQ](ssh-secure-faq.md)
- [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md)
