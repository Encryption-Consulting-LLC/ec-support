---
title: "Integrating CodeSign Secure with CI/CD Pipelines"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure v3.2.1  and later with GitHub Actions, GitLab CI/CD, Jenkins, Azure DevOps, TeamCity, and Bamboo"
summary: "Add CodeSign Secure signing to GitHub Actions, GitLab, Jenkins, Azure DevOps, TeamCity, and Bamboo with self-hosted agents and secrets."
keywords: ["CI/CD code signing", "GitHub Actions signing", "Jenkins code signing", "Azure DevOps signing", "GitLab CI signing", "TeamCity signing", "Bamboo signing", "self-hosted runner"]
last_reviewed: "2026-10-08"
---

# Integrating CodeSign Secure with CI/CD Pipelines

This article shows how to add a signing step to Continuous Integration and Continuous Delivery (CI/CD) pipelines with CodeSign Secure. It covers the agent setup that every platform needs, then gives working examples for GitHub Actions, GitLab CI/CD, Jenkins, Azure DevOps, TeamCity, and Bamboo. It is for DevOps engineers and build administrators.

## Overview

The pattern is the same on every platform:

1. A **self-hosted agent** (runner) has a CodeSign Secure client installed and configured: the Encryption Consulting KSP with SignTool on Windows, or the PKCS#11 Wrapper on Linux, macOS, or Windows.
2. The pipeline reads credentials from the platform's **secret store**.
3. A signing step calls the native tool (SignTool, jarsigner, apksigner, and so on).
4. A verification step checks the signature before artifacts are published.

The private key never reaches the agent. If the pipeline is compromised, the attacker can't copy the key, and team mapping and the Audit Trail still limit and record what is signed.

## Applies to

- CodeSign Secure v3.2.1  and later.
- Documented platforms: GitHub Actions, GitLab CI/CD, Jenkins, Azure DevOps, TeamCity, and Bamboo. Other platforms that can run a self-hosted agent with a CodeSign Secure client can use the same pattern.

## Before starting

- **Use a No Approval environment for automated signing.** Approvals time out after a fixed 100 seconds, and a timed-out request fails the job. If releases need human approval, use your CI/CD platform's approval gate before the signing step. See [Approval workflows and signing policies](approval-workflows-and-signing-policies.md).
- **Use a dedicated CodeSign Secure user per pipeline**, with only the **CodeSigning Operation** permission (plus **API Access** if the pipeline calls the API), and its own authentication certificate.
- **Sign only on protected branches or release tags**, so pull requests from forks can't reach the secrets.
- **Never commit** `.pfx` files, `ec_pkcs11client.ini`, passwords, or passcodes. Make sure secrets are masked in job logs.

## Set up a Windows agent (KSP and SignTool)

Every Windows example below assumes this agent setup.

1. Install and configure the Encryption Consulting KSP and SignTool on the agent machine, as described in [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md).
2. Install the agent (GitHub runner, GitLab Runner, Jenkins, Azure Pipelines agent, TeamCity agent, or Bamboo agent) and **run it as a Windows service**.
3. Set the service to **log on as an account with administrator privileges**, as the product guides require for SignTool signing. In `services.msc`, open the agent service, select **Log On > This account**, enter the account and password, and restart the service.
4. Configure the KSP **for that same account**. The KSP's registry settings are under `HKEY_CURRENT_USER`, so values set by a different account aren't visible to the service. Set `EC_Client_Auth` and `EC_Client_Pass` as system variables or for that account.
5. Store the authentication `.pfx` in a folder only that account can read.
6. Restart the agent service after any change to the variables or registry.
7. Get the signing certificate file on the agent. Either download it from **Keys and Certificates**, or run `ECGetCert.exe <key-name>` from `C:\Program Files\Encryption Consulting\SigningKSP`, which saves `<key-name>.pem`.

> **Note:** Hosted, short-lived agents would need the KSP installed in every job. Use self-hosted agents for KSP signing. For unattended installation options, contact EC support.

## Platform examples: Windows KSP and SignTool

In all examples, replace `<key-name>` with the key name of your certificate and `<certificate>.pem` with the path to its certificate file. `/fd` accepts `SHA256`, `SHA384`, or `SHA512`.

### GitHub Actions

1. In the repository, open **Settings > Actions > Runners > New self-hosted runner**, choose Windows, and run the commands GitHub shows.
2. When `config.cmd` asks for labels, **enter a label** (for example `codesign`). You use it in `runs-on`.
3. Answer **Y** to run as a service, and give an account with administrator privileges.
4. Add a workflow under `.github/workflows/`:

