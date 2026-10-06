import { Link } from "react-router-dom";
import { breadcrumbOf, sections } from "./kbContent";
import { kbUrl } from "../../lib/router/path";

// Links to every ancestor section; the current page is the h1 below it.
export default function Breadcrumb({ id }) {
  return (
    <nav aria-label="Breadcrumb" className="kb-breadcrumb text-sm">
      {breadcrumbOf(id, sections).map((c) => (
        <span key={c.id}>
          <Link to={kbUrl(c.id)}>{c.title}</Link>
          <i className="pi pi-angle-right mx-2" aria-hidden="true" />
        </span>
      ))}
    </nav>
  );
}
