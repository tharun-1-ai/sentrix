import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  LayoutDashboard, MessageSquareWarning, Globe, UserSearch, FileText, BarChart3,
  ShieldAlert, Users, PieChart, Settings, LogOut, ChevronLeft, Shield, Moon, Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { TranslationKey } from "@/i18n/translations";

const navItems: { titleKey: TranslationKey; path: string; icon: any }[] = [
  { titleKey: "dashboard", path: "/dashboard", icon: LayoutDashboard },
  { titleKey: "analyzeMessage", path: "/dashboard/analyze", icon: MessageSquareWarning },
  { titleKey: "websiteChecker", path: "/dashboard/website", icon: Globe },
  { titleKey: "recruiterVerification", path: "/dashboard/recruiter", icon: UserSearch },
  { titleKey: "uploadOfferLetter", path: "/dashboard/offer-letter", icon: FileText },
  { titleKey: "riskReports", path: "/dashboard/reports", icon: BarChart3 },
  { titleKey: "scamPreventionHub", path: "/dashboard/prevention", icon: ShieldAlert },
  { titleKey: "communityReports", path: "/dashboard/community", icon: Users },
  { titleKey: "analytics", path: "/dashboard/analytics", icon: PieChart },
  { titleKey: "settings", path: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col border-r transition-all duration-300 bg-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-60"
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          <Shield className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-semibold text-sm truncate">{t("brand")}</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-sidebar-accent">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {!collapsed && (
          <div className="px-3 pt-3">
            <LanguageSwitcher />
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {navItems.map(({ titleKey, path, icon: Icon }) => {
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
                {!collapsed && <span className="truncate">{t(titleKey)}</span>}
              </RouterNavLink>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>{dark ? t("lightMode") || "Light Mode" : t("darkMode") || "Dark Mode"}</span>}
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t("logout")}</span>}
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
