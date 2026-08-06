import { X, ExternalLink, Copy, ShieldAlert, Globe, Server, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import AttackSeverityBadge from "./AttackSeverityBadge";
import AttackStatusBadge from "./AttackStatusBadge";

function DetailRow({ label, value, mono = false, className }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm text-foreground",
          mono && "font-mono"
        )}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden="true" />}
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function AttackDetailsDrawer({ attack, onClose }) {
  if (!attack) return null;

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-in-out sm:max-w-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10">
              <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Attack Details</h2>
              <p className="text-xs text-muted-foreground">Incident #{attack.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close drawer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <AttackSeverityBadge severity={attack.severity} />
              <AttackStatusBadge status={attack.status} />
              {attack.ioc && (
                <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  <AlertTriangle className="size-3" aria-hidden="true" />
                  IOC
                </span>
              )}
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{attack.attackType}</p>
                  <p className="text-xs text-muted-foreground">
                    {attack.protocol} • Port {attack.port}
                  </p>
                </div>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Copy className="size-4" />
                </button>
              </div>
            </div>

            <Section title="Source Information" icon={Globe}>
              <DetailRow label="Source IP" value={attack.sourceIp} mono />
              <DetailRow label="Country" value={attack.country} />
              <DetailRow label="Geolocation" value={attack.geolocation} />
              <DetailRow label="ASN" value={attack.asn} mono />
            </Section>

            <Section title="Attack Details" icon={Server}>
              <DetailRow label="Protocol" value={attack.protocol} />
              <DetailRow label="Port" value={attack.port} />
              <DetailRow label="Username" value={attack.username} mono />
              <DetailRow label="User Agent" value={attack.userAgent} />
            </Section>

            <Section title="Timing & Volume" icon={Clock}>
              <DetailRow label="Timestamp" value={formatTimestamp(attack.timestamp)} />
              <DetailRow label="Duration" value={attack.duration} />
              <DetailRow label="Attempts" value={attack.attempts.toLocaleString()} />
              <DetailRow label="Attack ID" value={`#${attack.id}`} mono />
            </Section>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4">
          <div className="flex gap-3">
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <ExternalLink className="size-4" aria-hidden="true" />
              View in Threat Intel
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
              <ShieldAlert className="size-4" aria-hidden="true" />
              Block IP
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AttackDetailsDrawer;
