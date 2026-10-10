import { useEffect, useState } from "react";

// A heading counts as "current" once its top passes this line (px from the
// top of the window): below the sticky topbar, with a little room.
const ACTIVE_LINE = 120;

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

// "On this page": a thin line with a blue dot on the section being read.
// Only h2s are listed; h3s would make long runbooks a wall of links.
export default function Toc({ items }) {
  const top = items.filter((h) => h.level === 2);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (top.length < 2) return;
    const onScroll = () => {
      let current = top[0].id;
      for (const h of top) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < ACTIVE_LINE) current = h.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps -- `top` derives from items

  if (top.length < 2) return null; // not worth a TOC
  return (
    <aside className="kb-toc" aria-label="On this page">
      <p className="kb-side-title">On this page</p>
      <ol>
        {top.map((h) => (
          <li key={h.id} className={h.id === active ? "is-active" : undefined}>
            <a href={`#${h.id}`} aria-current={h.id === active ? "location" : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
