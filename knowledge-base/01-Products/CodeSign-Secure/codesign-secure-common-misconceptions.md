---
title: "CodeSign Secure: Common Misconceptions"
category: "Products"
section: "CodeSign Secure"
article_type: "Concept"
applies_to: "CodeSign Secure v3.2.1  and later, all deployment models"
summary: "Common misunderstandings about how CodeSign Secure handles files, keys, approvals, permissions, backups, renewals, and timestamps, and what really happens."
keywords: ["CodeSign Secure misconceptions", "CodeSign Secure how it works", "does CodeSign Secure upload files", "CodeSign Secure backup keys", "No Policy Setup", "approval timeout"]
last_reviewed: "2026-10-08"
---

# CodeSign Secure: Common Misconceptions

This article corrects common misunderstandings about CodeSign Secure. Each one has led to a failed release, a support case, or a security gap for someone. Read it when you plan a deployment, onboard a new team, or before you change policies. It is for administrators, approvers, security teams, and developers.

For misconceptions about code signing in general, such as EV certificates and SmartScreen, see [Code signing myths and misconceptions](../../02-General/Code-Signing/code-signing-myths-and-misconceptions.md).

## Applies to

CodeSign Secure v3.2.1  and later.

## At a glance

| Misconception | Reality |
|---|---|
| My files are uploaded to CodeSign Secure | Only the hash is sent |
| Downloading a certificate gives me the private key | You get the public certificate only |
| A CodeSign Secure backup protects my keys | Keys must be backed up with the HSM vendor's tools |
| A signing request waits until someone approves it | It times out after 100 seconds |
| Any administrator can approve | Only System Admin or Project Manager users who are eligible for that certificate |
| A new user can sign once they have a role | Roles start with no permissions, and team mapping is also required |
| Installing the KSP sets up the whole machine | KSP settings are per Windows account |
| Deactivating a certificate revokes it | Only the issuing CA can revoke it |
| CodeSign Secure runs the timestamp server | Build machines contact a public TSA directly |
| Client tools remain same after a server upgrade | Download them again after every upgrade to have latest fixes |
| A restore only adds missing data | A restore overwrites the whole database |

## "My files are uploaded to CodeSign Secure."

**Reality.** With the Windows KSP, EC KSP for Mac, and PKCS#11 Wrapper, the build machine calculates the file hash locally and sends **only the hash**, whatever the size of the file. The file and the signed output stay on the build machine.

**Why it matters.** Large installers, firmware images, and archives don't travel over the network, and your source and binaries never reach the signing server. Signing speed doesn't depend on file size.

## "Downloading a certificate from the portal gives me the private key."

**Reality.** **Download Certificate** gives you the public certificate only. Private keys are generated and used inside a FIPS 140-2 Level 3 Hardware Security Module (HSM) and never leave it.

**Why it matters.** Sharing a downloaded certificate file is safe. Signing still requires an authenticated client, the right permissions, and team mapping. This is also why you need the `/f` certificate file *and* the KSP for SignTool: one is the public half, the other reaches the private half in the HSM.

## "A CodeSign Secure backup protects my signing keys."

**Reality.** A CodeSign Secure backup contains logs, a database dump (users, roles, applications, teams, environments, certificate records, signing requests, and events), and key reference files. It **can't restore keys on its own**. The keys live in the HSM and must be backed up with the vendor's tools, for example by backing up the nShield Security World or the Luna partition.

**What to do.** Back up the HSM separately, keep backup media under dual control, and test that keys can be restored to a replacement HSM.

## "A signing request waits until someone approves it."

**Reality.** A request that needs approval is valid for **100 seconds**. If nobody approves it in that time, it times out and the signing command fails. Raising the CI/CD job timeout doesn't change this.

**What to do.** Use a certificate in a **No Approval** environment for automated pipelines. Use Certificate Owner or Quorum for releases where an approver is watching when the job runs. See [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md).

## "Any administrator can approve a signing request."

**Reality.** Approvers must hold the **System Admin** or **Project Manager** role. Under Certificate Owner, only that certificate's owner can approve. Under Quorum, only the selected quorum members can approve, and they can only be chosen from users with those two roles.

**What to do.** Choose more eligible quorum members than the minimum, so one absence doesn't block a release.


## "A new user can sign as soon as they have a role."

**Reality.** Every role except System Admin starts with **no permissions**. A user can sign only when all of these are true:

