import { useParams } from "react-router-dom";
import { articles, sections } from "./kbContent";

/**
 * Resolves /kb/* to a KB section or article. Temporary body: it only
 * proves routing works. Steps 6–7 replace it with the real pages.
 */
export default function KbPage() {
  // "*" is the splat: everything after /kb/, "" on the KB home.
  const id = (useParams()["*"] ?? "").replace(/\/$/, "");
  const section = sections[id];
  const doc = section || articles.find((a) => a.id === id);

  if (!doc) {
    return (
      <div className="support-shell support-content">
        <h1 className="text-3xl font-semibold">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="support-shell support-content">
      <p className="text-color-secondary">
        {section ? "Section" : "Article"} · {id || "(home)"}
      </p>
      <h1 className="text-3xl font-semibold">{doc.title}</h1>
      <p>{doc.summary}</p>
    </div>
  );
}