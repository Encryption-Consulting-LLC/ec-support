import fm from "front-matter";
import { PRODUCTS } from "../support/supportMeta"; // imports the list of products  

/**
 * Knowledge base content loader.
 *
 * Content lives in <repo>/knowledge-base/ (outside frontend/, so teammates
 * edit content without touching code). Vite bundles every .md and image at
 * build time via import.meta.glob, so the KB needs no backend.
 *
 * URLs mirror the folders with the "NN-" order prefixes dropped:
 *   01-Products/CBOM-Secure/reading-a-cbom-report.md
 *     -> /kb/products/cbom-secure/reading-a-cbom-report
 * A folder's _index.md is that folder's landing page (/kb/products/cbom-secure)
 * and the root README.md is the KB home.
 *
 * parseContent/validate take the files as input (pure) so tests can feed
 * fakes and CI can lint the real folder.
 */

export const ARTICLE_TYPES = [
  "Overview",
  "Concept",
  "How-to",
  "Runbook",
  "Reference",
  "Troubleshooting",
  "FAQ",
  "Service Guide",
];

// Paths are relative to this file: ../../../../ = repo root.
// Keys look like "../../../../knowledge-base/01-Products/x.md".
export const files = import.meta.glob("../../../../knowledge-base/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
export const images = import.meta.glob(
  "../../../../knowledge-base/**/*.{png,jpg,jpeg,gif,svg,webp}",
  { query: "?url", import: "default", eager: true }
);

const REQUIRED = ["title", "summary", "article_type", "last_reviewed"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Markdown link and image targets: [text](target) and ![alt](target)
const LINK_RE = /\]\(([^)\s]+)/g;
const PRODUCT_KEYS = new Set(PRODUCTS.map((p) => p.value));

// Glob key -> path inside knowledge-base/ ("01-Products/x.md"); undefined if outside.
const relPath = (key) => key.match(/knowledge-base\/(.+)$/)?.[1];

// "_TEMPLATE.md", "_draft.md" are not published; "_index.md" is.
const isPublished = (rel) => {
  const name = rel.split("/").pop();
  return !name.startsWith("_") || name === "_index.md";
};

const isIndex = (rel) => /(^|\/)_index\.md$/.test(rel) || rel === "README.md";

// "01-Products" -> "products", "CBOM-Secure" -> "cbom-secure"
const toSlug = (segment) => segment.replace(/^\d+-/, "").toLowerCase();

// "01-Products/CBOM-Secure/x.md" -> "products/cbom-secure/x"
// "01-Products/CBOM-Secure/_index.md" -> "products/cbom-secure", "README.md" -> ""
export function routeId(rel) {
  const parts = rel.replace(/\.md$/, "").split("/");
  if (isIndex(rel)) parts.pop();
  return parts.map(toSlug).join("/");
}

// "products/cbom-secure/x" -> "products/cbom-secure"; the home page has no parent.
const parentOf = (id) => (id === "" ? null : id.split("/").slice(0, -1).join("/"));

// Folder under Products -> the key the New Case form uses ("CBOM-Secure" -> "cbomsecure").
function productOf(rel) {
  const [top, folder] = rel.split("/");
  const key = folder?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return toSlug(top) === "products" && PRODUCT_KEYS.has(key) ? key : null;
}

// One teammate's broken YAML must not crash the whole KB, so parse errors
// come back as data instead of throwing.
function parseFile(raw) {
  try {
    const { attributes, body } = fm(raw);
    return { attributes: attributes || {}, body };
  } catch (e) {
    return { error: e.reason || e.message };
  }
}

// Unquoted YAML dates become Date objects; pages want "2026-10-06".
const toDay = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d);

