---
title: "CodeSign Secure Overview"
category: "Products"
section: "CodeSign Secure"
article_type: "Overview"
applies_to: "CodeSign Secure (SaaS, cloud, on-premises, and hybrid deployments)"
summary: "An introduction to EC CodeSign Secure: HSM-backed code signing with policies, approvals, audit trails, and CI/CD integration for many file and package types."
keywords: ["CodeSign Secure", "code signing platform", "HSM code signing", "signing policies", "Authenticode"]
last_reviewed: "2026-10-06"
---

# CodeSign Secure Overview

This article introduces CodeSign Secure, the code signing platform from Encryption Consulting (EC). It explains what the product does, how it is built, and which tools and platforms it works with. It is for security teams, release engineers, and administrators who are evaluating or starting to use the product.

## What it is

CodeSign Secure is a central platform for signing software, scripts, packages, firmware, and container images. Private signing keys stay inside a Hardware Security Module (HSM) and never leave it. Developers and build systems ask CodeSign Secure to sign, and the platform checks policy, collects approvals when needed, performs the signing operation in the HSM, and records the event in an audit trail.

This model removes the common problem of signing keys stored on developer laptops or build servers. It also helps meet the CA/Browser Forum (CA/B Forum) rule that keys for publicly trusted code signing certificates must be generated and stored in certified hardware.

## Key capabilities

- **HSM-protected keys:** keys are generated and used inside FIPS 140-2 Level 3 or FIPS 140-3 validated HSMs. Supported HSMs include PKCS#11 HSMs, Thales Luna, Thales Luna Cloud HSM (Data Protection on Demand, DPoD), and Entrust nShield.
- **Policy-driven signing:** rules control who can sign, with which key, for which project, and when.
- **Approval workflows:** signing requests can require one or more approvers, including M of N quorum approvals.
- **Role-Based Access Control (RBAC):** separate roles for administrators, approvers, and signers.
- **Audit trails and alerts:** every request, approval, and signature is logged. Unauthorized signing attempts can raise real-time alerts.
- **Trusted timestamping:** signatures stay valid after the signing certificate expires, using RFC 3161 timestamps.
- **Post-Quantum Cryptography (PQC) support:** native support for ML-DSA and LMS signature algorithms.
- **Reproducible build verification:** checks that a build produced from the same source gives the same output before it is signed.

## Supported signing formats

| Platform or format | Typical tool |
|---|---|
| Windows executables, drivers, scripts (Authenticode) | Microsoft SignTool |
| ClickOnce, MSIX and Appx, HLKX | SignTool, Mage, related Microsoft tools |
| Java JAR files | jarsigner |
| Android APK | apksigner or jarsigner |
| macOS, iOS, and watchOS applications | Apple codesign tooling |
| NuGet packages | NuGet sign |
| Debian and RPM packages, GPG signatures | GPG, rpmsign, dpkg-sig or debsigs |
| XML documents | XML Digital Signature tooling |
| Container images | cosign or Notary (Notation) |
| OVA and OVF files, firmware | Format-specific tooling |

## How it works

CodeSign Secure has three main parts:

1. **CodeSign Secure server:** the web console and API. It stores policies, users, roles, projects, and certificates, and it holds the audit log.
2. **HSM:** an on-premises, cloud, or EC-managed HSM that holds the private keys and performs every signing operation.
3. **Signing clients:** components installed on developer machines or build agents. They connect native tools (such as SignTool or jarsigner) to CodeSign Secure through standard interfaces such as a Key Storage Provider (KSP) on Windows or a PKCS#11 library on Linux and macOS.

Most deployments use hash signing: the client computes the file hash locally and sends only the hash to the server. The large file never leaves the build system. See [How CodeSign Secure works](how-codesign-secure-works.md) for the full flow.

## Supported integrations

- **CI/CD:** GitHub Actions, GitLab CI, Jenkins, CircleCI, Azure DevOps, Bamboo, TeamCity.
- **HSMs:** PKCS#11 HSMs, Thales Luna, Luna Cloud HSM (DPoD), Entrust nShield.
- **Access:** web console and Application Programming Interface (API) access for automation.

## Deployment options

| Model | Description |
|---|---|
| SaaS | Fully managed and hosted by EC, with HSM security included. |
| Cloud | Deployed in AWS, Azure, or a private cloud, with a cloud HSM. |
| On-premises | Physical or virtual servers in the customer data center, with a local HSM. |
| Hybrid | A mix of on-premises and cloud HSMs or components. |

## Getting help

- Check [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md) and the [CodeSign Secure FAQ](codesign-secure-faq.md).
- Open a case with EC support. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).
- Include logs as described in [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md).

## Related articles

- [How CodeSign Secure works](how-codesign-secure-works.md)
- [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Code signing fundamentals](../../02-General/Code-Signing/code-signing-fundamentals.md)
- [CA/B Forum code signing key storage requirements](../../02-General/Code-Signing/ca-b-forum-code-signing-key-storage-requirements.md)
