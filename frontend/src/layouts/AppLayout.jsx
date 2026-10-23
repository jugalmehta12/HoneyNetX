import { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";

function AppLayout({ pageTitle = "HoneyNetX" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Keep route changes from leaving the next page underneath the sticky header.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="lg:pl-64">
        <TopNav pageTitle={pageTitle} onMenuClick={openSidebar} />

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
