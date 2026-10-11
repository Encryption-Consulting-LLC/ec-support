---
title: "Configuring Expiry Alerts and Notifications"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager (all deployment models)"
summary: "How to configure certificate expiry alerts in CertSecure Manager: alert schedules, recipients, email, ITSM tickets, and monitoring tools such as Splunk."
keywords: ["certificate expiry alerts", "expiration notifications", "CertSecure Manager alerts", "Splunk", "Datadog"]
last_reviewed: "2026-10-06"
---

# Configuring Expiry Alerts and Notifications

This article explains how to set up expiry alerts and other notifications in CertSecure Manager so the right people know about a certificate before it causes an outage. It is for CertSecure Manager administrators and service owners who receive the alerts.

## Overview

Alerts in CertSecure Manager answer three questions: **what** triggers a notice, **who** receives it, and **how** it is delivered. Common triggers are:

- A certificate is close to expiry.
- An automated renewal or deployment fails.
- Discovery finds a new, unknown, or non-compliant certificate (for example, a weak key or a self-signed certificate).
- A request is waiting for approval.

Delivery channels include email, IT Service Management (ITSM) tickets (ServiceNow, Jira, Zendesk), and monitoring or Security Information and Event Management (SIEM) tools such as Splunk, Datadog, and OpenTelemetry.

## Prerequisites

- An SMTP relay that accepts mail from the CertSecure Manager platform, plus a sender address.
- Certificates in the inventory with owners assigned. Alerts without owners go nowhere useful.
- For tickets: the ITSM integration set up. See [ServiceNow and ITSM integration](servicenow-and-itsm-integration.md).
- For monitoring: the Splunk HTTP Event Collector (HEC) token, Datadog API key, or OpenTelemetry collector endpoint.

## Before starting

- **Avoid alert fatigue.** Too many emails train people to ignore them. Use fewer, well-targeted alerts.
- **Use group mailboxes.** Send alerts to team distribution lists, not only to individuals who may leave.
- **Short validity:** As public TLS certificates move to 200, 100, and then 47 days, fixed "30 days before" alerts become less useful. Base thresholds on a share of the lifetime.

## Procedure

### Phase 1: Configure the mail server

1. Go to the **SMTP Settings** page.
2. Enter the SMTP host, port, encryption setting (STARTTLS or implicit TLS), and credentials if required.
3. Send a test message.

### Phase 2: Define alert thresholds

Suggested starting points:

| Certificate type | First alert | Second alert | Final alert |
|---|---|---|---|
| Manually renewed, 1 year or longer | 60 days | 30 days | 7 days |
| Automated renewal enabled | Only on renewal failure | Renewal failure plus 7 days to expiry | 2 days to expiry |
| Short-lived (100 days or less) | 33 percent of lifetime left | 15 percent left | 3 days left |

1. Go to the **Alert Rules** page.
2. Create a rule for each certificate group (by tag, team, issuer, or environment).
3. Set the thresholds and the repeat interval.

### Phase 3: Set recipients

1. Send alerts to the certificate owner and the owning team mailbox.
2. Add an escalation recipient (for example, the team lead) for the final alert.
3. Send renewal failure alerts to the PKI or platform team as well.

### Phase 4: Connect tickets and monitoring

1. Map alert types to ITSM ticket types and priorities. For example, "expires in 7 days and no automation" creates a high-priority incident.
2. Send events to Splunk, Datadog, or OpenTelemetry so they appear on existing dashboards and on-call rotations.

### Phase 5: Set up reports

1. Schedule a weekly expiry report for each team.
2. Schedule a monthly compliance report for security leadership (weak keys, unknown issuers, certificates without owners).

## Verification

- Create a test certificate with a short lifetime, or temporarily lower a threshold on a test rule, and confirm each channel receives the alert.
- Confirm the ticket is created in the ITSM tool with the correct assignment group.
- Search for the event in the monitoring tool.
- Restore the normal threshold after the test.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| No emails received | SMTP relay rejects the platform's IP or sender | Allow the platform on the relay and check the relay logs |
| Emails go to spam | Sender domain lacks SPF or DKIM alignment | Use an approved internal sender and relay |
| Alerts go to a former employee | Owner field outdated | Use team mailboxes and review owners each quarter |
| Duplicate tickets | Several alert rules match the same certificate | Narrow rule scope or enable de-duplication |
| Events missing in Splunk | Wrong HEC token or index, or port blocked | Check token, index, and network path to HEC |
| Alert arrives after the certificate already renewed | Alert rule ignores automation status | Alert only on failure for automated certificates |

## Related articles

- [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md)
- [ServiceNow and ITSM integration](servicenow-and-itsm-integration.md)
- [Preparing for 47-day certificates with CertSecure Manager](preparing-for-47-day-certificates-with-certsecure-manager.md)
- [CertSecure Manager FAQ](certsecure-manager-faq.md)
- [Preventing certificate outages](../../02-General/Certificate-Lifecycle-Management/preventing-certificate-outages.md)