// Every file repeats its title as "# Title"; the page renders the title itself.
const stripH1 = (body) => body.replace(/^\s*# .+\r?\n/, "");

export function parseContent(files) {
  const articles = [];
  const sections = {};
  for (const [key, raw] of Object.entries(files)) {
    const rel = relPath(key);
    if (!rel || !isPublished(rel)) continue;
    const { attributes: a, body, error } = parseFile(raw);
    if (error) continue; // validate() reports it; the live site just skips it
    const id = routeId(rel);
    const doc = {
      id,
      rel,
      parent: parentOf(id),
      title: a.title,
      summary: a.summary,
      type: a.article_type,
      appliesTo: a.applies_to,
      keywords: a.keywords || [],
      updated: toDay(a.last_reviewed),
      product: productOf(rel),
      body: stripH1(body),
    };
    if (isIndex(rel)) sections[id] = doc;
    else articles.push(doc);
  }
  return { articles, sections };
}

// Relative link inside an article -> portal URL, resolved like a browser
// resolves relative URLs. External links and #anchors come back unchanged.
export function resolveLink(fromRel, href) {
  if (href.startsWith("#")) return href;
  const url = new URL(href, `http://kb/${fromRel}`);
  if (url.host !== "kb" || !url.pathname.endsWith(".md")) return href;
  return `/kb/${routeId(decodeURIComponent(url.pathname.slice(1)))}${url.hash}`;
}

// Relative image path inside an article -> the URL Vite gave the bundled file.
// Unknown or external images come back unchanged (validate() flags unknown ones).
export function resolveImage(fromRel, src, images) {
  const url = new URL(src, `http://kb/${fromRel}`);
  if (url.host !== "kb") return src;
  const rel = decodeURIComponent(url.pathname.slice(1));
  const key = Object.keys(images).find((k) => relPath(k) === rel);
  return key ? images[key] : src;
}

// Content lint. Messages are read by teammates in CI, so say exactly what to fix.
export function validate(files, images = {}, { allowPlaceholders = false } = {}) {
  const errors = [];
  const pages = new Set(Object.keys(files).map(relPath));
  const pictures = new Set(Object.keys(images).map(relPath));
  const urls = new Map();
  for (const [key, raw] of Object.entries(files)) {
    const rel = relPath(key);
    if (!rel || !isPublished(rel)) continue;
    const where = `knowledge-base/${rel}`;
    if (/\s/.test(rel)) {
      errors.push(`${where}: file and folder names must not contain spaces`);
      continue;
    }
    const id = routeId(rel);
    if (urls.has(id)) {
      errors.push(`${where}: same URL /kb/${id} as knowledge-base/${urls.get(id)}`);
    }
    urls.set(id, rel);
    const { attributes: a, body, error } = parseFile(raw);
    if (error) {
      errors.push(`${where}: settings block between --- lines is invalid (${error})`);
      continue;
    }
    for (const field of REQUIRED) {
      if (!a[field]) errors.push(`${where}: missing ${field}`);
    }
    if (a.article_type && !ARTICLE_TYPES.includes(a.article_type)) {
      errors.push(
        `${where}: article_type "${a.article_type}" must be one of: ${ARTICLE_TYPES.join(", ")}`
      );
    }
    if (a.last_reviewed && !DATE_RE.test(toDay(a.last_reviewed))) {
      errors.push(`${where}: last_reviewed must be a date like "2026-10-06"`);
    }
    if (!allowPlaceholders && body.includes("{{TBD")) {
      errors.push(`${where}: has {{TBD}} placeholders; resolve them before publishing`);
    }
    for (const [, target] of body.matchAll(LINK_RE)) {
      if (target.startsWith("#")) continue;
      const url = new URL(target, `http://kb/${rel}`);
      if (url.host !== "kb") continue; // external link
      const linked = decodeURIComponent(url.pathname.slice(1));
      const exists = linked.endsWith(".md") ? pages.has(linked) : pictures.has(linked);
      if (!exists) errors.push(`${where}: broken link ${target}`);
    }
  }
  return errors;
}

export const { articles, sections } = parseContent(files);