---
title: "SSH Secure Overview"
category: "Products"
section: "SSH Secure"
article_type: "Overview"
applies_to: "SSH Secure (SaaS, cloud, hybrid, and on-premises deployments); Linux, Unix, Windows, cloud, Kubernetes"
summary: "An introduction to SSH Secure, the EC platform for SSH key discovery, inventory, rotation, policy enforcement, and audit across Linux, Unix, Windows, and cloud."
keywords: ["SSH Secure", "SSH key management", "SSH key discovery", "SSH key rotation", "orphaned SSH keys"]
last_reviewed: "2026-10-06"
---

# SSH Secure Overview

SSH Secure is the Encryption Consulting (EC) platform for managing Secure Shell (SSH) keys across their whole life. This article explains what it does, how it is built, and where to get help. It is for security teams, Linux and Windows administrators, and auditors.

## What it is

SSH keys give people and automated processes direct access to servers. Over time, large estates collect thousands of keys that nobody tracks: keys of former staff, keys copied between servers, and keys with more access than needed. SSH Secure finds these keys, records who and what they grant access to, and helps rotate or remove them under policy.

## Key capabilities

- **Discovery and inventory:** Finds user keys, `authorized_keys` entries, and host keys across servers, with agent-based and agentless options. Builds a live map of which key grants access to which account on which host.
- **Risk detection:** Flags orphaned keys (no known owner), over-privileged keys (for example, keys that grant root access), weak keys (short RSA keys, DSA), and stale keys that have not been used or rotated.
- **Lifecycle automation:** Generates, rotates, and revokes keys on demand or on a schedule, including bulk updates designed to avoid service disruption.
- **Stronger key protection:** Supports Hardware Security Module (HSM) backed private key storage and short-lived (ephemeral) keys that expire on their own.
- **Policy enforcement:** Rules for key length, algorithm, and maximum age, aligned with National Institute of Standards and Technology (NIST) guidance such as NIST IR 7966.
- **Role-based access control (RBAC):** Granular permissions for who can view, approve, and change keys.
- **Audit and compliance:** Detailed logs of key activity and audit-ready reports.

## How it works

1. **Central platform:** The web console, policy engine, inventory database, workflows, and reporting.
2. **Collection:** Either a lightweight agent on each host, or agentless collection where the platform connects over SSH (or a Windows remote method) with a privileged service account. Many estates mix both.
3. **Analysis:** The platform matches public keys in `authorized_keys` files with known private keys and owners, and builds trust relationships between hosts and accounts.
4. **Action:** Rotation and removal jobs update `authorized_keys` files and key pairs on the hosts, under policy and approval rules.
5. **Reporting:** Dashboards, compliance reports, and logs that can be exported to a Security Information and Event Management (SIEM) tool.

## Supported environments

| Environment | Notes |
|---|---|
| Linux and Unix | OpenSSH `authorized_keys`, host keys, and user private keys |
| Windows | OpenSSH for Windows, including `administrators_authorized_keys` for members of the Administrators group |
| Cloud | Virtual machines in public clouds and cloud-provided key stores |
| Kubernetes | Keys used by workloads and nodes |

## Deployment options

- **SaaS:** Fully managed by EC, with a selectable hosting region.
- **Cloud:** Private cloud deployment.
- **Hybrid:** Central platform in the cloud with collection inside private networks.
- **On-premises:** Full control, including air-gapped networks.

A 15-day free trial is available from the EC website.

## Getting help

- Read the [SSH Secure FAQ](ssh-secure-faq.md).
- Open a case through the portal. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [Discovering SSH keys with SSH Secure](discovering-ssh-keys-with-ssh-secure.md)
- [Rotating SSH keys and removing orphaned keys](rotating-ssh-keys-and-removing-orphaned-keys.md)
- [SSH Secure FAQ](ssh-secure-faq.md)
- [CertSecure Manager overview](../CertSecure-Manager/certsecure-manager-overview.md)
- [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md)
