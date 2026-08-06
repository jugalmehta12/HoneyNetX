import { Monitor, Server, Database, Bug, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcons = {
  Running: CheckCircle,
  Connected: CheckCircle,
  Stopped: XCircle,
  Degraded: AlertCircle,
};

const statusColors = {
  Running: "text-success",
  Connected: "text-success",
  Stopped: "text-destructive",
  Degraded: "text-warning",
};

const serviceIcons = {
  frontend: Monitor,
  backend: Server,
  database: Database,
  cowrie: Bug,
};

const serviceLabels = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  cowrie: "Cowrie",
};

function SystemStatusCard({ systemStatus }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">System Status</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Health status of all system components
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(systemStatus).map(([key, service]) => {
          const ServiceIcon = serviceIcons[key] || Server;
          const StatusIcon = statusIcons[service.status] || CheckCircle;
          const statusColor = statusColors[service.status] || "text-muted-foreground";

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-2">
                  <ServiceIcon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {serviceLabels[key]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    v{service.version} • Uptime: {service.uptime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("size-4", statusColor)} />
                <span className={cn("text-xs font-medium", statusColor)}>
                  {service.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SystemStatusCard;
