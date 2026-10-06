---
title: "Automating Certificate Renewal and Deployment"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager; F5 BIG-IP, Microsoft IIS, NGINX, Apache HTTP Server, Apache Tomcat"
summary: "How to set up automated certificate renewal and deployment in CertSecure Manager for F5 BIG-IP, IIS, NGINX, Apache, and Tomcat, with checks and rollback steps."
keywords: ["automated certificate renewal", "certificate deployment", "F5 BIG-IP certificate", "IIS binding", "NGINX certificate"]
last_reviewed: "2026-10-06"
---

# Automating Certificate Renewal and Deployment

This article explains how to set up zero-touch renewal in CertSecure Manager, so certificates are renewed and installed on endpoints before they expire. It covers common endpoint types and how to check and roll back a deployment. It is for CertSecure Manager administrators and the owners of the target servers.

## Overview

An automated renewal has four stages:

1. **Trigger:** The certificate reaches its renewal threshold (for example, a set number of days or a percentage of its lifetime before expiry).
2. **Issue:** CertSecure Manager creates a new key pair (or asks the endpoint to create one), sends a Certificate Signing Request (CSR) to the CA, and receives the new certificate.
3. **Deploy:** The platform installs the certificate, private key, and chain on the endpoint and updates the binding or profile.
4. **Verify:** The platform checks that the endpoint now presents the new certificate, then records the result.

## Prerequisites

- The certificate is in the inventory with an owner. See [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md).
- A CA connector for the issuing CA.
- An endpoint connection with a service account for each target.
- Firewall paths from the automation component to each endpoint.
- An agreed change process. Many organizations pre-approve automated renewals as standard changes.

## Before starting

- **Test first.** Run the first renewal for each endpoint type in a test environment.
- **Back up.** Keep the current certificate and key (where exportable) until the new one is verified.
- **Chain:** Confirm the endpoint will receive the full chain (leaf plus intermediates). Missing intermediates are the most common cause of client errors after renewal.
- **Key handling:** Prefer key generation on the endpoint. Use exportable keys (PFX) only where the endpoint cannot generate a key.

## Procedure

### Phase 1: Set the renewal policy

1. Go to {{TBD: CertSecure Manager menu path for renewal policies}}.
2. Set the renewal window. A common rule is to renew when one third of the lifetime remains, with a minimum number of days. For short-lived certificates, use a percentage rather than a fixed number of days.
3. Choose whether to reuse the key or create a new key on renewal. Creating a new key is the safer default.
4. Set approval rules. Renewals of unchanged certificates often skip approval. New Subject Alternative Names (SANs) should require approval.

### Phase 2: Connect endpoints

Use the endpoint connection screen at {{TBD: CertSecure Manager menu path for endpoint connections}}. Endpoint specific basics:

**F5 BIG-IP**
- The platform uses the iControl REST API on the management interface.
- The service account needs the **Certificate Manager** role (or higher) on the relevant partitions.
- On BIG-IP, the certificate and key are stored in the SSL certificate list and referenced by a Client SSL profile. Set the intermediate chain in the profile's **Chain** field, or deploy a bundle.
- Plan whether to update the existing certificate object in place or create a new object and update the profile.
- In a device group, sync the configuration after the change, or let the platform do it if configured.

**Microsoft IIS**
- The certificate is installed in the Local Computer Personal store (`Cert:\LocalMachine\My`).
- The HTTPS binding (usually port 443, often with SNI) is updated to the new certificate thumbprint.
- Remote deployment commonly uses Windows Remote Management (WinRM). The account needs local administrator rights on the server, or the rights set in {{TBD: Windows endpoint permission guide}}.

**NGINX**
- The `ssl_certificate` file must contain the leaf certificate followed by the intermediate certificates. `ssl_certificate_key` points to the private key.
- After files are replaced, test and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Apache HTTP Server**
- `SSLCertificateFile` and `SSLCertificateKeyFile` point to the certificate and key. Since Apache 2.4.8, intermediates can be appended to `SSLCertificateFile`, and `SSLCertificateChainFile` is deprecated.
- Test and reload:

```bash
sudo apachectl configtest && sudo systemctl reload <apache2|httpd>
```

**Apache Tomcat**
- Tomcat reads a keystore (PKCS#12 or JKS) defined in the `Connector` or `SSLHostConfig` element of `server.xml`. The keystore needs the key and full chain under one alias.
- A restart, or a connector reload where supported, is needed to load the new keystore.

For Linux targets, the service account needs write access to the certificate and key paths and the right to reload the service, for example through a narrow sudo rule. Key files should be readable only by the service user (for example mode `600`).

### Phase 3: Link certificates to endpoints

1. Open the certificate in the inventory.
2. Add one or more deployment targets (endpoint, store or path, and binding or profile).
3. Enable automated renewal for the certificate.

### Phase 4: Run a test renewal

1. Trigger a manual renewal for one certificate.
2. Watch the job log through issue, deploy, and verify stages.
3. Confirm the result as shown below.

### Phase 5: Roll out

1. Enable automation for groups of certificates by application or environment.
2. Review failed jobs daily for the first two weeks.

## Verification

Check the certificate and chain served by the endpoint:

```bash
openssl s_client -connect <host>:443 -servername <host> -showcerts </dev/null
```

- The leaf certificate has the new serial number and expiry date.
- The intermediate certificates are present.
- `Verify return code: 0 (ok)` appears when the client trusts the root.

On Windows, check the binding:

```cmd
netsh http show sslcert
```

## Rollback

- Re-point the binding or SSL profile to the previous certificate, which should still be on the endpoint until clean-up.
- Reload the service.
- Pause automation for the certificate and open a case if the cause is not clear.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Clients report "unable to get local issuer certificate" | Chain incomplete on the endpoint | Deploy the full chain (NGINX file order, F5 Chain field, IIS intermediate store) |
| Deployment fails with access denied | Service account password expired or rights removed | Reset the password, update the credential in the platform, check rights |
| IIS shows new certificate but browsers see old one | Binding not updated, or wrong site or SNI binding | Check `netsh http show sslcert` and update the binding |
| "Private key not exportable" | Template or source does not allow key export, but deployment method needs a PFX | Generate the key on the endpoint, or use a template that allows export where policy permits |
| NGINX fails to reload | Key does not match certificate, or wrong file order | Compare moduli and fix order, then `nginx -t` |
| F5 change not on standby unit | Configuration not synced in the device group | Run config sync or enable sync in the connection |
| Renewal never triggers | Automation not enabled, or no endpoint linked | Enable automation and add a deployment target |

## Related articles

- [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md)
- [Configuring expiry alerts and notifications](configuring-expiry-alerts-and-notifications.md)
- [Preparing for 47-day certificates with CertSecure Manager](preparing-for-47-day-certificates-with-certsecure-manager.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
- [Preventing certificate outages](../../02-General/Certificate-Lifecycle-Management/preventing-certificate-outages.md)
