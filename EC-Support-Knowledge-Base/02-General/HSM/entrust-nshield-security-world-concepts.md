---
title: "Entrust nShield Security World Concepts"
category: "General"
section: "HSM"
article_type: "Concept"
applies_to: "Entrust nShield HSMs (nShield 5c, 5s, Connect, Solo, Edge) with Security World software v12 and v13"
summary: "Key Entrust nShield ideas explained: Security World, Administrator and Operator Card Sets, K of N quorum, softcards, module-protected keys, kmdata, and the RFS."
keywords: ["nShield Security World", "Administrator Card Set", "Operator Card Set", "softcard", "kmdata", "RFS"]
last_reviewed: "2026-10-06"
---

# Entrust nShield Security World Concepts

This article explains the building blocks of an Entrust nShield Hardware Security Module (HSM) deployment: the Security World, card sets, key protection options, and where key data lives. It is for administrators who install, operate, or support nShield HSMs and for application owners who use nShield-protected keys.

## What it is

A **Security World** is Entrust's key management framework for nShield HSMs. It ties together:

- One or more nShield HSMs that share the same Security World key material.
- An **Administrator Card Set (ACS)** that controls the Security World.
- Optional **Operator Card Sets (OCS)** and **softcards** that protect application keys.
- Encrypted **key data files** stored on host computers in a folder called `kmdata`.

Application keys are not stored inside the HSM permanently. Instead, each key is stored on the host as an encrypted "key blob". Only an HSM that belongs to the same Security World, with the right authorization, can load and use it. This design lets many HSMs share keys and makes backup simple, while the keys stay protected.

## Why it matters

Understanding the Security World model helps administrators plan quorum, backup, and recovery. Most nShield support issues trace back to a missing card, a card set below quorum, an out-of-date `kmdata` copy, or a client not enrolled with a network HSM.

## How it works

1. **Create the Security World.** On the first HSM, an administrator runs the Security World creation tool (`new-world` or the equivalent in the front panel or Security World Software). Options such as the security mode (for example a FIPS 140 Level 3 mode), the cipher suite, and recovery features are chosen here. Many of these choices cannot be changed later without creating a new world.
2. **Create the ACS.** During world creation the ACS is written to smart cards with a **K of N** quorum, for example 3 of 5.
3. **Add more HSMs.** Other HSMs are loaded into the same world using the world file and an ACS quorum.
4. **Create OCS or softcards** for applications that need operator authorization (`createocs`, `ppmk`).
5. **Generate application keys** (`generatekey` or through PKCS#11, CNG, or Java Cryptography Extension (JCE) APIs). Each key is protected by the module, a softcard, or an OCS.
6. **Use keys.** The application loads the key blob into the HSM. If the key is OCS-protected, a quorum of OCS cards (or a passphrase for a softcard) must be presented.

## Key protection options

| Protection | How the key is unlocked | Typical use |
|---|---|---|
| Module-protected | Automatically by any HSM in the world. Any application on an enrolled host can load it | Unattended services such as TLS or database encryption where host access is tightly controlled |
| Softcard | A passphrase. A softcard is a file holding a logical token, like a 1 of 1 card set without a physical card | Applications that need operator authorization without physical cards |
| OCS (K of N) | A quorum of physical operator smart cards and their passphrases | Certificate Authority (CA) keys, code signing, high-value keys |

OCS options include:

- **Non-persistent** (default): keys unload when the last card of the set is removed.
- **Persistent**: keys stay loaded after the cards are removed, until the application closes or a time-out is reached.
- **Time-out**: keys unload after a set time.

## The Administrator Card Set (ACS)

The ACS protects the Security World itself. A quorum of ACS cards is needed to:

- Load the Security World onto a new or replacement HSM.
- Replace a lost or damaged OCS (if key recovery was enabled).
- Replace the ACS itself (`racs`).
- Recover passphrases or perform other features enabled at world creation.

Entrust guidance is that the ACS quorum should be larger than the quorum needed for any single delegated feature. It is also common practice to choose **K less than N**, so the loss of one card does not lock out administration.

> **Warning:** If fewer than K ACS cards remain, the Security World cannot be administered or recovered. Replace damaged cards as soon as a loss is found. See [How to replace the Administrator Card Set](../../04-Featured-Articles/HSM-Runbooks/how-to-replace-the-administrator-card-set.md).

## Where key data lives: kmdata and the RFS

- **kmdata** holds the world file, module files, card set files, softcards, and key blobs. Default locations are `/opt/nfast/kmdata` on Linux and `C:\ProgramData\nCipher\Key Management Data` on Windows. Working files are under the `local` subfolder.
- The **Remote File System (RFS)** is a host that keeps the master copy of `kmdata` for network HSMs such as nShield Connect and nShield 5c. Clients synchronize with it (for example with `rfs-sync`).
- Network HSM clients must be **enrolled** with the HSM (`nethsmenroll`) and permitted in the HSM's client configuration. See [Enrolling a client with an nShield Connect](../../04-Featured-Articles/HSM-Runbooks/enrolling-a-client-with-an-nshield-connect.md).

> **Tip:** Back up `kmdata` after every key generation and card set change. Key blobs are encrypted, but the backup is useless without the ACS.

## Useful commands

```bash
# Show HSM status, mode, firmware and serial numbers
enquiry

# Show Security World, card set, softcard and key information
nfkminfo
nfkminfo -k

# Diagnostic bundle for support
nfdiag
```

## Key terms

| Term | Meaning |
|---|---|
| Security World | The nShield framework that links HSMs, card sets, and keys |
| ACS | Administrator Card Set, protects world-level operations |
| OCS | Operator Card Set, protects application keys |
| K of N | Quorum: K cards out of N are needed |
| Softcard | Passphrase-protected logical token stored as a file |
| Module-protected key | Key usable by any HSM in the world without operator credentials |
| kmdata | Folder holding encrypted world and key files |
| RFS | Remote File System, master `kmdata` store for network HSMs |
| ESN | Electronic Serial Number of an HSM |

## Common questions

### What happens if an HSM fails?
Install a replacement HSM, load it into the existing Security World with an ACS quorum, and point it at the same `kmdata`. Keys are available again because they are stored as blobs, not only inside the failed device.

### Can an OCS be replaced if cards are lost?
Only if key recovery was enabled when the world was created, and with an ACS quorum (`rocs`). See [Replacing a lost or damaged operator card](../../04-Featured-Articles/HSM-Runbooks/replacing-a-lost-or-damaged-operator-card.md).

### Where can staff learn more?
EC offers nShield [training](../../00-Working-with-EC-Support/ec-training-and-certification.md) and [HSM services](../../03-Services/hsm-services-deployment-and-integration.md).

## Related articles

- [What is an HSM](what-is-an-hsm.md)
- [How to update the quorum in an HSM](../../04-Featured-Articles/HSM-Runbooks/how-to-update-the-quorum-in-an-hsm.md)
- [Key recovery and restoration utilities](../../04-Featured-Articles/HSM-Runbooks/key-recovery-and-restoration-utilities.md)
- [Thales Luna HSM concepts](thales-luna-hsm-concepts.md)
- [Key ceremonies explained](key-ceremonies-explained.md)
- [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md)
