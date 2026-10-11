---
title: "PQC Maturity Model"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "Concept"
applies_to: "Organizations planning or running a post-quantum cryptography migration"
summary: "EC's six-level PQC maturity model, from Level 0 Unaware to Level 5 Crypto-agile, across six dimensions, with exit criteria and how to measure progress."
keywords: ["PQC maturity model", "quantum readiness", "crypto-agility", "PQC readiness assessment", "CBOM", "PQC roadmap"]
last_reviewed: "2026-10-06"
---

# PQC Maturity Model

The Encryption Consulting (EC) Post-Quantum Cryptography (PQC) Maturity Model gives organizations a simple way to measure where they stand on quantum readiness and what to do next. It defines six levels and six dimensions. This article is for security leaders, risk owners, and program managers who need to report progress and plan the next step.

## What it is

The model has six levels, numbered 0 to 5. Each level describes a stage in the journey from no awareness of the quantum threat to full crypto-agility. An organization is scored on six dimensions. The overall level is the lowest level reached across all six dimensions, because a weak dimension holds the whole program back.

| Level | Name | One-line description |
|---|---|---|
| 0 | Unaware | The quantum threat is not on the agenda |
| 1 | Aware | Leadership knows about the threat, but no structured work has started |
| 2 | Inventoried | Cryptographic assets are discovered and recorded in a Cryptographic Bill of Materials (CBOM) |
| 3 | Planned and Piloting | A prioritized roadmap exists and PQC is tested in pilots |
| 4 | Migrating | Production systems are moving to hybrid or PQC algorithms at scale |
| 5 | Crypto-agile | Algorithms can be changed by policy, quickly and safely, across the estate |

### Dimensions

