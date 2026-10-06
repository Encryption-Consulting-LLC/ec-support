---
title: "Connecting CertSecure Manager to Microsoft AD CS"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager; Microsoft AD CS Enterprise CAs on Windows Server 2016 and later"
summary: "Step-by-step guide to connect CertSecure Manager to a Microsoft AD CS issuing CA, including service account, template permissions, DCOM, and RPC firewall rules."
keywords: ["CertSecure Manager AD CS", "Microsoft CA integration", "template permissions", "Issue and Manage Certificates", "DCOM RPC"]
last_reviewed: "2026-10-06"
---

# Connecting CertSecure Manager to Microsoft AD CS

This article explains how to connect CertSecure Manager to a Microsoft Active Directory Certificate Services (AD CS) Enterprise Certificate Authority (CA). It covers the service account, template and CA permissions, network requirements, and testing. It is for PKI administrators who own the CA and the CertSecure Manager administrators who configure the connector.

## Overview

CertSecure Manager sends certificate requests to AD CS through the Microsoft certificate request interface (ICertRequest), which uses Distributed Component Object Model (DCOM) over Remote Procedure Call (RPC). It can also import records of certificates the CA has already issued, so they appear in the inventory. To work, the connector needs:

- A domain service account with the right permissions on templates and on the CA.
- Network access from the requesting component to the CA on the RPC ports.
- One or more published certificate templates.

## Applies to

- Enterprise CAs (integrated with Active Directory). Standalone CAs do not use templates and need a different design. Ask EC support before connecting a standalone CA.
- Issuing CAs. Do not connect an offline root CA.

## Prerequisites

- Domain administrator or delegated rights to create a service account.
- Enterprise Admin rights, or delegated rights on the template container, to duplicate and edit templates.
- CA administrator rights (**Manage CA**) on each issuing CA.
- The CA configuration string, in the form `<CAHostFQDN>\<CA Common Name>`.
- A CertSecure Manager administrator account.
- If CertSecure Manager is SaaS or hybrid, the on-premises component installed in a network that can reach the CA. See [architecture and deployment options](certsecure-manager-architecture-and-deployment-options.md).

## Before starting

- **Risk:** Wrong template settings can let a requester supply any subject name, which is a known AD CS escalation path (ESC1). Restrict who can enroll on templates that allow "Supply in the request". See [Common AD CS misconfigurations (ESC1 to ESC8)](../../02-General/PKI/common-ad-cs-misconfigurations-esc1-to-esc8.md).
- **Change window:** Template and CA permission changes do not need a CA restart, but follow the normal change process.
- **Backup:** Take a CA backup and export the template settings before changing them.

## Procedure

### Phase 1: Create the service account

1. In Active Directory Users and Computers, create a dedicated account, for example `svc-certsecure`.
2. Set a long, random password. Use a group Managed Service Account (gMSA) only if the CertSecure Manager component supports it: {{TBD: gMSA support for CertSecure Manager connector}}.
3. Record the password expiry date, or put the account under a password rotation process. An expired password stops all issuance.
4. Do not add the account to Domain Admins or Enterprise Admins.

### Phase 2: Prepare certificate templates

1. Open the Certificate Templates console (`certtmpl.msc`).
2. Right-click the source template (for example **Web Server**) and select **Duplicate Template**. Give it a clear name such as `CSM-WebServer`.
3. On the **Subject Name** tab, select **Supply in the request** if CertSecure Manager will set the subject and Subject Alternative Names (SANs).
4. On the **Request Handling** tab, select **Allow private key to be exported** only if the certificate and key must be exported as a PFX file for deployment. Leave it cleared where keys are generated on the endpoint.
5. On the **Cryptography** tab, set the minimum key size and provider required by policy.
6. On the **Issuance Requirements** tab, select **CA certificate manager approval** only if a manual approval step at the CA is wanted.
7. On the **Security** tab, add the service account and grant **Read** and **Enroll**. Do not grant **Autoenroll** unless needed. Remove broad groups (such as Domain Users or Authenticated Users) from **Enroll** on templates that allow "Supply in the request".
8. Select **OK**.

### Phase 3: Publish the template on the CA

1. Open the Certification Authority console (`certsrv.msc`).
2. Right-click **Certificate Templates**, select **New**, then **Certificate Template to Issue**.
3. Select the new template and select **OK**.
4. Wait for Active Directory replication, or check that the CA sees the template:

