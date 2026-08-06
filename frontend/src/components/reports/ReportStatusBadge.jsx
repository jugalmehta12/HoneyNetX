import { cn } from "@/lib/utils";

const statusConfig = {
  Completed: "bg-success/15 text-success border-success/20",
  Processing: "bg-info/15 text-info border-info/20",
  Failed: "bg-destructive/15 text-destructive border-destructive/20",
  Archived: "bg-muted text-muted-foreground border-border",
};

function ReportStatusBadge({ status, className }) {
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

export default ReportStatusBadge;
