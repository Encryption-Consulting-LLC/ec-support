---
title: "Code Signing Assessment"
category: "Services"
section: "Assessments"
article_type: "Service Guide"
applies_to: "Code signing keys, certificates, signing tools, and CI/CD pipelines on Windows, Linux, macOS, Java, and containers"
summary: "How the EC Code Signing Assessment reviews signing keys, HSM storage, pipelines, approvals, and timestamping, and delivers a risk register and roadmap."
keywords: ["code signing assessment", "code signing security", "signing key protection", "CI/CD signing", "CA/B Forum code signing"]
last_reviewed: "2026-10-06"
---

# Code Signing Assessment

This article describes the Code Signing Assessment from Encryption Consulting (EC). The assessment checks how an organization protects its code signing keys and controls who can sign what. It is for security, DevOps, and release engineering teams that sign software, firmware, scripts, or container images.

## What the service covers

A stolen or misused code signing key lets attackers ship malware that looks trusted. The assessment reviews:

- **Key storage:** whether private keys are in a Hardware Security Module (HSM) or on developer machines and build servers. Since June 1 2023, CA/Browser (CA/B) Forum rules require keys for publicly trusted code signing certificates to be generated and stored in hardware validated to Federal Information Processing Standard (FIPS) 140-2 Level 2 or Common Criteria EAL4+, or better.
- **Certificate inventory:** public and private code signing certificates, owners, and expiry dates.
- **Access control:** who can sign, role-based access control (RBAC), and separation of duties.
- **Approval workflows:** whether signing of release builds needs approval.
- **Pipeline integration:** how continuous integration and continuous delivery (CI/CD) systems such as GitHub Actions, GitLab CI, Jenkins, and Azure DevOps request signatures.
- **Timestamping:** whether signatures include a trusted timestamp so they stay valid after the certificate expires.
- **Logging and audit:** whether every signing event is logged and reviewed.
- **Revocation and incident response:** the plan if a key is compromised.
- **Signing formats:** for example Authenticode, Java JAR, Android APK, RPM and Debian packages, GPG, and container images.
- **Post-quantum readiness:** awareness of the NSA Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) timelines for software and firmware signing.

## Who it is for

- Software vendors and device makers that sign products for customers.
- Enterprises that sign internal scripts, drivers, or applications.
- Organizations that found signing keys stored on build servers or laptops.
- Teams planning to adopt a central signing platform such as [CodeSign Secure](../01-Products/CodeSign-Secure/codesign-secure-overview.md).

## Engagement phases

| Phase | Main activities | Output |
|---|---|---|
| 1. Discovery and data gathering | Find signing keys, certificates, tools, and pipelines. Interview release and security teams. | Signing inventory |
| 2. Current state assessment | Review key storage, access, approvals, timestamping, and logs. | Current state report |
| 3. Gap analysis | Compare with the CA/B Forum Code Signing Baseline Requirements, NIST guidance on code signing, FIPS 140-3 for key storage, and internal policy. | Gap analysis and risk register |
| 4. Recommendations and roadmap | Prioritize fixes, such as moving keys into an HSM and adding approvals. | Prioritized roadmap |
| 5. Implementation support (optional) | Help deploy a central signing service and integrate pipelines. | Target architecture, runbooks, and signing policy |

## Deliverables

- Code signing key and certificate inventory
- Current state report
- Risk register
- Gap analysis against agreed requirements
- Target architecture for central, HSM-backed signing
- Prioritized roadmap
- Draft code signing policy and runbooks (when in scope)

## What EC needs from the customer

**Stakeholders**

- Release engineering and DevOps leads.
- Security architecture and PKI owners.
- Product owners for signed software.
- HSM administrators, if HSMs are in use.

**Documents**

- Current code signing policy and procedures.
- List of signed products and target platforms.
- CI/CD pipeline overview.
- Certificate purchase records from public Certificate Authorities (CAs).

**Access**

- Interview and screen-share time with build and release teams.
- Read-only access to pipeline definitions, when agreed.

> **Warning:** Do not send private keys, PFX files, or key passwords to EC. The assessment only needs to know where keys are and how they are protected.

## Typical timeline

Duration depends on the number of products, pipelines, and signing tools. Typical duration: {{TBD: typical duration for a code signing assessment}}.

## How to request

See [How to request a service engagement](how-to-request-a-service-engagement.md).

## Related articles

- [Code signing fundamentals](../02-General/Code-Signing/code-signing-fundamentals.md)
- [Code signing best practices](../02-General/Code-Signing/code-signing-best-practices.md)
- [CA/B Forum code signing key storage requirements](../02-General/Code-Signing/ca-b-forum-code-signing-key-storage-requirements.md)
- [CodeSign Secure overview](../01-Products/CodeSign-Secure/codesign-secure-overview.md)
- [Timestamping for code signing](../01-Products/CodeSign-Secure/timestamping-for-code-signing.md)
