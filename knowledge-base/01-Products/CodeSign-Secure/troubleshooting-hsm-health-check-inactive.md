---
title: "Troubleshooting HSM Health Check Inactive in CodeSign Secure"
category: "Products"
section: "CodeSign Secure"
article_type: "Troubleshooting"
applies_to: "CodeSign Secure v3.2.1  and later, on-premises, cloud, and hybrid deployments with Entrust nShield, Thales Luna, Securosys Primus, or Utimaco SecurityServer HSMs"
summary: "What to check when CodeSign Secure shows HSM Health Check as Inactive and all signing fails: network, HSM client, vendor tools, and the status cache."
keywords: ["HSM Health Check Inactive", "CodeSign Secure HSM down", "nShield enquiry", "Luna vtl verify", "HSM not reachable", "all signing fails"]
last_reviewed: "2026-10-08"
---

# Troubleshooting HSM Health Check Inactive in CodeSign Secure

This article explains what to check when the **HSM Health Check** panel on the CodeSign Secure Dashboard shows **Inactive**. While the status is Inactive, **every** signing request fails, whatever the user, certificate, or policy. It is for CodeSign Secure administrators and HSM administrators.

## Applies to

- CodeSign Secure v3.2.1  and later, on-premises, cloud, and hybrid deployments.
- Supported HSMs: Entrust nShield, Thales Luna, Securosys Primus, and Utimaco SecurityServer Se Gen2.

> **Note:** SaaS customers don't manage the HSM. If the status is Inactive on a SaaS deployment, open a support case. If production signing is down, use Severity 1. See [Support severity levels and response targets](../../00-Working-with-EC-Support/support-severity-levels-and-response-targets.md).

## How the health check works

- CodeSign Secure checks the HSM with the vendor's HSM utilities **and** through the PKCS#11 interface.
- The result is **cached for up to 10 minutes**. After you fix a problem, the Dashboard can keep showing Inactive for up to 10 minutes. Run a test signing to confirm the fix sooner.
- The panel also shows details such as the HSM model, serial number, PKCS#11 version, FIPS mode, partition initialization status, and token flags. Compare these with what you expect.

## Step 1: check the network path from the server to the HSM

The CodeSign Secure server must reach the HSM on the port your HSM uses. Vendor defaults are:

| HSM | Default port |
|---|---|
| Entrust nShield Connect | TCP 9004 |
| Thales Luna Network HSM (NTLS) | TCP 1792 |
| Securosys Primus | TCP 2300 |
| Utimaco SecurityServer | TCP 288 |

Test from the CodeSign Secure server:

```powershell
Test-NetConnection <hsm-address> -Port <hsm-port>
```

> **Note:** These are vendor defaults. Confirm the port and connection direction against your own HSM configuration.

## Step 2: check the HSM client on the CodeSign Secure server

Use the vendor's own tools on the CodeSign Secure server. If they fail, the problem is between the server and the HSM, not in CodeSign Secure.

| HSM | Check | Healthy result |
|---|---|---|
| Entrust nShield | `enquiry` | The module reports mode `operational`. |
| Entrust nShield | `nfkminfo` | The Security World is initialized and usable. |
| Thales Luna | `vtl verify` | The partition is listed. |
| Thales Luna | `lunacm`, then `slot list` | The expected partition slot is shown. |
| Securosys Primus | The Primus PKCS#11 provider's diagnostic tools | The HSM and partition are reachable. |
| Utimaco SecurityServer | The SecurityServer PKCS#11 client's diagnostic tools | The HSM and slot are reachable. |

If the vendor check fails, look at these common causes:

| Cause | Resolution |
|---|---|
| The HSM client service is stopped (for example the nShield hardserver) | Start or restart the client service. |
| The client's registration or certificate on the HSM expired or changed | Repeat client registration (Luna) or enrollment (nShield). See the related HSM runbooks. |
| nShield Security World files on the server are out of date | Update the files in `kmdata\local` from the current Security World. |
| The partition is locked after wrong credentials | Unlock it with the vendor procedure, and correct the credential. |
| The HSM was restarted, updated, or failed over | Check the HSM's own logs and status. In an HA group, check every member. |

## Step 3: check the versions

Mismatched versions can make the HSM unreachable after an update. CodeSign Secure supports these versions or later:

| HSM | Firmware | Client software |
|---|---|---|
| Entrust nShield | 13.8.0 | 13.7.3 |
| Thales Luna | 10.7.1-125 | 7.3.0 |
| Securosys Primus | 2.8.21 | Primus PKCS#11 provider for your firmware |
| Utimaco SecurityServer Se Gen2 | 4.32.0 | SecurityServer PKCS#11 client for your firmware |

For other HSMs, contact EC before you deploy.

## Step 4: check every node in a cluster

In a cluster, every CodeSign Secure server must have the HSM client set up for the same HSM or HA group, so every key is available on every node. If one node can't reach the HSM, signing fails only for requests that the load balancer sends to that node. This often looks like signing that fails "sometimes". Run the vendor checks on **each** server.

## Step 5: confirm and resume

1. Run a test signing with a non-production certificate.
2. Wait up to 10 minutes and confirm the Dashboard shows **Active**.
3. Check the **Signatures Used** graph and the Audit Trail for failures during the outage, and re-run any failed release jobs.

## Prevent repeat outages

- Check HSM Health Check on the Dashboard as part of daily operations.
- Run HSMs in a high-availability configuration for production.
- Keep HSM firmware and client software at supported versions, and test updates outside production first.
- Back up HSM keys with the vendor's tools. A CodeSign Secure backup does **not** contain your private keys.

## Information to collect for EC support

- A screenshot of the HSM Health Check panel.
- The output of the vendor checks above (remove any credentials).
- The time the status changed, with its time zone, and any recent HSM changes.
- A support package from **Profile > Maintenance > Support Packages** (System Admin role required).
- HSM diagnostics as described in [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

> **Warning:** Never send HSM passwords, PINs, administrator card passphrases, or key material to support.

## Related articles

- [CodeSign Secure prerequisites and HSM integration](codesign-secure-prerequisites-and-hsm-integration.md)
- [HSM health check and monitoring](../../04-Featured-Articles/HSM-Runbooks/hsm-health-check-and-monitoring.md)
- [Enrolling a client with an nShield Connect](../../04-Featured-Articles/HSM-Runbooks/enrolling-a-client-with-an-nshield-connect.md)
- [Configuring Luna HA groups](../../04-Featured-Articles/HSM-Runbooks/configuring-luna-ha-groups.md)
- [CodeSign Secure error message index](codesign-secure-error-message-index.md)
