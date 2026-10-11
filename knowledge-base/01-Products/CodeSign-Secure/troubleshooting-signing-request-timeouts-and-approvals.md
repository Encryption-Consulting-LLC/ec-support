---
title: "Troubleshooting Signing Request Timeouts and Approvals"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later, environments with the Certificate Owner, Quorum, or No Approval policy"
summary: "Why CodeSign Secure signing requests time out after 100 seconds, why approvers can't see or approve requests, MFA code issues, and approvals in CI/CD."
keywords: ["signing request timeout", "100 seconds", "approval workflow", "Requires MFA", "quorum approval", "Expired Requests", "CodeSign Secure pipeline fails"]
last_reviewed: "2026-10-08"
---

# Troubleshooting Signing Request Timeouts and Approvals

This article explains why a signing job fails while it waits for approval, why an approver can't see or act on a request, and how to stop approvals from breaking automated pipelines. It is for approvers, CodeSign Secure administrators, and pipeline owners.

## Applies to

CodeSign Secure v3.2.1  and later, all deployment models.

## How approvals work

Approval rules are set on the **environment**, not on the user or the pipeline. Each certificate belongs to exactly one environment, and the environment's policy decides what happens to every signing request made with that certificate.

| Policy | What happens | Who approves |
|---|---|---|
| No Approval | Signed immediately | Nobody |
| Certificate Owner | Waits for the certificate owner to approve or deny | The owner of the certificate |
| Quorum | Waits until the required number of quorum members approve | The users set as quorum members |

If the environment has **Needs MFA** turned on, approvers must enter a one-time code sent by email before **Approve** and **Deny** appear.

Two timers matter:

| Timer | Value | Effect |
|---|---|---|
| Signing request validity | 100 seconds | An approver must act within 100 seconds of the request being submitted. Otherwise the request times out, the approval buttons disappear, and the signing command fails. |
| MFA validation | 15 minutes | After an approver enters a valid MFA code, the validation lasts 15 minutes. |

## Problem: the signing job fails after about 100 seconds

**Symptom.** SignTool, jarsigner, or another tool waits, then fails. The pipeline step fails. On the Dashboard, the **Expired Requests** count goes up.

**Cause.** The certificate's environment uses Certificate Owner or Quorum, and the approval didn't arrive within 100 seconds.

**Resolution.**

1. Find the request on the **Signing Request** page and confirm its status shows that it timed out.
2. Run the signing command again and make sure an approver is watching the **Signing Request** page when it starts.
3. For automated pipelines, use a certificate in an environment with **No Approval**. Control risk with team mapping, a dedicated API user per pipeline, protected branches, and the Audit Trail.
4. If you need human approval for releases, use the approval gate of your CI/CD platform before the signing step (for example GitHub environments with required reviewers, or Azure DevOps approvals). Then let the signing step use a No Approval certificate that only the release pipeline's API user can reach.

> **Important:** Raising the CI/CD job timeout does not help. The 100-second limit is on the CodeSign Secure request, not on the job.

## Problem: the approver doesn't see the request

**Symptom.** A signing job is waiting, but the approver's **Signing Request** page shows nothing to approve.

**Likely causes and fixes.**

| Cause | Resolution |
|---|---|
| The page hasn't refreshed | Select **Refresh** on the table. |
| The user isn't an eligible approver for this certificate | Under Certificate Owner, only the certificate owner can approve. Under Quorum, only the selected quorum members can approve. |
| The user doesn't hold an approver role | Approvers must hold the **System Admin** or **Project Manager** role, or both. Quorum members can only be chosen from users with these roles. |
| The role lacks the decision permission | Check that the approver's role has **Signing requests decision** enabled in **System Setup > Roles and Permissions**. |
| The request already timed out | Requests older than 100 seconds can't be approved. Submit the request again. |
| The certificate is in a No Approval environment | The request was signed immediately, so there is nothing to approve. |

## Problem: the approver sees "Requires MFA" instead of Approve and Deny

**Cause.** This is expected. The environment has **Needs MFA** turned on.

**Resolution.**

1. Select **Requires MFA**. CodeSign Secure emails a one-time code to the approver.
2. Enter the code in the pop-up.
3. **Approve** and **Deny** appear. Act before the 100-second window ends.

Because the window is short, approvers should keep their email open when they expect a release. The MFA validation then stays valid for 15 minutes, so later requests in that period don't need a new code.

## Problem: MFA codes or approval emails don't arrive

**Cause.** CodeSign Secure has no active SMTP configuration, or there is no active email template for that event.

**Resolution.**

1. In **System Setup > Email > Config**, make sure exactly one SMTP configuration is active. Only one can be active at a time.
2. In **System Setup > Email > Template**, make sure an active template exists for each event you use, including **Signing MFA Code**.
3. Check that the server can reach the SMTP server on the configured port, for example TCP 587.
4. Ask approvers to check their spam or junk folders.

## Problem: a request was signed without approval when approval was expected

**Cause.** The certificate is in an environment whose policy is No Approval, or the environment shows **No Policy Setup**. An environment with **No Policy Setup behaves as No Approval**.

**Resolution.**

1. In **Keys and Certificates**, check the certificate's environment.
2. In **System Setup > Environment**, check that environment's policy. Set it to Certificate Owner or Quorum, and turn on **Needs MFA** for production.
3. Review the Audit Trail for other signatures made with that certificate while the policy was missing.

> **Warning:** Review environment assignments every time you create or import a certificate. A production certificate placed in the wrong environment is signed without review.

## Recommended environment design

| Environment | Policy | Needs MFA | Use for |
|---|---|---|---|
| Dev | No Approval | Off | Developer and test builds, usually with self-signed certificates |
| CI | No Approval | Off | Automated builds that must never wait for a person |
| Staging | Certificate Owner | Optional | Release candidates reviewed by the application owner |
| Production | Quorum | On | Releases that customers install |
| EV or high assurance | Quorum, with a higher minimum | On | EV certificates, drivers, and other high-impact files |

- Choose more eligible quorum members than the minimum, so one absence doesn't block a release.
- Use separate certificates for automated signing and approved signing, so each keeps its own policy.
- Make sure the people who request production signatures are not the only people who can approve them.

## Information to collect for EC support

- The certificate name, its environment, and the environment's policy and MFA setting.
- The approver's username and roles.
- The time the request was submitted, with its time zone.
- A screenshot of the **Signing Request** page entry, and the matching Audit Trail entry.

## Related articles

- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md)
- [CodeSign Secure common misconceptions](codesign-secure-common-misconceptions.md)
- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
