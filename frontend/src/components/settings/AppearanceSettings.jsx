import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
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
    </label>
  );
}

function AppearanceSettings({ settings, onChange }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Customize the look and feel of the application
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onChange({ ...settings, theme: theme.id })}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                  settings.theme === theme.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                )}
              >
                <theme.icon className="size-5" />
                <span className="text-xs font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Toggle
            label="Compact Mode"
            checked={settings.compactMode}
            onChange={(val) => onChange({ ...settings, compactMode: val })}
          />
          <Toggle
            label="Sidebar Collapsed"
            checked={settings.sidebarCollapsed}
            onChange={(val) => onChange({ ...settings, sidebarCollapsed: val })}
          />
        </div>
      </div>
    </div>
  );
}

export default AppearanceSettings;
