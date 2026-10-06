---
title: "ServiceNow and ITSM Integration"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager; ServiceNow, Jira, Zendesk"
summary: "How to integrate CertSecure Manager with ServiceNow, Jira, or Zendesk to raise tickets for expiring certificates and to issue certificates from ITSM requests."
keywords: ["ServiceNow certificate integration", "ITSM", "Jira", "Zendesk", "certificate request ticket", "CertSecure Manager"]
last_reviewed: "2026-10-06"
---

# ServiceNow and ITSM Integration

This article explains how to connect CertSecure Manager to an IT Service Management (ITSM) tool such as ServiceNow, Jira, or Zendesk. It covers the two common use cases, the accounts needed, and how to test the link. It is for CertSecure Manager administrators and ITSM platform owners.

## Overview

CertSecure Manager supports two main ITSM patterns:

1. **Outbound tickets:** The platform creates incidents or tasks in the ITSM tool when a certificate is close to expiry, when a renewal fails, or when discovery finds a non-compliant certificate. The ticket is routed to the owning team's assignment group.
2. **Ticket-based issuance:** A user requests a certificate through the ITSM tool (for example, a ServiceNow catalog item). The request is approved in the ITSM workflow and then passed to CertSecure Manager, which issues the certificate under policy and updates the ticket.

ServiceNow integrations commonly use the ServiceNow REST API, such as the Table API (`/api/now/table/<table_name>`), over HTTPS.

## Prerequisites

- An ITSM instance URL reachable from the CertSecure Manager platform over HTTPS (TCP 443).
- A dedicated integration account in the ITSM tool. For ServiceNow, a user marked as a web service access only account, with roles that allow create and update on the target tables (for example, `incident`). Confirm the exact roles against ServiceNow documentation and internal policy.
- If ServiceNow must call CertSecure Manager (ticket-based issuance) and CertSecure Manager is on-premises, a network path from ServiceNow. Many organizations use a ServiceNow MID Server inside the network for this.
- The assignment groups that should receive certificate tickets.
- For Jira: a project, issue type, and an API token for the integration user. For Zendesk: an API token and the target group.

## Before starting

- Agree the ticket priority mapping with the service desk.
- Plan a test ITSM instance (for example, a ServiceNow sub-production instance) before production.
- Store integration credentials only in CertSecure Manager. Rotate them on the normal schedule.

## Procedure

### Phase 1: Prepare the ITSM side (ServiceNow example)

1. Create the integration user, for example `svc_certsecure`.
2. Select **Web service access only** so the account cannot sign in to the user interface.
3. Grant the roles needed to create and update records on the target tables.
4. Note the assignment group names or sys_ids for routing.
5. For ticket-based issuance, build or import the catalog item and approval flow: {{TBD: CertSecure Manager ServiceNow app or catalog item package name}}.

### Phase 2: Configure CertSecure Manager

1. Go to {{TBD: CertSecure Manager menu path for ITSM integrations}}.
2. Select ServiceNow, Jira, or Zendesk.
3. Enter the instance URL and the integration credentials.
4. Map fields:

| CertSecure Manager value | ServiceNow field (example) |
|---|---|
| Certificate common name and SANs | Short description |
| Expiry date, issuer, serial, endpoints | Description |
| Owner team | Assignment group |
| Alert level | Priority (from impact and urgency) |
| Application | Configuration item, if the CMDB is used |

5. Select which alert types create tickets.
6. Save and send a test ticket.

### Phase 3: Configure ticket updates

1. Choose whether CertSecure Manager updates or closes the ticket when the certificate is renewed.
2. Choose whether a ticket comment is added on each renewal attempt.

### Phase 4: Test the end-to-end flow

1. Create a test certificate that triggers an alert, or use the test option.
2. Confirm the ticket appears in the right queue with the right priority.
3. Renew the certificate and confirm the ticket updates or closes.
4. For ticket-based issuance, submit a catalog request, approve it, and confirm the certificate is issued and attached or referenced in the ticket.

## Verification

Test the ServiceNow API from the platform's network with the integration account:

```bash
curl -s -u '<integration-user>:<password>' -H "Accept: application/json" \
  "https://<instance>.service-now.com/api/now/table/incident?sysparm_limit=1"
```

A JSON response with a `result` element confirms access. An HTTP 401 means wrong credentials. An HTTP 403 means missing roles or access control rules.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| HTTP 401 from ServiceNow | Wrong password, or password expired | Reset and update in CertSecure Manager |
| HTTP 403 from ServiceNow | Missing role or access control list (ACL) rule on the table | Add the role or ACL for the integration user |
| Tickets created without assignment group | Group name mismatch | Use the exact group name or sys_id |
| Duplicate tickets for one certificate | Several alert rules match, or ticket key not stored | Narrow rules and enable ticket correlation |
| Catalog requests never reach CertSecure Manager | MID Server or firewall path missing | Check MID Server status and outbound rules |
| Jira "field cannot be set" error | Field not on the create screen | Add the field to the issue type screen |

## Related articles

- [Configuring expiry alerts and notifications](configuring-expiry-alerts-and-notifications.md)
- [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md)
- [CertSecure Manager overview](certsecure-manager-overview.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
- [CertSecure Manager FAQ](certsecure-manager-faq.md)
