import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { articles, sections } from "./kbContent";
import KbArticle from "./KbArticle";
import KbSection from "./KbSection";

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
  if (section) return <KbSection key={id} section={section} />;
  if (article) return <KbArticle key={id} article={article} />;

  return (
    <div className="support-shell support-content">
      <h1 className="text-3xl font-semibold">Article not found</h1>
    </div>
  );
}
