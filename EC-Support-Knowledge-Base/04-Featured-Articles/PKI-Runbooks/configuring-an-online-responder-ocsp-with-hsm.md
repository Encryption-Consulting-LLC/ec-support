---
title: "Configuring an Online Responder (OCSP) with an HSM"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Runbook"
applies_to: "Microsoft Online Responder on Windows Server 2016 to 2025; Entrust nShield and Thales Luna KSPs"
summary: "Install a Microsoft Online Responder, enroll an OCSP signing certificate with an HSM key, let the OCSP service use the key, and add a revocation configuration."
keywords: ["Online Responder", "OCSP", "HSM", "OCSP Response Signing", "Network Service", "nShield", "Luna", "revocation configuration"]
last_reviewed: "2026-10-06"
---

# Configuring an Online Responder (OCSP) with an HSM

This runbook sets up a Microsoft Online Responder that signs Online Certificate Status Protocol (OCSP) responses with a key stored in a Hardware Security Module (HSM). It is for PKI administrators and HSM operators who add OCSP to an existing Active Directory Certificate Services (AD CS) hierarchy.

## Overview

The Online Responder answers "is this certificate revoked?" requests. It reads the CA's CRL and signs each answer with an **OCSP Response Signing** certificate. With an HSM, the private key of that certificate lives in the HSM.

The Online Responder service (`OCSPSvc`) runs as **Network Service** by default. That account must be able to use the signing key without a person present. This drives two design rules:

1. The HSM key must be usable without a card or PIN prompt. For nShield, use **module protection** (or a softcard or OCS setup that is preloaded, which is more complex). For Luna, the partition must stay activated and the KSP slot must be registered for the account that runs the service.
2. The service account must have permission to use the key.

## Applies to

- Windows Server 2016 to 2025 with the Online Responder role service (`ADCS-Online-Cert`).
- nShield with the nCipher Security World Key Storage Provider; Luna with the SafeNet Key Storage Provider.

## Prerequisites

- Enterprise CA (or standalone CA with manual enrollment) and CA Administrator rights.
- HSM client installed on the OCSP server and the KSP registered:
  - nShield: Security World loaded; CNG providers registered with the CNG configuration wizard or `cngregister`.
  - Luna: `KspConfig.exe` used to register `cryptoki.dll` and the HSM slots for the Administrator account and the account that will run the OCSP service. The Thales integration guide registers slots for `NT AUTHORITY\SYSTEM` and runs the Online Responder service as Local System. Follow the vendor guide for the installed version.
- An HTTP name for the responder, for example `http://ocsp.contoso.com/ocsp`.

## Before starting

- OCSP signing certificates are short lived (the default template is 2 weeks) and renew often. Each renewal can create a new key in the HSM. Plan HSM capacity and key clean-up.
- Decide whether to use automatic enrollment (recommended) or a manually selected signing certificate.

## Procedure

### Phase 1: Prepare the template

1. On the CA, open **Certificate Templates** (`certtmpl.msc`) and duplicate **OCSP Response Signing**.
2. On the **Cryptography** tab, set provider category to **Key Storage Provider** and select only the HSM KSP under **Requests must use one of the following providers**.
3. On the **Security** tab, give the OCSP server computer account **Read** and **Enroll** (and **Autoenroll** if used).
4. Publish the template on the CA (**Certificate Templates** > **New** > **Certificate Template to Issue**).

### Phase 2: Configure the CA

5. Add the OCSP URL to the AIA extension and restart the CA:

```powershell
Add-CAAuthorityInformationAccess -Uri "http://ocsp.contoso.com/ocsp" -AddToCertificateOcsp -Force
Restart-Service certsvc
```

6. Allow the CA to support OCSP: in the CA properties **Extensions** tab, confirm the OCSP URL has **Include in the online certificate status protocol (OCSP) extension** selected.

### Phase 3: Install the Online Responder

7. On the OCSP server:

```powershell
Install-WindowsFeature ADCS-Online-Cert -IncludeManagementTools
Install-AdcsOnlineResponder -Force
```

### Phase 4: Enroll the signing certificate and grant key access

8. Open the **Online Responder Management** console and select **Revocation Configuration** > **Add Revocation Configuration**.
9. Select the CA certificate, then choose **Automatically select a signing certificate** and **Auto-Enroll for an OCSP signing certificate** with the new template. As an alternative, enroll the certificate manually in `certlm.msc` and choose **Manually select a signing certificate**.
10. Add the CRL locations (the provider normally reads them from the CA certificate).
11. Grant the service access to the key:
    - Where the KSP supports key permissions in Windows, open `certlm.msc` > **Personal** > the OCSP signing certificate > **All Tasks** > **Manage Private Keys**, and give **NETWORK SERVICE** Read.
    - nShield module-protected keys are available to processes on the host that can reach the hardserver. Confirm the service can sign by checking the array status.
    - Luna: confirm the slot registration covers the service account. If the vendor guide is followed, set the Online Responder service to run as Local System.

### Phase 5: Build an array (optional)

12. Add other OCSP servers under **Array Configuration**. Each member needs its own HSM access and signing certificate. Put the members behind a load balancer on the OCSP name.

## Verification

1. In **Array Configuration**, every member shows the revocation configuration status as **Working**.
2. Issue a test certificate and run:

```cmd
certutil -URL <TestCert>.cer
certutil -verify -urlfetch <TestCert>.cer
```

In `certutil -URL`, select **OCSP (from AIA)** and **Retrieve**; the status should be **Verified**. In `-verify -urlfetch` output, look for the OCSP URL and "Leaf certificate revocation check passed".
3. Revoke a test certificate, publish a CRL (`certutil -CRL`), and confirm OCSP returns **Revoked** after the responder refreshes its CRL.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Status "Bad signing certificate on array controller" | Service cannot access the HSM key | Grant key access (Step 11), check KSP registration for the service account, use module protection on nShield. |
| No signing certificate enrolled | Template permissions or provider list | Check template Security and Cryptography tabs and the CA template list. |
| Responses signed with an expired certificate | Auto-enrollment failing | Check the Application event log for CertificateServicesClient errors; run `certutil -pulse`. |
| Luna signing works for Administrator only | Slot not registered for the service account | Run `KspConfig.exe` and register the slot for the service account. |
| OCSP returns "unknown" | Responder cannot read a current CRL | Check CDP reachability from the OCSP server and the CRL Next Update. |

## Related articles

- [High Availability CDP and AIA](high-availability-cdp-and-aia.md)
- [Troubleshooting Revocation Server Offline Errors](troubleshooting-revocation-server-offline-errors.md)
- [CRL vs OCSP](../../02-General/PKI/crl-vs-ocsp.md)
- [Configuring AD CS with an HSM KSP](../HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
- [Configuring Luna HA Groups](../HSM-Runbooks/configuring-luna-ha-groups.md)
