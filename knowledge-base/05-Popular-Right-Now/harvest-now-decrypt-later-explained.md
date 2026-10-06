---
title: "Harvest Now, Decrypt Later (HNDL) Explained: The Quantum Threat to Data Today"
category: "Popular Right Now"
section: "Popular Right Now"
article_type: "Concept"
applies_to: "Data in transit and at rest, TLS, VPN, key management, PQC planning"
summary: "What harvest now, decrypt later (HNDL) attacks are, which data is at risk, how Mosca's theorem sets urgency, and steps such as ML-KEM hybrid key exchange."
keywords: ["harvest now decrypt later", "HNDL", "store now decrypt later", "quantum threat", "Mosca's theorem", "post-quantum cryptography"]
primary_keyword: "harvest now decrypt later"
secondary_keywords: ["HNDL attack", "store now decrypt later", "quantum computing threat to encryption", "Mosca's theorem", "data at risk from quantum", "post-quantum key exchange"]
last_reviewed: "2026-10-06"
---

# Harvest Now, Decrypt Later (HNDL) Explained: The Quantum Threat to Data Today

"Harvest now, decrypt later" (HNDL) is an attack where an adversary copies encrypted data today and waits until a quantum computer can break the encryption. It is the main reason post-quantum cryptography (PQC) is urgent even though large quantum computers do not exist yet. This article explains how HNDL works, which data is most at risk, and what to do now. It is written for security leaders, risk owners, and architects.

## Key takeaways

- HNDL attacks target data that must stay secret for many years.
- The attack works because most key exchange today uses RSA or elliptic curve algorithms, which a future quantum computer could break.
- Symmetric encryption such as AES-256 is not the weak point. The key exchange that protects the AES key is.
- Mosca's theorem helps decide urgency: if data lifetime plus migration time is longer than the time until a quantum computer arrives, the data is already at risk.
- Hybrid post-quantum key exchange (for example X25519MLKEM768 in TLS 1.3) stops HNDL for new traffic now.
- Data already captured cannot be protected after the fact, so the earlier the switch, the better.

## What is a harvest now, decrypt later attack?

The attack has two stages:

1. **Harvest.** The attacker records encrypted network traffic or steals encrypted files and backups. Today they cannot read them.
2. **Decrypt later.** When a Cryptographically Relevant Quantum Computer (CRQC) becomes available, the attacker uses Shor's algorithm to recover the private keys or session keys, then decrypts the stored data.

The same idea is also called "store now, decrypt later" (SNDL) or "capture now, decrypt later".

## Why is current encryption vulnerable to HNDL?

Most secure connections use two kinds of cryptography:

| Layer | Typical algorithm today | Quantum impact |
|---|---|---|
| Key exchange | ECDH (X25519, P-256) or RSA key transport | Broken by Shor's algorithm on a CRQC |
| Bulk encryption | AES-128 or AES-256 | Weakened only modestly by Grover's algorithm; AES-256 remains strong |
| Authentication | RSA or ECDSA signatures | Broken by Shor's algorithm, but only useful to an attacker in real time |

An attacker who records a TLS session also records the key exchange messages. Breaking the key exchange later reveals the AES session key, and with it the full content. That is why key exchange is the top priority for HNDL defense.

## What data is most at risk?

Data is at risk when it must stay confidential longer than the time until a CRQC exists. Examples:

- Government and defense information with long classification periods.
- Health records and genetic data, which stay sensitive for a lifetime.
- Financial records, trade secrets, and merger plans.
- Intellectual property such as designs, source code, and research.
- Identity data, credentials, and long-lived keys sent over the network.
- Backups and archives encrypted with keys wrapped by RSA.

Short-lived data, such as a one-time session token, carries little HNDL risk.

## How urgent is HNDL? Mosca's theorem

Michele Mosca's simple rule helps set priorities. Let:

- **X** be how long the data must stay secret (shelf life).
- **Y** be how long it takes to migrate systems to quantum-safe cryptography.
- **Z** be how long until a CRQC exists.

