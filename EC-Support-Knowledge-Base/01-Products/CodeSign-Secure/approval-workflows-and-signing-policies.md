---
title: "Approval Workflows and Signing Policies"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure v3.2.1  and later (all deployment models)"
summary: "How CodeSign Secure controls signing: environment approval policies (No Approval, Certificate Owner, Quorum), MFA, roles, and team mapping."
keywords: ["signing policy", "code signing approval workflow", "quorum approval", "CodeSign Secure environment", "Needs MFA", "App Management team mapping", "roles and permissions"]
last_reviewed: "2026-10-08"
---

# Approval Workflows and Signing Policies

This article explains how CodeSign Secure decides who can sign with which certificate and whether a signature needs approval, and how to set this up. It is for CodeSign Secure administrators, security owners, and application owners.

## Overview

Three settings work together. A request is signed only when all three allow it.

| Setting | Where | Decides |
|---|---|---|
| **Roles and permissions** | System Setup > Roles and Permissions | What each user can do in the portal and with client tools |
| **Team mapping** | App Management | Which users can sign with which certificate |
| **Environment policy** | System Setup > Environment | Whether a request needs approval, from whom, and whether MFA is required |

```text
Environment (approval policy + Needs MFA)
  └─ Certificate (exactly one environment)
        └─ mapped in an Application to one or more Teams
              └─ Team members (users) ── Roles ── Permissions
```

Good designs follow two principles:

- **Least privilege:** each user and pipeline can sign only with the certificates it needs.
- **Separation of duties:** the people who request production signatures are not the only people who can approve them.

## Applies to

CodeSign Secure v3.2.1  and later.

## Approval policies

Each environment has exactly one policy.

| Policy | What happens to a signing request | Who approves |
|---|---|---|
| No Approval | Signed immediately | Nobody |
| Certificate Owner | Waits until the certificate owner approves or denies it | The owner of the certificate |
| Quorum | Waits until the required number of quorum members approve it | The users selected as quorum members |

- Approvers must hold the **System Admin** or **Project Manager** role, or both. Quorum members can only be chosen from users with these roles.
- **Needs MFA** adds a one-time code, sent by email, that the approver enters before **Approve** and **Deny** appear.
- An environment that shows **No Policy Setup** behaves as **No Approval**.

### Timers

| Timer | Value | What it means |
|---|---|---|
| Request validity | 100 seconds (fixed) | The request must be approved within 100 seconds of being submitted. Otherwise it times out, the approval buttons disappear, and the signing command fails. |
| MFA validation | 15 minutes | After an approver enters a valid code, the validation lasts 15 minutes. |

## Roles and permissions

CodeSign Secure has five default roles. **Every role except System Admin starts with no permissions**, so a System Admin must enable them before users with those roles can do anything.

| Role | Suggested permissions |
|---|---|
| System Admin | Add Identity Store, Email Configuration, Email Template, Upload SSL/TLS Certificate, Backup Dump, Integrate Plugins, Activate License, Register User, User Role Assign |
| Security Officer (key custodian) | Create Self-Signed Certificates, Generate CSR, Import Certificates, Environment creation, Origin verification configuration, View logs, View reports |
| Project Manager (application owner and approver) | Application creation, Team Management, Signing requests decision, View reports |
| Developer (requester or pipeline) | CodeSigning Operation, Sign tools, and API Access if the pipeline calls the API |
| Auditor | View reports, View logs, Download Syslog Report, Download Syslog Logging |

- Keep at least two named System Admins.
- Give automation its own API users with only **CodeSigning Operation**, and **API Access** where needed.
- Review roles and assignments every quarter and after organizational changes.

## Recommended environments

| Environment | Policy | Needs MFA | Typical use |
|---|---|---|---|
| Dev | No Approval | Off | Developer and test builds, usually with self-signed certificates |
| CI | No Approval | Off | Automated builds that must never wait for a person |
| Staging | Certificate Owner | Optional | Release candidates reviewed by the application owner |
| Production | Quorum | On | Releases that customers install |
| EV or high assurance | Quorum, with a higher minimum | On | EV certificates, drivers, and other high-impact files |

## Prerequisites

