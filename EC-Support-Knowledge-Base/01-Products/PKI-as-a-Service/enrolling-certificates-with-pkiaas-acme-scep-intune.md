---
title: "Enrolling Certificates with PKIaaS: ACME, SCEP, and Intune"
category: "Products"
section: "PKI-as-a-Service"
article_type: "How-to"
applies_to: "Encryption Consulting PKIaaS; ACME clients (certbot, win-acme); NDES on Windows Server 2016 to 2025; Microsoft Intune Certificate Connector"
summary: "How to enroll certificates from EC PKIaaS using ACME clients, SCEP through NDES, and Microsoft Intune SCEP and PKCS profiles, with checks and fixes."
keywords: ["PKIaaS ACME", "SCEP NDES", "Intune SCEP profile", "Intune PKCS certificate connector", "certbot EAB"]
last_reviewed: "2026-10-06"
---

# Enrolling Certificates with PKIaaS: ACME, SCEP, and Intune

This article explains how to get certificates from Encryption Consulting (EC) PKI-as-a-Service (PKIaaS) using three common methods: Automated Certificate Management Environment (ACME), Simple Certificate Enrollment Protocol (SCEP) through Network Device Enrollment Service (NDES), and Microsoft Intune. It is for server, network, and endpoint administrators.

## Overview

| Method | Best for | Client side |
|---|---|---|
| ACME (RFC 8555) | Web servers, load balancers, Linux and Windows services | certbot, win-acme, acme.sh, CertSecure Manager |
| SCEP via NDES | Network devices, older devices, MDM platforms | Device SCEP client or MDM |
| Intune SCEP | Managed Windows, iOS/iPadOS, macOS, Android devices | Intune Certificate Connector plus NDES |
| Intune PKCS (Public-Key Cryptography Standards) | Managed devices where the connector requests the certificate and delivers the key | Intune Certificate Connector |

## Applies to

- PKIaaS issuing CAs with ACME, SCEP, or Intune enrollment enabled in scope.
- Microsoft Intune with the Certificate Connector for Microsoft Intune.

## Prerequisites

- Onboarding completed and the root CA trusted on clients. See [Onboarding to PKIaaS](onboarding-to-pkiaas.md).
- The certificate profile or template for the use case approved and published by EC.
- **ACME:** the ACME directory URL and, if required, External Account Binding (EAB) key ID and HMAC key from EC: {{TBD: PKIaaS ACME directory URL format and EAB issuance process}}.
- **SCEP/NDES:** a domain-joined Windows Server for NDES, a service account, and HTTPS publishing (for example Microsoft Entra application proxy or a reverse proxy) if devices enroll from the internet. Who hosts NDES in each model: {{TBD: PKIaaS NDES hosting model (customer-hosted or EC-hosted)}}.
- **Intune:** Intune Administrator rights, a Windows Server for the Certificate Connector, and network access from the connector to the issuing CA and NDES.

## Before starting

- Test on a pilot group first. A wrong SCEP or PKCS profile can push failing requests to every device in scope.
- Keep any existing certificate profiles in place until the new ones are proven.
- ACME EAB keys and the NDES service account password are secrets. Store them in a vault.

## Procedure

### Part A: ACME

1. Get the ACME directory URL and EAB credentials from EC.
2. On a Linux server with certbot, request a certificate:

```bash
sudo certbot certonly --standalone \
  --server <ACME_directory_URL> \
  --eab-kid <EAB_key_ID> --eab-hmac-key <EAB_HMAC_key> \
  -d <host.contoso.com>
```

3. On Windows with win-acme, run the interactive client and point it at the PKIaaS directory:

```powershell
.\wacs.exe --baseuri <ACME_directory_URL>
```

4. Confirm the renewal job (systemd timer or cron for certbot, scheduled task for win-acme).

> **Note:** ACME challenge type (HTTP-01, DNS-01, or TLS-ALPN-01) and any domain allow list are set per PKIaaS ACME profile: {{TBD: supported ACME challenge types in PKIaaS}}.

### Part B: SCEP through NDES

1. On the NDES server, add the role service. In Server Manager, add Active Directory Certificate Services (AD CS) and select **Network Device Enrollment Service**. Or use PowerShell:

