---
title: "Troubleshooting SignTool and Encryption Consulting KSP Errors"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later with the Encryption Consulting KSP and Microsoft SignTool on Windows 10 and Windows 11"
summary: "Fix SignTool errors with the EC KSP: provider not found, no certificates found, SignerSign() failed 0x80090016 and 0x8007000B, and KSP auth errors."
keywords: ["SignTool error", "No certificates were found that met all the given criteria", "SignerSign() failed", "0x80090016", "NTE_BAD_KEYSET", "0x8007000B", "Encryption Consulting Key Storage Provider", "EC_SSL_VERBOSE"]
last_reviewed: "2026-10-08"
---

# Troubleshooting SignTool and Encryption Consulting KSP Errors

This article helps you fix errors that appear when Microsoft SignTool signs a file through the Encryption Consulting Key Storage Provider (KSP). Each section starts with the exact error text, so you can search for the message you see. It is for release engineers, build administrators, and anyone running SignTool against CodeSign Secure.

## Applies to

- CodeSign Secure v3.2.1  and later.
- The Encryption Consulting KSP (downloaded from **Signing Tools** as "Encryption Consulting CNG-SigningKSP"), tested on Windows 10 and Windows 11.
- SignTool from the Windows SDK, and other Windows tools that use the same KSP: Mage, NuGet, Visual Studio ClickOnce, and jarsigner with the `Windows-MY` keystore.

## How a KSP signing works

Knowing the moving parts makes errors much easier to place:

1. SignTool loads the provider named in `/csp`. This must be exactly `"Encryption Consulting Key Storage Provider"`.
2. The KSP reads its settings from two places: the environment variables `EC_Client_Auth` and `EC_Client_Pass` (the client authentication certificate), and the registry key `Computer\HKEY_CURRENT_USER\Software\Encryption Consulting\SigningKSP` (username, code, identity type, API base URL, and `ectoken`).
3. The KSP connects to CodeSign Secure with mutual TLS, authenticates, and asks to sign the file hash with the key named in `/kc`.
4. CodeSign Secure checks your role, team mapping, and the certificate's environment policy, then the Hardware Security Module (HSM) signs the hash.
5. SignTool embeds the signature and, if `/tr` is given, gets a timestamp from the Time Stamping Authority (TSA).

A reference command looks like this:

```cmd
signtool sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f <key-name>.pem /tr http://timestamp.digicert.com /td SHA256 <file-to-sign>
```

## Before you start: turn on KSP debugging

Most KSP problems explain themselves once verbose output is on. Do this before anything else.

1. Set the system environment variable `EC_SSL_VERBOSE` to `1`.
2. Open a **new** command prompt. Existing windows do not see changed environment variables.
3. Run the same SignTool command again and read the debugging output.
4. For more detail, open `rolling-ecksp.log` in `C:\ProgramData\Encryption Consulting\SigningKSP`. The log settings are in `ECKSP-LogConfig.xml` in the same folder.
5. Set `EC_SSL_VERBOSE` back to `0` when you finish.

> **Tip:** Also check **Reports > Audit Trail** and the **Logs** page in the portal. If there is no record of your request, the problem is on the build machine or the network. If there is a record, the server received it and the entry usually names the reason it failed.

## Error: the provider can't be found or loaded

**Symptom.** SignTool reports that the cryptographic provider in `/csp` can't be found, can't be loaded, or isn't valid.

**Cause.** The KSP isn't installed on this machine, or the name after `/csp` doesn't match the registered name.

**Resolution.**

1. Check that the provider is registered:

   ```cmd
   certutil -csplist | findstr /i "Encryption Consulting"
   ```

2. If nothing is listed, install the KSP from **Signing Tools** with administrator rights.
3. Copy the provider name exactly, including spaces, inside double quotes: `"Encryption Consulting Key Storage Provider"`.
4. Use 64-bit SignTool from the `x64` folder of the Windows SDK, for example `C:\Program Files (x86)\Windows Kits\10\bin\<sdk-version>\x64\signtool.exe`.

## Error: "SignTool Error: No certificates were found that met all the given criteria."

**Symptom.** SignTool stops before contacting CodeSign Secure with this message.

**Cause.** SignTool couldn't match a certificate to a usable private key. With the KSP this is almost always one of these:

- The file in `/f` isn't the current certificate for the key in `/kc`, for example an old copy kept after a renewal.
- The `/f` path or the `/kc` key name is wrong. The docs' examples assume the `.pem` file is in the folder you run the command from.
- You selected a certificate from the Windows store (with `/sha1` or `/n`), but the store entry isn't linked to the KSP.

**Resolution.**

1. Download the certificate again from **Keys and Certificates** (right-click the certificate > **Download Certificate**). The download contains the public certificate only.
2. Pass the full path to it in `/f`, and use the matching key name in `/kc`. The key name is usually the same as the certificate name.
3. If you sign with a certificate from the Windows store, link it to the KSP first:

   ```cmd
   certutil -f -repairstore -csp "Encryption Consulting Key Storage Provider" -user "My" <certificate-thumbprint>
   ```

4. After a CA-issued certificate is renewed, remember that the renewal created a **new key**. Update both `/kc` and `/f` in every script and pipeline. See [Key and certificate renewal problems](troubleshooting-certificate-access-and-permission-issues.md).

## Error: "SignerSign() failed" with 0x80090016 (NTE_BAD_KEYSET)

**Symptom.** SignTool prints `SignTool Error: An unexpected internal error has occurred.` followed by `Error: SignerSign() failed.` and the code `0x80090016` (decimal `-2146893802`).

