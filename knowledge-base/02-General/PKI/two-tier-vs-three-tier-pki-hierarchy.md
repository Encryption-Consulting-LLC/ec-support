---
title: "Two-Tier vs Three-Tier PKI Hierarchy"
category: "General"
section: "PKI"
article_type: "Concept"
applies_to: "Microsoft AD CS and other enterprise PKI designs"
summary: "Compare two-tier and three-tier PKI hierarchies: offline roots, policy CAs, issuing CAs, security, cost, and how to choose the right design for an organization."
keywords: ["two-tier PKI", "three-tier PKI", "offline root CA", "policy CA", "issuing CA", "PKI hierarchy"]
last_reviewed: "2026-10-06"
---

# Two-Tier vs Three-Tier PKI Hierarchy

This article compares the most common Certificate Authority (CA) hierarchy designs and explains when each one fits. It is for architects and administrators planning a new Public Key Infrastructure (PKI) or reviewing an existing Microsoft Active Directory Certificate Services (AD CS) deployment.

## What it is

A PKI hierarchy is the arrangement of CAs that sign each other's certificates. The number of levels between the root CA and the certificates issued to servers, users, and devices is called the number of tiers.

- **Single-tier (one-tier):** one root CA issues all certificates. It must stay online, so the root key is always exposed. It is only suitable for labs or very small, low-risk uses.
- **Two-tier:** an offline root CA signs one or more online issuing CAs. The issuing CAs issue end-entity certificates.
- **Three-tier:** an offline root CA signs one or more offline intermediate CAs (often called policy CAs). The policy CAs sign online issuing CAs.

## Why it matters

The hierarchy decides how well the organization can contain a compromise, apply different policies, and recover. Changing a hierarchy later means re-issuing many certificates and redistributing trust anchors, so the decision has a long life. Root CA certificates commonly last 15 to 25 years.

## How it works

### Two-tier hierarchy

1. The root CA is built on a standalone (non-domain-joined) server, ideally with a Hardware Security Module (HSM).
2. The root signs the issuing CA certificates and publishes a Certificate Revocation List (CRL), then is shut down and stored securely.
3. The root is powered on only to renew issuing CA certificates and to sign a new root CRL before the previous one expires (for example every 6 or 12 months).
4. The issuing CAs are Enterprise CAs joined to Active Directory. They use certificate templates and issue certificates every day.

### Three-tier hierarchy

1. The offline root signs one or more policy CAs.
2. Each policy CA is also kept offline. It can carry a different certificate policy, for example one policy CA for internal identities and another for external partners, or one per region or legal entity.
3. Policy CAs sign the online issuing CAs.
4. If a policy CA must be revoked, only its branch is affected. The root and other branches keep working.

## Comparison

| Factor | Two-tier | Three-tier |
|---|---|---|
| Number of CAs to run | Fewer (root plus issuing CAs) | More (root, policy CAs, issuing CAs) |
| Offline ceremonies | Root only | Root and each policy CA |
| Policy separation | Through templates and issuance policies on issuing CAs | Through separate policy CAs, each with its own policy and constraints |
| Blast radius of an intermediate compromise | Revoke the affected issuing CA | Revoke one policy CA branch without touching others |
| Chain length for clients | Shorter, faster validation | One more certificate in every chain |
| Operating cost and skills | Lower | Higher (more HSMs, ceremonies, CRLs to keep current) |
| Typical fit | Most enterprises, including large ones | Very large or regulated organizations, multiple legal entities, strict separation needs |

## How to choose

- Choose **two-tier** for most organizations. It balances security and simplicity, and Microsoft guidance treats it as the common design for AD CS.
- Choose **three-tier** when there is a clear need to separate policy or administration, such as different assurance levels, separate business units with their own operators, or external parties that must be cut off independently.
- Avoid **single-tier** in production. An online root that is compromised forces a full rebuild and trust redistribution.
- Plan **more than one issuing CA** for capacity and resilience, rather than adding a tier.
- Keep **CRL Distribution Point (CDP) and Authority Information Access (AIA)** locations highly available. A long chain is only as available as its slowest revocation check.

> **Tip:** A third tier does not add security by itself. It adds isolation. If the same team, the same HSM, and the same procedures control every CA, a third tier mostly adds cost.

## Key terms

| Term | Meaning |
|---|---|
| Offline root CA | Root CA kept powered off and disconnected from networks except during ceremonies |
| Policy CA | An intermediate CA, usually offline, that defines the policy for the CAs below it |
| Issuing CA | Online CA that issues end-entity certificates |
| Path length constraint | A Basic Constraints value that limits how many CA levels may appear below a CA |
| Name constraints | An extension that limits which names subordinate CAs may issue for |
| Cross-certification | One CA signs another hierarchy's CA certificate so the two can trust each other |

## Common questions

### Can a two-tier PKI be converted to three-tier later?
Yes, but it means building new policy CAs and new issuing CAs under them, then migrating certificate issuance. Existing certificates keep working until they expire or are replaced.

### Should the offline root be a virtual machine?
It can be, if the virtual machine is stored encrypted, kept offline, and its key is in an HSM. A physical or virtual setup must both follow strict access control and a documented key ceremony. See [Key ceremonies explained](../HSM/key-ceremonies-explained.md).

### How often must the offline root come online?
At least once per root CRL period to publish a fresh CRL, and whenever a subordinate CA certificate must be issued or renewed. See [Root CA CRL renewal (offline root)](../../04-Featured-Articles/PKI-Runbooks/root-ca-crl-renewal-offline-root.md).

### Can EC review an existing hierarchy?
Yes. A [PKI assessment](../../03-Services/pki-assessment.md) reviews the design against current practice, and [PKI design and implementation](../../03-Services/pki-design-and-implementation.md) covers new builds.

## Related articles

- [PKI fundamentals](pki-fundamentals.md)
- [PKI security best practices](pki-security-best-practices.md)
- [CRL vs OCSP](crl-vs-ocsp.md)
- [Issuing CA certificate renewal](../../04-Featured-Articles/PKI-Runbooks/issuing-ca-certificate-renewal.md)
- [Key ceremonies explained](../HSM/key-ceremonies-explained.md)
