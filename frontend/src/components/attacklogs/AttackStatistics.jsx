import { AlertTriangle, ShieldAlert, LogIn, Activity } from "lucide-react";
import StatCard from "@/components/common/StatCard";

function AttackStatistics({ logs }) {
  const totalEvents = logs.length;
  const highSeverityCount = logs.filter((log) => ["High", "Critical"].includes(log.severity)).length;
  const loginAttempts = logs.filter((log) => log.attackType === "Failed Login Attempt").length;
  const uniqueSourceIps = new Set(logs.map((log) => log.sourceIp).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Loaded Events" value={totalEvents} status="Current filtered results" variant="info" icon={AlertTriangle} />
      <StatCard title="High / Critical" value={highSeverityCount} status="Among loaded events" variant="danger" icon={ShieldAlert} />
      <StatCard title="Failed Login Events" value={loginAttempts} status="Recorded by honeypot" variant="warning" icon={LogIn} />
      <StatCard title="Unique Source IPs" value={uniqueSourceIps} status="Among loaded events" variant="success" icon={Activity} />
    </div>
  );
}

export default AttackStatistics;
