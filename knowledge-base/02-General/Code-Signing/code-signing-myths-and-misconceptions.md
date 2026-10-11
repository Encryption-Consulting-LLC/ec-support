---
title: "Code Signing Myths and Misconceptions"
category: "General"
section: "Code Signing"
article_type: "Concept"
applies_to: "Code signing for Windows (Authenticode), Java, Android, macOS, Linux packages, and containers; public and private code signing certificates"
summary: "Fifteen code signing myths corrected: signed means safe, EV avoids SmartScreen, expiry breaks software, revocation, PFX files, renewals, and PQC timing."
keywords: ["code signing myths", "code signing misconceptions", "EV certificate SmartScreen", "does signed code expire", "code signing certificate expired", "code signing revocation", "signed malware"]
last_reviewed: "2026-10-08"
---

# Code Signing Myths and Misconceptions

This article corrects fifteen common beliefs about code signing that lead to security gaps, broken releases, or wasted money. Each section states the myth, explains what is actually true, and says what to do instead. It is for developers, release engineers, security teams, and anyone who buys or manages code signing certificates.

For myths specific to the EC platform, see [CodeSign Secure: common misconceptions](../../01-Products/CodeSign-Secure/codesign-secure-common-misconceptions.md).

## At a glance

| # | Myth | Reality |
|---|---|---|
| 1 | Signed code is safe code | A signature proves who published it and that it hasn't changed, not that it's harmless |
| 2 | An EV certificate removes SmartScreen warnings | EV no longer grants instant SmartScreen reputation |
| 3 | Signed software stops working when the certificate expires | Timestamped signatures stay valid |
| 4 | Revocation only affects future signatures | It depends on the revocation date the CA sets |
| 5 | Self-signed certificates are fine for public software | Only systems that trust your root accept them |
| 6 | A password-protected PFX file is secure enough | Public code signing keys must be in hardware |
| 7 | A renewed certificate keeps its reputation | Reputation must build again for a new certificate |
| 8 | Code signing certificates last three years | New public certificates last at most 460 days |
| 9 | One USB token per developer is the best way to comply | It complies, but doesn't scale or work well in CI/CD |
| 10 | Signing the installer is enough | Sign every executable file you ship |
| 11 | Every format can be timestamped | APK and GPG signatures can't |
| 12 | A TLS certificate can sign code | Code signing needs the code signing EKU |
| 13 | Small changes after signing are fine | Any change breaks the signature |
| 14 | SHA-1 signatures are still acceptable | Use SHA-256 or stronger |
| 15 | Post-quantum signing can wait until 2030 | Long-lived software and firmware need planning now |

## 1. "Signed code is safe code."

**Reality.** A signature proves two things: **who** published the software (authenticity) and that it **hasn't changed** since it was signed (integrity). It says nothing about whether the code is safe. If malicious code enters the build before signing, through a compromised dependency, build server, or developer account, it is signed like everything else and looks fully legitimate. Several major supply chain attacks shipped malware with valid signatures from the real publisher.

**What to do.**

- Scan code and dependencies **before** signing.
- Sign only artifacts from trusted, hardened build systems.
- Where possible, verify builds before signing, for example with reproducible builds that compare an independent rebuild.
- Control who can sign with approval workflows and keep an audit trail.

## 2. "An EV certificate means users won't see SmartScreen warnings."

**Reality.** For years, Extended Validation (EV) code signing certificates gave instant positive reputation in Microsoft Defender SmartScreen. Microsoft has removed that behavior. Files signed with EV or Organization Validation (OV) certificates now both build reputation over time, and a new release can show "Windows protected your PC" even with a valid EV signature. Microsoft's guidance says EV certificates no longer bypass SmartScreen. See Microsoft's [code signing options for Windows app developers](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options).

**What EV still offers.** Stricter identity checks, which some customers, procurement teams, and platforms still require.

**What to do.**

- Don't buy EV **only** to avoid SmartScreen warnings.
- Sign every release with the same signing identity, and always timestamp.
- Don't sign anything that behaves like potentially unwanted software, because it can give your certificate a negative reputation.
- For a suspected false warning, submit the file to Microsoft Security Intelligence.

## 3. "When my certificate expires, my signed software stops working."

**Reality.** Only if you didn't timestamp it. A trusted RFC 3161 timestamp proves the file was signed while the certificate was valid, so verifiers keep trusting the signature after the certificate expires. Without a timestamp, most verifiers treat the signature as invalid from the expiry date.

**What to do.** Timestamp every release signature, and add a pipeline check that fails when a release file has no timestamp. See [Timestamping for code signing](../../01-Products/CodeSign-Secure/timestamping-for-code-signing.md).

## 4. "Revoking a certificate only affects things I sign afterwards."

**Reality.** When a CA revokes a code signing certificate, it sets a **revocation date**. Verifiers reject signatures timestamped **after** that date. If a key is compromised, the CA may set the date back to when the compromise began, or even to the certificate's start date. In that case, **every** file signed with that certificate can become untrusted, including old, legitimate releases.

**What to do.**

- Agree the revocation date with your CA carefully: as early as needed to cover the compromise, but no earlier.
- Keep a runbook for re-signing and re-releasing affected software.
- Use separate certificates for different products or risk levels, so one compromise doesn't affect everything.

## 5. "A self-signed certificate is fine for software we give to customers."

**Reality.** A self-signed or internal-CA certificate is trusted only on machines where you have installed its root certificate. On customers' machines, the signature shows as untrusted or as an unknown publisher.

**What to do.** Use self-signed and internal certificates for development, testing, and internal software that runs on managed machines. Use a publicly trusted certificate for anything distributed outside your organization.

