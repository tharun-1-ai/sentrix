import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, FileText, Shield, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboardOverview")}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-2">{t("quickStart")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("quickStartDesc")}</p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-muted rounded-md p-3">
            <p className="font-medium">📧 {t("analyzeMessage")}</p>
            <p className="text-muted-foreground text-xs mt-1">{t("analyzeMessageDesc")}</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="font-medium">🌐 {t("websiteChecker")}</p>
            <p className="text-muted-foreground text-xs mt-1">{t("websiteCheckerDesc")}</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="font-medium">👤 {t("recruiterVerification")}</p>
            <p className="text-muted-foreground text-xs mt-1">{t("recruiterVerificationShortDesc")}</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="font-medium">📄 {t("uploadOfferLetter")}</p>
            <p className="text-muted-foreground text-xs mt-1">{t("offerLetterScannerShortDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
