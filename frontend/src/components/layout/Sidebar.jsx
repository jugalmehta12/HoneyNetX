import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileWarning,
  BarChart3,
  FileText,
  Bug,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attacks", label: "Attack Logs", icon: FileWarning },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/honeypot", label: "Honeypot", icon: Bug },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 text-sidebar-foreground"
            onClick={onClose}
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="size-5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight">HoneyNetX</span>
          </NavLink>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-3 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Navigation
            </p>
          </div>
          <ul className="space-y-1" role="list">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )
                  }
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border">
          <div className="px-3 py-3">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )
              }
            >
              <Settings className="size-4 shrink-0" aria-hidden="true" />
              Settings
            </NavLink>
          </div>
          <div className="border-t border-sidebar-border px-4 py-3">
            <p className="text-[10px] text-sidebar-foreground/40">v0.1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
