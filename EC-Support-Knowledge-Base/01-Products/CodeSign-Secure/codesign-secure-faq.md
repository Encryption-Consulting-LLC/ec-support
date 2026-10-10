---
title: "CodeSign Secure FAQ"
category: "Products"
section: "CodeSign Secure"
article_type: "FAQ"
applies_to: "CodeSign Secure (all deployment models)"
summary: "Answers to common CodeSign Secure questions about HSM key storage, supported formats, CI/CD, approvals, timestamping, PQC algorithms, deployment, and support."
keywords: ["CodeSign Secure FAQ", "code signing questions", "HSM code signing", "code signing certificate validity", "PQC code signing"]
last_reviewed: "2026-10-06"
---

# CodeSign Secure FAQ

This article answers frequent questions about CodeSign Secure, the code signing platform from Encryption Consulting (EC). It is for new customers, administrators, and developers who use the platform day to day.

### What does CodeSign Secure do?

It lets developers and build pipelines sign software while the private keys stay inside a Hardware Security Module (HSM). It adds signing policies, approval workflows, Role-Based Access Control (RBAC), and a full audit trail. See [CodeSign Secure overview](codesign-secure-overview.md).

### Do private keys ever leave the HSM?

No. Keys are generated and used inside the HSM. Signing clients send a hash to CodeSign Secure, and the HSM signs that hash. The signature is returned to the client.

### Which HSMs are supported?

PKCS#11 HSMs, including Thales Luna Network HSM, Thales Luna Cloud HSM (Data Protection on Demand, DPoD), and Entrust nShield.

### Which file types and tools can be signed?

Windows Authenticode files with SignTool, ClickOnce, MSIX and Appx, HLKX, Java JAR with jarsigner, Android APK, macOS and iOS apps, NuGet packages, Debian and RPM packages, GPG signatures, XML documents, container images with cosign or Notary, and OVA and OVF files.

### Do developers need to change their build tools?

Usually not. Developers keep SignTool, jarsigner, cosign, and similar tools. The CodeSign Secure client connects those tools to the platform through a Windows Key Storage Provider (KSP) or a PKCS#11 library. See [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md).

### Is the whole file uploaded for signing?

In hash signing mode, only the file hash is sent. This keeps large files on the build system and reduces network load.

### Which CI/CD platforms are supported?

GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps, Bamboo, and TeamCity. See [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md).

### How do approvals work?

A signing policy can require no approval, one approval, or M of N quorum approval. The request waits until enough approvers accept it, or until it expires. See [Approval workflows and signing policies](approval-workflows-and-signing-policies.md).

### Why is timestamping important?

Since March 1, 2026, new publicly trusted code signing certificates can be valid for at most 460 days (CA/Browser Forum Ballot CSC-31). An RFC 3161 timestamp keeps a signature valid after the certificate expires. See [Timestamping for code signing](timestamping-for-code-signing.md).

### Does CodeSign Secure meet the CA/B Forum hardware key requirement?

The CA/Browser Forum (CA/B Forum) requires keys for publicly trusted code signing certificates to be generated and stored in hardware validated to at least FIPS 140-2 Level 2 or Common Criteria EAL4+. CodeSign Secure keeps keys in FIPS-validated HSMs, which supports this requirement. The certificate issuer may ask for key attestation from the HSM. See [CA/B Forum code signing key storage requirements](../../02-General/Code-Signing/ca-b-forum-code-signing-key-storage-requirements.md).

### Does CodeSign Secure support post-quantum signatures?

CodeSign Secure natively supports ML-DSA (FIPS 204) and LMS (NIST SP 800-208). NSA CNSA 2.0 asks for software and firmware signing to prefer quantum-resistant algorithms now and to use them exclusively by 2030. Platform support for verifying ML-DSA signatures still varies, so check each target platform.

### What deployment options exist?

SaaS (managed by EC), cloud (AWS, Azure, or private cloud), on-premises, and hybrid. See [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md).

### Can existing code signing certificates be moved into CodeSign Secure?

If the private key is in a software file (PFX), it can be imported into an HSM, but publicly trusted code signing keys must have been created in hardware. Most organizations generate a new key in the HSM and request a new certificate.

### What should be in a support case?

The time of failure, identity, key name, full command output (without secrets), and logs. See [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md) and [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [CodeSign Secure overview](codesign-secure-overview.md)
- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
- [CNSA 2.0 timeline and requirements](../../05-Popular-Right-Now/cnsa-2-0-timeline-and-requirements.md)
