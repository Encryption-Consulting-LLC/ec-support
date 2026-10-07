import { Link } from "react-router-dom";
import { ARTICLE_TYPES, articles, sections } from "./kbContent";
import { kbUrl } from "../../lib/router/path";
import Breadcrumb from "./Breadcrumb";
import SectionCards from "./SectionCards";

// Section page: lists are generated from the folders, so they never go stale.
// The section's _index.md only supplies the title and summary.
export default function KbSection({ section }) {
  const hasSubsections = Object.values(sections).some((s) => s.parent === section.id);
  const own = articles.filter((a) => a.parent === section.id);
  const groups = ARTICLE_TYPES.map((type) => ({
    type,
    items: own.filter((a) => a.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <title>{`${section.title} – EC Support`}</title>
      <meta name="description" content={section.summary} />
      <div className="page-hero">
        <div className="support-shell">
          <Breadcrumb id={section.id} />
          <h1 className="mt-3 mb-2 text-3xl font-semibold">{section.title}</h1>
          <p className="hero-sub mt-0 mb-0 line-height-3">{section.summary}</p>
        </div>
      </div>

      <div className="support-shell support-content">
        <div className="hero-overlap">
          <SectionCards parentId={section.id} />

          {groups.map((g) => (
            <div key={g.type} className="content-card mt-4">
              <h2 className="text-lg font-semibold mt-0">{g.type}</h2>
              <ul className="kb-article-list">
                {g.items.map((a) => (
                  <li key={a.id}>
                    <Link to={kbUrl(a.id)} className="font-medium">
                      {a.title}
                    </Link>
                    <p className="text-sm text-color-secondary mt-1 mb-0 line-height-3">
                      {a.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {!hasSubsections && groups.length === 0 && (
            <div className="content-card">No articles in this section yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
