---
title: "CertSecure Manager Architecture and Deployment Options"
category: "Products"
section: "CertSecure Manager"
article_type: "Concept"
applies_to: "CertSecure Manager (SaaS, cloud, hybrid, and on-premises deployments)"
summary: "How CertSecure Manager is built, how its components talk to CAs and endpoints, and how to choose between SaaS, cloud, hybrid, and on-premises deployment."
keywords: ["CertSecure Manager architecture", "deployment options", "SaaS CLM", "on-premises CLM", "hybrid deployment"]
last_reviewed: "2026-10-06"
---

# CertSecure Manager Architecture and Deployment Options

This article describes the main building blocks of CertSecure Manager and the four ways to deploy it. It helps architects, PKI owners, and network teams plan where each component runs and which network paths are needed.

## What it is

CertSecure Manager is a certificate lifecycle management (CLM) platform. It has a central platform (console, policy engine, workflows, inventory, and reporting) and a set of connectors that reach Certificate Authorities (CAs), endpoints, and third-party tools. The same functions are available in every deployment model. What changes is who runs the platform and where each component sits.

## Why it matters

Certificate management touches many systems: domain controllers, CAs, load balancers, web servers, cloud accounts, and ticketing tools. Choosing the right deployment model early avoids rework later. It decides:

- Which firewall rules are needed.
- Where data about the certificate inventory is stored.
- Who patches and upgrades the platform.
- How the platform reaches CAs and endpoints in isolated network zones.

## How it works

The general flow between components is:

1. **Administrators and requesters** sign in to the web console over HTTPS, or call the REST API from scripts and pipelines.
2. **The central platform** stores the inventory, applies policy, runs approval workflows, and schedules discovery, renewal, and alert jobs.
3. **CA connectors** send certificate requests to the issuing CA and collect the issued certificates.
   - For Microsoft Active Directory Certificate Services (AD CS), requests use the Microsoft certificate request interface, which runs over Distributed Component Object Model (DCOM) and Remote Procedure Call (RPC).
   - For public and cloud CAs, requests use each CA's REST API or the Automated Certificate Management Environment (ACME) protocol over HTTPS.
4. **Discovery** connects to IP ranges and ports to read the certificates presented by servers, and imports issued certificate records from CAs and cloud accounts.
5. **Endpoint automation** connects to targets such as F5 BIG-IP (iControl REST API), Windows servers running Internet Information Services (IIS), and Linux servers running Apache or NGINX, then installs renewed certificates and updates bindings.
6. **Integrations** send alerts and tickets to IT Service Management (ITSM) tools such as ServiceNow, and send events to monitoring tools such as Splunk and Datadog.
7. **The audit log** records each action with the user or service identity that performed it.

In networks that the central platform cannot reach directly (for example, a SaaS platform and an internal AD CS CA), a component installed inside the private network performs the CA and endpoint work and talks to the central platform over outbound HTTPS.

## Deployment options

| Option | Who runs the platform | Typical fit | Points to plan |
|---|---|---|---|
| SaaS | EC hosts and operates it | Fast start, limited internal infrastructure staff | Outbound connectivity from internal components, data residency region (provided by EC during onboarding) |
| Cloud | Deployed in the customer's own cloud account | Organizations that require platform control but prefer cloud hosting | Cloud network design, database backups, upgrade schedule |
| Hybrid | Central platform in the cloud, components on-premises | Mixed estates with internal CAs and cloud workloads | Firewall rules between zones, component high availability |
| On-premises | Customer data center | Regulated or isolated (air-gapped) environments | Server sizing, database, high availability and disaster recovery, patching |

High availability (HA) and disaster recovery (DR) configurations are supported.

## Network paths to plan

| From | To | Purpose | Protocol and port |
|---|---|---|---|
| Users and API clients | Central platform | Console and REST API | HTTPS, port 443 (default) |
| Platform or on-premises component | AD CS issuing CA | Certificate requests | RPC endpoint mapper TCP 135, plus the dynamic RPC range (TCP 49152 to 65535 by default on Windows Server 2008 and later) unless the CA has a fixed port |
| Platform or on-premises component | Public or cloud CA | Requests and renewals | HTTPS TCP 443 |
| Discovery component | Scanned hosts | Read presented certificates | The TLS ports in scope (for example TCP 443, 8443, 636) |
| Automation component | F5 BIG-IP | Deploy certificates | HTTPS to the management interface |
| Automation component | Windows servers | Deploy certificates | Windows Remote Management (WinRM) TCP 5985 or 5986 |
| Automation component | Linux servers | Deploy certificates | Secure Shell (SSH) TCP 22 |
| Platform | ITSM and monitoring tools | Tickets and events | HTTPS TCP 443 |

## Key terms

| Term | Meaning |
|---|---|
| CLM | Certificate lifecycle management: discovery, issuance, renewal, and revocation of certificates |
| CA connector | Configuration that lets the platform request and import certificates from a specific CA |
| Endpoint | A system that uses a certificate, such as a load balancer or web server |
| Discovery job | A scheduled or on-demand scan that finds certificates |
| RBAC | Role-based access control: permissions assigned by role |
| HA and DR | High availability and disaster recovery |

## Common questions

**Does the SaaS option require inbound firewall rules?** The usual design uses an internal component that makes outbound HTTPS connections to the SaaS platform.

**Can the deployment model change later?** Moving between models is a planned migration. Contact EC support or the account team to scope it.

**Where are private keys stored?** Keys are generated on the endpoint, in a key vault, or as set by policy. Check the policy and endpoint configuration for each certificate type.

## Related articles

- [CertSecure Manager overview](certsecure-manager-overview.md)
- [CertSecure Manager prerequisites checklist](certsecure-manager-prerequisites-checklist.md)
- [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md)
- [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
