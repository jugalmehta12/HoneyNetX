import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Server, Activity, ShieldCheck, Info } from "lucide-react";
import api from "@/services/api";

function normalizeHoneypot(record) {
  const statusMap = {
    online: "Online",
    offline: "Offline",
    degraded: "Degraded",
    maintenance: "Maintenance",
  };
  const engine = String(record.engine || "custom");
  return {
    ...record,
    id: record._id || record.id,
    type: engine.charAt(0).toUpperCase() + engine.slice(1),
    status: statusMap[String(record.status || "").toLowerCase()] || "Unknown",
    hostIp: record.ipAddress || "Not recorded",
    portSummary: Array.isArray(record.ports) && record.ports.length
      ? record.ports.map((item) => `${item.port}/${String(item.protocol || "tcp").toUpperCase()}`).join(", ")
      : "Not recorded",
    lastActivity: record.lastHeartbeat || null,
    attackCount: Number(record.totalAttacks || 0),
  };
}

function formatDate(value) {
  if (!value) return "No heartbeat recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No heartbeat recorded" : date.toLocaleString();
}

function statusClass(status) {
  return ({
    Online: "border-success/20 bg-success/10 text-success",
    Offline: "border-destructive/20 bg-destructive/10 text-destructive",
    Degraded: "border-warning/20 bg-warning/10 text-warning",
    Maintenance: "border-border bg-muted text-muted-foreground",
  })[status] || "border-border bg-muted text-muted-foreground";
}

function HoneypotPage() {
  const [honeypots, setHoneypots] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const loadHoneypots = useCallback(async (showToast = false) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/v1/honeypots", {
        params: { page: 1, limit: 100, sort: "-updatedAt" },
      });
      const payload = response.data?.data;
      const records = Array.isArray(payload?.honeypots) ? payload.honeypots : [];
      setHoneypots(records.map(normalizeHoneypot));
      setTotal(payload?.pagination?.total ?? records.length);
      if (showToast) {
        const { default: toast } = await import("react-hot-toast");
        toast.success("Honeypot inventory refreshed");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load honeypot inventory from the API.";
      setError(message);
      if (showToast) {
        const { default: toast } = await import("react-hot-toast");
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHoneypots(); }, [loadHoneypots]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return honeypots.filter((item) => {
      const matchesSearch = !query || [item.name, item.type, item.hostIp, item.hostname, item.environment, item.id]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesSearch
        && (typeFilter === "All" || item.type === typeFilter)
        && (statusFilter === "All" || item.status === statusFilter);
    });
  }, [honeypots, search, typeFilter, statusFilter]);

  const types = [...new Set(honeypots.map((item) => item.type))].sort();
  const onlineCount = honeypots.filter((item) => item.status === "Online").length;
  const offlineCount = honeypots.filter((item) => ["Offline", "Degraded"].includes(item.status)).length;
  const attackCount = honeypots.reduce((sum, item) => sum + item.attackCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Honeypot Inventory</h2>
          <p className="text-muted-foreground">Registered honeypot instances returned by the HoneyNetX API.</p>
          <p className="mt-1 text-xs text-muted-foreground">{loading ? "Refreshing inventory…" : `${filtered.length} matching instances · ${total} total registered`}</p>
        </div>
        <button onClick={() => loadHoneypots(true)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Registered Instances", total, "Records in the API"],
          ["Online", onlineCount, "Based on stored status"],
          ["Offline / Degraded", offlineCount, "Based on stored status"],
          ["Recorded Attacks", attackCount, "Stored per-instance counters"],
        ].map(([title, value, hint]) => (
          <div key={title} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold">{loading && !honeypots.length ? "…" : value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="relative">
            <span className="sr-only">Search honeypots</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, engine, IP…" className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </label>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="All">All engines</option>
            {types.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="All">All statuses</option>
            {["Online", "Offline", "Degraded", "Maintenance", "Unknown"].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Instance</th><th className="px-4 py-3 font-medium">Engine</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">IP address</th><th className="px-4 py-3 font-medium">Ports</th><th className="px-4 py-3 font-medium">Last heartbeat</th><th className="px-4 py-3 font-medium">Details</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3"><p className="font-medium">{item.name}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{String(item.id).slice(-8)}</p></td>
                  <td className="px-4 py-3">{item.type}<p className="mt-1 text-xs text-muted-foreground">{item.environment || "Environment not set"}</p></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{item.hostIp}</td>
                  <td className="max-w-xs px-4 py-3 text-xs">{item.portSummary}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(item.lastActivity)}</td>
                  <td className="px-4 py-3"><button onClick={() => setSelected(item)} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted">View</button></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">{error ? "Inventory could not be loaded." : honeypots.length ? "No instances match these filters." : "No honeypot records are registered in the API yet. The running Cowrie container is not automatically added to this inventory."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
        <p className="text-muted-foreground">This is the registered inventory and its stored status—not a live container-control console. Start/stop/restart and deploy actions are intentionally not offered because the current API does not implement runtime orchestration.</p>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Honeypot details">
          <div className="w-full max-w-xl rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="text-lg font-semibold">{selected.name}</h3><p className="mt-1 text-sm text-muted-foreground">{selected.type} · {selected.status}</p></div><button onClick={() => setSelected(null)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">Close</button></div>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["IP address", selected.hostIp], ["Hostname", selected.hostname || "Not recorded"],
                ["Environment", selected.environment || "Not recorded"], ["Network segment", selected.networkSegment || "Not recorded"],
                ["Ports", selected.portSummary], ["Version", selected.version || "Not recorded"],
                ["Last heartbeat", formatDate(selected.lastHeartbeat)], ["Stored attack count", selected.attackCount],
                ["Created", formatDate(selected.createdAt)], ["Updated", formatDate(selected.updatedAt)],
                ["Location label", selected.location || "Not recorded"], ["Tags", (selected.tags || []).join(", ") || "None"],
              ].map(([label, value]) => <div key={label} className="rounded-lg border border-border p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{value}</dd></div>)}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

export default HoneypotPage;
