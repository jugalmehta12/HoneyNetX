import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const periodLabels = {
  hourly: "Last Hour",
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
};

function RecentTrendCard({ data }) {
  const periods = Object.entries(data);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Trends</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Attack volume comparison
        </p>
      </div>
      <div className="space-y-4">
        {periods.map(([key, period]) => {
          const isPositive = period.change >= 0;
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {periodLabels[key]}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {period.current.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {isPositive ? (
                  <TrendingUp className={cn("size-3.5", "text-destructive")} />
                ) : (
                  <TrendingDown className="size-3.5 text-success" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositive ? "text-destructive" : "text-success"
                  )}
                >
                  {isPositive ? "+" : ""}{period.change}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentTrendCard;
