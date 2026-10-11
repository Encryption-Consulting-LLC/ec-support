---
title: "CodeSign Secure Overview"
category: "Products"
section: "CodeSign Secure"
article_type: "Overview"
applies_to: "CodeSign Secure v3.2.1  and later (SaaS, cloud, on-premises, and hybrid deployments)"
summary: "An introduction to EC CodeSign Secure: HSM-backed code signing with approval policies, team-based access, audit trails, and CI/CD integration."
keywords: ["CodeSign Secure", "code signing platform", "HSM code signing", "Encryption Consulting KSP", "PKCS#11 Wrapper", "Authenticode"]
last_reviewed: "2026-10-08"
---

# CodeSign Secure Overview

This article introduces CodeSign Secure, the code signing platform from Encryption Consulting (EC). It explains what the product does, how it is built, which client tools it provides, and which formats and platforms it supports. It is for security teams, release engineers, and administrators who are evaluating or starting to use the product.

## What it is

CodeSign Secure is a central platform for signing software, scripts, packages, firmware, and container images. Private signing keys are generated and used inside a FIPS 140-2 Level 3 Hardware Security Module (HSM) and never leave it. Build machines keep using the signing tools they already know, such as SignTool, jarsigner, apksigner, and codesign. A small client component calculates the file hash locally and sends only the hash to CodeSign Secure. The server checks who is asking, whether approval is needed, has the HSM sign the hash, and records the event.

This removes the most common code signing risk: signing keys stored on developer laptops or build servers. It also helps meet the CA/Browser Forum (CA/B Forum) rule that keys for publicly trusted code signing certificates must be generated and stored in certified hardware.

## Key capabilities

- **HSM-protected keys:** keys are generated and used inside FIPS 140-2 Level 3 HSMs: Entrust nShield, Thales Luna, Securosys Primus, or Utimaco SecurityServer, on-premises or in the cloud, including high-availability configurations.
- **Client-side hashing:** only the file hash leaves the build machine, whatever the size of the file.
- **Environment-based approval policies:** each certificate belongs to an environment whose policy is No Approval, Certificate Owner, or Quorum, with optional multi-factor authentication (MFA) for approvers.
- **Team-based access:** in App Management, certificates are mapped to teams. Only members of a mapped team can sign with a certificate.
- **Role-Based Access Control (RBAC):** five default roles (System Admin, Project Manager, Security Officer, Auditor, Developer) with permissions that a System Admin enables.
- **Audit trail and reports:** every request, decision, and signature is recorded. Reports cover signing requests, certificates, clients, and the audit trail. Logs can be exported to Splunk or Grafana Loki.
- **Certificate lifecycle:** generate keys and Certificate Signing Requests (CSRs) in the HSM, import CA-issued certificates, set expiry alerts, and deactivate certificates.
- **Reproducible build verification:** pre-sign hash validation compares the artifact with a trusted rebuild before it is signed.
- **Post-Quantum Cryptography (PQC) support:** EC states native support for ML-DSA and LMS signature algorithms.

## Client tools

Download every client from the **Signing Tools** page of your own CodeSign Secure server.

| Client | Runs on | Used with |
|---|---|---|
| Encryption Consulting KSP | Windows 10, Windows 11, Windows Server 2019, 2022, and 2025 | SignTool, Mage, NuGet, Visual Studio ClickOnce, HLK, jarsigner |
| EC KSP for Mac | macOS | codesign |
| PKCS#11 Wrapper | Windows, Linux, macOS | apksigner, jarsigner, JSign, OpenSSL, XML signing, GnuPG |
| Utility Tool | Windows | Interactive single-file and bulk signing, OVA and OVF, NuGet, HLK, with an optional ClamAV malware scan |
| ec-signer/cosign | Container build host with Python and Docker | Container image signing with cosign |
| ECGetCert.exe | Windows (installed with the KSP) | Retrieves the signing certificate as a `.pem` file |

## Supported signing formats

| Format | Signing tool | Client |
|---|---|---|
| Authenticode: `.exe`, `.dll`, `.sys`, `.msi`, `.cab`, `.cat`, `.ps1`, and more | SignTool | Windows KSP |
| Office VBA macros, for example `.xlsm` | SignTool with the Office VBA SIP | Windows KSP |
| AppX and MSIX packages | SignTool | Windows KSP |
| ClickOnce applications and manifests | Visual Studio publish, Mage | Windows KSP |
| NuGet packages | NuGet CLI or Utility Tool | Windows KSP |
| HLK and HCK packages | SignTool or Utility Tool | Windows KSP |
| JAR files | jarsigner | Windows KSP or PKCS#11 Wrapper |
| Android APK | apksigner | PKCS#11 Wrapper |
| Authenticode from Java | JSign | PKCS#11 Wrapper |
| Raw signatures of any file | OpenSSL | PKCS#11 Wrapper |
| XML documents | XML signing tool | PKCS#11 Wrapper |
| GPG detached signatures, Debian and RPM packages | GnuPG, dpkg-sig, rpm | PKCS#11 Wrapper |
| macOS apps and binaries (`.app`, `.dmg`, `.pkg`, and more) | codesign | EC KSP for Mac |
| OVA and OVF appliances | Utility Tool | Utility Tool |
| Container images | cosign | ec-signer |

## How it works

1. A build machine runs a native signing tool configured to use a CodeSign Secure client.
2. The client authenticates with mutual TLS (an authentication certificate) and API user credentials.
3. The client hashes the file locally and sends the hash and the key name.
4. CodeSign Secure checks the user's role and team mapping, then applies the certificate's environment policy. If approval is needed, an approver must act within 100 seconds.
5. The HSM signs the hash. The signature returns to the client, which embeds it in the file.
6. The signing tool adds a timestamp from a public Time Stamping Authority (TSA), if one was requested.
7. The request and result are recorded in the Logs and the Audit Trail.

See [How CodeSign Secure works](how-codesign-secure-works.md) for the full flow.

## Supported integrations

- **CI/CD:** documented integrations for GitHub Actions, GitLab CI/CD, Jenkins, Azure DevOps, TeamCity, and Bamboo. Any CI/CD platform that can run a self-hosted agent with a CodeSign Secure client can use the same pattern.
- **Identity:** Microsoft Entra ID (Azure AD) single sign-on and local accounts.
- **Logging:** OpenTelemetry export to Splunk and Grafana Loki.
- **Backups:** on the server or in SharePoint.
- **Automation:** a REST API under `https://<your-domain>/api/`, documented in the Swagger API page of the portal.

## Deployment options

| Model | Description |
|---|---|
| SaaS | Hosted and managed by EC, with HSM security included. |
| Cloud | Deployed in AWS, Azure, or a private cloud, with a cloud HSM. |
| On-premises | Physical or virtual servers in the customer data center, with a local HSM. |
| Hybrid | A mix of on-premises and cloud HSMs or components. |

The customer-installed server runs on Windows Server 2022, either as a single server or as a cluster behind a load balancer. See [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md).

## Getting help

- Look up an error in the [CodeSign Secure error message index](codesign-secure-error-message-index.md).
- Read [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md) and the [CodeSign Secure FAQ](codesign-secure-faq.md).
- Open a case with EC support. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [How CodeSign Secure works](how-codesign-secure-works.md)
- [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md)
- [CodeSign Secure: common misconceptions](codesign-secure-common-misconceptions.md)
- [Code signing fundamentals](../../02-General/Code-Signing/code-signing-fundamentals.md)
- [CA/B Forum code signing key storage requirements](../../02-General/Code-Signing/ca-b-forum-code-signing-key-storage-requirements.md)