If **X + Y > Z**, the data is already exposed to HNDL risk.

| Example | X (shelf life) | Y (migration time) | X + Y | Risk if Z is 10 years |
|---|---|---|---|---|
| Session cookies | under 1 year | 3 years | about 4 years | Low |
| Customer financial records | 7 years | 5 years | 12 years | High |
| Health records | 25 years or more | 5 years | 30 years or more | Very high |

Nobody knows the exact value of Z. That uncertainty is why NIST, the NSA, and other agencies set migration dates in the 2030 to 2035 range. See [Quantum risk assessment and Mosca's theorem](../02-General/Post-Quantum-Cryptography/quantum-risk-assessment-and-moscas-theorem.md).

## Is HNDL actually happening?

Government agencies, including the NSA and the U.S. Cybersecurity and Infrastructure Security Agency (CISA), have warned that adversaries may be collecting encrypted data for future decryption. Large-scale traffic capture is technically easy and cheap to store. Organizations should assume sensitive traffic crossing untrusted networks could be recorded.

## How to protect against harvest now, decrypt later

1. **Enable hybrid post-quantum key exchange in TLS.** X25519MLKEM768 is on by default in Chrome, Firefox, and other modern clients. Turn it on in web servers, load balancers, and CDNs. See [Chrome ML-KEM hybrid key exchange](chrome-ml-kem-hybrid-key-exchange.md).
2. **Upgrade VPNs and internal links.** Use vendor support for ML-KEM in IPsec and other tunnels, especially for site-to-site links that carry sensitive data.
3. **Use AES-256 for stored data.** AES-256 has a comfortable margin against quantum attacks.
4. **Review key wrapping.** Data encryption keys wrapped with RSA, for example in backups or cloud key management, inherit RSA's quantum weakness. Plan a move to ML-KEM or symmetric key wrapping.
5. **Reduce what can be harvested.** Minimize sensitive data sent across untrusted networks and shorten retention where possible.
6. **Build a cryptographic inventory** to find where vulnerable key exchange is still used.

## Does HNDL affect digital signatures?

Not in the same way. A forged signature only helps an attacker if it is accepted at the time it is used. Old signatures cannot be "harvested" to gain secret data. However, long-lived signatures on firmware, documents, and roots of trust still need a quantum-safe plan, because the systems that check them may be in use when a CRQC arrives.

## How EC can help

- [CBOM Secure overview](../01-Products/CBOM-Secure/cbom-secure-overview.md): find vulnerable key exchange and key wrapping across code, cloud, and HSMs.
- [What is post-quantum cryptography](../02-General/Post-Quantum-Cryptography/what-is-post-quantum-cryptography.md): background on PQC.
- [PQC advisory and readiness assessment](../03-Services/pqc-advisory-and-readiness-assessment.md): prioritize systems using HNDL risk.
- [PQC readiness checklist 2026](pqc-readiness-checklist-2026.md): practical first steps.

## Frequently asked questions

### What does harvest now, decrypt later mean?

It means attackers collect encrypted data today and store it so they can decrypt it later, once quantum computers can break the public-key cryptography that protected it.

### Is AES-256 safe from harvest now, decrypt later?

AES-256 itself is considered quantum resistant. The risk comes from the key exchange or key wrapping that protected the AES key, if it used RSA or elliptic curves.

### Can data that was already captured be protected?

No. Once encrypted traffic has been recorded with classical key exchange, nothing done later protects that copy. This is why early adoption of post-quantum key exchange matters.

### When will quantum computers be able to break RSA?

No one knows. Estimates vary widely. Government agencies plan for quantum-vulnerable algorithms to be retired by 2035, and some sensitive systems sooner.

### Does HTTPS in Chrome already protect against HNDL?

Yes, when the server also supports it. Chrome uses X25519MLKEM768 by default, so connections to servers that support it are protected against HNDL for the key exchange.
