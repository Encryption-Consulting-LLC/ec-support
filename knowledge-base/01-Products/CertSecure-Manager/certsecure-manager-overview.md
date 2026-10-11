---
title: "CertSecure Manager Overview"
category: "Products"
section: "CertSecure Manager"
article_type: "Overview"
applies_to: "CertSecure Manager (SaaS, cloud, hybrid, and on-premises deployments)"
summary: "An introduction to CertSecure Manager, the EC certificate lifecycle management platform for discovery, inventory, automated renewal, alerts, and policy."
keywords: ["CertSecure Manager", "certificate lifecycle management", "CLM", "certificate discovery", "certificate automation"]
last_reviewed: "2026-10-06"
---

# CertSecure Manager Overview

CertSecure Manager is the Encryption Consulting (EC) platform for certificate lifecycle management (CLM). This article explains what the product does, how it fits together, and where to find help. It is written for PKI administrators, security teams, and IT operations staff who are evaluating or starting to use the product.

## What it is

CertSecure Manager gives an organization one place to find, track, issue, renew, and retire digital certificates. It works with Microsoft Active Directory Certificate Services (AD CS), public Certificate Authorities (CAs), and private CAs. It covers Transport Layer Security (TLS) server certificates, Secure/Multipurpose Internet Mail Extensions (S/MIME) email certificates, code signing certificates, and private PKI certificates.

The main goal is to prevent outages caused by expired or misconfigured certificates, and to give security teams control over how certificates are requested and used.

## Key capabilities

- **Discovery and inventory:** Continuous discovery of certificates across networks, CAs, and cloud platforms, with a central inventory. Unknown or rogue certificates are flagged.
- **Automated renewal and deployment:** Zero-touch renewal and push of new certificates to endpoints such as F5 BIG-IP, Microsoft Internet Information Services (IIS), Apache, NGINX, and Tomcat.
- **Expiry alerts:** Scheduled alerts before certificates expire, plus automatic ticket creation in IT Service Management (ITSM) tools.
- **Policy enforcement:** Rules for allowed key types, key sizes, and algorithms, Federal Information Processing Standards (FIPS) alignment, and organization-wide enrollment policies.
- **Approval workflows:** Multi-level approvals and M of N approval policies that control who can request certificates from which CA.
- **Role-based access control (RBAC):** Access scoped by role, team, or business unit.
- **Audit and compliance reporting:** A full audit trail of requests, approvals, issuance, renewal, and revocation.
- **Standard enrollment protocols:** REST API, Automated Certificate Management Environment (ACME), Simple Certificate Enrollment Protocol (SCEP), and Enrollment over Secure Transport (EST).

## How it works

At a high level, CertSecure Manager has four parts:

1. **Central platform:** The web console, policy engine, workflow engine, inventory database, and reporting. It runs as SaaS or is installed in the customer environment.
2. **CA connectors:** Connections to Microsoft AD CS and to public and cloud CAs. The platform uses these to request, renew, and revoke certificates and to import existing certificate records.
3. **Discovery and automation components:** Network scans and endpoint integrations that find deployed certificates and install renewed ones. Some environments use a locally installed component inside the private network. See [CertSecure Manager architecture and deployment options](certsecure-manager-architecture-and-deployment-options.md) for details.
4. **Integrations:** ITSM, monitoring, DevOps, and secrets management tools that receive alerts, raise tickets, or request certificates through the API.

A typical flow: the platform discovers a certificate, records its owner and expiry date, sends alerts as expiry nears, requests a renewal from the issuing CA according to policy, deploys the new certificate to the endpoint, and records every step in the audit log.

## Supported integrations

| Area | Examples |
|---|---|
| Certificate Authorities | Microsoft AD CS, DigiCert, Sectigo, Let's Encrypt, Google Public CA, AWS Certificate Manager (ACM), AWS Private CA |
| Endpoints | F5 BIG-IP, IIS, Apache, NGINX, Tomcat, Citrix NetScaler, SQL Server, Oracle Database, MongoDB |
| Cloud and secrets | Amazon Web Services (AWS), Microsoft Azure (including Azure Key Vault), Google Cloud Platform (GCP), HashiCorp Vault, Java KeyStore |
| DevOps and CI/CD | Ansible, Terraform, GitHub Actions, GitLab, Azure DevOps |
| ITSM | ServiceNow, Jira, Zendesk |
| Monitoring and SIEM | Splunk, Datadog, OpenTelemetry |

## Deployment options

- **SaaS:** EC hosts and operates the platform.
- **Cloud:** Deployed in the customer's own cloud account.
- **Hybrid:** Central platform in the cloud with components inside the private network.
- **On-premises:** Installed fully in the customer data center, including isolated networks.

A 15-day free trial is available from the EC website.

## Getting help

- Check the [CertSecure Manager FAQ](certsecure-manager-faq.md) and [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md).
- Open a case through the support portal. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [CertSecure Manager architecture and deployment options](certsecure-manager-architecture-and-deployment-options.md)
- [CertSecure Manager prerequisites checklist](certsecure-manager-prerequisites-checklist.md)
- [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md)
- [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md)
- [Certificate lifecycle management fundamentals](../../02-General/Certificate-Lifecycle-Management/certificate-lifecycle-management-fundamentals.md)
