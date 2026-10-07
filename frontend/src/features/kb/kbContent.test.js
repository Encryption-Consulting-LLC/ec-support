import { describe, it, expect } from "vitest";
import {
  routeId,
  parseContent,
  resolveLink,
  resolveImage,
  breadcrumbOf,
  validate,
  files,
  images,
  sections,
} from "./kbContent";
import { PRODUCT_RESOURCES } from "../support/supportMeta";

// Fake files: keys mimic the real glob keys, values are raw file text.
const K = (rel) => `/knowledge-base/${rel}`;
const META = [
  'title: "Export CBOM"',
  'summary: "How to export."',
  'article_type: "How-to"',
  'last_reviewed: "2026-10-06"',
  'keywords: ["export", "cyclonedx"]',
];
const doc = (meta = META, body = "# Export CBOM\n\n## Steps\n\nHello.") =>
  `---\n${meta.join("\n")}\n---\n\n${body}`;
const without = (field) => META.filter((line) => !line.startsWith(field));
const replace = (field, line) => [...without(field), line];

describe("routeId", () => {
  it("drops order prefixes and lowercases", () => {
    expect(routeId("01-Products/CBOM-Secure/export-cbom.md")).toBe(
      "products/cbom-secure/export-cbom"
    );
  });

  it("maps _index.md to its folder and README.md to the home page", () => {
    expect(routeId("01-Products/CBOM-Secure/_index.md")).toBe("products/cbom-secure");
    expect(routeId("README.md")).toBe("");
  });
});

describe("parseContent", () => {
  it("builds an article from path and frontmatter", () => {
    const { articles } = parseContent({
      [K("01-Products/CBOM-Secure/export-cbom.md")]: doc(),
    });
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      id: "products/cbom-secure/export-cbom",
      rel: "01-Products/CBOM-Secure/export-cbom.md",
      parent: "products/cbom-secure",
      title: "Export CBOM",
      type: "How-to",
      keywords: ["export", "cyclonedx"],
      updated: "2026-10-06",
      product: "cbomsecure",
    });
  });

  it("removes the duplicate # title from the body", () => {
    const { articles } = parseContent({
      [K("01-Products/CBOM-Secure/export-cbom.md")]: doc(),
    });
    expect(articles[0].body).not.toContain("# Export CBOM");
    expect(articles[0].body).toContain("## Steps");
  });

  it("puts _index.md into sections and skips _drafts and outside files", () => {
    const { articles, sections } = parseContent({
      [K("01-Products/CBOM-Secure/_index.md")]: doc(),
      [K("01-Products/CBOM-Secure/_draft.md")]: doc(),
      "/somewhere-else/x.md": doc(),
    });
    expect(articles).toHaveLength(0);
    expect(Object.keys(sections)).toEqual(["products/cbom-secure"]);
    expect(sections["products/cbom-secure"].parent).toBe("products");
  });

  it("sets product only for folders under Products", () => {
    const { articles } = parseContent({
      [K("01-Products/HSM-as-a-Service/a.md")]: doc(),
      [K("02-General/PKI/b.md")]: doc(),
    });
    expect(articles.map((a) => a.product)).toEqual(["hsmasaservice", null]);
  });
});

describe("resolveLink", () => {
  const from = "01-Products/CBOM-Secure/cbom-secure-faq.md";

  it("turns relative .md links into portal URLs", () => {
    expect(resolveLink(from, "../../02-General/CBOM/what-is-a-cbom.md#intro")).toBe(
      "/kb/general/cbom/what-is-a-cbom#intro"
    );
    expect(resolveLink(from, "cbom-secure-overview.md")).toBe(
      "/kb/products/cbom-secure/cbom-secure-overview"
    );
    expect(resolveLink(from, "_index.md")).toBe("/kb/products/cbom-secure");
  });

  it("leaves external links and anchors alone", () => {
    expect(resolveLink(from, "https://cyclonedx.org")).toBe("https://cyclonedx.org");
    expect(resolveLink(from, "#steps")).toBe("#steps");
  });
});

