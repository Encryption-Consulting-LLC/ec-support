---
title: "Signing Java JAR Files with jarsigner"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure with Oracle or OpenJDK jarsigner (Java 8, Java 11, Java 17, Java 21) using the SunPKCS11 provider"
summary: "How to sign Java JAR files with jarsigner and the SunPKCS11 provider so keys stay in the HSM through CodeSign Secure, with timestamping and verification."
keywords: ["jarsigner PKCS11", "sign JAR", "SunPKCS11", "CodeSign Secure Java", "jarsigner timestamp"]
last_reviewed: "2026-10-06"
---

# Signing Java JAR Files with jarsigner

This article explains how to sign Java Archive (JAR) files with the standard `jarsigner` tool while the private key is protected by CodeSign Secure. It uses the Java SunPKCS11 provider to reach the key through a PKCS#11 library. It is for Java developers and build administrators.

## Overview

`jarsigner` is part of every Java Development Kit (JDK). It can use keys stored in a hardware token by treating the token as a keystore of type `PKCS11`. The SunPKCS11 provider loads a native PKCS#11 library. When that library is the CodeSign Secure PKCS#11 library, signing requests go to CodeSign Secure, which applies policy and signs in the Hardware Security Module (HSM).

## Applies to

- JDK 8 and JDK 9 or later (the command differs slightly, see Phase 2).
- Linux, macOS, and Windows build agents.
- CodeSign Secure PKCS#11 library: `<path to CodeSign Secure PKCS#11 library>`, shown in the client installer.

## Prerequisites

- JDK installed, with `jarsigner` and `keytool` on the PATH.
- CodeSign Secure client and PKCS#11 library installed and configured (`<CodeSign Secure client configuration file>`, provided by EC).
- A code signing key and certificate in CodeSign Secure, with permission for the build identity to use it.
- A Time Stamping Authority (TSA) URL from the certificate issuer.

## Before starting

- Use a 64-bit JDK with a 64-bit PKCS#11 library. A mismatch stops the library from loading.
- Prefer SHA-256 or stronger (`-digestalg SHA-256`, `-sigalg SHA256withRSA` or `SHA256withECDSA`).
- Keep the token PIN or credential out of scripts. Use the CI/CD secret store.

## Procedure

### Phase 1: Create the SunPKCS11 configuration file

Create a text file, for example `pkcs11.cfg`:

```text
name = CodeSignSecure
library = <path-to-codesign-secure-pkcs11-library>
slot = <slot-number>
```

Use `slotListIndex` instead of `slot` if slot numbers are not fixed. The `name` value becomes part of the provider name (`SunPKCS11-CodeSignSecure`).

### Phase 2: List the keys in the token

**JDK 9 and later:**

```bash
keytool -list -keystore NONE -storetype PKCS11 \
  -addprovider SunPKCS11 -providerArg pkcs11.cfg
```

**JDK 8:**

```bash
keytool -list -keystore NONE -storetype PKCS11 \
  -providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11.cfg
```

Enter the token PIN when asked. Note the alias of the signing key.

### Phase 3: Sign the JAR

**JDK 9 and later:**

```bash
jarsigner -keystore NONE -storetype PKCS11 \
  -addprovider SunPKCS11 -providerArg pkcs11.cfg \
  -storepass:env CSS_PIN \
  -digestalg SHA-256 -sigalg SHA256withRSA \
  -tsa <tsa-url> \
  -signedjar <output-signed.jar> <input.jar> <key-alias>
```

**JDK 8:**

```bash
jarsigner -keystore NONE -storetype PKCS11 \
  -providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11.cfg \
  -storepass:env CSS_PIN \
  -digestalg SHA-256 -sigalg SHA256withRSA \
  -tsa <tsa-url> \
  -signedjar <output-signed.jar> <input.jar> <key-alias>
```

> **Tip:** `-storepass:env CSS_PIN` reads the PIN from the environment variable `CSS_PIN` so it does not appear in the process list or build logs. Set the variable from the CI/CD secret store.

For an Elliptic Curve (EC) key, use `-sigalg SHA256withECDSA` or `SHA384withECDSA`.

### Phase 4: Option reference

| Option | Purpose |
|---|---|
| `-keystore NONE` | Required for PKCS#11 tokens: there is no keystore file. |
| `-storetype PKCS11` | Use the PKCS#11 keystore type. |
| `-addprovider SunPKCS11 -providerArg <cfg>` | Load and configure the SunPKCS11 provider (JDK 9 and later). |
| `-providerClass sun.security.pkcs11.SunPKCS11 -providerArg <cfg>` | Same, for JDK 8. |
| `-tsa <url>` | RFC 3161 TSA URL. |
| `-digestalg`, `-sigalg` | Digest and signature algorithms. |
| `-signedjar <file>` | Write the signed JAR to a new file. |

### Phase 5: Maven and Gradle

The Maven Jarsigner Plugin (`maven-jarsigner-plugin`) and Gradle tasks can call the same options. Set `storetype` to `PKCS11`, `keystore` to `NONE`, and pass the provider arguments. For Maven, add the provider options through the plugin `arguments` setting.

## Verification

```bash
jarsigner -verify -verbose -certs <output-signed.jar>
```

The output should end with "jar verified." and show the signer certificate and a timestamp. Check the CodeSign Secure audit log for the matching record.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `java.security.ProviderException: Initialization failed` | Library path wrong or 32-bit and 64-bit mismatch | Fix `library` in `pkcs11.cfg`. Use a 64-bit JDK. |
| `keytool error: java.lang.Exception: Alias <x> does not exist` | Wrong alias or no permission for the key | Run Phase 2 again. Check the signing policy. |
| `CKR_PIN_INCORRECT` or login failure | Wrong credential | Check the secret value. Watch for lockout. |
| "This jar contains entries whose certificate chain is invalid" | Chain not trusted by the verifying JDK | Add intermediate certificates, or import the root into the verifier truststore for internal CAs. |
| "No -tsa or -tsacert is provided" warning | Timestamp missing | Add `-tsa <tsa-url>`. |
| Signing hangs | Pending approval or network block | Check approvals and network access to CodeSign Secure. |

## Related articles

- [Timestamping for code signing](timestamping-for-code-signing.md)
- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
