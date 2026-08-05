import { cn } from "@/lib/utils";

const services = [
  { name: "Cowrie", status: "Running", online: true },
  { name: "SSH", status: "Running", online: true },
  { name: "Database", status: "Connected", online: true },
  { name: "Backend", status: "Offline", online: false },
];

function SystemStatus() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">System Status</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Service health overview</p>
      </div>
      <div className="divide-y divide-border">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/20"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "size-2 rounded-full",
                  service.online ? "bg-success" : "bg-destructive"
                )}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-foreground">{service.name}</span>
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                service.online ? "text-success" : "text-destructive"
              )}
            >
              {service.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemStatus;
