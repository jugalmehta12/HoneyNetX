import { cn } from "@/lib/utils";

const statusConfig = {
  New: "bg-destructive/15 text-destructive border-destructive/20",
  Investigating: "bg-warning/15 text-warning border-warning/20",
  Blocked: "bg-info/15 text-info border-info/20",
  Resolved: "bg-success/15 text-success border-success/20",
};

function AttackStatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusConfig[status] || "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {status}
    </span>
  );
}

export default AttackStatusBadge;
