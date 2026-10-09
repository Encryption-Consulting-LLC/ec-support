---
title: "How CodeSign Secure Works"
category: "Products"
section: "CodeSign Secure"
article_type: "Concept"
applies_to: "CodeSign Secure v3.2.1  and later (all deployment models)"
summary: "The CodeSign Secure signing flow: client authentication, client-side hashing, access checks, environment policies, HSM signing, and audit."
keywords: ["CodeSign Secure architecture", "client-side hashing", "HSM signing flow", "mutual TLS", "environment policy", "Encryption Consulting KSP"]
last_reviewed: "2026-10-08"
---

# How CodeSign Secure Works

This article explains what happens inside CodeSign Secure from the moment a developer or build job asks for a signature until the signed file is ready. It also explains how environments, certificates, applications, teams, and roles fit together. It is for administrators, release engineers, and support staff who design, run, or troubleshoot the platform.

## What it is

CodeSign Secure separates the place where code is built from the place where keys live. Build machines keep their normal signing tools. A CodeSign Secure client plugs those tools into the platform. The CodeSign Secure server decides whether each request is allowed, and the Hardware Security Module (HSM) performs every private key operation.

## Why it matters

- **Key theft is the main code signing risk.** A copied signing key lets an attacker sign malware that looks legitimate. Keys kept in an HSM can't be copied.
- **Signing must be controlled.** Without central rules, anyone with access to a build server can sign anything. CodeSign Secure adds team-based access, approvals, and an audit trail.
- **Industry rules require hardware.** Since June 1, 2023, the CA/Browser Forum requires private keys for publicly trusted code signing certificates to be generated and stored in certified hardware.

## Components

| Component | Where it runs | What it does |
|---|---|---|
| CodeSign Secure server | Windows Server 2022, served by Apache over HTTPS on TCP 443 by default (configurable, for example 8443) | Hosts the portal and the REST API under `/api/`. The API is stateless, so several servers can run behind a load balancer. |
| Database | MongoDB 6.0 or later | Stores users, roles, applications, environments, certificate records, signing requests, and events. |
| HSM | Entrust nShield, Thales Luna, Securosys Primus, or Utimaco SecurityServer | Generates and stores private keys and performs every signing operation. |
| Build verifier | Part of the server | Performs pre-sign or post-sign hash validation for reproducible builds. |
| Signing clients | Build machines | The Encryption Consulting KSP (Windows), EC KSP for Mac, the PKCS#11 Wrapper (Windows, Linux, macOS), the Utility Tool (Windows), and ec-signer (containers). |

## How a signing request flows

1. **Authenticate.** The client presents its authentication certificate during the TLS handshake (mutual TLS) and sends its API user credentials. The server returns a JSON Web Token (JWT) that authorizes the following calls.
2. **Hash locally.** The client calculates the hash of the file. Only the hash is sent over the network, whatever the size of the file.
3. **Request.** The client sends the hash, the key to use, and the request details.
4. **Check access.** The user's role must include the **CodeSigning Operation** permission, and the user must belong to a team mapped to the certificate in App Management.
5. **Apply the policy.** The certificate's environment decides what happens next. With No Approval, signing continues immediately. With Certificate Owner or Quorum, the request waits on the **Signing Request** page, with MFA if the environment requires it. An approver must act within 100 seconds.
6. **Validate the build (optional).** If the certificate's key usage is set to Pre-Sign Hash Validation, the build verifier checks the hash against a trusted rebuild first.
7. **Sign.** The server sends the hash and key alias to the HSM, which signs it. The private key never leaves the HSM.
8. **Return and package.** The signature returns to the client, and the signing tool embeds it in the file.
9. **Timestamp.** If the command asks for one, the signing tool on the build machine contacts a public RFC 3161 Time Stamping Authority (TSA) directly.
10. **Record.** The request, the decision, and the result are recorded in the Logs and the Audit Trail.

## What leaves the build machine

| Client | Sent to the server | Stays on the build machine |
|---|---|---|
| Windows KSP, EC KSP for Mac, PKCS#11 Wrapper | The file hash, the key to use, request details, and the client's authentication certificate and credentials | The file itself and the signed output |
| All clients | Nothing that contains the private key | |

## Timers that affect signing

| Timer | Value | Effect |
|---|---|---|
| Signing request validity | 100 seconds (fixed) | An approver must act within this time. Otherwise the request times out and the signing job fails. |
| MFA validation | 15 minutes | An approver's MFA validation stays valid for 15 minutes. |
| HSM health status cache | Up to 10 minutes | The Dashboard HSM status is refreshed from the HSM utilities and cached. |
| Portal session | One per account | Signing in to the portal again revokes the account's earlier portal sessions. Client tokens used by signing clients are not affected. |

## How the core objects relate

```text
Environment (approval policy + Needs MFA)
  └─ Certificate (private key in the HSM, exactly one environment)
        └─ mapped in an Application to one or more Teams
              └─ Team members (users) ── Roles ── Permissions
```

| Question | Where it is decided |
|---|---|
| Can this user sign with this certificate? | The role includes CodeSigning Operation, and the user is in a team mapped to the certificate. |
| Does the request need approval? | The policy of the certificate's environment: Certificate Owner, Quorum, or No Approval. |
| Who can approve? | The certificate owner or the quorum members. Approvers must hold the System Admin or Project Manager role. |
| Is MFA needed to approve? | The environment's **Needs MFA** setting. |
| Must the build be verified? | A signing project exists, and the certificate's key usage is Pre-Sign or Post-Sign Hash Validation. |
| Which machines can connect? | Clients with a valid authentication certificate and API user credentials. |

## Key terms

| Term | Meaning |
|---|---|
| Hardware Security Module (HSM) | Tamper-resistant hardware that generates, stores, and uses cryptographic keys. |
| Client-side hashing | The client calculates the file hash locally and sends only the hash for signing. |
| Key Storage Provider (KSP) | The Encryption Consulting Windows Cryptography API: Next Generation (CNG) provider that SignTool and other Windows tools call to sign. |
| PKCS#11 Wrapper | The Encryption Consulting PKCS#11 library for Windows, Linux, and macOS signing tools. |
| Authentication certificate | A client certificate (PFX or P12) generated in **System Setup > User**, used for mutual TLS. |
| Environment | A named context, such as Dev or Production, that carries an approval policy and an MFA setting. |
| Key label (alias) | The name that identifies a key for signing tools, for example the `/kc` value for SignTool or the alias for jarsigner. |
| Time Stamping Authority (TSA) | A service that proves a signature existed at a given time (RFC 3161). |

## Common questions

**Does the file get uploaded to CodeSign Secure?**
No. With the Windows KSP, EC KSP for Mac, and PKCS#11 Wrapper, only the hash is sent.

**Where do certificates come from?**
CodeSign Secure creates the key pair in the HSM in two ways. **Self Signed Certificate** issues a certificate from the server's internal certificate authority, for testing and development. **Certificate Signing Request (CSR)** creates a CSR that you submit to a public or enterprise CA, then you import the issued certificate.

**Is the signature different from one made with a local key?**
No. The result is a standard signature that Windows, Java, Android, macOS, and other verifiers accept.

## Related articles

- [CodeSign Secure overview](codesign-secure-overview.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Timestamping for code signing](timestamping-for-code-signing.md)
- [CodeSign Secure: common misconceptions](codesign-secure-common-misconceptions.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
