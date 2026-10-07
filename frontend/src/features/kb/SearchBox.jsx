import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ROUTES, kbUrl } from "../../lib/router/path";
import { sections } from "./kbContent";
import { search } from "./kbSearch";

const SUGGEST_LIMIT = 3;

// Submits to /kb/search?q=..., so every search has a shareable URL.
// With `suggest`, matching articles show under the box as you type. The
// list hides itself when focus leaves the box (CSS :focus-within), so no
// click-outside handler is needed.
export default function SearchBox({ initial = "", suggest = false }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);
  const typed = q.trim();
  const hits = suggest && typed.length >= 2 ? search(typed, { limit: SUGGEST_LIMIT }) : [];

  const submit = (e) => {
    e.preventDefault(); // stop the browser's full-page form submit
    navigate(`${ROUTES.KB_SEARCH}?q=${encodeURIComponent(typed)}`);
  };

  return (
    <div className="kb-search">
      <form role="search" className="p-inputgroup" onSubmit={submit}>
        <InputText
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for an error, a product or a task"
          aria-label="Search the knowledge base"
        />
        <Button type="submit" icon="pi pi-search" label="Search" />
      </form>

      {suggest && typed.length >= 2 && (
        <div className="kb-suggest">
          {hits.length > 0 && <p className="kb-suggest-label">From the knowledge base</p>}
          {hits.map((h) => (
            <Link key={h.id} to={kbUrl(h.id)} className="kb-suggest-item">
              <span className="font-medium">{h.title}</span>
              <span className="kb-suggest-meta">
                {h.type} in {sections[h.parent]?.title ?? "Knowledge base"}
              </span>
            </Link>
          ))}
          <Link to={ROUTES.SUPPORT_NEW} className="kb-suggest-case">
            Not finding it? Open a case
          </Link>
        </div>
      )}
    </div>
  );
}