describe("resolveImage", () => {
  const imgs = {
    [K("04-Featured-Articles/PKI-Runbooks/images/a.png")]: "/assets/a-123.png",
  };
  const from = "04-Featured-Articles/PKI-Runbooks/runbook.md";

  it("maps a relative image path to its bundled URL", () => {
    expect(resolveImage(from, "images/a.png", imgs)).toBe("/assets/a-123.png");
  });

  it("leaves external and unknown images unchanged", () => {
    expect(resolveImage(from, "https://x.com/a.png", imgs)).toBe("https://x.com/a.png");
    expect(resolveImage(from, "images/missing.png", imgs)).toBe("images/missing.png");
  });
});

describe("breadcrumbOf", () => {
  const sections = {
    "": { title: "EC Support Portal Home" },
    products: { title: "EC Products" },
    "products/cbom-secure": { title: "CBOM Secure" },
  };

  it("lists ancestors from home down, home labelled Knowledge base", () => {
    expect(breadcrumbOf("products/cbom-secure/x", sections)).toEqual([
      { id: "", title: "Knowledge base" },
      { id: "products", title: "EC Products" },
      { id: "products/cbom-secure", title: "CBOM Secure" },
    ]);
  });

  it("skips folders without an _index.md", () => {
    expect(breadcrumbOf("general/pki/x", sections)).toEqual([
      { id: "", title: "Knowledge base" },
    ]);
  });
});

describe("validate", () => {
  it("accepts good files with working links and images", () => {
    const errors = validate(
      {
        [K("01-Products/CBOM-Secure/a.md")]: doc(
          META,
          "See [b](b.md) and ![shot](images/ok.png)."
        ),
        [K("01-Products/CBOM-Secure/b.md")]: doc(),
      },
      { [K("01-Products/CBOM-Secure/images/ok.png")]: "/assets/ok.png" }
    );
    expect(errors).toEqual([]);
  });

  it("reports missing fields, unknown article_type and bad dates", () => {
    const errors = validate({
      [K("02-General/no-summary.md")]: doc(without("summary")),
      [K("02-General/bad-type.md")]: doc(replace("article_type", 'article_type: "Tips"')),
      [K("02-General/bad-date.md")]: doc(
        replace("last_reviewed", 'last_reviewed: "06/10/2026"')
      ),
    }).join("\n");
    expect(errors).toMatch(/no-summary\.md: missing summary/);
    expect(errors).toMatch(/bad-type\.md: article_type "Tips"/);
    expect(errors).toMatch(/bad-date\.md: last_reviewed/);
  });

  it("reports broken page links and missing images", () => {
    const errors = validate({
      [K("02-General/a.md")]: doc(META, "[gone](nope.md) ![x](images/missing.png)"),
    }).join("\n");
    expect(errors).toMatch(/broken link nope\.md/);
    expect(errors).toMatch(/broken link images\/missing\.png/);
  });

  it("blocks {{TBD}} placeholders unless allowed", () => {
    const tbdFiles = { [K("02-General/a.md")]: doc(META, "Path: {{TBD: menu}}") };
    expect(validate(tbdFiles).join("\n")).toMatch(/TBD/);
    expect(validate(tbdFiles, {}, { allowPlaceholders: true })).toEqual([]);
  });

  it("reports two files that end up at the same URL", () => {
    const errors = validate({
      [K("01-Products/x.md")]: doc(),
      [K("02-Products/x.md")]: doc(),
    }).join("\n");
    expect(errors).toMatch(/same URL \/kb\/products\/x/);
  });
});

// The real content lint: this is what fails a teammate's bad PR.
describe("knowledge-base folder", () => {
  // Placeholders are tolerated until go-live. Before launch, change this to
  // validate(files, images) so any {{TBD}} blocks the merge.
  it("has no errors", () => {
    expect(validate(files, images, { allowPlaceholders: true })).toEqual([]);
  });

  // Case pages link here through PRODUCT_RESOURCES; a renamed folder must fail CI.
  it("has a section for every product documentation link", () => {
    for (const { url } of Object.values(PRODUCT_RESOURCES)) {
      expect(sections[url.replace(/^\/kb\//, "")], url).toBeDefined();
    }
  });
});