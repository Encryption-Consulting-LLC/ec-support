---
title: "Signing Java JAR Files with jarsigner"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure v3.2.1  and later with jarsigner, through the Encryption Consulting KSP (Windows) or the PKCS#11 Wrapper (Windows, Linux, macOS)"
summary: "Sign JAR files with jarsigner and keys in CodeSign Secure, using the Windows KSP (Windows-MY) or the PKCS#11 Wrapper on Windows, Linux, macOS."
keywords: ["jarsigner", "sign JAR", "PKCS#11 Wrapper", "Windows-MY", "SunPKCS11", "pkcs11properties.cfg", "EC_INI_FILE_PATH", "jarsigner timestamp"]
last_reviewed: "2026-10-08"
---

# Signing Java JAR Files with jarsigner

This article explains how to sign Java Archive (JAR) files with the standard `jarsigner` tool while the private key stays in CodeSign Secure. There are two methods: the Encryption Consulting KSP with the Windows certificate store, and the PKCS#11 Wrapper, which works on Windows, Linux, and macOS. It is for Java developers and build administrators.

## Choose a method

| | Method A: Windows KSP | Method B: PKCS#11 Wrapper |
|---|---|---|
| Operating systems | Windows | Windows, Linux, macOS |
| Keystore type | `Windows-MY` | `PKCS11` |
| Configured with | KSP installer, `EC_Client_Auth`, `EC_Client_Pass`, registry | `ec_pkcs11client.ini`, `pkcs11properties.cfg`, `EC_INI_FILE_PATH` |
| Key is named by | The certificate's "Issued to" name | The certificate's key label |
| Best for | Windows machines that already sign with SignTool | Linux and macOS build agents, and containerized pipelines |

## Applies to

- CodeSign Secure v3.2.1  and later.
- Any `.jar` file. The same steps also work for `.war`, `.ear`, and other JAR-format archives.

## Prerequisites

- A registered CodeSign Secure user whose role has the **CodeSigning Operation** permission and who is in a team mapped to the signing certificate.
- An authentication certificate (`.pfx`) and its password, from **System Setup > User > Generate Authentication Certificate**.
- A Java Development Kit (JDK) with `jarsigner` on the `PATH`.
- Outbound access from the build machine to a Time Stamping Authority (TSA).

## Method A: Windows KSP with the Windows-MY keystore

### Step 1: Set up the KSP

Install and configure the Encryption Consulting KSP as described in [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md), Phases 1 to 3.

### Step 2: Install the certificate and link it to the KSP

1. Download the signing certificate from **Keys and Certificates** (right-click > **Download Certificate**).
2. Open it, select **Install Certificate**, choose **Current User**, select **Place all certificates in the following store**, choose **Personal**, and finish.
3. Open `certmgr.msc`, go to **Personal > Certificates**, open the certificate, and copy its **Thumbprint** from the **Details** tab.
4. Link the certificate to the KSP:

   ```cmd
   certutil -f -repairstore -csp "Encryption Consulting Key Storage Provider" -user "My" <thumbprint>
   ```

### Step 3: Sign the JAR

Pass the certificate's **Issued to** name as the alias:

```cmd
jarsigner -storetype Windows-MY -sigalg SHA256withRSA -tsa http://timestamp.digicert.com <path-to-file.jar> "<Issued to name>"
```

For an ECDSA key, use `-sigalg SHA256withECDSA` (or `SHA384withECDSA`).

## Method B: PKCS#11 Wrapper

### Step 1: Download and configure the wrapper

1. Download the PKCS#11 Wrapper for your operating system from **Signing Tools** and extract it.
2. Edit `ec_pkcs11client.ini`:

   ```ini
   [logconfig_file]
   name = <absolute path to EC_PKCS11_CLIENT-LogConfig.xml>

   [server_url]
   url = https://codesign.example.com

   [pfxfile_path]
   path = <absolute path to the authentication certificate .pfx>

   [pfxfile_passwd]
   passwd = <PFX password>

   [login_token]
   username = <registered CodeSign Secure username>
   passcode = <CodeSign Secure passcode>

   ; Optional, 3.02.01 and later: the key to sign with
   ;[key_filter]
   ;label = EC-Cert-020
   ```

3. Edit `pkcs11properties.cfg` so `library` points to the wrapper library for your operating system:

   ```text
   name = signingmanager
   library = <absolute path to the ec_pkcs11client library (.dll, .so, or .dylib)>
   #slot=0
   attributes = compatibility
   attributes(*, *, *) = {
   CKA_TOKEN=true
   }
   ```

   Remove the `#` from `slot` and set the slot number **only** if your HSM is a Thales Luna.

