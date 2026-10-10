---
title: "Approval Workflows and Signing Policies"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure (all deployment models)"
summary: "How to design and configure CodeSign Secure signing policies, roles, and M of N approval workflows so only the right people and pipelines can sign code."
keywords: ["signing policy", "code signing approval workflow", "M of N approval", "RBAC code signing", "CodeSign Secure policy"]
last_reviewed: "2026-10-06"
---

# Approval Workflows and Signing Policies

This article explains how to plan and set up signing policies and approval workflows in CodeSign Secure. Policies decide who may sign, with which key, and under what conditions. It is for CodeSign Secure administrators and security owners.

## Overview

A signing policy links three things: an identity (user, group, or pipeline service account), a key and certificate, and a set of conditions. When a request arrives, CodeSign Secure checks the policy. If the policy needs approval, the request waits for approvers. Every decision is written to the audit log.

Good policies follow two principles:

- **Least privilege:** each identity can use only the keys it needs.
- **Separation of duties:** the person who builds code is not the only person who can release it signed with a production key.

## Applies to

CodeSign Secure SaaS, cloud, on-premises, and hybrid deployments.

## Prerequisites

- Administrator access to the CodeSign Secure console.
- Users and groups available from the identity source.
- Keys and certificates already created. See [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md).
- A list of projects, owners, and approvers agreed with the security team.

## Before starting

- Document the policy design before building it. Changes to production policies can block releases.
- Plan for approver absence. A policy that needs a single named approver stops releases when that person is away.
- Make sure approvers receive notifications.

## Procedure

### Phase 1: Define roles

CodeSign Secure uses Role-Based Access Control (RBAC). Typical roles are below.

| Role (typical) | Can do |
|---|---|
| Administrator | Manage HSM connections, keys, users, and policies. Should not sign production code. |
| Security officer or auditor | View audit logs and reports. |
| Approver | Approve or reject signing requests for assigned projects. |
| Signer | Submit signing requests with allowed keys. |
| Pipeline service account | Submit automated signing requests from CI/CD. |

### Phase 2: Group keys by project and environment

1. Create one project (or equivalent grouping) per product or team on the **Projects** page.
2. Use separate keys for test and production. A test key should use a certificate from an internal Certificate Authority (CA), not a public one.
3. Assign each key to exactly one project.

### Phase 3: Create the signing policy

Open the **Signing Policies** page. For each policy, decide the following conditions.

| Condition | Example |
|---|---|
| Allowed identities | Group "Contoso-Release-Engineers", service account "svc-github-prod" |
| Allowed keys | "Contoso-Prod-Authenticode-2026" |
| Allowed signing tools or file types | SignTool for `.exe`, `.dll`, `.msi` only |
| Allowed hash algorithms | SHA-256, SHA-384 |
| Source network | Build network IP range only |
| Time window | Business hours, or release windows |
| Approval rule | None, single approver, or M of N |

### Phase 4: Configure the approval workflow

1. Choose the approval mode:
   - **No approval:** suitable for test keys and tightly controlled pipelines.
   - **Single approval:** one approver from a group must accept.
   - **M of N quorum:** M approvers out of a group of N must accept. For example, 2 of 4 release managers.
2. Choose the approver group. Use a group, not named individuals.
3. Block self-approval so a requester cannot approve their own request.
4. Set the approval timeout. After the timeout, the request expires and must be submitted again.

> **Tip:** For CI/CD, a common pattern is approval in the CI/CD platform (for example GitHub environments with required reviewers or Azure DevOps approvals) and a no-approval policy in CodeSign Secure limited to the pipeline service account, the release branch network, and the production key. This avoids long-running jobs waiting on approvals.

### Phase 5: Test the policy

1. Submit a request as an allowed signer. Confirm it follows the expected approval path.
2. Submit a request as a user who is not allowed. Confirm it is rejected.
3. Submit a request with a disallowed hash algorithm, for example SHA-1. Confirm it is rejected.
4. Approve and reject a request as an approver. Confirm both outcomes in the audit log.

## Verification

- Audit log entries show requester, approver, key, file name or hash, and result for each test.
- Real-time alerts fire for rejected or unauthorized attempts, if configured.
- Reports for auditors show the policy and its history.

## Rollback

Keep a record of the previous policy settings. If a new policy blocks valid releases, restore the earlier settings and investigate in a test project. Do not remove approval rules on production keys as a quick fix.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Request stays pending | Approvers not notified or not in the approver group | Check notification settings and group membership. |
| Request rejected with "policy" error | Identity, key, file type, or time window does not match | Review the policy conditions in the audit entry. |
| Approver cannot approve | Approver is also the requester and self-approval is blocked | Ask another approver. |
| Pipeline times out | Approval needed but job timeout is short | Raise the timeout or move approval to the CI/CD platform. |

## Related articles

- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
- [Code signing assessment](../../03-Services/code-signing-assessment.md)
