import { useState, useMemo } from "react";
import { RefreshCw, Plus, Settings, Filter, ChevronDown } from "lucide-react";
import mockHoneypots from "@/data/mockHoneypots";
import HoneypotSummaryCards from "@/components/honeypot/HoneypotSummaryCards";
import HoneypotTable from "@/components/honeypot/HoneypotTable";
import HoneypotDetailsDrawer from "@/components/honeypot/HoneypotDetailsDrawer";
import TopologyCard from "@/components/honeypot/TopologyCard";
import SearchBar from "@/components/common/SearchBar";

const honeypotTypes = ["All", "Cowrie", "Dionaea", "HoneyPy", "HoneyD"];
const statusFilters = ["All", "Running", "Stopped", "Degraded"];

function HoneypotFilters({ filters, onFilterChange }) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== "All").length;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={() => onFilterChange({ honeypotType: "All", status: "All" })}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Reset all
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Honeypot Type</label>
          <div className="relative">
            <select
              value={filters.honeypotType}
              onChange={(e) => handleFilterChange("honeypotType", e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {honeypotTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const initialFilters = {
  honeypotType: "All",
  status: "All",
};

function HoneypotPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedHoneypot, setSelectedHoneypot] = useState(null);

  const filteredHoneypots = useMemo(() => {
    let result = [...mockHoneypots];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (hp) =>
          hp.name.toLowerCase().includes(query) ||
          hp.type.toLowerCase().includes(query) ||
          hp.hostIp.toLowerCase().includes(query) ||
          hp.id.toLowerCase().includes(query)
      );
    }

    if (filters.honeypotType !== "All") {
      result = result.filter((hp) => hp.type === filters.honeypotType);
    }
    if (filters.status !== "All") {
      result = result.filter((hp) => hp.status === filters.status);
    }

    return result;
  }, [searchQuery, filters]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (honeypot) => {
    setSelectedHoneypot(honeypot);
  };

  const handleCloseDrawer = () => {
    setSelectedHoneypot(null);
  };

  const handleAction = (id, action) => {
    console.log(`Action ${action} on honeypot ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Honeypot</h2>
          <p className="text-muted-foreground">
            Manage and monitor your deployed honeypot instances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <RefreshCw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Settings className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Deploy Honeypot</span>
          </button>
        </div>
      </div>

      <HoneypotSummaryCards honeypots={filteredHoneypots} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search honeypots..."
          ariaLabel="Search honeypots"
          className="w-full sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredHoneypots.length} honeypot{filteredHoneypots.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      <HoneypotFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HoneypotTable
            honeypots={filteredHoneypots}
            onViewDetails={handleViewDetails}
            onAction={handleAction}
          />
        </div>
        <div>
          <TopologyCard />
        </div>
      </div>

      {selectedHoneypot && (
        <HoneypotDetailsDrawer
          honeypot={selectedHoneypot}
          onClose={handleCloseDrawer}
          onAction={handleAction}
        />
      )}
    </div>
  );
}

export default HoneypotPage;