## 6. "A strong password on the PFX file is protection enough."

**Reality.** Since June 1, 2023, the CA/Browser Forum requires the private key of every publicly trusted code signing certificate, OV and EV, to be generated and stored in certified hardware, such as a FIPS 140-2 Level 2 or Common Criteria EAL 4+ module. CAs can't issue public code signing certificates for keys held in software files. Beyond the rule, a key in a file can be copied, and a copied key can sign malware anywhere.

**What to do.** Keep signing keys in a Hardware Security Module (HSM) or a compliant signing service. Apply the same protection to internal signing keys, even though the rule doesn't require it. See [CA/B Forum code signing key storage requirements](ca-b-forum-code-signing-key-storage-requirements.md).

## 7. "When I renew my certificate, it keeps its SmartScreen reputation."

**Reality.** SmartScreen publisher reputation is tied to the signing certificate. Microsoft says there's no supported way to transfer reputation to a renewed certificate, so files signed with the new certificate build reputation again. A renewal right before a major release can bring back warnings at the worst moment.

**What to do.** Renew well before expiry, and avoid switching certificates close to a big release. Keep the same publisher identity in the new certificate.

## 8. "Code signing certificates last three years."

**Reality.** CA/Browser Forum Ballot CSC-31 cut the maximum validity of new publicly trusted code signing certificates from 39 months to **460 days**, from March 1, 2026. Certificates issued before that keep their original expiry dates.

**What to do.** Plan renewals about every 15 months. Set expiry alerts at least 30 days ahead, and make renewal a routine process, not an emergency.

## 9. "A hardware token for each developer is the best way to comply."

**Reality.** USB tokens meet the hardware requirement, but they scale badly. They can't easily be shared by CI/CD pipelines, are lost or broken, need a separate certificate per token, and give you no central view of who signed what.

**What to do.** Use a central signing service with HSM-protected keys, so developers and pipelines sign with their normal tools while the keys stay in one controlled place, with permissions, approvals, and an audit trail.

## 10. "Signing the installer is enough."

**Reality.** Platforms check signatures on the files they load or run, not just the installer. Windows checks drivers and, under application control policies, individual executables and libraries. macOS requires nested code inside an app bundle to be signed. An unsigned DLL, driver, or helper tool inside a signed installer can be blocked or flagged after installation.

**What to do.** Sign every executable file you ship: executables, libraries, drivers, scripts, and the installer itself. Sign the inner files first and the outer package last.

## 11. "Every format can be timestamped."

**Reality.** Many can, but not all. Android APK signatures don't include timestamps. GnuPG signatures, used for Debian and RPM packages, record their creation time but don't use a Time Stamping Authority.

**What to do.** For these formats, key continuity matters more. Android, for example, uses the signing key to decide whether an update comes from the same publisher, so plan for key protection and long-term key ownership from the start.

## 12. "Our TLS certificate can be used to sign code."

**Reality.** Code signing certificates carry the code signing Extended Key Usage (EKU, `1.3.6.1.5.5.7.3.3`). TLS server certificates carry the server authentication EKU instead, and verifiers reject them for code signing. The two types also follow different rules: public TLS certificates have much shorter maximum lifetimes than code signing certificates.

**What to do.** Request a dedicated code signing certificate, and manage it separately from your TLS certificates.

## 13. "It's fine to make small changes to a file after it's signed."

**Reality.** Any change to the signed content, even one byte, changes the hash and breaks the signature. Editing resources, patching version information, adding files to a signed JAR, or repacking a package after signing all invalidate it.

**What to do.** Make signing one of the **last** steps of the build, after every change, and verify the signature as the final step before publishing.

## 14. "SHA-1 signatures are still acceptable."

**Reality.** SHA-1 is broken for collision resistance, and major platforms have deprecated or stopped trusting SHA-1 code signatures.

**What to do.** Use SHA-256 or stronger for both the file digest and the timestamp, for example SignTool `/fd SHA256 /td SHA256`.

## 15. "Post-quantum signing can wait until 2030."

**Reality.** Signed software and firmware often stay in use for many years, and firmware signing keys and root certificates can be hard to replace in deployed devices. The NSA's CNSA 2.0 asks for quantum-resistant software and firmware signing to be preferred now and used exclusively by 2030 for national security systems. NIST IR 8547 plans to deprecate RSA and elliptic curve algorithms from 2030 and disallow them from 2035.

**What to do.** Build an inventory of your signing keys and algorithms now, find which products have long lifetimes, and check which of your target platforms can verify post-quantum signatures. See [CNSA 2.0 timeline and requirements](../../05-Popular-Right-Now/cnsa-2-0-timeline-and-requirements.md) and [NIST IR 8547](../../05-Popular-Right-Now/nist-ir-8547-quantum-vulnerable-algorithm-deprecation-2030-2035.md).

## How EC can help

- [CodeSign Secure](../../01-Products/CodeSign-Secure/codesign-secure-overview.md) keeps signing keys in HSMs and adds central policies, approvals, team-based access, and an audit trail.
- A [code signing assessment](../../03-Services/code-signing-assessment.md) reviews your current program against these and other risks.

## Related articles

- [Code signing fundamentals](code-signing-fundamentals.md)
- [Code signing best practices](code-signing-best-practices.md)
- [CA/B Forum code signing key storage requirements](ca-b-forum-code-signing-key-storage-requirements.md)
- [CodeSign Secure: common misconceptions](../../01-Products/CodeSign-Secure/codesign-secure-common-misconceptions.md)
- [Timestamping for code signing](../../01-Products/CodeSign-Secure/timestamping-for-code-signing.md)
