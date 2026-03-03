import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, FileText, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalScans: 0, highRisk: 0, avgScore: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("scan_reports").select("scam_score, risk_level").eq("user_id", user.id).then(({ data }) => {
      if (data) {
        const highRisk = data.filter(d => d.risk_level === "High").length;
        const avg = data.length ? Math.round(data.reduce((s, d) => s + d.scam_score, 0) / data.length) : 0;
        setStats({ totalScans: data.length, highRisk, avgScore: avg });
      }
    });
  }, [user]);

  const cards = [
    { icon: FileText, label: t("totalScans"), value: stats.totalScans, color: "text-primary" },
    { icon: Shield, label: t("highRiskFound"), value: stats.highRisk, color: "text-destructive" },
    { icon: TrendingUp, label: t("avgRiskScore"), value: `${stats.avgScore}%`, color: "text-warning" },
    { icon: BarChart3, label: t("safeResults"), value: stats.totalScans - stats.highRisk, color: "text-success" },
  ];

  const quickActions = [
    { emoji: "📧", title: t("analyzeMessage"), desc: t("analyzeMessageDesc"), path: "/dashboard/analyze" },
    { emoji: "🌐", title: t("websiteChecker"), desc: t("websiteCheckerDesc"), path: "/dashboard/website" },
    { emoji: "👤", title: t("recruiterVerification"), desc: t("recruiterVerificationShortDesc"), path: "/dashboard/recruiter" },
    { emoji: "📄", title: t("uploadOfferLetter"), desc: t("offerLetterScannerShortDesc"), path: "/dashboard/offer-letter" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground font-medium">{t("dashboardOverview")}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="cyber-card p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-primary/10 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cyber-card p-6">
        <h3 className="font-display font-bold text-lg mb-2 tracking-tight">{t("quickStart")}</h3>
        <p className="text-sm text-muted-foreground mb-5 font-medium">{t("quickStartDesc")}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickActions.map(({ emoji, title, desc, path }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              className="group bg-secondary/50 rounded-lg p-4 cursor-pointer border border-transparent hover:neon-border hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">
                  <span className="mr-2">{emoji}</span>{title}
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-muted-foreground text-xs mt-1.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
