import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AttacksPage from "@/pages/attacks/AttacksPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import HoneypotPage from "@/pages/honeypot/HoneypotPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="attacks" element={<AttacksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="honeypot" element={<HoneypotPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
