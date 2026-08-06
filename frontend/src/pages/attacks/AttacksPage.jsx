import { useState, useMemo } from "react";
import { RefreshCw, Download, FileText } from "lucide-react";
import mockAttackLogs from "@/data/mockAttackLogs";
import AttackStatistics from "@/components/attacklogs/AttackStatistics";
import AttackFilters from "@/components/attacklogs/AttackFilters";
import SearchBar from "@/components/common/SearchBar";
import AttackTable from "@/components/attacklogs/AttackTable";
import Pagination from "@/components/common/Pagination";
import AttackDetailsDrawer from "@/components/attacklogs/AttackDetailsDrawer";

const PAGE_SIZE = 10;

const initialFilters = {
  protocol: "All",
  severity: "All",
  status: "All",
  country: "All",
};

function AttacksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttack, setSelectedAttack] = useState(null);

  const filteredLogs = useMemo(() => {
    let result = [...mockAttackLogs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.sourceIp.toLowerCase().includes(query) ||
          log.attackType.toLowerCase().includes(query) ||
          log.username.toLowerCase().includes(query) ||
          log.protocol.toLowerCase().includes(query) ||
          log.country.toLowerCase().includes(query)
      );
    }

    if (filters.protocol !== "All") {
      result = result.filter((log) => log.protocol === filters.protocol);
    }
    if (filters.severity !== "All") {
      result = result.filter((log) => log.severity === filters.severity);
    }
    if (filters.status !== "All") {
      result = result.filter((log) => log.status === filters.status);
    }
    if (filters.country !== "All") {
      result = result.filter((log) => log.country === filters.country);
    }

    return result;
  }, [searchQuery, filters]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (attack) => {
    setSelectedAttack(attack);
  };

  const handleCloseDrawer = () => {
    setSelectedAttack(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Attack Logs</h2>
          <p className="text-muted-foreground">
            Detailed logs of all detected attack attempts and intrusions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <RefreshCw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <FileText className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      <AttackStatistics logs={filteredLogs} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search attacks..."
          ariaLabel="Search attack logs"
          className="w-full sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredLogs.length} attack{filteredLogs.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      <AttackFilters filters={filters} onFilterChange={handleFilterChange} />

      <AttackTable logs={paginatedLogs} onViewDetails={handleViewDetails} />

      {filteredLogs.length > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredLogs.length}
          pageSize={PAGE_SIZE}
          itemLabel="attacks"
        />
      )}

      {selectedAttack && (
        <AttackDetailsDrawer attack={selectedAttack} onClose={handleCloseDrawer} />
      )}
    </div>
  );
}

export default AttacksPage;
