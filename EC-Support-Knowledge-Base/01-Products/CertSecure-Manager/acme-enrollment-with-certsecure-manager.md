---
title: "ACME Enrollment with CertSecure Manager"
category: "Products"
section: "CertSecure Manager"
article_type: "How-to"
applies_to: "CertSecure Manager ACME service; ACME clients such as certbot, acme.sh, win-acme, and cert-manager"
summary: "How to enroll and renew certificates through the CertSecure Manager ACME service with certbot, acme.sh, win-acme, or cert-manager, plus EAB and challenge setup."
keywords: ["ACME enrollment", "RFC 8555", "certbot", "External Account Binding", "cert-manager", "CertSecure Manager ACME"]
last_reviewed: "2026-10-06"
---

# ACME Enrollment with CertSecure Manager

This article explains how to use the Automated Certificate Management Environment (ACME) protocol to get certificates through CertSecure Manager. It covers the ACME flow, account binding, challenge types, and client examples. It is for system administrators, DevOps engineers, and Kubernetes operators.

## Overview

ACME is an open standard, published as RFC 8555, that lets software request, renew, and revoke certificates without human steps. CertSecure Manager can act as an ACME server in front of the CAs it manages. This lets standard ACME clients get certificates from Microsoft Active Directory Certificate Services (AD CS) or other connected CAs while CertSecure Manager applies policy and records each certificate in the inventory.

The ACME flow, in short:

1. The client reads the **directory** URL to learn the server's endpoints.
2. The client gets a **nonce** and creates an **account** with its own account key. If the server requires it, the client includes **External Account Binding (EAB)** values to link the ACME account to a known user or team.
3. The client creates an **order** for one or more identifiers (domain names).
4. The server returns an **authorization** for each identifier with one or more **challenges**.
5. The client completes a challenge to prove control of the name.
6. The client sends a **finalize** request with a Certificate Signing Request (CSR).
7. The client downloads the certificate and chain.

## Challenge types

| Challenge | How control is proven | Requirement |
|---|---|---|
| http-01 | A token file at `http://<domain>/.well-known/acme-challenge/<token>` | The ACME server must reach the host on TCP 80 |
| dns-01 | A TXT record at `_acme-challenge.<domain>` | The client can update DNS. Needed for wildcard names |
| tls-alpn-01 (RFC 8737) | A special certificate on TCP 443 using the `acme-tls/1` protocol | The ACME server must reach the host on TCP 443 |

For internal names, CertSecure Manager may allow other validation settings according to policy, for example trusting EAB plus an allowed domain list.

## Prerequisites

- The CertSecure Manager ACME service enabled and linked to a CA and a certificate profile.
- The ACME directory URL, shown on the **ACME** settings page in the console.
- EAB credentials (key ID and HMAC key) if the directory requires them, created on the **ACME** settings page in the console.
- The client host trusts the CertSecure Manager ACME server's TLS certificate. Add the internal root CA to the trust store if needed.
- Network access from the ACME server to the client for http-01 or tls-alpn-01, or DNS API access for dns-01.

## Before starting

- Treat the EAB HMAC key as a secret. Do not store it in source control.
- Test in a non-production environment first.
- Decide who owns each ACME account. One account per application or team keeps the inventory clean.

## Procedure

### Phase 1: Prepare the ACME profile in CertSecure Manager

1. Create or select the certificate profile (CA, template, key type, validity).
2. Restrict allowed domains for the profile.
3. Generate EAB credentials for the requesting team.

### Phase 2: Enroll with a client

**certbot (Linux)**

```bash
sudo certbot certonly --server <acme-directory-url> \
  --eab-kid <eab-key-id> --eab-hmac-key <eab-hmac-key> \
  --webroot -w <web-root-path> -d <host.example.com> \
  -m <team-mailbox@example.com> --agree-tos
```

If the ACME server uses an internal CA certificate, point certbot to the trust bundle with the `REQUESTS_CA_BUNDLE` environment variable, or add the root to the system store.

**acme.sh**

```bash
acme.sh --register-account --server <acme-directory-url> \
  --eab-kid <eab-key-id> --eab-hmac-key <eab-hmac-key>
acme.sh --issue --server <acme-directory-url> -d <host.example.com> -w <web-root-path>
```

**win-acme (Windows, IIS)**

```cmd
wacs.exe --baseuri <acme-directory-url> --eab-key-identifier <eab-key-id> --eab-key <eab-hmac-key>
```

Follow the menu to select the IIS site. win-acme updates the IIS binding and creates a scheduled task for renewal.

**cert-manager (Kubernetes)**

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: certsecure-acme
spec:
  acme:
    server: <acme-directory-url>
    privateKeySecretRef:
      name: certsecure-acme-account
    externalAccountBinding:
      keyID: <eab-key-id>
      keySecretRef:
        name: certsecure-eab
        key: secret
    solvers:
      - http01:
          ingress:
            ingressClassName: <ingress-class>
```

Create the `certsecure-eab` Secret in the cert-manager namespace before applying the issuer.

### Phase 3: Renewal

- ACME clients renew on their own schedule (certbot and acme.sh use a scheduled job; cert-manager renews before expiry based on the `renewBefore` setting or by default at two thirds of the lifetime).
- Make sure the scheduled job or timer is enabled.
- Some clients support ACME Renewal Information (ARI, RFC 9773), which lets the server suggest a renewal window.

## Verification

1. Confirm the certificate file exists and has the expected issuer and dates:

```bash
openssl x509 -in <cert.pem> -noout -subject -issuer -dates
```

2. Confirm the certificate appears in the CertSecure Manager inventory under the right owner.
3. Test renewal without changing the live certificate:

```bash
sudo certbot renew --dry-run
```

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| "externalAccountRequired" | Directory needs EAB and none was sent | Add EAB key ID and HMAC key |
| "unauthorized" on account creation | EAB key already used, expired, or mistyped | Create new EAB credentials |
| http-01 challenge fails | Port 80 blocked, redirect to a wrong host, or web root wrong | Open TCP 80 from the ACME server, fix the path, test the token URL |
| dns-01 challenge fails | TXT record not propagated or wrong zone | Check `nslookup -type=TXT _acme-challenge.<domain>` and add a propagation wait |
| "rejectedIdentifier" | Domain not allowed by the profile | Add the domain to the profile, or use the correct profile |
| TLS error reaching the directory | Client does not trust the ACME server certificate | Add the internal root CA to the client trust store |
| Certificate issued but service still uses old one | Service not reloaded after renewal | Add a deploy hook to reload the service |

## Related articles

- [ACME protocol explained](../../02-General/Certificate-Lifecycle-Management/acme-protocol-explained.md)
- [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md)
- [Connecting CertSecure Manager to public CAs](connecting-certsecure-manager-to-public-cas.md)
- [Preparing for 47-day certificates with CertSecure Manager](preparing-for-47-day-certificates-with-certsecure-manager.md)
- [Troubleshooting CertSecure Manager](troubleshooting-certsecure-manager.md)
