---
title: "How CBOM Secure Works"
category: "Products"
section: "CBOM Secure"
article_type: "Concept"
applies_to: "CBOM Secure (all deployment models)"
summary: "Explains how CBOM Secure discovers cryptography, normalizes findings, maps dependencies, scores risk, and builds a CycloneDX Cryptographic Bill of Materials."
keywords: ["CBOM Secure architecture", "cryptographic discovery", "crypto inventory process", "call graph reachability", "CBOM generation"]
last_reviewed: "2026-10-06"
---

# How CBOM Secure Works

This article explains the flow inside CBOM Secure, from scanning a source to producing a Cryptographic Bill of Materials (CBOM). It is for administrators planning scans, security teams reading results, and support staff troubleshooting gaps in an inventory.

## What it is

CBOM Secure is a discovery and analysis pipeline. Scanning agents and connectors collect cryptographic facts from many sources. The server combines them into one inventory, links related items (for example a certificate, its key, and the algorithm used), scores risk, and exports the result as CycloneDX.

## Why it matters

- **Cryptography is spread everywhere.** It lives in code, libraries, configuration files, keystores, HSMs, cloud services, and network protocols. No single team sees it all.
- **Quantum risk needs an inventory first.** NIST IR 8547 (draft) plans to deprecate quantum-vulnerable algorithms such as RSA and ECDSA after 2030 and disallow them after 2035. Migration cannot be planned without knowing where they are.
- **Incidents need fast answers.** When a library vulnerability (CVE) is published, the inventory shows which applications use the affected function.

## How it works

1. **Configure sources.** Administrators add sources such as repositories, HSMs, cloud accounts, and databases, with read-only credentials.
2. **Collect.** Agents and connectors gather metadata:
   - Code and binaries: crypto library imports and function calls, algorithm names, key sizes, modes, and hard-coded keys or secrets.
   - Keystores, HSMs, and key managers: key types, sizes, labels, creation dates, and whether keys are hardware-protected.
   - Certificates: subject, issuer, validity, signature algorithm, public key algorithm and size.
   - Endpoints and protocols: TLS versions and cipher suites, SSH settings.
3. **Normalize.** Different names for the same thing (for example "SHA256withRSA" and "RSA-SHA256") are mapped to one standard entry with an Object Identifier (OID) where possible.
4. **Correlate and map dependencies.** Findings are linked: certificate to key, key to algorithm, algorithm to library, library to application. For source code, call graph reachability separates code that runs in production paths from dormant code.
5. **Classify and score.** Each asset is scored on a four-band risk scale using algorithm strength, key size, quantum exposure, NIST alignment, sensitivity, key reuse, and storage (HSM or software). Band names: {{TBD: CBOM Secure risk band names and thresholds}}.
6. **Report.** Dashboards and reports show trends, compliance status, and PQC readiness.
7. **Export.** The inventory is exported as a CycloneDX 1.6 (or 1.7) CBOM for audits, tools, and partners.
8. **Repeat.** Scheduled scans keep the inventory current and show change over time.

> **Note:** CBOM Secure collects metadata. It does not export or read private key values.

## Key terms

| Term | Meaning |
|---|---|
| Cryptographic Bill of Materials (CBOM) | A machine-readable list of cryptographic assets and their relationships. |
| CycloneDX | An OWASP standard for bills of materials. Version 1.6 added cryptographic assets. |
| Cryptographic asset | An algorithm, certificate, protocol, or related crypto material such as a key. |
| Sensor or agent | A component that collects data from one kind of source. |
| Call graph reachability | Analysis that tests whether a function can actually be reached from an application entry point. |
| Quantum-vulnerable algorithm | An algorithm broken by a large quantum computer, such as RSA, ECDSA, ECDH, and DH. |
| Object Identifier (OID) | A globally unique number that names an algorithm or object. |

## Common questions

**Does scanning affect production systems?**
Scans are read-only, but some sources (for example HSMs and databases) should be scanned in quiet hours at first. See [Running a first cryptographic scan](running-a-first-cryptographic-scan.md).

**Can it find cryptography inside third-party binaries?**
Yes, binary scanning looks for known crypto libraries and patterns. Coverage depends on the format: {{TBD: supported binary formats}}.

**How is this different from an SBOM?**
A Software Bill of Materials (SBOM) lists software components. A CBOM lists the cryptography inside and around them. See [CBOM vs SBOM](../../02-General/CBOM/cbom-vs-sbom.md).

**How often should scans run?**
Monthly is a common starting point, with code scans on each release. Adjust to the rate of change.

## Related articles

- [CBOM Secure overview](cbom-secure-overview.md)
- [CBOM Secure supported scan sources](cbom-secure-supported-scan-sources.md)
- [Reading a CBOM report](reading-a-cbom-report.md)
- [How CBOM works](../../02-General/CBOM/how-cbom-works.md)
- [What is a CBOM](../../02-General/CBOM/what-is-a-cbom.md)