> **Important:** `ec_pkcs11client.ini` holds passwords. Never commit it to source control, and restrict it to the build user, for example `chmod 600 ec_pkcs11client.ini`.

### Step 2: Set EC_INI_FILE_PATH

The wrapper reads its configuration from the file named in `EC_INI_FILE_PATH`.

```bash
# Linux and macOS: add to ~/.bashrc (or your shell profile), then open a new terminal
export EC_INI_FILE_PATH=/opt/ec/ec_pkcs11client.ini
echo $EC_INI_FILE_PATH
```

```powershell
# Windows: persistent; open a new console afterwards
setx EC_INI_FILE_PATH "C:\PKCS11_Wrapper-Windows\ec_pkcs11client.ini"
```

### Step 3: Install the platform requirements

| Platform | Java | Other |
|---|---|---|
| Linux (Ubuntu) | Java 8 to 17, for example `sudo apt install openjdk-17-jdk`, set as active with `sudo update-alternatives --config java` | `sudo apt-get install liblog4cxx-dev` (and `liblog4cxx12` if your guide requires it) |
| macOS | Java 8 to 17 | Set `JAVA_HOME` and `PATH` to the Java bin folder |
| Windows | Java 22 | Add the Java bin folder to `PATH` |

### Step 4: Sign the JAR

Use the certificate's **key label** as the alias:

```bash
jarsigner -keystore NONE -storetype PKCS11 -storepass NONE \
  -providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11properties.cfg \
  -sigalg SHA256withRSA -tsa http://timestamp.digicert.com \
  -signedjar app-signed.jar app.jar <key-label>
```

### Option reference

| Option | Purpose |
|---|---|
| `-keystore NONE` | Required for PKCS#11: there is no keystore file. |
| `-storetype PKCS11` | Use the PKCS#11 keystore type. |
| `-storepass NONE` | The wrapper authenticates with the values in `ec_pkcs11client.ini`. |
| `-providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11properties.cfg` | Load the SunPKCS11 provider with the wrapper configuration. |
| `-sigalg` | Signature algorithm, for example `SHA256withRSA` or `SHA256withECDSA`. |
| `-tsa <url>` | RFC 3161 TSA URL. |
| `-signedjar <file>` | Write the signed JAR to a new file. |

### Key label and caching (3.02.01 and later)

The wrapper caches the signing key for faster repeated signing, and by default reads the key label from the command line (the alias). Use **one** of these methods to name the key:

| Method | How |
|---|---|
| Automatic detection (default) | The alias at the end of the jarsigner command |
| Environment variable | `EC_PKCS11_KEY_LABEL=<key-label>` |
| INI file | `[key_filter]` with `label = <key-label>` |

Set `EC_PKCS11_NO_AUTO_KEY_LABEL=1` to stop automatic detection, or `EC_PKCS11_DISABLE_CACHE=1` to test without the cache after a certificate change.

### Maven and Gradle

Build tools that call jarsigner, such as the Maven Jarsigner Plugin, can pass the same options: keystore `NONE`, store type `PKCS11` with the provider arguments for Method B, or store type `Windows-MY` for Method A. Make sure `EC_INI_FILE_PATH` (Method B) or the KSP settings (Method A) are visible to the build process.

## Verification

```bash
jarsigner -verify -verbose -certs <signed-file.jar>
```

The output should end with `jar verified.` and show "Timestamped by" if you used `-tsa`. Also check **Reports > Audit Trail** for the matching record.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `java.security.ProviderException` or the provider can't load (Method B) | `EC_INI_FILE_PATH` not set in this shell, or wrong `library` path | Set the variable in the same shell and check the path. See [Troubleshooting PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md). |
| `Certificate chain not found for: <alias>` | The alias isn't the key label (Method B), or the certificate isn't linked to the KSP (Method A) | Use the key label as the alias, or run `certutil -repairstore` again. |
| Signing fails only with Thales Luna (Method B) | `slot` missing from `pkcs11properties.cfg` | Add the slot number. |
| `No -tsa or -tsacert is provided and this jar is not timestamped` | Timestamp option left out | Sign again with `-tsa <url>`. |
| Connection or timeout errors with `-tsa` | Java can't reach the TSA through the proxy | Add `-J-Dhttp.proxyHost=<proxy> -J-Dhttp.proxyPort=<port>`. |
| Signing waits, then fails after about 100 seconds | Approval needed and nobody approved in time | See [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md). |

## Related articles

- [Troubleshooting PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md)
- [Timestamping for code signing](timestamping-for-code-signing.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