| Dimension | What it measures |
|---|---|
| Governance and ownership | Executive sponsor, named owner, policy, budget, reporting |
| Cryptographic inventory | Coverage and freshness of the CBOM |
| Risk assessment | Use of data shelf life and system criticality to rank risk (for example Mosca's theorem) |
| Technology readiness | Support for PQC in CAs, HSMs, libraries, protocols and applications |
| Vendor and supply chain | PQC roadmaps and contract terms from vendors and partners |
| People and skills | Training, roles and hands-on experience with PQC |

## Level by dimension

| Dimension | 0 Unaware | 1 Aware | 2 Inventoried | 3 Planned and Piloting | 4 Migrating | 5 Crypto-agile |
|---|---|---|---|---|---|---|
| Governance and ownership | No owner | Topic raised at leadership level; informal owner | Named owner and sponsor; PQC in risk register | Funded program, approved policy, steering group | Program tracked with KPIs; policy enforced | Crypto policy governs all algorithm choices; reviewed yearly |
| Cryptographic inventory | None | Partial lists in spreadsheets | CBOM covers most critical systems | CBOM covers the estate and is refreshed on a schedule | CBOM updated continuously, including CI/CD | Real-time CBOM drives automated policy checks |
| Risk assessment | None | General awareness of harvest now, decrypt later | Data and systems classified by shelf life | Mosca's theorem applied; migration order agreed | Risk scores updated as systems migrate | Risk continuously measured and reported |
| Technology readiness | Unknown | Some vendor claims collected | Gaps known for CAs, HSMs, libraries | Lab and pilot with hybrid TLS and PQC certificates | Hybrid or PQC in production for priority systems | Central crypto services; algorithm change by configuration |
| Vendor and supply chain | Not considered | Ad hoc questions to key vendors | Vendor list mapped to crypto dependencies | PQC requirements in RFPs and renewals | Vendors delivering PQC; contracts enforce dates | Supply chain CBOMs requested and checked |
| People and skills | No knowledge | Briefings for leaders | Core team trained on PQC basics | Engineers have lab experience | Runbooks and support processes in place | Crypto-agility built into engineering standards |

## Characteristics and exit criteria per level

### Level 0: Unaware

**Characteristics:** No one owns cryptography as a topic. Algorithms and certificates are chosen by default settings. Quantum risk is not in any risk register.

**Exit criteria:**
- A leader has been briefed on the quantum threat and on deadlines such as NIST IR 8547 (draft) and CNSA 2.0.
- The topic is recorded as a risk.

### Level 1: Aware

**Characteristics:** Leadership understands the threat. Some teams have read about PQC. There is no inventory and no plan.

**Exit criteria:**
- A named owner and an executive sponsor exist.
- A scope for discovery is agreed (systems, data, business units).
- Budget for discovery is approved.

### Level 2: Inventoried

**Characteristics:** A CBOM lists algorithms, keys, certificates, protocols and libraries for most critical systems. Quantum-vulnerable assets are flagged.

**Exit criteria:**
- The CBOM covers all systems in scope, including HSMs, key managers, code repositories and network endpoints.
- Data types are classified by how long they must stay secret.
- Gaps in CA, HSM and application support are documented.

### Level 3: Planned and Piloting

**Characteristics:** A risk-ranked roadmap exists. PQC is tested in a lab and in limited pilots, for example hybrid TLS key exchange or a test CA issuing ML-DSA certificates.

**Exit criteria:**
- A migration roadmap is approved with phases, owners and dates.
- At least one pilot has run with measured performance and compatibility results.
- PQC requirements appear in procurement templates.
- A crypto policy defines approved, deprecated and disallowed algorithms.

### Level 4: Migrating

**Characteristics:** Priority systems run hybrid or PQC algorithms in production. Progress is measured against the CBOM.

**Exit criteria:**
- All high-risk systems (by Mosca's theorem) are protected with PQC key establishment.
- Signature migration is underway for CAs and code signing where ecosystem support allows.
- Rollback and support runbooks are tested.
- Remaining quantum-vulnerable assets have a dated plan or an approved exception.

### Level 5: Crypto-agile

**Characteristics:** Cryptography is delivered as a central, policy-driven service. Algorithms can be changed through configuration. The CBOM is continuous and feeds automated checks.

**Sustaining criteria (there is no exit):**
- A future algorithm change can be planned and rolled out within an agreed target time.
- New systems pass crypto policy checks before release.
- Metrics are reported to leadership at least once a year.

## How to use the model

1. **Score each dimension.** Use the table above. Pick the highest level where all criteria are met.
2. **Take the lowest score** as the overall level.
3. **Focus on the weakest dimension.** Raising it gives the best return.
4. **Re-score every 6 to 12 months** and after major milestones.

> **Tip:** Organizations often score high on awareness but low on inventory. Without an inventory, later levels cannot be reached. Treat the CBOM as the gate between Level 1 and Level 3.

## How EC tools and services map to the model

| EC offering | Where it helps | How |
|---|---|---|
| CBOM Secure | Levels 2 to 5, Cryptographic inventory and Technology readiness | Discovers algorithms, keys and certificates across code, binaries, keystores, HSMs, key managers and cloud. Flags quantum-vulnerable assets and exports a CycloneDX 1.6 CBOM. Continuous scans support Levels 4 and 5. See [Using CBOM Secure for PQC readiness](../../01-Products/CBOM-Secure/using-cbom-secure-for-pqc-readiness.md). |
| PQC Advisory Services | Levels 1 to 4, Governance, Risk, Vendor and People | Quantum risk assessment, NIST algorithm selection and a phased migration roadmap. See [PQC Advisory and readiness assessment](../../03-Services/pqc-advisory-and-readiness-assessment.md). |
| CertSecure Manager and CodeSign Secure | Levels 4 and 5, Technology readiness | Central certificate and signing services make algorithm change a policy decision. |

## Common questions

### Why is the overall level the lowest dimension score?

A strong technology stack cannot be migrated safely without an inventory or an owner. The lowest score shows the real limit on progress.

### How long does it take to move between levels?

It depends on size and complexity. Moving from Level 1 to Level 2 is often the fastest jump with automated discovery. Level 4 usually takes several years for large estates.

### Is Level 5 required?

Level 5 is the target for organizations with long-lived sensitive data or regulatory deadlines. Others may set Level 4 as the target for 2030 and Level 5 as a long-term goal.

## Related articles

- [What is post-quantum cryptography?](what-is-post-quantum-cryptography.md)
- [Quantum risk assessment and Mosca's theorem](quantum-risk-assessment-and-moscas-theorem.md)
- [Building a PQC migration roadmap](building-a-pqc-migration-roadmap.md)
- [Crypto-agility explained](crypto-agility-explained.md)
- [What is a CBOM?](../CBOM/what-is-a-cbom.md)
- [PQC readiness checklist 2026](../../05-Popular-Right-Now/pqc-readiness-checklist-2026.md)
