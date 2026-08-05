import { Terminal, Radar, ShieldAlert, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const severityConfig = {
  Critical: "bg-destructive/15 text-destructive border-destructive/20",
  High: "bg-warning/15 text-warning border-warning/20",
  Medium: "bg-info/15 text-info border-info/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const activities = [
  {
    id: 1,
    icon: Terminal,
    title: "SSH Login Attempt",
    description: "Multiple failed login attempts detected from 192.168.1.105",
    time: "2 min ago",
    severity: "Critical",
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10 border-destructive/20",
  },
  {
    id: 2,
    icon: Radar,
    title: "Port Scan",
    description: "Full port scan initiated from 172.16.0.89",
    time: "15 min ago",
    severity: "Medium",
    iconColor: "text-info",
    iconBg: "bg-info/10 border-info/20",
  },
  {
    id: 3,
    icon: ShieldAlert,
    title: "Brute Force",
    description: "Credential stuffing attack on admin panel",
    time: "1 hour ago",
    severity: "High",
    iconColor: "text-warning",
    iconBg: "bg-warning/10 border-warning/20",
  },
  {
    id: 4,
    icon: Download,
    title: "Malware Download Attempt",
    description: "Suspicious binary download intercepted",
    time: "3 hours ago",
    severity: "Critical",
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10 border-destructive/20",
  },
];

function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Latest security events</p>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4 p-5 transition-colors hover:bg-muted/20">
            {index < activities.length - 1 && (
              <div className="absolute left-[33px] top-12 bottom-0 w-px bg-border" />
            )}
            <div className={cn(
              "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg border",
              activity.iconBg
            )}>
              <activity.icon className={cn("size-4", activity.iconColor)} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
              <span
                className={cn(
                  "mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  severityConfig[activity.severity]
                )}
              >
                {activity.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
