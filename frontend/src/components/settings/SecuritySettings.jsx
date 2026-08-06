import { Lock, Key, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function SecuritySettings({ settings, onChange }) {
  const Toggle = ({ checked, onChange }) => (
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">Security</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Auto Logout</p>
                <p className="text-xs text-muted-foreground">
                  Automatically logout after inactivity
                </p>
              </div>
            </div>
            <Toggle
              checked={settings.autoLogout}
              onChange={() =>
                onChange({ ...settings, autoLogout: !settings.autoLogout })
              }
            />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">
                  Extra security for your account
                </p>
              </div>
            </div>
            <Toggle
              checked={settings.twoFactorEnabled}
              onChange={() =>
                onChange({
                  ...settings,
                  twoFactorEnabled: !settings.twoFactorEnabled,
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Clock className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Session Timeout</p>
                <p className="text-sm font-medium text-foreground">
                  {settings.sessionTimeout} minutes
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Key className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Password Changed</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(settings.passwordLastChanged)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
          Change Password
        </button>
      </div>
    </div>
  );
}

export default SecuritySettings;
