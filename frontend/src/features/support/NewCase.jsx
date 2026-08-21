import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Chips } from "primereact/chips";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { showToast } from "../../services/notification/notification";
import { createCase } from "../../services/support/supportCases";
import { ROUTES } from "../../lib/router/path";
import {
  INQUIRY_TYPES,
  PRODUCTS,
  SEVERITIES,
  SEVERITY_MATRIX,
  SUPPORT_CONTACT,
  PRODUCT_RESOURCES,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  ACCEPTED_EXTENSIONS,
} from "./supportMeta";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const schema = Yup.object({
  inquiry_type: Yup.string()
    .oneOf(INQUIRY_TYPES.map((o) => o.value))
    .required("Choose what type of inquiry this is."),
  product: Yup.string()
    .oneOf(PRODUCTS.map((o) => o.value))
    .required("Choose the product your inquiry relates to."),
  severity: Yup.string().when("inquiry_type", {
    is: "incident",
    then: (s) =>
      s
        .oneOf(SEVERITIES.map((o) => o.value))
        .required("Choose a severity for the incident."),
    otherwise: (s) => s.nullable(),
  }),
  subject: Yup.string().trim().max(200, "Keep the subject under 200 characters.").required("Subject is required."),
  cc: Yup.array().of(
    Yup.string().matches(EMAIL_RE, "CC entries must be valid email addresses.")
  ),
  description: Yup.string()
    .trim()
    .max(20000, "Description is too long — attach a file for full logs.")
    .required("Describe the issue so we can route it correctly."),
});

/**
 * Submit-a-request form. Two columns on wide screens: the form on the
 * left, guidance (Sev1 instructions, severity matrix, data-privacy
 * note) on the right — the guidance is exactly what a client needs
 * open while choosing a severity, so it lives next to the field
 * instead of behind a docs link.
 */
