---
title: "SSH Secure FAQ"
category: "Products"
section: "SSH Secure"
article_type: "FAQ"
applies_to: "SSH Secure (all deployment models)"
summary: "Answers to common SSH Secure questions: discovery methods, orphaned keys, rotation safety, supported platforms, HSM storage, compliance, and getting support."
keywords: ["SSH Secure FAQ", "SSH key management", "orphaned keys", "SSH key rotation", "NIST IR 7966"]
last_reviewed: "2026-10-06"
---

# SSH Secure FAQ

This article answers common questions about SSH Secure, the Encryption Consulting (EC) Secure Shell (SSH) key management platform. It is for administrators, security teams, and auditors who are new to the product.

### What does SSH Secure do?

It discovers SSH keys across servers, builds an inventory of who can access what, flags risky keys, and automates key rotation and removal under policy. See [SSH Secure overview](ssh-secure-overview.md).

### What is an orphaned SSH key?

An orphaned key is a public key in an `authorized_keys` file that has no known owner or no known matching private key. These often belong to former staff, old scripts, or past vendors. They still grant access, so they are a real risk.

### What is an over-privileged key?

A key that grants more access than needed, for example a key that signs in directly as root, or an automation key without `from=` or `command=` restrictions.

### Does SSH Secure need an agent on every server?

No. It supports agent-based discovery, agentless discovery over SSH with a service account, or a mix. See [Discovering SSH keys with SSH Secure](discovering-ssh-keys-with-ssh-secure.md).

### Which platforms are supported?

Linux, Unix, and Windows (OpenSSH), plus cloud and Kubernetes environments.

### Where does Windows store SSH keys for administrators?

On Windows with OpenSSH, accounts in the local Administrators group do not use the per-user `authorized_keys` file by default. Their public keys are read from `%ProgramData%\ssh\administrators_authorized_keys`, which must be readable only by Administrators and SYSTEM. SSH Secure includes this file in Windows discovery and rotation scope.

### Does discovery copy private keys off servers?

Inventory needs only fingerprints and metadata, such as type, size, location, and whether a passphrase is set.

### Will rotation lock out automated jobs?

Not when done in the safe order: add the new key, switch the client, test, then remove the old key. SSH Secure follows this order. Always keep a second access path during the first waves. See [Rotating SSH keys and removing orphaned keys](rotating-ssh-keys-and-removing-orphaned-keys.md).

### How often should keys be rotated?

Set this by policy and risk. Many organizations rotate automation keys every 90 to 180 days and move human access to short-lived keys or SSH certificates.

### Which key types are recommended?

Ed25519 is a good default. Use RSA with 3072 bits or more where Ed25519 is not supported. Remove DSA keys and RSA keys under 2048 bits. OpenSSH removed DSA support in version 10.0.

### Can private keys be stored in an HSM?

Yes. SSH Secure supports Hardware Security Module (HSM) backed private key storage, which keeps private keys out of reach of host compromise.

### Which standards does it help with?

Its controls map to guidance such as NIST IR 7966 (Security of Interactive and Automated Access Management Using SSH) and to access control requirements in frameworks such as PCI DSS, SOC 2, and ISO/IEC 27001:2022.

### How is it deployed?

As SaaS (with a selectable region), in a private cloud, hybrid, or fully on-premises, including air-gapped networks. A 15-day free trial is available from the EC website.

### How is support requested?

Open a case in the support portal. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md). Never attach private keys to a case.

## Related articles

- [SSH Secure overview](ssh-secure-overview.md)
- [Discovering SSH keys with SSH Secure](discovering-ssh-keys-with-ssh-secure.md)
- [Rotating SSH keys and removing orphaned keys](rotating-ssh-keys-and-removing-orphaned-keys.md)
- [What to include in a support case](../../00-Working-with-EC-Support/what-to-include-in-a-support-case.md)
