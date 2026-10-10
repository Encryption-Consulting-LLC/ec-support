---
title: "Signing Container Images"
category: "Products"
section: "CodeSign Secure"
article_type: "How-to"
applies_to: "CodeSign Secure with Sigstore cosign (PKCS#11 build) and Notary Project Notation, for OCI container images in any OCI-compliant registry"
summary: "How to sign and verify OCI container images with cosign over PKCS#11 and with Notation, using HSM-held keys managed through CodeSign Secure."
keywords: ["sign container images", "cosign pkcs11", "Notation sign", "container image signing HSM", "CodeSign Secure cosign"]
last_reviewed: "2026-10-06"
---

# Signing Container Images

This article explains how to sign container images with keys protected by CodeSign Secure. It covers Sigstore cosign through a PKCS#11 library and the Notary Project Notation tool. It is for platform engineers and DevOps teams who publish images to an Open Container Initiative (OCI) registry.

## Overview

A container image signature proves who published an image and that it has not changed. The signature is stored in the registry next to the image. Deployment tools, such as Kubernetes admission controllers, check the signature before running the image.

cosign can use a hardware key through a PKCS#11 Uniform Resource Identifier (URI). When the PKCS#11 module is the CodeSign Secure library, the private key stays in the Hardware Security Module (HSM) and each signature follows CodeSign Secure policy.

## Applies to

- Sigstore cosign built with PKCS#11 support.
- Notary Project Notation with a signing plugin.
- Any OCI-compliant registry (for example Azure Container Registry, Amazon ECR, Google Artifact Registry, Harbor, GitHub Container Registry).

## Prerequisites

- CodeSign Secure PKCS#11 library installed on the build agent (`<path to CodeSign Secure PKCS#11 library>`, shown in the client installer).
- A key in CodeSign Secure that is allowed for container signing, and permission to use it.
- A cosign binary with PKCS#11 support. Standard cosign release binaries do not include PKCS#11 support; build cosign with the `pkcs11key` build tag (for example `go build -tags=pkcs11key ./cmd/cosign`). Verify against the cosign documentation for the installed version.
- Push access to the registry (`docker login` or the registry credential helper).

## Before starting

- Always sign by digest (`<image>@sha256:<digest>`), not by tag. Tags can move to other images.
- Decide whether signatures should be recorded in the public Sigstore Rekor transparency log. Images for internal use usually should not be. Recent cosign versions upload to Rekor by default.

## Procedure

### Phase 1: Find the key URI

1. List tokens exposed by the PKCS#11 library:

```bash
cosign pkcs11-tool list-tokens --module-path <path-to-pkcs11-library>
```

2. List keys and their URIs in the token:

```bash
cosign pkcs11-tool list-keys-uris --module-path <path-to-pkcs11-library> --slot-id <slot-id> --pin <pin>
```

3. Copy the URI for the signing key. It looks like this:

```text
pkcs11:token=<token-label>;slot-id=<slot-id>;object=<key-label>?module-path=<path-to-pkcs11-library>&pin-value=<pin>
```

> **Warning:** Do not store the PIN in scripts or in the URI in source control. Insert it at run time from the CI/CD secret store, or use the `pin-source` attribute to read it from a protected file.

### Phase 2: Sign the image with cosign

1. Get the image digest after pushing:

```bash
docker buildx imagetools inspect <registry>/<repository>:<tag>
```

2. Sign by digest:

```bash
cosign sign --key "pkcs11:token=<token-label>;slot-id=<slot-id>;object=<key-label>?module-path=<path-to-pkcs11-library>&pin-value=${CSS_PIN}" \
  --tlog-upload=false \
  <registry>/<repository>@sha256:<digest>
```

Remove `--tlog-upload=false` if the organization wants the signature in the public transparency log.

3. Export the public key for verifiers:

```bash
cosign public-key --key "<pkcs11-uri>" > cosign.pub
```

### Phase 3: Sign with Notation (optional)

Notation uses plugins to reach external key stores. If CodeSign Secure provides a Notation plugin:

```bash
notation plugin install --file <plugin-archive>
notation key add --plugin <plugin-name> --id <key-id> <key-name>
notation sign --key <key-name> <registry>/<repository>@sha256:<digest>
```

Notation signatures need an X.509 certificate chain. Verifiers configure a trust store and trust policy.

## Verification

**cosign:**

```bash
cosign verify --key cosign.pub --insecure-ignore-tlog=true <registry>/<repository>@sha256:<digest>
```

Drop `--insecure-ignore-tlog=true` if the signature was uploaded to Rekor.

**Notation:**

```bash
notation verify <registry>/<repository>@sha256:<digest>
```

Also confirm a matching record in the CodeSign Secure audit log. For runtime enforcement, configure an admission controller such as Sigstore policy-controller, Kyverno, or Ratify with the public key or trust store.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| `unknown command "pkcs11-tool"` or PKCS#11 URI not accepted | cosign built without PKCS#11 support | Build cosign with the `pkcs11key` tag. |
| `could not load module` | Wrong library path or architecture mismatch | Fix `module-path`. Use a 64-bit library for a 64-bit cosign. |
| `CKR_PIN_INCORRECT` | Wrong PIN | Check the secret value. |
| `UNAUTHORIZED` or `DENIED` from registry | No push rights for the signature artifact | Run `docker login` with an account that can push. |
| Verification fails with "no matching signatures" | Signed a different digest, or wrong public key | Sign and verify the same digest. Re-export the public key. |
| Verification fails on transparency log | Signature not in Rekor | Use `--insecure-ignore-tlog=true` for private signatures. |

## Related articles

- [Integrating CodeSign Secure with CI/CD pipelines](integrating-codesign-secure-with-ci-cd-pipelines.md)
- [Approval workflows and signing policies](approval-workflows-and-signing-policies.md)
- [How CodeSign Secure works](how-codesign-secure-works.md)
- [Code signing best practices](../../02-General/Code-Signing/code-signing-best-practices.md)
- [Troubleshooting CodeSign Secure](troubleshooting-codesign-secure.md)
