import { useState } from "react";
import { Eye, MoreHorizontal, Ban, ExternalLink, Flag } from "lucide-react";
import AttackSeverityBadge from "./AttackSeverityBadge";
import AttackStatusBadge from "./AttackStatusBadge";
import EmptyState from "@/components/common/EmptyState";

function AttackTable({ logs, onViewDetails }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                Timestamp
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                Source IP
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                Country
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
                Protocol
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                Attack Type
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">
                Username
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                Severity
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="transition-colors hover:bg-muted/20"
              >
                <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-foreground">
                  {log.sourceIp}
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 text-foreground sm:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-xs">{getCountryFlag(log.country)}</span>
                    <span className="text-xs">{log.country}</span>
                  </span>
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 md:table-cell">
                  <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {log.protocol}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-foreground">
                  {log.attackType}
                </td>
                <td className="hidden whitespace-nowrap px-5 py-3 font-mono text-xs text-foreground lg:table-cell">
                  {log.username}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <AttackSeverityBadge severity={log.severity} />
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <AttackStatusBadge status={log.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => toggleMenu(log.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {openMenuId === log.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={closeMenu}
                          aria-hidden="true"
                        />
                        <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-border bg-popover py-1 shadow-lg">
                          <button
                            onClick={() => {
                              onViewDetails(log);
                              closeMenu();
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                            View Details
                          </button>
                          <button
                            onClick={closeMenu}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <ExternalLink className="size-4" aria-hidden="true" />
                            Threat Intel
                          </button>
                          <button
                            onClick={closeMenu}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <Flag className="size-4" aria-hidden="true" />
                            Flag IP
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={closeMenu}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                          >
                            <Ban className="size-4" aria-hidden="true" />
                            Block IP
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <EmptyState
          icon={Flag}
          title="No attacks found"
          description="Try adjusting your search or filter criteria"
        />
      )}
    </div>
  );
}

function getCountryFlag(country) {
  const flags = {
    Russia: "RU",
    "United States": "US",
    China: "CN",
    India: "IN",
    Netherlands: "NL",
    Germany: "DE",
    France: "FR",
    "South Korea": "KR",
    Brazil: "BR",
    Ukraine: "UA",
    Poland: "PL",
    Romania: "RO",
    Canada: "CA",
    Nigeria: "NG",
    Singapore: "SG",
    "Czech Republic": "CZ",
  };
  return flags[country] || "??";
}

export default AttackTable;
