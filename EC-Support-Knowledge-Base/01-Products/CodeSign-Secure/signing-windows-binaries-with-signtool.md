---
title: "Signing Windows Binaries with SignTool"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure v3.2.1  and later with the Encryption Consulting KSP and Microsoft SignTool on Windows 10, Windows 11, and Windows Server 2019, 2022, and 2025"
summary: "Install and configure the Encryption Consulting KSP, then sign EXE, DLL, MSI, driver, script, and macro files with SignTool using keys held in CodeSign Secure."
keywords: ["SignTool", "Authenticode", "Encryption Consulting Key Storage Provider", "EC KSP install", "ECGetCert", "EC_Client_Auth", "signtool timestamp"]
last_reviewed: "2026-10-08"
---

# Signing Windows Binaries with SignTool

This article shows how to set up a Windows machine to sign with Microsoft SignTool through the Encryption Consulting Key Storage Provider (KSP), and how to sign and verify files. It covers executables, libraries, installers, drivers, scripts, and Office macros. It is for release engineers and build administrators.

## Overview

SignTool is Microsoft's command-line tool for Authenticode signing. It can use a private key held outside the machine through a Key Storage Provider. The Encryption Consulting KSP is a Windows Cryptography API: Next Generation (CNG) provider. When SignTool calls it, the KSP hashes the file locally, sends the hash to CodeSign Secure, and returns the signature from the Hardware Security Module (HSM). No private key is ever stored on the build machine.

## Applies to

- CodeSign Secure v3.2.1  and later.
- Windows 10, Windows 11, and Windows Server 2019, 2022, and 2025.
- Any file type SignTool can sign, for example `.exe`, `.dll`, `.sys`, `.msi`, `.cab`, `.cat`, `.ps1`, and Office macro files such as `.xlsm`.

## Prerequisites

- A registered CodeSign Secure user whose role has the **CodeSigning Operation** and **Sign tools** permissions.
- The user is a member of a team mapped to the signing certificate in **App Management**.
- The CodeSign Secure activation code (the **Code**). Your CodeSign Secure administrator can provide it.
- An authentication certificate (`.pfx`) and its password, generated in **System Setup > User > Generate Authentication Certificate**.
- An `ectoken` from CodeSign Secure.
- Network access to `https://<your-domain>/` and outbound access to a Time Stamping Authority (TSA).

## Before starting

- Test on a copy of the file first. Signing changes the file.
- Use SHA-256 or stronger for both the file digest and the timestamp.
- The product guides run SignTool from an **elevated (Administrator) command prompt**.

## Procedure

### Phase 1: Install the Encryption Consulting KSP

1. Sign in to CodeSign Secure, open **Signing Tools**, filter by Windows, and download **Encryption Consulting CNG-SigningKSP**.
2. Run the `.msi` installer with administrator rights and select **Next** through the welcome pages.
3. When asked for the API user authentication details, enter:

   | Field | Value |
   |---|---|
   | Username | Your registered CodeSign Secure username |
   | Code | The CodeSign Secure activation code set during setup |
   | Identity Type | `1` |
   | API Base URL | `https://<your-domain>/api/`. Keep the trailing `/api/`, and include the port if it isn't 443, for example `https://<your-domain>:8443/api/`. |

4. Confirm the change prompt and finish the installation.
5. Check that the provider is registered:

   ```cmd
   certutil -csplist | findstr /i "Encryption Consulting"
   ```

### Phase 2: Point the KSP to your authentication certificate

Create these **system** environment variables (Start > "Edit the system environment variables" > **Environment Variables** > **New**):

| Variable | Value |
|---|---|
| `EC_Client_Auth` | Full path to the authentication certificate, for example `C:\EC\AuthCert.pfx` |
| `EC_Client_Pass` | The password set when the certificate was generated |
| `EC_SSL_VERBOSE` | `0` normally. Set to `1` to show debugging output. |

Or from an elevated command prompt:

```cmd
setx EC_Client_Auth "C:\EC\AuthCert.pfx" /M
setx EC_Client_Pass "<certificate-password>" /M
setx EC_SSL_VERBOSE "0" /M
```

Open a **new** command prompt afterwards. Existing windows don't see the new values.

On shared machines, prefer the Environment Variables dialog for `EC_Client_Pass`, so the password isn't typed into a command line or captured in logs.

> **Tip:** Restrict the `.pfx` file so only the signing account can read it:
> `icacls C:\EC\AuthCert.pfx /inheritance:r /grant:r "Administrators:F" "<DOMAIN>\<signing-account>:R"`

### Phase 3: Set the ectoken in the registry

1. Open **Registry Editor** and go to `Computer\HKEY_CURRENT_USER\Software\Encryption Consulting\SigningKSP`.
2. Set the `ectoken` value to the token generated in CodeSign Secure.

The installer settings (Username, Code, Identity Type, and API Base URL) are stored in the same key, so you can change them there later without reinstalling.

