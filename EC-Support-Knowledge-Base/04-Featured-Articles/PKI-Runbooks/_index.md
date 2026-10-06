---
title: "PKI Runbooks"
category: "Featured Articles"
section: "PKI Runbooks"
article_type: "Overview"
applies_to: "Microsoft AD CS on Windows Server 2016 to 2025 with Entrust nShield and Thales Luna HSMs"
summary: "Step-by-step runbooks for operating Microsoft AD CS with HSMs: CRL publishing and recovery, CA renewal, migration, OCSP, high availability and decommissioning."
keywords: ["PKI runbooks", "AD CS", "CRL", "OCSP", "HSM", "certutil"]
last_reviewed: "2026-10-06"
---

# PKI Runbooks

These runbooks give tested, step-by-step procedures for running a Microsoft Active Directory Certificate Services (AD CS) PKI whose CA keys live in an Entrust nShield or Thales Luna Hardware Security Module (HSM). Each runbook lists prerequisites, risks, verification steps and a troubleshooting table.

## Incident response

- [Emergency CRL Signing](emergency-crl-signing.md)
- [Recovering from an Expired CRL](recovering-from-an-expired-crl.md)
- [Troubleshooting Revocation Server Offline Errors](troubleshooting-revocation-server-offline-errors.md)

## Routine operations

- [Root CA CRL Renewal for an Offline Root CA](root-ca-crl-renewal-offline-root.md)
- [Issuing CA Certificate Renewal with an HSM](issuing-ca-certificate-renewal.md)
- [Changing CRL Publication Periods in AD CS](changing-crl-publication-periods.md)
- [certutil Command Reference for AD CS and HSM Operations](certutil-command-reference.md)

## Design and change projects

- [High Availability CDP and AIA for Microsoft AD CS](high-availability-cdp-and-aia.md)
- [Configuring an Online Responder (OCSP) with an HSM](configuring-an-online-responder-ocsp-with-hsm.md)
- [Migrating AD CS to a New Server with an HSM-Protected CA Key](migrating-ad-cs-to-a-new-server.md)
- [Moving a CA Private Key from Software to an HSM](moving-a-ca-private-key-from-software-to-hsm.md)
- [Decommissioning a Certificate Authority](decommissioning-a-certificate-authority.md)
