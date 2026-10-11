---
title: "Onboarding to HSMaaS"
category: "Products"
section: "HSM-as-a-Service"
article_type: "How-to"
applies_to: "Encryption Consulting HSMaaS; Thales Luna Network HSM 7 and Luna Cloud HSM (DPoD); Entrust nShield Connect; AWS CloudHSM Client SDK 5; Azure Managed HSM"
summary: "Onboarding steps for EC HSMaaS: scoping, HSM build, and client setup for Luna, Luna Cloud HSM, nShield Connect, AWS CloudHSM, and Azure Managed HSM."
keywords: ["HSMaaS onboarding", "lunacm clientconfig deploy", "nethsmenroll", "CloudHSM configure-pkcs11", "Managed HSM security domain"]
last_reviewed: "2026-10-06"
---

# Onboarding to HSMaaS

This article explains how a new customer is onboarded to Encryption Consulting (EC) HSM-as-a-Service (HSMaaS). It covers the project phases and the first client connection for each supported Hardware Security Module (HSM) platform. It is for application owners, system administrators, and security teams.

## Overview

Onboarding has four phases: scope, build, connect, and accept. EC builds and operates the HSM side. The customer installs HSM client software on application servers and connects them. The full split of duties is in [HSM-as-a-Service overview](hsm-as-a-service-overview.md).

## Applies to

- Thales Luna Network HSM 7 with Luna HSM Client 10.x.
- Thales Luna Cloud HSM on Data Protection on Demand (DPoD).
- Entrust nShield Connect (XC, 5c) with Security World software 12.x or 13.x.
- AWS CloudHSM with Client SDK 5.
- Azure Key Vault Managed HSM.

Command options change between releases. Verify against the vendor documentation for the installed version.

## Prerequisites

