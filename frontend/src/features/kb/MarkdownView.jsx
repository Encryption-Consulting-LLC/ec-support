import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Link } from "react-router-dom";
import { images, resolveImage, resolveLink } from "./kbContent";

/**
 * Renders one KB file's Markdown. Relative .md links become in-app routes,
 * relative images become their bundled URLs. Raw HTML is never rendered
 * (no rehype-raw), so content cannot inject scripts.
 */
export default function MarkdownView({ body, rel }) {
  return (
    <div className="kb-article">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href = "", children }) => {
            const to = resolveLink(rel, href);
            if (to.startsWith("/kb")) return <Link to={to}>{children}</Link>;
            if (to.startsWith("#")) return <a href={to}>{children}</a>;
            return (
              <a href={to} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          img: ({ src = "", alt = "" }) => (
            <img src={resolveImage(rel, src, images)} alt={alt} loading="lazy" />
          ),
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
