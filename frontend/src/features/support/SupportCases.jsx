import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { showToast } from "../../services/notification/notification";
import { listMyCases } from "../../services/support/supportCases";
import { ROUTES } from "../../lib/router/path";
import {
  severityTag,
  statusTag,
  labelFor,
  PRODUCTS,
  PRODUCT_RESOURCES,
  EDUCATION_CENTER_URL,
  formatRelative,
  formatDateTime,
} from "./supportMeta";

/**
 * Support hub — the client's case list plus the entry point for
 * opening a new one. Row click drills into the case detail.
 *
 * Scope: the backend returns the caller's own cases by default. The
 * scope toggle ("org") is wired server-side already; surface a
 * my-cases / my-organization switch here when a client asks for it.
 */
export default function SupportCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await listMyCases();
    setLoading(false);
    if (!result.ok) {
      showToast("error", "Load failed", result.error);
      setCases([]);
      return;
    }
    setCases(result.data?.cases || []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Client-side filter — a client org's case list is dozens, not
  // thousands; server-side search isn't worth the round-trip yet.
  const filtered = cases.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.case_no || "").toLowerCase().includes(q) ||
      (c.subject || "").toLowerCase().includes(q) ||
      labelFor(PRODUCTS, c.product).toLowerCase().includes(q)
    );
  });

  const severityBody = (row) => {
    const tag = severityTag(row.severity);
    return row.severity ? (
      <Tag value={tag.label} severity={tag.severity} rounded />
    ) : (
      <span className="text-color-secondary">—</span>
    );
  };

  const statusBody = (row) => {
    const tag = statusTag(row.status);
    return <Tag value={tag.label} severity={tag.severity} rounded />;
  };

  const dateBody = (value) => (
    <span title={value ? formatDateTime(value) : undefined}>
      {formatRelative(value)}
    </span>
  );

  return (
    <>
      <div className="page-hero">
        <div className="support-shell flex flex-wrap justify-content-between align-items-end gap-3">
          <div>
            <h1 className="m-0 text-3xl font-semibold">Support cases</h1>
            <p className="hero-sub mt-2 mb-0 line-height-3">
              Track everything you have open with Encryption Consulting —
              cases land directly with a support engineer.
            </p>
          </div>
          <Button
            label="Open a case"
            icon="pi pi-plus"
            size="large"
            onClick={() => navigate(ROUTES.SUPPORT_NEW)}
          />
        </div>
      </div>

      <div className="support-shell support-content">
        <div className="content-card content-card--flush hero-overlap">
          <div className="card-toolbar flex flex-wrap justify-content-between align-items-center gap-3">
            <IconField iconPosition="left" style={{ maxWidth: "24rem", flex: "1 1 18rem" }}>
              <InputIcon className="pi pi-search" />
              <InputText
                className="w-full"
                value={search}
                aria-label="Search cases"
                placeholder="Search case number, subject, product"
                onChange={(e) => setSearch(e.target.value)}
              />
            </IconField>
            <span className="text-color-secondary text-sm">
              {filtered.length} case{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-content-center py-8">
              <ProgressSpinner style={{ width: 48, height: 48 }} />
            </div>
          ) : (
        <DataTable
          value={filtered}
          dataKey="case_no"
          paginator
          alwaysShowPaginator={false}
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          sortField="updated_at"
          sortOrder={-1}
          selectionMode="single"
          onRowClick={(e) => navigate(`/support/${e.data.case_no}`)}
          rowHover
          emptyMessage={
            <div className="text-center py-5">
              <p className="m-0 font-medium">No cases yet.</p>
              <p className="mt-1 mb-3 text-color-secondary">
                When something needs our attention, open a case and it
                lands with a support engineer.
              </p>
              <Button
                label="Open your first case"
                icon="pi pi-plus"
                outlined
                onClick={() => navigate(ROUTES.SUPPORT_NEW)}
              />
            </div>
          }
        >
          <Column
            field="case_no"
            header="Case"
            sortable
            style={{ width: "10rem" }}
            body={(row) => (
              <Link
                to={`/support/${row.case_no}`}
                className="case-link"
                onClick={(e) => e.stopPropagation()}
              >
                {row.case_no}
              </Link>
            )}
          />
          <Column field="subject" header="Subject" sortable />
          <Column
            field="product"
            sortable
            header="Product"
            style={{ width: "13rem" }}
            body={(row) => labelFor(PRODUCTS, row.product)}
          />
          <Column
            field="severity"
            sortable
            header="Severity"
            style={{ width: "8rem" }}
            body={severityBody}
          />
          <Column
            field="status"
            sortable
            header="Status"
            style={{ width: "10rem" }}
            body={statusBody}
          />
          <Column
            field="created_at"
            sortable
            header="Opened"
            style={{ width: "9rem" }}
            body={(row) => dateBody(row.created_at)}
          />
          <Column
            field="updated_at"
            sortable
            header="Last update"
            style={{ width: "9rem" }}
            body={(row) => dateBody(row.updated_at)}
          />
            </DataTable>
          )}
        </div>

        {/* Documentation strip — same links as the guide page, kept slim
            so the case list stays the page's job. Best deflection spot:
            docs seen BEFORE a "how do I…" case gets opened. */}
        <div className="content-card mt-4">
          <div className="flex flex-wrap align-items-center justify-content-between gap-3">
            <div style={{ minWidth: "16rem", flex: "1 1 20rem" }}>
              <div className="font-semibold mb-1">
                Documentation and knowledge base
              </div>
              <p className="mt-0 mb-0 text-sm text-color-secondary line-height-3">
                Product guides and learning material on
                encryptionconsulting.com — open in a new tab.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-content-end">
              {Object.values(PRODUCT_RESOURCES).map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  <Button label={r.label} icon="pi pi-external-link" size="small" outlined />
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
          </div>
        </div>
      </div>
    </>
  );
}
