import { cn } from "@/lib/utils";

const statusConfig = {
  Running: "bg-success/15 text-success border-success/20",
  Stopped: "bg-destructive/15 text-destructive border-destructive/20",
  Degraded: "bg-warning/15 text-warning border-warning/20",
};

const dotConfig = {
  Running: "bg-success",
  Stopped: "bg-destructive",
  Degraded: "bg-warning",
};

function HoneypotStatusBadge({ status, className }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn("size-2 rounded-full", dotConfig[status] || "bg-muted-foreground")}
        aria-hidden="true"
      />
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
          statusConfig[status] || "bg-muted text-muted-foreground border-border"
        )}
      >
        {status}
      </span>
    </span>
  );
}

export default HoneypotStatusBadge;
