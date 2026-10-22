import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AttacksPage from "@/pages/attacks/AttacksPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import HoneypotPage from "@/pages/honeypot/HoneypotPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";

function RequireAuth() {
  return localStorage.getItem("token")
    ? <Outlet />
    : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
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
      </Route>
    </Routes>
  );
}

export default App;
