import { useParams } from "react-router-dom";
import { articles, sections } from "./kbContent";
import KbArticle from "./KbArticle";

/**
 * Resolves /kb/* to a KB section or article.
 * Sections render as articles until Step 7b adds KbSection.
 */
export default function KbPage() {
  // "*" is the splat: everything after /kb/, "" on the KB home.
  const id = (useParams()["*"] ?? "").replace(/\/$/, "");
  const doc = sections[id] || articles.find((a) => a.id === id);

  if (!doc) {
    return (
      <div className="support-shell support-content">
        <h1 className="text-3xl font-semibold">Article not found</h1>
      </div>
    );
  }

  // key: a new page gets a fresh component (fresh TOC state, scroll reset).
  return <KbArticle key={id} article={doc} />;
}
