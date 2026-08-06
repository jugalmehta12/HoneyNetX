import { AlertTriangle, ShieldAlert, ShieldCheck, Users, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ title, value, trend, trendLabel, variant = "info", icon: Icon }) {
  const isPositive = trend >= 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <div className="flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className={cn("size-3.5", variant === "danger" || variant === "warning" ? "text-destructive" : "text-success")} />
            ) : (
              <TrendingDown className="size-3.5 text-success" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isPositive
                  ? variant === "danger" || variant === "warning"
                    ? "text-destructive"
                    : "text-success"
                  : "text-success"
              )}
            >
              {isPositive ? "+" : ""}{trend}%
            </span>
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              "rounded-lg border p-2.5 transition-colors",
              variant === "success" && "border-success/20 bg-success/10 text-success",
              variant === "danger" && "border-destructive/20 bg-destructive/10 text-destructive",
              variant === "warning" && "border-warning/20 bg-warning/10 text-warning",
              variant === "info" && "border-info/20 bg-info/10 text-info"
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

function AnalyticsSummaryCards({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Attacks"
        value={stats.totalAttacks}
        trend={stats.totalAttacksTrend}
        trendLabel="vs last period"
        variant="info"
        icon={AlertTriangle}
      />
      <StatCard
        title="Critical Alerts"
        value={stats.criticalAlerts}
        trend={stats.criticalAlertsTrend}
        trendLabel="vs last period"
        variant="danger"
        icon={ShieldAlert}
      />
      <StatCard
        title="Blocked Threats"
        value={stats.blockedThreats}
        trend={stats.blockedThreatsTrend}
        trendLabel="vs last period"
        variant="success"
        icon={ShieldCheck}
      />
      <StatCard
        title="Unique Attackers"
        value={stats.uniqueAttackers}
        trend={stats.uniqueAttackersTrend}
        trendLabel="vs last period"
        variant="warning"
        icon={Users}
      />
    </div>
  );
}

export default AnalyticsSummaryCards;
