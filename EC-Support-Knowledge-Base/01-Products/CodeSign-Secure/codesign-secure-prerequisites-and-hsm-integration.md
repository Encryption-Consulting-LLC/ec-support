---
title: "CodeSign Secure Prerequisites and HSM Integration"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure on-premises, cloud, and hybrid deployments with Thales Luna, Luna Cloud HSM (DPoD), Entrust nShield, or other PKCS#11 HSMs"
summary: "Checklist of server, network, and HSM prerequisites for CodeSign Secure, plus steps to connect a Thales Luna, Entrust nShield, or other PKCS#11 HSM."
keywords: ["CodeSign Secure prerequisites", "HSM integration", "Thales Luna PKCS#11", "Entrust nShield PKCS#11", "code signing HSM"]
last_reviewed: "2026-10-06"
---

# CodeSign Secure Prerequisites and HSM Integration

This article lists what must be in place before installing CodeSign Secure and explains how to connect it to a Hardware Security Module (HSM). It is for administrators preparing an on-premises, cloud, or hybrid deployment. SaaS customers can skip the server and HSM sections, because EC operates those parts.

## Overview

CodeSign Secure needs three things to sign code: a server (or the EC SaaS service), an HSM that holds the signing keys, and signing clients on the machines that run signing tools. The server talks to the HSM through the HSM vendor client software and its PKCS#11 library.

## Applies to

- CodeSign Secure on-premises, cloud, and hybrid deployments.
- Thales Luna Network HSM, Thales Luna Cloud HSM (Data Protection on Demand, DPoD), Entrust nShield Connect and nShield 5c, and other PKCS#11 HSMs supported by EC ({{TBD: list of supported HSM models and firmware versions}}).

## Prerequisites

### Server

| Item | Requirement |
|---|---|
| Operating system | {{TBD: supported server operating systems and versions}} |
| CPU, memory, disk | {{TBD: minimum and recommended sizing}} |
| Database | {{TBD: supported database engines and versions}} |
| Web server certificate | A TLS certificate for the CodeSign Secure web console and API, issued by a CA trusted by all clients. |
| Time sync | Network Time Protocol (NTP) configured. Clock drift breaks authentication and audit records. |

### Network

| Connection | Port |
|---|---|
| Signing clients to CodeSign Secure server | {{TBD: CodeSign Secure API port}} |
| Administrators to web console | {{TBD: CodeSign Secure web console port}} |
| CodeSign Secure server to Thales Luna Network HSM | TCP 1792 (NTLS), per Thales defaults |
| CodeSign Secure server to Entrust nShield Connect | TCP 9004 (hardserver), per Entrust defaults |
| Signing clients to Time Stamping Authority (TSA) | HTTP 80 or HTTPS 443, depending on the TSA URL |

> **Note:** Confirm vendor ports against the vendor documentation for the installed HSM client version.

### HSM

- HSM initialized and in a FIPS-approved mode if required by policy.
- A dedicated partition (Luna) or Security World and card set or softcard (nShield) for code signing keys.
- HSM client software installed on the CodeSign Secure server, at a version supported by the HSM firmware.
- Credentials: Crypto Officer partition password (Luna) or Operator Card Set (OCS) or softcard passphrase (nShield).

### Accounts and access

- Service account for the CodeSign Secure application.
- Identity source for users: {{TBD: supported identity providers, for example Active Directory, LDAP, SAML, OIDC}}.

## Before starting

- Schedule a change window if the HSM is shared with other applications.
- Back up the HSM partition or Security World before creating new keys.
- Agree on key naming, key algorithms (for example RSA 3072 or 4096, ECDSA P-256 or P-384), and which teams own each key.

## Procedure

### Phase 1: Connect the server to a Thales Luna HSM

1. Install the Luna client on the CodeSign Secure server.
2. Exchange certificates and register the client with the HSM appliance (Network Trust Link Service, NTLS). On the client, use `vtl` or the `lunacm` commands for client registration as described in the Thales documentation.
3. Assign the client to the code signing partition on the appliance.
4. Confirm the partition is visible:

```bash
/usr/safenet/lunaclient/bin/lunacm
lunacm:> slot list
```

5. Note the PKCS#11 library path. Default paths are `/usr/safenet/lunaclient/lib/libCryptoki2_64.so` on Linux and `C:\Program Files\SafeNet\LunaClient\cryptoki.dll` on Windows.

For Luna Cloud HSM (DPoD), download the service client package from the DPoD portal and follow the same slot check.

### Phase 2: Connect the server to an Entrust nShield HSM

1. Install the nShield Security World software on the server.
2. Enroll the client with the nShield Connect using `nethsmenroll`, then permit it on the HSM front panel or through remote configuration.
3. Copy or load the Security World files into the `kmdata/local` folder.
4. Confirm the HSM is reachable and operational:

```bash
/opt/nfast/bin/enquiry
/opt/nfast/bin/nfkminfo
```

5. Note the PKCS#11 library path. Default paths are `/opt/nfast/toolkits/pkcs11/libcknfast.so` on Linux and `C:\Program Files\nCipher\nfast\toolkits\pkcs11\cknfast.dll` on Windows. Set environment variables such as `CKNFAST_LOADSHARING=1` if required by the key protection method.

### Phase 3: Test the PKCS#11 library

Use the OpenSC `pkcs11-tool` to confirm the library loads and slots are listed:

```bash
pkcs11-tool --module <path-to-pkcs11-library> --list-slots
pkcs11-tool --module <path-to-pkcs11-library> --login --list-objects
```

### Phase 4: Register the HSM in CodeSign Secure

1. Sign in to the CodeSign Secure console as an administrator.
2. Open the HSM configuration page: {{TBD: console menu path for HSM configuration}}.
3. Enter the PKCS#11 library path, slot or token label, and the partition credential.
4. Save and run the connection test, if offered: {{TBD: name of HSM connection test action}}.

### Phase 5: Create a key and certificate

1. Generate a key pair in the HSM through CodeSign Secure: {{TBD: console menu path for key generation}}.
2. Create a Certificate Signing Request (CSR) and submit it to the public or internal Certificate Authority (CA).
3. Import the issued certificate and full chain into CodeSign Secure.

### Phase 6: Install signing clients

Install the CodeSign Secure client on each build agent or developer machine: {{TBD: client installer names and supported platforms}}.

## Verification

- The HSM appears as connected in the console.
- A test signing of a sample file succeeds, and the signature verifies (for example `signtool verify /pa /v <file>`).
- An audit record for the test signing appears in the console.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Library fails to load | Wrong path or 32-bit and 64-bit mismatch | Use the 64-bit library path for the installed client. |
| No slots found | Client not registered or not assigned to the partition | Repeat client registration (Luna) or enrollment (nShield). |
| CKR_PIN_INCORRECT | Wrong partition password or passphrase | Confirm the credential with the HSM administrator. Watch lockout thresholds. |
| nShield key not found | Security World files missing on the server | Copy current `kmdata/local` files and rerun `nfkminfo`. |
| TLS error to HSM | Expired or changed client or server certificate | Re-exchange certificates per vendor instructions. |

## Related articles

- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Enrolling a client with an nShield Connect](../../04-Featured-Articles/HSM-Runbooks/enrolling-a-client-with-an-nshield-connect.md)
- [How HSM partitions work](../../04-Featured-Articles/HSM-Runbooks/how-hsm-partitions-work.md)
- [Connecting applications to HSMaaS (PKCS#11, CNG, JCE)](../HSM-as-a-Service/connecting-applications-to-hsmaas-pkcs11-cng-jce.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
