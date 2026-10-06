---
title: "Free EC Tools: CSR Generator and Decoders"
category: "Working with EC Support"
section: "Learning and Resources"
article_type: "How-to"
applies_to: "EC free online tools: CSR Generator, ASN.1 decoder, OpenSSL decoder, CBOM ROI calculator, PQC Readiness Assessment"
summary: "How to use EC free tools (CSR Generator, ASN.1 and OpenSSL decoders, CBOM ROI calculator, PQC Readiness Assessment) safely, with local command equivalents."
keywords: ["CSR generator", "ASN.1 decoder", "OpenSSL decoder", "PQC readiness assessment", "decode certificate"]
last_reviewed: "2026-10-06"
---

# Free EC Tools: CSR Generator and Decoders

Encryption Consulting (EC) offers free online tools for everyday certificate and cryptography tasks. This article describes each tool, when to use it, and how to stay safe while using it. It also lists equivalent local commands for teams that cannot paste data into web tools.

## Overview

| Tool | What it does | Link |
|---|---|---|
| CSR Generator | Builds the command or request needed for a Certificate Signing Request (CSR) | {{TBD: CSR Generator URL}} |
| ASN.1 decoder | Shows the Abstract Syntax Notation One (ASN.1) structure of a certificate, CSR, or other encoded object | {{TBD: ASN.1 decoder URL}} |
| OpenSSL decoder | Decodes a certificate or CSR into readable fields | {{TBD: OpenSSL decoder URL}} |
| CBOM ROI calculator | Estimates the value of building a Cryptographic Bill of Materials (CBOM) | {{TBD: CBOM ROI calculator URL}} |
| PQC Readiness Assessment | A 20 question self-assessment of post-quantum cryptography (PQC) readiness | {{TBD: PQC Readiness Assessment URL}} |

## Applies to

All EC customers and the public. No account is needed {{TBD: confirm whether any tool requires sign-in}}.

## Prerequisites

- A modern web browser.
- For local equivalents: OpenSSL 3.x on Linux or macOS, or `certutil` on Windows.

## Before starting

> **Warning:** Never paste a private key into any online tool, including EC tools. Certificates, CSRs, and CRLs contain only public data and are safe to decode. A private key block starts with `-----BEGIN PRIVATE KEY-----`, `-----BEGIN RSA PRIVATE KEY-----`, `-----BEGIN EC PRIVATE KEY-----`, or `-----BEGIN ENCRYPTED PRIVATE KEY-----`.

- Generate private keys on the server, device, or HSM where they will be used. Do not generate keys in a browser and copy them around.
- Check the organization's policy before pasting internal certificate data into an external site.

## Procedure

### Use the CSR Generator

1. Open the CSR Generator.
2. Enter the subject details: Common Name (CN), Organization (O), Country (C), and other fields as needed.
3. Add Subject Alternative Names (SANs). Public TLS certificates are validated against SANs, not the CN.
4. Choose the key type and size, for example RSA 2048 or 3072, or ECDSA P-256.
5. Copy the generated command and run it on the target system.

Example of the kind of OpenSSL command produced:

```bash
openssl req -new -newkey rsa:3072 -nodes \
  -keyout <server-name>.key -out <server-name>.csr \
  -subj "/C=US/O=Contoso/CN=www.contoso.com" \
  -addext "subjectAltName=DNS:www.contoso.com,DNS:contoso.com"
```

The private key file stays on the system where the command runs. Protect it with strict file permissions, or use an HSM-backed key instead.

On Windows, a CSR is usually created with `certreq` and an INF file:

```cmd
certreq -new <request.inf> <request.csr>
```

### Decode a certificate or CSR

1. Open the OpenSSL decoder or ASN.1 decoder.
2. Paste the PEM text, including the `-----BEGIN CERTIFICATE-----` or `-----BEGIN CERTIFICATE REQUEST-----` lines.
3. Review the subject, issuer, validity dates, SANs, key usage, and extended key usage (EKU).

Local equivalents:

```bash
openssl x509 -in <certificate.pem> -noout -text
openssl req -in <request.csr> -noout -text -verify
openssl asn1parse -in <certificate.pem>
```

```cmd
certutil -dump <certificate.cer>
certutil -dump <request.csr>
```

### Check a certificate against its key, locally

To confirm a certificate matches its private key without exposing the key, compare public key hashes on the server:

```bash
openssl x509 -in <certificate.pem> -noout -pubkey | openssl sha256
openssl pkey -in <server-name>.key -pubout | openssl sha256
```

The two hashes must match.

### Run the PQC Readiness Assessment

1. Open the assessment and answer the 20 questions.
2. Review the score and suggested next steps.
3. Use the results with [PQC maturity model](../02-General/Post-Quantum-Cryptography/pqc-maturity-model.md) to plan the next stage.

## Verification

- The decoded output shows the expected subject, SANs, and dates.
- The CSR passes `openssl req -verify`.
- No private key was pasted into a web page.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Decoder shows "invalid input" | DER binary file pasted, or header lines missing | Convert with `openssl x509 -inform der -in <file.cer> -out <file.pem>` and include header lines |
| CA rejects the CSR | Missing SAN, weak key, or wrong key type | Regenerate with SANs and a supported key size |
| Certificate and key do not match | CSR made on another system | Reissue the certificate from a CSR made with the correct key |

## Related articles

- [PKI fundamentals](../02-General/PKI/pki-fundamentals.md)
- [What to include in a support case](what-to-include-in-a-support-case.md)
- [Certutil command reference](../04-Featured-Articles/PKI-Runbooks/certutil-command-reference.md)
- [PQC readiness checklist 2026](../05-Popular-Right-Now/pqc-readiness-checklist-2026.md)
- [Using CBOM Secure for PQC readiness](../01-Products/CBOM-Secure/using-cbom-secure-for-pqc-readiness.md)
