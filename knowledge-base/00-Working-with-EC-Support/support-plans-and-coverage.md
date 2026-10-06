---
title: "Support Plans and Coverage"
category: "Working with EC Support"
section: "Support Policies"
article_type: "Reference"
applies_to: "All Encryption Consulting products and services"
summary: "Compare EC support plans (Standard, Premium, Premium Plus): coverage hours, channels, named contacts, response targets, and what is in and out of scope."
keywords: ["EC support plans", "Premium Plus 24x7", "support coverage", "named contacts", "support tiers"]
last_reviewed: "2026-10-06"
---

# Support Plans and Coverage

Encryption Consulting (EC) offers support plans with different hours, channels, and response targets. This article compares the plans, explains what support covers, and lists what falls outside support. It is for administrators, procurement teams, and named support contacts.

> **Note:** The plan names and values below are a proposed structure. All values marked TBD will be confirmed by EC. The signed contract always takes priority.

## Plan comparison

| Feature | Standard | Premium | Premium Plus |
|---|---|---|---|
| Coverage hours, Severity 1 | {{TBD: Standard Sev 1 hours, for example business hours}} | {{TBD: Premium Sev 1 hours, for example 24x7}} | {{TBD: Premium Plus hours, 24x7}} |
| Coverage hours, Severity 2 to 4 | {{TBD: Standard hours and time zone}} | {{TBD: Premium hours and time zone}} | {{TBD: Premium Plus hours}} |
| Portal and knowledge base | 24x7 | 24x7 | 24x7 |
| Phone support | {{TBD: Standard phone access}} | Yes | Yes |
| Named support contacts | {{TBD: Standard number of contacts}} | {{TBD: Premium number of contacts}} | {{TBD: Premium Plus number of contacts}} |
| Severity 1 response target | {{TBD: Standard Sev 1 response target}} | {{TBD: Premium Sev 1 response target}} | {{TBD: Premium Plus Sev 1 response target}} |
| Remote troubleshooting sessions | {{TBD: Standard remote sessions}} | Yes | Yes |
| Named technical account manager (TAM) | No | {{TBD: Premium TAM availability}} | {{TBD: Premium Plus TAM availability}} |
| Proactive health checks | No | {{TBD: Premium health check frequency}} | {{TBD: Premium Plus health check frequency}} |
| Upgrade planning help | {{TBD: Standard upgrade planning help}} | {{TBD: Premium upgrade planning help}} | {{TBD: Premium Plus upgrade planning help}} |
| Service reviews | {{TBD: Standard service reviews}} | {{TBD: Premium review frequency}} | {{TBD: Premium Plus review frequency}} |

Response targets by severity are listed in [Support severity levels and response targets](support-severity-levels-and-response-targets.md).

## Business hours and holidays

- Business hours: {{TBD: business hours and time zones, for example per region}}.
- Public holidays: {{TBD: holiday calendar link}}.
- Outside covered hours, the portal stays open. Cases are queued and worked when coverage starts, unless the plan includes 24x7 coverage for that severity.

## What support covers

- Questions about installing, configuring, and using EC products: CertSecure Manager, CodeSign Secure, CBOM Secure, SSH Secure.
- Incidents in EC-operated services: PKI-as-a-Service (PKIaaS) and HSM-as-a-Service (HSMaaS).
- Troubleshooting EC product integrations with supported certificate authorities (CAs), Hardware Security Modules (HSMs), endpoints, and CI/CD tools.
- Product defects and fixes, including patches and hotfixes.
- For customers with a PKI managed support contract: Microsoft Active Directory Certificate Services (AD CS) and HSM incidents within the agreed scope.
- Help reading logs and diagnostics.

## What support does not cover

The following items are usually delivered as a service engagement, not a support case:

- New design work, such as a new PKI hierarchy or HSM architecture.
- Large migrations or upgrades performed by EC engineers.
- Custom scripts or code written for the customer.
- On-site work.
- Third-party products outside the supported integrations list.
- Training. See [EC training and certification](ec-training-and-certification.md).

To request project work, see [How to request a service engagement](../03-Services/how-to-request-a-service-engagement.md).

> **Tip:** When unsure if something is in scope, open a Severity 4 case. EC will confirm and suggest the right path.

## Third-party products

EC supports its own products and the integrations they use. When a fault sits in a third-party product, such as an HSM firmware defect or a public CA outage, EC helps isolate the cause. The customer may need to open a case with that vendor under the vendor's own support contract. Where EC resells or manages the third-party product, EC can raise the vendor case: {{TBD: confirm which vendor contracts EC manages on behalf of customers}}.

## Supported versions

EC supports the current release and {{TBD: number of prior releases supported}} prior releases of each product. Older versions get best-effort support, and EC may ask for an upgrade before fixing a defect. See [Maintenance windows and release notes policy](maintenance-windows-and-release-notes-policy.md).

## Changing plans or contacts

- To upgrade a plan, contact {{TBD: account management contact}}.
- To add or remove named contacts, the account administrator opens a Severity 4 case with the names, email addresses, and phone numbers.

## Related articles

- [Support severity levels and response targets](support-severity-levels-and-response-targets.md)
- [How to open a support case](how-to-open-a-support-case.md)
- [Escalation process](escalation-process.md)
- [PKI managed support](../03-Services/pki-managed-support.md)
- [Welcome to the EC support portal](welcome-to-the-ec-support-portal.md)
