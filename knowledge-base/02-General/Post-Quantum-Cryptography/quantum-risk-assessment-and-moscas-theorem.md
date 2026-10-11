---
title: "Quantum Risk Assessment and Mosca's Theorem"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "Concept"
applies_to: "Risk owners, security architects and PQC program teams"
summary: "How to assess quantum risk with Mosca's theorem (X + Y > Z), classify data by shelf life, and rank systems for post-quantum cryptography migration."
keywords: ["Mosca's theorem", "quantum risk assessment", "CRQC", "harvest now decrypt later", "data shelf life", "PQC prioritization"]
last_reviewed: "2026-10-06"
---

# Quantum Risk Assessment and Mosca's Theorem

A quantum risk assessment shows which systems and data are most exposed to a future quantum computer and in what order to fix them. Mosca's theorem is the simplest tool for this. This article explains the theorem, walks through a worked example, and lists the inputs a good assessment needs.

## What it is

Mosca's theorem was proposed by Michele Mosca of the University of Waterloo. It compares three time spans:

- **X: data shelf life.** How many years the data must stay confidential, or how long a signature must stay trusted.
- **Y: migration time.** How many years it will take to move the system to quantum-safe cryptography.
- **Z: time until a CRQC.** How many years until a Cryptographically Relevant Quantum Computer (CRQC) can break RSA or Elliptic Curve Cryptography (ECC).

The rule:

> **If X + Y > Z, act now.** The data will still need protection after a CRQC exists, or the migration will not finish in time.

## Why it matters

- **Harvest now, decrypt later.** Encrypted data captured today can be broken later. If X is long, the risk already exists.
- **Migration is slow.** Y is often 5 to 10 years for large organizations, because CAs, HSMs, applications, devices and partners all must change.
- **Z is uncertain.** No one knows the exact date. Using a range (for example best case, expected case, worst case) gives a better picture than one number.
- **Regulators set their own Z.** NIST IR 8547 (draft) proposes deprecation of RSA, ECDSA and ECDH after 2030 and disallowance after 2035. CNSA 2.0 sets 2030 to 2035 deadlines for National Security Systems. For compliance, these dates act as a hard Z.

## How it works

1. **List the assets.** Use a Cryptographic Bill of Materials (CBOM) to see each system, the algorithms it uses, and the data it protects. See [What is a CBOM?](../CBOM/what-is-a-cbom.md).
2. **Set X for each data type.** Use the records retention schedule and legal requirements. For signatures, use the time the signature must remain valid (for example firmware in the field or signed contracts).
3. **Estimate Y for each system.** Consider vendor support, HSM and CA readiness, number of dependencies, and change windows.
4. **Choose Z.** Pick a planning value or range. Many organizations use the regulatory dates (2030 and 2035) as a floor.
5. **Calculate X + Y and compare to Z.** Mark each system as "act now", "plan", or "monitor".
6. **Add impact.** Combine the time result with business impact (critical, high, medium, low) to get a final priority.
7. **Record and review.** Put results in the risk register. Review each year or when Z estimates change.

### Worked example

Assume a planning value of Z = 9 years (2035, measured from 2026).

| System | Data or use | X (years) | Y (years) | X + Y | Result |
|---|---|---|---|---|---|
| Patient records API | Health records | 25 | 4 | 29 | Act now |
| Internal root CA | Trust anchor for all internal certificates | 15 | 5 | 20 | Act now |
| Firmware signing for field devices | Devices in use for 15 years | 15 | 6 | 21 | Act now |
| Payment session TLS | Session data | 2 | 3 | 5 | Plan |
| Marketing website | Public content | 0 | 2 | 2 | Monitor |

> **Note:** Signature risk differs from encryption risk. A recorded signature cannot be forged "later" in the same way. The concern is that once a CRQC exists, an attacker can forge new signatures with a vulnerable key. Long-lived trust anchors (root CAs and firmware keys) must be replaced before that point.

## Inputs for a good assessment

| Input | Source |
|---|---|
| Cryptographic inventory | CBOM from automated discovery |
| Data classification and retention | Data governance and legal teams |
| System criticality | Business impact analysis |
| Vendor PQC roadmaps | Vendor management and procurement |
| Regulatory deadlines | Compliance team (NIST IR 8547, CNSA 2.0, sector rules) |
| Dependencies between systems | Architecture diagrams, CBOM dependency data |

## Key terms

| Term | Meaning |
|---|---|
| X | Data shelf life: years of required confidentiality or trust |
| Y | Migration time: years to reach quantum-safe cryptography |
| Z | Years until a CRQC exists |
| CRQC | Cryptographically Relevant Quantum Computer |
| Harvest now, decrypt later | Capturing encrypted data today to decrypt with a future quantum computer |

## Common questions

### What value of Z should be used?

There is no agreed value. Use a range and test the result against each. If a system is "act now" even in the optimistic case, it is a top priority. Many teams align Z with regulatory dates.

### Can Y be reduced?

Yes. Crypto-agility (central crypto services, automated certificate management, and a current CBOM) shortens migration time. See [Crypto-agility explained](crypto-agility-explained.md).

### Does EC offer help with this?

EC PQC Advisory Services include a quantum risk assessment that applies this method across the estate. See [PQC Advisory and readiness assessment](../../03-Services/pqc-advisory-and-readiness-assessment.md).

## Related articles

- [PQC maturity model](pqc-maturity-model.md)
- [Building a PQC migration roadmap](building-a-pqc-migration-roadmap.md)
- [What is post-quantum cryptography?](what-is-post-quantum-cryptography.md)
- [Harvest now, decrypt later explained](../../05-Popular-Right-Now/harvest-now-decrypt-later-explained.md)
- [CBOM use cases and compliance drivers](../CBOM/cbom-use-cases-and-compliance-drivers.md)
