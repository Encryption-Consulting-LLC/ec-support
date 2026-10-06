---
title: "How HSM Partitions Work"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Concept"
applies_to: "Thales Luna Network HSM 7 and Luna PCIe HSM 7; Entrust nShield Security World (for comparison)"
summary: "How Thales Luna HSM partitions, roles, cloning domains and partition policies work, and how Entrust nShield separates keys without Luna-style partitions."
keywords: ["HSM partition", "Luna partition", "partition policies", "Crypto Officer", "cloning domain", "partition create", "nShield Security World"]
last_reviewed: "2026-10-06"
---

# How HSM Partitions Work

This article explains what a partition is on a Hardware Security Module (HSM), how Thales Luna partitions are created and controlled, and how Entrust nShield separates keys in a different way. It is for HSM administrators, application owners, and architects who plan multi-application or multi-tenant HSM use.

## What it is

A partition is a separate, protected key store inside one physical HSM. Each partition has its own roles, credentials, policies, and objects (keys and certificates). An application that logs in to one partition cannot see objects in another partition. To a PKCS#11 application, each partition looks like a separate slot.

Thales Luna HSMs are built around partitions. Entrust nShield HSMs use a different model, the Security World, described below.

## Why it matters

- **Isolation:** a CA signing key and a payment key can share hardware without sharing access.
- **Separation of duties:** each partition has its own Security Officer and Crypto Officer.
- **Different policies:** one partition can allow key export by wrapping while another forbids it.
- **Cost:** several applications share one HA pair instead of each needing its own HSM.

## How it works (Luna)

1. **HSM initialization.** The HSM Security Officer (SO) initializes the HSM with `hsm init` and sets the HSM-level policies. Initialization erases all existing partitions.
2. **Partition creation.** The HSM SO creates an empty partition. On a Luna Network HSM 7:

   ```bash
   lunash:> hsm login
   lunash:> partition create -partition <partition_name>
   ```

3. **Client access.** The client and appliance exchange certificates, and the partition is assigned to the client over Network Trust Link Service (NTLS) or Secure Trusted Channel (STC). The partition then shows as a slot in LunaCM.
4. **Partition initialization.** The Partition SO initializes the partition and sets its cloning domain:

   ```bash
   lunacm:> slot set -slot <slot_number>
   lunacm:> partition init -label <partition_label>
   ```

   On PED-authenticated HSMs, the PED writes the blue Partition SO key and the red domain key.
5. **Role setup.** The Partition SO initializes the Crypto Officer, and the Crypto Officer can initialize the optional Crypto User:

   ```bash
   lunacm:> role login -name po
   lunacm:> role init -name co
   ```

6. **Policy setup.** The Partition SO reviews and sets partition policies.
7. **Use.** Applications log in as Crypto Officer (read and write) or Crypto User (read-only) through PKCS#11, Microsoft CNG/KSP, or Java JCE/JCA providers.

## Partition roles

| Role | Short name | Typical tasks |
|---|---|---|
| Partition Security Officer | PO | Initialize partition, set policies, initialize CO, reset CO if HSM policy allows |
| Crypto Officer | CO | Create, use, delete, back up objects |
| Crypto User | CU | Use objects only (sign, verify, encrypt, decrypt) |

## Common partition policies

Policies are viewed with `partition showpolicies` and changed by the Partition SO with `partition changepolicy -policy <id> -value <value>`.

| Policy | Name | Notes |
|---|---|---|
| 0 | Allow private key cloning | Needed for backup and HA of private keys on cloning-based partitions |
| 1 | Allow private key wrapping | Lets private keys leave the HSM wrapped; often disabled for CA keys |
| 4 | Allow secret key cloning | Needed for backup and HA of symmetric keys |
| 22 | Allow activation | PED partitions: keeps the CO logged in without re-presenting the black key |
| 23 | Allow auto-activation | PED partitions: activation survives a short power loss |
| 37 | Enable password complexity | Enforces stronger partition passwords |

> **Warning:** Some policies are destructive. Changing them erases the objects in the partition. LunaCM asks for confirmation; read the prompt before agreeing. Check the policy table in the vendor documentation for the installed firmware.

## Cloning domains

A cloning domain is a shared secret that decides which partitions may copy objects to each other. Backup, restore, and High Availability (HA) only work between partitions in the same domain.

- Password-authenticated partitions use a domain string.
- PED-authenticated partitions use the red domain PED key.
- A partition's domain cannot be changed later. A new partition is needed.

## How nShield compares

Entrust nShield HSMs do not use Luna-style partitions in the classic Security World model. Instead:

- All HSMs in a Security World share one Security World key, controlled by the Administrator Card Set (ACS).
- Application keys are stored as encrypted key blobs on the host file system in `kmdata/local`, not inside the HSM.
- Keys are separated by protection method: module protection, Operator Card Set (OCS), or softcard. Only holders of the right OCS or softcard passphrase can load OCS or softcard keys.
- Different applications can use different OCSs or softcards for logical separation.
- Security World v14.1.1 adds multi-tenancy for the nShield 5s. Verify features and supported models against the vendor documentation for the installed version.

## Key terms

| Term | Meaning |
|---|---|
| Slot | How a partition appears to PKCS#11 applications |
| Partition SO (PO) | Administrator of one partition |
| Crypto Officer (CO) | Main application role with read and write access |
| Cloning domain | Shared secret that allows cloning between partitions |
| Activation | Cached PED login so applications run without key holders present |
| NTLS | Network Trust Link Service, Luna's client to appliance link |
| Security World | nShield trust domain shared by HSMs, cards, and key blobs |

## Common questions

**How many partitions can a Luna HSM hold?** It depends on the model and partition license. Check `hsm show` for licensed and used partitions.

**Can a key move between partitions?** Only by cloning between partitions in the same domain, or by wrapping, if the policies allow it.

**Does deleting a partition delete its keys?** Yes. Back up first.

## Related articles

- [Luna PED keys explained](luna-ped-keys-explained.md)
- [Backing up a Luna partition](backing-up-a-luna-partition.md)
- [Configuring Luna HA groups](configuring-luna-ha-groups.md)
- [Thales Luna HSM concepts](../../02-General/HSM/thales-luna-hsm-concepts.md)
- [Entrust nShield Security World concepts](../../02-General/HSM/entrust-nshield-security-world-concepts.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
