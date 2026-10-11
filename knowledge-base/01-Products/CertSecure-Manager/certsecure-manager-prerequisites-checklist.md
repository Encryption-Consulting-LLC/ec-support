---
title: "CertSecure Manager Prerequisites Checklist"
category: "Products"
section: "CertSecure Manager"
article_type: "Reference"
applies_to: "CertSecure Manager (all deployment models)"
summary: "A checklist of accounts, permissions, network rules, and information to prepare before installing or onboarding CertSecure Manager in an environment."
keywords: ["CertSecure Manager prerequisites", "service account", "AD CS permissions", "firewall rules", "onboarding checklist"]
last_reviewed: "2026-10-06"
---

# CertSecure Manager Prerequisites Checklist

This checklist lists what an organization should prepare before CertSecure Manager is deployed or onboarded. Completing it before the kickoff call shortens the project and avoids most first-week support cases. It is for project managers, PKI administrators, and network and server teams.

## How to use this checklist

Work through each table and mark every item as done, not applicable, or blocked. Share blocked items with the EC project team early.

## 1. Platform and hosting

| Item | Details | Done |
|---|---|---|
| Deployment model chosen | SaaS, cloud, hybrid, or on-premises. See [architecture and deployment options](certsecure-manager-architecture-and-deployment-options.md). | |
| Servers or cloud resources | Sized for the expected certificate volume | |
| Database | Supported database engine and version | |
| TLS certificate for the console | Issued by a CA that admin browsers trust | |
| Time sync | All servers use Network Time Protocol (NTP). Clock drift breaks Kerberos and TLS checks. | |
| Backup plan | Database and configuration backups scheduled (on-premises and cloud models) | |

## 2. Identity and access

| Item | Details | Done |
|---|---|---|
| Admin sign-in method | Single sign-on (SSO) provider or local accounts | |
| Role design | Who are administrators, approvers, requesters, and auditors | |
| Service accounts created | One per purpose (CA access, Windows endpoints, Linux endpoints, discovery). Avoid shared personal accounts. | |
| Password policy for service accounts | Managed service accounts, or a documented rotation process. An expired service account password is a common cause of failed renewals. | |
| Secrets storage | Where service credentials will be stored (built-in vault or external vault such as HashiCorp Vault) | |

## 3. Microsoft AD CS (if used)

| Item | Details | Done |
|---|---|---|
| CA names and hosts | Config string for each issuing CA, in the form `<CAHostFQDN>\<CA Common Name>` | |
| Templates to use | Duplicate templates for CLM use rather than editing default templates | |
| Template permissions | Service account has **Read** and **Enroll** on each template | |
| Template subject setting | "Supply in the request" on the Subject Name tab when the platform supplies the subject | |
| Private key export setting | "Allow private key to be exported" on the Request Handling tab, only where key export is required (for example PFX deployment) | |
| CA permissions | **Request Certificates** on the CA (Authenticated Users have it by default). **Issue and Manage Certificates** only if the platform must approve pending requests or revoke certificates. | |
| DCOM access | Service account is a member of the CA server's local **Certificate Service DCOM Access** group (Authenticated Users are members by default) | |
| Templates published | Each template is added to the CA's Certificate Templates list | |

Details: [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md).

## 4. Public and cloud CAs (if used)

| Item | Details | Done |
|---|---|---|
| CA account | DigiCert, Sectigo, Google Public CA, Let's Encrypt, AWS ACM, or AWS Private CA account with API access | |
| API credentials | API key, External Account Binding (EAB) credentials, or cloud Identity and Access Management (IAM) role | |
| Domain validation plan | How domain control will be proven (DNS or HTTP) | |
| Organization validation | Organization details pre-validated with the CA for OV and EV certificates | |

## 5. Network and firewall

| From | To | Port | Done |
|---|---|---|---|
| Admin workstations | Console | HTTPS 443 (default) | |
| Platform or on-premises component | AD CS CAs | TCP 135 plus dynamic RPC (TCP 49152 to 65535 by default) | |
| Platform or on-premises component | Public CA APIs | TCP 443 outbound | |
| Discovery component | Target ranges | TLS ports in scope (for example 443, 8443, 636, 993) | |
| Automation component | Windows endpoints | WinRM 5985 or 5986 | |
| Automation component | Linux endpoints | SSH 22 | |
| Automation component | F5 BIG-IP | HTTPS to management interface | |
| On-premises component | SaaS platform (hybrid or SaaS) | TCP 443 outbound (hostnames provided by EC during onboarding) | |

Also allow the platform through any proxy and add an exception to TLS inspection if the proxy breaks certificate pinning.

## 6. Endpoints

| Item | Details | Done |
|---|---|---|
| Endpoint list | Hostnames, platforms, and owners for the first automation wave | |
| F5 BIG-IP account | User with the **Certificate Manager** role (or higher) on the required partitions | |
| Windows (IIS) account | Local administrator rights | |
| Linux (Apache, NGINX, Tomcat) account | Write access to certificate and key paths, and rights to reload the service (for example a scoped sudo rule) | |
| Change process | Change windows agreed for automated deployments | |

## 7. Integrations

| Item | Details | Done |
|---|---|---|
| ITSM | ServiceNow, Jira, or Zendesk instance URL and integration account | |
| Email | SMTP relay host and sender address for alerts | |
| Monitoring | Splunk, Datadog, or OpenTelemetry collector details | |
| DevOps | Ansible, Terraform, or pipeline tools that will call the API | |

## Related articles

- [CertSecure Manager architecture and deployment options](certsecure-manager-architecture-and-deployment-options.md)
- [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md)
- [Connecting CertSecure Manager to public CAs](connecting-certsecure-manager-to-public-cas.md)
- [Certificate templates in AD CS](../../02-General/PKI/certificate-templates-in-ad-cs.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
