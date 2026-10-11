---
title: "CodeSign Secure Error Message Index"
category: "Products"
section: "CodeSign Secure"
article_type: "Reference"
applies_to: "CodeSign Secure v3.2.1  and later, all signing clients and the portal"
summary: "Look up a CodeSign Secure, SignTool, jarsigner, PKCS#11, codesign, or Azure AD error message to find its most likely cause and the article that fixes it."
keywords: ["CodeSign Secure error", "SignTool error list", "SignerSign() failed", "0x80090016", "0x8007000B", "Certificate chain not found", "errSecInternalComponent", "AADSTS50011", "code signing error codes"]
last_reviewed: "2026-10-08"
---

# CodeSign Secure Error Message Index

This page lists error messages and symptoms seen with CodeSign Secure, grouped by where they appear. Find your message, read the most likely cause, and follow the link to the article with the full fix. It is for anyone who signs with CodeSign Secure or supports people who do.

> **Tip:** Search this page for a distinctive part of the message, such as the error code (`0x80090016`) or a few exact words. Messages can vary slightly between tool versions.

## Applies to

CodeSign Secure v3.2.1  and later.

## Start here: is it the client, the server, or the HSM?

1. **Check the Audit Trail and Logs** in the portal. No record of your request means the problem is on the build machine or the network.
2. **Check HSM Health Check** on the Dashboard. If it shows Inactive, every signing fails. Fix that first.
3. **Turn on client debugging**: `EC_SSL_VERBOSE=1` for the Windows KSP, or the wrapper log for the PKCS#11 Wrapper.

## SignTool and the Windows KSP

| Message or symptom | Most likely cause | Go to |
|---|---|---|
| The provider in `/csp` can't be found or loaded | KSP not installed, or the provider name is misspelled | [SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) |
| `SignTool Error: No certificates were found that met all the given criteria.` | The `/f` certificate doesn't match the `/kc` key, or a path or name is wrong | [SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) |
| `SignerSign() failed` with `0x80090016` (`NTE_BAD_KEYSET`, `-2146893802`) | Wrong key name, certificate inactive or expired, or user not in a mapped team | [Certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md) |
| `SignerSign() failed` with `0x8007000B` on AppX or MSIX | Manifest `Publisher` doesn't match the certificate subject | [SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) |
| `SignTool Error: No file digest algorithm specified.` | `/fd` missing | [SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) |
| TLS or authentication errors in verbose output | `EC_Client_Auth` or `EC_Client_Pass` wrong, or authentication certificate expired | [Client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md) |
| Authentication fails with correct `EC_Client_Auth` and `EC_Client_Pass` | Wrong registry setting, or expired `ectoken` | [SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) |
| Works interactively, fails in the build agent | KSP settings are per Windows account | [SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) |
| Signing waits, then fails after about 100 seconds | Approval needed and nobody approved in time | [Signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md) |
| `The specified timestamp server either could not be reached or returned an invalid response.` | Build machine can't reach the TSA | [Timestamping errors](troubleshooting-timestamping-errors.md) |

## PKCS#11 Wrapper (jarsigner, apksigner, JSign, OpenSSL, XML, GnuPG)

