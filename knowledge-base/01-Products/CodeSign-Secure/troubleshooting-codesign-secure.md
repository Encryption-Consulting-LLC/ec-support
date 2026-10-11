---
title: "Troubleshooting CodeSign Secure"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later, the portal, all signing clients, and connected HSMs (all deployment models)"
summary: "Start here for CodeSign Secure problems: find where a signing request fails, collect the right diagnostics, fix common issues, and know what to send EC support."
keywords: ["CodeSign Secure troubleshooting", "signtool error", "PKCS11 Wrapper error", "code signing timestamp error", "HSM signing failure", "support package"]
last_reviewed: "2026-10-08"
---

# Troubleshooting CodeSign Secure

This article is the starting point for CodeSign Secure problems. It shows how to find where a signing request fails, how to collect the diagnostics EC support needs, and which article fixes each kind of problem. It is for administrators, build engineers, and EC support.

> **Tip:** If you have an exact error message, search the [CodeSign Secure error message index](codesign-secure-error-message-index.md) first.

## Applies to

CodeSign Secure v3.2.1  and later, all deployment models.

## Step 1: find where the request fails

A signing request passes through these parts in order. Find the first one that fails.

| Part | What happens | How to check it |
|---|---|---|
| 1. Client | The signing tool loads the KSP, PKCS#11 Wrapper, EC KSP for Mac, or ec-signer | Client debugging output and logs (see Step 2) |
| 2. Network and TLS | The client connects to the server with mutual TLS | `Test-NetConnection <your-domain> -Port 443`, or open the portal from the same machine |
| 3. Authentication | The server checks the authentication certificate and API user credentials | Client verbose output |
| 4. Access | The server checks the role permission and team mapping | **Reports > Audit Trail** and **Logs** |
| 5. Policy | The environment decides whether approval is needed | **Signing Request** page |
| 6. HSM | The HSM signs the hash | **Dashboard > HSM Health Check** |
| 7. Timestamp | The signing tool contacts the TSA directly | Signing tool output |

Two quick rules:

- **No record in the Audit Trail or Logs** means the request never reached the server. Look at the client, network, or authentication.
- **HSM Health Check shows Inactive** means every signing fails. Fix that first.

## Step 2: collect diagnostics

| Source | How to get it |
|---|---|
| Support package | **Profile > Maintenance > Support Packages**: create a package, then download it. Requires the System Admin role. |
| System logs | **Logs** page: filter by date and time zone, export to CSV, or download the system logs. Right-click an entry and select **View Details**. |
| Audit Trail | **Reports > Audit Trail**, filtered by date, application, and category (Crypto Operations, Application Operations, User Management, System Settings). |
| Windows KSP | Set `EC_SSL_VERBOSE=1`, open a new command prompt, and repeat the command. For more detail, read `rolling-ecksp.log` in `C:\ProgramData\Encryption Consulting\SigningKSP`. Its settings are in `ECKSP-LogConfig.xml` in the same folder. Set `EC_SSL_VERBOSE` back to `0` afterwards. |
| PKCS#11 Wrapper | The log defined by `EC_PKCS11_CLIENT-LogConfig.xml`, which `[logconfig_file]` in `ec_pkcs11client.ini` points to. |
| Installer | Select **Open Logs** in the installation wizard. |

## Step 3: fix the problem

| Area | Common symptoms | Article |
|---|---|---|
| SignTool and the Windows KSP | Provider not found, "No certificates were found…", `SignerSign() failed` (`0x80090016`, `0x8007000B`), works interactively but not in CI | [Troubleshooting SignTool and Encryption Consulting KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) |
| PKCS#11 Wrapper | Provider won't load, `EC_INI_FILE_PATH` not set, "Certificate chain not found", wrong key after renewal, Luna slot | [Troubleshooting PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md) |
| Connection and authentication | Can't connect, TLS errors, untrusted portal certificate, proxy or load balancer issues, expired authentication certificate | [Troubleshooting client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md) |
| Access and permissions | New user can't sign, certificate missing from team mapping, inactive or expired certificate, breakage after renewal | [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md) |
| Approvals | Job fails after about 100 seconds, approver can't see a request, MFA codes don't arrive | [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md) |
| Timestamps | TSA unreachable, file signed without a timestamp, Java proxy | [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md) |
| HSM | HSM Health Check Inactive, all signing fails | [Troubleshooting HSM Health Check Inactive](troubleshooting-hsm-health-check-inactive.md) |

## Portal and server problems

| Symptom | Likely cause | Fix |
|---|---|---|
| The portal doesn't load | Apache service stopped, or DNS points elsewhere | Check the services and Apache Monitor on the server, and the DNS name. |
| The browser shows a certificate warning | The portal still uses the self-signed certificate, the chain is incomplete, or old files are cached | Import a certificate from your PKI with its full chain in **SSL/TLS Management**, then restart Apache Monitor. |
| Azure AD sign-in fails | Redirect URI, client secret, or consent problem | See the Azure AD rows in the [error message index](codesign-secure-error-message-index.md). |
| You're signed out unexpectedly | Only one portal session per account is allowed | Use separate accounts for each person. Client tokens aren't affected. |
| The page shows an error right after connecting a plugin | The server restarts after a plugin connects | Wait a few seconds and refresh. Requests in progress at that moment fail. |
| Emails or MFA codes don't arrive | No active SMTP configuration or template | Activate them in **System Setup > Email**. Check spam folders. |
| The portal SSL/TLS certificate can't be renewed | Renew works only for the bundled self-signed certificate | Generate a new CSR and import the new certificate. |
| A user can't be deleted | A replacement user is required | Choose a replacement user to take over the deleted user's records. |

## macOS and containers

| Symptom | Likely cause | Fix |
|---|---|---|
| codesign reports `errSecInternalComponent` | codesign can't reach the signing identity, common in CI sessions | Recheck the EC KSP for Mac setup, allow `ECCssProvider.app` access to the authentication certificate's key in Keychain Access, and unlock the keychain in CI sessions. |
| Kubernetes rejects an image | The admission webhook blocks unsigned images | Expected. Sign the image first. See [Signing container images](signing-container-images.md). |

## Information to send EC support

Include:

- The product version (hover over the version in the profile menu; the footer shows the frontend and backend versions).
- The client tool and its version, and the operating system.
- The exact command, with passwords removed, and the full error text.
- The time of the failure, with its time zone.
- Client logs from Step 2, and a support package if you are a System Admin.
- HSM diagnostics if the HSM is involved. See [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

> **Warning:** Never send private keys, `.pfx` files, passwords, passcodes, activation codes, tokens, HSM credentials, or `ec_pkcs11client.ini` with real values. Share support packages only through an approved channel. See [Secure file sharing with EC Support](../../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md).

## Related articles

- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
- [CodeSign Secure: common misconceptions](codesign-secure-common-misconceptions.md)
- [CodeSign Secure FAQ](codesign-secure-faq.md)
- [HSM health check and monitoring](../../04-Featured-Articles/HSM-Runbooks/hsm-health-check-and-monitoring.md)
- [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md)
