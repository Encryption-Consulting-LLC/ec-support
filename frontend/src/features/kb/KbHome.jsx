import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { articles, sections } from "./kbContent";
import { ROUTES, kbUrl } from "../../lib/router/path";
import SearchBox from "./SearchBox";

// Home lists come from these folders. If a folder is renamed, its list
// disappears from the home page, so update these ids with it.
// ponytail: POPULAR is a curated folder until page views are counted.
const POPULAR = "popular-right-now";
const RUNBOOKS = "featured-articles/pki-runbooks";
const LIST_LIMIT = 5;
const COMMON_SEARCHES = ["expired CRL", "47-day certificates", "Luna HA groups"];

const inFolder = (id) => articles.filter((a) => a.parent === id);
const countUnder = (id) => articles.filter((a) => a.id.startsWith(`${id}/`)).length;
const searchUrl = (q) => `${ROUTES.KB_SEARCH}?q=${encodeURIComponent(q)}`;

// A titled list of article links with a "View all" link to the folder.
function ArticleLinks({ title, folderId, ordered = false }) {
  const items = inFolder(folderId);
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <div>
      <h2 className="text-xl font-semibold mt-0 mb-3">{title}</h2>
      <List className="kb-link-list">
        {items.slice(0, LIST_LIMIT).map((a) => (
          <li key={a.id}>
            <Link to={kbUrl(a.id)}>{a.title}</Link>
          </li>
        ))}
      </List>
      <Link to={kbUrl(folderId)} className="kb-view-all text-sm">
        View all {items.length}
      </Link>
    </div>
  );
}

// Search first, then browse. Signed-in visitors get the same page with a
// working-mode headline; their cases stay on the Cases page, unchanged.
export default function KbHome() {
  const session = useSelector((state) => state.auth.session);
  const signedIn = Boolean(session || localStorage.getItem("session_id"));
  const topSections = Object.values(sections).filter((s) => s.parent === "");

  return (
    <>
      <title>Knowledge base – EC Support</title>
      <div className="page-hero">
        <div className="support-shell">
          <h1 className="mt-0 mb-2 text-4xl font-semibold">
            {signedIn ? "What are you working on?" : "How can we help?"}
          </h1>
          <p className="hero-sub mt-0 mb-4 line-height-3">
            Answers for CertSecure Manager, CodeSign Secure, CBOM Secure, and the
            PKI and HSM systems around them.
          </p>
          <SearchBox suggest />
          <p className="hero-sub mt-3 mb-0 text-sm">
            People often look for{" "}
            {COMMON_SEARCHES.map((q, i) => (
              <span key={q}>
                <Link to={searchUrl(q)} className="kb-hero-link">{q}</Link>
                {i < COMMON_SEARCHES.length - 2 ? ", " : i === COMMON_SEARCHES.length - 2 ? " and " : "."}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="support-shell support-content">
        <h2 className="text-2xl font-semibold mt-5 mb-1">Browse the knowledge base</h2>
        <p className="text-color-secondary mt-0 mb-3">
          {articles.length} articles written by EC support engineers.
        </p>
        <div className="kb-hub">
          {topSections.map((s) => (
            <Link key={s.id} to={kbUrl(s.id)} className="kb-hub-row">
              <span>
                <span className="kb-hub-title">{s.title}</span>
                <span className="kb-hub-text">{s.summary}</span>
              </span>
              <span className="kb-hub-count">{countUnder(s.id)} articles</span>
            </Link>
          ))}
        </div>

        <div className="grid mt-5">
          <div className="col-12 lg:col-6">
            <ArticleLinks title="Popular right now" folderId={POPULAR} ordered />
          </div>
          <div className="col-12 lg:col-6">
            <ArticleLinks title="PKI runbooks" folderId={RUNBOOKS} />
          </div>
        </div>
      </div>
    </>
  );
}
