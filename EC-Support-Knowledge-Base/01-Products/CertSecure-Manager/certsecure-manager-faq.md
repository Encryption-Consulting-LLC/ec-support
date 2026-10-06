---
title: "CertSecure Manager FAQ"
category: "Products"
section: "CertSecure Manager"
article_type: "FAQ"
applies_to: "CertSecure Manager (all deployment models)"
summary: "Answers to common CertSecure Manager questions: supported CAs and endpoints, deployment, AD CS permissions, ACME, private keys, short-lived certificates."
keywords: ["CertSecure Manager FAQ", "certificate management questions", "supported CAs", "AD CS permissions", "CLM"]
last_reviewed: "2026-10-06"
---

# CertSecure Manager FAQ

This article answers the questions EC support hears most often about CertSecure Manager. It is for new administrators, project teams, and security reviewers. Each answer links to a detailed article where one exists.

### What is CertSecure Manager?

CertSecure Manager is the Encryption Consulting (EC) certificate lifecycle management (CLM) platform. It discovers certificates, keeps a central inventory, sends expiry alerts, automates renewal and deployment, and enforces certificate policy. See [CertSecure Manager overview](certsecure-manager-overview.md).

### Which Certificate Authorities (CAs) does it support?

Microsoft Active Directory Certificate Services (AD CS), DigiCert, Sectigo, Let's Encrypt, Google Public CA, AWS Certificate Manager (ACM), and AWS Private CA. Version details: {{TBD: CertSecure Manager compatibility matrix}}.

### Which endpoints can it deploy certificates to?

F5 BIG-IP, Microsoft Internet Information Services (IIS), Apache, NGINX, Tomcat, Citrix NetScaler, SQL Server, Oracle Database, and MongoDB, plus cloud services in AWS, Azure, and Google Cloud. Other systems can use the REST API or an Automated Certificate Management Environment (ACME) client.

### Is it available as SaaS?

Yes. CertSecure Manager runs as SaaS, in the customer's own cloud, as a hybrid, or fully on-premises. See [architecture and deployment options](certsecure-manager-architecture-and-deployment-options.md).

### What permissions does the service account need on AD CS?

**Read** and **Enroll** on each template it uses, and **Request Certificates** on the CA (granted to Authenticated Users by default). It needs **Issue and Manage Certificates** only to approve pending requests, revoke, or read the CA database. It must also be able to use DCOM on the CA through the **Certificate Service DCOM Access** group. See [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md).

### Which ports must be open to an AD CS CA?

TCP 135 for the RPC endpoint mapper, plus the dynamic RPC range (TCP 49152 to 65535 by default on current Windows Server) or a fixed port if the CA is set to use one.

### Does CertSecure Manager support ACME?

Yes. It supports ACME (RFC 8555), as well as SCEP, EST, and a REST API. Standard ACME clients such as certbot, acme.sh, win-acme, and cert-manager can enroll through it. See [ACME enrollment with CertSecure Manager](acme-enrollment-with-certsecure-manager.md).

### Where are private keys created and stored?

By default, keys should be created on the endpoint and stay there. Some deployment methods need an exportable key (for example a PFX file for a system that cannot generate its own key). Policy decides which method is allowed. Key storage details for the platform: {{TBD: CertSecure Manager key storage and encryption at rest details}}.

### How does it help with 47-day certificates?

It automates discovery, domain validation, renewal, and deployment, so short lifetimes do not add manual work. See [Preparing for 47-day certificates with CertSecure Manager](preparing-for-47-day-certificates-with-certsecure-manager.md).

### Can it raise ServiceNow tickets?

Yes. It can create incidents for expiring certificates and failed renewals, and it can issue certificates from approved ServiceNow requests. Jira and Zendesk are also supported. See [ServiceNow and ITSM integration](servicenow-and-itsm-integration.md).

### Does discovery find certificates that are not on the network?

Network scans only find certificates served on network ports. CA imports and cloud connectors find the rest, such as client and email certificates. See [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md).

### Can access be limited by team?

Yes. Role-based access control (RBAC) scopes what each user and team can see and do. Approval workflows, including M of N approvals, control who can request from which CA.

### Is there a trial?

A 15-day free trial is available from the EC website.

### How does an administrator get help?

Check [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md) first. Then open a case in the support portal. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [CertSecure Manager overview](certsecure-manager-overview.md)
- [CertSecure Manager prerequisites checklist](certsecure-manager-prerequisites-checklist.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
- [Certificate lifecycle management fundamentals](../../02-General/Certificate-Lifecycle-Management/certificate-lifecycle-management-fundamentals.md)
