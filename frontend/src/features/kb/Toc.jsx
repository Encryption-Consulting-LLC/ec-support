// h2/h3 headings already rendered in the page (ids from rehype-slug)
// -> table of contents entries. Reading the DOM guarantees ids match.
export function readHeadings(root) {
  if (!root) return [];
  return [...root.querySelectorAll("h2, h3")].map((h) => ({
    id: h.id,
    text: h.textContent,
    level: h.tagName === "H3" ? 3 : 2,
  }));
}

export default function Toc({ items }) {
  if (items.length < 2) return null; // not worth a TOC
  return (
    <nav className="kb-toc" aria-label="On this page">
      <div className="kb-toc-title">On this page</div>
      <ul>
        {items.map((h) => (
          <li key={h.id} className={h.level === 3 ? "kb-toc-sub" : undefined}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
