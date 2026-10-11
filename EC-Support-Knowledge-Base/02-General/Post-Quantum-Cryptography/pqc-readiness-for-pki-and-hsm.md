---
title: "PQC Readiness for PKI and HSM"
category: "General"
section: "Post-Quantum Cryptography"
article_type: "Concept"
applies_to: "Private PKI (Microsoft AD CS and other CAs), HSMs (Thales Luna, Entrust nShield, cloud HSMs), PKIaaS and HSMaaS"
summary: "What PKI and HSM teams must check to be ready for post-quantum cryptography: CA software, HSM firmware, APIs, certificate sizes, revocation and validation."
keywords: ["PQC PKI", "PQC HSM", "ML-DSA certificates", "HSM firmware PQC", "PKCS#11 PQC", "quantum-safe CA"]
last_reviewed: "2026-10-06"
---

# PQC Readiness for PKI and HSM

Public Key Infrastructure (PKI) and Hardware Security Modules (HSMs) sit at the center of every post-quantum cryptography (PQC) migration. A CA cannot issue PQC certificates if its software or HSM cannot create and use PQC keys. This article lists what PKI and HSM teams should check, and in what order. It is for PKI administrators, HSM administrators and architects.

## What it is

PQC readiness for PKI and HSM means that the full chain of trust can create, store, use, publish and validate keys and certificates that use NIST PQC algorithms such as ML-DSA (FIPS 204), SLH-DSA (FIPS 205) and ML-KEM (FIPS 203). It covers:

- The HSM that protects CA keys.
- The CA software that issues certificates and revocation data.
- The revocation services: Certificate Revocation Lists (CRLs) and Online Certificate Status Protocol (OCSP).
- The relying parties that validate certificates.
- The enrollment protocols and automation tools.

## Why it matters

- **Root CA keys live a long time.** A root created today may be in use in 2040. If it uses RSA, it may be breakable within its lifetime.
- **Everything depends on the CA.** If the CA and HSM are not ready, no other system can get PQC certificates.
- **Hardware refresh takes time.** HSM procurement, firmware validation and key ceremonies are planned months or years in advance.
- **FIPS 140-2 sunset.** FIPS 140-2 certificates move to the Cryptographic Module Validation Program (CMVP) Historical list on September 21, 2026. New HSM purchases should target FIPS 140-3, ideally with validated PQC algorithms.

## How it works

Readiness is checked layer by layer, from the HSM up to the relying party.

