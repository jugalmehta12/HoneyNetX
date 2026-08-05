import { Server, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SystemStatus from "@/components/dashboard/SystemStatus";

function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Honeypots"
          value="05"
          status="Running"
          variant="success"
          icon={Server}
        />
        <StatCard
          title="Total Attacks"
          value="1247"
          status="Today"
          variant="info"
          icon={AlertTriangle}
        />
        <StatCard
          title="Critical Alerts"
          value="18"
          status="Requires attention"
          variant="danger"
          icon={ShieldAlert}
        />
        <StatCard
          title="System Health"
          value="Healthy"
          status="All systems operational"
          variant="success"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentAlerts />
        </div>
        <div className="space-y-6">
          <RecentActivity />
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