| Message or symptom | Most likely cause | Go to |
|---|---|---|
| `java.security.ProviderException: Initialization failed` or "can't load provider" | `EC_INI_FILE_PATH` not set in this shell, or wrong `library` path | [PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| `java.io.IOException: load failed` or unable to read PKCS11 store | Check the log file for a detailed error message. Could be an inactive or non-existent cert label | [PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| `Certificate chain not found for: <alias>` | The alias isn't the certificate's key label | [PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| Wrong key used, or key not found after a certificate change | Key cache or automatic label detection | [PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| `Cannot add PKCS#11 provider 'p1': 6-'CKR_FUNCTION_FAILED'` | `gpg-agent` can't load the provider | [PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| `No key with this keygrip` | Stale `gpg-agent` | [PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| Signing fails only with a Thales Luna HSM | `slot` missing from `pkcs11properties.cfg` | [PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| `No -tsa or -tsacert is provided and this jar is not timestamped` | `-tsa` missing | [Timestamping errors](troubleshooting-timestamping-errors.md) |
| jarsigner connection or timeout errors with `-tsa` | Java proxy not set | [Timestamping errors](troubleshooting-timestamping-errors.md) |

## macOS and containers

| Message or symptom | Most likely cause | Resolution |
|---|---|---|
| `errSecInternalComponent` from `codesign` | `codesign` can't reach the signing identity, common in CI sessions | Recheck the EC KSP for Mac setup, allow `ECCssProvider.app` access to the authentication certificate's key in Keychain Access, and unlock the keychain in CI sessions. See the "Apple Signing" guide in the product documentation. |
| `codesign` can't build the chain for an OV or EV certificate | macOS doesn't include the full chain by default | Import the complete certificate chain into Keychain Access. |
| Kubernetes rejects an image | The admission webhook blocks unsigned images | Expected. Sign the image first with ec-signer. See [Signing container images](signing-container-images.md). |

## Portal and server

| Message or symptom | Most likely cause | Go to |
|---|---|---|
| HSM Health Check shows **Inactive** | Server can't reach the HSM, or the HSM client isn't working | [HSM Health Check Inactive](troubleshooting-hsm-health-check-inactive.md) |
| Browser shows a certificate warning | Portal still uses the self-signed certificate, or the chain is incomplete | [Client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md) |
| Portal doesn't load | Apache service stopped, or DNS points elsewhere | [Client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md) |
| Signed out unexpectedly | One session per account; signing in elsewhere revokes older sessions | [Client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md) |
| Page shows an error right after connecting a plugin | The server restarts after a plugin connects | Wait a few seconds and refresh. Signing requests in progress at that moment fail. |
| Emails or MFA codes don't arrive | No active SMTP configuration or email template | [Signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md) |
| Approver sees **Requires MFA** instead of Approve and Deny | The environment needs MFA (expected) | [Signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md) |
| Approver doesn't see the request | Not eligible, wrong role, or the table wasn't refreshed | [Signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md) |
| Certificate missing from the team mapping list | Certificate has no environment | [Certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md) |
| An environment can't be selected | Environment is inactive | [Certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md) |
| A new user can't do anything | Role has no permissions enabled | [Certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md) |
| The portal SSL/TLS certificate can't be renewed | Renew works only for the bundled self-signed certificate | Generate a new CSR and import the new certificate. |
| A user can't be deleted | A replacement user is required | Choose a replacement user. |
| Hash validation failed | The artifact doesn't match the trusted rebuild | Check the signing project's repository and branch, and see the "Hash Validation" guide in the product documentation. |

## Azure AD (Microsoft Entra ID) sign-in

| Message | Cause | Resolution |
|---|---|---|
| `AADSTS50011` | Redirect URIs in the app registration don't match the portal address | Check both redirect URIs, including the trailing `/`. |
| `AADSTS7000215` | The Secret Key field holds the secret ID or a mistyped value | Paste the secret **Value** into Secret Key. |
| `AADSTS7000222` | The client secret expired | Rotate the client secret, then restart Apache Monitor if sign-in still fails. |
| `AADSTS65001` | Admin consent wasn't granted | Select **Grant admin consent** on the API permissions page. |

## Not an error, but often reported

| Observation | Explanation |
|---|---|
| Windows shows "Windows protected your PC" for a correctly signed file | SmartScreen reputation, not a signing failure. EV certificates no longer bypass it. See [Code signing myths and misconceptions](../../02-General/Code-Signing/code-signing-myths-and-misconceptions.md). |
| An APK or GPG signature has no timestamp | These formats don't support TSA timestamps. |
| Dashboard still shows HSM Inactive after a fix | The status is cached for up to 10 minutes. Do a hard refresh or Apache restart. |
| A request was signed without approval | The environment is No Approval or shows No Policy Setup, which behaves as No Approval. |

## Still stuck?

Open a case and include the product version, client tool and operating system, the exact command, the full error text, and the time of the failure with its time zone. System Admins can also attach a support package from **Profile > Maintenance > Support Packages**. See [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
- [CodeSign Secure common misconceptions](codesign-secure-common-misconceptions.md)
- [CodeSign Secure FAQ](codesign-secure-faq.md)
- [What to include in a support case](../../00-Working-with-EC-Support/what-to-include-in-a-support-case.md)