- A signed order or trial request, and a named technical contact.
- A list of applications that will use the HSM, with the interface each one needs (PKCS#11, Microsoft CNG, or Java JCE).
- Application servers with a supported operating system and administrator or root access.
- Firewall change rights between application servers and the HSM endpoints.
- A secure channel to receive credentials from EC. See [Secure file sharing with EC support](../../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md).

## Before starting

- **Credentials:** EC sends partition or user credentials out of band. Never store them in scripts or tickets.
- **Quorum:** If the design uses quorum (nShield K of N card sets or Luna M of N PED keys), name the custodians before the build.
- **HA:** Plan high availability from day one. Adding it later means reconfiguring applications. See [HSMaaS high availability and backup](hsmaas-high-availability-and-backup.md).

## Procedure

### Phase 1: Scope

1. Join the kickoff call. Share applications, key types, expected operations per second, and compliance needs.
2. Agree the platform, region, and number of partitions or key stores.
3. Agree network connectivity (internet, VPN, or private link). EC provides the endpoints and ports during onboarding.

### Phase 2: Build (EC)

EC initializes the HSMs, creates partitions or key stores, sets up clustering or HA, and runs any key ceremony. EC then sends the customer its role credentials and the connection details.

### Phase 3: Connect the first client

Follow the section for the platform in scope.

#### Thales Luna Network HSM 7

1. Install Luna HSM Client with the Network HSM component.
2. Create the Network Trust Link over the Network Trust Link Service (NTLS, TCP port 1792) in one step from lunacm. The tool uses pscp and plink to exchange certificates with the appliance:

```bash
/usr/safenet/lunaclient/bin/lunacm
lunacm:> clientconfig deploy -server <HSM_IP> -client <client_IP_or_hostname> -partition <partition_name> -user admin
```

3. If EC registers the client on the appliance instead, create the client certificate and send only the public certificate to EC:

```bash
sudo /usr/safenet/lunaclient/bin/vtl createCert -n <client_hostname>
sudo /usr/safenet/lunaclient/bin/vtl addServer -n <HSM_IP> -c server.pem
```

4. The server list is stored in `/etc/Chrystoki.conf` on Linux and `crystoki.ini` in the Luna Client folder on Windows (usually `C:\Program Files\SafeNet\LunaClient`).

#### Thales Luna Cloud HSM (DPoD)

1. EC creates the service and a service client in the DPoD console and sends the client .zip package securely.
2. Unpack it. On Linux:

```bash
unzip <Service>_client.zip
tar xvf cvclient-min.tar
```

On Windows, unzip the package and then `cvclient-min.zip` in the same folder.
3. From the unpacked folder, start lunacm (`./bin/64/lunacm` on Linux, `lunacm.exe` on Windows). If EC has not already initialized the partition, run:

```text
slot set -slot <slot_number>
partition init -label <partition_label>
role login -name partition so
role init -name crypto officer
role logout
role login -name crypto officer
role changepw -name crypto officer
```

The Crypto Officer must change the password at first login. The package includes its own `Chrystoki.conf` (Linux) or `crystoki.ini` (Windows).

#### Entrust nShield Connect

1. Install Security World software on the client.
2. Get the Connect electronic serial number (ESN) and KNETI key hash:

```bash
/opt/nfast/bin/anonkneti <Connect_IP>
```

3. Send the client IP to EC. EC adds the client to the Connect configuration (`hs_clients` section) and pushes it.
4. Enroll the client (default hardserver port 9004). Use `--privileged` only if EC has allowed a privileged connection:

```bash
/opt/nfast/bin/nethsmenroll <Connect_IP> <ESN> <KNETI_hash>
```

5. Get the Security World files from the Remote File System (RFS):

```bash
/opt/nfast/bin/rfs-sync --setup <RFS_IP>
/opt/nfast/bin/rfs-sync --update
```

6. The client configuration is in `/opt/nfast/kmdata/config/config` (Linux) or `%NFAST_KMDATA%\config\config` (Windows). Run `cfg-reread` after manual edits.

#### AWS CloudHSM (Client SDK 5)

1. Install the PKCS#11, JCE, or KSP client package for the operating system.
2. Copy the cluster issuing certificate from EC to `/opt/cloudhsm/etc/customerCA.crt` (Linux).
3. Point the client at an HSM in the cluster:

```bash
sudo /opt/cloudhsm/bin/configure-pkcs11 -a <HSM_ENI_IP>
```

4. Allow TCP ports 2223 to 2225 from the client to the cluster security group.
5. Who owns the cluster AWS account, as agreed during onboarding.

#### Azure Managed HSM

1. EC provisions and activates the Managed HSM. Activation downloads the security domain, which needs at least three RSA wrapping keys and a quorum:

```bash
az keyvault security-domain download --hsm-name <hsm_name> --sd-wrapping-keys <c1.cer> <c2.cer> <c3.cer> --sd-quorum 2 --security-domain-file <hsm_name>-SD.json
```

2. Agree who holds the security domain wrapping keys before activation.
3. EC grants application identities a local role-based access control (RBAC) role, for example:

```bash
az keyvault role assignment create --hsm-name <hsm_name> --role "Managed HSM Crypto User" --assignee <principal_id> --scope /keys
```

Managed HSM uses the Azure Key Vault REST API and SDKs, not PKCS#11. For PKCS#11, CNG, or JCE on Azure, EC uses Azure Cloud HSM.

### Phase 4: Accept

1. Run the checks below on each client.
2. Generate and use a test key, then delete it.
3. Sign the acceptance. EC moves the service into steady-state support.

## Verification

| Platform | Command | Expected result |
|---|---|---|
| Luna | `lunacm` then `slot list` | Partition appears as a slot |
| Luna | `vtl verify` | Partition listed |
| nShield | `enquiry` | Module mode "operational" |
| nShield | `nfkminfo` | Security World "Initialised Usable" |
| AWS CloudHSM | `cloudhsm-cli interactive` then `login --username <user> --role crypto-user` | Login succeeds |
| Azure Managed HSM | `az keyvault key list --hsm-name <hsm_name>` | Command returns without error |

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Luna: no slots in lunacm | NTLS blocked or client not assigned to partition | Open TCP 1792; ask EC to check client assignment |
| Luna: certificate errors on connect | Client hostname or IP differs from registered name | Re-create cert with the exact name and re-register |
| nShield: `enquiry` shows module "unknown" | Client not in Connect `hs_clients` | Ask EC to add the client and push config |
| nShield: `nfkminfo` shows no world | RFS sync not done | Run `rfs-sync --setup` and `--update` |
| CloudHSM: connection timeout | Security group blocks 2223 to 2225 | Fix security group or route |
| Managed HSM: 403 Forbidden | Missing local RBAC role | Ask EC to assign the right role and scope |

## Related articles

- [HSM-as-a-Service overview](hsm-as-a-service-overview.md)
- [Connecting applications to HSMaaS: PKCS#11, CNG, and JCE](connecting-applications-to-hsmaas-pkcs11-cng-jce.md)
- [Enrolling a client with an nShield Connect](../../04-Featured-Articles/HSM-Runbooks/enrolling-a-client-with-an-nshield-connect.md)
- [How HSM partitions work](../../04-Featured-Articles/HSM-Runbooks/how-hsm-partitions-work.md)
- [Thales Luna HSM concepts](../../02-General/HSM/thales-luna-hsm-concepts.md)
