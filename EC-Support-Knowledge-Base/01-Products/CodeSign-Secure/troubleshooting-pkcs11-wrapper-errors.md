---
title: "Troubleshooting PKCS#11 Wrapper Errors"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later, Encryption Consulting PKCS#11 Wrapper on Windows, Linux, and macOS with jarsigner, apksigner, JSign, OpenSSL, XML signing, and GnuPG"
summary: "Fix PKCS#11 Wrapper errors: provider won't load, EC_INI_FILE_PATH not set, Certificate chain not found, wrong key after renewal, Luna slot, and gpg-agent."
keywords: ["PKCS#11 Wrapper error", "EC_INI_FILE_PATH", "Certificate chain not found for", "jarsigner PKCS11", "ec_pkcs11client.ini", "pkcs11properties.cfg", "CKR_FUNCTION_FAILED", "liblog4cxx"]
last_reviewed: "2026-10-08"
---

# Troubleshooting PKCS#11 Wrapper Errors

This article helps you fix errors from the Encryption Consulting PKCS#11 Wrapper, the library that lets jarsigner, apksigner, JSign, OpenSSL, XML signing tools, and GnuPG sign with keys held in CodeSign Secure. It is for developers and build administrators on Windows, Linux, and macOS.

## Applies to

- CodeSign Secure v3.2.1  and later. Key caching and the `EC_PKCS11_*` variables were added in 3.02.01.
- The PKCS#11 Wrapper downloaded from **Signing Tools** for your operating system.

## How the wrapper is configured

The wrapper needs three things. Most errors come from one of them being missing, wrong, or not visible to the process that signs.

| Item | Purpose | Key settings |
|---|---|---|
| `ec_pkcs11client.ini` | Server address and credentials | `[server_url] url`, `[pfxfile_path] path`, `[pfxfile_passwd] passwd`, `[login_token] username` and `passcode`, `[logconfig_file] name`, optional `[key_filter] label` |
| `EC_INI_FILE_PATH` | Tells the wrapper where the INI file is | Absolute path to `ec_pkcs11client.ini` |
| `pkcs11properties.cfg` | Tells Java tools where the wrapper library is | `library` (absolute path to the `.dll`, `.so`, or `.dylib`), and `slot` for Thales Luna only |

A jarsigner command with the wrapper looks like this:

```bash
jarsigner -keystore NONE -storetype PKCS11 -storepass NONE \
  -providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11properties.cfg \
  -sigalg SHA256withRSA -tsa http://timestamp.digicert.com \
  -signedjar app-signed.jar app.jar <key-label>
```

## Before you start: find the wrapper log

The log is controlled by `EC_PKCS11_CLIENT-LogConfig.xml`, which ships with the wrapper. The `[logconfig_file]` section of `ec_pkcs11client.ini` must point to it with an absolute path. Open the log file it defines and look for the time of your failure.

## Problem: the tool can't load or initialize the PKCS#11 provider

**Symptom.** Java tools report `java.security.ProviderException: Initialization failed` or a similar provider error. Other tools report that the module or library can't be loaded.

**Likely causes and fixes.**

| Cause | Resolution |
|---|---|
| `EC_INI_FILE_PATH` isn't set in this shell | Set it in the **same** shell or job step that signs, then check it with `echo $EC_INI_FILE_PATH` (Linux and macOS) or `echo $env:EC_INI_FILE_PATH` (PowerShell). |
| The variable was set with `setx` on Windows, but the console was already open | `setx` affects new consoles only. Open a new console. |
| The variable was exported, but the tool runs with `sudo` | `sudo` normally drops your environment variables. Run signing as the build user without `sudo`, or pass the variable explicitly. |
| `library` in `pkcs11properties.cfg` points to the wrong file | Use the absolute path to the wrapper library for your operating system: `.dll` on Windows, `.so` on Linux, `.dylib` on macOS. |
| A required system library is missing (Linux) | The wrapper needs the log4cxx libraries. Install `liblog4cxx-dev` (and `liblog4cxx12` where the guide requires it), then check for other missing dependencies with `ldd <path-to-wrapper-library>`. |
| The Java version doesn't match the guide | The product guides use Java 8 to 17 on Linux and macOS, and Java 22 on Windows. Check `java -version` and `JAVA_HOME`. |
| 32-bit and 64-bit mismatch | Use a 64-bit Java runtime or tool with the 64-bit wrapper library. |

## Error: jarsigner "Certificate chain not found for: <alias>"

**Cause.** The alias at the end of the jarsigner command doesn't match the key label of a certificate you can use.

**Resolution.**

