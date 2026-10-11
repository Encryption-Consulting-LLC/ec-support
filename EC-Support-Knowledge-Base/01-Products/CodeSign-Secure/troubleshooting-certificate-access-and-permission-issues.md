---
title: "Troubleshooting Certificate Access and Permission Issues"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later, all signing clients"
summary: "Why a user or pipeline can't sign with a certificate in CodeSign Secure: permissions, team mapping, environments, inactive or expired certificates, renewals."
keywords: ["CodeSign Secure access denied", "can't sign with certificate", "team mapping", "CodeSigning Operation permission", "certificate missing from mapping", "expired code signing certificate", "new user no permissions"]
last_reviewed: "2026-10-08"
---

# Troubleshooting Certificate Access and Permission Issues

This article helps you find out why a user or pipeline can't sign with a certificate, can't see it, or suddenly can't use it after a change. It walks through every check CodeSign Secure makes, in the order it makes them. It is for CodeSign Secure administrators and application owners.

## Applies to

CodeSign Secure v3.2.1  and later, with any signing client.

## The access chain

A signature is allowed only when **every link** in this chain is in place. If one is missing, signing fails, often with a generic error such as `0x80090016` from SignTool or "key not found" from a PKCS#11 tool.

```text
Environment (active, with an approval policy)
  └─ Certificate (Active, not Expired, assigned to that environment)
        └─ Application (Active) maps the certificate to one or more Teams
              └─ Team includes the user
                    └─ User's role has the CodeSigning Operation permission
```

Work through the checks below from top to bottom. Most problems are found in the first three.

## Check 1: the user's role has the right permissions

**Symptom.** A new user can sign in but can't sign, can't see menus, or can't download tools.

**Cause.** Every role except **System Admin** starts with **no permissions**. Assigning a role does nothing until a System Admin turns on the role's permissions.

**Resolution.** In **System Setup > Roles and Permissions**, right-click the role, select **Edit Permissions**, and enable what the user needs:

| To do this | The role needs |
|---|---|
| Sign with client tools | **CodeSigning Operation** |
| Open the Signing Tools download page | **Sign tools** |
| Call the REST API from a script | **API Access** |
| Approve or deny signing requests | **Signing requests decision** (and the System Admin or Project Manager role) |
| Create applications and map teams | **Application creation** and **Team Management** |

> **Tip:** Give pipeline users only **CodeSigning Operation**, plus **API Access** if the pipeline calls the API. Nothing else.

## Check 2: the user is in a team mapped to the certificate

**Symptom.** The user has the CodeSigning Operation permission, but signing with this specific certificate fails.

**Cause.** Only members of teams mapped to the certificate in **App Management** can sign with it.

**Resolution.**

1. In **App Management**, right-click the application and select **View Details**. Check which teams are mapped to the certificate.
2. Use **Manage Team** to add the user to the right team, or **Add Mapping** to map the certificate to the user's team.
3. Make sure the application's status is **Active**. A deactivated application can't be used for signing.

## Check 3: the certificate has an environment

**Symptom.** The certificate doesn't appear in the **Certificate** list when you add a mapping in App Management.

**Cause.** Only certificates that are assigned to an environment are listed. A certificate imported or created without an environment never appears.

**Resolution.**

1. In **Keys and Certificates**, right-click the certificate and select **Edit Environment**.
2. Choose an environment. Only **active** environments are listed.
3. Return to App Management and add the mapping.

**Symptom: an environment can't be selected.** The environment is inactive. Activate it in **System Setup > Environment**.

## Check 4: the certificate is Active and not Expired

**Symptom.** Signing worked before and now fails for everyone using this certificate.

**Cause.** The certificate's status in **Keys and Certificates** is **Inactive** (someone deactivated it) or **Expired** (it passed its end date). Neither can be used for new signatures.

**Resolution.**

- **Inactive:** right-click the certificate and select **Activate**, if it should still be in use.
- **Expired:** expired certificates can't sign. Renew it as described below.

> **Note:** Files you already signed **with a timestamp** stay valid after the certificate expires. You don't need to re-sign them.

## Check 5: the key name or label is current after a renewal

**Symptom.** Signing broke right after a certificate was renewed.

**Cause.** How renewal works depends on the certificate type:

| Certificate type | What renewal does | What you must update |
|---|---|---|
| Self-signed, with **Key Renewal** set to True | Reissues the certificate with the **same** key in the HSM | Download the new certificate and replace the old copy, for example the file in SignTool's `/f` |
| Issued by a Certificate Authority (CA) | Every CSR creates a **new** key pair in the HSM, so the renewed certificate has a **new** key | The new key name or label in every script, the new certificate file, and the team mapping |

**Resolution for a CA-issued certificate.**

1. Generate a new CSR in **Keys and Certificates** and submit it to your CA.
2. Import the issued certificate and choose its environment. The **Certificate Name** on the import form must match the name used when the CSR was created.
3. In **App Management**, map the new certificate to the same teams as the old one.
4. Update every pipeline and build machine: SignTool `/kc` and `/f`, the jarsigner alias, `EC_PKCS11_KEY_LABEL` or `[key_filter]`, and similar settings.
5. Sign and verify a test file.
6. Deactivate the old certificate once nothing uses it.

> **Tip:** If the PKCS#11 Wrapper keeps using the old key after a renewal, set `EC_PKCS11_DISABLE_CACHE=1` to test without the key cache. See [Troubleshooting PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md).

## Check 6: the HSM is available

If the **HSM Health Check** on the Dashboard shows **Inactive**, every signing fails, whatever the permissions. See [Troubleshooting HSM Health Check Inactive](troubleshooting-hsm-health-check-inactive.md).

## Prevent expiry surprises

- Right-click each certificate and select **Setup Trigger**. Add the email addresses that must be warned, and set **Trigger Days** to at least 30, so there is time to renew.
- Watch the **Certificate Report** expiry chart, which groups certificates into 0–7, 7–30, 30–60, 60–90, and 90+ days.
- Publicly trusted code signing certificates issued since March 1, 2026 are valid for at most 460 days. Plan renewals about every 15 months.

## Other access problems

| Symptom | Cause | Resolution |
|---|---|---|
| A user can't be deleted | CodeSign Secure requires a replacement user | Choose a replacement user. That user takes over the deleted user's objects and records. |
| A user is signed out unexpectedly | Each account has one active portal session | Use separate accounts for each person and each pipeline. |
| The Signing Tools page isn't visible | The role lacks **Sign tools** | Enable it in **Roles and Permissions**. |
| A CSR can't be generated | The role lacks **Generate CSR** | Enable it, ideally only for the key custodian role. |

## Information to collect for EC support

- The username, its roles, and its team memberships.
- The certificate name, status, environment, and application.
- The exact client error and the time of failure with its time zone.
- The matching entry from **Reports > Audit Trail**, if there is one.

## Related articles

- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md)
- [Troubleshooting SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md)
- [CodeSign Secure common misconceptions](codesign-secure-common-misconceptions.md)
- [CA/B Forum code signing key storage requirements](../../02-General/Code-Signing/ca-b-forum-code-signing-key-storage-requirements.md)
