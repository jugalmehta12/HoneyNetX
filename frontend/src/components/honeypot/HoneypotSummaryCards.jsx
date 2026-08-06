import { Server, Activity, AlertTriangle, Users } from "lucide-react";
import StatCard from "@/components/common/StatCard";

function HoneypotSummaryCards({ honeypots }) {
  const activeHoneypots = honeypots.filter(
    (hp) => hp.status === "Running"
  ).length;
  const runningServices = honeypots.reduce(
    (sum, hp) => sum + hp.services.length,
    0
  );
  const offlineInstances = honeypots.filter(
    (hp) => hp.status === "Stopped"
  ).length;
  const capturedSessions = honeypots.reduce(
    (sum, hp) => sum + hp.totalSessions,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Honeypots"
        value={activeHoneypots}
        status={`${honeypots.length} total instances`}
        variant="success"
        icon={Server}
      />
      <StatCard
        title="Running Services"
        value={runningServices}
        status="Across all instances"
        variant="info"
        icon={Activity}
      />
      <StatCard
        title="Offline Instances"
        value={offlineInstances}
        status={offlineInstances > 0 ? "Requires attention" : "All online"}
        variant={offlineInstances > 0 ? "danger" : "success"}
        icon={AlertTriangle}
      />
      <StatCard
        title="Captured Sessions"
        value={capturedSessions.toLocaleString()}
        status="Total interactions"
        variant="warning"
        icon={Users}
      />
    </div>
  );
}

export default HoneypotSummaryCards;
