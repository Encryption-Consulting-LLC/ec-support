---
title: "Troubleshooting CertSecure Manager"
category: "Products"
section: "CertSecure Manager"
article_type: "Troubleshooting"
applies_to: "CertSecure Manager (all deployment models); Microsoft AD CS, public CAs, F5 BIG-IP, IIS, NGINX, Apache, Tomcat"
summary: "Fixes for common CertSecure Manager issues: RPC errors to AD CS, template permission denials, scan timeouts, expired service accounts, and incomplete chains."
keywords: ["CertSecure Manager troubleshooting", "RPC server is unavailable", "0x80094012", "discovery timeout", "incomplete certificate chain"]
last_reviewed: "2026-10-06"
---

# Troubleshooting CertSecure Manager

This article lists common CertSecure Manager problems, their likely causes, and how to fix them. It is grouped by area: CA connections, discovery, renewal and deployment, ACME, integrations, and the platform. It is for CertSecure Manager administrators and EC support engineers.

## How to use this article

1. Find the area where the failure happened (the job log in CertSecure Manager shows the failing stage).
2. Match the error text or symptom in the tables below.
3. Run the quick checks for that area.
4. If the issue remains, collect the items listed under "Before opening a case" and contact EC support.

## Quick checks

Run these from the host that runs the failing component (the platform server or the on-premises component).

```powershell
# Reach the AD CS CA
Test-NetConnection -ComputerName <CAHostFQDN> -Port 135
certutil -config "<CAHostFQDN>\<CA Common Name>" -ping
certutil -config "<CAHostFQDN>\<CA Common Name>" -CATemplates

# Check DNS and time
Resolve-DnsName <CAHostFQDN>
w32tm /query /status
```

```bash
# Check what an endpoint presents, including the chain
openssl s_client -connect <host>:443 -servername <host> -showcerts </dev/null

# Check that a certificate and key match (RSA)
openssl x509 -noout -modulus -in <cert.pem> | openssl sha256
openssl rsa  -noout -modulus -in <key.pem>  | openssl sha256
```

## Microsoft AD CS connection

| Symptom | Likely cause | Resolution |
|---|---|---|
| "The RPC server is unavailable. 0x800706ba (WIN32: 1722)" | Firewall blocks TCP 135 or the dynamic RPC range (49152 to 65535), wrong CA hostname, or the Certificate Services (CertSvc) service stopped | Test port 135, open the dynamic range or the fixed CA port, check DNS, and confirm CertSvc is running on the CA |
| "Denied by Policy Module 0x80094012" (template permissions do not allow enroll) | Service account lacks **Read** or **Enroll** on the template | Grant **Read** and **Enroll** on the template Security tab and allow time for Active Directory replication |
| "The requested certificate template is not supported by this CA. 0x80094800" | Template not published on this CA | Add it under **Certificate Templates to Issue**, or select the correct CA |
| "Access is denied. 0x80070005" | Missing **Request Certificates** permission on the CA, or account not in the **Certificate Service DCOM Access** group | Fix CA security and the local DCOM group on the CA |
| Request goes to pending | Template requires CA certificate manager approval | Approve in the CA console, or grant **Issue and Manage Certificates** if the platform should approve |
| Revoke from CertSecure Manager fails | Service account lacks **Issue and Manage Certificates** | Grant the permission only if revocation from the platform is required |
| All AD CS jobs fail at the same time after working | Service account password expired, account locked, or account disabled | Check the account in Active Directory, reset the password, update the stored credential, set up rotation |
| Kerberos errors or "clock skew" | Time difference between hosts more than 5 minutes (default Kerberos tolerance) | Fix NTP on the component host |
| Certificate issued with wrong subject | Template builds subject from Active Directory | Use a template with **Supply in the request**, and restrict who can enroll |

## Discovery