**Cause.** The KSP reached CodeSign Secure but couldn't use the key. Common reasons:

- The `/kc` name doesn't match any key you can use.
- The certificate is **Inactive** or **Expired** in **Keys and Certificates**.
- Your user isn't a member of a team that is mapped to this certificate in **App Management**, or the application is deactivated.
- Your role doesn't have the **CodeSigning Operation** permission.

**Resolution.** Work through [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md). It covers each check in order.

## Error: "SignerSign() failed" with 0x8007000B when signing AppX or MSIX

**Symptom.** Signing an `.appx` or `.msix` package fails with `0x8007000B` (`ERROR_BAD_FORMAT`). Ordinary `.exe` files sign without problems.

**Cause.** The `Publisher` attribute in the package's `AppxManifest.xml` doesn't match the subject of the signing certificate exactly. Windows requires the two to be identical.

**Resolution.**

1. Unpack the package with `makeappx.exe unpack`.
2. Set `Publisher` in `AppxManifest.xml` to the certificate subject. Start with `CN=`, and use `S=` instead of `ST=` for the state.
3. Repack it with `makeappx.exe pack`, make sure the file is **not** read-only, and sign again.

The same mismatch also causes installation of the signed package to fail. See the "AppX & MSIX" signing guide in the product documentation for the full procedure.

## Error: TLS or authentication errors in the verbose output

**Symptom.** With `EC_SSL_VERBOSE=1`, the output shows a TLS handshake failure, a certificate error, or an authentication failure.

**Cause.** The client authentication certificate isn't usable. Typical reasons:

- `EC_Client_Auth` points to a missing or wrong `.pfx` file.
- `EC_Client_Pass` doesn't match that file's password.
- The authentication certificate passed its **Valid Till** date.
- A proxy between the build machine and the server inspects TLS traffic. Inspection breaks mutual TLS.

**Resolution.**

1. Check that the `.pfx` file exists at the path in `EC_Client_Auth` and that the build account can read it.
2. Confirm the password. If unsure, generate a new authentication certificate in **System Setup > User > Generate Authentication Certificate**.
3. Open a new command prompt, or restart the build agent service, so it reads the new values.
4. For proxy, DNS, and portal certificate problems, see [Troubleshooting client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md).

## Error: authentication fails although EC_Client_Auth and EC_Client_Pass are correct

**Symptom.** The authentication certificate and password are valid, but signing still fails to authenticate.

**Cause.** One of the settings in the registry is wrong, or the `ectoken` has expired. The registry key holds the values you entered during installation (Username, Code, Identity Type, API Base URL) and the `ectoken`.

**Resolution.**

1. Open Registry Editor and go to `Computer\HKEY_CURRENT_USER\Software\Encryption Consulting\SigningKSP`.
2. Check each value:

   | Value | Should be |
   |---|---|
   | Username | The CodeSign Secure user this machine signs as |
   | Code | The CodeSign Secure activation code set during setup |
   | Identity Type | `1` |
   | API Base URL | `https://<your-domain>/api/`, ending with `/api/`. Include the port if it isn't 443, for example `https://<your-domain>:8443/api/` |
   | ectoken | A current token from CodeSign Secure |

3. If the token expired, set a new `ectoken`. For a token with a custom expiry, use **System Setup > User > Generate API Key** (30, 60, or 90 days).
4. Open a new command prompt and test again.

## Problem: signing works for my account but fails in the build agent

**Symptom.** SignTool works when you run it interactively, but the same command fails in Jenkins, GitHub Actions, Azure DevOps, GitLab, TeamCity, or Bamboo.

**Cause.** The KSP settings are per Windows account. The registry key sits under `HKEY_CURRENT_USER`, so it applies only to the account that ran the installer. A build agent service running as another account, including built-in accounts such as Local System, does not see your settings. Environment variables set for your user account are not visible to it either.

**Resolution.**

1. Run the agent service under a dedicated build account.
2. Configure the same registry values for that account, and set `EC_Client_Auth` and `EC_Client_Pass` as system variables or for that account.
3. Store the `.pfx` file in a folder only that account can read.
4. Restart the agent service so new jobs pick up the changes.

> **Note:** Hosted, short-lived agents would need the KSP installed in every job. Use self-hosted agents for KSP signing. For unattended installation options, contact EC support.

## Problem: signing waits, then fails after about 100 seconds

The certificate's environment requires approval, and nobody approved in time. See [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md).

## Problem: the file is signed but has no timestamp, or the timestamp step fails

See [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md).

## Error: "SignTool Error: No file digest algorithm specified."

**Cause.** Recent Windows SDK versions of SignTool require `/fd`.

**Resolution.** Add `/fd SHA256`. CodeSign Secure accepts `SHA256`, `SHA384`, or `SHA512`. Use the same value for `/td`.

## Information to collect for EC support

If these steps don't fix the problem, open a case and include:

- The product version (hover over the version in the profile menu) and the KSP version.
- The Windows version and the SignTool path and version.
- The exact command (remove passwords) and the full output with `EC_SSL_VERBOSE=1`.
- `rolling-ecksp.log` from `C:\ProgramData\Encryption Consulting\SigningKSP`.
- The time of the failure with its time zone, and the key name.
- If you are a System Admin, a support package from **Profile > Maintenance > Support Packages**.

> **Warning:** Never send the `.pfx` file, its password, the activation code, or the `ectoken` to support.

## Related articles

- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
- [Troubleshooting client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md)
- [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md)
- [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md)
- [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md)
