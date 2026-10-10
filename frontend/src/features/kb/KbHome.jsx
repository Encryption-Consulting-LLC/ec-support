import { Link } from "react-router-dom";
import { articles, sections } from "./kbContent";
import { ROUTES, kbUrl } from "../../lib/router/path";
import { SUPPORT_CONTACT } from "../support/supportMeta";
import SearchBox from "./SearchBox";
import SectionRows from "./SectionRows";
import useSignedIn from "./useSignedIn";

const PRODUCTS = "products";
const COMMON_SEARCHES = ["expired CRL", "47-day certificates", "Luna HA groups"];
// One line per product on the home page; the _index.md summaries are
// written for the product page and run to several sentences.
const BLURBS = {
  "products/certsecure-manager": "Discover, renew and automate certificates",
  "products/codesign-secure": "HSM-backed signing with approvals",
  "products/cbom-secure": "Cryptographic inventory and PQC readiness",
  "products/pki-as-a-service": "A managed PKI that EC designs and runs",
  "products/hsm-as-a-service": "Managed HSMs for your keys",
  "products/ssh-secure": "Find and control SSH keys",
};

const searchUrl = (q) => `${ROUTES.KB_SEARCH}?q=${encodeURIComponent(q)}`;

// One job per screen: the hero only searches. Browsing starts below it.
export default function KbHome() {
  const signedIn = useSignedIn();
  const others = Object.values(sections).filter((s) => s.parent === "" && s.id !== PRODUCTS);

  return (
    <div className="kb">
      <title>Knowledge base – EC Support</title>
      <meta
        name="description"
        content="Answers from EC support engineers for CertSecure Manager, CodeSign Secure, CBOM Secure, PKI and HSMs."
      />
      <section className="kb-band kb-hero">
        <div className="kb-shell">
          <h1 className="kb-display">
            {signedIn ? "What are you working on?" : "How can we help?"}
          </h1>
          <SearchBox suggest large />
          <p className="kb-common">
            Common searches:{" "}
            {COMMON_SEARCHES.map((q, i) => (
              <span key={q}>
                {i > 0 && ", "}
                <Link to={searchUrl(q)}>{q}</Link>
              </span>
            ))}
          </p>
        </div>
      </section>

      <div className="kb-shell kb-main">
        <section aria-labelledby="kb-products-h">
          <div className="kb-head-row">
            <h2 id="kb-products-h" className="kb-h2 kb-h2-lg">Browse by product</h2>
            <Link to={ROUTES.KB_SEARCH} className="kb-link">All {articles.length} articles</Link>
          </div>
          <SectionRows parentId={PRODUCTS} blurbs={BLURBS} />
        </section>

        <section aria-labelledby="kb-beyond-h" className="kb-beyond">
          <h2 id="kb-beyond-h">Beyond products</h2>
          {others.map((s) => (
            <Link key={s.id} to={kbUrl(s.id)} className="kb-link">{s.title}</Link>
          ))}
        </section>

        <p className="kb-sev1">
          Production down? <Link to={ROUTES.SUPPORT_NEW}>Open a Sev 1 case</Link>
          {!signedIn && " (sign in first)"}, then call{" "}
          <a href={SUPPORT_CONTACT.phoneHref}>{SUPPORT_CONTACT.phone}</a>.
        </p>
      </div>
    </div>
  );
}
