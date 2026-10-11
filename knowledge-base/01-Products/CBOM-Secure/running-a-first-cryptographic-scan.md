---
title: "Running a First Cryptographic Scan"
category: "Products"
section: "CBOM Secure"
article_type: "How-to"
applies_to: "CBOM Secure (SaaS, cloud, on-premises, and hybrid deployments) with scanning agents"
summary: "Step-by-step guide to planning and running a first CBOM Secure cryptographic discovery scan, from agent install and read-only credentials to checking results."
keywords: ["first CBOM scan", "cryptographic discovery scan", "CBOM Secure agent", "crypto inventory setup", "scan configuration"]
last_reviewed: "2026-10-06"
---

# Running a First Cryptographic Scan

This article walks through a first discovery scan in CBOM Secure. It covers scope planning, agent installation, read-only credentials, running the scan, and checking the results. It is for administrators setting up CBOM Secure for the first time.

## Overview

A good first scan is small and representative. Pick a few sources that matter, such as one main code repository, one HSM partition, one cloud account, and the Certificate Authority (CA). Confirm that the results look correct, then expand scope in phases.

## Applies to

CBOM Secure in all deployment models. For SaaS, EC operates the server, and the customer installs scanning agents inside its own network.

## Prerequisites

- Access to the CBOM Secure console with a role that can manage sources and scans.
- A host for the scanning agent:
  - A supported operating system, as listed in the CBOM Secure installation guide for your version.
  - CPU, memory, and disk sized per the installation guide.
  - Outbound network access from agent to server on the port listed in the installation guide.
- Network reach from the agent to each source (for example HSM, database, Git server).
- Read-only credentials for each source. See [CBOM Secure supported scan sources](cbom-secure-supported-scan-sources.md).
- Approval from the owners of each system to be scanned.

## Before starting

- **Inform owners.** Tell system owners and the Security Operations Center (SOC) when scans run. Network and login activity may raise alerts.
- **Protect credentials.** Store scan credentials in the product credential store or an approved vault, not in plain text.
- **Pick quiet hours** for production HSMs and databases on the first run.
- **Agree on success criteria,** for example "all certificates in the CA database appear in the inventory".

## Procedure

### Phase 1: Plan the scope

1. List candidate sources and their owners.
2. Choose 3 to 5 sources for the first scan. A useful mix is:
   - One business-critical code repository.
   - One keystore folder on an application server.
   - One HSM partition or key manager.
   - One cloud key service account (for example AWS KMS or Azure Key Vault).
   - The AD CS issuing CA.
3. Record expected results (for example "about 40 keys in the HSM partition") to compare later.

### Phase 2: Install the scanning agent

1. Download the agent package from the **Agents** page in the console.
2. Install the agent on the chosen host, following the instructions provided with the agent package.
3. Register the agent with the server using the registration token or certificate shown in the console.
4. Confirm the agent shows as online in the console.

Check that the agent host can reach the server and sources:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://<cbom-secure-host>:<port>/
nc -zv <source-host> <source-port>
```

```powershell
Test-NetConnection <source-host> -Port <source-port>
```

### Phase 3: Add sources

For each source, open the **Sources** page in the console and enter:

1. Source type (for example GitHub, Thales Luna, AWS KMS).
2. Connection details (URL, host, slot, region, or path).
3. The read-only credential.
4. The agent that should run the scan.
5. Use the connection test, if available, before saving.

### Phase 4: Configure and start the scan

1. Open the **Scan Jobs** page, create a scan job, and select the sources.
2. Choose the scan options, for example code branches to include, file path filters, and depth of binary analysis. Available options depend on the source type.
3. Run the scan once manually.
4. Watch progress and errors in the scan status view.

### Phase 5: Review the results

1. Open the inventory and filter by the sources scanned.
2. Compare counts with the expected results from Phase 1.
3. Review the highest risk findings first.
4. Check a few findings by hand, for example open one certificate and confirm its algorithm and expiry.
5. Export a first CBOM to share with stakeholders. See [Exporting CBOM in CycloneDX format](exporting-cbom-in-cyclonedx-format.md).

### Phase 6: Expand and schedule

1. Add more sources in groups, by business unit or platform.
2. Set a scan schedule, for example weekly for endpoints and monthly for HSMs.
3. Connect code scanning to the release process so each release is scanned.

## Verification

- Agent status is online and the last scan completed without errors.
- Asset counts match the expected results within a reasonable range.
- Spot checks of individual assets are correct.
- The risk dashboard and PQC readiness views show data.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Agent stays offline | Firewall or proxy blocking agent to server traffic | Open the agent port. Configure the agent proxy setting as described in the installation guide. |
| Source connection test fails | Wrong host, port, or credential | Check network reach and credentials. Check account lockout. |
| Code scan finds nothing | Wrong branch or path filter, or unsupported language | Check filters. Confirm the language is supported. |
| HSM scan shows fewer keys than expected | Credential role cannot see all objects, or wrong slot | Use a role that can list all objects. Confirm the slot. |
| Cloud scan returns access denied | Missing list or describe permissions | Add read permissions to the IAM role. |
| Scan very slow | Large repository or many binaries | Narrow the scope. Add agents. Scan in parallel. |

## Related articles

- [CBOM Secure supported scan sources](cbom-secure-supported-scan-sources.md)
- [Reading a CBOM report](reading-a-cbom-report.md)
- [How CBOM Secure works](how-cbom-secure-works.md)
- [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md)
- [CBOM Secure FAQ](cbom-secure-faq.md)
