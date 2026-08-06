import { useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
import AnalyticsSummaryCards from "@/components/analytics/AnalyticsSummaryCards";
import AttackTimelineChart from "@/components/analytics/AttackTimelineChart";
import AttackTypeDistribution from "@/components/analytics/AttackTypeDistribution";
import ProtocolDistribution from "@/components/analytics/ProtocolDistribution";
import TopCountriesChart from "@/components/analytics/TopCountriesChart";
import TopAttackTypes from "@/components/analytics/TopAttackTypes";
import MostTargetedPorts from "@/components/analytics/MostTargetedPorts";
import ThreatScoreCard from "@/components/analytics/ThreatScoreCard";
import RecentTrendCard from "@/components/analytics/RecentTrendCard";
import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";
import {
  summaryStats,
  attackTimeline,
  attackTypeDistribution,
  protocolDistribution,
  topCountries,
  topAttackTypes,
  mostTargetedPorts,
  threatScore,
  recentTrends,
} from "@/data/mockAnalytics";

const initialFilters = {
  timeRange: "Last 24 Hours",
  severity: "All",
  protocol: "All",
};

function AnalyticsPage() {
  const [filters, setFilters] = useState(initialFilters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Trends, patterns, and statistical analysis of attack data.
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

      <AnalyticsFilters filters={filters} onFilterChange={setFilters} />

      <AnalyticsSummaryCards stats={summaryStats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AttackTimelineChart data={attackTimeline} />
        </div>
        <div className="space-y-6">
          <ThreatScoreCard data={threatScore} />
          <RecentTrendCard data={recentTrends} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttackTypeDistribution data={attackTypeDistribution} />
        <ProtocolDistribution data={protocolDistribution} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopCountriesChart data={topCountries} />
        <TopAttackTypes data={topAttackTypes} />
      </div>

      <MostTargetedPorts data={mostTargetedPorts} />
    </div>
  );
}

export default AnalyticsPage;
