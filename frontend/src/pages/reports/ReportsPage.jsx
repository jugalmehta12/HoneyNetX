import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, RefreshCw, Search, Info, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

const REPORT_TYPES = {
  attack_summary: "Attack Summary",
  threat_intelligence: "Threat Intelligence",
  honeypot_status: "Honeypot Status",
  compliance: "Compliance",
  incident: "Incident",
  custom: "Custom",
};
const REPORT_STATUSES = ["pending", "generating", "completed", "failed", "expired"];

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleString();
}

function formatBytes(value) {
  if (!Number.isFinite(Number(value))) return "—";
  const bytes = Number(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusClass(status) {
  return ({
    completed: "border-success/20 bg-success/10 text-success",
    pending: "border-info/20 bg-info/10 text-info",
    generating: "border-info/20 bg-info/10 text-info",
    failed: "border-destructive/20 bg-destructive/10 text-destructive",
    expired: "border-border bg-muted text-muted-foreground",
  })[status] || "border-border bg-muted text-muted-foreground";
}

function mapReport(record) {
  const type = record.type || "custom";
  const requestedBy = record.requestedBy;
  return {
    ...record,
    id: record._id || record.id || "unknown",
    name: record.title || "Untitled report",
    typeLabel: REPORT_TYPES[type] || type.replace(/_/g, " "),
    status: String(record.status || "pending").toLowerCase(),
    generatedDate: record.createdAt || record.updatedAt || null,
    generatedBy: typeof requestedBy === "object"
      ? (requestedBy.name || requestedBy.email || "Known user")
      : requestedBy ? `User ${String(requestedBy).slice(-6)}` : "Not recorded",
    fileSize: formatBytes(record.fileSize),
  };
}

function downloadCsv(records) {
  const columns = ["id", "name", "typeLabel", "format", "status", "generatedDate", "generatedBy", "fileSize"];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    columns.join(","),
    ...records.map((record) => columns.map((key) => escape(record[key])).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "honeynetx-reports.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Let the browser start the download before releasing the object URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [databaseTotal, setDatabaseTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async (showToast = false) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/v1/reports", {
        params: { page: 1, limit: 100, sort: "-createdAt" },
      });
      const payload = response.data?.data;
      const records = Array.isArray(payload?.reports) ? payload.reports : [];
      setReports(records.map(mapReport));
      setDatabaseTotal(payload?.pagination?.total ?? records.length);
      if (showToast) toast.success("Reports refreshed from the API");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load reports from the API.";
      setError(message);
      if (showToast) toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();
    const cutoffs = {
      Today: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
      "Last 7 Days": now - 7 * 86400000,
      "Last 30 Days": now - 30 * 86400000,
      "Last 90 Days": now - 90 * 86400000,
    };
    return reports.filter((report) => {
      const searchable = [report.name, report.id, report.typeLabel, report.generatedBy].join(" ").toLowerCase();
      const date = report.generatedDate ? new Date(report.generatedDate).getTime() : NaN;
      return (!query || searchable.includes(query))
        && (typeFilter === "All" || report.type === typeFilter)
        && (statusFilter === "All" || report.status === statusFilter)
        && (dateFilter === "All Time" || (Number.isFinite(date) && date >= cutoffs[dateFilter]));
    });
  }, [reports, search, typeFilter, statusFilter, dateFilter]);

  const counts = useMemo(() => ({
    completed: reports.filter((report) => report.status === "completed").length,
    pending: reports.filter((report) => ["pending", "generating"].includes(report.status)).length,
    failed: reports.filter((report) => report.status === "failed").length,
  }), [reports]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Report records retrieved from the HoneyNetX API. This page does not substitute sample reports when the API is empty or unavailable.</p>
          <p className="mt-1 text-xs text-muted-foreground">{loading ? "Refreshing…" : `${filteredReports.length} matching records · ${databaseTotal} total in database · showing up to 100 newest records`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => loadReports(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /><span>Refresh</span>
          </button>
          <button
            onClick={() => {
              downloadCsv(filteredReports);
              toast.success(filteredReports.length
                ? `Exported ${filteredReports.length} report record${filteredReports.length === 1 ? "" : "s"} to CSV`
                : "Downloaded a CSV with headers only; no report records match the current filters.");
            }}
            disabled={loading || Boolean(error)}
            title={error ? "Reports could not be loaded, so export is unavailable." : "Export the currently filtered report records to CSV."}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            <FileText className="size-4" aria-hidden="true" /><span>Export CSV</span>
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
            <Download className="size-4" aria-hidden="true" /><span>Print / PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Stored Reports", databaseTotal, "Total API records"],
          ["Completed", counts.completed, "Among newest 100 records"],
          ["Pending / Generating", counts.pending, "Awaiting a generation worker"],
          ["Failed", counts.failed, "Among newest 100 records"],
        ].map(([title, value, hint]) => (
          <div key={title} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold">{loading && reports.length === 0 ? "…" : value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="relative">
            <span className="sr-only">Search reports</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reports…" className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </label>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="All">All report types</option>
            {Object.entries(REPORT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="All">All statuses</option>
            {REPORT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {["All Time", "Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"].map((range) => <option key={range} value={range}>{range}</option>)}
          </select>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Report</th><th className="px-4 py-3 font-medium">Type / Format</th><th className="px-4 py-3 font-medium">Created</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">File size</th><th className="px-4 py-3 font-medium">Details</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/20">
                  <td className="max-w-xs px-4 py-3"><p className="truncate font-medium">{report.name}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{report.id}</p></td>
                  <td className="px-4 py-3"><p>{report.typeLabel}</p><p className="mt-1 uppercase text-xs text-muted-foreground">{report.format || "Format not set"}</p></td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(report.generatedDate)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClass(report.status)}`}>{report.status}</span></td>
                  <td className="px-4 py-3 text-xs">{report.fileSize}</td>
                  <td className="px-4 py-3"><button onClick={() => setSelected(report)} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">View</button></td>
                </tr>
              ))}
              {!loading && filteredReports.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">{error ? "Report records could not be loaded." : reports.length ? "No reports match these filters." : "No report records exist in the API database yet."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
        <p className="text-muted-foreground">The current backend stores report metadata. A report-generation worker and file-download pipeline are not implemented, so this page does not claim that a file has been created just because a report record exists.</p>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Report details">
          <div className="w-full max-w-xl rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><h3 className="text-lg font-semibold">{selected.name}</h3><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{selected.id}</p></div>
              <button onClick={() => setSelected(null)} className="rounded-md p-1.5 hover:bg-muted" aria-label="Close report details"><X className="size-5" /></button>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["Type", selected.typeLabel], ["Format", selected.format], ["Status", selected.status],
                ["Requested by", selected.generatedBy], ["Created", formatDate(selected.generatedDate)],
                ["Range start", formatDate(selected.dateRange?.from)], ["Range end", formatDate(selected.dateRange?.to)],
                ["File size", selected.fileSize], ["Downloads", selected.downloadCount ?? 0],
              ].map(([label, value]) => <div key={label} className="rounded-lg border border-border p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{value}</dd></div>)}
            </dl>
            <div className="mt-5 flex justify-end"><button onClick={() => setSelected(null)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
