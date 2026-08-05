import { cn } from "@/lib/utils";

const severityConfig = {
  Critical: {
    dot: "bg-destructive",
    badge: "bg-destructive/15 text-destructive border-destructive/20",
  },
  High: {
    dot: "bg-warning",
    badge: "bg-warning/15 text-warning border-warning/20",
  },
  Medium: {
    dot: "bg-info",
    badge: "bg-info/15 text-info border-info/20",
  },
  Low: {
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
};

const statusConfig = {
  New: "bg-destructive/15 text-destructive border-destructive/20",
  Investigating: "bg-warning/15 text-warning border-warning/20",
  Resolved: "bg-success/15 text-success border-success/20",
};

const mockAlerts = [
  {
    id: 1,
    time: "2 min ago",
    sourceIp: "192.168.1.105",
    attackType: "SSH Brute Force",
    severity: "Critical",
    status: "New",
  },
  {
    id: 2,
    time: "15 min ago",
    sourceIp: "10.0.0.234",
    attackType: "SQL Injection",
    severity: "High",
    status: "Investigating",
  },
  {
    id: 3,
    time: "1 hour ago",
    sourceIp: "172.16.0.89",
    attackType: "Port Scan",
    severity: "Medium",
    status: "Resolved",
  },
  {
    id: 4,
    time: "3 hours ago",
    sourceIp: "192.168.2.201",
    attackType: "Malware Upload",
    severity: "Critical",
    status: "New",
  },
  {
    id: 5,
    time: "5 hours ago",
    sourceIp: "10.10.5.67",
    attackType: "Directory Traversal",
    severity: "Low",
    status: "Resolved",
  },
];

function RecentAlerts() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Latest security events</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Demo Data
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Source IP</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Attack Type</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Severity</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockAlerts.map((alert) => (
              <tr
                key={alert.id}
                className="transition-colors hover:bg-muted/20"
              >
                <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                  {alert.time}
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-foreground">
                  {alert.sourceIp}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-foreground">
                  {alert.attackType}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        severityConfig[alert.severity].dot
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        severityConfig[alert.severity].badge
                      )}
                    >
                      {alert.severity}
                    </span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                      statusConfig[alert.status]
                    )}
                  >
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentAlerts;
