import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

function getScoreColor(score) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

function ThreatScoreCard({ data }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (data.overall / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Threat Score</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Overall security posture rating
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className={cn("stroke-current", getScoreColor(data.overall))}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", getScoreColor(data.overall))}>
              {data.overall}
            </span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-success" />
            <span className="text-xs text-muted-foreground">
              +{data.trend}% from last week
            </span>
          </div>
          <div className="space-y-2">
            {data.factors.map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{factor.name}</span>
                  <span className="font-medium text-foreground">{factor.score}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", getScoreColor(factor.score))}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreatScoreCard;
