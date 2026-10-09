---
title: "CodeSign Secure Prerequisites and HSM Integration"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure v3.2.1  and later, customer-installed deployments on Windows Server 2022 with Entrust nShield, Thales Luna, Securosys Primus, or Utimaco SecurityServer HSMs"
summary: "Server, network, HSM, and client prerequisites for CodeSign Secure, how the installer connects to the HSM, the first-time configuration order, and verification."
keywords: ["CodeSign Secure prerequisites", "CodeSign Secure installation", "HSM integration", "Windows Server 2022", "nShield", "Thales Luna", "Securosys", "Utimaco"]
last_reviewed: "2026-10-08"
---

# CodeSign Secure Prerequisites and HSM Integration

This article lists what must be in place before you install CodeSign Secure, how the server connects to the Hardware Security Module (HSM), and what to configure after installation. It is for administrators preparing a customer-installed deployment. SaaS customers can skip the server and HSM sections, because EC operates those parts, and go straight to the "Client machine prerequisites" section.

## Overview

CodeSign Secure needs three things to sign code: a server, an HSM that holds the signing keys, and signing clients on the machines that run signing tools. The server reaches the HSM through the HSM vendor's client software, which must be installed and working **before** you run the CodeSign Secure installer.

## Applies to

- CodeSign Secure v3.2.1  and later.
- Single-server and cluster deployments on Windows Server 2022.

## Server prerequisites

| Item | Requirement |
|---|---|
| Operating system | Windows Server 2022, dedicated to CodeSign Secure |
| CPU | At least 8 cores |
| Memory | 32 GB RAM (recommended) |
| Storage | 250 GB. Increase it if you keep backups and logs on the server for a long time. |
| Database | MongoDB 6.0 or later. The installer installs MongoDB and MongoDB Compass if they aren't present. |
| Other software | Python 3.10.11 or later and Microsoft Build Tools x64. The installer installs them if they aren't present. |
| DNS | A DNS name for the portal, for example `codesign.example.com`, that resolves to the server or to your load balancer |
| Account | A local Administrator account on the server |
| Time | Network Time Protocol (NTP) configured. Tokens and request timers depend on accurate time. |

The installer sets up the CodeSign Secure backend (REST API), the frontend (portal), and Apache, which publishes both over HTTPS. The default installation folder is `C:\CodeSignSecure`.

## HSM prerequisites

### Supported HSMs

Use these versions or later. For other HSMs, contact EC before you deploy.

| HSM | Firmware | Client software | Notes |
|---|---|---|---|
| Entrust nShield | 13.8.0 | 13.7.3 | FIPS 140-2 Level 3. HA supported. |
| Thales Luna | 10.7.1-125 | 7.3.0 | FIPS 140-2 Level 3. HA supported. |
| Securosys Primus | 2.8.21 | Primus PKCS#11 provider for your firmware | FIPS 140-2 Level 3 (X- and E-Series on 2.8.21). X2- and E2-Series run firmware 3.x. |
| Utimaco SecurityServer Se Gen2 | 4.32.0 | SecurityServer PKCS#11 client for your firmware | FIPS 140-2 Level 3 (CryptoServer Se-Series Gen2 on 4.32.0). |

### Before you run the installer

