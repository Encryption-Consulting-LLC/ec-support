import { Link, useSearchParams } from "react-router-dom";
import { ARTICLE_TYPES, articles, sections } from "./kbContent";
import { search } from "./kbSearch";
import { ROUTES, kbUrl } from "../../lib/router/path";
import SearchBox from "./SearchBox";
import useSignedIn from "./useSignedIn";

const GROUP_LIMIT = 3; // results shown per section before "N more in X"
const newestFirst = (a, b) =>
  (b.updated ?? "").localeCompare(a.updated ?? "") || a.title.localeCompare(b.title);

/**
 * Search results grouped by section. All state lives in the URL
 * (?q=&type=&section=), so results are shareable and Back works.
 * An empty query lists every article, newest first.
 */
export default function KbSearchPage() {
  const signedIn = useSignedIn();
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const type = params.get("type") ?? "";
  const section = params.get("section") ?? "";

  // Articles matching every word first; any word only when that finds nothing.
  let pool = [...articles].sort(newestFirst);
  if (q) {
    // Articles matching every word; any word only when that finds nothing.
    pool = search(q, { limit: Infinity, combineWith: "AND" });
    if (pool.length === 0) pool = search(q, { limit: Infinity });
  }
  const inSection = section ? pool.filter((r) => r.id.startsWith(`${section}/`)) : pool;
  const results = type ? inSection.filter((r) => r.type === type) : inSection;

  // Group by the section an article sits in. Groups keep the order of their
  // best result, so the strongest match still comes first.
  const groups = new Map();
  for (const r of results) {
    if (!groups.has(r.parent)) groups.set(r.parent, []);
    groups.get(r.parent).push(r);
  }

  // Same URL, one param changed (or removed when value is "").
  const withParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    return `?${next}`;
  };
  const setType = (value) => setParams(withParam("type", value).slice(1));

  const count = (t) => inSection.filter((r) => r.type === t).length;
  const sectionTitle = section ? sections[section]?.title : undefined; // sections[""] is the home page
  const n = results.length;
  const answers = `${n} ${n === 1 ? "answer" : "answers"}`;

  return (
    <div className="kb">
      <title>{q ? `${q} – Knowledge base search` : "Knowledge base search"}</title>
      <header className="kb-band">
        <div className="kb-shell kb-band-head kb-narrow">
          <h1 className="kb-display kb-title-sm">
            {q ? (
              <>
                <span className="kb-accent">{answers}</span> for “{q}”
              </>
            ) : (
              <>
                <span className="kb-accent">{n}</span> {sectionTitle ? `articles in ${sectionTitle}` : "articles"}
              </>
            )}
          </h1>
          {/* key: remount when the URL query changes (e.g. Back) so the box shows it */}
          <SearchBox key={q} initial={q} />
        </div>
      </header>

      <div className="kb-shell kb-main kb-narrow">
        <div className="kb-pills" role="group" aria-label="Content type">
          <button type="button" aria-pressed={!type} onClick={() => setType("")}>
            All {inSection.length}
          </button>
          {ARTICLE_TYPES.filter((t) => count(t) > 0 || t === type).map((t) => (
            <button key={t} type="button" aria-pressed={t === type} onClick={() => setType(t)}>
              {t} {count(t)}
            </button>
          ))}
        </div>

        {sectionTitle && (
          <p className="kb-filter">
            In {sectionTitle}. <Link to={withParam("section", "")}>Search everything</Link>
          </p>
        )}

        {n === 0 && (
          <p className="kb-muted">
            No articles match. Try fewer or different words, or another content type.
          </p>
        )}

        {[...groups].map(([parent, items]) => {
          const title = sections[parent]?.title ?? "Knowledge base";
          const shown = section ? items : items.slice(0, GROUP_LIMIT);
          return (
            <section key={parent} className="kb-group" aria-label={title}>
              <h2 className="kb-h2">{title}</h2>
              <ul className="kb-list">
                {shown.map((r) => (
                  <li key={r.id}>
                    <Link to={kbUrl(r.id)}>
                      <span className="kb-list-title">{r.title}</span>
                      {r.summary && <span className="kb-list-text">{r.summary}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              {shown.length < items.length && (
                <Link to={withParam("section", parent)} className="kb-link kb-more">
                  {items.length - shown.length} more in {title}
                </Link>
              )}
            </section>
          );
        })}

        <p className="kb-endnote">
          Not what you need? <Link to={ROUTES.SUPPORT_NEW}>{signedIn ? "Open a case" : "Sign in to open a case"}</Link>{" "}
          and an EC engineer will help.
        </p>
      </div>
    </div>
  );
}
