import { Link } from "react-router-dom";
import { articles, sections } from "./kbContent";
import { ROUTES, kbUrl } from "../../lib/router/path";
import SearchBox from "./SearchBox";
import SectionCards from "./SectionCards";

// Home lists come from these folders. If a folder is renamed, its list
// disappears from the home page, so update these ids with it.
const FEATURED = "featured-articles";
const POPULAR = "popular-right-now";
const LIST_LIMIT = 5;

const QUICK_LINKS = [
  {
    icon: "pi pi-plus-circle",
    title: "Open a case",
    text: "Submit a new request to the EC Support team.",
    to: ROUTES.SUPPORT_NEW,
  },
  {
    icon: "pi pi-list",
    title: "My cases",
    text: "Check the status of your open and past cases.",
    to: ROUTES.SUPPORT,
  },
  {
    icon: "pi pi-compass",
    title: "Working with EC Support",
    text: "Severity levels, support plans and how to get the fastest help.",
    to: kbUrl("working-with-ec-support"),
  },
];

const inFolder = (id) => articles.filter((a) => a.parent === id);

// A titled list of article links with a "View all" link to the folder.
function ArticleLinks({ title, folderId }) {
  const items = inFolder(folderId);
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold mt-0 mb-2">{title}</h3>
      <ul className="kb-article-list">
        {items.slice(0, LIST_LIMIT).map((a) => (
          <li key={a.id}>
            <Link to={kbUrl(a.id)}>{a.title}</Link>
          </li>
        ))}
      </ul>
      <Link to={kbUrl(folderId)} className="kb-view-all text-sm">
        View all {items.length} <i className="pi pi-arrow-right text-xs" aria-hidden="true" />
      </Link>
    </div>
  );
}

// Keyfactor-style landing page: search first, then quick actions, then browse.
export default function KbHome() {
  const featuredGroups = Object.values(sections).filter((s) => s.parent === FEATURED);

  return (
    <>
      <div className="page-hero">
        <div className="support-shell">
          <h1 className="mt-0 mb-2 text-4xl font-semibold">How can we help?</h1>
          <p className="hero-sub mt-0 mb-4 line-height-3">
            Search product guides, PKI and HSM runbooks, and post-quantum guidance.
          </p>
          <SearchBox />
        </div>
      </div>

      <div className="support-shell support-content">
        <div className="grid mt-4">
          {QUICK_LINKS.map((q) => (
            <div key={q.title} className="col-12 md:col-4">
              <Link to={q.to} className="kb-card">
                <i className={`${q.icon} kb-card-icon`} aria-hidden="true" />
                <div className="font-semibold mt-2 mb-1">{q.title}</div>
                <p className="text-sm text-color-secondary m-0 line-height-3">{q.text}</p>
              </Link>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Knowledge hub</h2>
        <SectionCards parentId="" />

        <div className="grid mt-4">
          <div className="col-12 lg:col-6">
            <div className="content-card h-full">
              <h2 className="text-xl font-semibold mt-0">Featured articles</h2>
              {featuredGroups.map((g) => (
                <ArticleLinks key={g.id} title={g.title} folderId={g.id} />
              ))}
            </div>
          </div>
          <div className="col-12 lg:col-6">
            <div className="content-card h-full">
              {/* ponytail: curated folder for now; Phase 3 ranks by real page views. */}
              <ArticleLinks title="Popular right now" folderId={POPULAR} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
