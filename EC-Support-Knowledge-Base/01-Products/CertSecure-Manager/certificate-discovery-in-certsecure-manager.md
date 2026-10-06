---
title: "Certificate Discovery in CertSecure Manager"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager (all deployment models)"
summary: "How to plan and run certificate discovery in CertSecure Manager using network scans, CA imports, and cloud sources, then review and assign owners to results."
keywords: ["certificate discovery", "certificate inventory", "network scan", "rogue certificates", "CertSecure Manager"]
last_reviewed: "2026-10-06"
---

# Certificate Discovery in CertSecure Manager

This article explains how to find certificates across an environment with CertSecure Manager and turn the results into a clean, owned inventory. It is for administrators running the first discovery and for teams that maintain discovery jobs over time.

## Overview

Most certificate outages come from certificates nobody knew about. Discovery closes that gap. CertSecure Manager builds its inventory from three kinds of sources:

| Source | What it finds | Notes |
|---|---|---|
| Network scan | Certificates presented by servers on TLS ports | Finds certificates from any issuer, including self-signed and unknown CAs |
| CA import | Certificates issued by connected CAs (Microsoft AD CS, public CAs, AWS Private CA) | Finds certificates that are not reachable on the network, such as client and S/MIME certificates |
| Cloud and platform sources | Certificates in cloud services and key stores such as AWS, Azure Key Vault, and Google Cloud | Needs read access to the cloud account |

Discovery runs continuously on a schedule, so new and rogue certificates are flagged soon after they appear.

## Prerequisites

- Network paths from the discovery component to the target ranges on the ports in scope.
- CA connectors already set up for CA imports. See [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md) and [Connecting CertSecure Manager to public CAs](connecting-certsecure-manager-to-public-cas.md).
- Read-only credentials for cloud accounts.
- Written approval from the network and security teams to scan the ranges. Scans can trigger intrusion detection alerts.

## Before starting

- **Notify the Security Operations Center (SOC).** Share the scanner source IP addresses and the scan schedule so alerts are expected.
- **Start small.** Begin with one subnet to measure duration and load.
- **Avoid fragile devices.** Exclude older industrial control or medical devices unless their owners approve.
- **Schedule.** Run large scans outside business peaks.

## Procedure

### Phase 1: Define scope

1. List the IP ranges or Classless Inter-Domain Routing (CIDR) blocks, and any hostnames, to scan.
2. List the ports. Common TLS ports include 443 (HTTPS), 8443 (alternate HTTPS), 636 (LDAPS), 993 (IMAPS), 995 (POP3S), 465 and 587 (SMTP with TLS), 3389 (RDP), and 5986 (WinRM over HTTPS). Add application-specific ports.
3. Note any ranges to exclude.

### Phase 2: Create a network discovery job

1. Go to {{TBD: CertSecure Manager menu path for discovery jobs}}.
2. Create a job and enter the ranges, ports, and exclusions.
3. Select the discovery component that has network access to those ranges.
4. Set the schedule (for example, daily for production web ranges, weekly for wider ranges).
5. Set concurrency and timeout values. Defaults: {{TBD: default scan concurrency and timeout}}. Lower concurrency on slow links or across firewalls.
6. Save and run the job once on demand.

> **Note:** A server that hosts several sites with Server Name Indication (SNI) returns a certificate based on the hostname sent by the client. Scanning by IP address may only show the default certificate. Add hostnames to the scope to find SNI certificates.

### Phase 3: Import from CAs and cloud sources

1. Enable inventory sync on each CA connector.
2. Add cloud accounts and key stores with read-only credentials.
3. Run the first sync.

### Phase 4: Review and clean the results

1. Open the inventory and filter by **expiring within 30 days** first. Act on these immediately.
2. Filter by issuer to find self-signed certificates and certificates from unknown CAs.
3. Flag weak keys and algorithms, for example RSA keys under 2048 bits or SHA-1 signatures.
4. Assign an owner and an application to every certificate. Use tags or groups for business units.
5. Mark certificates that are out of scope (for example, vendor appliances managed by a third party) so they do not raise noise.
6. Remove duplicates where the same certificate was found by several sources. The platform matches certificates by thumbprint or serial number and issuer: {{TBD: CertSecure Manager de-duplication behavior}}.

### Phase 5: Move to automation

1. Pick the highest risk certificates (public facing, short validity, many endpoints).
2. Connect their endpoints and enable automated renewal. See [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md).

## Verification

- Compare the inventory count against a known sample, such as a list of public websites.
- Check a known certificate manually and confirm the inventory matches:

```bash
openssl s_client -connect <host>:443 -servername <host> </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -enddate -fingerprint -sha256
```

- Confirm the job history shows success and no unexpected timeouts.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Discovery scan times out or runs for hours | Range too large, high latency, or firewall silently dropping packets | Split the range, lower concurrency, raise the timeout, and confirm firewall rules |
| Host is up but no certificate found | Port not in scope, or service needs SNI | Add the port and the hostname to the scope |
| Only the default certificate is found on a shared server | Scan by IP without SNI | Scan by hostname |
| Scans blocked after starting | Intrusion prevention system flagged the scanner | Add the scanner IP to the allow list with the SOC |
| CA import shows zero certificates | Connector lacks read rights on the CA database | For AD CS, reading the full CA database needs **Issue and Manage Certificates**. Grant only if import is required. |
| Cloud source fails | Missing read permission or wrong region | Check the cloud role and enabled regions |
| Many duplicates | Same certificate found by scan and by CA import | Review de-duplication settings and merge records |

## Related articles

- [CertSecure Manager overview](certsecure-manager-overview.md)
- [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md)
- [Configuring expiry alerts and notifications](configuring-expiry-alerts-and-notifications.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
- [Preventing certificate outages](../../02-General/Certificate-Lifecycle-Management/preventing-certificate-outages.md)
