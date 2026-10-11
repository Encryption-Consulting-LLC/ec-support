---
title: "CodeSign Secure FAQ"
category: "Products"
section: "CodeSign Secure"
article_type: "FAQ"
applies_to: "CodeSign Secure v3.2.1  and later (all deployment models)"
summary: "Answers to common CodeSign Secure questions about keys, file uploads, formats, clients, CI/CD, approvals, permissions, PQC, and support."
keywords: ["CodeSign Secure FAQ", "code signing questions", "HSM code signing", "CodeSign Secure approval timeout", "PQC code signing", "CodeSign Secure supported HSMs"]
last_reviewed: "2026-10-08"
---

# CodeSign Secure FAQ

This article answers frequent questions about CodeSign Secure, the code signing platform from Encryption Consulting (EC). It is for new customers, administrators, and developers who use the platform day to day.

## Keys and security

### Do private keys ever leave the HSM?

No. Keys are generated and used inside a FIPS 140-2 Level 3 Hardware Security Module (HSM). Downloading a certificate from the portal gives you only the public certificate.

### Is my file uploaded to the server?

No. With the Windows KSP, EC KSP for Mac, and PKCS#11 Wrapper, the build machine calculates the hash locally and sends only the hash, whatever the size of the file.

### Which HSMs are supported?

Entrust nShield (firmware 13.8.0 or later), Thales Luna (10.7.1-125 or later), Securosys Primus (2.8.21 or later), and Utimaco SecurityServer Se Gen2 (4.32.0 or later), on-premises or in the cloud, including high-availability configurations. For other HSMs integrations, contact EC before you deploy. See [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md).

### Does CodeSign Secure meet the CA/B Forum hardware key requirement?

The CA/Browser Forum requires keys for publicly trusted code signing certificates to be generated and stored in certified hardware. CodeSign Secure generates keys inside FIPS 140-2 Level 3 HSMs. Some CAs also ask for key attestation, which is proof that the key was generated in an HSM. Attestation is produced with the HSM vendor's tools and also in CodeSign Secure reports. Ask your CA which format it accepts, and contact EC if you need help collecting it. See [CA/B Forum code signing key storage requirements](../../02-General/Code-Signing/ca-b-forum-code-signing-key-storage-requirements.md).

### Does a CodeSign Secure backup include my keys?

No. A CodeSign Secure backup contains logs, a database dump, and key reference files, but it can't restore keys on its own. Back up the HSM with the vendor's tools.

## Signing

### Which file types and tools are supported?

Windows Authenticode files with SignTool, Office VBA macros, AppX and MSIX, ClickOnce (Visual Studio and Mage), NuGet, HLK and HCK, JAR files with jarsigner, Android APK with apksigner, Authenticode from Java with JSign, raw signatures with OpenSSL, XML documents, GPG signatures and Debian and RPM packages, macOS apps with codesign, OVA and OVF appliances with the Utility Tool, and container images with ec-signer and cosign. See [CodeSign Secure overview](codesign-secure-overview.md).

### Which client tool do I need?

| You sign on | With | Use |
|---|---|---|
| Windows 10, Windows 11, or Windows Server 2019, 2022, or 2025 | SignTool, Mage, NuGet, ClickOnce, HLK | Encryption Consulting KSP |
| Windows, Linux, or macOS | jarsigner, apksigner, JSign, OpenSSL, XML tools, GnuPG | PKCS#11 Wrapper |
| macOS | codesign | EC KSP for Mac |
| Windows, interactively or in bulk | Most Windows formats, OVA and OVF | Utility Tool |
| A container build host | cosign | PKCS11 Wrapper or ec-signer (only Linux) |

Download every client from the **Signing Tools** page of your own server, and download them again after every server upgrade.

### Do developers need to change their build tools?

No. Developers keep SignTool, jarsigner, apksigner, codesign, and similar tools. The CodeSign Secure client connects those tools to the platform.

### Which key algorithms can I use?