- The HSM client software is installed on the CodeSign Secure server and connected to your HSM. The installer asks for the HSM type.
- **Entrust nShield only:** `openssl.exe` is present in `C:\Program Files\nCipher\nfast\bin\`. The installer uses it to create its internal certificate authorities.
- The HSM is in FIPS-approved mode if your policy requires it, and a dedicated partition (Luna) or Security World (nShield) is available for code signing keys.
- The HSM is backed up with the vendor's tools before keys are created.

### Confirm the HSM client works

Run the vendor checks on the CodeSign Secure server. Fix any failure here first; CodeSign Secure can't work around it.

| HSM | Command | Healthy result |
|---|---|---|
| Entrust nShield | `"C:\Program Files\nCipher\nfast\bin\enquiry.exe"` | The module reports mode `operational`. |
| Entrust nShield | `"C:\Program Files\nCipher\nfast\bin\nfkminfo.exe"` | The Security World is initialized and usable. Its files are in `%NFAST_KMDATA%\local`. |
| Thales Luna | `vtl verify` (in the Luna client folder, for example `C:\Program Files\SafeNet\LunaClient`) | The code signing partition is listed. |
| Thales Luna | `lunacm`, then `slot list` | The expected slot is shown. Note the slot number, because the PKCS#11 Wrapper needs it for Luna. |
| Securosys Primus, Utimaco | The vendor's PKCS#11 client diagnostic tools | The HSM and slot are reachable. |

For client enrollment and HA setup, see [Enrolling a client with an nShield Connect](../../04-Featured-Articles/HSM-Runbooks/enrolling-a-client-with-an-nshield-connect.md) and [Configuring Luna HA groups](../../04-Featured-Articles/HSM-Runbooks/configuring-luna-ha-groups.md).

## Network prerequisites

| Source | Destination | Port | Required |
|---|---|---|---|
| Browsers (administrators, approvers, auditors) | CodeSign Secure server or load balancer | TCP 443 by default (configurable, for example 8443), HTTPS | Yes |
| Build machines and CI agents (all clients) | CodeSign Secure server or load balancer | TCP 443 by default, HTTPS with client certificate | Yes |
| CodeSign Secure server | HSM | Vendor defaults: nShield Connect TCP 9004, Luna NTLS TCP 1792, Securosys Primus TCP 2300, Utimaco TCP 288 | Yes |
| CodeSign Secure server | SMTP server | The port set in **Email > Config**, for example TCP 587 | If you use approvals, MFA, or email alerts |
| CodeSign Secure server | `login.microsoftonline.com`, `graph.microsoft.com` | TCP 443 | For Azure AD sign-in |
| CodeSign Secure server | SharePoint through Microsoft Graph | TCP 443 | For cloud backups |
| CodeSign Secure server | Grafana Loki or Splunk | As set in the plugin | Optional |
| Build machines | Time Stamping Authority | Usually HTTP TCP 80 | For timestamping |

- Only the portal port should be reachable from other hosts. Keep MongoDB and the internal service ports local to the server.
- Don't let proxies inspect TLS traffic to CodeSign Secure. Clients authenticate with a client certificate, and inspection breaks mutual TLS.
- HSM ports are vendor defaults. Confirm the port and direction against your own HSM configuration.

## Install CodeSign Secure

EC provides the installer as an ISO file. The main steps are:

1. Mount or extract the ISO, right-click **CodeSign Secure Installer**, and select **Run as administrator**.
2. Accept the license, keep or change the installation folder, and select both **CodeSign Secure – BACKEND** and **CodeSign Secure – FRONTEND**.
3. In **Frontend URL**, enter the portal DNS name **without** `https://`, for example `codesign.example.com`.
4. When the PowerShell window asks, enter the distinguished name details for the three internal certificate authorities:

   | CA | Purpose |
   |---|---|
   | Root CA | Root of the code signing certificates issued inside CodeSign Secure |
   | Issuing CA | Issues code signing certificates created with **Self Signed Certificate** |
   | Root CA for P12 authentication | Issues the client authentication certificates |

5. When the seed-data script runs, enter your HSM type (for example `NCIPHER` for Entrust nShield), the Azure AD app registration values if you use Azure AD sign-in, and the first System Admin account.
6. Wait for **CodeSign Secure was successfully installed!**, then start Apache Monitor from the taskbar and confirm Apache is running.

> **Important:** The PowerShell console shows what you type, including the client secret and password. Close it when the script finishes, don't take screenshots of it, and change/reset the password after your first sign-in if anyone else saw it.

## Verify the installation

| Check | Expected result |
|---|---|
| Open `https://<your-domain>/` | The sign-in page loads. |
| Sign in with the first System Admin account | The Dashboard opens. |
| **Dashboard > HSM Health Check** | Status is **Active**, and the HSM model and serial number are shown. |