```cmd
certutil -config "<CAHostFQDN>\<CA Common Name>" -CATemplates
```

### Phase 4: Set CA permissions

1. In `certsrv.msc`, right-click the CA name and select **Properties**, then **Security**.
2. Confirm the service account (or a group that contains it) has **Request Certificates**. Authenticated Users have this right by default.
3. Grant **Issue and Manage Certificates** only if CertSecure Manager must approve pending requests, revoke certificates, or read the full CA database for import. Leave it off otherwise.
4. If **Certificate Managers** restrictions are enabled on the CA, add the allowed templates for the service account.
5. On the CA server, confirm the service account is in the local group **Certificate Service DCOM Access**, either directly or through Authenticated Users.

### Phase 5: Open network paths

1. Allow TCP 135 (RPC endpoint mapper) from the requesting component to the CA.
2. Allow the dynamic RPC range, TCP 49152 to 65535 by default on Windows Server 2008 and later, or the fixed port if the CA's DCOM endpoint is set to a static port. Verify a static port design against the Microsoft documentation for the installed Windows version.
3. Test the path from the requesting component:

```powershell
Test-NetConnection -ComputerName <CAHostFQDN> -Port 135
certutil -config "<CAHostFQDN>\<CA Common Name>" -ping
```

### Phase 6: Add the CA connector in CertSecure Manager

1. Sign in to the CertSecure Manager console as an administrator.
2. Go to {{TBD: CertSecure Manager menu path for adding a CA connector}}.
3. Select Microsoft AD CS as the CA type.
4. Enter the CA configuration string and the service account credentials.
5. Select the component that will reach the CA (for SaaS or hybrid deployments).
6. Select the templates to make available, and map them to policies and teams.
7. Save, then run the built-in connection test if available: {{TBD: connection test option name}}.

## Verification

1. Test enrollment as the service account outside the product. On a test machine, create a request file and submit it:

```cmd
runas /user:<DOMAIN>\svc-certsecure cmd
certreq -submit -config "<CAHostFQDN>\<CA Common Name>" -attrib "CertificateTemplate:CSM-WebServer" <request.req> <cert.cer>
```

2. Request a test certificate from CertSecure Manager using the new template.
3. In `certsrv.msc`, check **Issued Certificates** for the new serial number.
4. Confirm the certificate appears in the CertSecure Manager inventory.
5. Revoke the test certificate if it is not needed.

## Rollback

- Remove the CA connector in CertSecure Manager.
- Remove the template from the CA's **Certificate Templates to Issue** list.
- Remove the service account from template and CA permissions, then disable the account.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| "The RPC server is unavailable. 0x800706ba" | TCP 135 or the dynamic RPC range blocked, wrong CA hostname, or CertSvc stopped | Run `Test-NetConnection` to port 135, open the dynamic range, check DNS, and run `certutil -ping` |
| "Denied by Policy Module 0x80094012" (template permissions) | Service account lacks **Read** or **Enroll** on the template | Add **Read** and **Enroll** on the template Security tab, then wait for replication |
| "The requested certificate template is not supported by this CA" (0x80094800) | Template not published on the CA | Add the template to **Certificate Templates to Issue** |
| "Access is denied 0x80070005" | Account missing **Request Certificates** on the CA, or not in **Certificate Service DCOM Access** | Fix CA security and DCOM group membership |
| Request stays pending | Template requires CA manager approval | Approve in `certsrv.msc`, or grant **Issue and Manage Certificates** if the platform should approve |
| Sudden failures after weeks of success | Service account password expired or account locked | Reset the password, update it in CertSecure Manager, and add a rotation reminder |
| Subject name missing on issued certificate | Template builds subject from Active Directory | Set **Supply in the request** on a dedicated, restricted template |

## Related articles

- [CertSecure Manager prerequisites checklist](certsecure-manager-prerequisites-checklist.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
- [Certificate templates in AD CS](../../02-General/PKI/certificate-templates-in-ad-cs.md)
- [Common AD CS misconfigurations (ESC1 to ESC8)](../../02-General/PKI/common-ad-cs-misconfigurations-esc1-to-esc8.md)
- [certutil command reference](../../04-Featured-Articles/PKI-Runbooks/certutil-command-reference.md)
