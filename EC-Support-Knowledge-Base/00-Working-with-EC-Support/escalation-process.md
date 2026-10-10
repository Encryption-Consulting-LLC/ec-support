---
title: "Escalation Process"
category: "Working with EC Support"
section: "Support Policies"
article_type: "Reference"
applies_to: "All Encryption Consulting products and services"
summary: "When and how to escalate an EC support case, the escalation levels from support engineer to management, and what information speeds up an escalated case."
keywords: ["support escalation", "escalate a case", "EC escalation path", "critical incident", "duty manager"]
last_reviewed: "2026-10-06"
---

# Escalation Process

Escalation brings more attention and resources to a support case when progress or impact calls for it. This article explains when to escalate an Encryption Consulting (EC) case, how to do it, and what happens next. It is for named support contacts and IT managers.

## Escalation is not the same as severity

- **Severity** describes the technical and business impact. See [Support severity levels and response targets](support-severity-levels-and-response-targets.md).
- **Escalation** asks EC management to review a case because of impact, risk, or progress. A Severity 3 case can be escalated, for example, if a deadline is near.

If the business impact has grown, first ask for a higher severity. If the severity is right but the case still needs attention, escalate.

## When to escalate

Escalate when one or more of these is true:

- A response target was missed.
- The case is not moving, for example no update within the agreed frequency.
- The business impact has grown, such as a CA or HSM outage spreading to more services.
- A fixed deadline is at risk, such as certificate expiry, an audit, or a release date.
- The proposed fix is not acceptable and a different approach is needed.
- There is concern about how the case is being handled.

## How to escalate

1. **Reply in the case** with the word "Escalation" in the first line. State the reason, the business impact, and any deadline.
2. **Call** +1-469-815-4136 and ask for the duty manager. Give the case number.
3. If there is no response within 2 hours for Severity 1 or 2, or 1 business day for Severity 3 or 4, contact the next level in the table below.

| Level | Role | Contact |
|---|---|---|
| 1 | Assigned support engineer | Case reply |
| 2 | Support team lead or duty manager | Request through the case or support line |
| 3 | Support manager | Request through the case or support line |
| 4 | Director of support or customer success | Request through the case or support line |
| Account | Account manager or technical account manager (TAM) | info@encryptionconsulting.com |

> **Note:** Customers on plans with a TAM can also escalate through the TAM. See [Support plans and coverage](support-plans-and-coverage.md).

## What happens after escalation

1. EC acknowledges the escalation within 1 business hour.
2. A manager reviews the case history, severity, and resources.
3. The manager agrees an action plan with the customer contact, including next steps, owners, and update times.
4. For critical incidents, EC may set up a bridge call and add senior engineers or specialists, such as HSM or PKI architects.
5. If a third-party vendor is involved, EC escalates with that vendor in parallel.
6. When the case is stable, the escalation is closed, and the case returns to normal handling.

## Information that speeds up an escalation

- Case number.
- Clear statement of the business impact and who is affected.
- Hard deadlines with dates and times.
- What the customer has already tried and the results.
- The best contact for the next 24 hours, with phone number and time zone.
- Any change freeze or approval steps that could slow a fix.

## Critical incidents

For a Severity 1 incident, such as an expired CRL, an offline HSM holding a CA key, or a suspected key compromise:

- Call the support line right away. Do not wait for an email reply.
- Keep a technical contact on the line or bridge.
- Prepare remote access as allowed by policy.
- After the incident, EC can provide a root cause summary within 5 business days.

> **Warning:** In a suspected key compromise, do not send any key material, PINs, or passphrases to EC. Isolate the affected systems and follow the organization's incident response plan.

## Feedback and complaints

General feedback about EC support can be sent to info@encryptionconsulting.com. Feedback does not change the case severity, so use the escalation steps above for active issues.

## Related articles

- [Support severity levels and response targets](support-severity-levels-and-response-targets.md)
- [Support plans and coverage](support-plans-and-coverage.md)
- [How to open a support case](how-to-open-a-support-case.md)
- [Emergency CRL signing](../04-Featured-Articles/PKI-Runbooks/emergency-crl-signing.md)
- [Preventing certificate outages](../02-General/Certificate-Lifecycle-Management/preventing-certificate-outages.md)
