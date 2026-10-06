import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { articles } from "./kbContent";
import { ROUTES, kbUrl } from "../../lib/router/path";
import MarkdownView from "./MarkdownView";
import Toc, { readHeadings } from "./Toc";
import Breadcrumb from "./Breadcrumb";

// "2026-10-06" -> "6 Oct 2026". UTC so the date never shifts a day in US time zones.
const formatDay = (day) =>
  new Date(day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export default function KbArticle({ article }) {
  const navigate = useNavigate();
  const bodyRef = useRef(null);
  const [toc, setToc] = useState([]);
  useEffect(() => {
    setToc(readHeadings(bodyRef.current));
    window.scrollTo(0, 0); // new page starts at the top
  }, [article.id]);

  // ponytail: "related" = same folder; switch to keyword overlap if lists feel off.
  const related = articles
    .filter((a) => a.parent === article.parent && a.id !== article.id)
    .slice(0, 5);

  return (
    <div className="support-shell support-content">
      <div className="page-plain-head">
        <Breadcrumb id={article.id} />
        <h1 className="text-3xl font-semibold mt-3 mb-2">{article.title}</h1>
        <p className="text-color-secondary mt-0 mb-3 line-height-3">{article.summary}</p>
        <div className="flex flex-wrap align-items-center gap-3 text-sm text-color-secondary">
          {article.type && <Tag value={article.type} rounded />}
          {article.updated && <span>Updated {formatDay(article.updated)}</span>}
          {article.appliesTo && <span>Applies to: {article.appliesTo}</span>}
        </div>
      </div>

      <div className="kb-layout">
        <div>
          <div ref={bodyRef}>
            <MarkdownView body={article.body} rel={article.rel} />
          </div>

          {related.length > 0 && (
            <div className="content-card mt-5">
              <h2 className="text-lg font-semibold mt-0">Related articles</h2>
              <ul className="kb-link-list">
                {related.map((a) => (
                  <li key={a.id}>
                    <Link to={kbUrl(a.id)}>{a.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="content-card flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 className="text-lg font-semibold mt-0 mb-1">Still need help?</h2>
              <p className="m-0 text-color-secondary">
                Open a case and our support team will get back to you.
              </p>
            </div>
            <Button
              label="Open a case"
              icon="pi pi-plus"
              onClick={() => navigate(ROUTES.SUPPORT_NEW)}
            />
          </div>
        </div>
        <Toc items={toc} />
      </div>
    </div>
  );
}
