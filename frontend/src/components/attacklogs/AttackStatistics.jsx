import { AlertTriangle, ShieldAlert, ShieldCheck, Activity } from "lucide-react";
import StatCard from "@/components/common/StatCard";

function AttackStatistics({ logs }) {
  const totalAttacks = logs.length;
  const criticalCount = logs.filter((l) => l.severity === "Critical").length;
  const blockedCount = logs.filter((l) => l.status === "Blocked").length;
  const uniqueIPs = new Set(logs.map((l) => l.sourceIp)).size;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Attacks"
        value={totalAttacks}
        status="Last 24 hours"
        variant="info"
        icon={AlertTriangle}
      />
      <StatCard
        title="Critical Alerts"
        value={criticalCount}
        status="Requires attention"
        variant="danger"
        icon={ShieldAlert}
      />
      <StatCard
        title="Blocked Threats"
        value={blockedCount}
        status="Auto-mitigated"
        variant="success"
        icon={ShieldCheck}
      />
      <StatCard
        title="Unique Source IPs"
        value={uniqueIPs}
        status="Distinct attackers"
        variant="warning"
        icon={Activity}
      />
    </div>
  );
}

export default AttackStatistics;
