---
title: "Troubleshooting Client Authentication and Connection Errors"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later; Windows KSP, EC KSP for Mac, PKCS#11 Wrapper, Utility Tool, and ec-signer clients"
summary: "Fix CodeSign Secure connection and mutual TLS errors: wrong API URL, expired authentication certificate, TLS inspection, untrusted portal certificate."
keywords: ["CodeSign Secure connection error", "mutual TLS", "client authentication certificate", "EC_Client_Auth", "TLS inspection", "API base URL", "PFX expired"]
last_reviewed: "2026-10-08"
---

# Troubleshooting Client Authentication and Connection Errors

This article helps you fix problems where a signing client can't reach CodeSign Secure or can't prove who it is. It covers network paths, the API address, the client authentication certificate, API user credentials, proxies, and load balancers. It is for build administrators and network and platform teams.

## Applies to

- CodeSign Secure v3.2.1  and later, single server and cluster deployments.
- All signing clients: the Encryption Consulting KSP for Windows, EC KSP for Mac, the PKCS#11 Wrapper, the Utility Tool, and ec-signer.

## How clients authenticate

Every signing client uses **two credentials together**. If either one is wrong, signing fails.

| Credential | What it is | Where the client reads it |
|---|---|---|
| Authentication certificate | A `.pfx` file and its password, generated in **System Setup > User > Generate Authentication Certificate**. The client presents it in the TLS handshake (mutual TLS). | KSP: `EC_Client_Auth` and `EC_Client_Pass`. PKCS#11 Wrapper: `[pfxfile_path]` and `[pfxfile_passwd]` in `ec_pkcs11client.ini`. ec-signer: `ec-signer.conf`. |
| API user credentials | A registered username and the activation code or passcode. The client exchanges them for a token. | KSP: installer values in the registry. PKCS#11 Wrapper: `[login_token]` in `ec_pkcs11client.ini`. |

After authentication, the server returns a JSON Web Token (JWT) that authorizes the signing calls.

## Quick checks

Run these from the build machine, as the account that signs:

1. **Can the machine reach the server on the right port?** CodeSign Secure uses HTTPS on TCP 443 by default. Some deployments use another port, such as 8443.

   ```powershell
   Test-NetConnection <your-domain> -Port 443
   ```

   ```bash
   curl -sS -o /dev/null -w "%{http_code}\n" https://<your-domain>/
   ```

2. **Does the portal open in a browser from this machine** without a certificate warning?
3. **Is the API address correct?** It must end in `/api/`, for example `https://<your-domain>/api/`, or `https://<your-domain>:8443/api/` for a non-default port.
4. **Is the clock correct?** Tokens and request timers depend on accurate time. Sync with the Network Time Protocol (NTP).

## Problem: the client can't connect at all

**Symptom.** Connection refused, connection timed out, or "could not resolve host".

**Likely causes and fixes.**

| Cause | Resolution |
|---|---|
| A firewall blocks the HTTPS port | Allow TCP 443 (or your configured port) from build machines to the server or load balancer. |
| DNS points to the wrong host | Check that the portal name resolves to the server or load balancer. |
| The URL is missing the port for a non-default deployment | Include the port in the URL, for example `:8443`. |
| The server is stopped or restarting | Check the Apache service and Apache Monitor on the server. A restart from **Profile > Maintenance**, or connecting a plugin, restarts the server and fails requests in progress. |

## Problem: TLS handshake fails or the server certificate isn't trusted

**Symptom.** The client reports a TLS error, an untrusted certificate, or a name mismatch. Browsers also show a warning.

**Cause.** The portal still uses the self-signed certificate installed with CodeSign Secure, the certificate chain is incomplete, or the certificate's name doesn't match the address the client uses.

**Resolution.**

1. In **System Setup > SSL/TLS Management**, generate a Certificate Signing Request (CSR), get a certificate from your Public Key Infrastructure (PKI), and import it with the **full chain**.
2. Set the common name and Subject Alternative Name (SAN) to the portal DNS name that clients use.
3. Restart Apache Monitor if the browser or client still shows the old certificate.
4. Make sure the root and intermediate certificates are trusted on every build machine.

