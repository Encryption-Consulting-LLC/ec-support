import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { articles, sections } from "./kbContent";
import MarkdownView from "./MarkdownView";
import Toc, { readHeadings } from "./Toc";

/**
 * Resolves /kb/* to a KB section or article and renders it.
 * Step 7 splits this into proper home / section / article pages.
 */
export default function KbPage() {
  // "*" is the splat: everything after /kb/, "" on the KB home.
  const id = (useParams()["*"] ?? "").replace(/\/$/, "");
  const section = sections[id];
  const doc = section || articles.find((a) => a.id === id);

  // Hooks must run on every render, so they come before the early return.
  const bodyRef = useRef(null);
  const [toc, setToc] = useState([]);
  useEffect(() => {
    setToc(readHeadings(bodyRef.current));
    window.scrollTo(0, 0); // new page starts at the top
  }, [id]);

  if (!doc) {
    return (
      <div className="support-shell support-content">
        <h1 className="text-3xl font-semibold">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="support-shell support-content">
      <h1 className="text-3xl font-semibold mb-2">{doc.title}</h1>
      <p className="text-color-secondary mt-0">{doc.summary}</p>
      <div className="kb-layout">
        <div ref={bodyRef}>
          <MarkdownView body={doc.body} rel={doc.rel} />
        </div>
        <Toc items={toc} />
      </div>
    </div>
  );
}
