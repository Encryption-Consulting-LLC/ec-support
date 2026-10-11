---
title: "FIPS 140-2 Sunset (September 21, 2026): What It Means and How to Move to FIPS 140-3"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Reference"
applies_to: "HSMs, cryptographic libraries, operating systems, network devices, federal and regulated procurement"
summary: "FIPS 140-2 certificates moved to the CMVP Historical list on September 21, 2026. Learn what changed, what still works, and how to plan a FIPS 140-3 migration."
keywords: ["FIPS 140-2 sunset", "FIPS 140-3", "CMVP Historical list", "FIPS 140-2 end of life", "cryptographic module validation", "HSM FIPS 140-3"]
primary_keyword: "FIPS 140-2 sunset"
secondary_keywords: ["FIPS 140-3 migration", "FIPS 140-2 historical list", "FIPS 140-2 vs FIPS 140-3", "CMVP validation", "FIPS 140-2 September 2026", "FIPS 140-3 HSM"]
last_reviewed: "2026-10-06"
---

# FIPS 140-2 Sunset (September 21, 2026): What It Means and How to Move to FIPS 140-3

On September 21, 2026, all remaining FIPS 140-2 certificates moved to the Historical list of the Cryptographic Module Validation Program (CMVP). From that date, FIPS 140-3 is the only active validation for cryptographic modules. This article explains what changed, what did not change, and how to plan the move to FIPS 140-3. It is written for compliance teams, procurement, and owners of Hardware Security Modules (HSMs) and cryptographic software.

## Key takeaways

- FIPS 140-2 validations moved to the CMVP Historical list on September 21, 2026.
- Federal agencies should not include Historical modules in new acquisitions. Existing systems may continue to use them, based on the agency's risk decision.
- Modules do not stop working. The change is about compliance status, not technology.
- New procurements should require an active FIPS 140-3 certificate, not "FIPS 140-2 validated" or "in process" claims alone.
- Check the CMVP database directly for certificate numbers, status, and security level.
- Combine the FIPS 140-3 move with post-quantum planning where possible, since many new modules add ML-KEM and ML-DSA.

## What is FIPS 140?

Federal Information Processing Standard (FIPS) 140 sets security requirements for cryptographic modules, such as HSMs, cryptographic libraries, smart cards, and encryption appliances. The CMVP, run jointly by NIST and the Canadian Centre for Cyber Security, tests and certifies modules against it. U.S. federal agencies, and many regulated industries, require validated modules to protect sensitive data.

## What happened on September 21, 2026?

FIPS 140-2 certificates are valid for five years from validation, and the last FIPS 140-2 submissions were accepted in April 2022. On September 21, 2026, every remaining FIPS 140-2 certificate moved to the Historical list.

| Date | Event |
|---|---|
| March 2019 | FIPS 140-3 approved |
| September 22, 2019 | FIPS 140-3 became effective |
| September 22, 2020 | CMVP began FIPS 140-3 testing |
| April 1, 2022 | Last date for new FIPS 140-2 submissions |
| September 21, 2026 | All FIPS 140-2 certificates moved to the Historical list |

## What does the Historical list mean in practice?

| Question | Answer |
|---|---|
| Does the module still encrypt correctly? | Yes. Nothing changes in the hardware or software. |
| Can federal agencies buy it for new systems? | They should not include Historical modules in new acquisitions. |
| Can existing systems keep using it? | CMVP guidance supports continued use in existing systems, subject to the agency's risk decision. |
| Will auditors accept it? | It depends on the framework. Expect questions, and document a migration plan. |

> **Warning:** Frameworks that reference FIPS validation, such as FedRAMP, Cybersecurity Maturity Model Certification (CMMC), and some PCI DSS controls, may treat Historical modules as a finding. Confirm with the assessor.

## What is the difference between FIPS 140-2 and FIPS 140-3?

