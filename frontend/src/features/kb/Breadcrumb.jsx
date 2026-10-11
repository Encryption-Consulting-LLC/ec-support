import { Link } from "react-router-dom";
import { breadcrumbOf, sections } from "./kbContent";
import { kbUrl } from "../../lib/router/path";

// Links to every ancestor section; the current page is the h1 below it.
export default function Breadcrumb({ id }) {
  return (
    <nav aria-label="Breadcrumb" className="kb-breadcrumb">
      {breadcrumbOf(id, sections).map((c, i) => (
        <span key={c.id}>
          {i > 0 && <span className="kb-crumb-sep" aria-hidden="true">/</span>}
          <Link to={kbUrl(c.id)}>{c.title}</Link>
        </span>
      ))}
    </nav>
  );
}
