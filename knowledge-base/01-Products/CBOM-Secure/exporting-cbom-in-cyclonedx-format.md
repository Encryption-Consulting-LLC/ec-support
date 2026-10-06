---
title: "Exporting CBOM in CycloneDX Format"
category: "Products"
section: "CBOM Secure"
article_type: "How-to"
applies_to: "CBOM Secure exports in CycloneDX 1.6 JSON (and 1.7 where offered)"
summary: "How to export a CBOM Secure inventory as a CycloneDX 1.6 CBOM, check the file structure, validate it against the schema, and query it with common tools."
keywords: ["export CBOM", "CycloneDX 1.6 CBOM", "CBOM JSON", "validate CycloneDX", "cryptographic-asset"]
last_reviewed: "2026-10-06"
---

# Exporting CBOM in CycloneDX Format

This article explains how to export a Cryptographic Bill of Materials (CBOM) from CBOM Secure in the CycloneDX format, what the file contains, and how to validate and query it. It is for security teams who share the CBOM with auditors, customers, or other tools.

## Overview

CycloneDX is an OWASP standard for bills of materials. Version 1.6 added full support for cryptographic assets, which made CycloneDX the common format for CBOMs. CBOM Secure exports CycloneDX 1.6, and EC states support for CycloneDX 1.7 export as well. A CBOM file is usually JSON.

## Applies to

CBOM Secure in all deployment models. Examples use CycloneDX 1.6 JSON.

## Prerequisites

- A completed scan with results.
- Console permission to export: {{TBD: CBOM Secure role or permission required for export}}.
- Optional tools: `jq` for queries, and the CycloneDX CLI for schema validation.

## Before starting

- **Treat the CBOM as sensitive.** It is a map of an organization's cryptography and weak points. Share it only with people who need it, and protect it in transit and at rest.
- Decide the scope of each export (for example one application, one business unit, or everything). Smaller exports are easier to share.

## Procedure

### Phase 1: Export from the console

1. Open the inventory or report view: {{TBD: console menu path for CBOM export}}.
2. Apply filters for the scope required (application, source, risk band, asset type).
3. Choose the export format: CycloneDX 1.6 JSON (or 1.7 if required by the receiving tool). Other formats offered: {{TBD: other CBOM Secure export formats, for example XML, CSV, PDF}}.
4. Download the file and store it in a protected location.

### Phase 2: Export through the API (optional)

For automation, use the CBOM Secure API: {{TBD: CBOM Secure API endpoint and authentication for CBOM export}}. A generic pattern:

```bash
curl -sS -H "Authorization: Bearer <api-token>" \
  "https://<cbom-secure-host>/<export-endpoint>?format=cyclonedx&version=1.6" \
  -o cbom.json
```

### Phase 3: Understand the file structure