1. Their role has the **CodeSigning Operation** permission.
2. They belong to a team mapped to the certificate in **App Management**.
3. The certificate has an environment, is Active, and isn't Expired.
4. The application is Active.

**What to do.** Enable role permissions before assigning roles. See [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md).

## "Installing the KSP sets up signing for everyone on the machine."

**Reality.** The KSP's settings, including the username, code, identity type, API URL, and `ectoken`, are stored under `HKEY_CURRENT_USER\Software\Encryption Consulting\SigningKSP`. They apply only to the Windows account that ran the installer. A build agent running as another account, such as a service account, doesn't see them.

**What to do.** Configure the KSP settings and the `EC_Client_Auth` and `EC_Client_Pass` variables for the account the build agent runs as, then restart the agent service.

## "Renewing a certificate keeps the same key, so nothing else changes."

**Reality.** It depends on the certificate:

- **CA-issued:** every Certificate Signing Request (CSR) generates a **new** key pair in the HSM. A renewed certificate therefore has a new key and key name, and pipelines must be updated.
- **Self-signed with Key Renewal set to True:** the certificate is reissued with the **same** key. You still need to download the new certificate and replace old copies.

**What to do.** Treat every CA renewal as a small change project: map the new certificate to the same teams, update key names and certificate files in pipelines, test, then deactivate the old certificate.

## "Deactivating a certificate in CodeSign Secure revokes it."

**Reality.** **Deactivate** only stops CodeSign Secure from using the certificate for new signatures. The key isn't deleted, and you can activate it again. **Revocation** is done by the Certificate Authority that issued the certificate.

**What to do.** If a key may be compromised, ask your CA to revoke the certificate and agree on the revocation date, then deactivate it in CodeSign Secure. Signatures made after the revocation date are no longer trusted.

## "CodeSign Secure runs the timestamp server."

**Reality.** CodeSign Secure uses public RFC 3161 Time Stamping Authorities. The signing tool on the **build machine** contacts the TSA directly, after CodeSign Secure returns the signature.

**What to do.** Allow outbound access from build machines to your TSA, usually HTTP on TCP 80, and configure a second TSA. See [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md).

## "Client tools keep working after a server upgrade."

**Reality.** Client tools should match the server release. After every upgrade, download the KSP, EC KSP for Mac, PKCS#11 Wrapper, Utility Tool, and ec-signer again from your own server's **Signing Tools** page, and run a test signing with each one.

## "Restoring a backup only adds what's missing."

**Reality.** A restore **overwrites the entire database** with the backed-up dump. Everything created after that backup, such as new users, certificates, applications, requests, and audit events, is removed.

**What to do.** Create and download a fresh backup before any restore, pause pipelines, and plan to re-create anything made after the restored backup.

## "Post-sign hash validation protects production releases."

**Reality.** For reproducible builds, **pre-sign** hash validation checks the artifact against a trusted rebuild **before** signing, and signs only if the hashes match. **Post-sign** validation runs after the signature already exists and is meant only for testing and development.

**What to do.** Use **Pre-Sign Hash Validation** as the key usage for production certificates that require reproducible-build checks.

## "Any key size is fine for a public code signing certificate."

**Reality.** CodeSign Secure supports RSA 2048, 3072, and 4096, and ECDSA P-256, P-384, and P-521. Public CAs require code signing RSA keys of **at least 3072 bits**, and not every CA accepts every ECDSA curve.

**What to do.** Use RSA 3072 or 4096 (the default is RSA 4096) for public certificates, and ask your CA which curves it accepts before you generate the CSR.

## "One shared account for all pipelines is simpler."

**Reality.** Each account can have one active portal session, and every signing is recorded against the account that made it. A shared account makes the Audit Trail less useful and means one leaked credential affects every pipeline.

**What to do.** Give each pipeline or build machine its own API user and authentication certificate, with only the permissions it needs.

## "A TLS-inspecting proxy is fine between build machines and CodeSign Secure."

**Reality.** Clients authenticate with a client certificate (mutual TLS). A proxy that inspects TLS removes it, so authentication fails.

**What to do.** Allow HTTPS to the CodeSign Secure domain without TLS inspection. In a cluster, configure the load balancer for TLS pass-through.

## Related articles

- [How CodeSign Secure works](how-codesign-secure-works.md)
- [CodeSign Secure FAQ](codesign-secure-faq.md)
- [Code signing myths and misconceptions](../../02-General/Code-Signing/code-signing-myths-and-misconceptions.md)
- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
