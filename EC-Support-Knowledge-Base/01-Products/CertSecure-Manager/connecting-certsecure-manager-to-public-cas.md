---
title: "Connecting CertSecure Manager to Public CAs"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager; DigiCert, Sectigo, Let's Encrypt, Google Public CA, AWS Certificate Manager, AWS Private CA"
summary: "How to connect CertSecure Manager to DigiCert, Sectigo, Let's Encrypt, Google Public CA, and AWS CAs, including credentials, validation, and testing."
keywords: ["CertSecure Manager public CA", "DigiCert API", "Sectigo", "Let's Encrypt", "Google Public CA EAB", "AWS Private CA"]
last_reviewed: "2026-10-06"
---

# Connecting CertSecure Manager to Public CAs

This article explains how to connect CertSecure Manager to public and cloud Certificate Authorities (CAs). It lists the credentials each CA needs, how domain validation works, and how to test the connection. It is for CertSecure Manager administrators and the owners of the CA accounts.

## Overview

Public CAs issue certificates that browsers and operating systems trust by default. CertSecure Manager connects to them through each CA's REST API or through the Automated Certificate Management Environment (ACME) protocol defined in RFC 8555. Once connected, the platform can request, renew, revoke, and import certificates from that CA.

Supported public and cloud CAs:

| CA | Typical connection method | Credential needed |
|---|---|---|
| DigiCert (CertCentral) | DigiCert REST API | API key from the CertCentral account |
| Sectigo (Sectigo Certificate Manager) | Sectigo REST API, or ACME with External Account Binding (EAB) | API user credentials or EAB key ID and HMAC key |
| Let's Encrypt | ACME | No paid account. An ACME account key is created automatically |
| Google Public CA | ACME with EAB | EAB key ID and HMAC key created in a Google Cloud project |
| AWS Certificate Manager (ACM) | AWS API | Identity and Access Management (IAM) role or access key |
| AWS Private CA | AWS API | IAM role or access key with AWS Private CA permissions |

## Prerequisites

- An active account with each CA, with API access enabled.
- For Organization Validation (OV) and Extended Validation (EV) certificates: the organization already validated in the CA account.
- A plan to prove domain control (see below).
- Outbound HTTPS (TCP 443) from the CertSecure Manager platform or component to the CA's API endpoints.
- A CertSecure Manager administrator account.

## Before starting

- **Least privilege:** Create API keys or IAM roles that allow only certificate actions. Do not use a CA account owner's personal key.
- **Secrets:** Store API keys only in CertSecure Manager or an approved vault. Never put keys in tickets or email.
- **Rate limits:** Public CAs apply rate limits. Let's Encrypt, for example, limits certificates per registered domain per week. Test against a staging endpoint where one exists.
- **Validity changes:** Public TLS certificate validity is shrinking under CA/Browser Forum Ballot SC-081v3 (200 days from March 15, 2026). See [Preparing for 47-day certificates](preparing-for-47-day-certificates-with-certsecure-manager.md).

## Procedure

### Phase 1: Create CA credentials

**DigiCert**
1. In CertCentral, create an API key for a dedicated API user.
2. Restrict the key to the actions and divisions needed, if the account supports it.

**Sectigo**
1. In Sectigo Certificate Manager, create an API administrator, or create ACME EAB credentials for the target organization or department.

**Let's Encrypt**
1. No credential is needed. Note the production directory `https://acme-v02.api.letsencrypt.org/directory` and the staging directory `https://acme-staging-v02.api.letsencrypt.org/directory`.

**Google Public CA**
1. In a Google Cloud project, enable the Public Certificate Authority API.
2. Create an EAB key, for example:

```bash
gcloud publicca external-account-keys create --project=<project-id>
```

3. Record the `keyId` and `b64MacKey` values. Use them within the validity window Google sets for unused keys.

**AWS ACM and AWS Private CA**
1. Create an IAM role or user for CertSecure Manager.
2. For ACM, allow actions such as `acm:RequestCertificate`, `acm:DescribeCertificate`, `acm:ListCertificates`, and `acm:ImportCertificate` as needed.
3. For AWS Private CA, allow `acm-pca:IssueCertificate`, `acm-pca:GetCertificate`, `acm-pca:RevokeCertificate`, and `acm-pca:ListCertificateAuthorities` on the specific CA Amazon Resource Name (ARN).
4. Confirm the final policy against AWS documentation before use.

### Phase 2: Plan domain validation

Public CAs must confirm that the requester controls each domain. Common methods:

| Method | How it works | Good for |
|---|---|---|
| DNS TXT record | A token is placed at a DNS name such as `_acme-challenge.<domain>` | Wildcards, servers not reachable from the internet |
| HTTP file | A token is served from `http://<domain>/.well-known/acme-challenge/` (ACME) or a CA-specific path | Public web servers |
| Email | An approval email is sent to a domain contact | Low-volume, manual cases |

For automation, DNS validation through a supported DNS provider API is the most reliable choice. Under SC-081v3, domain validation reuse periods also shrink (200 days in 2026, 100 days in 2027, 10 days in 2029), so automated validation becomes required in practice.

### Phase 3: Add the connector in CertSecure Manager

1. Sign in as an administrator.
2. Go to the **CA Connectors** page and add a new connector.
3. Select the CA type.
4. Enter the API endpoint or ACME directory URL and the credentials from Phase 1.
5. Select the products or certificate profiles to expose (for example, OV TLS or DV TLS).
6. Map the connector to policies, teams, and approval workflows.
7. Save and run the connection test.

### Phase 4: Import existing certificates

1. Start an import or sync job for the connector, if the CA supports it.
2. Review imported records and assign owners. See [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md).

## Verification

1. Request a test certificate for a test domain.
2. Confirm the order completes and the certificate appears in the inventory with the correct issuer.
3. Check the chain with OpenSSL:

```bash
openssl x509 -in <cert.pem> -noout -issuer -subject -dates
```

4. Revoke the test certificate if it will not be used.

## Rollback

- Disable or delete the connector.
- Revoke the API key, EAB credential, or IAM role at the CA.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| HTTP 401 or 403 from the CA API | Wrong, expired, or restricted API key | Create a new key and update the connector |
| ACME "unauthorized" or "externalAccountRequired" | EAB missing or already used | Create new EAB credentials and re-register |
| Order stuck in pending validation | DNS TXT record not visible yet, or HTTP path not reachable | Check DNS propagation with `nslookup -type=TXT _acme-challenge.<domain>` and firewall on port 80 |
| "rateLimited" error | Too many orders for the same domain | Wait for the window to reset and test against staging |
| AWS AccessDenied | IAM policy missing an action or wrong resource ARN | Add the action and scope it to the correct ARN |
| Connection timeout | Proxy or firewall blocks outbound 443 | Allow the CA API hostnames through the proxy |

## Related articles

- [ACME enrollment with CertSecure Manager](acme-enrollment-with-certsecure-manager.md)
- [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md)
- [Preparing for 47-day certificates with CertSecure Manager](preparing-for-47-day-certificates-with-certsecure-manager.md)
- [ACME protocol explained](../../02-General/Certificate-Lifecycle-Management/acme-protocol-explained.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
