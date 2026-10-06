---
title: "FIPS 140-3 Security Levels Explained"
category: "General"
section: "HSM"
article_type: "Concept"
applies_to: "Cryptographic modules and HSMs validated under NIST FIPS 140-3 and FIPS 140-2"
summary: "A guide to FIPS 140-3 security levels 1 to 4, how CMVP validation works, how it differs from FIPS 140-2, and what the September 2026 FIPS 140-2 sunset means."
keywords: ["FIPS 140-3", "FIPS 140-3 security levels", "CMVP", "FIPS 140-2 sunset", "HSM validation"]
last_reviewed: "2026-10-06"
---

# FIPS 140-3 Security Levels Explained

This article explains Federal Information Processing Standard (FIPS) 140-3, its four security levels, and how a product gets validated. It is for buyers, auditors, and administrators who need to choose or justify a Hardware Security Module (HSM) or other cryptographic module.

## What it is

FIPS 140-3, "Security Requirements for Cryptographic Modules", is a US government standard published by the National Institute of Standards and Technology (NIST). It was approved in March 2019 and became effective on September 22 2019. It replaces FIPS 140-2.

FIPS 140-3 does not list the requirements itself. It points to two international standards:

- **ISO/IEC 19790:2012** for the security requirements.
- **ISO/IEC 24759:2017** for the test methods.

NIST Special Publication (SP) 800-140 and its companion documents (800-140A to 800-140F) describe the US-specific changes and documentation.

## Why it matters

US federal agencies must use validated modules to protect sensitive data, and many other sectors follow the same rule: finance, healthcare, payments, and public certificate authorities. The CA/Browser Forum code signing rules, for example, require keys to be stored in hardware validated to FIPS 140-2 Level 2, Common Criteria EAL 4+, or an equivalent. FIPS 140-3 validations meet that need as well.

### The FIPS 140-2 sunset

The Cryptographic Module Validation Program (CMVP) stopped accepting new FIPS 140-2 submissions in 2022. Remaining FIPS 140-2 certificates move to the **Historical** list on **September 21 2026**. Modules on the Historical list should not be included in new procurements. Organizations should plan to use FIPS 140-3 validated modules. See [FIPS 140-2 sunset and FIPS 140-3 migration](../../05-Popular-Right-Now/fips-140-2-sunset-september-2026-fips-140-3-migration.md).

## How it works

### The four security levels

| Level | Physical security | Authentication | Other notable requirements |
|---|---|---|---|
| Level 1 | Production-grade components, no extra physical protection | None required | Approved algorithms, self-tests |
| Level 2 | Tamper evidence (seals, coatings, locks) | Role-based: the operator proves a role | Suitable for many software and hardware modules |
| Level 3 | Tamper resistance with detection and response that can erase secrets | Identity-based: each operator is identified and authenticated | Environmental failure protection (EFP) or environmental failure testing (EFT); protected entry and exit of sensitive security parameters |
| Level 4 | Complete protective envelope, active tamper response | Multi-factor authentication | EFP required, protection against fault injection |

A module also receives a level for each of several areas (for example physical security, roles and authentication, sensitive security parameter management, self-tests). The **overall level** is the lowest of these.

### The validation process

1. The vendor builds a module and documents its security policy.
2. An accredited Cryptographic and Security Testing (CST) laboratory tests the module and its algorithms. Algorithms are first tested under the Cryptographic Algorithm Validation Program (CAVP).
3. The lab submits a report to the CMVP, a joint program of NIST and the Canadian Centre for Cyber Security.
4. The CMVP reviews the report and, if satisfied, issues a certificate with a number. The module appears on the CMVP list as "Active".
5. Certificates are normally active for five years, after which they move to the Historical list.

While a module is being reviewed, it may appear on the **Modules In Process** list. Being on that list is not the same as being validated.

## Key differences from FIPS 140-2

- Requirements now come from ISO/IEC 19790 and 24759.
- Level 3 requires identity-based authentication (Level 2 is role-based), and Level 4 requires multi-factor authentication.
- A new area covers non-invasive (side-channel) attack mitigation, which modules may claim.
- Self-test rules changed, including conditional and periodic tests.
- Terms changed: "Critical Security Parameters" became "Sensitive Security Parameters" (SSPs), which include public keys that need integrity protection.

## How to read a certificate

When checking an HSM or library on the CMVP website:

- Confirm the **certificate status** is Active.
- Check the **overall level** and the **standard** (FIPS 140-3 vs FIPS 140-2).
- Check the exact **hardware version and firmware version**. A validation covers only the listed versions.
- Read the **security policy**. It describes the approved mode of operation, which often must be turned on during setup.

> **Note:** Many HSMs can run in both FIPS approved and non-approved modes. For example, an nShield Security World or a Luna HSM policy must be set up for the validated mode. Verify against the vendor documentation for the installed version.

## Key terms

| Term | Meaning |
|---|---|
| CMVP | Cryptographic Module Validation Program, run by NIST and the Canadian Centre for Cyber Security |
| CAVP | Cryptographic Algorithm Validation Program, tests individual algorithms |
| Security policy | Public document that describes how to run a module in its validated mode |
| SSP | Sensitive Security Parameter, any secret or integrity-critical value |
| EFP and EFT | Environmental failure protection and testing, for voltage and temperature extremes |
| Historical list | Certificates no longer recommended for new purchases |

## Common questions

### Does Level 4 mean better for every use case?
No. Level 3 is the common choice for certificate authority and code signing keys. Level 4 suits devices in physically hostile settings.

### Is a FIPS 140-2 HSM suddenly insecure after September 21 2026?
No. The device does not change. Its certificate becomes Historical, which affects compliance for new purchases. Plan replacement or firmware upgrades to a FIPS 140-3 validated version.

### Does EC offer FIPS 140-3 HSMs?
EC's [HSM-as-a-Service](../../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md) uses FIPS 140-3 validated HSMs, and [Compliance Advisory](../../03-Services/compliance-advisory-services.md) can help map requirements.

## Related articles

- [What is an HSM](what-is-an-hsm.md)
- [Entrust nShield Security World concepts](entrust-nshield-security-world-concepts.md)
- [Thales Luna HSM concepts](thales-luna-hsm-concepts.md)
- [CA/B Forum code signing key storage requirements](../Code-Signing/ca-b-forum-code-signing-key-storage-requirements.md)
- [FIPS 140-2 sunset and FIPS 140-3 migration](../../05-Popular-Right-Now/fips-140-2-sunset-september-2026-fips-140-3-migration.md)
