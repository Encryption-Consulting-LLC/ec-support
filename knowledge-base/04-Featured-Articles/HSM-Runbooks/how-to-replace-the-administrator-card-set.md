---
title: "How to Replace the Administrator Card Set"
category: "Featured Articles"
section: "HSM Runbooks"
article_type: "Runbook"
applies_to: "Entrust nShield Security World with nShield Solo XC, Connect XC, nShield 5s and nShield 5c"
summary: "Runbook to replace an Entrust nShield Administrator Card Set with racs after card loss or staff change, then share the world file and erase old cards."
keywords: ["replace ACS", "racs", "Administrator Card Set", "nShield", "lost admin card", "world file", "rfs-sync"]
last_reviewed: "2026-10-06"
---

# How to Replace the Administrator Card Set

This runbook explains how to replace an Entrust nShield Administrator Card Set (ACS) with the `racs` utility. It covers when to replace the ACS, how to run the ceremony, how to share the updated world file, and how to retire the old cards. It is for nShield administrators and ACS custodians.

## Overview

The ACS controls the Security World. It approves adding HSMs, recovering keys, replacing card sets, and other high-trust actions. Entrust advises that the loss or failure of one ACS card means the ACS should be replaced, while enough cards still exist to meet the quorum.

`racs` creates a new ACS and makes the old ACS invalid for the Security World. The new ACS keeps the same K of N as the old one. Keys and Operator Card Sets (OCS) are not changed.

Replace the ACS when:

- An ACS card is lost, stolen, or damaged.
- A custodian leaves the organization, or a passphrase may be known to others.
- Cards are near end of life or show read errors.
- An audit or policy requires periodic replacement.

## Applies to

- nShield Security World software 12.x, 13.x, and later.
- nShield Solo XC, Connect XC, nShield 5s, and nShield 5c.

Check the management guide for the installed version.

## Prerequisites

- The HSM in operational mode.
- A quorum (K) of the current ACS cards and their passphrases.
- Enough blank smart cards for the full new set (N), plus spares in case a card fails during writing.
- For network HSMs, a privileged client with the Security World software, and access to the Remote File System (RFS).
- An approved change and a ceremony log.

## Before starting

> **Warning:** If fewer than K working ACS cards remain, the ACS cannot be replaced and the Security World cannot be administered or recovered. Act as soon as a card is lost, not later.

> **Warning:** Do not start without enough blank cards. Entrust advises against starting the procedure without them.

> **Note:** `racs` cannot change K or N. To change the ACS quorum, a new Security World is needed. See [How to update the quorum in an HSM](how-to-update-the-quorum-in-an-hsm.md).

Pre-change checklist:

1. Run `nfkminfo -w` and record the ACS quorum (k and n) and world state.
2. Check each remaining ACS card with `cardpp --examine -m <module_id>` and confirm passphrases with `cardpp --check -m <module_id>`.
3. Back up `kmdata/local` from the client or RFS (Linux `/opt/nfast/kmdata/local`, Windows `%NFAST_KMDATA%\local`).
4. Confirm all custodians are available, with a witness.
5. Book a change window. Applications keep running, but avoid other Security World changes during the ceremony.

## Procedure

### Phase 1: Create the new ACS

1. On the client connected to the HSM, run:

   ```bash
   racs -m <module_id>
   ```

   If `-m` is left out, `racs` uses the first available module.
2. When prompted, insert the current ACS cards one at a time and enter each passphrase until the quorum is met.
3. When prompted, insert blank cards one at a time. Set a passphrase for each new card. Each custodian should type their own passphrase.
4. Label each new card (world name, card number, date) and record it in the ceremony log.

### Phase 2: Distribute the updated world file

`racs` changes the world file in `kmdata/local`. Every machine and HSM in the Security World needs the new file.

1. For network HSMs, copy the changed world file to the RFS. If the client is a cooperating client:

   ```bash
   rfs-sync --commit
   ```

2. On every other client:

   ```bash
   rfs-sync --update
   ```

3. For local HSMs on other hosts, copy the updated `kmdata/local` files to each host.
4. Network HSMs can fetch new world files from the RFS with:

   ```bash
   nethsmadmin -m <module_id> -w
   ```

### Phase 3: Test and retire the old ACS

1. Test the new cards. Run `cardpp --check -m <module_id>` for each new card.
2. Perform a harmless ACS-authorized test if the change plan allows one.
3. Erase the old ACS cards. After `racs`, they are no longer the current ACS, so they can be erased:

   ```bash
   createocs -m <module_id> -e
   ```

   On a network HSM, the front panel option **Security World mgmt > Card operations > Erase card** can also be used.
4. Destroy any card that cannot be erased, following the organization's media destruction policy, and record it.
5. Store the new cards in separate secure locations.

## Verification

- `nfkminfo -w` shows the same world, state `Initialised Usable`, and the expected ACS quorum.
- Each new card reads correctly with `cardpp --examine`.
- All clients and HSMs show the same world after `rfs-sync --update`.
- The ceremony log is signed by custodians and witness.

## Rollback

Once `racs` completes, the old ACS no longer controls the world. There is no rollback to the old cards. If the procedure stopped before completion, check `nfkminfo -w` and the vendor guidance, keep the old cards safe, and contact Entrust or EC support before trying again.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `racs` says the quorum is not met | Not enough valid ACS cards or wrong passphrases | Check cards with `cardpp --examine`; bring more custodians |
| Blank card rejected | Card belongs to another world or is not blank | Erase it with `createocs -e` or use a new card |
| Other clients still ask for old cards | Updated world file not distributed | Run `rfs-sync --update` or copy `kmdata/local` |
| Network HSM shows old world data | HSM has not fetched the new world file | Run `nethsmadmin -m <module_id> -w` |
| `createocs -e` will not erase an ACS card | Card still belongs to the current ACS | Confirm `racs` completed; current ACS cards cannot be erased |
| Process stopped mid-ceremony | Card or power error | Do not erase old cards; check world state; contact support |

## Related articles

- [How to update the quorum in an HSM](how-to-update-the-quorum-in-an-hsm.md)
- [Replacing a lost or damaged operator card](replacing-a-lost-or-damaged-operator-card.md)
- [Key recovery and restoration utilities](key-recovery-and-restoration-utilities.md)
- [Enrolling a client with an nShield Connect](enrolling-a-client-with-an-nshield-connect.md)
- [Entrust nShield Security World concepts](../../02-General/HSM/entrust-nshield-security-world-concepts.md)
- [Key ceremonies explained](../../02-General/HSM/key-ceremonies-explained.md)
