---
title: "HSMaaS FAQ"
category: "Products"
section: "HSM-as-a-Service"
article_type: "FAQ"
applies_to: "Encryption Consulting HSM-as-a-Service (HSMaaS)"
summary: "Answers to common questions about EC HSMaaS: supported HSMs, FIPS 140-3, key ownership, interfaces, HA, backup, Azure Dedicated HSM retirement, and support."
keywords: ["HSMaaS FAQ", "managed HSM questions", "FIPS 140-3 HSM", "cloud HSM key ownership", "Azure Dedicated HSM retirement"]
last_reviewed: "2026-10-06"
---

# HSMaaS FAQ

This article answers common questions about Encryption Consulting (EC) HSM-as-a-Service (HSMaaS). It is for security teams, application owners, and buyers.

### What is HSMaaS?

HSMaaS is a managed service in which EC deploys, integrates, and operates Hardware Security Modules (HSMs) for a customer. HSMs can be in the cloud, on-premises, or both. The customer keeps control of its keys, users, and access policies.

### Which HSM platforms are supported?

Thales Luna Network HSM and Luna Cloud HSM, Entrust nShield, AWS CloudHSM, Azure Managed HSM and Azure Cloud HSM, Google Cloud HSM, and Oracle Cloud Infrastructure (OCI) Vault HSM. EC recommends a platform based on the workload.

### Are the HSMs FIPS validated?

Yes. HSMaaS uses FIPS 140-3 validated HSMs, Level 3 where required. FIPS 140-2 certificates move to the Cryptographic Module Validation Program (CMVP) Historical list on September 21, 2026, so new deployments should target FIPS 140-3. Check the exact certificate number for each model and firmware: {{TBD: HSMaaS FIPS certificate numbers per platform}}.

### Who owns the keys?

The customer. Keys are generated inside the HSM and do not leave it in plain form. EC operators manage the platform but do not hold the customer application role credentials.

### Which tasks does EC own and which does the customer own?

EC owns hardware, initialization, firmware, partitions, HA, backups, and HSM monitoring. The customer owns application keys, HSM client software on its servers, application configuration, and its own user credentials. The full table is in [HSM-as-a-Service overview](hsm-as-a-service-overview.md).

### How do applications connect?

Through standard interfaces: PKCS#11, Microsoft Cryptography API: Next Generation (CNG) Key Storage Providers, and Java JCA/JCE providers (LunaProvider for Luna, nCipherKM for nShield, CloudHsmProvider for AWS). See [Connecting applications to HSMaaS](connecting-applications-to-hsmaas-pkcs11-cng-jce.md).

### Can HSMaaS protect a Microsoft AD CS CA key?

Yes. Active Directory Certificate Services (AD CS) uses the HSM CNG Key Storage Provider. See [Configuring AD CS with an HSM KSP](../../04-Featured-Articles/HSM-Runbooks/configuring-ad-cs-with-an-hsm-ksp.md).

### What about Azure Dedicated HSM?

Microsoft is retiring Azure Dedicated HSM. Existing customers are supported until July 31, 2028, and new onboardings are not accepted. Microsoft points new customers to Azure Cloud HSM, Azure Managed HSM, or Azure Key Vault. EC helps plan the migration.

### Does Azure Managed HSM support PKCS#11?

Azure Managed HSM is used through the Azure Key Vault REST API and SDKs. For PKCS#11, CNG, or JCE on Azure, Azure Cloud HSM is the better fit.

### How is high availability provided?

Luna HA groups, nShield load sharing across modules in one Security World, AWS CloudHSM clusters across Availability Zones, and built-in HA in Azure Managed HSM. See [HSMaaS high availability and backup](hsmaas-high-availability-and-backup.md).

### How often are keys backed up?

It depends on the platform and contract. AWS CloudHSM takes automatic backups at least every 24 hours. Other schedules: {{TBD: HSMaaS backup schedule per platform}}.

### Is post-quantum cryptography supported?

ML-KEM and ML-DSA are supported where the HSM firmware provides them. Support differs by vendor and firmware version. See [PQC readiness for PKI and HSM](../../02-General/Post-Quantum-Cryptography/pqc-readiness-for-pki-and-hsm.md).

### Where are HSMaaS HSMs hosted and what is the SLA?

{{TBD: HSMaaS hosting regions}} and {{TBD: HSMaaS availability SLA}}. Support response targets are in [Support severity levels and response targets](../../00-Working-with-EC-Support/support-severity-levels-and-response-targets.md).

### What should a support case include?

The platform and model, client and firmware versions, slot or module status output, exact error codes (for example `CKR_` codes), and the time of the failure. Never send passwords, PIN Entry Device (PED) keys, or smart cards. See [Collecting HSM and PKI diagnostics for support](../../00-Working-with-EC-Support/collecting-hsm-and-pki-diagnostics-for-support.md).

## Related articles

- [HSM-as-a-Service overview](hsm-as-a-service-overview.md)
- [Onboarding to HSMaaS](onboarding-to-hsmaas.md)
- [What is an HSM](../../02-General/HSM/what-is-an-hsm.md)
- [FIPS 140-3 security levels explained](../../02-General/HSM/fips-140-3-security-levels-explained.md)
