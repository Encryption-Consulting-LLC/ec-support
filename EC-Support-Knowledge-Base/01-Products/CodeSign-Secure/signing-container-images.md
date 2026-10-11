---
title: "Signing Container Images"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure v3.2.1  and later with ec-signer and Sigstore cosign on a Linux container build host, with optional Kubernetes enforcement"
summary: "Sign container images with ec-signer and cosign using keys in CodeSign Secure, and allow only signed images in Kubernetes with the webhook."
keywords: ["sign container images", "ec-signer", "cosign", "container image signing HSM", "Kubernetes admission webhook", "CodeSign Secure container signing"]
last_reviewed: "2026-10-08"
---

# Signing Container Images

This article explains how to sign container images with CodeSign Secure and how to make Kubernetes accept only signed images. Signing uses **ec-signer**, the CodeSign Secure container signing component, together with Sigstore cosign. It is for platform engineers and DevOps teams who publish container images.

## Overview

A container image signature proves who published an image and that it hasn't changed. ec-signer works with cosign on the build host: the signing key stays in the Hardware Security Module (HSM) behind CodeSign Secure, and each signature follows the certificate's environment policy and team mapping. The signature is pushed to the registry as a separate signature image next to your image.

For deployment-time enforcement, CodeSign Secure provides two Kubernetes services: an **image verifier** and an **image validation webhook**. Together they block any image that isn't signed.

## Applies to

- CodeSign Secure v3.2.1  and later.
- A Linux container build host (the product guide uses Ubuntu) with Python and Docker.
- Docker Hub, as used in the product guide.

## Prerequisites

- A signing certificate in CodeSign Secure, mapped to a team that includes your user.
- An authentication certificate (`.pfx`) and its password, from **System Setup > User > Generate Authentication Certificate**.
- A Docker Hub account with push access to the repository.
- The **Container Signing Tools** package, downloaded from **Signing Tools**.

## Procedure

### Phase 1: Install cosign

The product guide pins cosign v2.0.0 as a working example. If you use a newer release, update both the download URL and the file name so they match.

```bash
# Binary
wget "https://github.com/sigstore/cosign/releases/download/v2.0.0/cosign-linux-amd64"
mv cosign-linux-amd64 /usr/local/bin/cosign
chmod +x /usr/local/bin/cosign

# Or, Debian or Ubuntu package
wget "https://github.com/sigstore/cosign/releases/download/v2.0.0/cosign_2.0.0_amd64.deb"
dpkg -i cosign_2.0.0_amd64.deb

# Or, RPM package
wget "https://github.com/sigstore/cosign/releases/download/v2.0.0/cosign-2.0.0.x86_64.rpm"
rpm -ivh cosign-2.0.0.x86_64.rpm
```

### Phase 2: Install Python and Docker

```bash
sudo apt-get install docker.io
sudo apt-get install python-is-python3
sudo apt install python3-pip
sudo apt-get install python3-docker
sudo apt-get -y install python3-openssl
sudo apt-get install -y dbus-user-session
sudo apt-get install -y docker-ce-rootless-extras
```

