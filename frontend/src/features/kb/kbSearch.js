import MiniSearch from "minisearch";
import { articles } from "./kbContent";

/**
 * Client-side KB search over every article (section _index pages are
 * left out; they are mostly link lists). createSearch takes the articles
 * as input (pure) so tests can use fakes.
 */
export function createSearch(articles) {
  const index = new MiniSearch({
    // What is searched.
    fields: ["title", "summary", "keywords", "body"],
    // What each result carries, so pages can render it without a lookup.
    storeFields: ["title", "summary", "type", "product", "parent", "updated"],
    // keywords is an array; the index needs text.
    extractField: (doc, field) =>
      field === "keywords" ? doc.keywords.join(" ") : doc[field],
    searchOptions: {
      boost: { title: 3, summary: 2, keywords: 2 },
      prefix: true, // "rene" finds "renewal"
      fuzzy: 0.2, // about 1 typo per 5 letters
    },
  });
  index.addAll(articles);

  // combineWith "AND": every word must match (default "OR": any word).
  return function search(query, { product, limit = 10, combineWith } = {}) {
    if (!query || !query.trim()) return [];
    const filter = product ? (r) => r.product === product : undefined;
    return index.search(query, { filter, combineWith }).slice(0, limit);
  };
}

export const search = createSearch(articles);