import { FileText, Clock, CalendarCheck, CheckCircle } from "lucide-react";
import StatCard from "@/components/common/StatCard";

function ReportsSummaryCards({ reports }) {
  const totalReports = reports.length;
  const scheduledReports = reports.filter(
    (r) => r.generatedBy === "System (Auto)"
  ).length;
  const generatedToday = reports.filter((r) => {
    const reportDate = new Date(r.generatedDate);
    const today = new Date();
    return reportDate.toDateString() === today.toDateString();
  }).length;
  const completedReports = reports.filter((r) => r.status === "Completed").length;
  const successRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Reports"
        value={totalReports}
        status="All time"
        variant="info"
        icon={FileText}
      />
      <StatCard
        title="Scheduled Reports"
        value={scheduledReports}
        status="Auto-generated"
        variant="info"
        icon={Clock}
      />
      <StatCard
        title="Generated Today"
        value={generatedToday}
        status="Last 24 hours"
        variant="success"
        icon={CalendarCheck}
      />
      <StatCard
        title="Export Success Rate"
        value={`${successRate}%`}
        status={`${completedReports} of ${totalReports} completed`}
        variant={successRate >= 90 ? "success" : "warning"}
        icon={CheckCircle}
      />
    </div>
  );
}

export default ReportsSummaryCards;
