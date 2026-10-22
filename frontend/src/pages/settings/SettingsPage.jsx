import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw, ShieldCheck, UserRound, Info } from "lucide-react";
import api from "@/services/api";

function readCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "Not provided by the API";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not provided by the API" : date.toLocaleDateString();
}

function SettingsPage() {
  const [user] = useState(readCurrentUser);
  const [health, setHealth] = useState({ state: "checking", message: "Checking API…" });
  const [checkedAt, setCheckedAt] = useState(null);

  const checkHealth = useCallback(async (showSpinner = false) => {
    if (showSpinner) setHealth((current) => ({ ...current, state: "checking", message: "Checking API…" }));
    try {
      const response = await api.get("/v1/health");
      if (response.data?.success) {
        setHealth({ state: "online", message: response.data.message || "API responded successfully" });
      } else {
        setHealth({ state: "unknown", message: "The API responded without a success status" });
      }
    } catch (error) {
      setHealth({
        state: "offline",
        message: error.response?.data?.message || "API health check failed. Verify the local port-forwarding session.",
      });
    } finally {
      setCheckedAt(new Date().toISOString());
    }
  }, []);

  useEffect(() => { checkHealth(); }, [checkHealth]);

  const displayName = user?.name || "Name not available";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "HN";
  const role = user?.role ? String(user.role).toLowerCase() : "Role not available";

  const healthClass = health.state === "online"
    ? "border-success/20 bg-success/10 text-success"
    : health.state === "offline"
      ? "border-destructive/20 bg-destructive/10 text-destructive"
      : "border-border bg-muted text-muted-foreground";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Account details and verified API connectivity. Unsupported settings are not represented as if they were saved.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <UserRound className="size-5 text-primary" aria-hidden="true" />
          <div><h3 className="text-sm font-semibold">Signed-in account</h3><p className="mt-1 text-xs text-muted-foreground">From the user information returned during authentication.</p></div>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">{initials}</div>
          <dl className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["Name", displayName],
              ["Email", user?.email || "Email not available"],
              ["Role", role],
              ["User ID", user?._id || user?.id || "Not provided by the API"],
              ["Account status", user?.isActive === false ? "Inactive" : user?.isActive === true ? "Active" : "Not provided by the API"],
              ["Member since", formatDate(user?.createdAt)],
            ].map(([label, value]) => <div key={label} className="rounded-lg border border-border p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Activity className="size-5 text-primary" aria-hidden="true" /><div><h3 className="text-sm font-semibold">API connectivity</h3><p className="mt-1 text-xs text-muted-foreground">Checks the public health endpoint through the configured frontend proxy.</p></div></div>
          <button onClick={() => checkHealth(true)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"><RefreshCw className={`size-4 ${health.state === "checking" ? "animate-spin" : ""}`} aria-hidden="true" />Check</button>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs text-muted-foreground">API route</p><p className="mt-1 font-mono text-sm">/api/v1/health</p><p className="mt-2 text-sm text-muted-foreground">{health.message}</p></div>
          <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-medium ${healthClass}`}>{health.state === "online" ? "Reachable" : health.state === "offline" ? "Unavailable" : health.state === "checking" ? "Checking…" : "Unknown"}</span>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Last check: {checkedAt ? new Date(checkedAt).toLocaleString() : "Not checked yet"}</p>
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">This endpoint confirms an API response. It does not independently verify database readiness, Cowrie container health, or every background service.</div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3"><ShieldCheck className="size-5 text-primary" aria-hidden="true" /><div><h3 className="text-sm font-semibold">Access and security</h3><p className="mt-1 text-xs text-muted-foreground">Access is enforced by the backend API, not by frontend controls alone.</p></div></div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Current role: <span className="font-medium text-foreground">{role}</span>.</p>
          <p>Public registrations receive viewer access. Administrative roles must be assigned by an authorized administrator.</p>
          <p>Password changes, two-factor authentication, session-timeout preferences, and notification delivery settings are not exposed by the current API, so they are not shown as configurable controls here.</p>
        </div>
      </section>

      <section className="rounded-xl border border-info/20 bg-info/5 p-4">
        <div className="flex items-start gap-3"><Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" /><div><p className="text-sm font-medium">About HoneyNetX</p><p className="mt-1 text-sm text-muted-foreground">Intelligent honeypot-based attack detection and threat analysis. The backend URL is configured by the frontend environment and Vite proxy; no API keys or secrets are displayed in this page.</p></div></div>
      </section>
    </div>
  );
}

export default SettingsPage;