1. **HSM firmware and validation.** Confirm the HSM firmware supports ML-DSA, ML-KEM, and, if needed, SLH-DSA, LMS and XMSS. Confirm whether the PQC algorithms are inside the FIPS 140-3 validation boundary. Major vendors, including Thales and Entrust, have released or announced PQC-capable firmware. Verify against the vendor documentation for the installed version.
2. **HSM interfaces.** Confirm the interface the CA uses (PKCS#11, Microsoft CNG Key Storage Provider, Java JCE) exposes the PQC mechanisms. OASIS PKCS#11 version 3.2 adds standard PQC mechanisms. Vendor-specific mechanisms may be needed until all layers support 3.2.
3. **CA software.** Confirm the CA can generate PQC key pairs in the HSM, build certificates with the correct algorithm identifiers, and sign CRLs and OCSP responses with PQC keys. For Microsoft AD CS, verify against the Microsoft documentation for the installed Windows Server version.
4. **Certificate profiles.** Update templates and profiles for new algorithms and key usages. Decide on pure PQC, composite, or dual chains. See [Hybrid and composite certificates](hybrid-and-composite-certificates.md).
5. **Revocation.** PQC signatures make CRLs and OCSP responses larger. Check web server limits, cache sizes, and OCSP responder performance.
6. **Enrollment and automation.** Confirm ACME, SCEP, EST, and CLM tools can request and deploy PQC certificates.
7. **Relying parties.** Test that clients, browsers, operating systems, network devices and applications can validate the new chains. This is often the slowest layer.

## Readiness checklist

| Area | Check | Notes |
|---|---|---|
| HSM | Firmware supports ML-DSA and ML-KEM | Also LMS and XMSS for CNSA 2.0 firmware signing |
| HSM | PQC in FIPS 140-3 validation scope | Check the module certificate on the CMVP site |
| HSM | Performance for PQC signing | ML-DSA is fast; SLH-DSA signing is slow |
| HSM | Backup and restore of PQC keys | Test with vendor tools |
| HSM | Stateful key handling (LMS, XMSS) | NIST SP 800-208 requires keys to be generated and used in hardware; plan state protection |
| CA | Software version supports PQC | Vendor roadmap and release notes |
| CA | Database fields accept larger keys and signatures | ML-DSA-65 public key is 1,952 bytes; signature is 3,309 bytes |
| CA | CRL and OCSP signing with PQC | Size and performance testing |
| PKI design | New PQC root and issuing CAs planned | Key ceremony and hierarchy design |
| PKI design | Validity periods reviewed | Shorter lives reduce exposure |
| Clients | Validation support tested | Operating systems, libraries, devices |
| Automation | CLM, ACME and enrollment tools tested | Includes renewal and deployment |

> **Warning:** Do not move a production CA key to new HSM firmware without a tested backup and a rollback plan. Follow the HSM vendor's upgrade guidance and the EC runbooks. See [Updating HSM firmware](../../04-Featured-Articles/HSM-Runbooks/updating-hsm-firmware.md).

## Typical sequence for a private PKI

1. Inventory all CAs, HSMs, templates and relying parties (a CBOM helps here).
2. Upgrade HSM firmware in a lab and confirm PQC support.
3. Build a test PQC hierarchy (root and issuing CA) in the lab.
4. Issue test certificates and validate them with each client type.
5. Measure size and performance effects on TLS, CRLs and OCSP.
6. Plan a production key ceremony for a new PQC root when clients are ready.
7. Run classical and PQC hierarchies in parallel during transition.

## Key terms

| Term | Meaning |
|---|---|
| HSM | Hardware Security Module: tamper-resistant hardware that protects keys |
| CMVP | Cryptographic Module Validation Program (NIST and the Canadian Centre for Cyber Security) |
| PKCS#11 | Standard API for cryptographic tokens and HSMs |
| CNG KSP | Cryptography API: Next Generation Key Storage Provider (Windows) |
| LMS and XMSS | Stateful hash-based signature schemes (NIST SP 800-208) |

## Common questions

### Should a new root CA built in 2026 use RSA or PQC?

It depends on client support. Many organizations build a classical root now with a planned PQC root later, or run both. Shorter validity for new classical roots reduces exposure. EC PKI Services can assess the options. See [PKI design and implementation](../../03-Services/pki-design-and-implementation.md).

### Can EC managed services support PQC?

PQC support for PKI-as-a-Service and HSM-as-a-Service is on the EC roadmap. Contact EC for the current status. See [PKI-as-a-Service overview](../../01-Products/PKI-as-a-Service/pki-as-a-service-overview.md) and [HSM-as-a-Service overview](../../01-Products/HSM-as-a-Service/hsm-as-a-service-overview.md).

## Related articles

- [Hybrid and composite certificates](hybrid-and-composite-certificates.md)
- [Testing PQC algorithms in a lab](testing-pqc-algorithms-in-a-lab.md)
- [What is an HSM?](../HSM/what-is-an-hsm.md)
- [FIPS 140-3 security levels explained](../HSM/fips-140-3-security-levels-explained.md)
- [HSM services: deployment and integration](../../03-Services/hsm-services-deployment-and-integration.md)
- [FIPS 140-2 sunset and FIPS 140-3 migration](../../05-Popular-Right-Now/fips-140-2-sunset-september-2026-fips-140-3-migration.md)
