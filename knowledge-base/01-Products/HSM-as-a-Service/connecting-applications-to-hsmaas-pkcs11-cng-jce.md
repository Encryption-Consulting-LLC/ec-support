---
title: "Connecting Applications to HSMaaS: PKCS#11, CNG, and JCE"
category: "Products"
section: "HSM-as-a-Service"
article_type: "How-to"
applies_to: "Encryption Consulting HSMaaS; Thales Luna Client 10.x; Entrust nShield Security World 12.x and 13.x; AWS CloudHSM Client SDK 5; Windows Server and Linux; Java 8 and later"
summary: "How to connect applications to EC HSMaaS through PKCS#11 libraries, Microsoft CNG Key Storage Providers, and Java JCE providers for Luna, nShield, and CloudHSM."
keywords: ["PKCS#11 library path", "CNG KSP HSM", "LunaProvider JCE", "nCipherKM provider", "CloudHSM JCE"]
last_reviewed: "2026-10-06"
---

# Connecting Applications to HSMaaS: PKCS#11, CNG, and JCE

This article shows how to point an application at an Encryption Consulting (EC) HSM-as-a-Service (HSMaaS) Hardware Security Module (HSM). It covers the three standard interfaces: PKCS#11, Microsoft Cryptography API: Next Generation (CNG) Key Storage Providers (KSPs), and Java Cryptography Architecture and Extension (JCA/JCE) providers. It is for application administrators and developers.

## Overview

| Interface | Used by | What to configure |
|---|---|---|
| PKCS#11 (Cryptoki, OASIS standard) | OpenSSL providers, NGINX, Apache, databases, signing tools, most Linux apps | Library path, slot or token label, user PIN |
| CNG KSP | Windows apps: AD CS, IIS, SQL Server, SignTool, certreq | Register the KSP and its slots or modules |
| JCA/JCE | Java apps, Tomcat, jarsigner, keytool | Provider jar, native library, `java.security` entry, keystore type |

## Applies to

Client servers already connected to the HSM as described in [Onboarding to HSMaaS](onboarding-to-hsmaas.md). Paths below are vendor defaults. Verify against the vendor documentation for the installed version.

## Prerequisites

- HSM client installed and connected (a Luna slot, an nShield module in `enquiry`, or a CloudHSM cluster reachable).
- Application role credentials from EC (Luna Crypto Officer password, nShield Operator Card Set (OCS) or softcard passphrase, or CloudHSM crypto user).
- Administrator or root rights on the server.
- For tests on Linux: OpenSC `pkcs11-tool`.

## Before starting

- Do not paste HSM passwords into command history. Use prompts or a secrets manager.
- Test with a throwaway key label (for example `ec-test-key`) and delete it afterwards.
- Confirm whether the application needs HA. If so, use the HA slot (Luna) or load sharing (nShield). See [HSMaaS high availability and backup](hsmaas-high-availability-and-backup.md).

## Procedure

### Part A: PKCS#11

1. Find the library for the platform:

| Platform | Linux library | Windows library |
|---|---|---|
| Thales Luna | `/usr/safenet/lunaclient/lib/libCryptoki2_64.so` | `C:\Program Files\SafeNet\LunaClient\cryptoki.dll` |
| Luna Cloud HSM | `libs/64/libCryptoki2.so` in the unpacked service client folder | `cryptoki.dll` in the unpacked folder |
| Entrust nShield | `/opt/nfast/toolkits/pkcs11/libcknfast.so` | `C:\Program Files\nCipher\nfast\toolkits\pkcs11\cknfast.dll` |
| AWS CloudHSM SDK 5 | `/opt/cloudhsm/lib/libcloudhsm_pkcs11.so` | `C:\Program Files\Amazon\CloudHSM\lib\cloudhsm_pkcs11.dll` |

2. List slots to confirm the library loads:

```bash
pkcs11-tool --module <library_path> --list-slots
```

3. Create and list a test key:

```bash
pkcs11-tool --module <library_path> --login --keypairgen --key-type rsa:3072 --label ec-test-key
pkcs11-tool --module <library_path> --login --list-objects
```

4. Set the same library path, slot (or token label), and PIN in the application configuration.
5. For nShield, set PKCS#11 options in `/opt/nfast/cknfastrc` (Linux) or as environment variables. A common one is `CKNFAST_LOADSHARING=1`, which presents all modules in the Security World as one slot.

### Part B: Microsoft CNG KSP (Windows)