For RSA and ECDSA, CodeSign Secure supports RSA 2048, 3072, and 4096 bits (default 4096) and ECDSA P-256, P-384, and P-521. Public CAs require code signing RSA keys of at least 3072 bits. The signing tool chooses the digest algorithm; use SHA-256 or stronger.

### Does CodeSign Secure support post-quantum signatures?

EC states native support for ML-DSA (FIPS 204) and LMS (NIST SP 800-208). NSA CNSA 2.0 asks for software and firmware signing to prefer quantum-resistant algorithms now and to use them exclusively by 2030. Platform support for verifying ML-DSA signatures still varies and is HSM vendor dependent, so check each target platform. For the file formats and tools that support post-quantum signing in your deployment, contact EC.

### Which timestamp server should I use?

A public RFC 3161 Time Stamping Authority (TSA), ideally the one run by the CA that issued your certificate, for example `http://timestamp.digicert.com` or `http://timestamp.sectigo.com`. CodeSign Secure doesn't run its own TSA, and the build machine contacts the TSA directly. See [Timestamping for code signing](timestamping-for-code-signing.md).

### Why is timestamping important?

Since March 1, 2026, new publicly trusted code signing certificates can be valid for at most 460 days (CA/B Forum Ballot CSC-31). An RFC 3161 timestamp keeps a signature valid after the certificate expires.

## Approvals and access

### Can I sign in a fully automated pipeline?

Yes. Use a certificate in an environment with the **No Approval** policy, and a dedicated CodeSign Secure user for the pipeline. See [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md).

### What happens if nobody approves a request?

It times out after 100 seconds, and the signing command fails. The 100-second window is fixed.

### Who can approve signing requests?

The certificate owner (Certificate Owner policy) or the selected quorum members (Quorum policy). Approvers must hold the System Admin or Project Manager role. See [Approval workflows and signing policies](approval-workflows-and-signing-policies.md).

### Why can't a new user do anything?

Every role except System Admin starts with no permissions. A System Admin must enable them in **System Setup > Roles and Permissions**. To sign, the user also needs to be in a team mapped to the certificate in **App Management**.

### Why can't I choose a certificate when mapping a team?

Only certificates with an environment are listed. Set one with **Edit Environment** in **Keys and Certificates**.

## Administration

### Which sign-in methods are supported?

Azure AD (Microsoft Entra ID) and local accounts with an email and password registered by a System Admin.

### Why was I signed out of the portal?

Each account can have one active portal session. Signing in again revokes the earlier portal sessions.

### What does "Signing KSPs Utilized" count?

The number of KSP clients in use against the number your license allows. The license, including this limit, is decided during the CodeSign Secure installation setup. The **Client Report** shows which clients are in use. To increase the limit, contact Encryption Consulting.

### What deployment options exist?

SaaS (hosted and managed by EC), cloud (AWS, Azure, Google, or private cloud), on-premises, and hybrid. The customer-installed server runs on Windows Server 2022, as a single server or as a cluster behind a load balancer.

### Can existing code signing certificates be moved into CodeSign Secure?

The **Import Certificate** option is for certificates issued for a CSR that was created in CodeSign Secure. Publicly trusted code signing keys must also have been generated in certified hardware, so a key held in a `.pfx` file can't be used for a public certificate. Most organizations generate a new key and CSR in CodeSign Secure and request a new certificate from their CA. To discuss moving keys that are already in an HSM, contact EC.

### How do I find my CodeSign Secure version?

Hover over the version in the profile menu of the header bar. The portal footer shows the frontend and backend versions.

## Support

### What should be in a support case?

The product version, client tool and operating system, the exact command (without secrets), the full error text, and the time of the failure with its time zone. System Admins can attach a support package from **Profile > Maintenance > Support Packages**. See [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md) and [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [CodeSign Secure overview](codesign-secure-overview.md)
- [How CodeSign Secure works](how-codesign-secure-works.md)
- [CodeSign Secure: common misconceptions](codesign-secure-common-misconceptions.md)
- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
- [CNSA 2.0 timeline and requirements](../../05-Popular-Right-Now/cnsa-2-0-timeline-and-requirements.md)
