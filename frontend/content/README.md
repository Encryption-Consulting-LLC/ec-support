# Knowledge Base content

This folder holds every article and FAQ published on the EC Support Portal knowledge base (`/kb`).
You don't need to know any code to contribute. You only add or edit Markdown (`.md`) files here.

## Folder layout

```
content/
  general/             # not product-specific: accounts, portal, working with support
  cbomsecure/          # CBOM Secure
  certsecuremanager/   # CertSecure Manager
  codesignsecure/      # CodeSign Secure
    faq.md             # this product's FAQ (one file per product)
    my-article.md      # one file per article
    images/            # screenshots used by this product's articles
```

- **Put your file in your product's folder.** Don't rename the folders. The portal matches them to its product list.
- **The file name becomes the page URL.** `install-agent.md` is served at `/kb/certsecuremanager/install-agent`.
  - Use lowercase letters, numbers and hyphens only. No spaces.
  - Don't rename a published file. That breaks existing links.
- Files starting with `_` (like `_TEMPLATE.md`) are ignored and never published.

## Writing an article

1. Copy `_TEMPLATE.md` into your product folder and rename it.
2. Fill in the settings block at the top, between the two `---` lines:

| Field | Required | What to put |
|---|---|---|
| `title` | yes | Short, task-focused title. Example: "Install the agent on Windows" |
| `summary` | yes | One sentence. Shown in search results and lists. |
| `category` | yes | Exactly one of: `Getting started`, `How-to`, `Troubleshooting`, `Release notes`, `Security advisories` |
| `tags` | no | Extra search words. Example: `[agent, windows, install]` |
| `featured` | no | `true` shows the article on the KB home page. Default `false`. |
| `updated` | yes | Date of your last real change, as `YYYY-MM-DD` |
| `video` | no | A YouTube link to embed a how-to video. Only YouTube is supported. |

3. Write the body below the settings block in Markdown:
   - Use `##` for main sections and `###` for sub-sections. These become the article's table of contents.
   - Don't use `#`, because the title is added automatically.
   - Numbered steps: `1.`, `2.`, ...
   - Code or commands go in triple backticks.
   - Tables use the `| a | b |` syntax. This is good for error-code references.
   - Raw HTML is **not** rendered, so don't paste HTML or iframes. Use the `video` field for videos.

## Adding images

- Put image files in your product's `images/` folder. Use lowercase names with hyphens, like `agent-settings.png`.
- Reference them with a relative path: `![Agent settings screen](./images/agent-settings.png)`
- Always write a short description inside the `[ ]`. It is used for accessibility.
- Before you take a screenshot, crop out or blur customer names, IP addresses, keys and passwords.

## Writing the FAQ

Each product has one `faq.md`. Every `##` heading is a question, and the text under it is the answer:

```markdown
---
title: CBOM Secure FAQ
---

## What does CBOM Secure scan?

Answer text. Lists, links, code and images all work here.

## Can I export the CBOM as CycloneDX?

Yes. Open **Reports** and click **Export → CycloneDX**.
```

- Use `##` only for questions. Inside an answer, use `###` or lower.
- `faq.md` needs only `title` in its settings block.

## Converting a Word document

If your content is in Word, convert it with [pandoc](https://pandoc.org/installing.html):

```
pandoc input.docx -t gfm -o my-article.md --extract-media=images
```

Then move the images into your product's `images/` folder, fix the image paths to `./images/...`, and add the settings block at the top.
If you don't want to do this yourself, send the Word file to the portal owner.

## Submitting your changes (GitHub, no install needed)

1. Open this `content/` folder on GitHub and go into your product folder.
2. Use **Add file → Upload files** to add new files, or open an existing file and click the ✏️ pencil icon to edit it.
3. At the bottom, choose **"Create a new branch for this commit and start a pull request"**, then click **Propose changes → Create pull request**.
4. An automatic check runs on your pull request. If it fails, the message tells you what's wrong, for example "missing summary" or "unknown category". Fix it on the same branch.
5. The product owner and the portal owner review and merge it. It goes live on the next portal deploy.

Use the **Preview** tab on GitHub to see roughly how your article will look before you submit.

## Checklist before submitting

- [ ] The file is in the right product folder, with a lowercase, hyphenated name
- [ ] `title`, `summary`, `category` and `updated` are filled in
- [ ] `category` is one of the five allowed values
- [ ] The images are in `images/`, use `./images/...` paths, and have alt text
- [ ] No customer data, secrets or internal-only information