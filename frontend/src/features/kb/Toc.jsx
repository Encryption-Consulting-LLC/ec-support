import { useEffect, useRef, useState } from "react";

// Space kept between the sticky topbar and a heading scrolled to the top.
const GAP = 24;
// How long a click owns the dot before scrolling takes over again (ms).
const CLICK_LOCK = 800;

// Bottom edge of the sticky topbar, measured live: its height changes with
// the screen width (it wraps to two rows on phones).
const topbarBottom = () =>
  document.querySelector(".layout-topbar")?.getBoundingClientRect().bottom ?? 0;

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
  const lockedUntil = useRef(0);

  useEffect(() => {
    if (top.length < 2) return;
    const onScroll = () => {
      if (Date.now() < lockedUntil.current) return; // a click just set the dot
      const line = topbarBottom() + GAP + 8;
      let current = top[0].id;
      for (const h of top) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < line) current = h.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps -- `top` derives from items

  // Scroll the heading to just below the topbar and mark it right away, so
  // the dot matches the click even when the page cannot scroll that far
  // (short last sections).
  const jump = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    lockedUntil.current = Date.now() + CLICK_LOCK;
    setActive(id);
    const y = el.getBoundingClientRect().top + window.scrollY - topbarBottom() - GAP;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`); // shareable link, no extra Back step
  };

  if (top.length < 2) return null; // not worth a TOC
  return (
    <aside className="kb-toc" aria-label="On this page">
      <p className="kb-side-title">On this page</p>
      <ol>
        {top.map((h) => (
          <li key={h.id} className={h.id === active ? "is-active" : undefined}>
            <a
              href={`#${h.id}`}
              onClick={(e) => jump(e, h.id)}
              aria-current={h.id === active ? "location" : undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
