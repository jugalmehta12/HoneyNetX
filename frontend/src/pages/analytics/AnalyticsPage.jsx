import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
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
import { fetchAttacks } from "@/services/attackService";

const CHART_COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#22C55E", "#EC4899", "#14B8A6", "#64748B"];
const initialFilters = { timeRange: "Last 24 Hours", severity: "All", protocol: "All" };
const countBy = (items, keyFn) => {
  const counts = new Map();
  items.forEach((item) => {
    const key = keyFn(item) || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

function AnalyticsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (showToast = false) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAttacks({ page: 1, limit: 100 });
      setEvents(result.attacks);
      setTotal(result.pagination.total ?? result.attacks.length);
      if (showToast) toast.success("Analytics refreshed from live events");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load analytics from the live API.";
      setError(message);
      if (showToast) toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const rangeMs = {
      "Last 24 Hours": 24 * 60 * 60 * 1000,
      "Last 7 Days": 7 * 24 * 60 * 60 * 1000,
      "Last 30 Days": 30 * 24 * 60 * 60 * 1000,
      "All Time": Infinity,
    }[filters.timeRange] ?? 24 * 60 * 60 * 1000;

    return events.filter((event) => {
      const timestamp = new Date(event.timestamp).getTime();
      const inRange = Number.isFinite(timestamp) && now - timestamp <= rangeMs;
      const severityMatches = filters.severity === "All" || event.severity === filters.severity;
      const protocolMatches = filters.protocol === "All" || event.protocol === filters.protocol;
      return inRange && severityMatches && protocolMatches;
    });
  }, [events, filters]);

  const chartData = useMemo(() => {
    const now = Date.now();
    const timeline = Array.from({ length: 24 }, (_, index) => {
      const start = now - (23 - index) * 60 * 60 * 1000;
      const end = start + 60 * 60 * 1000;
      const bucket = filteredEvents.filter((event) => {
        const time = new Date(event.timestamp).getTime();
        return time >= start && time < end;
      });
      return {
        time: new Date(start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
        attacks: bucket.length,
        critical: bucket.filter((event) => event.severity === "Critical").length,
        blocked: 0,
      };
    });

    const typeCounts = countBy(filteredEvents, (event) => event.attackType);
    const protocolCounts = countBy(filteredEvents, (event) => event.protocol);
    const countryCounts = countBy(filteredEvents, (event) => event.country).slice(0, 8);
    const portCounts = countBy(filteredEvents.filter((event) => event.port !== "N/A"), (event) => event.port).slice(0, 10);
    const totalFiltered = filteredEvents.length || 1;

    const severityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const types = typeCounts.slice(0, 8).map(([name, value], index) => ({ name, value, color: CHART_COLORS[index % CHART_COLORS.length] }));
    const protocols = protocolCounts.slice(0, 8).map(([name, value], index) => ({ name, value, color: CHART_COLORS[index % CHART_COLORS.length] }));
    const countries = countryCounts.map(([country, attacks]) => ({ country, attacks, percentage: Number(((attacks / totalFiltered) * 100).toFixed(1)) }));
    const topTypes = typeCounts.slice(0, 8).map(([type, count]) => ({
      type,
      count,
      severity: filteredEvents.find((event) => event.attackType === type)?.severity || "Low",
    })).sort((a, b) => b.count - a.count || severityRank[b.severity] - severityRank[a.severity]);
    const ports = portCounts.map(([port, count]) => {
      const numericPort = Number(port);
      const protocol = numericPort === 22 ? "SSH" : numericPort === 80 ? "HTTP" : numericPort === 443 ? "HTTPS" : "TCP";
      const risk = count >= 10 ? "Critical" : count >= 5 ? "High" : count >= 2 ? "Medium" : "Low";
      return { port: numericPort, protocol, count, risk };
    });

    const high = filteredEvents.filter((event) => ["High", "Critical"].includes(event.severity)).length;
    const highRatio = filteredEvents.length ? Math.round((high / filteredEvents.length) * 100) : 0;
    const threatScore = {
      overall: highRatio,
      trend: 0,
      factors: [
        { name: "High / Critical Share", score: highRatio, weight: 100 },
        { name: "Event Volume", score: Math.min(100, filteredEvents.length), weight: 0 },
      ],
    };

    const countWithin = (duration) => filteredEvents.filter((event) => now - new Date(event.timestamp).getTime() <= duration).length;
    const trends = {
      hourly: { current: countWithin(60 * 60 * 1000), change: 0 },
      daily: { current: countWithin(24 * 60 * 60 * 1000), change: 0 },
      weekly: { current: countWithin(7 * 24 * 60 * 60 * 1000), change: 0 },
      monthly: { current: countWithin(30 * 24 * 60 * 60 * 1000), change: 0 },
    };

    return {
      timeline,
      types: types.length ? types : [{ name: "No events", value: 0, color: CHART_COLORS[0] }],
      protocols: protocols.length ? protocols : [{ name: "No events", value: 0, color: CHART_COLORS[0] }],
      countries,
      topTypes: topTypes.length ? topTypes : [{ type: "No events", count: 0, severity: "Low" }],
      ports: ports.length ? ports : [{ port: 0, protocol: "N/A", count: 0, risk: "Low" }],
      stats: {
        totalAttacks: filteredEvents.length,
        totalAttacksTrend: 0,
        criticalAlerts: filteredEvents.filter((event) => event.severity === "Critical").length,
        criticalAlertsTrend: 0,
        blockedThreats: 0,
        blockedThreatsTrend: 0,
        uniqueAttackers: new Set(filteredEvents.map((event) => event.sourceIp)).size,
        uniqueAttackersTrend: 0,
      },
      threatScore,
      trends,
    };
  }, [events, filteredEvents, total]);

  const exportCsv = () => {
    const columns = ["timestamp", "sourceIp", "attackType", "protocol", "severity", "command", "sessionId"];
    const escape = (value) => '"' + String(value ?? "").replace(/"/g, '""') + '"';
    const csv = [columns.join(","), ...filteredEvents.map((event) => columns.map((key) => escape(event[key])).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "honeynetx-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Statistics computed from the newest records returned by the HoneyNetX API.</p>
          <p className="mt-1 text-xs text-muted-foreground">{loading ? "Refreshing analytics…" : `${filteredEvents.length} matching events for selected filters · ${total} total records in database`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /><span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={exportCsv} disabled={!filteredEvents.length} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60">
            <FileText className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
            <Download className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error} Sample analytics are not substituted.</div>}
      <AnalyticsFilters filters={filters} onFilterChange={setFilters} />
      <AnalyticsSummaryCards stats={chartData.stats} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><AttackTimelineChart data={chartData.timeline} /></div>
        <div className="space-y-6"><ThreatScoreCard data={chartData.threatScore} /><RecentTrendCard data={chartData.trends} /></div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttackTypeDistribution data={chartData.types} />
        <ProtocolDistribution data={chartData.protocols} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopCountriesChart data={chartData.countries.length ? chartData.countries : [{ country: "Unknown", attacks: 0, percentage: 0 }]} />
        <TopAttackTypes data={chartData.topTypes} />
      </div>
      <MostTargetedPorts data={chartData.ports} />
      <p className="text-xs text-muted-foreground">Note: geolocation and blocked-threat counts are not currently enriched by the ingestion pipeline. Trend comparisons show 0% because a historical comparison baseline is not yet implemented.</p>
    </div>
  );
}

export default AnalyticsPage;