## First-time configuration order

Configure the portal in this order. Each step depends on the ones before it.

1. **SSL/TLS Management:** replace the initial self-signed portal certificate with one from your PKI, with the full chain.
2. **Email:** add and activate one SMTP configuration, so notifications and MFA codes can be sent.
3. **Environment:** create environments and their approval policies.
4. **Roles and Permissions:** enable permissions for every role except System Admin, which is the only role with permissions by default.
5. **User:** register users and assign roles.
6. **Backup:** schedule backups and store a copy off the server.

Then create your first certificate, application, and team mapping. See [Approval workflows and signing policies](approval-workflows-and-signing-policies.md).

## Create a signing key and certificate

In **Keys and Certificates > Add New Certificate**, the private key is always generated inside the HSM.

| Method | Use for |
|---|---|
| Self Signed Certificate | Testing and development. Issued by the internal CA, so operating systems don't trust it unless you install the certificate chain from **Signing Tools**. |
| Certificate Signing Request (CSR) | Production. Submit the CSR to a public or enterprise CA. Every CSR creates a new key pair. |
| Import Certificate | Uploading the certificate your CA issued for a CSR created in CodeSign Secure. The Certificate Name must match the name used for the CSR. |

For RSA and ECDSA keys, CodeSign Secure supports RSA 2048, 3072, and 4096 bits (default 4096), and ECDSA P-256, P-384, and P-521. Public CAs require code signing RSA keys of at least 3072 bits. Check which ECDSA curves your CA accepts before you generate the CSR.

## Client machine prerequisites

| Client | Operating systems | Also needs |
|---|---|---|
| Encryption Consulting KSP | Windows 10, Windows 11, Windows Server 2019, 2022, and 2025 | Windows SDK with **Windows SDK Signing Tools for Desktop Apps** (SignTool) |
| EC KSP for Mac | macOS | Keychain Access, codesign |
| PKCS#11 Wrapper | Windows, Linux, macOS | The signing tool and, for Java tools, Java 8 to 17 on Linux and macOS or Java 22 on Windows. On Linux, the log4cxx libraries. |
| Utility Tool | Windows | Prompts to install the Windows SDK, Java SDK, and EC KSP if needed. Optional ClamAV for malware scanning. |
| ec-signer | Container build host | Python, Docker, and cosign |

Every client also needs:

- Network access to the CodeSign Secure server on the portal port.
- An authentication certificate (PFX) from **System Setup > User > Generate Authentication Certificate**.
- A registered CodeSign Secure user whose role has the **CodeSigning Operation** permission and who is in a team mapped to the certificate.
- Client tools downloaded from your own server's **Signing Tools** page. Download them again after every server upgrade.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| A dependency fails to install | A prerequisite failed during setup | Select **Open Logs** in the installer to find the failing step. |
| The installer can't create the certificate authorities | `openssl.exe` missing (nShield) | Check that `openssl.exe` exists in `C:\Program Files\nCipher\nfast\bin\`. |
| The sign-in page doesn't load | Apache or a CodeSign Secure service isn't running, or DNS or firewall is wrong | Check the services and Apache Monitor, that the Frontend URL resolves to this server, and that the firewall allows it. |
| HSM Health Check shows Inactive | The HSM client isn't working | Run the vendor checks above, restart the HSM client and Apache services, and check again. See [Troubleshooting HSM Health Check Inactive](troubleshooting-hsm-health-check-inactive.md). |

## Related articles

- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Troubleshooting HSM Health Check Inactive](troubleshooting-hsm-health-check-inactive.md)
- [How HSM partitions work](../../04-Featured-Articles/HSM-Runbooks/how-hsm-partitions-work.md)
- [Connecting applications to HSMaaS (PKCS#11, CNG, JCE)](../HSM-as-a-Service/connecting-applications-to-hsmaas-pkcs11-cng-jce.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
