import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { articles, sections } from "./kbContent";
import { ROUTES } from "../../lib/router/path";
import KbArticle from "./KbArticle";
import KbSection from "./KbSection";
import KbHome from "./KbHome";
import KbSearchPage from "./KbSearchPage";

/**
 * Resolves /kb/* to a KB section (folder with _index.md) or an article.
 */
export default function KbPage() {
  // "*" is the splat: everything after /kb/, "" on the KB home.
  const id = (useParams()["*"] ?? "").replace(/\/$/, "");
  const section = sections[id];
  const article = section ? null : articles.find((a) => a.id === id);

  // Every KB page starts at the top. Runs before the early return (hook rule).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // key: a new page gets a fresh component (fresh TOC state).
  let page;
  if (id === "") page = <KbHome />;
  else if (id === "search") page = <KbSearchPage />; // /kb/search?q=...
  else if (section) page = <KbSection key={id} section={section} />;
  else if (article) page = <KbArticle key={id} article={article} />;
  else {
    page = (
      <div className="kb">
        <header className="kb-band">
          <div className="kb-shell kb-band-head">
            <h1 className="kb-display kb-title">Article not found</h1>
            <p className="kb-lead">
              It may have moved. <Link to={ROUTES.KB}>Search the knowledge base</Link>.
            </p>
          </div>
        </header>
      </div>
    );
  }

  return page;
}
