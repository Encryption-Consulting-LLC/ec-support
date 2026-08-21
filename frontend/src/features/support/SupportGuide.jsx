import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { ROUTES } from "../../lib/router/path";
import {
  SUPPORT_CONTACT,
  RESPONSE_TARGETS,
  PLAN_FEATURES,
  PLAN_HOURS,
  PRODUCT_RESOURCES,
  EDUCATION_CENTER_URL,
} from "./supportMeta";

/**
 * "Working with EC Support" — the static orientation page a first-time
 * client reads before (or instead of) opening a case. All facts come
 * from the official EC Support Services deck via supportMeta.js; this
 * file is layout only. The knowledge base deliberately lives on
 * encryptionconsulting.com — this page links out rather than hosting
 * articles in the portal.
 */

const check = (yes) =>
  yes ? (
    <i className="pi pi-check-circle text-green-500" aria-label="Included" />
  ) : (
    <span className="text-color-secondary" aria-label="Not included">
      —
    </span>
  );

function SectionTitle({ children }) {
  return <h2 className="mt-0 mb-3 text-2xl font-semibold">{children}</h2>;
}

export default function SupportGuide() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Open a case",
      text:
        "Use this portal (best — everything stays tracked), email us, or " +
        "call for production-down emergencies. You'll get a case number " +
        "and a confirmation email right away.",
    },
    {
      title: "An engineer picks it up",
      text:
        "A technical resource contacts you within your plan's response " +
        "target to discuss the issue and plan the first steps toward a " +
        "resolution.",
    },
    {
      title: "We work it together",
      text:
        "You'll receive regular updates on the case. Reply to any case " +
        "email or add updates and files in the portal — both land in the " +
        "same thread our engineers work from.",
    },
    {
      title: "You confirm the fix",
      text:
        "When the issue is addressed, you can mark the case resolved in " +
        "the portal — and reopen it any time if something isn't right.",
    },
  ];

  const coverage = [
    {
      icon: "pi-verified",
      domain: "PKI",
      title: "RA / CA operations",
      text: "Root and Issuing CA lifecycle — renewals, upgrades, troubleshooting.",
    },
    {
      icon: "pi-sitemap",
      domain: "PKI",
      title: "PKI infrastructure",
      text: "Dedicated Issuing CA systems plus revocation services (CDP, OCSP, CRLs).",
    },
    {
      icon: "pi-key",
      domain: "PKI · HSM",
      title: "Key & HSM management",
      text: "User and device keys, backup and recovery, HSM firmware and hardware issues.",
    },
    {
      icon: "pi-shield",
      domain: "PKI · CLM",
      title: "Policy & compliance",
      text: "CP/CPS upkeep, audit support (FIPS, NIST), logging and audit trails.",
    },
    {
      icon: "pi-box",
      domain: "CLM",
      title: "CertSecure Manager platform",
      text: "End-to-end platform support — versions, patches, license renewals.",
    },
    {
      icon: "pi-bell",
      domain: "CLM",
      title: "Certificate operations & monitoring",
      text: "Issuance, renewal, revocation, discovery scans, expiry alerts, dashboards.",
    },
    {
      icon: "pi-link",
      domain: "CLM",
      title: "Integrations & automation",
      text: "ADCS, ServiceNow, web servers, ACME enrollment, APIs, and connectors.",
    },
    {
      icon: "pi-database",
      domain: "All engagements",
      title: "Patching, backup & restore",
      text: "Security patches and upgrades (to N-1), CA/HSM configuration backups.",
    },
  ];

  return (
    <>
      <div className="page-hero">
        <div className="support-shell">
          <h1 className="mt-0 mb-2 text-3xl font-semibold">
            Working with EC Support
          </h1>
          <p className="hero-sub mt-0 mb-0 line-height-3">
            How to reach us, what happens after you open a case, and what our
            support plans cover across your PKI, CLM, and HSM environments.
          </p>
        </div>
      </div>

      <div className="support-shell support-content">

      {/* ---- contact channels (overlapping the hero) -------------------- */}
      <div className="grid hero-overlap mb-4">
        <div className="col-12 md:col-4">
          <div className="contact-card">
            <div className="flex align-items-center gap-2 mb-3">
              <span className="contact-icon"><i className="pi pi-ticket" aria-hidden="true" /></span>
              <span className="font-semibold text-lg">Support portal</span>
            </div>
            <p className="mt-0 mb-3 text-sm line-height-3 text-color-secondary">
              The fastest way to reach us. Cases are routed straight to our
              support engineers with everything they need attached.
            </p>
            <Button
              label="Open a case"
              size="small"
              icon="pi pi-plus"
              onClick={() => navigate(ROUTES.SUPPORT_NEW)}
            />
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="contact-card">
            <div className="flex align-items-center gap-2 mb-3">
              <span className="contact-icon"><i className="pi pi-envelope" aria-hidden="true" /></span>
              <span className="font-semibold text-lg">Email</span>
            </div>
            <p className="mt-0 mb-2 text-sm line-height-3 text-color-secondary">
              Monitored during business hours. Your mail opens a case and
              threads with it from then on.
            </p>
            <a className="font-medium" href={`mailto:${SUPPORT_CONTACT.email}`}>
              {SUPPORT_CONTACT.email}
            </a>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <div className="contact-card">
            <div className="flex align-items-center gap-2 mb-3">
              <span className="contact-icon"><i className="pi pi-phone" aria-hidden="true" /></span>
              <span className="font-semibold text-lg">Phone</span>
            </div>
            <p className="mt-0 mb-2 text-sm line-height-3 text-color-secondary">
              For Severity 1 production-down emergencies, call first — then
              open a case so everything is tracked.
            </p>
            <a className="font-medium" href={SUPPORT_CONTACT.phoneHref}>
              {SUPPORT_CONTACT.phone}
            </a>
            <div className="text-sm text-color-secondary mt-1">
              {SUPPORT_CONTACT.phoneHours}
            </div>
          </div>
        </div>
      </div>

      {/* ---- what happens next ----------------------------------------- */}
      <div className="content-card">
      <SectionTitle>What happens after you open a case</SectionTitle>
      <div className="grid mb-3">
        {steps.map((s, i) => (
          <div className="col-12 md:col-6 lg:col-3" key={s.title}>
            <div className="p-3 h-full">
              <div className="step-badge mb-2" aria-hidden="true">
                {i + 1}
              </div>
              <div className="font-semibold mb-1">{s.title}</div>
              <p className="mt-0 mb-0 text-sm line-height-3 text-color-secondary">
                {s.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      </div>

      {/* ---- severity + response targets -------------------------------- */}
      <div className="content-card">
      <SectionTitle>Severity levels and response-time targets</SectionTitle>
      <p className="mt-0 mb-3 text-color-secondary line-height-3" style={{ maxWidth: "46rem" }}>
        Targets are for the first response from a technical resource and
        depend on your support plan. Not sure which plan you're on? Ask your
        engagement manager, or just open the case — severity drives the
        queue either way.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="guide-table" style={{ minWidth: "44rem" }}>
          <thead>
            <tr className="text-left">
              <th>Severity</th>
              <th>Meaning</th>
              <th>Standard</th>
              <th>Premium</th>
              <th>Premium Plus</th>
            </tr>
          </thead>
          <tbody>
            {RESPONSE_TARGETS.map((r) => (
              <tr key={r.severity}>
                <td className="font-medium white-space-nowrap">
                  {r.severity}
                </td>
                <td className="text-sm line-height-3">
                  {r.description}
                </td>
                <td className="white-space-nowrap">{r.standard}</td>
                <td className="white-space-nowrap">{r.premium}</td>
                <td className="white-space-nowrap">{r.premiumPlus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-0 mb-4 text-sm text-color-secondary">
        Severity 4 (general questions, documentation requests, cosmetic
        issues) is handled as a routine inquiry.
      </p>

      </div>

      {/* ---- plan comparison -------------------------------------------- */}
      <div className="content-card">
      <SectionTitle>Support plans at a glance</SectionTitle>
      <div className="overflow-x-auto mb-4">
        <table className="guide-table" style={{ minWidth: "40rem" }}>
          <thead>
            <tr className="text-left">
              <th>&nbsp;</th>
              <th>Standard</th>
              <th>Premium</th>
              <th>Premium Plus</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((f) => (
              <tr key={f.feature}>
                <td>{f.feature}</td>
                <td>{check(f.standard)}</td>
                <td>{check(f.premium)}</td>
                <td>{check(f.premiumPlus)}</td>
              </tr>
            ))}
            <tr>
              <td className="font-medium">Support hours</td>
              <td>{PLAN_HOURS.standard}</td>
              <td>{PLAN_HOURS.premium}</td>
              <td>{PLAN_HOURS.premiumPlus}</td>
            </tr>
          </tbody>
        </table>
      </div>

      </div>

      {/* ---- what's covered --------------------------------------------- */}
      <div className="content-card">
      <SectionTitle>What our support covers</SectionTitle>
      <p className="mt-0 mb-3 text-color-secondary line-height-3" style={{ maxWidth: "46rem" }}>
        Coverage is defined by the products and services in your support
        agreement — your engagement manager can confirm your exact scope.
        Across PKI, CLM, and HSM engagements, support typically includes:
      </p>
      <div className="grid">
        {coverage.map((c) => (
          <div className="col-12 md:col-6 lg:col-3" key={c.title}>
            <div className="coverage-tile">
              <div className="flex align-items-center justify-content-between mb-2">
                <span className="contact-icon">
                  <i className={`pi ${c.icon}`} aria-hidden="true" />
                </span>
                <span className="coverage-tag">{c.domain}</span>
              </div>
              <div className="font-semibold mb-1">{c.title}</div>
              <p className="mt-0 mb-0 text-sm line-height-3 text-color-secondary">
                {c.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      </div>

      {/* ---- knowledge base (external) ----------------------------------- */}
      <div className="content-card">
      <SectionTitle>Documentation and knowledge base</SectionTitle>
      <p className="mt-0 mb-3 text-color-secondary line-height-3" style={{ maxWidth: "46rem" }}>
        Product documentation, guides, and learning material live on
        encryptionconsulting.com — these open in a new tab.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.values(PRODUCT_RESOURCES).map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
          >
            <Button
              label={r.label}
              icon="pi pi-external-link"
              size="small"
              outlined
            />
          </a>
        ))}
        <a
          href={EDUCATION_CENTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Button label="Education Center" icon="pi pi-external-link" size="small" />
        </a>
      </div>

      <p className="text-sm text-color-secondary mt-4 mb-0">
        Ready when you are:&nbsp;
        <Button
          label="Open a case"
          link
          className="p-0 text-sm"
          onClick={() => navigate(ROUTES.SUPPORT_NEW)}
        />
      </p>
      </div>
      </div>
    </>
  );
}
