import { Mail, ShieldAlert, FileText, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const notificationOptions = [
  {
    id: "emailAlerts",
    label: "Email Alerts",
    description: "Receive email notifications for security events",
    icon: Mail,
  },
  {
    id: "criticalAlerts",
    label: "Critical Alerts",
    description: "Immediate notifications for critical security threats",
    icon: ShieldAlert,
  },
  {
    id: "weeklyReports",
    label: "Weekly Reports",
    description: "Automated weekly security summary reports",
    icon: FileText,
  },
  {
    id: "attackSummaries",
    label: "Attack Summaries",
    description: "Daily summaries of detected attack attempts",
    icon: Activity,
  },
  {
    id: "systemUpdates",
    label: "System Updates",
    description: "Notifications about system updates and maintenance",
    icon: Settings,
  },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function NotificationSettings({ settings, onChange }) {
  const handleToggle = (id) => {
    onChange({
      ...settings,
      [id]: !settings[id],
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Configure how you receive alerts and updates
        </p>
      </div>

      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-muted p-2">
                <option.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
            <Toggle
              checked={settings[option.id]}
              onChange={() => handleToggle(option.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationSettings;
