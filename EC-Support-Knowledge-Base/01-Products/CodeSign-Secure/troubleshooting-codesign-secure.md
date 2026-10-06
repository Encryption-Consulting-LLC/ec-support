---
title: "Troubleshooting CodeSign Secure"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure server, Windows and PKCS#11 signing clients, and connected HSMs (all deployment models)"
summary: "Common CodeSign Secure problems and fixes: client connection, HSM and PKCS#11 errors, SignTool and jarsigner failures, approvals, timestamps, and verification."
keywords: ["CodeSign Secure troubleshooting", "signtool error", "PKCS11 error", "code signing timestamp error", "HSM signing failure"]
last_reviewed: "2026-10-06"
---

# Troubleshooting CodeSign Secure

This article lists common CodeSign Secure problems, their likely causes, and how to fix them. It is organized by where the failure happens: client, server, Hardware Security Module (HSM), signing tool, timestamp, or verification. It is for administrators, build engineers, and EC support.

## Overview

A signing request passes through several parts. Find the failing part first:

1. **Client:** the signing tool loads the CodeSign Secure provider or library and authenticates.
2. **Server:** CodeSign Secure checks the policy and approvals.
3. **HSM:** the HSM signs the hash.
4. **Timestamp:** the signing tool contacts the Time Stamping Authority (TSA).
5. **Verification:** the platform validates the result.

The CodeSign Secure audit log is the fastest way to tell whether the request reached the server. If there is no audit record, the problem is on the client side or the network.

## Applies to

All CodeSign Secure deployments, with SignTool, jarsigner, cosign, and other supported tools.

## Quick checks

- Is the server reachable from the client? Test the API URL: {{TBD: CodeSign Secure health check URL or endpoint}}.

```powershell
Test-NetConnection <codesign-secure-host> -Port <api-port>
```

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://<codesign-secure-host>:<api-port>/
```

- Is the client clock correct? Large clock drift breaks token and TLS authentication.
- Is the server TLS certificate trusted by the client and not expired?
- Is the signing certificate still valid and not revoked?
- Is the HSM online? Check the HSM status in the console: {{TBD: console location of HSM status}}.

## Client and connection problems

| Symptom | Likely cause | Resolution |
|---|---|---|
| TLS or "could not establish trust relationship" error | Client does not trust the server certificate | Install the issuing CA chain in the client trust store. |
| 401 or authentication failure | Expired or wrong credential, or clock drift | Renew the credential. Sync time with NTP. |
| Provider not listed in Windows | KSP not registered | Reinstall the Windows client as administrator: {{TBD: client repair command}}. |
| PKCS#11 library fails to load | Wrong path, missing dependency, or 32-bit and 64-bit mismatch | Fix the path. On Linux run `ldd <library>` to find missing dependencies. |

## Server, policy, and approval problems

| Symptom | Likely cause | Resolution |
|---|---|---|
| Request rejected with policy message | Identity, key, file type, hash algorithm, or time window not allowed | Read the audit entry. Adjust the request or the policy. |
| Request pending for a long time | Waiting for approvers | Check approver notifications and group membership. |
| Request expired | Approval timeout reached | Submit again. Consider a longer timeout or CI/CD approval gates. |
| Key not found | Key disabled, deleted, or assigned to another project | Check key status and project mapping. |

## HSM problems

| Symptom | Likely cause | Resolution |
|---|---|---|
| `CKR_TOKEN_NOT_PRESENT` or slot missing | HSM client lost connection to the partition | Check HSM network, client registration, and HA group status. |
| `CKR_PIN_INCORRECT` or `CKR_PIN_LOCKED` | Wrong partition credential, or lockout | Correct the credential. Unlock per vendor procedure. |
| `CKR_DEVICE_ERROR` | HSM fault or overload | Check HSM logs and health. Collect diagnostics (see related articles). |
| nShield "key not found" | Security World files out of date on server | Synchronize `kmdata/local`. |
| Slow signing under load | HSM or server capacity limits | Review HSM performance. Batch files per request where tools allow. |

## Signing tool problems

| Symptom | Likely cause | Resolution |
|---|---|---|
| SignTool: "No certificates were found that met all the given criteria" | Wrong thumbprint or store, or no linked private key | Check `Cert:\CurrentUser\My` and the thumbprint. Re-run client setup. |
| SignTool: "The specified timestamp server either could not be reached or returned an invalid response" | TSA unreachable or wrong URL | Check proxy and firewall. Try a second TSA. |
| SignTool: error 0x800B0101 during sign | Signing certificate expired | Renew the certificate. |
| jarsigner: `ProviderException` | Bad `pkcs11.cfg` | Fix the `library` and `slot` values. |
| cosign: PKCS#11 URI not accepted | cosign built without PKCS#11 support | Build with the `pkcs11key` tag. |

## Verification problems

| Symptom | Likely cause | Resolution |
|---|---|---|
| Windows shows "Unknown publisher" | File not signed, or chain not trusted | Run `signtool verify /pa /v <file>`. For internal CAs, deploy the root to clients. |
| Signature invalid after certificate expiry | No timestamp | Re-sign with `/tr` and `/td`. |
| Driver will not load | Wrong signing requirements for kernel mode | Follow Microsoft driver signing requirements for the target Windows version. |
| `jarsigner -verify` warns about unsigned entries | Files added after signing | Sign as the last build step. |

## Collecting information for EC support

Include the following in the case:

- Time of failure (with time zone), user or service identity, key name, and file name.
- Full signing tool command (remove secrets) and complete output.
- CodeSign Secure server and client versions: {{TBD: how to find CodeSign Secure version numbers}}.
- Client logs and server logs. See [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md).
- HSM diagnostics if the HSM is involved. See [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

> **Warning:** Never send private keys, HSM passwords, PINs, or API tokens to support.

## Related articles

- [CodeSign Secure FAQ](codesign-secure-faq.md)
- [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md)
- [Timestamping for code signing](timestamping-for-code-signing.md)
- [HSM health check and monitoring](../../04-Featured-Articles/HSM-Runbooks/hsm-health-check-and-monitoring.md)
- [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md)