| Area | FIPS 140-2 | FIPS 140-3 |
|---|---|---|
| Basis | U.S.-specific requirements | Aligned with ISO/IEC 19790 and ISO/IEC 24759 |
| Security levels | 1 to 4 | 1 to 4 |
| Self-tests | Power-up tests | Pre-operational and conditional tests, with clearer rules |
| Roles and authentication | Identity-based authentication at Level 3 | Stronger authentication requirements, including at Level 3 and 4 |
| Non-invasive attacks | Not covered | Addressed (side-channel mitigations) |
| Lifecycle and documentation | Less formal | More structured lifecycle assurance |
| Status after September 21, 2026 | Historical | Active |

See [FIPS 140-3 security levels explained](../02-General/HSM/fips-140-3-security-levels-explained.md) for more detail.

## How to plan a FIPS 140-3 migration

### Step 1: Inventory modules

List every cryptographic module that a compliance requirement depends on: HSMs, operating system crypto libraries, Java and OpenSSL providers, VPN appliances, and cloud key services. Record the certificate number and version of each.

### Step 2: Check CMVP status

For each module, search the CMVP validated modules database. Note:

- Whether an active FIPS 140-3 certificate exists.
- The exact firmware or software version covered.
- The security level and any caveats in the security policy.

> **Note:** A FIPS 140-3 certificate covers specific versions only. Running a different firmware version than the validated one may not be compliant.

### Step 3: Decide per module

| Situation | Action |
|---|---|
| Vendor has a FIPS 140-3 certificate for a newer version | Plan an upgrade to the validated version |
| Validation is in the CMVP queue | Document risk and track the vendor timeline |
| No FIPS 140-3 plan from the vendor | Plan replacement |
| Module protects only non-regulated data | Accept and document risk if policy allows |

### Step 4: Upgrade with care

For HSMs, a firmware upgrade can change key formats, require new administrator steps, or affect high-availability groups. Test in a non-production environment, take verified backups, and schedule a change window. See [Updating HSM firmware](../04-Featured-Articles/HSM-Runbooks/updating-hsm-firmware.md).

### Step 5: Update procurement

Require an active FIPS 140-3 certificate number in contracts and requests for proposal. Ask about post-quantum algorithm support and the validation plan for it.

## How does FIPS 140-3 relate to post-quantum cryptography?

FIPS 140-3 modules can include the new PQC algorithms (ML-KEM, ML-DSA, SLH-DSA) once those are tested under the Cryptographic Algorithm Validation Program (CAVP). Moving to FIPS 140-3 hardware now is a good time to choose modules with a PQC roadmap, so a second hardware refresh is not needed soon after.

## How EC can help

- [HSM-as-a-Service overview](../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md): FIPS 140-3 validated HSMs without hardware procurement.
- [HSM services: deployment and integration](../03-Services/hsm-services-deployment-and-integration.md): selection, migration, and upgrade support.
- [Compliance advisory services](../03-Services/compliance-advisory-services.md): map FIPS requirements to frameworks.
- [What is an HSM and how does it work](what-is-an-hsm-and-how-does-it-work.md): background for non-specialists.
- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): inventory cryptographic modules and algorithms.

## Frequently asked questions

### Is FIPS 140-2 still valid after September 2026?

FIPS 140-2 certificates are now on the Historical list. Modules still work, and existing federal systems may keep using them under a risk decision, but they should not be chosen for new acquisitions.

### Do FIPS 140-2 modules need to be removed immediately?

No. CMVP guidance supports continued use in existing systems. Organizations should document the risk and plan a move to FIPS 140-3.

### How can an organization check if a product is FIPS 140-3 validated?

Search the NIST CMVP validated modules database by vendor or certificate number. Confirm the status is Active, the standard is FIPS 140-3, and the version matches what is deployed.

### Is FIPS 140-3 Level 3 required for HSMs?

Not always. The level depends on the use case and framework. Publicly trusted code signing and CA keys, for example, generally require at least FIPS 140-2 Level 2 or equivalent under CA/Browser Forum rules, and many organizations choose Level 3.

### Does "FIPS compliant" mean the same as "FIPS validated"?

No. "Validated" means the module has a CMVP certificate. "Compliant" or "uses FIPS algorithms" is a vendor claim without independent validation.
