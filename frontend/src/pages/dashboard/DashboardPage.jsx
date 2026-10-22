import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, RefreshCw, ShieldAlert, Users } from "lucide-react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCard from "@/components/dashboard/StatCard";
import AttackSeverityBadge from "@/components/attacklogs/AttackSeverityBadge";
import { fetchAttacks } from "@/services/attackService";

function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const result = await fetchAttacks({ page: 1, limit: 100 });
      setEvents(result.attacks);
      setTotalEvents(result.pagination.total ?? result.attacks.length);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to retrieve live event data. Check API connectivity and sign-in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const timer = window.setInterval(loadDashboard, 15000);
    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const highSeverityCount = events.filter((event) => ["High", "Critical"].includes(event.severity)).length;
  const uniqueSourceIps = new Set(events.map((event) => event.sourceIp).filter((ip) => ip !== "Unknown")).size;
  const apiStatus = error ? "Unavailable" : loading ? "Checking…" : "Connected";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <WelcomeBanner />
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh data
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Stored Events" value={loading && totalEvents === 0 ? "…" : totalEvents} status="Database total" variant="info" icon={AlertTriangle} />
        <StatCard title="High / Critical Events" value={highSeverityCount} status="Among newest 100 events" variant="danger" icon={ShieldAlert} />
        <StatCard title="Unique Source IPs" value={uniqueSourceIps} status="Among newest 100 events" variant="warning" icon={Users} />
        <StatCard title="API / Database" value={apiStatus} status={error ? "Check connection" : "Request succeeded"} variant={error ? "danger" : "success"} icon={Activity} />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Honeypot Events</h3>
            <p className="mt-1 text-xs text-muted-foreground">Latest normalized records returned by the HoneyNetX API</p>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{loading ? "Refreshing" : `${events.length} loaded`}</span>
        </div>

        {events.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{error ? "Live data is unavailable until the API connection is fixed." : "No events have been stored yet."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3 font-medium">Source IP</th>
                  <th className="px-5 py-3 font-medium">Event / Command</th>
                  <th className="px-5 py-3 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.slice(0, 8).map((event) => (
                  <tr key={event.id} className="hover:bg-muted/20">
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">{formatTimestamp(event.timestamp)}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{event.sourceIp}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{event.attackType}</div>
                      {event.command && <div className="mt-0.5 max-w-md truncate font-mono text-xs text-muted-foreground">{event.command}</div>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3"><AttackSeverityBadge severity={event.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Refresh after correcting the API connection. Sample events are intentionally not substituted.</p>}
      </section>
    </div>
  );
}

export default DashboardPage;
