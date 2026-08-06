import {
  X,
  Server,
  Globe,
  Activity,
  Clock,
  Users,
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
  Settings,
  FileText,
} from "lucide-react";
import HoneypotStatusBadge from "./HoneypotStatusBadge";

function DetailRow({ label, value, mono = false, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
}

function ResourceBar({ label, value, max = 100 }) {
  const percentage = Math.min((value / max) * 100, 100);
  const color =
    percentage > 80
      ? "bg-destructive"
      : percentage > 60
      ? "bg-warning"
      : "bg-success";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function HoneypotDetailsDrawer({ honeypot, onClose, onAction }) {
  if (!honeypot) return null;

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-in-out sm:max-w-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-info/20 bg-info/10">
              <Server className="size-4 text-info" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{honeypot.name}</h2>
              <p className="text-xs text-muted-foreground">{honeypot.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close drawer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <HoneypotStatusBadge status={honeypot.status} />
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                {honeypot.type}
              </span>
              <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                v{honeypot.version}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {honeypot.description}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Instance Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Host IP" value={honeypot.hostIp} mono icon={Globe} />
                <DetailRow label="Port" value={honeypot.port} mono icon={Server} />
                <DetailRow label="Uptime" value={honeypot.uptime} icon={Clock} />
                <DetailRow label="Last Activity" value={formatTimestamp(honeypot.lastActivity)} icon={Activity} />
                <DetailRow label="Last Restart" value={formatTimestamp(honeypot.lastRestart)} icon={Clock} />
                <DetailRow label="Alert Threshold" value={`${honeypot.alertThreshold} attacks`} icon={AlertTriangle} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Resource Usage</h4>
              <div className="space-y-3">
                <ResourceBar label="CPU Usage" value={honeypot.cpuUsage} />
                <ResourceBar label="Memory Usage" value={honeypot.memoryUsage} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Total Sessions" value={honeypot.totalSessions.toLocaleString()} icon={Users} />
                <DetailRow label="Total Attacks" value={honeypot.totalAttacks.toLocaleString()} icon={AlertTriangle} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Services</h4>
              <div className="flex flex-wrap gap-2">
                {honeypot.services.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                {honeypot.status === "Stopped" && (
                  <button
                    onClick={() => onAction(honeypot.id, "start")}
                    className="inline-flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm font-medium text-success transition-colors hover:bg-success/20"
                  >
                    <Play className="size-4" />
                    Start
                  </button>
                )}
                {honeypot.status === "Running" && (
                  <button
                    onClick={() => onAction(honeypot.id, "stop")}
                    className="inline-flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <Square className="size-4" />
                    Stop
                  </button>
                )}
                {honeypot.status === "Running" && (
                  <button
                    onClick={() => onAction(honeypot.id, "restart")}
                    className="inline-flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/20"
                  >
                    <RotateCcw className="size-4" />
                    Restart
                  </button>
                )}
                <button
                  onClick={() => onAction(honeypot.id, "configure")}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Settings className="size-4" />
                  Configure
                </button>
                <button
                  onClick={() => onAction(honeypot.id, "logs")}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <FileText className="size-4" />
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4">
          <div className="flex gap-3">
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Settings className="size-4" aria-hidden="true" />
              Edit Configuration
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
              <FileText className="size-4" aria-hidden="true" />
              View Full Logs
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HoneypotDetailsDrawer;
