import { Server, Database, Wifi, RefreshCw, Key, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  Connected: "bg-success/15 text-success border-success/20",
  Online: "bg-success/15 text-success border-success/20",
  Disconnected: "bg-destructive/15 text-destructive border-destructive/20",
  Offline: "bg-destructive/15 text-destructive border-destructive/20",
};

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusConfig[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {status}
    </span>
  );
}

function ApiConfigurationCard({ api }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">API Configuration</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Backend connection and API settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Backend URL</p>
                <p className="font-mono text-sm text-foreground">{api.backendUrl}</p>
              </div>
            </div>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <ExternalLink className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">MongoDB</p>
                  <p className="text-sm font-medium text-foreground">Status</p>
                </div>
              </div>
              <StatusBadge status={api.mongoStatus} />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Connection</p>
                  <p className="text-sm font-medium text-foreground">Status</p>
                </div>
              </div>
              <StatusBadge status={api.connectionStatus} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">API Key</p>
                <p className="font-mono text-sm text-foreground">{api.apiKey}</p>
              </div>
            </div>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last synced: {formatDate(api.lastSync)}</span>
          <button className="font-medium text-primary hover:text-primary/80">
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiConfigurationCard;
