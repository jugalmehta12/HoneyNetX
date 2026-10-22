import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import AttackStatistics from "@/components/attacklogs/AttackStatistics";
import AttackFilters from "@/components/attacklogs/AttackFilters";
import SearchBar from "@/components/common/SearchBar";
import AttackTable from "@/components/attacklogs/AttackTable";
import Pagination from "@/components/common/Pagination";
import AttackDetailsDrawer from "@/components/attacklogs/AttackDetailsDrawer";
import { fetchAttacks } from "@/services/attackService";

const PAGE_SIZE = 10;
const initialFilters = {
  protocol: "All",
  severity: "All",
  status: "All",
  country: "All",
};

function AttacksPage() {
  const [logs, setLogs] = useState([]);
  const [databaseTotal, setDatabaseTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttack, setSelectedAttack] = useState(null);

  const loadAttacks = useCallback(async (showToast = false) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAttacks({ page: 1, limit: 100 });
      setLogs(result.attacks);
      setDatabaseTotal(result.pagination.total ?? result.attacks.length);
      if (showToast) toast.success("Attack logs refreshed");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Could not load live attack records. Check sign-in and API connectivity.";
      setError(message);
      if (showToast) toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttacks();
  }, [loadAttacks]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((log) =>
        [log.sourceIp, log.attackType, log.username, log.protocol, log.country, log.command, log.sessionId]
          .some((value) => String(value || "").toLowerCase().includes(query))
      );
    }
    if (filters.protocol !== "All") result = result.filter((log) => log.protocol === filters.protocol);
    if (filters.severity !== "All") result = result.filter((log) => log.severity === filters.severity);
    if (filters.status !== "All") result = result.filter((log) => log.status === filters.status);
    if (filters.country !== "All") result = result.filter((log) => log.country === filters.country);
    return result;
  }, [logs, searchQuery, filters]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const exportCsv = () => {
    const columns = [
      ["timestamp", "Timestamp"],
      ["sourceIp", "Source IP"],
      ["country", "Country"],
      ["protocol", "Protocol"],
      ["attackType", "Event Type"],
      ["username", "Username"],
      ["severity", "Severity"],
      ["status", "Status"],
      ["port", "Destination Port"],
      ["command", "Command"],
      ["sessionId", "Session ID"],
    ];
    const escapeCsv = (value) => '"' + String(value ?? "").replace(/"/g, '""') + '"';
    const csv = [
      columns.map(([, label]) => escapeCsv(label)).join(","),
      ...filteredLogs.map((log) => columns.map(([key]) => escapeCsv(log[key])).join(",")),
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "honeynetx-attack-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Attack Logs</h2>
          <p className="text-muted-foreground">Live, normalized events ingested from connected honeypots.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadAttacks(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={exportCsv} disabled={!filteredLogs.length} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60">
            <FileText className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">{error}</p>
          <p className="text-muted-foreground">The page will not replace a failed API request with mock records.</p>
          <button onClick={() => loadAttacks(true)} className="w-fit rounded-md border border-border px-3 py-1.5 font-medium hover:bg-muted">Try again</button>
        </div>
      )}

      <AttackStatistics logs={filteredLogs} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search live events..." ariaLabel="Search attack logs" className="w-full sm:max-w-sm" />
        <div className="text-sm text-muted-foreground">
          {loading ? "Loading events…" : `Showing ${filteredLogs.length} matching records · ${databaseTotal} total in database`}
        </div>
      </div>

      <AttackFilters filters={filters} onFilterChange={handleFilterChange} />
      {loading && logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading live attack records…</div>
      ) : (
        <AttackTable logs={paginatedLogs} onViewDetails={setSelectedAttack} />
      )}

      {filteredLogs.length > PAGE_SIZE && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredLogs.length} pageSize={PAGE_SIZE} itemLabel="events" />
      )}

      {selectedAttack && <AttackDetailsDrawer attack={selectedAttack} onClose={() => setSelectedAttack(null)} />}
    </div>
  );
}

export default AttacksPage;
