import { Link, useSearchParams } from "react-router-dom";
import { Checkbox } from "primereact/checkbox";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { ARTICLE_TYPES, articles, sections } from "./kbContent";
import { search } from "./kbSearch";
import { ROUTES, kbUrl } from "../../lib/router/path";
import SearchBox from "./SearchBox";

const PAGE_SIZE = 10;
const topOf = (id) => id.split("/")[0]; // "products/cbom-secure/x" -> "products"
const newestFirst = (a, b) =>
  (b.updated ?? "").localeCompare(a.updated ?? "") || a.title.localeCompare(b.title);

/**
 * Entrust-style search: query + facet filters + pages. All state lives in
 * the URL (?q=&type=&section=&page=), so results are shareable and Back works.
 * An empty query lists every article, newest first.
 */
export default function KbSearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const types = params.getAll("type");
  const picked = params.getAll("section");
  const page = Math.max(1, Number(params.get("page")) || 1);

  const pool = q ? search(q, { limit: Infinity }) : [...articles].sort(newestFirst);
  const results = pool.filter(
    (r) =>
      (types.length === 0 || types.includes(r.type)) &&
      (picked.length === 0 || picked.includes(topOf(r.id)))
  );
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const topSections = Object.values(sections).filter((s) => s.parent === "");
  const sectionTitle = Object.fromEntries(topSections.map((s) => [s.id, s.title]));

  // Add or remove one value of a multi-value param; a filter change resets to page 1.
  const toggle = (key, value) => {
    const next = new URLSearchParams(params);
    const current = next.getAll(key);
    next.delete(key);
    (current.includes(value) ? current.filter((v) => v !== value) : [...current, value])
      .forEach((v) => next.append(key, v));
    next.delete("page");
    setParams(next);
  };

  const goToPage = (e) => {
    const next = new URLSearchParams(params);
    next.set("page", e.page + 1); // Paginator pages are 0-based
    setParams(next);
    window.scrollTo(0, 0);
  };

  // One checkbox; hidden when no result has it, unless it is already ticked.
  const facet = (key, value, label, count) => {
    const checked = params.getAll(key).includes(value);
    if (count === 0 && !checked) return null;
    const inputId = `${key}-${value}`.replace(/\s/g, "-");
    return (
      <div key={value} className="flex align-items-center gap-2 mb-2">
        <Checkbox inputId={inputId} checked={checked} onChange={() => toggle(key, value)} />
        <label htmlFor={inputId} className="text-sm">
          {label} <span className="text-color-secondary">({count})</span>
        </label>
      </div>
    );
  };

  return (
    <div className="support-shell support-content">
      <title>{q ? `${q} – Knowledge base search` : "Knowledge base search"}</title>
      <div className="page-plain-head">
        <h1 className="text-3xl font-semibold mt-0 mb-3">Search the knowledge base</h1>
        {/* key: remount when the URL query changes (e.g. Back) so the box shows it */}
        <SearchBox key={q} initial={q} />
      </div>

      <div className="grid">
        <div className="col-12 md:col-3">
          <div className="content-card">
            <h2 className="text-base font-semibold mt-0">Content type</h2>
            {ARTICLE_TYPES.map((t) =>
              facet("type", t, t, pool.filter((r) => r.type === t).length)
            )}
            <h2 className="text-base font-semibold mt-4">Section</h2>
            {topSections.map((s) =>
              facet("section", s.id, s.title, pool.filter((r) => topOf(r.id) === s.id).length)
            )}
          </div>
        </div>

        <div className="col-12 md:col-9">
          <p className="mt-0 text-color-secondary">
            {results.length} results{q && <> for “{q}”</>}
          </p>

          {shown.length === 0 ? (
            <div className="content-card">
              No articles match. Try fewer or different words, or clear the filters.
              Still stuck? <Link to={ROUTES.SUPPORT_NEW}>Open a case</Link>.
            </div>
          ) : (
            <div className="content-card">
              <ul className="kb-article-list">
                {shown.map((r) => (
                  <li key={r.id}>
                    <Link to={kbUrl(r.id)} className="font-medium">
                      {r.title}
                    </Link>
                    <p className="kb-snippet text-sm text-color-secondary mt-1 mb-2 line-height-3">
                      {r.summary}
                    </p>
                    <div className="flex align-items-center gap-2 text-xs text-color-secondary">
                      <Tag value={r.type} rounded />
                      <span>{sectionTitle[topOf(r.id)]}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.length > PAGE_SIZE && (
            <Paginator
              className="mt-3"
              first={(page - 1) * PAGE_SIZE}
              rows={PAGE_SIZE}
              totalRecords={results.length}
              onPageChange={goToPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
