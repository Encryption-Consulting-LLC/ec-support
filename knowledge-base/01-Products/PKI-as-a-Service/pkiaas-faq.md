---
title: "PKIaaS FAQ"
category: "Products"
section: "PKI-as-a-Service"
article_type: "FAQ"
applies_to: "Encryption Consulting PKI-as-a-Service (PKIaaS)"
summary: "Answers to common questions about EC PKIaaS: key ownership, HSMs, AD CS coexistence, Intune, ACME, revocation, post-quantum readiness, and support."
keywords: ["PKIaaS FAQ", "managed PKI questions", "PKIaaS key ownership", "private CA Intune", "PKIaaS revocation"]
last_reviewed: "2026-10-06"
---

# PKIaaS FAQ

This article answers the questions customers ask most often about Encryption Consulting (EC) PKI-as-a-Service (PKIaaS). It is for PKI owners, security teams, and buyers.

### What is PKIaaS?

PKIaaS is a private Public Key Infrastructure (PKI) that EC builds and runs. It includes root and issuing Certificate Authorities (CAs), Hardware Security Modules (HSMs) to protect CA keys, revocation services, and enrollment endpoints. The customer owns the CA and sets the policy. EC runs the platform.

### Who owns the CA and its private keys?

The customer owns the CA. The private keys are generated and kept inside FIPS 140-3 Level 3 validated HSMs operated by EC. Terms for key ownership and transfer at contract end are in the service agreement: {{TBD: PKIaaS key ownership and exit terms}}.

### Is the CA shared with other customers?

No. PKIaaS is single-tenant. Each customer has a dedicated CA hierarchy and dedicated keys.

### Which tasks does EC handle and which stay with the customer?

EC handles the CA platform, HSMs, key ceremonies, CA renewals, CRL publication, monitoring, and patching. The customer handles approvals, trust store distribution, endpoint certificates, and who may enroll. See the full table in [PKIaaS architecture and shared responsibility](pkiaas-architecture-and-shared-responsibility.md).

### Can PKIaaS work with an existing Microsoft AD CS?

Yes. PKIaaS supports Active Directory Certificate Services (AD CS) integration, including multi-forest and hybrid Active Directory (AD). Many customers run PKIaaS next to an existing AD CS and move use cases in phases.

### Which enrollment methods are supported?

Automated Certificate Management Environment (ACME), Simple Certificate Enrollment Protocol (SCEP), Enrollment over Secure Transport (EST), Windows enrollment (WSTEP), Network Device Enrollment Service (NDES), and Microsoft Intune SCEP and PKCS profiles. See [Enrolling certificates with PKIaaS: ACME, SCEP, and Intune](enrolling-certificates-with-pkiaas-acme-scep-intune.md).

### Does PKIaaS work with Microsoft Intune?

Yes. Intune uses the Certificate Connector for Microsoft Intune to deliver SCEP or PKCS certificates from PKIaaS issuing CAs to managed Windows, macOS, iOS/iPadOS, and Android devices.

### How is revocation handled?

EC publishes Certificate Revocation Lists (CRLs) on a fixed schedule to highly available endpoints. Online Certificate Status Protocol (OCSP) responders are available when in scope. The customer requests revocation through the portal or support: {{TBD: PKIaaS revocation request method and turnaround}}.

### Can PKIaaS issue certificates for public websites?

No. PKIaaS issues private certificates. Browsers do not trust them by default. Public TLS certificates must come from a publicly trusted CA. PKIaaS is the right place for client authentication and mutual TLS (mTLS), which public TLS certificates are losing under Chrome Root Program Policy v1.8 (serverAuth only for certificates issued on or after March 15, 2027).

### Is PKIaaS ready for post-quantum cryptography?

PKIaaS supports hybrid and composite certificates that pair ML-DSA (FIPS 204) with RSA or ECDSA, so customers can pilot post-quantum certificates while keeping classical trust. See [Hybrid and composite certificates](../../02-General/Post-Quantum-Cryptography/hybrid-and-composite-certificates.md).

### Where is PKIaaS hosted?

PKIaaS can run as SaaS in EC-managed infrastructure or on-premises in the customer data center with EC managing it. Available regions: {{TBD: PKIaaS hosting regions}}.

### What compliance does PKIaaS support?

The service is preconfigured to help with NIST, HIPAA, PCI DSS, GDPR, FIPS, and eIDAS requirements. EC is ISO/IEC 27001:2022, SOC 2 Type II, and PCI DSS certified. Audit evidence is available on request.

### What is the availability target?

The availability target and support response times are in the service agreement: {{TBD: PKIaaS availability SLA}}. Support response targets are described in [Support severity levels and response targets](../../00-Working-with-EC-Support/support-severity-levels-and-response-targets.md).

### Is there a trial?

Yes. EC offers a 15-day free trial with no hardware to buy.

### How does a customer get help with PKIaaS?

Open a case in the support portal. Include the CA name, the certificate serial number or request ID, and the time of the failure. See [What to include in a support case](../../00-Working-with-EC-Support/what-to-include-in-a-support-case.md).

## Related articles

- [PKI-as-a-Service overview](pki-as-a-service-overview.md)
- [Onboarding to PKIaaS](onboarding-to-pkiaas.md)
- [PKIaaS architecture and shared responsibility](pkiaas-architecture-and-shared-responsibility.md)
- [Chrome client authentication EKU removal (June 2026)](../../05-Popular-Right-Now/chrome-client-authentication-eku-removal-june-2026.md)
