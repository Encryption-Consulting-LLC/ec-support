import { Link } from "react-router-dom";
import { articles, sections } from "./kbContent";
import { kbUrl } from "../../lib/router/path";

// One clickable card per child section of parentId ("" = top level).
export default function SectionCards({ parentId }) {
  const children = Object.values(sections).filter((s) => s.parent === parentId);
  if (children.length === 0) return null;
  const countUnder = (id) => articles.filter((a) => a.id.startsWith(`${id}/`)).length;

  return (
    <div className="grid">
      {children.map((s) => (
        <div key={s.id} className="col-12 md:col-6 lg:col-4">
          <Link to={kbUrl(s.id)} className="kb-card">
            <div className="font-semibold mb-2">{s.title}</div>
            <p className="text-sm text-color-secondary m-0 line-height-3">{s.summary}</p>
            <div className="kb-card-count text-sm mt-3">{countUnder(s.id)} articles</div>
          </Link>
        </div>
      ))}
    </div>
  );
}
