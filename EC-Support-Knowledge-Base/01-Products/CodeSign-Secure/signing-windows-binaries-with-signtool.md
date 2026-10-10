---
title: "Signing Windows Binaries with SignTool"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure with Microsoft SignTool (Windows SDK) on Windows 10, Windows 11, and Windows Server build agents"
summary: "Step-by-step guide to Authenticode signing of EXE, DLL, MSI, and driver files with Microsoft SignTool and HSM-held keys managed by CodeSign Secure."
keywords: ["SignTool", "Authenticode", "sign exe", "CodeSign Secure KSP", "signtool timestamp"]
last_reviewed: "2026-10-06"
---

# Signing Windows Binaries with SignTool

This article shows how to sign Windows files with Microsoft SignTool when the private key is held by CodeSign Secure. It covers executables (EXE), libraries (DLL), installers (MSI), catalog files (CAT), PowerShell scripts, and similar Authenticode formats. It is for release engineers and build administrators.

## Overview

SignTool is the Microsoft command-line tool for Authenticode signing. It ships with the Windows Software Development Kit (SDK). SignTool can use a private key that lives outside the local machine through a Key Storage Provider (KSP) or Cryptographic Service Provider (CSP). The CodeSign Secure client installs such a provider, so SignTool can sign with HSM-held keys without any key file on disk.

## Applies to

- Microsoft SignTool from the Windows SDK (64-bit version recommended).
- Windows 10, Windows 11, Windows Server 2016 and later build machines.
- CodeSign Secure Windows client: `<CodeSign Secure Windows client package>`, provided by EC.

## Prerequisites

- Windows SDK installed. SignTool is usually under `C:\Program Files (x86)\Windows Kits\10\bin\<sdk-version>\x64\signtool.exe`.
- CodeSign Secure Windows client installed and configured with the server URL and credentials (`<CodeSign Secure client configuration location>`).
- A signing key and certificate in CodeSign Secure, and permission for this user or service account to use it.
- The signing certificate (public part, `.cer`) available locally, or published to the certificate store by the client.
- Outbound access to a Time Stamping Authority (TSA) URL supplied by the certificate issuer.

## Before starting

- Test on a copy of the file first. Signing changes the file.
- Use SHA-256 for both the file digest and the timestamp digest. SHA-1 Authenticode signatures are no longer trusted for most purposes.
- Do not sign a file that is already signed unless the goal is to add a second signature (use `/as` to append).

## Procedure

### Phase 1: Confirm the key is visible

1. Open a command prompt as the user or service account that will sign.
2. List certificates in the current user store and find the code signing certificate:

```powershell
Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Format-List Subject, Thumbprint, NotAfter
```

3. If the client publishes certificates with a key link to the CodeSign Secure provider, the certificate shows as having a private key. Confirm with:

```cmd
certutil -user -repairstore My <certificate-thumbprint>
```

> **Note:** If the certificate is not placed in the store, use the `/f`, `/csp`, and `/kc` options shown in Phase 2, option B.

### Phase 2: Sign the file

**Option A: certificate in the store (most common).** Select the certificate by thumbprint:

```cmd
signtool sign /sha1 <certificate-thumbprint> /fd SHA256 /tr <tsa-url> /td SHA256 /v <file-to-sign>
```

**Option B: certificate file plus provider and key container.** Point SignTool at the public certificate file and name the provider and key:

```cmd
signtool sign /f <path-to-certificate.cer> /csp "<provider-name>" /kc "<key-container-or-key-alias>" /fd SHA256 /tr <tsa-url> /td SHA256 /v <file-to-sign>
```

The provider name is `<CodeSign Secure KSP name>` (run `certutil -csplist` to see it), and the key container is `<key alias>` as shown for the key in the CodeSign Secure console.

**Option C: digest signing library.** SignTool also supports a digest signing library with `/dlib` and `/dmdf`. Use this only if CodeSign Secure ships such a library.

```cmd
signtool sign /fd SHA256 /tr <tsa-url> /td SHA256 /dlib <path-to-digest-library.dll> /dmdf <path-to-metadata.json> <file-to-sign>
```

### Phase 3: Option reference

| Option | Purpose |
|---|---|
| `/fd SHA256` | File digest algorithm. |
| `/tr <url>` | RFC 3161 timestamp server URL. |
| `/td SHA256` | Timestamp digest algorithm. Must follow `/tr`. |
| `/sha1 <thumbprint>` | Choose the certificate by its SHA-1 thumbprint. |
| `/f <file>` | Certificate file (`.cer` or `.pfx`). |
| `/csp <name>` | CSP or KSP that holds the private key. |
| `/kc <name>` | Key container name inside that provider. |
| `/as` | Append a signature instead of replacing. |
| `/d <text>` | Description shown in User Account Control (UAC) prompts. |
| `/v` | Verbose output. |

### Phase 4: Sign many files

SignTool accepts several files in one command, which saves round trips:

```cmd
signtool sign /sha1 <certificate-thumbprint> /fd SHA256 /tr <tsa-url> /td SHA256 <file1.exe> <file2.dll> <file3.msi>
```

## Verification

Verify the signature and the timestamp:

```cmd
signtool verify /pa /v /tw <signed-file>
```

- `/pa` uses the default Authenticode verification policy.
- `/tw` warns if the signature has no timestamp.
- For kernel drivers, use `/kp` instead of `/pa`.

Also check the CodeSign Secure audit log for the matching signing record.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| "No certificates were found that met all the given criteria" | Wrong thumbprint, wrong store, or the certificate has no linked private key | Check the store and thumbprint. Re-run client setup to publish the certificate. |
| "The specified algorithm is invalid" or error 0x80090008 | Digest or key algorithm not supported by the provider | Use `/fd SHA256`. Confirm the key type in CodeSign Secure. |
| Signing hangs, then times out | Request waiting for approval, or network block to the server | Check pending approvals. Check the API port (HTTPS 443 by default). |
| "Access denied" from provider | User lacks permission for the key in the signing policy | Ask an administrator to grant access. |
| Timestamp error (for example 0x80072ee7) | TSA URL unreachable through proxy or firewall | Allow outbound access or use another TSA. Retry later. |
| SignTool error about missing `/td` | `/tr` used without `/td` | Add `/td SHA256`. |

See [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md) for more.

## Related articles

- [Timestamping for code signing](timestamping-for-code-signing.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