- System Admin access to the portal.
- At least one active SMTP configuration in **System Setup > Email > Config**, and active templates for the notifications you use, including **Signing MFA Code**. Without them, approval notifications and MFA codes aren't sent.
- A list of applications, owners, teams, and approvers agreed with the security team.

## Procedure

### Phase 1: Enable role permissions

1. Go to **System Setup > Roles and Permissions**.
2. Right-click each role, select **Edit Permissions**, switch on the permissions it needs, and select **Update**. Hover over a permission to see what it controls.
3. Make sure approvers have the System Admin or Project Manager role, and that role has **Signing requests decision**.

### Phase 2: Create environments

1. Go to **System Setup > Environment > Create Environment**.
2. Enter the **Environment Name**, choose the **Policy Type**, set **Status** to Active, and select **Needs MFA** if required.
3. For **Quorum**, select the eligible approvers and the number of approvals required. Choose more eligible approvers than the minimum, so one absence doesn't block a release.

Only active environments can be assigned to certificates.

### Phase 3: Assign each certificate to an environment

- For a new self-signed certificate, choose the environment on the form.
- For a CA-issued certificate, choose the environment when you import the issued certificate.
- To change it later, right-click the certificate in **Keys and Certificates** and select **Edit Environment**.


### Phase 4: Map certificates to teams

1. Go to **App Management > Add New Application**. Enter the Application Name, Business Unit, Artifact Types, and Application Description, then select **Save & Proceed**. The user who creates the application becomes its owner.
2. In **Team Detail**, select **Create Team** to define a team and its members, or **Manage Team** to change an existing team.
3. Select **Add Mapping**, choose the certificate and one or more teams, then select **Finish**.

Only certificates that have an environment appear in the **Certificate** list. Only members of mapped teams can sign with the certificate.

### Phase 5: Plan for pipelines

Because requests time out after 100 seconds:

- Use certificates in a **No Approval** environment for fully automated pipelines, and control risk through team mapping, dedicated API users, and the Audit Trail.
- For release signing that needs approval, make sure an approver is watching the **Signing Request** page when the job runs, or use the CI/CD platform's approval gate before the signing step.
- Use separate certificates for automated and approved signing, so each keeps its own policy.

## How approvers act on a request

1. Open **Signing Request**. A pending request shows **Pending**. Select **Refresh** if it isn't listed yet.
2. If the environment needs MFA, select **Requires MFA**, enter the code sent by email, and wait for **Approve** and **Deny** to appear.
3. Select **Approve** to let the signing job continue (status **Approved**, action **Request Completed**), or **Deny** to reject it (status **Rejected**).

If nobody acts within 100 seconds, the request times out and the action buttons disappear.

## Verification

Test each production policy before you rely on it:

1. Sign as a team member with a Certificate Owner or Quorum certificate. Confirm the request appears for the right approvers and that the MFA step works.
2. Let a request time out. Confirm the signing command fails and the **Expired Requests** count on the Dashboard goes up.
3. Sign as a user who isn't in a mapped team. Confirm the request is refused.
4. Review **Reports > Audit Trail**, **Logs**, and the **Signing Request Report** for each test.

## Policy checklist

- Every production certificate is in an environment with Quorum or Certificate Owner, and MFA is on.
- No environment is left with **No Policy Setup**.
- Automated pipelines use their own certificates in No Approval environments.
- Approvers know the 100-second window and watch for signing request notifications.
- The people who request production signatures are not the only people who can approve them.
- You review environment assignments whenever you create or import a certificate.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| A signing job fails after about 100 seconds | Nobody approved in time | Approve within 100 seconds, or use a No Approval environment for automation. |
| The approver sees **Requires MFA** | The environment needs MFA | Select it, enter the emailed code, then approve. |
| The approver doesn't see the request | Not the owner or a quorum member, wrong role, or the list wasn't refreshed | Check eligibility and roles, then select **Refresh**. |
| MFA codes don't arrive | No active SMTP configuration or template | Activate them in **System Setup > Email**. |
| A certificate is missing from the mapping list | The certificate has no environment | Use **Edit Environment** in Keys and Certificates. |
| A new user can't do anything | The role has no permissions | Enable them in **Roles and Permissions**. |

For more detail, see [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md) and [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md).

## Related articles

- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
- [Code signing assessment](../../03-Services/code-signing-assessment.md)
