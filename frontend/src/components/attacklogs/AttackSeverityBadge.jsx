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

function AttackSeverityBadge({ severity, showDot = true, className }) {
  const config = severityConfig[severity] || severityConfig.Low;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {showDot && (
        <span
          className={cn("size-1.5 rounded-full", config.dot)}
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
          config.badge
        )}
      >
        {severity}
      </span>
    </span>
  );
}

export default AttackSeverityBadge;
