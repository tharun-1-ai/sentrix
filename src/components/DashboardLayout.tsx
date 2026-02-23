import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, MessageSquareWarning, Globe, UserSearch, FileText, BarChart3,
  ShieldAlert, Users, PieChart, Settings, LogOut, ChevronLeft, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Analyze Message", path: "/dashboard/analyze", icon: MessageSquareWarning },
  { title: "Website Checker", path: "/dashboard/website", icon: Globe },
  { title: "Recruiter Verification", path: "/dashboard/recruiter", icon: UserSearch },
  { title: "Upload Offer Letter", path: "/dashboard/offer-letter", icon: FileText },
  { title: "Risk Reports", path: "/dashboard/reports", icon: BarChart3 },
  { title: "Scam Prevention Hub", path: "/dashboard/prevention", icon: ShieldAlert },
  { title: "Community Reports", path: "/dashboard/community", icon: Users },
  { title: "Analytics", path: "/dashboard/analytics", icon: PieChart },
  { title: "Settings", path: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col border-r transition-all duration-300 bg-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          <Shield className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-semibold text-sm truncate">ScamShield AI</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-sidebar-accent">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {navItems.map(({ title, path, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
            return (
              <RouterNavLink
                key={path} to={path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{title}</span>}
              </RouterNavLink>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={cn("flex-1 transition-all duration-300", collapsed ? "ml-16" : "ml-60")}>
        <div className="p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
