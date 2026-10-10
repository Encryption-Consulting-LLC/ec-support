import { Link } from "react-router-dom";
import { ARTICLE_TYPES, articles, sections } from "./kbContent";
import { kbUrl } from "../../lib/router/path";
import Breadcrumb from "./Breadcrumb";
import SectionRows from "./SectionRows";
import StillStuck from "./StillStuck";

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
    <div className="kb">
      <title>{`${section.title} – EC Support`}</title>
      <meta name="description" content={section.summary} />
      <header className="kb-band">
        <div className="kb-shell kb-band-head">
          <Breadcrumb id={section.id} />
          <h1 className="kb-display kb-title">{section.title}</h1>
          {section.summary && <p className="kb-lead">{section.summary}</p>}
        </div>
      </header>

      <div className={hasSubsections ? "kb-shell kb-main" : "kb-shell kb-main kb-narrow"}>
        <SectionRows parentId={section.id} />
        {groups.map((g) => (
          <section key={g.type} className="kb-group" aria-label={g.type}>
            <h2 className="kb-h2">{g.type}</h2>
            <ul className="kb-list">
              {g.items.map((a) => (
                <li key={a.id}>
                  <Link to={kbUrl(a.id)}>
                    <span className="kb-list-title">{a.title}</span>
                    {a.summary && <span className="kb-list-text">{a.summary}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!hasSubsections && groups.length === 0 && (
          <p className="kb-muted">No articles in this section yet.</p>
        )}
      </div>

      <StillStuck />
    </div>
  );
}
