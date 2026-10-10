---
title: "Integrating CodeSign Secure with CI/CD Pipelines"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure with GitHub Actions, GitLab CI/CD, Jenkins, and Azure DevOps Pipelines (also CircleCI, Bamboo, TeamCity)"
summary: "How to add HSM-backed code signing with CodeSign Secure to GitHub Actions, GitLab CI, Jenkins, and Azure DevOps pipelines using secure secrets and native tools."
keywords: ["CI/CD code signing", "GitHub Actions signing", "Jenkins code signing", "Azure DevOps signing", "GitLab CI signing"]
last_reviewed: "2026-10-06"
---

# Integrating CodeSign Secure with CI/CD Pipelines

This article shows how to add a signing step to Continuous Integration and Continuous Delivery (CI/CD) pipelines with CodeSign Secure. It gives working patterns for GitHub Actions, GitLab CI/CD, Jenkins, and Azure DevOps. It is for DevOps engineers and build administrators.

## Overview

The pattern is the same on every platform:

1. A build agent (runner) has the CodeSign Secure client installed.
2. The pipeline reads the CodeSign Secure credential from the platform secret store.
3. A signing step calls the native tool (SignTool, jarsigner, cosign) that uses the CodeSign Secure provider.
4. A verification step checks the signature before artifacts are published.

The private key never reaches the build agent. If the pipeline is compromised, the attacker cannot copy the key, and signing policy still limits what can be signed.

## Applies to

- GitHub Actions (self-hosted or GitHub-hosted runners).
- GitLab CI/CD (GitLab Runner).
- Jenkins (controller and agents).
- Azure DevOps Pipelines (Microsoft-hosted or self-hosted agents).
- The same approach works for CircleCI, Bamboo, and TeamCity.

## Prerequisites

- CodeSign Secure client (`<CodeSign Secure client package>`) installed on the agent, or installed at job start.
- A dedicated service identity in CodeSign Secure for each pipeline, with access only to the keys it needs.
- The credential stored as a secret in the CI/CD platform.
- Network access from agents to the CodeSign Secure API (HTTPS 443 by default) and to the Time Stamping Authority (TSA).

## Before starting

- Sign only on protected branches or release tags. Do not let pull requests from forks reach the signing step.
- Use separate keys or projects for test signing and production signing.
- Mask secrets in logs. Never print the credential.

## Procedure

### GitHub Actions

Store the credential as a repository or organization secret, for example `CSS_API_TOKEN`. Use environments with required reviewers for production signing.

```yaml
name: build-and-sign
on:
  push:
    tags: ["v*"]
jobs:
  sign:
    runs-on: [self-hosted, windows]
    environment: production-signing
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: msbuild <solution.sln> /p:Configuration=Release
      - name: Sign
        env:
          CSS_API_TOKEN: ${{ secrets.CSS_API_TOKEN }}
        shell: cmd
        run: signtool sign /sha1 <certificate-thumbprint> /fd SHA256 /tr <tsa-url> /td SHA256 <path-to-output.exe>
      - name: Verify
        shell: cmd
        run: signtool verify /pa /v <path-to-output.exe>
```

### GitLab CI/CD

Store the credential as a masked and protected CI/CD variable. Protected variables are only exposed to protected branches and tags.

```yaml
sign_jar:
  stage: sign
  image: <build-image-with-jdk-and-codesign-client>
  rules:
    - if: $CI_COMMIT_TAG
  script:
    # CSS_PIN is a masked, protected CI/CD variable
    - >
      jarsigner -keystore NONE -storetype PKCS11
      -addprovider SunPKCS11 -providerArg pkcs11.cfg
      -storepass:env CSS_PIN
      -digestalg SHA-256 -tsa <tsa-url>
      -signedjar app-signed.jar app.jar <key-alias>
    - jarsigner -verify app-signed.jar
  artifacts:
    paths:
      - app-signed.jar
```

### Jenkins

Store the credential in the Jenkins credentials store and bind it with the Credentials Binding plugin.

```groovy
pipeline {
  agent { label 'linux-signing' }
  stages {
    stage('Sign image') {
      when { buildingTag() }
      steps {
        withCredentials([string(credentialsId: 'css-pin', variable: 'CSS_PIN')]) {
          sh '''
            cosign sign --tlog-upload=false \
              --key "pkcs11:token=<token-label>;object=<key-label>?module-path=<path-to-pkcs11-library>&pin-value=${CSS_PIN}" \
              <registry>/<repository>@sha256:<digest>
          '''
        }
      }
    }
  }
}
```

### Azure DevOps Pipelines

Store the credential in a variable group (optionally linked to Azure Key Vault) or as a secret pipeline variable. Secret variables must be mapped into the environment explicitly.

```yaml
trigger:
  tags:
    include: ["v*"]
pool:
  name: <self-hosted-windows-pool>
steps:
  - task: VSBuild@1
    inputs:
      solution: "<solution.sln>"
      configuration: Release
  - script: signtool sign /sha1 <certificate-thumbprint> /fd SHA256 /tr <tsa-url> /td SHA256 <path-to-output.exe>
    displayName: Sign
    env:
      CSS_API_TOKEN: $(CSS_API_TOKEN)
  - script: signtool verify /pa /v <path-to-output.exe>
    displayName: Verify
```

### Approvals in pipelines

If the signing policy requires approval, the signing step waits until approvers act. Set the job timeout long enough, or use the CI/CD platform approval gate first and give the pipeline a policy without CodeSign Secure approval. See [Approval workflows and signing policies](approval-workflows-and-signing-policies.md).

## Verification

- The pipeline verification step passes.
- The CodeSign Secure audit log shows the request with the pipeline service identity, project, and file name.
- Released artifacts verify on a clean machine.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Signing step fails only on fork pull requests | Secrets are not passed to fork builds (expected) | Sign only on protected branches and tags. |
| Job times out at signing | Pending approval or blocked network | Check approvals. Check firewall rules from the agent. |
| Provider or library not found on hosted agents | Client not installed on the ephemeral agent | Install the client in a job step, or use a self-hosted agent image. |
| Secret value appears empty | Secret not mapped to environment (Azure DevOps) or variable not protected for this ref (GitLab) | Map secret variables explicitly. Protect the tag or branch. |
| "Access denied" from CodeSign Secure | Service identity lacks key permission | Update the signing policy. |

## Related articles

- [Signing Windows binaries with SignTool](signing-windows-binaries-with-signtool.md)
- [Signing Java JAR files with jarsigner](signing-java-jar-files-with-jarsigner.md)
- [Signing container images](signing-container-images.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