A minimal CycloneDX 1.6 CBOM looks like this:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "serialNumber": "urn:uuid:<uuid>",
  "version": 1,
  "metadata": {
    "timestamp": "2026-10-06T12:00:00Z",
    "component": { "type": "application", "bom-ref": "app/contoso-payments", "name": "Contoso-Payments" }
  },
  "components": [
    {
      "type": "cryptographic-asset",
      "bom-ref": "crypto/algorithm/ecdsa-p256-sha256",
      "name": "ECDSA-P256-SHA256",
      "cryptoProperties": {
        "assetType": "algorithm",
        "algorithmProperties": {
          "primitive": "signature",
          "curve": "secp256r1",
          "cryptoFunctions": ["sign", "verify"],
          "classicalSecurityLevel": 128,
          "nistQuantumSecurityLevel": 0
        },
        "oid": "1.2.840.10045.4.3.2"
      }
    },
    {
      "type": "cryptographic-asset",
      "bom-ref": "crypto/key/contoso-tls-key",
      "name": "Contoso-TLS-Key",
      "cryptoProperties": {
        "assetType": "related-crypto-material",
        "relatedCryptoMaterialProperties": {
          "type": "private-key",
          "algorithmRef": "crypto/algorithm/ecdsa-p256-sha256",
          "size": 256,
          "state": "active"
        }
      }
    },
    {
      "type": "cryptographic-asset",
      "bom-ref": "crypto/certificate/contoso-tls",
      "name": "payments.contoso.example",
      "cryptoProperties": {
        "assetType": "certificate",
        "certificateProperties": {
          "subjectName": "CN=payments.contoso.example",
          "issuerName": "CN=Contoso-Issuing-CA-01",
          "notValidBefore": "2026-03-20T00:00:00Z",
          "notValidAfter": "2026-10-06T00:00:00Z",
          "signatureAlgorithmRef": "crypto/algorithm/ecdsa-p256-sha256",
          "subjectPublicKeyRef": "crypto/key/contoso-tls-key",
          "certificateFormat": "X.509"
        }
      }
    },
    {
      "type": "cryptographic-asset",
      "bom-ref": "crypto/protocol/tls-1.3",
      "name": "TLS 1.3",
      "cryptoProperties": {
        "assetType": "protocol",
        "protocolProperties": {
          "type": "tls",
          "version": "1.3",
          "cipherSuites": [
            { "name": "TLS_AES_256_GCM_SHA384", "identifiers": ["0x13", "0x02"] }
          ]
        }
      }
    }
  ],
  "dependencies": [
    { "ref": "app/contoso-payments", "dependsOn": ["crypto/protocol/tls-1.3", "crypto/certificate/contoso-tls"] }
  ]
}
```

Key points:

- Every cryptographic item has `"type": "cryptographic-asset"` and a `cryptoProperties.assetType` of `algorithm`, `certificate`, `protocol`, or `related-crypto-material`.
- Items link to each other through `bom-ref` values (for example `algorithmRef`, `signatureAlgorithmRef`, `subjectPublicKeyRef`).
- The `dependencies` array shows which components depend on others (`dependsOn`) and, from 1.6, which components provide others (`provides`).
- How CBOM Secure adds its own risk scores or locations (for example in `properties` or `evidence`): {{TBD: CBOM Secure extension fields in CycloneDX export}}.

See [Reading a CBOM report](reading-a-cbom-report.md) for field meanings.

### Phase 4: Validate the file

Validate against the CycloneDX 1.6 schema with the CycloneDX CLI:

```bash
cyclonedx validate --input-file cbom.json --input-format json --input-version v1_6 --fail-on-errors
```

### Phase 5: Query the file

Count assets by type:

```bash
jq '[.components[] | select(.type=="cryptographic-asset") | .cryptoProperties.assetType] | group_by(.) | map({type: .[0], count: length})' cbom.json
```

List algorithms with no quantum security:

```bash
jq -r '.components[] | select(.cryptoProperties.algorithmProperties.nistQuantumSecurityLevel == 0) | .name' cbom.json
```

List certificates expiring before a date:

```bash
jq -r '.components[] | select(.cryptoProperties.assetType=="certificate") | select(.cryptoProperties.certificateProperties.notValidAfter < "2027-01-01") | "\(.name) \(.cryptoProperties.certificateProperties.notValidAfter)"' cbom.json
```

## Verification

- The file opens as valid JSON and passes schema validation.
- `specVersion` matches what the receiving tool expects.
- Asset counts in the file match the filtered view in the console.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Receiving tool rejects the file | Tool supports only an older CycloneDX version | Export 1.6 instead of 1.7, or update the tool. CycloneDX 1.5 and earlier have no CBOM fields. |
| Schema validation errors on custom fields | Extra fields outside the schema | Report the error and the CBOM Secure version to EC support. |
| File very large | Export scope too broad | Filter by application or source and export in parts. |
| Broken references (`algorithmRef` not found) | Partial export filtered out linked components | Include related assets in the export scope. |

## Related articles

- [Reading a CBOM report](reading-a-cbom-report.md)
- [Using CBOM Secure for PQC readiness](using-cbom-secure-for-pqc-readiness.md)
- [What is a CBOM](../../02-General/CBOM/what-is-a-cbom.md)
- [CBOM use cases and compliance drivers](../../02-General/CBOM/cbom-use-cases-and-compliance-drivers.md)
- [Secure file sharing with EC support](../../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md)
