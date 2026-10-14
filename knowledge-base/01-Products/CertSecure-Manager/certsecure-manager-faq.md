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

Microsoft Active Directory Certificate Services (AD CS), DigiCert, Sectigo, Let's Encrypt, Google Public CA, AWS Certificate Manager (ACM), and AWS Private CA.

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

By default, keys should be created on the endpoint and stay there. Some deployment methods need an exportable key (for example a PFX file for a system that cannot generate its own key). Policy decides which method is allowed.

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

### Does CertSecure renew certificates automatically?

Yes. Our Renewal Manager renews expiring certificates and installs the new ones on your servers. Turn on **automation mode** for a server, and CertSecure starts a renewal task whenever it finds a certificate nearing expiry. You can also renew on demand or on a schedule.

Once automation is on, routine renewals no longer depend on someone remembering a date.

### Can we choose how far ahead of expiry renewal happens?

Yes. Each renewal agent has a **Renewal Interval** setting that controls when renewal runs, and you can change it per agent. Expiry alerts are configured separately (see the next question), so your teams are notified well before a renewal is due.

You decide the timing for each environment, so production and test can follow different rules.

### Will we be alerted before certificates expire?

Yes. You choose the alert thresholds in days, for example a weekly reminder at 30, 15 and 7 days and a daily critical alert at 3 days and on the day of expiry. Alerts can go to everyone, to the certificate owner or to its watchers.

CertSecure sends alerts by email, Microsoft Teams or ServiceNow. Each discovery scan can also have its own expiry window, which defaults to 30 days. No certificate expires without warning.

### Which servers and devices can CertSecure renew and install certificates on?

- **Web and application servers:** IIS, Apache, Nginx, Tomcat and JBoss.
- **Databases:** Microsoft SQL Server, MongoDB and Oracle.
- **Load balancers:** F5 BIG-IP (SSL profiles) and Citrix NetScaler.
- **Java applications:** Java KeyStores, through our CLI tool.
- **Azure Key Vault:** certificates can be uploaded as PEM or PFX.

The Renewal Manager supports managed servers on Windows Server 2016+ and Ubuntu 22.04+. For anything else, our Ansible, Terraform and Red Hat Ansible Automation Platform integrations let you renew and deploy through the tools you already use. If a target isn't on the list, there is usually a way to automate it.

### Do you integrate with SIEM tools?

Yes. We integrate natively with **Splunk** through its HTTP Event Collector. CertSecure sends certificate lifecycle events (issuance, renewal, revocation and failures) to Splunk on a regular sync. Setup takes a URL, port and token, and you can test the connection before saving.

Support for more SIEM platforms is on our roadmap. In the meantime, your security team sees certificate events alongside everything else in Splunk.

### Which certificate authorities do you support?

- **Private CAs:** Microsoft AD CS, HashiCorp Vault PKI and AWS Private CA.
- **Public CAs:** DigiCert, Sectigo, GlobalSign, Entrust, Let's Encrypt, Google, AWS Certificate Manager and EJBCA.

Many of these connect without installing an agent. You can manage certificates from all of your CAs in one inventory.

### How does CertSecure discover certificates?

- **Network scans:** by IP range, subnet or URL, on standard, custom or all ports.
- **Certificate stores:** Windows (through an agent), Linux (over SSH), IIS Centralized Certificate Store and Java KeyStores.
- **Cloud:** agentless scans of Azure (App Service, Application Gateway, Front Door, API Management, Key Vault) and AWS (ACM, IAM).
- **Containers and vaults:** Docker, HashiCorp Vault and Azure Key Vault.
- **CA connectors and CSV import:** pull issued certificates from your CAs, or import results from other scanners.

Scans run on demand or on a schedule. Certificates discovered outside CertSecure appear in a separate view until you decide to onboard them. You get a full picture of your estate before you change anything.

### How can users request certificates?

Users can submit a CSR, have CertSecure generate the key and certificate, or upload a CSV for bulk requests. For automation, we support ACME (with External Account Binding), our REST API and a CLI tool.

Every route runs through the same policies and approvals, so self-service doesn't weaken control.

### Can we enforce certificate policies?

Yes. Policies and certificate templates let you set:

- key length, validity period, hash algorithm and key usage
- approval requirements, including a quorum of approvers per template
- manual approval for wildcard certificates
- DNS validation and one-time-use CSRs
- private key and PFX password rules

Your standards are applied at request time, not checked after the fact.

### Do you integrate with ServiceNow and Microsoft Teams?

Yes. CertSecure connects to ServiceNow and Microsoft Teams, along with SMTP email, to deliver alerts and scheduled reports. You configure each channel once under service setup.

Alerts reach the tools your teams already use.

### How does the AI Assistant work?

The AI Assistant answers questions about your certificate estate in plain English, such as what expires soon, where the risks are and how compliant you are. Every figure comes from your live CertSecure data. It works with Anthropic (Claude) and OpenAI models, using your organization's own API key.

You stay in control. Admins can switch the assistant on or off for the whole organization, decide who may use it and set how long conversations are kept. By default, only admins have access.

### How is CertSecure deployed?

CertSecure runs on your own infrastructure. You can deploy it on a single Windows Server 2022 machine, or split it across servers with a Linux backend (Ubuntu 22.04+) and a Windows frontend. It requires MongoDB 6+ and OpenSSL 3.

Your certificate data and keys stay inside your environment.

### Do you support SSO, MFA and role-based access?

Yes.

- **SSO:** through Keycloak, which connects to SAML and OIDC providers such as Okta and Microsoft Entra ID.
- **MFA:** users can enrol an authenticator app or a security key.
- **Roles:** Admin, PKI Admin, Department PKI Admin, User and Watcher come built in, and you can create custom roles with fine-grained permissions. Users can be synced from Active Directory.
- **Departments:** restrict which CAs, templates and tags each team can see and use.

Each team gets the access it needs and nothing more.

### What reports are available?

- Inventory, expiration, template and crypto algorithm reports
- An audit report, with personal data removed
- High-risk reports covering self-signed, wildcard, unknown and manually managed certificates, plus risk profiles and certificate issues

You can export reports to CSV (some to Excel), and you can schedule weekly or monthly inventory and PKI health reports by email. Exports run on the server, so they always include the full filtered result.

### Can we monitor the health of our PKI itself?

Yes. The PKI Posture dashboard tracks CA certificate expiry, CRL and delta CRL expiry, and AIA/CDP availability. You can set alerts at the root, intermediate and issuing CA levels.

Problems with your PKI surface before they affect the certificates that depend on it.

### Is there an API?

Yes. CertSecure has a REST API documented in Swagger. Admins issue API tokens (refreshable or one-time use) and can refresh, revoke or delete them at any time. Access to token management is controlled by its own permission.

You can automate CertSecure from your own pipelines without opening up admin access.

### Can we exclude certificates from monitoring?

Yes. **Ignore Certificate** stops a certificate from being monitored or alerted on without deleting it, and the **Exclusion List** excludes certificate templates per CA.

You stop the noise without losing any records.


## Related articles

- [CertSecure Manager overview](certsecure-manager-overview.md)
- [CertSecure Manager prerequisites checklist](certsecure-manager-prerequisites-checklist.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
- [Certificate lifecycle management fundamentals](../../02-General/Certificate-Lifecycle-Management/certificate-lifecycle-management-fundamentals.md)
