import { Link } from "react-router-dom";
import { FileWarning, BarChart3, FileText, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "View Attack Logs",
    to: "/attacks",
    icon: FileWarning,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
    hover: "hover:border-destructive/40 hover:bg-destructive/15",
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: BarChart3,
    color: "text-info",
    bg: "bg-info/10 border-info/20",
    hover: "hover:border-info/40 hover:bg-info/15",
  },
  {
    label: "Reports",
    to: "/reports",
    icon: FileText,
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
    hover: "hover:border-warning/40 hover:bg-warning/15",
  },
  {
    label: "Manage Honeypots",
    to: "/honeypot",
    icon: Bug,
    color: "text-success",
    bg: "bg-success/10 border-success/20",
    hover: "hover:border-success/40 hover:bg-success/15",
  },
];

function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {actions.map(({ label, to, icon: Icon, color, bg, hover }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            "group flex items-center gap-3 rounded-xl border p-4 transition-all duration-200",
            bg,
            hover
          )}
        >
          <div className={cn("rounded-lg bg-background/50 p-2", color)}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export default QuickActions;
