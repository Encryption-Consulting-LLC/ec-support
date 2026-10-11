---
title: "Key Ceremonies Explained"
category: "General"
section: "HSM"
article_type: "Concept"
applies_to: "Root and subordinate CA key generation, HSM initialization, code signing and other high-value keys"
summary: "What a key ceremony is, who takes part, how a root CA key ceremony runs step by step, what evidence to keep, and the common mistakes to avoid in practice."
keywords: ["key ceremony", "root CA key ceremony", "HSM key generation", "dual control", "split knowledge"]
last_reviewed: "2026-10-06"
---

# Key Ceremonies Explained

This article explains what a key ceremony is, why organizations hold them, and how a typical root Certificate Authority (CA) ceremony runs. It is for PKI owners, HSM administrators, security officers, and auditors who plan or witness ceremonies.

## What it is

A key ceremony is a formal, scripted, and witnessed event in which high-value cryptographic keys are generated, used, backed up, or destroyed. It is most often used to create a root CA key in a Hardware Security Module (HSM), but it also applies to HSM initialization, subordinate CA signing, CRL signing on an offline root, card set replacement, and key destruction.

The ceremony produces evidence that the key was created correctly, that no single person had control of it, and that every step followed an approved script.

## Why it matters

- **Trust.** Relying parties and auditors need proof that a root key was created securely.
- **Dual control and split knowledge.** No one person should be able to use, copy, or rebuild a critical key alone.
- **Compliance.** Public CAs must follow the CA/Browser Forum Baseline Requirements and WebTrust or ETSI audits, which expect witnessed ceremonies. Private PKIs often adopt the same model for their Certificate Policy (CP) and Certification Practice Statement (CPS).
- **Recovery.** A ceremony that records card holders and backups makes later recovery possible.

## Roles

| Role | Responsibility |
|---|---|
| Ceremony administrator (master of ceremonies) | Leads the event and reads the script step by step |
| HSM operators or administrators | Perform actions on the HSM and CA server |
| Custodians (key or card holders) | Hold quorum cards, PED keys, or passphrases. Each custodian holds only a share |
| Witnesses | Observe and sign that each step was done as scripted |
| Auditor (internal or external) | Independently confirms the process, required for public CAs |
| Scribe or recorder | Logs times, outputs, and any deviations; manages video recording if used |

## How it works

### Before the ceremony

1. Write and approve the **ceremony script**. It lists every command, expected output, and sign-off point.
2. Prepare the **hardware and software**: the HSM, a clean offline CA server or laptop, HSM client software, verified installation media with checksums, and new smart cards or PED keys.
3. Agree on **quorum** values (for example 3 of 5 for Entrust nShield card sets, or M of N for Thales Luna PED keys) and name the custodians.
4. Book a **secure room** with controlled access, and prepare tamper-evident bags, a safe, and a logbook.
5. Do a **dry run** in a lab with test hardware.

### During the ceremony

1. Record attendees, identities, start time, and the serial numbers of all hardware and tamper-evident bags.
2. Confirm the HSM firmware and mode (for example FIPS approved mode) and that the device and seals are intact.
3. Initialize the HSM or Security World and create the administrator quorum. Each custodian sets their own passphrase or PIN privately.
4. Generate the CA key pair inside the HSM. Record the key name, algorithm, and size (for example RSA 4096 or ECDSA P-384).
5. Build the CA certificate (for a root, self-signed; for a subordinate, a Certificate Signing Request (CSR) signed by the parent). For Microsoft AD CS, a `CAPolicy.inf` file in `%windir%` sets values such as CRL periods, key renewal settings, and path length.
6. Publish the first Certificate Revocation List (CRL) and export the CA certificate and CRL for distribution.
7. Back up the HSM security domain and key data as the vendor requires, and back up the CA configuration.
8. Place cards, PED keys, and backup media in numbered tamper-evident bags. Record each bag number and hand it to the named custodian or safe.
9. Shut down and secure the offline system.

### After the ceremony

1. All participants sign the script and logbook.
2. The auditor writes a report, if required.
3. Store the signed records and any video in a protected archive.
4. Distribute the root certificate to trust stores (for example through Group Policy for an Active Directory forest).

## Evidence to keep

- Signed ceremony script with all outputs and deviations.
- Attendee list with identity checks.
- Hardware serial numbers and tamper-evident bag numbers.
- Hashes (thumbprints) of the CA certificate and installation media.
- Video recording, if part of policy.
- Custodian acknowledgment forms.

## Common mistakes

- No dry run, which leads to improvised steps on the day.
- Too few custodians, or K equal to N, so one lost card blocks recovery.
- Custodians storing their cards and passphrases together.
- Forgetting to record the root CRL Next Update date, which later causes an expired CRL outage.
- Leaving the offline root connected to a network.

## Key terms

| Term | Meaning |
|---|---|
| Dual control | Two or more people must act together to perform an action |
| Split knowledge | No single person knows the whole secret |
| Quorum | The minimum number of shares (K of N or M of N) needed |
| Tamper-evident bag | A sealed, numbered bag that shows if it was opened |
| CAPolicy.inf | Configuration file read by AD CS during CA installation and renewal |

## Common questions

### How long does a root key ceremony take?
Usually a few hours for a well-rehearsed private PKI root. Public CA ceremonies take longer due to audit steps.

### Can a key ceremony be done remotely?
Some steps can use remote tools (for example Luna Remote PED or nShield remote administration), but most organizations keep root ceremonies in person for stronger witness evidence.

### Can EC run a ceremony?
Yes. EC's [PKI design and implementation](../../03-Services/pki-design-and-implementation.md) and [HSM services](../../03-Services/hsm-services-deployment-and-integration.md) include scripted ceremonies, and [PKI-as-a-Service](../../01-Products/PKI-as-a-Service/pki-as-a-service-overview.md) handles them as part of the managed service.

## Related articles

- [Two-tier vs three-tier PKI hierarchy](../PKI/two-tier-vs-three-tier-pki-hierarchy.md)
- [Entrust nShield Security World concepts](entrust-nshield-security-world-concepts.md)
- [Thales Luna HSM concepts](thales-luna-hsm-concepts.md)
- [How to update the quorum in an HSM](../../04-Featured-Articles/HSM-Runbooks/how-to-update-the-quorum-in-an-hsm.md)
- [Root CA CRL renewal (offline root)](../../04-Featured-Articles/PKI-Runbooks/root-ca-crl-renewal-offline-root.md)
- [PKI security best practices](../PKI/pki-security-best-practices.md)
