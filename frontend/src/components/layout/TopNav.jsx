import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, Search, Moon, ChevronRight, LogOut } from "lucide-react";
import api from "@/services/api";

const routeLabels = {
  "/dashboard": "Dashboard",
  "/attacks": "Attack Logs",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/honeypot": "Honeypot",
  "/settings": "Settings",
};

function TopNav({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentLabel = routeLabels[location.pathname] || "Page";

  const handleLogout = async () => {
    try {
      await api.post("/v1/auth/logout");
    } catch {
      // Logout is local token removal; the backend has no server-side token store.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <button onClick={onMenuClick} className="rounded-md p-1.5 text-foreground hover:bg-muted lg:hidden" aria-label="Open sidebar">
        <Menu className="size-5" />
      </button>

      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <span className="text-muted-foreground">HoneyNetX</span>
        <ChevronRight className="size-3.5 text-muted-foreground/50" aria-hidden="true" />
        <span className="font-medium text-foreground">{currentLabel}</span>
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 sm:flex">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <input type="text" placeholder="Search..." className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" aria-label="Search" />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">⌘K</kbd>
        </div>

        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notifications">
          <Bell className="size-4.5" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Toggle theme">
          <Moon className="size-4.5" aria-hidden="true" />
        </button>

        <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted" aria-label="Sign out">
          <LogOut className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}

export default TopNav;