If `docker-ce-rootless-extras` can't be found, add Docker's official repository first:

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce-rootless-extras
```

Then sign in to Docker Hub:

```bash
sudo docker login
```

### Phase 3: Configure ec-signer

1. Extract the Container Signing Tools package and open the `SignImage` folder.
2. Edit `ec-signer.conf` and set:
   - The CodeSign Secure URL.
   - The path to your authentication certificate (`.pfx`).
   - The authentication certificate's password.
3. Restrict the file to the build user, because it holds a password: `chmod 600 ec-signer.conf`.

### Phase 4: Sign the image

From the `SignImage` folder:

```bash
./ec-signer --project_name=<certificate-name> --image_name=<target-image> --docker_username=<docker-username>
```

| Option | Value |
|---|---|
| `--project_name` | The name of the signing certificate in CodeSign Secure |
| `--image_name` | The image to sign, for example `<docker-username>/<repository>:<tag>` |
| `--docker_username` | Your Docker Hub username |

ec-signer asks for your Docker Hub password and for root privileges. When it finishes, a new signature image appears in your Docker Hub repository.

If the certificate's environment needs approval, an approver must act within 100 seconds. For automated pipelines, use a certificate in a No Approval environment.

## Enforce signed images in Kubernetes (optional)

The product guide uses k3s as the example cluster:

```bash
curl -sfL https://get.k3s.io | sh -
```

### Deploy the image verifier service

1. Go to `VerifyImage/image-verifier` in the Container Signing Tools package.
2. Build and push the verifier image. Keep the image name `verifyImage`; change only the username and repository:

   ```bash
   sudo docker build -t <docker-username>/<repository>:verifyImage .
   sudo docker image push <docker-username>/<repository>:verifyImage
   ```

3. Edit `validator-deploy.yaml` and set `cert_name`, `server_url`, `pfx_file_path`, `pfx_file_passwd`, `DOCKER_USERNAME`, `DOCKER_PASSWORD`, and `image`.
4. Deploy it:

   ```bash
   sudo kubectl apply -f validator-deploy.yaml
   ```

> **Warning:** `validator-deploy.yaml` holds the authentication certificate password and the Docker password. Don't commit it to source control, and limit who can read it.

### Deploy the image validation webhook

1. Go to `VerifyImage/validating-webhook`.
2. Build and push the webhook image. Keep the image name `image-validation-webhook`:

   ```bash
   sudo docker build -t <docker-username>/<repository>:image-validation-webhook .
   sudo docker image push <docker-username>/<repository>:image-validation-webhook
   ```

3. Apply the secret and configuration:

   ```bash
   sudo kubectl apply -f webhook-secret.yaml
   sudo kubectl apply -f webhook-config.yaml
   ```

4. Edit `image` in `webhook-deploy.yaml`, then deploy it:

   ```bash
   sudo kubectl apply -f webhook-deploy.yaml
   ```

5. Confirm both services are running:

   ```bash
   sudo kubectl get pods --all-namespaces
   ```

## Verification

1. Deploy a Deployment that uses an **unsigned** image. Kubernetes rejects it. This is the expected result.
2. Deploy a Deployment that uses the **signed** image, for example with `sudo kubectl apply -f demo-deployment.yaml`. The pod starts.
3. Check **Reports > Audit Trail** in CodeSign Secure for the signing record.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| ec-signer can't authenticate | Wrong URL, `.pfx` path, or password in `ec-signer.conf`, or the authentication certificate expired | Correct `ec-signer.conf`. Generate a new authentication certificate if needed. See [Troubleshooting client authentication and connection errors](troubleshooting-client-authentication-and-connection-errors.md). |
| Signing is denied | User not in a team mapped to the certificate, or wrong `--project_name` | See [Troubleshooting certificate access and permission issues](troubleshooting-certificate-access-and-permission-issues.md). |
| Signing waits, then fails | Approval needed and nobody approved within 100 seconds | See [Troubleshooting signing request timeouts and approvals](troubleshooting-signing-request-timeouts-and-approvals.md). |
| The signature can't be pushed | Not signed in to Docker Hub, or no push rights | Run `sudo docker login` with an account that can push to the repository. |
| `docker-ce-rootless-extras` can't be installed | Docker's repository isn't configured | Add Docker's repository as shown in Phase 2. |
| Kubernetes rejects an image | The webhook blocks unsigned images | Expected for unsigned images. Sign the image first. |
| Kubernetes rejects a signed image | The verifier can't reach CodeSign Secure, or `cert_name` doesn't match the signing certificate | Check `server_url`, `cert_name`, and the credentials in `validator-deploy.yaml`, and the verifier pod's logs. |

## Related articles

- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