```powershell
Install-WindowsFeature ADCS-Device-Enrollment -IncludeManagementTools
Install-AdcsNetworkDeviceEnrollmentService -ServiceAccountName <CONTOSO\svc-ndes> -ServiceAccountPassword (Read-Host -AsSecureString) -CAConfig "<CAHost\Contoso-Issuing-CA-01>"
```

2. Set the templates NDES uses. NDES reads three registry values under `HKLM\SOFTWARE\Microsoft\Cryptography\MSCEP`:

```cmd
reg add HKLM\SOFTWARE\Microsoft\Cryptography\MSCEP /v EncryptionTemplate /t REG_SZ /d <TemplateName> /f
reg add HKLM\SOFTWARE\Microsoft\Cryptography\MSCEP /v GeneralPurposeTemplate /t REG_SZ /d <TemplateName> /f
reg add HKLM\SOFTWARE\Microsoft\Cryptography\MSCEP /v SignatureTemplate /t REG_SZ /d <TemplateName> /f
iisreset
```

3. Test the endpoint. A browser call to `http://<ndes-server>/certsrv/mscep/mscep.dll` should return the NDES page. For non-Intune devices, get a challenge password from `http://<ndes-server>/certsrv/mscep_admin`.
4. Configure each device with the SCEP URL, challenge password, and subject.

### Part C: Intune SCEP and PKCS

1. Download and install the **Certificate Connector for Microsoft Intune** from the Intune admin center (Tenant administration > Connectors and tokens > Certificate connectors). Select **SCEP**, **PKCS**, or both during setup.
2. Create a **Trusted certificate** profile for the PKIaaS root (and issuing CA if required) for each platform.
3. For SCEP, create a **SCEP certificate** profile. Set the subject name format, Subject Alternative Name (SAN), key usage, Extended Key Usage (EKU), validity, the linked trusted certificate profile, and the external SCEP server URL (for example `https://<external-ndes-fqdn>/certsrv/mscep/mscep.dll`).
4. For PKCS, create a **PKCS certificate** profile. Enter the CA server name and CA name (for example `Contoso-Issuing-CA-01`) and the template name from EC.
5. Assign profiles to a pilot group, then sync a device.

## Verification

- ACME: `openssl x509 -in /etc/letsencrypt/live/<host>/cert.pem -noout -issuer -enddate` shows the PKIaaS issuing CA.
- NDES: check the Application event log for NDES events and the issuing CA log for the request.
- Intune: in the admin center, open the profile and check **Device status**. On Windows, the certificate appears in `certlm.msc` (device) or `certmgr.msc` (user).
- The connector logs are in the Event Viewer under Applications and Services Logs > Microsoft > Intune > CertificateConnectors.

## Rollback

Unassign the new profiles, reassign the previous ones, and sync devices. For ACME, point the client back at the previous directory URL. Revoke any test certificates no longer needed.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| certbot: "externalAccountRequired" | EAB not supplied | Add `--eab-kid` and `--eab-hmac-key` |
| ACME: "unauthorized" on challenge | Challenge not reachable or domain not allowed | Check port 80 or DNS record; confirm domain allow list with EC |
| NDES returns HTTP 500 | Templates missing or service account lacks Enroll permission | Check registry values and template permissions, then `iisreset` |
| Intune SCEP profile "Failed" | Connector cannot reach NDES or CA, or URL wrong | Check connector logs and external URL |
| Intune PKCS "CA not found" | Wrong CA server or CA name | Use exact values from EC; test with `certutil -config "<CAHost\CAName>" -ping` |
| Certificate issued but not trusted | Trusted certificate profile missing or not linked | Assign and link the trusted certificate profile |

## Related articles

- [Onboarding to PKIaaS](onboarding-to-pkiaas.md)
- [PKIaaS FAQ](pkiaas-faq.md)
- [ACME protocol explained](../../02-General/Certificate-Lifecycle-Management/acme-protocol-explained.md)
- [Certificate templates in AD CS](../../02-General/PKI/certificate-templates-in-ad-cs.md)
- [ACME enrollment with CertSecure Manager](../CertSecure-Manager/acme-enrollment-with-certsecure-manager.md)
