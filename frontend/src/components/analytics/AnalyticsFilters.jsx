import { Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const timeRanges = ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Custom Range"];
const severityFilters = ["All", "Critical", "High", "Medium", "Low"];
const protocolFilters = ["All", "SSH", "HTTP", "FTP", "RDP", "Telnet", "MySQL", "SMB"];

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

function AnalyticsFilters({ filters, onFilterChange, className }) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "All" && v !== "Last 24 Hours"
  ).length;

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">Analytics Filters</span>
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
                timeRange: "Last 24 Hours",
                severity: "All",
                protocol: "All",
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
          label="Time Range"
          value={filters.timeRange}
          onChange={(v) => handleFilterChange("timeRange", v)}
          options={timeRanges}
        />
        <FilterSelect
          label="Severity"
          value={filters.severity}
          onChange={(v) => handleFilterChange("severity", v)}
          options={severityFilters}
        />
        <FilterSelect
          label="Protocol"
          value={filters.protocol}
          onChange={(v) => handleFilterChange("protocol", v)}
          options={protocolFilters}
        />
      </div>
    </div>
  );
}

export default AnalyticsFilters;