1. Register the provider.
   - **Luna:** run `KspConfig.exe` from `C:\Program Files\SafeNet\LunaClient\KSP\`. Use **Register Or View Security Library**, then **Register HSM Slots** for the service account and for `NT AUTHORITY\SYSTEM` if a service runs as SYSTEM. The provider name is "SafeNet Key Storage Provider".
   - **nShield:** run the CNG configuration wizard from the Security World software. The provider name is "nCipher Security World Key Storage Provider".
   - **AWS CloudHSM SDK 5:** install the KSP package and store crypto user credentials with `set_cloudhsm_credentials.exe`. The provider name is "CloudHSM Key Storage Provider".
2. Confirm the provider is registered:

```cmd
certutil -csplist
certutil -csptest -csp "<Provider Name>"
```

3. Use the provider name in the application. For example, in an `.inf` file for `certreq`:

```text
[NewRequest]
Subject = "CN=<host.contoso.com>"
KeyLength = 3072
Exportable = FALSE
MachineKeySet = TRUE
ProviderName = "<Provider Name>"
```

```cmd
certreq -new request.inf request.csr
```

4. For AD CS, select the KSP during CA setup. See [Configuring AD CS with an HSM KSP](../../04-Featured-Articles/HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md).

### Part C: Java JCA/JCE

1. Add the provider jar and native library to the Java runtime:

| Platform | Provider class | Jar and native library |
|---|---|---|
| Thales Luna | `com.safenetinc.luna.provider.LunaProvider` | `LunaProvider.jar` and `libLunaAPI.so` (or `LunaAPI.dll`) in `<LunaClient>/jsp/lib` |
| Entrust nShield | `com.ncipher.provider.km.nCipherKM` | `nCipherKM.jar` and related jars in `/opt/nfast/java/classes` |
| AWS CloudHSM SDK 5 | `com.amazonaws.cloudhsm.jce.provider.CloudHsmProvider` | `cloudhsm-<version>.jar` in `/opt/cloudhsm/java` |

2. Put the jars on the classpath (Java 9 and later) and the native library on `java.library.path`.
3. Register the provider in `<JAVA_HOME>/conf/security/java.security` (Java 9 and later) or `<JAVA_HOME>/jre/lib/security/java.security` (Java 8). Add it after the existing entries with the next free number:

```text
security.provider.<n>=com.safenetinc.luna.provider.LunaProvider
```

4. Use the vendor keystore type:
   - Luna: keystore type `Luna`. The keystore file contains one line such as `slot:0` or `tokenlabel:<partition_label>`.
   - nShield: keystore type `nCipher.sworld`.
   - CloudHSM: keystore type `CloudHSM`, with credentials from `HSM_USER` and `HSM_PASSWORD` environment variables or system properties.
5. Test with keytool (Luna example):

```bash
keytool -list -storetype Luna -keystore <luna_keystore_file>
```

## Verification

- PKCS#11: `pkcs11-tool --list-objects` shows `ec-test-key`.
- CNG: `certutil -csptest` completes without errors, and `certutil -key -csp "<Provider Name>"` lists keys.
- JCE: `keytool -list` with the vendor store type returns entries without a provider error.
- Delete the test key when done.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `CKR_TOKEN_NOT_PRESENT` or no slots | Client not connected to HSM | Recheck NTLS, hardserver, or CloudHSM config |
| `CKR_PIN_INCORRECT` | Wrong role password | Confirm the role (Crypto Officer versus Crypto User) and password |
| `CKR_USER_NOT_LOGGED_IN` | App did not log in or session closed | Set PIN in app config; check session handling |
| CNG: "Provider type not defined" or KSP missing | KSP not registered for that account | Register slots for the service account or SYSTEM |
| Java: `NoSuchProviderException` | Provider not in `java.security` or jar missing | Check classpath and provider entry |
| Java: `UnsatisfiedLinkError` | Native library not found | Set `java.library.path` to the vendor library folder |
| nShield: key not found on second module | Load sharing off | Set `CKNFAST_LOADSHARING=1` |

## Related articles

- [Onboarding to HSMaaS](onboarding-to-hsmaas.md)
- [HSMaaS high availability and backup](hsmaas-high-availability-and-backup.md)
- [HSMaaS FAQ](hsmaas-faq.md)
- [Configuring AD CS with an HSM KSP](../../04-Featured-Articles/HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md)
- [CodeSign Secure prerequisites and HSM integration](../CodeSign-Secure/codesign-secure-prerequisites-and-hsm-integration.md)