> **Important:** The key is under `HKEY_CURRENT_USER`, so it applies only to the Windows account that ran the installer. If a build agent runs as another account, configure the same values for that account. See [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md).

### Phase 4: Install SignTool

1. Download the Windows SDK from `developer.microsoft.com/en-us/windows/downloads/windows-sdk/`.
2. In the installer, clear every feature except **Windows SDK Signing Tools for Desktop Apps**, then install.
3. Add the SignTool folder to the system `PATH`, for example `C:\Program Files (x86)\Windows Kits\10\bin\<sdk-version>\x64`.
4. Open a new command prompt and run `signtool` to confirm it is found.

### Phase 5: Get the signing certificate file

SignTool needs the public certificate for the key you sign with. Use either method:

- **From the portal:** in **Keys and Certificates**, right-click the certificate and select **Download Certificate**.
- **From the KSP folder:** run `ECGetCert.exe` with the key name. It saves `<key-name>.pem` in the same folder.

  ```cmd
  cd "C:\Program Files\Encryption Consulting\SigningKSP"
  ECGetCert.exe <key-name>
  ```

Both give you the public certificate only. The private key stays in the HSM.

### Phase 6: Sign the file

```cmd
signtool sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f <path-to-certificate>.pem /tr http://timestamp.digicert.com /td SHA256 <file-to-sign>
```

Example:

```cmd
signtool sign /csp "Encryption Consulting Key Storage Provider" /kc evcodesigning /fd SHA256 /f evcodesigning.pem /tr http://timestamp.digicert.com /td SHA256 setup.exe
```

If the certificate's environment needs approval, the command waits until an approver acts. Approval must happen within 100 seconds. See [Approval workflows and signing policies](approval-workflows-and-signing-policies.md).

### Option reference

| Option | Purpose |
|---|---|
| `/csp "Encryption Consulting Key Storage Provider"` | The KSP that holds the key. Always this exact value. |
| `/kc <key-name>` | The key name of the certificate's private key. Usually the same as the certificate name. |
| `/fd <algorithm>` | File digest algorithm: `SHA256`, `SHA384`, or `SHA512`. |
| `/f <file>` | The public certificate file (`.pem` or `.crt`). Use a full path, or run the command from the folder that contains it. |
| `/tr <url>` | RFC 3161 timestamp server. Strongly recommended for every release. |
| `/td <algorithm>` | Timestamp digest. Use the same value as `/fd`. Leave out only if `/tr` is left out. |
| `/v` | Verbose output. |

### Sign several files at once

```cmd
signtool sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f <key-name>.pem /tr http://timestamp.digicert.com /td SHA256 app.exe app.dll setup.msi
```

### Special file types

| File type | What's different |
|---|---|
| Office macros (`.xlsm` and similar) | Install the Office VBA Subject Interface Package (SIP) so SignTool recognizes the file, then use the same command. |
| AppX and MSIX | The `Publisher` in `AppxManifest.xml` must match the certificate subject exactly. Unpack with `makeappx.exe`, edit, repack, and make sure the file isn't read-only before signing. |
| HLK and HCK (`.hlkx`) | Use the same command with a `.pem` certificate, or the Utility Tool, which needs a `.crt` file. |

## Verification

```cmd
signtool verify /pa /v <signed-file>
```

- The output shows the signing certificate and, if timestamped, "The signature is timestamped:" with a date.
- You can also right-click the file, select **Properties > Digital Signatures**, select the signer, and select **Details**.
- Check **Reports > Audit Trail** (category Crypto Operations) for the matching record.

> **Note:** Certificates created with **Self Signed Certificate** are issued by CodeSign Secure's internal CA. Verification reports an untrusted root unless you install that chain. Download **Certificate Chain** from **Signing Tools**, then install the root in **Trusted Root Certification Authorities** and the issuing CA (`intermediate.crt`) in **Intermediate Certification Authorities**. This is expected for test certificates.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Provider can't be found or loaded | KSP not installed, or `/csp` name misspelled | Run `certutil -csplist`. Use the exact provider name. |
| "No certificates were found that met all the given criteria." | `/f` file doesn't match `/kc`, or wrong path | Download the certificate again and check both values. |
| `SignerSign() failed` with `0x80090016` | Wrong key name, certificate inactive or expired, or user not in a mapped team | See [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md). |
| `SignerSign() failed` with `0x8007000B` on AppX or MSIX | Manifest Publisher doesn't match the certificate subject | Fix the Publisher line and repack. |
| Signing waits, then fails after about 100 seconds | Approval needed and nobody approved in time | See [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md). |
| Timestamp server can't be reached | The build machine can't reach the TSA | See [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md). |

For full detail, turn on `EC_SSL_VERBOSE=1` and see [Troubleshooting SignTool and Encryption Consulting KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md).

## Related articles

- [Troubleshooting SignTool and Encryption Consulting KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md)
- [Timestamping for code signing](timestamping-for-code-signing.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
