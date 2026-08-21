import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { showToast } from "../../services/notification/notification";
import { confirmDialog } from "primereact/confirmdialog";
import {
  getCase,
  addComment,
  downloadAttachment,
  updateCaseStatus,
} from "../../services/support/supportCases";
import { ROUTES } from "../../lib/router/path";
import {
  severityTag,
  statusTag,
  labelFor,
  PRODUCTS,
  INQUIRY_TYPES,
  formatRelative,
  formatDateTime,
} from "./supportMeta";

/**
 * One case: everything the client submitted plus the running comment
 * thread. Comments posted here also nudge the support inbox (threaded
 * under the original case mail), so the portal and support@ stay in
 * step without the client having to email separately.
 */
export default function CaseDetail() {
  const { case_no } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getCase(case_no);
    setLoading(false);
    if (!result.ok) {
      showToast("error", "Load failed", result.error);
      setItem(null);
      return;
    }
    setItem(result.data);
  }, [case_no]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const postComment = async () => {
    const body = comment.trim();
    if (!body) return;
    setPosting(true);
    const result = await addComment(case_no, body);
    setPosting(false);
    if (!result.ok) {
      showToast("error", "Comment failed", result.error);
      return;
    }
    setComment("");
    setItem(result.data);
    showToast("success", "Added", "Your update was added to the case.");
  };

  const changeStatus = async (action) => {
    setChangingStatus(true);
    const result = await updateCaseStatus(case_no, action);
    setChangingStatus(false);
    if (!result.ok) {
      showToast("error", "Update failed", result.error);
      return;
    }
    setItem(result.data);
    showToast(
      "success",
      action === "resolve" ? "Case resolved" : "Case reopened",
      action === "resolve"
        ? "Thanks for confirming — a confirmation email is on its way."
        : "We've been notified and will pick the case back up."
    );
  };

  const confirmResolve = () =>
    confirmDialog({
      header: "Mark this case as resolved?",
      message:
        "Confirm that your issue has been addressed. You can reopen the case at any time if something isn't right.",
      icon: "pi pi-check-circle",
      acceptLabel: "Mark as resolved",
      rejectLabel: "Not yet",
      accept: () => changeStatus("resolve"),
    });

  const confirmReopen = () =>
    confirmDialog({
      header: "Reopen this case?",
      message:
        "Our support team will be notified that the issue is not fully resolved.",
      icon: "pi pi-refresh",
      acceptLabel: "Reopen case",
      rejectLabel: "Cancel",
      accept: () => changeStatus("reopen"),
    });

  const onDownload = async (att) => {
    const result = await downloadAttachment(case_no, att.index, att.filename);
    if (!result.ok) showToast("error", "Download failed", result.error);
  };

  if (loading) {
    return (
      <div className="flex justify-content-center py-8">
        <ProgressSpinner style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="support-shell support-content page-plain-head">
        <p className="font-medium">This case could not be loaded.</p>
        <Button
          label="Back to cases"
          icon="pi pi-arrow-left"
          outlined
          onClick={() => navigate(ROUTES.SUPPORT)}
        />
      </div>
    );
  }

  const sev = severityTag(item.severity);
  const status = statusTag(item.status);
  const fmt = formatDateTime;
  const rel = (value) => (
    <span title={value ? formatDateTime(value) : undefined}>
      {formatRelative(value)}
    </span>
  );
  const closed = item.status === "closed";
  const resolved = item.status === "resolved";
  const canResolve = !closed && !resolved;

  const meta = [
    ["Inquiry type", labelFor(INQUIRY_TYPES, item.inquiry_type)],
    ["Product", labelFor(PRODUCTS, item.product)],
    ["Requester", item.requester?.name || item.requester?.email || "—"],
    ["CC", item.cc?.length ? item.cc.join(", ") : "—"],
    ["Opened", fmt(item.created_at)],
    ["Last update", rel(item.updated_at)],
  ];

  return (
    <div className="support-shell support-content">
      <div className="page-plain-head pb-0">
      <Button
        label="Back to cases"
        icon="pi pi-arrow-left"
        link
        className="px-0 mb-2"
        onClick={() => navigate(ROUTES.SUPPORT)}
      />

      <div className="flex flex-wrap align-items-center gap-3 mb-1">
        <h1 className="m-0 text-3xl font-semibold">{item.case_no}</h1>
        {item.severity && <Tag value={sev.label} severity={sev.severity} rounded />}
        <Tag value={status.label} severity={status.severity} rounded />
        <span className="flex-1" />
        {canResolve && (
          <Button
            label="Mark as resolved"
            icon="pi pi-check"
            size="small"
            outlined
            severity="success"
            loading={changingStatus}
            onClick={confirmResolve}
          />
        )}
        {(resolved || closed) && (
          <Button
            label="Reopen case"
            icon="pi pi-refresh"
            size="small"
            outlined
            loading={changingStatus}
            onClick={confirmReopen}
          />
        )}
        <Button
          icon="pi pi-sync"
          size="small"
          text
          rounded
          aria-label="Refresh case"
          title="Refresh case"
          onClick={refresh}
        />
      </div>
      <p className="mt-1 mb-4 text-xl">{item.subject}</p>
      </div>

      <div className="content-card">
      <div className="grid mb-2">
        {meta.map(([label, value]) => (
          <div className="col-12 md:col-6 lg:col-4 mb-2" key={label}>
            <div className="text-color-secondary text-sm mb-1">{label}</div>
            <div className="font-medium">{value}</div>
          </div>
        ))}
      </div>

      <Divider />

      <h3 className="mt-0 mb-2 text-lg font-semibold">Description</h3>
      <p className="m-0 line-height-3 white-space-pre-line">{item.description}</p>

      {item.attachments?.length > 0 && (
        <>
          <h3 className="mt-4 mb-2 text-lg font-semibold">Attachments</h3>
          <div className="flex flex-column gap-2" style={{ maxWidth: "32rem" }}>
            {item.attachments.map((att) => (
              <Button
                key={att.index}
                label={`${att.filename} (${Math.max(1, Math.round(att.size / 1024))} KB)`}
                icon="pi pi-download"
                outlined
                className="justify-content-start"
                onClick={() => onDownload(att)}
              />
            ))}
          </div>
        </>
      )}

      </div>

      <div className="content-card">
      <h3 className="mt-0 mb-3 text-lg font-semibold">Activity</h3>
      {item.comments?.length ? (
        <div className="flex flex-column gap-3 mb-4">
          {item.comments.map((c, i) => (
            c.is_system ? (
              <div
                key={i}
                className="flex align-items-center gap-2 text-color-secondary text-sm px-2"
              >
                <i className="pi pi-info-circle" aria-hidden="true" />
                <span className="line-height-3">{c.body}</span>
                <span className="ml-auto white-space-nowrap">{rel(c.created_at)}</span>
              </div>
            ) : (
              <div
                key={i}
                className="border-1 border-round p-3 surface-border"
              >
                <div className="flex justify-content-between flex-wrap gap-2 mb-2">
                  <span className="font-medium">{c.author || c.author_email}</span>
                  <span className="text-color-secondary text-sm">
                    {rel(c.created_at)}
                  </span>
                </div>
                <div className="line-height-3 white-space-pre-line">{c.body}</div>
              </div>
            )
          ))}
        </div>
      ) : (
        <p className="text-color-secondary mb-4">
          No updates yet. A support engineer will pick this case up shortly.
        </p>
      )}

      {closed ? (
        <p className="text-color-secondary">
          This case is closed. If the issue returns, open a new case and
          mention {item.case_no}.
        </p>
      ) : (
        <div>
          <InputTextarea
            className="w-full"
            rows={4}
            autoResize
            value={comment}
            placeholder="Add details, new findings, or answers to our questions…"
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            className="mt-2"
            label="Add update"
            icon="pi pi-send"
            loading={posting}
            disabled={!comment.trim()}
            onClick={postComment}
          />
        </div>
      )}
      </div>
    </div>
  );
}
