import { describe, it, expect } from "vitest";
import { createSearch } from "./kbSearch";

const base = { type: "How-to", updated: "2026-10-06" };
const articles = [
  {
    ...base,
    id: "products/cbom-secure/run-scan",
    parent: "products/cbom-secure",
    product: "cbomsecure",
    title: "Running a first cryptographic scan",
    summary: "Set up discovery",
    keywords: ["discovery"],
    body: "Use the scanner to find network certificates.",
  },
  {
    ...base,
    id: "products/certsecure-manager/renew",
    parent: "products/certsecure-manager",
    product: "certsecuremanager",
    title: "Renew a certificate",
    summary: "Manual renewal",
    keywords: ["renewal"],
    body: "Click renew. Check your network settings first.",
  },
  {
    ...base,
    type: "Concept",
    id: "general/pqc/what-is-pqc",
    parent: "general/pqc",
    product: null,
    title: "What is post-quantum cryptography",
    summary: "PQC basics",
    keywords: ["PQC", "ML-KEM"],
    body: "Quantum computers threaten RSA.",
  },
];

const search = createSearch(articles);
const ids = (results) => results.map((r) => r.id);

describe("search", () => {
  it("ranks a title match above a body match", () => {
    expect(search("certificate")[0].id).toBe("products/certsecure-manager/renew");
  });

  it("matches word prefixes (search-as-you-type)", () => {
    expect(ids(search("crypto"))).toEqual(
      expect.arrayContaining(["products/cbom-secure/run-scan", "general/pqc/what-is-pqc"])
    );
  });

  it("tolerates a small typo", () => {
    expect(search("certifcate")[0].id).toBe("products/certsecure-manager/renew");
  });

  it("searches keywords", () => {
    expect(ids(search("ml-kem"))).toEqual(["general/pqc/what-is-pqc"]);
  });

  it("filters by product", () => {
    expect(ids(search("network", { product: "certsecuremanager" }))).toEqual([
      "products/certsecure-manager/renew",
    ]);
  });

  it("returns the fields pages need to render a result", () => {
    expect(search("renew")[0]).toMatchObject({
      title: "Renew a certificate",
      summary: "Manual renewal",
      type: "How-to",
      product: "certsecuremanager",
    });
  });

  it("with combineWith AND, needs every word", () => {
    expect(search("network renew")).toHaveLength(2); // OR: either word
    expect(ids(search("network renew", { combineWith: "AND" }))).toEqual([
      "products/certsecure-manager/renew",
    ]);
  });

  it("respects the limit", () => {
    expect(search("network", { limit: 1 })).toHaveLength(1);
  });

  it("returns nothing for an empty query", () => {
    expect(search("   ")).toEqual([]);
  });
});