> **Note:** **Renew** in SSL/TLS Management works only for the self-signed certificate supplied with CodeSign Secure. For a certificate from your PKI, generate a new CSR and import the new certificate before the old one expires.

## Problem: the handshake fails only through a proxy

**Symptom.** Signing works from inside the server network but fails from build machines behind a corporate proxy. The KSP verbose output shows a TLS or client certificate error.

**Cause.** The proxy inspects TLS traffic (it terminates and re-creates the TLS session). This removes the client certificate, so mutual TLS can't work.

**Resolution.** Allow HTTPS to the CodeSign Secure domain **without TLS inspection**. Timestamp requests are separate connections to the TSA and are not affected by this rule. See [Troubleshooting timestamping errors](troubleshooting-timestamping-errors.md).

## Problem: the authentication certificate is rejected

**Symptom.** Verbose output or logs show the client certificate is invalid, expired, or can't be read.

**Likely causes and fixes.**

| Cause | Resolution |
|---|---|
| The certificate passed its **Valid Till** date | Generate a new authentication certificate, update the client configuration, restart build agents, and run a test signing. |
| The path to the `.pfx` file is wrong, or the build account can't read it | Fix the path. Give the build account read access to the file. |
| The password is wrong | Check `EC_Client_Pass` or `[pfxfile_passwd]`. If unsure, issue a new certificate. |
| Environment variables changed but the client didn't see them | Open a new command prompt, or restart the build agent service. |
| The user the certificate belongs to is locked | Check **System Setup > User**. Users are locked when credentials are exposed. |

> **Tip:** Set an expiry alert in your own calendar or monitoring for every authentication certificate. Renew before the **Valid Till** date, not after a pipeline fails.

## Problem: the token or API user credentials are rejected

**Symptom.** The TLS handshake succeeds, but authentication fails with an invalid username, code, or token.

**Resolution.**

- **Windows KSP:** check `Computer\HKEY_CURRENT_USER\Software\Encryption Consulting\SigningKSP`. Confirm the username, code, Identity Type `1`, API Base URL, and `ectoken`. Set a new `ectoken` if it expired. See [Troubleshooting SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md).
- **PKCS#11 Wrapper:** check `username` and `passcode` in `[login_token]` of `ec_pkcs11client.ini`, and `url` in `[server_url]`. See [Troubleshooting PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md).
- **API keys:** an API key generated in **System Setup > User > Generate API Key** expires after 30, 60, or 90 days. Generate a new one.

## Problem: users are signed out of the portal unexpectedly

**Cause.** Each account can have one active portal session. Signing in again from another browser or machine revokes the account's earlier sessions.

**Resolution.** Give every person their own account, and give each pipeline or build machine its own dedicated API user. Do not share one account between people and automation.

## Problem: new build machines can't be onboarded

**Cause.** Your license limits how many KSP clients can be in use. The Dashboard KPI **Signing KSPs Utilized** shows the count in use against the count allowed, for example `15/15`.

**Resolution.** Check the **Client Report** in **Reports** to find clients that are no longer used. To raise the limit, contact EC support. The exact behavior when the limit is reached: {{TBD: error or behavior a new KSP client sees when the licensed client count is reached}}.

## Information to collect for EC support

- Product version (profile menu), client tool and version, and operating system.
- The server URL as configured on the client (not the password or code).
- Output of `Test-NetConnection` or `curl` from the build machine.
- Verbose client output and logs: `rolling-ecksp.log` for the KSP, or the wrapper log set by `EC_PKCS11_CLIENT-LogConfig.xml`.
- Whether a proxy or load balancer sits between the client and the server.
- The time of the failure with its time zone.

> **Warning:** Never send `.pfx` files, passwords, passcodes, tokens, or `ec_pkcs11client.ini` with real values to support.

## Related articles

- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
- [Troubleshooting SignTool and EC KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md)
- [Troubleshooting PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md)
- [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md)
- [Secure file sharing with EC Support](../../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md)
