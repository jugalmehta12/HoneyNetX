import { Server } from "lucide-react";
import HoneypotStatusBadge from "./HoneypotStatusBadge";
import HoneypotActions from "./HoneypotActions";
import EmptyState from "@/components/common/EmptyState";

function HoneypotTable({ honeypots, onViewDetails, onAction }) {
  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
                IP Address
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">
                Port
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground xl:table-cell">
                Uptime
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">
                Last Activity
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {honeypots.map((hp) => (
              <tr
                key={hp.id}
                className="transition-colors hover:bg-muted/20"
              >
                <td className="px-5 py-3">
                  <button
                    onClick={() => onViewDetails(hp)}
                    className="flex items-center gap-2 text-left hover:text-primary"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted">
                      <Server className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{hp.name}</p>
                      <p className="text-xs text-muted-foreground">v{hp.version}</p>
                    </div>
                  </button>
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 sm:table-cell">
                  <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {hp.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <HoneypotStatusBadge status={hp.status} />
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 font-mono text-xs text-foreground md:table-cell">
                  {hp.hostIp}
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 font-mono text-xs text-foreground lg:table-cell">
                  {hp.port}
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 text-xs text-muted-foreground xl:table-cell">
                  {hp.uptime}
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 text-xs text-muted-foreground lg:table-cell">
                  {formatTimestamp(hp.lastActivity)}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <HoneypotActions
                    status={hp.status}
                    onAction={(action) => onAction(hp.id, action)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {honeypots.length === 0 && (
        <EmptyState
          icon={Server}
          title="No honeypots found"
          description="Try adjusting your search or filter criteria"
        />
      )}
    </div>
  );
}

export default HoneypotTable;
