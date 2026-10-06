---
title: "Support Severity Levels and Response Targets"
category: "Working with EC Support"
section: "Support Policies"
article_type: "Reference"
applies_to: "All Encryption Consulting products and services"
summary: "Definitions of EC support Severity 1 Critical to Severity 4 Low, with PKI, HSM, and certificate examples, and initial response targets for each support plan."
keywords: ["support severity levels", "Severity 1 critical", "response time", "SLA", "EC support priority"]
last_reviewed: "2026-10-06"
---

# Support Severity Levels and Response Targets

Every Encryption Consulting (EC) support case has a severity level. The severity sets how fast EC responds and how the case is worked. This article defines each level, gives examples, and lists the response targets by support plan.

## How severity is set

The case contact proposes a severity when opening the case. EC reviews it during triage and may change it, after discussing with the contact, so it matches the real business impact. Severity can go up or down as the situation changes.

## Severity definitions

| Severity | Name | Definition |
|---|---|---|
| 1 | Critical | Production is down or a security incident is in progress. No workaround exists. |
| 2 | Major | Production is seriously degraded, or an outage is likely soon. A workaround may exist but is not sustainable. |
| 3 | Minor | A function is impaired but production keeps running. A reasonable workaround exists. |
| 4 | Low | General questions, how-to requests, documentation issues, and feature requests. |

### Examples by severity

**Severity 1 Critical**
- The Certificate Revocation List (CRL) on an issuing CA has expired and clients fail certificate validation.
- The Hardware Security Module (HSM) holding a CA or code signing key is offline and no HA member is available.
- PKI-as-a-Service or HSM-as-a-Service is unavailable for all users.
- Suspected compromise of a CA private key or signing key.

**Severity 2 Major**
- Automated certificate renewals in CertSecure Manager are failing and certificates expire within 7 days.
- One member of an HSM high availability (HA) group is down, so there is no redundancy.
- CodeSign Secure signing is failing for a release pipeline with a near-term deadline.

**Severity 3 Minor**
- A discovery scan misses some endpoints.
- A report or dashboard shows wrong values.
- An integration with an IT service management (ITSM) tool fails intermittently.

**Severity 4 Low**
- Questions about configuration or best practice.
- Requests for documentation or a new feature.

## Response targets

Response target means the time from case creation (or the phone call, for Severity 1 and 2) to the first meaningful reply from an EC engineer. It is not a resolution time.

| Severity | Standard | Premium | Premium Plus |
|---|---|---|---|
| 1 Critical | {{TBD: Standard Sev 1 response target}} | {{TBD: Premium Sev 1 response target}} | {{TBD: Premium Plus Sev 1 response target, 24x7}} |
| 2 Major | {{TBD: Standard Sev 2 response target}} | {{TBD: Premium Sev 2 response target}} | {{TBD: Premium Plus Sev 2 response target}} |
| 3 Minor | {{TBD: Standard Sev 3 response target}} | {{TBD: Premium Sev 3 response target}} | {{TBD: Premium Plus Sev 3 response target}} |
| 4 Low | {{TBD: Standard Sev 4 response target}} | {{TBD: Premium Sev 4 response target}} | {{TBD: Premium Plus Sev 4 response target}} |

> **Note:** Plan names and targets are placeholders until confirmed by EC. Contract terms always take priority over this article: {{TBD: confirm plan names and link to support terms}}.

## Requirements for Severity 1 and Severity 2

- A named support contact must call {{TBD: support phone number}} after opening the case.
- A technical contact must stay available for the life of the case. If no contact is available, EC may lower the severity until someone is reachable.
- EC works Severity 1 cases continuously during covered hours. Under plans with 24x7 coverage, work continues around the clock.
- Remote access (screen sharing) should be ready, as allowed by the organization's security policy.

## Updates during a case

| Severity | Update frequency |
|---|---|
| 1 | {{TBD: Sev 1 update frequency}} |
| 2 | {{TBD: Sev 2 update frequency}} |
| 3 | {{TBD: Sev 3 update frequency}} |
| 4 | {{TBD: Sev 4 update frequency}} |

## Common questions

### Can a case be raised to a higher severity later?
Yes. Reply in the case or call the support line and explain the new impact. For an increase to Severity 1 or 2, a phone call is required.

### What if a third-party vendor is involved?
EC may open a case with the HSM or CA vendor. The EC case stays open with the status "Waiting on vendor", and EC passes on updates.

## Related articles

- [Support plans and coverage](support-plans-and-coverage.md)
- [How to open a support case](how-to-open-a-support-case.md)
- [Escalation process](escalation-process.md)
- [Recovering from an expired CRL](../04-Featured-Articles/PKI-Runbooks/recovering-from-an-expired-crl.md)
- [Emergency CRL signing](../04-Featured-Articles/PKI-Runbooks/emergency-crl-signing.md)
