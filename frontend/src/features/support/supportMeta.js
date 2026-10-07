/**
 * Shared vocabulary for the Support module. Values here MUST stay in
 * sync with the backend's whitelists in app/api/support.py — the API
 * rejects anything outside them, so a drift shows up as a 400 on
 * submit, not a silent mismatch.
 */

export const INQUIRY_TYPES = [
  { label: "I've experienced an incident.", value: "incident" },
  { label: "I have a question.", value: "question" },
  { label: "I have a feature request.", value: "feature_request" },
  { label: "Licensing or account help.", value: "account" },
];

export const PRODUCTS = [
  { label: "CertSecure Manager", value: "certsecuremanager" },
  { label: "CodeSign Secure", value: "codesignsecure" },
  { label: "SSH Secure", value: "sshsecure" },
  { label: "HSM As A Service", value: "hsmasaservice" },
  { label: "CBOM Secure", value: "cbomsecure" },
  { label: "PKI As A Service", value: "pkiasaservice" },
  { label: "Other", value: "other" },
];

export const SEVERITIES = [
  { label: "Sev1 — Critical", value: "sev1" },
  { label: "Sev2 — Major", value: "sev2" },
  { label: "Sev3 — Minor", value: "sev3" },
  { label: "Sev4 — Question / cosmetic", value: "sev4" },
];

/**
 * Shown in the guidance panel next to the form AND used as tooltips.
 * Original EC wording — severity definitions tuned for PKI/CLM
 * products where "down" usually means certificates aren't issuing or
 * something expired in production.
 */
export const SEVERITY_MATRIX = [
  {
    value: "sev1",
    title: "Sev1",
    text:
      "Production is down or a critical system is unusable — issuance halted, " +
      "expired certificates breaking production, or a security/compliance " +
      "exposure — and no workaround exists.",
  },
  {
    value: "sev2",
    title: "Sev2",
    text:
      "Major degradation in production with material business impact, but " +
      "the system stays up or a workaround is available.",
  },
  {
    value: "sev3",
    title: "Sev3",
    text:
      "A non-critical defect or limited functional impact. No critical " +
      "feature is failing.",
  },
  {
    value: "sev4",
    title: "Sev4",
    text:
      "General questions, documentation requests, or cosmetic issues with " +
      "no business impact.",
  },
];

const SEVERITY_TAGS = {
  sev1: { label: "Sev1", severity: "danger" },
  sev2: { label: "Sev2", severity: "warning" },
  sev3: { label: "Sev3", severity: "info" },
  sev4: { label: "Sev4", severity: "secondary" },
};

const STATUS_TAGS = {
  new: { label: "New", severity: "info" },
  in_progress: { label: "In progress", severity: "warning" },
  waiting_on_client: { label: "Waiting on you", severity: "warning" },
  resolved: { label: "Resolved", severity: "success" },
  closed: { label: "Closed", severity: "secondary" },
};

export const severityTag = (value) =>
  SEVERITY_TAGS[value] || { label: "—", severity: "secondary" };

export const statusTag = (value) =>
  STATUS_TAGS[value] || { label: value || "—", severity: "secondary" };

export const labelFor = (options, value) =>
  options.find((o) => o.value === value)?.label || value || "—";

// Client-side mirrors of the backend attachment limits, so the user
// finds out in the browser instead of after a full upload round-trip.
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS =
  ".log,.txt,.csv,.json,.xml,.yaml,.yml,.zip,.gz,.7z,.png,.jpg,.jpeg,.gif,.pdf,.docx,.xlsx,.pptx,.pcap,.pcapng,.evtx,.cer,.crt,.pem,.csr";

/**
 * Contact channels + plan facts, from the official EC "Support
 * Services" deck (ABI_EC_Support Services.pptx). Rendered on the
 * "Working with EC Support" page, the new-case guidance panel, and
 * the footer — one source so a number change is one edit.
 */
export const SUPPORT_CONTACT = {
  email: "support@encryptionconsulting.com",
  phone: "+1 469 815 4136",
  phoneHref: "tel:+14698154136",
  phoneHours: "Mon – Fri, 8 AM to 5 PM CST",
};

/** Sev1–Sev3 response-time targets per support plan (business hours/days). */
export const RESPONSE_TARGETS = [
  {
    severity: "Severity 1",
    description:
      "Production server or mission-critical system(s) are down with no immediate workaround available.",
    standard: "8–10 business hours",
    premium: "4–6 business hours",
    premiumPlus: "< 4 business hours",
  },
  {
    severity: "Severity 2",
    description:
      "Major functionality is impacted, causing significant business disruption, with no reasonable workaround.",
    standard: "1–2 business days",
    premium: "1 business day",
    premiumPlus: "6–8 business hours",
  },
  {
    severity: "Severity 3",
    description:
      "Routine technical inquiries, minor bugs, installation, or configuration assistance where a workaround is available.",
    standard: "3–5 business days",
    premium: "2 business days",
    premiumPlus: "1 business day",
  },
];

/** Plan feature matrix (✓ layout decoded from the deck's slide 10). */
export const PLAN_FEATURES = [
  { feature: "Log requests via email and this portal", standard: true, premium: true, premiumPlus: true },
  { feature: "Phone support (8×5×365)", standard: false, premium: false, premiumPlus: true },
  { feature: "Maximum 4 hours response to initial query", standard: false, premium: true, premiumPlus: true },
  { feature: "Maximum 8 hours response to initial query", standard: true, premium: false, premiumPlus: false },
  { feature: "Monthly touchpoint", standard: true, premium: true, premiumPlus: true },
  { feature: "Weekly status meeting, if required", standard: false, premium: true, premiumPlus: true },
];

export const PLAN_HOURS = {
  standard: "8 AM – 5 PM CST business hours",
  premium: "6 AM – 6 PM CST business hours",
  premiumPlus: "24×7",
};

/**
 * Product documentation lives in the portal's own knowledge base (/kb).
 * The case pages still render these as new-tab links, so a half-written
 * case is never lost. Keyed by the same product values as PRODUCTS; each
 * url must match a knowledge-base folder (kbContent.test.js checks it).
 */
export const PRODUCT_RESOURCES = {
  certsecuremanager: { label: "CertSecure Manager", url: "/kb/products/certsecure-manager" },
  codesignsecure: { label: "CodeSign Secure", url: "/kb/products/codesign-secure" },
  sshsecure: { label: "SSH Secure", url: "/kb/products/ssh-secure" },
  hsmasaservice: { label: "HSM As A Service", url: "/kb/products/hsm-as-a-service" },
  cbomsecure: { label: "CBOM Secure", url: "/kb/products/cbom-secure" },
  pkiasaservice: { label: "PKI As A Service", url: "/kb/products/pki-as-a-service" },
};

export const EDUCATION_CENTER_URL =
  "https://www.encryptionconsulting.com/education-center/";

/**
 * Timestamp presentation. Support portals show WHEN in reading terms,
 * not database terms: "2h ago" answers the actual question ("is anyone
 * on this?") and the precise timestamp lives in the hover tooltip.
 */
export const formatDateTime = (iso) => {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatRelative = (iso) => {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return days === 1 ? "yesterday" : `${days}d ago`;
  const opts = { month: "short", day: "numeric" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
};