```yaml
name: Code Signing
on:
  push:
    tags: ["v*"]
jobs:
  sign:
    runs-on: [self-hosted, codesign]
    environment: production-signing
    steps:
      - uses: actions/checkout@v4
      - name: Sign
        shell: cmd
        run: signtool sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f "<certificate>.pem" /tr http://timestamp.digicert.com /td SHA256 "<path-to-file>"
      - name: Verify
        shell: cmd
        run: signtool verify /pa /v "<path-to-file>"
```

Use a GitHub environment with required reviewers (here `production-signing`) to approve release jobs before they reach the signing step.

### GitLab CI/CD

1. Install GitLab Runner on the agent and register it with `.\gitlab-runner.exe register`, using the **Shell** executor and a tag such as `codesign`.
2. In `services.msc`, set **GitLab Runner** to log on as an account with administrator privileges.
3. Store `EC_Client_Pass` as a CI/CD variable marked **Masked** and **Protected**. Protected variables are only exposed to protected branches and tags.

```yaml
sign:
  tags:
    - codesign
  rules:
    - if: $CI_COMMIT_TAG
  variables:
    EC_Client_Auth: 'C:\EC\AuthCert.pfx'
  script:
    - signtool sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f "<certificate>.pem" /tr http://timestamp.digicert.com /td SHA256 "<path-to-file>"
    - signtool verify /pa /v "<path-to-file>"
```

### Jenkins

1. In `services.msc`, set the **Jenkins** service to log on as an account with administrator privileges (**Log On > This account**), not Local System or Network Service.
2. Install the PowerShell plugin from **Manage Jenkins > Plugins** if your pipeline uses it.
3. Create a **Pipeline** job:

```groovy
pipeline {
  agent any
  environment {
    EC_KEY_NAME = '<key-name>'
    EC_CLIENT_CERT_FILE = 'C:\\EC\\<certificate>.pem'
    EC_HASHING_ALGORITHM = 'SHA256'
    EC_TIME_STAMP_SERVER = 'http://timestamp.digicert.com'
    EC_FILEPATH = 'C:\\build\\output\\app.exe'
  }
  stages {
    stage('Code Signing') {
      steps {
        bat 'signtool sign /csp "Encryption Consulting Key Storage Provider" /kc %EC_KEY_NAME% /fd %EC_HASHING_ALGORITHM% /f %EC_CLIENT_CERT_FILE% /tr %EC_TIME_STAMP_SERVER% /td SHA256 %EC_FILEPATH%'
        bat 'signtool verify /pa /v %EC_FILEPATH%'
      }
    }
  }
}
```

> **Note:** The `EC_` variables in this pipeline are only names passed to SignTool. They are separate from the KSP settings `EC_Client_Auth` and `EC_Client_Pass`, which are set on the agent.

### Azure DevOps

1. Install the Azure Pipelines agent from **Project settings > Agent pools > Default > New agent**, and configure it with `.\config.cmd`, using a personal access token (PAT).
2. Run the agent as a service, and in `services.msc` set **Azure Pipelines Agent** to log on as an account with administrator privileges.
3. Create a pipeline:

```yaml
trigger:
  tags:
    include: ["v*"]
pool:
  name: Default
steps:
  - script: signtool sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f "<certificate>.pem" /tr http://timestamp.digicert.com /td SHA256 "<path-to-file>"
    displayName: Sign
  - script: signtool verify /pa /v "<path-to-file>"
    displayName: Verify
```

Store secrets as secret variables or in a variable group linked to Azure Key Vault. Secret variables must be mapped into a step's `env` explicitly.

### TeamCity

1. Run the TeamCity build agent service under an account with the KSP configured.
2. In the build configuration, select **Add Build Step > Command Line**, choose **Custom script**, and add the signing command:

```cmd
"C:\Program Files (x86)\Windows Kits\10\bin\<sdk-version>\x64\signtool.exe" sign /csp "Encryption Consulting Key Storage Provider" /kc <key-name> /fd SHA256 /f "<certificate>.crt" /tr http://timestamp.digicert.com /td SHA256 "<path-to-file>"
```

3. Add a second Command Line step that runs `signtool.exe verify /pa "<path-to-file>"`.

Store passwords as **Password** parameters, which are hidden in the build log.

### Bamboo

