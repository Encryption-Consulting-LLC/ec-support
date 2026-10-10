import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { articles, sections } from "./kbContent";
import { kbUrl } from "../../lib/router/path";
import MarkdownView from "./MarkdownView";
import Toc, { readHeadings } from "./Toc";
import Breadcrumb from "./Breadcrumb";
import StillStuck from "./StillStuck";

const MENU_LIMIT = 8;

// "2026-10-06" -> "6 Oct 2026". UTC so the date never shifts a day in US time zones.
const formatDay = (day) =>
  new Date(day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

// "In this section": the article's siblings, the current one highlighted.
// Long sections are cut to MENU_LIMIT, always keeping the current article.
function SectionMenu({ article }) {
  const section = sections[article.parent];
  const siblings = articles.filter((a) => a.parent === article.parent);
  if (!section || siblings.length < 2) return <div />; // keeps the grid column
  let shown = siblings.slice(0, MENU_LIMIT);
  if (!shown.includes(article)) shown = [...shown.slice(0, MENU_LIMIT - 1), article];
  const more = siblings.length - shown.length;

  return (
    <nav className="kb-menu" aria-label={section.title}>
      <p className="kb-side-title">In this section</p>
      <ul>
        {shown.map((a) => (
          <li key={a.id}>
            <Link to={kbUrl(a.id)} aria-current={a === article ? "page" : undefined}>
              {a.title}
            </Link>
          </li>
        ))}
        {more > 0 && (
          <li>
            <Link to={kbUrl(section.id)} className="kb-menu-more">
              {more} more in {section.title}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default function KbArticle({ article }) {
  const bodyRef = useRef(null);
  const [toc, setToc] = useState([]);
  useEffect(() => {
    setToc(readHeadings(bodyRef.current));
  }, [article.id]);

  return (
    <div className="kb kb-paper">
      {/* React 19 moves these into <head>: tab title + search-engine snippet. */}
      <title>{`${article.title} – EC Support`}</title>
      <meta name="description" content={article.summary} />

      <header className="kb-band">
        <div className="kb-shell kb-three">
          <div className="kb-three-mid kb-band-head">
            <Breadcrumb id={article.id} />
            <h1 className="kb-display kb-title">{article.title}</h1>
            {article.summary && <p className="kb-lead">{article.summary}</p>}
            <p className="kb-meta">
              {article.type && <span className="kb-type">{article.type}</span>}
              {article.updated && <span>Reviewed {formatDay(article.updated)}</span>}
              {article.appliesTo && <span>For {article.appliesTo}</span>}
            </p>
          </div>
        </div>
      </header>

      <div className="kb-shell kb-three kb-article-body">
        <SectionMenu article={article} />
        {/* "Related articles" is written by hand at the end of each article. */}
        <div ref={bodyRef} className="kb-three-mid">
          <MarkdownView body={article.body} rel={article.rel} />
        </div>
        <Toc items={toc} />
      </div>

      <StillStuck />
    </div>
  );
}
