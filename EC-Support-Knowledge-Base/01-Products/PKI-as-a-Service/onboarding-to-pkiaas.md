---
title: "Onboarding to PKIaaS"
category: "Products"
section: "PKI-as-a-Service"
article_type: "How-to"
applies_to: "Encryption Consulting PKI-as-a-Service (PKIaaS), new customers and new CA hierarchies"
summary: "Step-by-step onboarding to EC PKIaaS: scoping, hierarchy design, key ceremony, trust distribution, network setup, first certificate, and go-live checks."
keywords: ["PKIaaS onboarding", "managed PKI setup", "root CA distribution", "key ceremony", "PKI go-live"]
last_reviewed: "2026-10-06"
---

# Onboarding to PKIaaS

This article walks through the onboarding of a new customer to Encryption Consulting (EC) PKI-as-a-Service (PKIaaS), from first scoping call to go-live. It is for the customer PKI owner and project lead who work with the EC onboarding team.

## Overview

Onboarding has five phases: scope, design, build, integrate, and go-live. EC builds and runs the Certificate Authority (CA) platform. The customer supplies requirements, approvals, and changes on its own network and endpoints. See [PKIaaS architecture and shared responsibility](pkiaas-architecture-and-shared-responsibility.md) for the full split of duties.

## Applies to

- New PKIaaS subscriptions (SaaS or on-premises managed).
- Adding a new CA hierarchy or issuing CA to an existing subscription.

## Prerequisites

- A signed order or trial request. The EC website offers a 15-day free trial.
- A named customer PKI owner and a backup contact.
- A list of certificate use cases (for example Wi-Fi, VPN, mutual TLS (mTLS), web servers, S/MIME, Intune devices).
- Rough volumes: certificates per year per use case.
- Access to change Group Policy, Mobile Device Management (MDM), and firewall rules.
- For Active Directory (AD) integration: a list of forests and domains, and an account with rights to publish to AD (Enterprise Admins or delegated rights in the Configuration partition).

## Before starting

- **Existing PKI:** If an internal Microsoft Active Directory Certificate Services (AD CS) PKI exists, record its CA names, templates, and CRL URLs. EC uses this to plan side-by-side running and migration.
- **Naming:** Agree CA common names early. CA names appear in every issued certificate and are hard to change later.
- **Change windows:** Publishing a new root to trust stores is low risk, but changing enrollment for production devices is not. Book change windows for integration steps.
- **Validity:** Agree CA and end-entity validity periods. Public TLS rules (200 days from March 15, 2026) do not apply to private PKI, but short lifetimes still reduce risk.

## Procedure

### Phase 1: Scope

1. Join the kickoff call with EC. Share use cases, volumes, and compliance needs (for example PCI DSS, HIPAA, eIDAS).
2. Fill in the onboarding questionnaire.
3. Agree the deployment model (SaaS or on-premises managed) and hosting region.

### Phase 2: Design

1. Review the proposed hierarchy from EC (for example a two-tier design with an offline root and two issuing CAs).
2. Review certificate profiles: subject format, Subject Alternative Name (SAN) rules, key type (RSA, ECDSA, or hybrid with ML-DSA), key usage, Extended Key Usage (EKU), and validity.
3. Review the Certificate Policy (CP) and Certification Practice Statement (CPS) drafts.
4. Approve the design in writing. EC will not run the key ceremony without written approval.

### Phase 3: Build

1. EC schedules the key ceremony. Name the customer witnesses.
2. EC generates the root and issuing CA keys in FIPS 140-3 Level 3 validated Hardware Security Modules (HSMs) and signs the issuing CA certificates.
3. EC publishes the first Certificate Revocation List (CRL) and Authority Information Access (AIA) files and starts Online Certificate Status Protocol (OCSP) if in scope.
4. EC sends the ceremony report, root and issuing CA certificates, and their thumbprints through a secure channel. See [Secure file sharing with EC support](../../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md).

### Phase 4: Integrate

1. **Check thumbprints.** Compare the received root certificate thumbprint with the ceremony report:

```powershell
certutil -hashfile .\Contoso-Root-CA.cer SHA256
```

2. **Distribute the root to Windows** through Group Policy: Computer Configuration > Policies > Windows Settings > Security Settings > Public Key Policies > Trusted Root Certification Authorities. Or publish it to AD:

```cmd
certutil -dspublish -f Contoso-Root-CA.cer RootCA
certutil -dspublish -f Contoso-Issuing-CA-01.cer SubCA
```

3. **Distribute to Linux** (Debian or Ubuntu example):

```bash
sudo cp Contoso-Root-CA.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

On RHEL, copy the file to `/etc/pki/ca-trust/source/anchors/` and run `sudo update-ca-trust`.

4. **Distribute to Intune devices** with a Trusted certificate profile per platform.
5. **Open the network.** Allow clients to reach the CRL, AIA, OCSP, and enrollment endpoints.
6. **Set up enrollment** for each use case. See [Enrolling certificates with PKIaaS: ACME, SCEP, and Intune](enrolling-certificates-with-pkiaas-acme-scep-intune.md).
7. **Grant access.** Request customer admin accounts in the PKIaaS portal.

### Phase 5: Go-live

1. Issue one test certificate per use case.
2. Run the verification checks below.
3. Sign the go-live acceptance. EC moves the service into steady-state support.

## Verification

Check the chain and revocation of a test certificate on Windows:

```powershell
certutil -verify -urlfetch .\test-cert.cer
```

The output should show each CRL and AIA URL as "Verified" and end with "Leaf certificate revocation check passed".

On Linux:

```bash
openssl verify -CAfile chain.pem test-cert.pem
openssl crl -in issuing.crl -inform DER -noout -nextupdate
```

Also confirm the root appears in the trust store of a sample device from each platform.

## Rollback

During onboarding, no production enrollment depends on PKIaaS until go-live. To roll back, remove PKIaaS enrollment profiles and keep using the existing PKI. Leave the root certificate in trust stores unless the hierarchy is being rebuilt.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| "The revocation function was unable to check revocation because the revocation server was offline" | Firewall blocks CDP or OCSP URL | Allow outbound HTTP to the CDP and OCSP hosts; retest with `certutil -url` |
| Chain shows "untrusted root" | Root not in the device trust store | Check GPO or MDM trusted certificate profile assignment |
| Thumbprint does not match ceremony report | Wrong or altered file | Stop. Contact EC and do not distribute the file |
| `certutil -dspublish` fails with access denied | Missing rights in AD Configuration partition | Run as Enterprise Admin or delegate rights |
| Intune devices do not get the root | Profile not assigned to the right group | Fix group assignment and sync the device |

## Related articles

- [PKI-as-a-Service overview](pki-as-a-service-overview.md)
- [PKIaaS architecture and shared responsibility](pkiaas-architecture-and-shared-responsibility.md)
- [Enrolling certificates with PKIaaS: ACME, SCEP, and Intune](enrolling-certificates-with-pkiaas-acme-scep-intune.md)
- [Key ceremonies explained](../../02-General/HSM/key-ceremonies-explained.md)
- [Troubleshooting revocation server offline errors](../../04-Featured-Articles/PKI-Runbooks/troubleshooting-revocation-server-offline-errors.md)
