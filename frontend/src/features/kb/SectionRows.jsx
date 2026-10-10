import { Link } from "react-router-dom";
import { articles, sections } from "./kbContent";
import { kbUrl } from "../../lib/router/path";

const countUnder = (id) => articles.filter((a) => a.id.startsWith(`${id}/`)).length;

// Child sections of parentId as a two-column list of rows (no cards).
// `blurbs` overrides a section's summary with a one-line description.
export default function SectionRows({ parentId, blurbs = {} }) {
  const children = Object.values(sections).filter((s) => s.parent === parentId);
  if (children.length === 0) return null;

  return (
    <div className="kb-rows">
      {children.map((s) => (
        <Link key={s.id} to={kbUrl(s.id)} className="kb-row">
          <span>
            <span className="kb-row-title">{s.title}</span>
            <span className="kb-row-text">{blurbs[s.id] ?? s.summary}</span>
          </span>
          <span className="kb-row-count">{countUnder(s.id)} articles</span>
        </Link>
      ))}
    </div>
  );
}
