---
title: "Maintenance Windows and Release Notes Policy"
category: "Working with EC Support"
section: "Support Policies"
article_type: "Reference"
applies_to: "EC SaaS products, PKI-as-a-Service, HSM-as-a-Service, and on-premises EC product releases"
summary: "How EC schedules maintenance for SaaS and managed services, how customers are notified, how releases are versioned, and where release notes are published."
keywords: ["maintenance window", "release notes", "EC product updates", "SaaS maintenance", "version support policy"]
last_reviewed: "2026-10-06"
---

# Maintenance Windows and Release Notes Policy

This article explains how Encryption Consulting (EC) plans maintenance on its hosted services, how it tells customers about changes, and how product releases and release notes work. It is for administrators who plan change windows and upgrades.

## Scope

| Offering | Who applies updates |
|---|---|
| SaaS editions of CertSecure Manager, CodeSign Secure, CBOM Secure, SSH Secure | EC |
| PKI-as-a-Service (PKIaaS) | EC |
| HSM-as-a-Service (HSMaaS) | EC, with HSM firmware changes agreed in advance |
| On-premises EC products | The customer, using EC release packages |
| On-premises agents used with SaaS | The customer, or automatic update if enabled {{TBD: confirm agent auto-update support}} |

## Planned maintenance for hosted services

- **Standard window:** {{TBD: regular maintenance window day, time, and time zone}}.
- **Advance notice:** at least {{TBD: notice period for planned maintenance}} for work that may cause downtime or noticeable change.
- **Expected impact:** each notice states the services affected, expected downtime (if any), and actions needed from customers.
- **Regions:** where a service runs in several regions, EC may schedule regions at different times to limit impact.

Most updates are designed to run without downtime. For PKIaaS, EC plans maintenance so that Certificate Revocation List (CRL) and Online Certificate Status Protocol (OCSP) services stay available during the window, because relying parties depend on them all the time.

## Emergency maintenance

EC may apply urgent changes outside the standard window to fix a security issue or prevent an outage. EC gives as much notice as possible, at least {{TBD: minimum notice for emergency maintenance}} when the situation allows, and posts updates until the work is complete.

## How notices are sent

- Email to named support contacts and subscribed users.
- Banner on the support portal.
- Status page: {{TBD: service status page URL}}.

To subscribe more people, open a Severity 4 case with their names and email addresses, or use {{TBD: portal subscription setting, if available}}.

> **Tip:** Use a shared mailbox or distribution list for notices so they do not depend on one person.

## Release types

| Type | Contents | Typical frequency |
|---|---|---|
| Major release | New features, possible changes to requirements | {{TBD: major release frequency}} |
| Minor release | Enhancements and fixes | {{TBD: minor release frequency}} |
| Patch or hotfix | Defect and security fixes | As needed |

Version numbering: {{TBD: EC version number format, for example major.minor.patch}}.

## Release notes

Release notes for each version are published at {{TBD: release notes location on the portal}}. Each set of notes includes:

- New features and changes.
- Fixed issues.
- Known issues and workarounds.
- Changes to supported platforms, CAs, HSMs, or integrations.
- Upgrade steps and any required order, such as upgrading the server before agents.
- Security fixes, with severity where disclosure is appropriate.

## Upgrading on-premises products

1. Read the release notes and the upgrade guide for the target version.
2. Check the supported upgrade path from the current version.
3. Back up the application database and configuration.
4. Test the upgrade in a non-production environment.
5. Schedule a change window and plan a rollback.
6. For major upgrades, consider opening a Severity 4 case in advance so EC knows the date.

## Support lifecycle

- EC supports the current release and {{TBD: number of prior releases supported}} prior releases.
- End-of-support dates are listed at {{TBD: product lifecycle page location}}.
- After end of support, EC gives best-effort help only and may ask for an upgrade before investigating.

## Third-party changes

Some changes come from outside EC, for example:

- CA/Browser Forum rules that shorten public TLS certificate validity to 200 days from March 15, 2026, 100 days from March 15, 2027, and 47 days from March 15, 2029.
- HSM vendor firmware and client software releases.
- Changes to public CA services and the Chrome Root Program.

EC publishes guidance on major industry changes in the Popular right now section of the knowledge base.

## Related articles

- [Support plans and coverage](support-plans-and-coverage.md)
- [Welcome to the EC support portal](welcome-to-the-ec-support-portal.md)
- [47-day SSL/TLS certificate validity timeline](../05-Popular-Right-Now/47-day-ssl-tls-certificate-validity-timeline.md)
- [Updating HSM firmware](../04-Featured-Articles/HSM-Runbooks/updating-hsm-firmware.md)
- [PKI-as-a-Service overview](../01-Products/PKI-as-a-Service/pki-as-a-service-overview.md)
