/**
 * Support-case API client.
 *
 * Mirrors services/admin/adminOrganizations.js — every helper returns
 * { ok, data?, error? } so call-sites use a uniform shape. The backend
 * lives at /api/v1/support (see app/api/support.py).
 */

import api from "../../lib/axios/api";
import URL from "../../utils/url";

function extractError(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Request failed"
  );
}

function casePath(case_no) {
  return URL.support.case_detail.replace(
    "<case_no>",
    encodeURIComponent(case_no)
  );
}

/** GET /support/cases → the caller's cases (org-scoped variants via scope). */
export const listMyCases = async (scope = "me") => {
  try {
    const response = await api.get(URL.support.cases, { params: { scope } });
    return { ok: true, data: response.data };
  } catch (error) {
    return { ok: false, error: extractError(error) };
  }
};

/** GET /support/cases/<case_no>. */
export const getCase = async (case_no) => {
  try {
    const response = await api.get(casePath(case_no));
    return { ok: true, data: response.data?.case };
  } catch (error) {
    return { ok: false, error: extractError(error) };
  }
};

/**
 * POST /support/cases (multipart).
 *
 * `values` is the validated Formik payload; `files` is the array from
 * FileUpload's ref.
 *
 * The Content-Type override below is LOAD-BEARING. The shared api
 * instance defaults every request to application/json, and axios >= 1.0
 * reacts to (JSON content type + FormData body) by CONVERTING the form
 * to JSON — formDataToJSON() keeps the text fields but destroys File
 * entries (axios lib/defaults/index.js). The backend accepted the
 * resulting JSON body, so cases arrived complete except for silently
 * empty attachments. Declaring multipart/form-data here stops that
 * conversion; axios then strips the header again before sending
 * (lib/helpers/resolveConfig.js) so the browser sets the real boundary.
 */
export const createCase = async (values, files = []) => {
  try {
    const form = new FormData();
    form.append("inquiry_type", values.inquiry_type);
    form.append("product", values.product);
    if (values.severity) form.append("severity", values.severity);
    form.append("subject", values.subject);
    form.append("description", values.description);
    form.append("cc", JSON.stringify(values.cc || []));
    files.forEach((file) => form.append("attachments", file, file.name));

    const response = await api.post(URL.support.cases, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ok: true, data: response.data?.case };
  } catch (error) {
    return {
      ok: false,
      error: extractError(error),
      status: error?.response?.status,
    };
  }
};

/**
 * POST /support/cases/<case_no>/status { action: "resolve" | "reopen" }.
 * Client-driven resolution — the backend accepts exactly these two
 * transitions; everything else stays agent-owned.
 */
export const updateCaseStatus = async (case_no, action) => {
  try {
    const response = await api.post(
      `${casePath(case_no)}/status`,
      { action }
    );
    return { ok: true, data: response.data?.case };
  } catch (error) {
    return { ok: false, error: extractError(error) };
  }
};

/** POST /support/cases/<case_no>/comments { body } → updated case. */
export const addComment = async (case_no, body) => {
  try {
    const response = await api.post(
      URL.support.comments.replace("<case_no>", encodeURIComponent(case_no)),
      { body }
    );
    return { ok: true, data: response.data?.case };
  } catch (error) {
    return { ok: false, error: extractError(error) };
  }
};

/**
 * GET /support/cases/<case_no>/attachments/<index> — fetch as a blob
 * (the session header rides the axios instance; a bare <a href> would
 * arrive unauthenticated) and hand it to the browser as a download.
 */
export const downloadAttachment = async (case_no, index, filename) => {
  try {
    const path = URL.support.attachment
      .replace("<case_no>", encodeURIComponent(case_no))
      .replace("<index>", String(index));
    const response = await api.get(path, { responseType: "blob" });

    const blobUrl = window.URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename || "attachment";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(blobUrl);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: extractError(error) };
  }
};
