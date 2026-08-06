import { cn } from "@/lib/utils";

const severityColors = {
  Critical: "bg-destructive",
  High: "bg-warning",
  Medium: "bg-info",
  Low: "bg-muted-foreground",
};

const severityTextColors = {
  Critical: "text-destructive",
  High: "text-warning",
  Medium: "text-info",
  Low: "text-muted-foreground",
};

function TopAttackTypes({ data }) {
  const maxCount = Math.max(...data.map((item) => item.count));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Top Attack Types</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Most frequent attack vectors
        </p>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.type} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="text-sm font-medium text-foreground">{item.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium", severityTextColors[item.severity])}>
                  {item.severity}
                </span>
                <span className="text-sm font-semibold text-foreground">{item.count}</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", severityColors[item.severity])}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopAttackTypes;