export default function NewCase() {
  const navigate = useNavigate();
  const uploadRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      inquiry_type: "",
      product: "",
      severity: "",
      subject: "",
      cc: [],
      description: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const files = uploadRef.current?.getFiles?.() || [];

      // Mirror the backend caps client-side so the user isn't told
      // after a full upload round-trip.
      if (files.length > MAX_FILES) {
        showToast("error", "Too many files", `Attach at most ${MAX_FILES} files.`);
        return;
      }
      const total = files.reduce((sum, f) => sum + f.size, 0);
      if (files.some((f) => f.size > MAX_FILE_BYTES) || total > MAX_TOTAL_BYTES) {
        showToast(
          "error",
          "Attachments too large",
          "10 MB per file, 20 MB total. Zip large logs before attaching."
        );
        return;
      }

      setSubmitting(true);
      const result = await createCase(
        {
          ...values,
          severity: values.inquiry_type === "incident" ? values.severity : null,
        },
        files
      );
      setSubmitting(false);

      if (!result.ok) {
        showToast("error", "Case not created", result.error);
        return;
      }
      showToast(
        "success",
        "Case created",
        `${result.data.case_no} is with our support team. A confirmation email is on its way.`
      );
      navigate(`/support/${result.data.case_no}`);
    },
  });

  /**
   * Attach images pasted from the clipboard (Ctrl+V / Cmd+V).
   *
   * PrimeReact's FileUpload only ingests files via its button or a drag
   * and drop, so a pasted screenshot -- the single most common way
   * someone illustrates a support issue -- silently did nothing and the
   * case arrived with no attachment. This routes the clipboard through
   * the component's own onFileSelect so accept/size validation, dedupe
   * and the thumbnail preview all behave exactly as they do for a
   * chosen file.
   *
   * Listening on window rather than the form: paste lands wherever the
   * caret happens to be (usually the description box, sometimes
   * nothing), and a form-scoped handler would miss most of it. Text
   * pastes are left completely alone -- we only act when the clipboard
   * actually carries files, and only then call preventDefault.
   */
  const handlePaste = useCallback((event) => {
    const items = Array.from(event.clipboardData?.items || []);
    const fileItems = items.filter((item) => item.kind === "file");
    if (fileItems.length === 0) return;

    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "-")
      .slice(0, 15);

    const files = [];
    fileItems.forEach((item, i) => {
      const blob = item.getAsFile();
      if (!blob) return;
      // Clipboard blobs are unnamed, or all called "image.png", which
      // would collide across pastes and can lose the extension the
      // backend allowlist checks. Give each one a real name.
      const subtype = (blob.type.split("/")[1] || "png").toLowerCase();
      const ext = subtype === "jpeg" ? "jpg" : subtype;
      const suffix = fileItems.length > 1 ? `-${i + 1}` : "";
      const named =
        blob.name && blob.name !== "image.png"
          ? blob.name
          : `pasted-${stamp}${suffix}.${ext}`;
      files.push(new File([blob], named, { type: blob.type }));
    });
    if (files.length === 0) return;

    event.preventDefault();

    const existing = uploadRef.current?.getFiles?.() || [];
    if (existing.length + files.length > MAX_FILES) {
      showToast(
        "error",
        "Too many files",
        `Attach at most ${MAX_FILES} files.`
      );
      return;
    }

    // Synthetic event shaped the way onFileSelect reads it: it checks
    // dataTransfer first, then target.files.
    uploadRef.current?.onFileSelect?.({ dataTransfer: { files } });
    showToast(
      "success",
      files.length > 1 ? "Screenshots attached" : "Screenshot attached",
      files.map((f) => f.name).join(", ")
    );
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? (
      <small className="p-error block mt-1">{formik.errors[name]}</small>
    ) : null;

  const isIncident = formik.values.inquiry_type === "incident";

  return (
    <div className="support-shell support-content">
      <div className="page-plain-head">
        <Button
          label="Back to cases"
          icon="pi pi-arrow-left"
          link
          className="px-0"
          onClick={() => navigate(ROUTES.SUPPORT)}
        />
        <h1 className="mt-2 mb-1 text-3xl font-semibold">Submit a request</h1>
        <p className="mt-0 mb-0 text-color-secondary line-height-3">
          Tell us what's going on — the more we know up front, the faster an
          engineer can act.
        </p>
      </div>

      <div className="grid">
        {/* ------------------------------ form ------------------------------ */}
        <div className="col-12 lg:col-7">
          <div className="content-card">
          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="field mb-4">
              <label htmlFor="inquiry_type" className="block font-medium mb-2">
                What type of inquiry can we assist you with today?{" "}
                <span className="text-red-500">*</span>
              </label>
              <Dropdown
                id="inquiry_type"
                className="w-full"
                options={INQUIRY_TYPES}
                value={formik.values.inquiry_type}
                placeholder="Select one"
                onChange={(e) => formik.setFieldValue("inquiry_type", e.value)}
                onBlur={() => formik.setFieldTouched("inquiry_type", true)}
              />
              {fieldError("inquiry_type")}
            </div>

            <div className="field mb-4">
              <label htmlFor="product" className="block font-medium mb-2">
                Which product does your inquiry relate to?{" "}
                <span className="text-red-500">*</span>
              </label>
              <Dropdown
                id="product"
                className="w-full"
                options={PRODUCTS}
                value={formik.values.product}
                placeholder="Select a product"
                onChange={(e) => formik.setFieldValue("product", e.value)}
                onBlur={() => formik.setFieldTouched("product", true)}
              />
              {fieldError("product")}
            </div>

            {isIncident && (
              <div className="field mb-4">
                <label htmlFor="severity" className="block font-medium mb-2">
                  Severity <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="severity"
                  className="w-full"
                  options={SEVERITIES}
                  value={formik.values.severity}
                  placeholder="Select a severity"
                  onChange={(e) => formik.setFieldValue("severity", e.value)}
                  onBlur={() => formik.setFieldTouched("severity", true)}
                />
                {fieldError("severity")}
              </div>
            )}

            <div className="field mb-4">
              <label htmlFor="subject" className="block font-medium mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <InputText
                id="subject"
                name="subject"
                className="w-full"
                maxLength={200}
                value={formik.values.subject}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {fieldError("subject")}
            </div>

            <div className="field mb-4">
              <label htmlFor="cc" className="block font-medium mb-2">
                CC
              </label>
              <Chips
                id="cc"
                className="w-full"
                value={formik.values.cc}
                separator=","
                allowDuplicate={false}
                // Without addOnBlur, Chips only commits typed text on
                // Enter/comma -- an address typed and left in the input
                // when the user clicks Submit was silently dropped, and
                // the case went out with no CC at all.
                addOnBlur
                placeholder="Add emails and press Enter"
                onChange={(e) => formik.setFieldValue("cc", e.value || [])}
                onBlur={() => formik.setFieldTouched("cc", true)}
              />
              <small className="text-color-secondary block mt-1">
                CC'd colleagues receive the case confirmation and updates.
              </small>
              {fieldError("cc")}
            </div>

            <div className="field mb-4">
              <label htmlFor="description" className="block font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <InputTextarea
                id="description"
                name="description"
                className="w-full"
                rows={7}
                autoResize
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <small className="text-color-secondary block mt-1">
                What happened, when it started, what changed recently, and any
                error text. A support engineer picks this up as written.
              </small>
              {fieldError("description")}
            </div>

            <div className="field mb-4">
              <label className="block font-medium mb-2">Attachments</label>
              <FileUpload
                ref={uploadRef}
                mode="advanced"
                multiple
                customUpload
                auto={false}
                accept={ACCEPTED_EXTENSIONS}
                maxFileSize={MAX_FILE_BYTES}
                // There is no separate upload step -- files ride along when
                // the case is submitted. PrimeReact 10 has no
                // showUploadButton/showCancelButton props (React silently
                // ignores unknown props, so a dead Upload button rendered
                // and clicking it did nothing); hiding via the button
                // options is the supported way in this version.
                uploadOptions={{ style: { display: "none" } }}
                cancelOptions={{ style: { display: "none" } }}
                chooseLabel="Add file"
                emptyTemplate={
                  <p className="m-0 text-color-secondary">
                    Add files, drop them here, or paste a screenshot with
                    Ctrl+V — logs, screenshots, configs.
                  </p>
                }
              />
              <small className="text-color-secondary block mt-1">
                Up to {MAX_FILES} files, 10 MB each, 20 MB total. Pasted
                screenshots are attached automatically.
              </small>
            </div>

            <Button
              type="submit"
              label="Submit"
              icon="pi pi-send"
              loading={submitting}
            />
          </form>
          </div>
        </div>

        {/* --------------------------- guidance ----------------------------- */}
        <div className="col-12 lg:col-5">
          <div className="content-card">
          <p className="mt-0 line-height-3">
            Welcome to the Encryption Consulting support portal. The inquiry
            type, product, and severity you pick route the case to the right
            engineer and set the response clock — the more detail you give,
            the faster we can act on it.
          </p>

          <Message
            severity="warn"
            className="w-full justify-content-start mb-4"
            content={
              <span className="line-height-3">
                If you believe this is a Sev1 incident, submit this form
                first so a case number exists, then call{" "}
                <a href={SUPPORT_CONTACT.phoneHref} className="font-semibold">
                  {SUPPORT_CONTACT.phone}
                </a>{" "}
                ({SUPPORT_CONTACT.phoneHours}) and quote it.
              </span>
            }
          />

          {PRODUCT_RESOURCES[formik.values.product] && (
            <p className="mt-0 mb-4 line-height-3">
              Looking for documentation instead?{" "}
              <a
                href={PRODUCT_RESOURCES[formik.values.product].url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium"
              >
                Browse the {PRODUCT_RESOURCES[formik.values.product].label}{" "}
                knowledge base
                <i className="pi pi-external-link ml-1 text-xs" />
              </a>
            </p>
          )}

          <h3 className="mt-0 mb-2 text-lg font-semibold">Severity matrix</h3>
          <ul className="pl-3 m-0 line-height-3">
            {SEVERITY_MATRIX.map((row) => (
              <li key={row.value} className="mb-2">
                <span className="font-medium">{row.title}:</span> {row.text}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 mb-2 text-lg font-semibold">Data privacy note</h3>
          <p className="m-0 line-height-3">
            Sanity-check everything before you attach it. Logs and configs
            often carry passwords, API tokens, or personal data — redact or
            mask them first. Never attach private key material; if a key is
            part of the problem, describe it and we will arrange a secure
            channel.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
