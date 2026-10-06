import { describe, it, expect } from "vitest";
import { parseContent, parseFaq, validate, files } from "./kbContent";

// Fake files: keys look like real glob paths, values are raw file text.
const article = (fm, body = "## Intro\n\nHello.") => `---\n${fm}\n---\n\n${body}`;

const GOOD = article(
  "title: Install agent\nsummary: How to install.\ncategory: How-to\nupdated: 2026-09-30"
);

describe("parseContent", () => {
  it("reads product and slug from the path", () => {
    const { articles } = parseContent({ "/content/cbomsecure/install-agent.md": GOOD });
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      product: "cbomsecure",
      slug: "install-agent",
      title: "Install agent",
      updated: "2026-09-30",
    });
    expect(articles[0].body).toContain("Hello.");
  });

  it("skips _files and files outside a product folder", () => {
    const { articles } = parseContent({
      "/content/_TEMPLATE.md": GOOD,
      "/content/README.md": "# readme",
      "/content/cbomsecure/_draft.md": GOOD,
    });
    expect(articles).toHaveLength(0);
  });

  it("puts faq.md into faqs, not articles", () => {
    const { articles, faqs } = parseContent({
      "/content/cbomsecure/faq.md": "---\ntitle: CBOM FAQ\n---\n\n## Q1?\n\nA1.",
    });
    expect(articles).toHaveLength(0);
    expect(faqs.cbomsecure.title).toBe("CBOM FAQ");
    expect(faqs.cbomsecure.items).toEqual([{ question: "Q1?", answer: "A1." }]);
  });
});

describe("parseFaq", () => {
  it("splits on ## headings and keeps multi-line answers", () => {
    const items = parseFaq("intro ignored\n\n## First?\n\nLine 1\n\n- a\n- b\n\n## Second?\n\nAnswer 2\n### sub stays");
    expect(items).toEqual([
      { question: "First?", answer: "Line 1\n\n- a\n- b" },
      { question: "Second?", answer: "Answer 2\n### sub stays" },
    ]);
  });
});

describe("validate", () => {
  it("accepts a good article", () => {
    expect(validate({ "/content/cbomsecure/ok.md": GOOD })).toEqual([]);
  });

  it("reports missing fields, bad category, bad folder and bad slug", () => {
    const errors = validate({
      "/content/cbomsecure/no-summary.md": article("title: T\ncategory: How-to\nupdated: 2026-09-30"),
      "/content/cbomsecure/bad-cat.md": article("title: T\nsummary: S\ncategory: Tips\nupdated: 2026-09-30"),
      "/content/notaproduct/x.md": GOOD,
      "/content/cbomsecure/Bad Name.md": GOOD,
    });
    expect(errors.join("\n")).toMatch(/no-summary\.md.*summary/);
    expect(errors.join("\n")).toMatch(/bad-cat\.md.*category/);
    expect(errors.join("\n")).toMatch(/notaproduct/);
    expect(errors.join("\n")).toMatch(/Bad Name\.md.*file name/);
  });

  it("requires faq.md to have a title and at least one question", () => {
    const errors = validate({ "/content/cbomsecure/faq.md": "---\n---\n\nno questions" });
    expect(errors.length).toBeGreaterThan(0);
  });
});

// The real content lint: this is what fails a teammate's bad PR.
describe("content folder", () => {
  it("has no validation errors", () => {
    expect(validate(files)).toEqual([]);
  });
});