| Symptom | Likely cause | Resolution |
|---|---|---|
| Discovery scan times out | Scan range too large, high latency, or firewall drops packets without reply | Split ranges, reduce concurrency, increase timeout, and check firewall logs |
| Hosts reachable but no certificates found | Ports not in scope, or the service needs Server Name Indication (SNI) | Add the ports and scan by hostname |
| Scanner blocked mid-scan | Intrusion prevention or rate limiting | Allow-list the scanner IP with the Security Operations Center (SOC) |
| CA import returns nothing | Connector cannot read the CA database | For AD CS, reading issued certificates needs **Issue and Manage Certificates** |
| Cloud discovery fails | Missing read permission or wrong region | Fix the cloud role and region list |

## Renewal and deployment

| Symptom | Likely cause | Resolution |
|---|---|---|
| Clients show "unable to get local issuer certificate" or "incomplete chain" after renewal | Chain incomplete on the endpoint | Deploy the full chain: NGINX file with leaf first then intermediates, Apache `SSLCertificateFile` with intermediates appended, F5 **Chain** field in the Client SSL profile, IIS intermediates in the Intermediate Certification Authorities store |
| "Private key not exportable" | Deployment needs a PFX but the key was created non-exportable (template setting or source store) | Generate the key on the endpoint, or reissue from a template with **Allow private key to be exported** if policy allows |
| Access denied on the endpoint | Endpoint service account password expired or rights changed | Reset password, update the credential, confirm rights |
| WinRM connection fails | WinRM not enabled, or TCP 5985 or 5986 blocked | Run `Test-WSMan <host>`, enable WinRM, open the port |
| SSH connection fails to Linux endpoint | Host key changed, key or password wrong, or TCP 22 blocked | Confirm host key, credentials, and firewall |
| NGINX or Apache will not reload | Key does not match certificate, wrong path, or wrong permissions | Compare modulus hashes, check paths, run `nginx -t` or `apachectl configtest` |
| F5 standby unit has the old certificate | Configuration not synced in the device group | Run config sync or enable sync in the connection |
| IIS still serves the old certificate | Binding not updated, or wrong SNI binding | Check `netsh http show sslcert` and the site bindings |
| Tomcat still serves the old certificate | Connector not reloaded | Restart Tomcat or reload the connector |

## ACME

| Symptom | Likely cause | Resolution |
|---|---|---|
| "externalAccountRequired" | External Account Binding (EAB) values missing | Supply EAB key ID and HMAC key |
| http-01 challenge fails | TCP 80 blocked or redirect to another host | Open port 80 from the ACME server and test the token URL |
| dns-01 challenge fails | TXT record not yet visible | Add a propagation delay and check the record |
| TLS error to the ACME directory | Client does not trust the server certificate | Add the internal root CA to the client trust store |

## Integrations and platform

| Symptom | Likely cause | Resolution |
|---|---|---|
| No alert emails | SMTP relay rejects the platform | Allow the platform on the relay and check its logs |
| ServiceNow HTTP 401 or 403 | Bad credentials or missing roles or ACLs | Fix the integration user |
| Console certificate warning | Console TLS certificate expired or not trusted | Renew the console certificate from a trusted CA |
| On-premises component shows offline | Outbound HTTPS blocked by proxy, or component service stopped | Check proxy rules and the component service |
| Slow console | Database or server resources low | Check CPU, memory, and database resource use |

## Before opening a case

Collect:

- The CertSecure Manager version and deployment model.
- The job ID and the exact error text, with a screenshot.
- Component and platform logs for the time of the failure.
- Output of the quick checks above.
- For AD CS issues: CA name, template name, and the CA event log entries (Application log, source CertificationAuthority).

Then follow [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md). Share logs only through [secure file sharing](../../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md). Never send private keys.

## Related articles

- [Connecting CertSecure Manager to Microsoft AD CS](connecting-certsecure-manager-to-microsoft-ad-cs.md)
- [Certificate discovery in CertSecure Manager](certificate-discovery-in-certsecure-manager.md)
- [Automating certificate renewal and deployment](automating-certificate-renewal-and-deployment.md)
- [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md)
- [CertSecure Manager FAQ](certsecure-manager-faq.md)
