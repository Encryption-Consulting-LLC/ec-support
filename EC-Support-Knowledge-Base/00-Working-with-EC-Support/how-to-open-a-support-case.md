---
title: "How to Open a Support Case"
category: "Working with EC Support"
section: "Support Cases"
article_type: "How-to"
applies_to: "All Encryption Consulting products and services"
summary: "Step-by-step guide to opening an EC support case on the portal or by phone, filling in mandatory fields, attaching logs, and tracking the case to closure."
keywords: ["open support case", "create a case", "EC support request", "view my requests", "support ticket"]
last_reviewed: "2026-10-06"
---

# How to Open a Support Case

This article explains how to open a support case with Encryption Consulting (EC), which fields are required, and how to follow the case after it is created. It is for named support contacts and administrators who need help with an EC product, managed service, or engagement.

## Overview

There are three ways to contact EC support:

| Channel | Use for | Notes |
|---|---|---|
| Support portal | All severities | Preferred. Creates a tracked case immediately. |
| Phone | Severity 1 and Severity 2 | A phone call is required for these severities, in addition to or instead of a portal case. |
| Email | Severity 3 and Severity 4 | Creates a case automatically {{TBD: confirm email-to-case is enabled}}. |

## Applies to

All EC products (CertSecure Manager, CodeSign Secure, CBOM Secure, SSH Secure, PKI-as-a-Service, HSM-as-a-Service) and EC services, such as PKI managed support.

## Prerequisites

- A portal account linked to the organization. See [Welcome to the EC support portal](welcome-to-the-ec-support-portal.md).
- Named support contact status for Severity 1 and Severity 2 cases.
- An active support plan. See [Support plans and coverage](support-plans-and-coverage.md).

## Before starting

- Search the knowledge base for the error message. Many common issues have a published fix.
- Decide the severity using [Support severity levels and response targets](support-severity-levels-and-response-targets.md).
- Gather the basics listed in [What to include in a support case](what-to-include-in-a-support-case.md).
- Remove secrets from any file before attaching it. Never send private keys, PINs, passphrases, smartcard or PIN Entry Device (PED) credentials.

## Procedure

### Phase 1: Open the case on the portal

1. Sign in to {{TBD: support portal URL}}.
2. Select **{{TBD: portal menu label for opening a request, for example "Open a support request"}}**.
3. Fill in the mandatory fields:

| Field | What to enter |
|---|---|
| Product or service | For example, CertSecure Manager or PKI managed support |
| Product version | The exact version or build number |
| Deployment type | SaaS, on-premises, or managed by EC |
| Environment | Production, staging, test, or lab |
| Severity | 1 Critical, 2 Major, 3 Minor, or 4 Low |
| Subject | A short, specific summary, for example "Renewal jobs fail for F5 endpoints after upgrade" |
| Description | What happened, when it started, what changed, and the business impact |
| Contact details | Best phone number and time zone for the case contact |

4. Add optional details:
   - Steps to reproduce.
   - Error messages copied as text, not only as screenshots.
   - Log files and diagnostics. See [Collecting diagnostic logs for EC products](collecting-diagnostic-logs-for-ec-products.md).
   - Additional people to copy on case updates.
5. Attach files. Files larger than {{TBD: maximum portal attachment size}} should go through [Secure file sharing with EC support](secure-file-sharing-with-ec-support.md).
6. Select **Submit**. The portal shows a case number, and a confirmation email follows.

### Phase 2: Call for Severity 1 and Severity 2

1. After submitting the portal case, call {{TBD: support phone number}}.
2. Give the case number, the organization name, and a short description of the impact.
3. Stay available on the phone number in the case. EC may start a bridge call or remote session.

> **Warning:** A Severity 1 or Severity 2 case opened only on the portal or by email may be treated as Severity 3 until a named contact calls. This matches common industry practice and makes sure urgent issues reach an engineer right away.

### Phase 3: Track the case

1. Open **{{TBD: portal menu label for viewing requests, for example "View my requests"}}**.
2. Select the case to see its status, history, and attachments.
3. Reply in the case to add information. Replies to case emails are added to the case automatically {{TBD: confirm email replies are added to the case}}.

Common case statuses:

| Status | Meaning |
|---|---|
| New | Received, not yet assigned |
| In progress | An engineer is working the case |
| Waiting on customer | EC needs information or a test result |
| Waiting on vendor | EC has raised the issue with a third-party vendor, such as an HSM or CA vendor |
| Solution proposed | A fix or workaround has been provided |
| Closed | Resolved and confirmed |

## Verification

- The case appears in the request list with the correct severity.
- The confirmation email shows the case number.
- For Severity 1 and 2, an engineer has made contact within the response target.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Cannot see the option to open a case | Account not linked to an active support plan | Email {{TBD: support email address}} with the organization name |
| Severity 1 is not available in the form | User is not a named support contact | Ask the account administrator to add the user, or call the support line |
| Attachment upload fails | File too large or blocked type | Compress the file or use secure file sharing |
| No confirmation email | Email filtered as spam | Allow {{TBD: support email domain}} in the mail filter |

## Related articles

- [What to include in a support case](what-to-include-in-a-support-case.md)
- [Support severity levels and response targets](support-severity-levels-and-response-targets.md)
- [Collecting diagnostic logs for EC products](collecting-diagnostic-logs-for-ec-products.md)
- [Collecting HSM and PKI diagnostics for support](collecting-hsm-and-pki-diagnostics-for-support.md)
- [Escalation process](escalation-process.md)