1. Install a Bamboo agent on the Windows machine with the KSP configured.
2. In the plan, select **Add Task > Script**, set the location to **Inline**, and add the same SignTool command as for TeamCity.
3. Run the plan and check the signature in the file's **Properties > Digital Signatures**.

Bamboo masks variables whose names contain `password`, `secret`, or `passphrase`.

## Platform examples: PKCS#11 Wrapper

The PKCS#11 Wrapper reads the path to its configuration file from `EC_INI_FILE_PATH`. Keep `ec_pkcs11client.ini` (and the `.pfx` it points to) in the secret store and let the platform provide the path at run time. Replace `EC-Cert-020` with your certificate's key label. We will be using jarsigner as an example here, you can check other supported tools with PKCS11 Wrapper as well.

**GitLab CI/CD.** Create a CI/CD variable of type **File** named `EC_INI_FILE_PATH` whose value is the content of your INI file, and mark it **Protected**. GitLab writes it to a temporary file and sets the variable to that file's path.

```yaml
sign-jar:
  stage: sign
  rules:
    - if: $CI_COMMIT_TAG
  script:
    - jarsigner -keystore NONE -storetype PKCS11 -storepass NONE -providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11properties.cfg -sigalg SHA256withRSA -tsa http://timestamp.digicert.com -signedjar app-signed.jar app.jar EC-Cert-020
```

**Jenkins.** Store the INI file as a **Secret file** credential with the ID `ec-pkcs11-ini`.

```groovy
stage('Sign') {
  steps {
    withCredentials([file(credentialsId: 'ec-pkcs11-ini', variable: 'EC_INI_FILE_PATH')]) {
      sh 'jarsigner -keystore NONE -storetype PKCS11 -storepass NONE -providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11properties.cfg -sigalg SHA256withRSA -tsa http://timestamp.digicert.com -signedjar app-signed.jar app.jar EC-Cert-020'
    }
  }
}
```

**Azure DevOps.** Upload the INI file to **Pipelines > Library > Secure files**.

```yaml
- task: DownloadSecureFile@1
  name: ecIni
  inputs:
    secureFile: 'ec_pkcs11client.ini'
- script: jarsigner -keystore NONE -storetype PKCS11 -storepass NONE -providerClass sun.security.pkcs11.SunPKCS11 -providerArg pkcs11properties.cfg -sigalg SHA256withRSA -tsa http://timestamp.digicert.com -signedjar app-signed.jar app.jar EC-Cert-020
  env:
    EC_INI_FILE_PATH: $(ecIni.secureFilePath)
```

> **Note:** The `.pfx` path inside the INI file must point to a location the agent can read. Keep that file in a folder only the build account can read, or download it in the same job from the secret store.

## Verification

- The pipeline's verification step passes.
- **Reports > Audit Trail** shows the request under the pipeline's dedicated user, with the certificate used.
- Released artifacts verify on a clean machine.

## Credential maintenance

- Renew each authentication certificate before its **Valid Till** date, update the agent or secret store, restart the agent service, and run a test signing.
- Rotate passcodes and API keys on a schedule, and whenever someone who knew them leaves.
- If a credential is exposed, lock the user in **System Setup > User** until new credentials are issued, then review the Audit Trail.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Signing works interactively but fails in the pipeline | The agent service runs as another account without the KSP settings | Set the service's log-on account and configure the KSP for it. |
| Job fails after about 100 seconds at the signing step | The certificate needs approval | Use a No Approval certificate for automation. |
| Provider or library not found on hosted agents | Client not installed on the ephemeral agent | Use a self-hosted agent. |
| Secret value is empty | Secret not mapped to the step (Azure DevOps), or variable not protected for this ref (GitLab) | Map secret variables explicitly. Protect the tag or branch. |
| Signing step fails only on fork pull requests | Secrets aren't passed to fork builds (expected) | Sign only on protected branches and tags. |
| `EC_INI_FILE_PATH` not found | Variable not set for this step or shell | Set it in the same step that signs. |

See also [Troubleshooting SignTool and Encryption Consulting KSP errors](troubleshooting-signtool-and-ec-ksp-errors.md) and [Troubleshooting PKCS#11 Wrapper errors](troubleshooting-pkcs11-wrapper-errors.md).

## Related articles

- [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md)
- [Signing Java JAR files with jarsigner](signing-java-jar-files-with-jarsigner.md)
- [Signing container images](signing-container-images.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
