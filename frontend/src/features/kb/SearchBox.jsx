import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES, kbUrl } from "../../lib/router/path";
import { sections } from "./kbContent";
import { search } from "./kbSearch";
import useSignedIn from "./useSignedIn";

const SUGGEST_LIMIT = 3;

// White search pill. Submits to /kb/search?q=..., so every search has a
// shareable URL. With `suggest`, matching articles show under the box as
// you type. The list hides itself when focus leaves the box (CSS
// :focus-within), so no click-outside handler is needed.
// `large`: the home hero. `compact`: the dark topbar on article pages (no button).
export default function SearchBox({ initial = "", suggest = false, large = false, compact = false }) {
  const navigate = useNavigate();
  const signedIn = useSignedIn();
  const [q, setQ] = useState(initial);
  const typed = q.trim();
  const hits = suggest && typed.length >= 2 ? search(typed, { limit: SUGGEST_LIMIT }) : [];

  const submit = (e) => {
    e.preventDefault(); // stop the browser's full-page form submit
    navigate(`${ROUTES.KB_SEARCH}?q=${encodeURIComponent(typed)}`);
  };

  return (
    <div className={`kb-search${large ? " kb-search-lg" : ""}${compact ? " kb-search-nav" : ""}`}>
      <form role="search" className="kb-pill" onSubmit={submit}>
        {(large || compact) && <i className="pi pi-search kb-pill-icon" aria-hidden="true" />}
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={compact ? "Search articles" : "Search an error, a product or a task"}
          aria-label="Search the knowledge base"
        />
        {!compact && <button type="submit" className="kb-btn">Search</button>}
      </form>

      {suggest && typed.length >= 2 && (
        <div className="kb-suggest">
          {hits.length > 0 && <p className="kb-suggest-label">From the knowledge base</p>}
          {hits.map((h) => (
            <Link key={h.id} to={kbUrl(h.id)} className="kb-suggest-item">
              <span className="kb-suggest-title">{h.title}</span>
              <span className="kb-suggest-meta">
                {h.type} in {sections[h.parent]?.title ?? "Knowledge base"}
              </span>
            </Link>
          ))}
          <Link to={ROUTES.SUPPORT_NEW} className="kb-suggest-case">
            {signedIn ? "Not finding it? Open a case" : "Not finding it? Sign in to open a case"}
          </Link>
        </div>
      )}
    </div>
  );
}
