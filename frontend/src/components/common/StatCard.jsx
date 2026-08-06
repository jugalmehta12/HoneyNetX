import { cn } from "@/lib/utils";

const badgeVariants = {
  success: "bg-success/15 text-success border-success/20",
  danger: "bg-destructive/15 text-destructive border-destructive/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  info: "bg-info/15 text-info border-info/20",
};

const iconVariants = {
  success: "border-success/20 bg-success/10 text-success",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
  warning: "border-warning/20 bg-warning/10 text-warning",
  info: "border-info/20 bg-info/10 text-info",
};

function StatCard({ title, value, status, variant = "info", icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {status && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                badgeVariants[variant]
              )}
            >
              {status}
            </span>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg border p-2.5 transition-colors", iconVariants[variant])}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

export default StatCard;
