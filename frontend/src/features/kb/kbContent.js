import fm from "front-matter";
import { PRODUCTS } from "../support/supportMeta"; // imports the list of products  

/**
 * Knowledge base content loader.
 *
 * Every .md file under frontend/content/<product>/ is bundled at build
 * time by Vite (import.meta.glob), so the KB needs no backend. The
 * parse/validate functions take the files as an argument (pure), which
 * lets tests feed fake files and CI lint the real ones.
 */

export const CATEGORIES = [
  "Getting started",
  "How-to",
  "Troubleshooting",
  "Release notes",
  "Security advisories",
];

// "general" + every real product except "other". Folder names must be keys here.
export const PRODUCT_LABELS = {
  general: "General",
  ...Object.fromEntries(
    PRODUCTS.filter((p) => p.value !== "other").map((p) => [p.value, p.label])
  ),
};

// Root-relative glob: "/content" = frontend/content. ?raw gives the file text.
export const files = import.meta.glob("/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const PATH_RE = /^\/content\/([^/]+)\/([^/]+)\.md$/;
const SLUG_RE = /^[a-z0-9-]+$/;
const REQUIRED = ["title", "summary", "category", "updated"];

// "/content/cbomsecure/install.md" -> { product: "cbomsecure", slug: "install" }.
// Root files (README, _TEMPLATE) and _drafts return null = not published.
function parsePath(path) {
  const m = path.match(PATH_RE);
  if (!m || m[2].startsWith("_")) return null;
  return { product: m[1], slug: m[2] };
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

// YAML turns 2026-09-30 into a Date; pages want the plain "2026-09-30" string.
const toDay = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d);

// faq.md: every "## " line is a question, the text below it is the answer.
export function parseFaq(body) {
  return body
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [question, ...rest] = chunk.split("\n");
      return { question: question.trim(), answer: rest.join("\n").trim() };
    });
}

export function parseContent(files) {
  const articles = [];
  const faqs = {};
  for (const [path, raw] of Object.entries(files)) {
    const loc = parsePath(path);
    if (!loc) continue;
    const { attributes, body, error } = parseFile(raw);
    if (error) continue; // validate() reports it; the live site just skips it
    if (loc.slug === "faq") {
      faqs[loc.product] = { title: attributes.title, items: parseFaq(body) };
    } else {
      // loc last, so frontmatter can't override product/slug
      articles.push({
        ...attributes,
        ...loc,
        updated: toDay(attributes.updated),
        body,
      });
    }
  }
  return { articles, faqs };
}

// Content lint. Messages are read by teammates in CI, so say exactly what to fix.
export function validate(files) {
  const errors = [];
  for (const [path, raw] of Object.entries(files)) {
    const loc = parsePath(path);
    if (!loc) continue;
    if (!PRODUCT_LABELS[loc.product]) {
      errors.push(
        `${path}: unknown product folder "${loc.product}" (use: ${Object.keys(PRODUCT_LABELS).join(", ")})`
      );
      continue;
    }
    if (!SLUG_RE.test(loc.slug)) {
      errors.push(
        `${path}: file name must use only lowercase letters, numbers and hyphens`
      );
      continue;
    }
    const { attributes, body, error } = parseFile(raw);
    if (error) {
      errors.push(`${path}: settings block between --- lines is invalid (${error})`);
      continue;
    }
    if (loc.slug === "faq") {
      if (!attributes.title) errors.push(`${path}: missing title`);
      if (parseFaq(body).length === 0) {
        errors.push(`${path}: no questions found (each must start with "## ")`);
      }
      continue;
    }
    for (const field of REQUIRED) {
      if (!attributes[field]) errors.push(`${path}: missing ${field}`);
    }
    if (attributes.category && !CATEGORIES.includes(attributes.category)) {
      errors.push(
        `${path}: category "${attributes.category}" must be one of: ${CATEGORIES.join(", ")}`
      );
    }
    if (attributes.updated && !(attributes.updated instanceof Date)) {
      errors.push(`${path}: updated must be a date like 2026-09-30`);
    }
  }
  return errors;
}

export const { articles, faqs } = parseContent(files);