1. Use the **key label** of your signing certificate as the alias, for example `EC-Cert-020`.
2. Check that your user is in a team mapped to that certificate. See [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md).
3. If you set `EC_PKCS11_KEY_LABEL` or `[key_filter]`, make sure it names the same key as the alias.

## Problem: the wrong key is used, or a key isn't found after a certificate change

**Symptom.** After a certificate was renewed, replaced, or remapped, signing uses the old key or says the key can't be found.

**Cause.** Since 3.02.01 the wrapper caches the signing key to make repeated signing faster. It decides which key to use in one of three ways: automatic detection from the tool's command line (the default), the `EC_PKCS11_KEY_LABEL` variable, or the `[key_filter]` section of the INI file. The cache or the detection can pick up the wrong key after a change.

**Resolution.**

1. Set `EC_PKCS11_DISABLE_CACHE=1` and sign again to test without the cache.
2. Name the key explicitly with **one** method only: `EC_PKCS11_KEY_LABEL=<key-label>` or `[key_filter] label = <key-label>`.
3. If you always set the label explicitly, set `EC_PKCS11_NO_AUTO_KEY_LABEL=1` to turn off automatic detection.
4. Remember that renewing a CA-issued certificate creates a **new** key with a new label. Update every pipeline that uses it.

| Variable | Values | Default |
|---|---|---|
| `EC_INI_FILE_PATH` | Absolute path to `ec_pkcs11client.ini` (required) | Not set |
| `EC_PKCS11_KEY_LABEL` | The key label to sign with | Not set |
| `EC_PKCS11_NO_AUTO_KEY_LABEL` | `1` turns off automatic key label detection | Detection on |
| `EC_PKCS11_DISABLE_CACHE` | `1` turns off the key cache | Cache on |

## Problem: signing fails when the HSM is a Thales Luna

**Cause.** With a Thales Luna HSM, `pkcs11properties.cfg` needs a `slot` value. Other HSMs don't use it.

**Resolution.** Add the slot number to `pkcs11properties.cfg`, for example `slot=0`, using the slot your administrator gives you.

## Problem: authentication errors

**Cause.** One of the credentials in `ec_pkcs11client.ini` is wrong or expired.

**Resolution.** Check each section:

| Section | Check |
|---|---|
| `[server_url]` | The full address of your CodeSign Secure server, for example `https://codesign.example.com`, including the port if it isn't 443 |
| `[pfxfile_path]` | An absolute path to the client authentication `.pfx` that the build user can read |
| `[pfxfile_passwd]` | The `.pfx` password |
| `[login_token]` | The registered CodeSign Secure username and passcode |

If the `.pfx` passed its **Valid Till** date, generate a new one in **System Setup > User > Generate Authentication Certificate**. For TLS, proxy, and load balancer problems, see [Troubleshooting client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md).

## Error: gpg-agent "Cannot add PKCS#11 provider 'p1': 6-'CKR_FUNCTION_FAILED'"

**Symptom.** When GnuPG uses `gnupg-pkcs11-scd`, the agent reports `Could not load any provider` and `No SmartCard daemon`.

**Resolution.**

1. Check that the wrapper configuration above is complete and visible to the user that runs `gpg-agent`.
2. Restart the agent so it reloads the provider: `pkill gpg-agent`, then run the signing command again.
3. If you see `No key with this keygrip` during key setup, restart `gpg-agent` the same way.
4. For Debian and RPM signing, GnuPG must be fully set up first. See the "GPG2, Debian & RPM Signing" guide in the product documentation.

## Problem: APK or GPG signatures have no timestamp

This is expected. APK signatures don't include timestamps, and GnuPG signatures record their creation time but don't use a Time Stamping Authority. See [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md).

## Protect the INI file

`ec_pkcs11client.ini` holds passwords. Never commit it to source control. Restrict it to the build user:

```bash
chmod 600 /opt/ec/AuthCert.pfx /opt/ec/ec_pkcs11client.ini
chown <build-user> /opt/ec/AuthCert.pfx /opt/ec/ec_pkcs11client.ini
```

In CI/CD, keep the INI file in the platform's secret store. For example, in GitLab create a **File**-type variable named `EC_INI_FILE_PATH` and mark it **Protected**.

## Information to collect for EC support

- Product version, wrapper version, operating system, and Java version (`java -version`).
- The signing tool and the exact command (remove passwords).
- The wrapper log for the time of failure.
- `pkcs11properties.cfg` and `ec_pkcs11client.ini` with **all passwords, passcodes, and usernames removed**.
- The values of the `EC_PKCS11_*` variables.

## Related articles

- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
- [Signing Java JAR files with jarsigner](signing-java-jar-files-with-jarsigner.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Troubleshooting client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md)
- [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md)
