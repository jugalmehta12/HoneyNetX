import { Filter, ChevronDown } from "lucide-react";

const reportTypes = ["All", "Daily Summary", "Weekly Report", "Compliance", "Incident Report", "Analytics"];
const statuses = ["All", "Completed", "Processing", "Failed", "Archived"];
const dateRanges = ["All Time", "Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function ReportFilters({ filters, onFilterChange, className }) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "All" && v !== "All Time"
  ).length;

  return (
    <div className={`rounded-xl border border-border bg-card ${className || ""}`}>
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
            onClick={() => {
              const resetFilters = {
                reportType: "All",
                status: "All",
                dateRange: "All Time",
              };
              onFilterChange(resetFilters);
            }}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Reset all
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
        <FilterSelect
          label="Report Type"
          value={filters.reportType}
          onChange={(v) => handleFilterChange("reportType", v)}
          options={reportTypes}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => handleFilterChange("status", v)}
          options={statuses}
        />
        <FilterSelect
          label="Date Range"
          value={filters.dateRange}
          onChange={(v) => handleFilterChange("dateRange", v)}
          options={dateRanges}
        />
      </div>
    </div>
  );
}

export default ReportFilters;
