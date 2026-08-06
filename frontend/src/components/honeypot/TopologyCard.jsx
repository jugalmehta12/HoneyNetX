import { Globe, Server, Database, LayoutDashboard, ArrowDown } from "lucide-react";

const topologyNodes = [
  {
    id: "internet",
    label: "Internet",
    sublabel: "External Traffic",
    icon: Globe,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
  },
  {
    id: "cowrie",
    label: "Cowrie",
    sublabel: "SSH/Telnet Honeypot",
    icon: Server,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
  {
    id: "backend",
    label: "Node Backend",
    sublabel: "API & Processing",
    icon: Server,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
  },
  {
    id: "mongodb",
    label: "MongoDB",
    sublabel: "Data Storage",
    icon: Database,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
  },
  {
    id: "dashboard",
    label: "HoneyNetX Dashboard",
    sublabel: "Analytics & Monitoring",
    icon: LayoutDashboard,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
];

function TopologyCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground">System Topology</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Architecture flow of the honeypot infrastructure
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        {topologyNodes.map((node, index) => (
          <div key={node.id} className="flex flex-col items-center">
            <div
              className={`flex items-center gap-3 rounded-lg border ${node.borderColor} ${node.bgColor} px-4 py-3 transition-all hover:scale-[1.02]`}
            >
              <div className={`rounded-md bg-background p-2 ${node.color}`}>
                <node.icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{node.label}</p>
                <p className="text-xs text-muted-foreground">{node.sublabel}</p>
              </div>
            </div>
            {index < topologyNodes.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <ArrowDown className="size-4 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground text-center">
          All honeypot traffic flows through the Node backend for processing and storage
          before appearing in the dashboard.
        </p>
      </div>
    </div>
  );
}

export default TopologyCard;
