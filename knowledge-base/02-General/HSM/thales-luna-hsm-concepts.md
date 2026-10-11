---
title: "Thales Luna HSM Concepts"
category: "General"
section: "HSM"
article_type: "Concept"
applies_to: "Thales Luna Network HSM 7, Luna PCIe HSM 7, Luna USB HSM 7, Luna Backup HSM 7, Luna Cloud HSM (DPoD)"
summary: "Core Thales Luna HSM concepts: partitions, roles (SO, CO, CU), password vs PED authentication, M of N quorum, cloning domains, HA groups, and backup HSMs."
keywords: ["Thales Luna HSM", "Luna partitions", "PED authentication", "Crypto Officer", "Luna HA group", "Luna Backup HSM"]
last_reviewed: "2026-10-06"
---

# Thales Luna HSM Concepts

This article explains the main ideas behind Thales Luna Hardware Security Modules (HSMs): partitions, roles, authentication types, quorum, cloning domains, high availability, and backup. It is for administrators and application owners who deploy, operate, or support Luna HSMs.

## What it is

Thales Luna HSMs store keys **inside** the HSM, in isolated areas called **partitions**. Each partition acts like a separate HSM for one application or tenant, with its own roles, policies, and keys. Applications reach a partition through the Luna client software using PKCS#11, Microsoft Cryptography API: Next Generation (CNG), Java Cryptography Extension (JCE), or OpenSSL integration.

Luna products include the Luna Network HSM 7 (network appliance), Luna PCIe HSM 7 (card), Luna USB HSM 7 (portable), Luna Backup HSM 7, and Luna Cloud HSM services on Thales Data Protection on Demand (DPoD).

## Why it matters

Luna's role model, authentication type, and cloning domain decide who can use keys, how keys are backed up, and which HSMs can share keys in a high availability group. Getting these right at setup avoids rebuilds later.

## How it works

1. **HSM initialization.** The HSM Security Officer (SO) initializes the HSM, sets HSM-level policies, and creates partitions. On a network HSM, appliance administration uses the LunaSH shell.
2. **Partition initialization.** Each partition is initialized by its Partition SO, who sets partition policies and the **cloning domain**.
3. **Crypto roles.** The Partition SO initializes the Crypto Officer (CO) role, and the CO can initialize the Crypto User (CU) role.
4. **Client registration.** The client host and the HSM exchange certificates to build a Network Trust Link (NTLS), or use a Secure Trusted Channel (STC), and the partition is assigned to the client.
5. **Application use.** The application logs in to the partition slot as CO or CU and performs operations. Keys are generated and kept inside the partition.
6. **Backup and HA.** Keys are cloned to a backup HSM or to other partitions in an HA group that share the same cloning domain.

## Roles

| Role | Scope | What it does |
|---|---|---|
| HSM Security Officer (SO) | Whole HSM | Initializes the HSM, sets HSM policies, creates partitions |
| Partition Security Officer (PO or Partition SO) | One partition | Sets partition policies, initializes the CO role |
| Crypto Officer (CO) | One partition | Creates, deletes, and uses keys; full key management |
| Limited Crypto Officer (LCO) | One partition | Restricted key management (on supported versions) |
| Crypto User (CU) | One partition | Uses existing keys, typically for applications that only sign or decrypt |
| Auditor (AU) | Whole HSM | Manages audit logging only |
| Appliance roles (admin, operator, monitor) | Network HSM appliance | Manage the appliance operating system through LunaSH, not keys |

## Password vs PED authentication

The authentication type is set at the factory, based on the HSM model purchased.

| Factor | Password-authenticated | Multifactor quorum (PED-authenticated) |
|---|---|---|
| How a role logs in | A typed password | A physical PED key (iKey) inserted into a Luna PIN Entry Device (PED), with an optional PED PIN |
| Multi-person control | Not available | M of N quorum supported |
| Remote administration | Over the network | With a Remote PED and the orange Remote PED Vector key |
| Typical use | Cloud and general-purpose deployments | Certificate Authority (CA) roots, high-assurance and regulated uses |

### PED key colors

| Color | Secret |
|---|---|
| Blue | HSM SO or Partition SO |
| Red | Cloning domain (key cloning vector) |
| Black | Crypto Officer |
| Gray | Crypto User or Limited Crypto Officer |
| White | Auditor |
| Orange | Remote PED Vector (RPV) |

See [Luna PED keys explained](../../04-Featured-Articles/HSM-Runbooks/luna-ped-keys-explained.md).

### M of N quorum

With PED authentication, a role secret can be split across up to 16 PED keys, and a minimum number (M) must be presented. For example, 3 of 5 means any three key holders must be present. This enforces dual control for sensitive roles.

## Cloning domains, HA, and backup

- A **cloning domain** is a shared secret (a red PED key or a domain string). Keys can only be cloned between partitions that share the same domain.
- An **HA group** in LunaCM combines partitions on several HSMs into one virtual slot. The client load balances across members and fails over if one is lost. Members must share the cloning domain. See [Configuring Luna HA groups](../../04-Featured-Articles/HSM-Runbooks/configuring-luna-ha-groups.md).
- A **Luna Backup HSM** stores partition backups. Backups are encrypted and can only be restored to a partition with the same cloning domain. See [Backing up a Luna partition](../../04-Featured-Articles/HSM-Runbooks/backing-up-a-luna-partition.md).

## Useful commands

On the appliance (LunaSH):

```bash
hsm show
partition list
```

On the client (LunaCM):

```bash
slot list
partition showinfo
hagroup listgroups
```

## Key terms

| Term | Meaning |
|---|---|
| Partition | Isolated key store inside a Luna HSM |
| LunaSH | Appliance shell for Luna Network HSM administration |
| LunaCM | Client-side tool for partition, HA, and backup tasks |
| NTLS | Network Trust Link Service, the certificate-based client link |
| STC | Secure Trusted Channel, an alternative encrypted client link |
| PED | PIN Entry Device for multifactor authentication |
| Cloning domain | Shared secret that allows key cloning between partitions |

## Common questions

### Can a password HSM be changed to PED authentication?
Not by configuration. The authentication type comes from the model purchased. Contact Thales or EC about options.

### What happens if all black PED keys for a partition are lost?
The Crypto Officer cannot log in. Keep duplicate keys in secure, separate storage and follow [How to update the quorum in an HSM](../../04-Featured-Articles/HSM-Runbooks/how-to-update-the-quorum-in-an-hsm.md).

### Does EC support Luna HSMs?
Yes. EC provides Luna [training](../../00-Working-with-EC-Support/ec-training-and-certification.md), [HSM services](../../03-Services/hsm-services-deployment-and-integration.md), and [HSM-as-a-Service](../../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md).

## Related articles

- [What is an HSM](what-is-an-hsm.md)
- [How HSM partitions work](../../04-Featured-Articles/HSM-Runbooks/how-hsm-partitions-work.md)
- [Luna PED keys explained](../../04-Featured-Articles/HSM-Runbooks/luna-ped-keys-explained.md)
- [Configuring Luna HA groups](../../04-Featured-Articles/HSM-Runbooks/configuring-luna-ha-groups.md)
- [Entrust nShield Security World concepts](entrust-nshield-security-world-concepts.md)
- [FIPS 140-3 security levels explained](fips-140-3-security-levels-explained.md)
