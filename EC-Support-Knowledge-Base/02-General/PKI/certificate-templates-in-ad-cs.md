---
title: "Certificate Templates in AD CS"
category: "General"
section: "PKI"
article_type: "Concept"
applies_to: "Microsoft Active Directory Certificate Services (AD CS), Enterprise CAs, Windows Server 2016 and later"
summary: "How certificate templates in Microsoft AD CS work: template versions, key settings, subject name options, permissions, publishing, and safe practices."
keywords: ["certificate templates", "AD CS templates", "certtmpl.msc", "autoenrollment", "template permissions"]
last_reviewed: "2026-10-06"
---

# Certificate Templates in AD CS

This article explains what certificate templates are in Microsoft Active Directory Certificate Services (AD CS), how they control issuance, and which settings matter most for security. It is for PKI administrators who create, change, or review templates on Enterprise Certificate Authorities (CAs).

## What it is

A certificate template is a set of rules stored in Active Directory (AD). It defines what a certificate issued from it will contain and who may request it. Templates are used only by **Enterprise CAs**, which are integrated with AD. Standalone CAs do not use templates.

Templates are stored in the AD configuration partition at:

```
CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration,DC=<domain>,DC=<tld>
```

Because they live in the configuration partition, templates replicate to the whole forest.

## Why it matters

The template decides who can get a certificate and what that certificate can do. A template that lets low-privileged users choose any subject name and use the certificate for client authentication can allow full domain takeover. Most known AD CS attacks start with a weak template. See [Common AD CS misconfigurations (ESC1 to ESC8)](common-ad-cs-misconfigurations-esc1-to-esc8.md).

## How it works

1. An administrator duplicates an existing template in the Certificate Templates console (`certtmpl.msc`) and adjusts its settings. Built-in templates should not be edited directly.
2. The administrator grants **Enroll** (and, if needed, **Autoenroll**) permission to the right security groups.
3. The template is **published** to one or more Enterprise CAs (Certification Authority console, Certificate Templates node, New, Certificate Template to Issue). A CA issues only from templates published to it.
4. A client requests a certificate by template name, manually, through autoenrollment Group Policy, or through tools such as `certreq`.
5. The CA reads the template, checks the requester's permissions, builds the certificate from template settings and AD data, and issues it, or holds it as pending if manager approval is required.

## Template schema versions

| Version | Introduced with | Notes |
|---|---|---|
| Version 1 | Windows 2000 | Built-in templates. Settings cannot be changed, only permissions |
| Version 2 | Windows Server 2003 | Editable. Supports autoenrollment, key archival, issuance requirements |
| Version 3 | Windows Server 2008 | Adds Cryptography Next Generation (CNG) Key Storage Providers and newer algorithms |
| Version 4 | Windows Server 2012 | Adds renewal with the same key and more provider options |

The version is set by the **Compatibility** tab, which limits which settings are available.

## Important template settings

| Tab | Setting | Why it matters |
|---|---|---|
| General | Validity and renewal period | Sets lifetime. Renewal period controls when autoenrollment renews |
| General | Publish certificate in Active Directory | Needed for some use cases such as encryption certificates |
| Request Handling | Purpose, archive private key, allow private key export | Exportable keys can be copied off the device. Use only when required |
| Cryptography | Provider category, algorithm, minimum key size | Choose a Key Storage Provider, RSA 2048 or larger or ECDSA P-256 or larger |
| Subject Name | Supply in the request vs Build from Active Directory | "Supply in the request" lets the requester set any name. Treat it as high risk |
| Issuance Requirements | CA certificate manager approval, authorized signatures | Adds human or enrollment agent approval |
| Extensions | Application Policies (Extended Key Usage, EKU), Key Usage, Issuance Policies | Defines what the certificate can be used for |
| Security | Read, Enroll, Autoenroll, Write, Full Control | Who can request or change the template |
| Superseded Templates | List of older templates | Lets autoenrollment replace old certificates with the new template |

## Useful commands

List templates published to a CA:

```cmd
certutil -CATemplates -config "<CAHost>\<CAName>"
```

Show all templates in AD with full settings:

```cmd
certutil -v -dstemplate
```

Show one template:

```cmd
certutil -v -dstemplate <TemplateName>
```

## Good practices

- Duplicate, never edit, built-in templates.
- Grant Enroll only to the groups that need the certificate. Avoid "Domain Users" and "Authenticated Users" on templates with authentication EKUs.
- Avoid "Supply in the request" on any template with a client authentication EKU, unless manager approval is required.
- Do not use the "Any Purpose" EKU or leave the EKU empty.
- Limit Write, Full Control, and Owner rights on templates to PKI administrators.
- Unpublish templates that are no longer used, so the attack surface stays small.
- Keep a change record of each template's settings. Template changes affect every future request.
- Prefer short validity combined with autoenrollment or a certificate lifecycle management tool such as [CertSecure Manager](../../01-Products/CertSecure-Manager/certsecure-manager-overview.md).

> **Warning:** Changing a template that is already published takes effect for new requests immediately across the forest after AD replication. Test changes on a duplicate first.

## Key terms

| Term | Meaning |
|---|---|
| Enterprise CA | A CA integrated with AD that issues from templates |
| Autoenrollment | Group Policy feature that requests and renews certificates automatically |
| EKU | Extended Key Usage, the list of purposes a certificate may be used for |
| Enrollment agent | An account allowed to request certificates on behalf of other users |
| Key archival | The CA stores an encrypted copy of the private key for recovery |

## Common questions

### Why does a template not appear on the CA?
It has not been published to that CA, the CA does not support the template version, or AD replication has not finished.

### Why does a request fail with a permissions error?
The requester lacks Read and Enroll permissions on the template, or the CA's own permissions block the request.

### Can EC review templates?
Yes. EC's [PKI assessment](../../03-Services/pki-assessment.md) includes a template and permission review.

## Related articles

- [Common AD CS misconfigurations (ESC1 to ESC8)](common-ad-cs-misconfigurations-esc1-to-esc8.md)
- [PKI security best practices](pki-security-best-practices.md)
- [PKI fundamentals](pki-fundamentals.md)
- [certutil command reference](../../04-Featured-Articles/PKI-Runbooks/certutil-command-reference.md)
- [Connecting CertSecure Manager to Microsoft AD CS](../../01-Products/CertSecure-Manager/connecting-certsecure-manager-to-microsoft-ad-cs.md)
