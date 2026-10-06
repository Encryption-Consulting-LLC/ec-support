---
title: "Common AD CS Misconfigurations (ESC1 to ESC8)"
category: "General"
section: "PKI"
article_type: "Concept"
applies_to: "Microsoft Active Directory Certificate Services (AD CS), Enterprise CAs, all supported Windows Server versions"
summary: "Explains the AD CS escalation paths ESC1 to ESC8 from the Certified Pre-Owned research, how to detect each one, and how to fix it, plus later ESC9 to ESC15."
keywords: ["AD CS misconfigurations", "ESC1", "ESC8", "Certified Pre-Owned", "AD CS attacks", "template hardening"]
last_reviewed: "2026-10-06"
---

# Common AD CS Misconfigurations (ESC1 to ESC8)

This article explains the well-known escalation paths in Microsoft Active Directory Certificate Services (AD CS), labeled ESC1 to ESC8, and how to find and fix them. It is for PKI administrators, Active Directory (AD) administrators, and security teams who need to harden an AD CS deployment.

## What it is

In 2021, SpecterOps researchers Will Schroeder and Lee Christensen published the white paper "Certified Pre-Owned". It showed that common AD CS settings let ordinary domain users gain domain administrator rights or keep long-lived access. The paper named eight escalation paths, ESC1 to ESC8. Later research added ESC9 to ESC15 and further entries. The labels are now the standard language for AD CS risk.

## Why it matters

A certificate that allows client authentication can be used to log on through Kerberos (PKINIT) or Schannel. If an attacker can get such a certificate for a privileged account, the attacker can act as that account until the certificate expires, even after a password change. Many of these weaknesses come from default or convenient settings, so they are common in real environments.

## How it works: ESC1 to ESC8

| ID | Weakness | What an attacker can do | Fix |
|---|---|---|---|
| ESC1 | Template lets the enrollee supply the subject or Subject Alternative Name (SAN), has a client authentication EKU, low-privileged users can enroll, and no manager approval | Request a certificate as any user, such as a domain administrator | Set Subject Name to "Build from this Active Directory information", or require CA certificate manager approval; restrict Enroll rights |
| ESC2 | Template has the "Any Purpose" EKU or no EKU | Use the certificate for client authentication or as a subordinate CA certificate | Set specific EKUs only; restrict Enroll rights |
| ESC3 | Template grants the Certificate Request Agent EKU (enrollment agent) to low-privileged users, and another template allows enrollment on behalf of others | Request certificates on behalf of any user | Restrict enrollment agent templates; configure Enrollment Agent restrictions on the CA |
| ESC4 | Weak access control on a template (Write, WriteDacl, WriteOwner, Full Control for broad groups) | Change the template to make it vulnerable (for example to ESC1) | Limit template write rights to PKI administrators |
| ESC5 | Weak access control on other PKI objects, such as the CA computer account, the Public Key Services container, or the NTAuthCertificates object | Take over the CA or add a rogue CA to NTAuth | Treat CA servers and PKI containers as Tier 0; review their permissions |
| ESC6 | The CA has the `EDITF_ATTRIBUTESUBJECTALTNAME2` flag set | Add any SAN to any request, on any template allowing client authentication | Remove the flag and restart the CA service |
| ESC7 | Weak access control on the CA itself (ManageCA or ManageCertificates held by broad groups) | Turn on ESC6, approve pending requests, or publish risky templates | Limit CA roles to a small named group; enable role separation where possible |
| ESC8 | HTTP enrollment endpoints (Web Enrollment, Certificate Enrollment Web Service) accept NTLM without Extended Protection for Authentication (EPA) | Relay a computer's NTLM authentication (for example from a coerced domain controller) and get a certificate for it | Require HTTPS with EPA, disable NTLM on these sites, or remove the endpoints if not needed |

### ESC9 to ESC15 in brief

Later research by Oliver Lyak (Certipy) and others added more paths, including:

- **ESC9 and ESC10:** weak certificate-to-account mapping (missing security extension or weak mapping registry settings).
- **ESC11:** NTLM relay to the CA's RPC interface when request encryption is not enforced.
- **ESC12:** shell access to a CA server that holds its key in a poorly protected device.
- **ESC13:** issuance policies linked to AD groups, which grant group rights through a certificate.
- **ESC14:** weak explicit mappings in the `altSecurityIdentities` attribute.
- **ESC15:** application policies on schema version 1 templates (CVE-2024-49019, also called "EKUwu").

Microsoft's strong certificate mapping changes (KB5014754) close several mapping-based paths when enforcement is active. Confirm the current enforcement state against Microsoft documentation for the installed updates.

## How to detect

1. Inventory published templates and their settings:

   ```cmd
   certutil -v -dstemplate > templates.txt
   ```

2. Check the CA policy flags for ESC6:

   ```cmd
   certutil -config "<CAHost>\<CAName>" -getreg policy\EditFlags
   ```

   If the output includes `EDITF_ATTRIBUTESUBJECTALTNAME2`, the CA is exposed.

3. Review CA security (ESC7) in the Certification Authority console, CA Properties, Security tab.
4. Check whether `certsrv` or Certificate Enrollment Web Service sites exist in IIS, and whether EPA is set to Required (ESC8).
5. Run an authorized audit tool. Common open source options are Locksmith and PSPKIAudit (defensive), and Certify or Certipy (offensive tools often used in assessments).

> **Warning:** Run offensive tools only with written authorization and in line with the organization's security policy.

## How to fix (examples)

Remove the ESC6 flag:

```cmd
certutil -config "<CAHost>\<CAName>" -setreg policy\EditFlags -EDITF_ATTRIBUTESUBJECTALTNAME2
net stop certsvc
net start certsvc
```

For templates (ESC1 to ESC4):

- Duplicate the template, correct the settings, publish the new version, and supersede the old one.
- Remove Enroll from "Domain Users", "Domain Computers", and "Authenticated Users" unless the template is low risk.
- Remove Write, WriteDacl, and WriteOwner for non-PKI groups.

For ESC8, follow Microsoft's guidance on mitigating NTLM relay to AD CS: enable EPA, require Secure Sockets Layer (SSL), and disable NTLM on the enrollment sites, or uninstall Web Enrollment if it is not used.

> **Note:** Changing templates can break enrollment for applications that depend on them. Test each change and plan a change window.

## Key terms

| Term | Meaning |
|---|---|
| ESC | "Escalation" scenario number from the Certified Pre-Owned research and its follow-ups |
| EKU | Extended Key Usage, the allowed purposes of a certificate |
| SAN | Subject Alternative Name, the identities a certificate covers |
| PKINIT | Kerberos logon using a certificate |
| EPA | Extended Protection for Authentication, binds authentication to the TLS channel to stop relay |
| NTAuthCertificates | AD object listing CAs trusted to issue logon certificates |

## Common questions

### Are ESC issues software bugs?
Mostly no. ESC1 to ESC8 are configuration weaknesses. A few later entries were fixed by Microsoft security updates, but configuration review is still needed.

### Does removing a vulnerable template revoke already issued certificates?
No. Certificates issued from a risky template stay valid. Review issued certificates and revoke any that look suspicious.

### Can EC check for these issues?
Yes. EC's [PKI assessment](../../03-Services/pki-assessment.md) includes an AD CS configuration and template review with remediation guidance.

## Related articles

- [Certificate templates in AD CS](certificate-templates-in-ad-cs.md)
- [PKI security best practices](pki-security-best-practices.md)
- [PKI fundamentals](pki-fundamentals.md)
- [certutil command reference](../../04-Featured-Articles/PKI-Runbooks/certutil-command-reference.md)
- [PKI assessment](../../03-Services/pki-assessment.md)
