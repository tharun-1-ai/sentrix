import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PieChart, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Analytics() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<{
    byType: Record<string, number>;
    byRisk: Record<string, number>;
    avgManipulation: { urgency: number; fear: number; greed: number; authority: number };
    totalScans: number;
  }>({ byType: {}, byRisk: {}, avgManipulation: { urgency: 0, fear: 0, greed: 0, authority: 0 }, totalScans: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("scan_reports").select("*").eq("user_id", user.id).then(({ data: reports }) => {
      if (!reports || reports.length === 0) return;
      const byType: Record<string, number> = {};
      const byRisk: Record<string, number> = {};
      let urgency = 0, fear = 0, greed = 0, authority = 0;

      reports.forEach((r: any) => {
        byType[r.scan_type] = (byType[r.scan_type] || 0) + 1;
        byRisk[r.risk_level] = (byRisk[r.risk_level] || 0) + 1;
        const m = r.analysis?.manipulationIndicators;
        if (m) { urgency += m.urgencyLevel || 0; fear += m.fearLevel || 0; greed += m.greedTrigger || 0; authority += m.authorityImpersonation || 0; }
      });

      const n = reports.length;
      setData({
        byType, byRisk, totalScans: n,
        avgManipulation: { urgency: Math.round(urgency / n), fear: Math.round(fear / n), greed: Math.round(greed / n), authority: Math.round(authority / n) },
      });
    });
  }, [user]);

  const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground capitalize font-medium">{label.replace("_", " ")}</span>
        <span className="font-display font-bold">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
      </div>
    </div>
  );

  const maxType = Math.max(...Object.values(data.byType), 1);
  const maxRisk = Math.max(...Object.values(data.byRisk), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <PieChart className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("analyticsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("analyticsDesc")}</p>
      </div>

      {data.totalScans === 0 ? (
        <div className="cyber-card p-8 text-center">
          <BarChart3 className="h-10 w-10 text-primary mx-auto mb-3" style={{ filter: "drop-shadow(0 0 12px hsl(185 100% 50% / 0.3))" }} />
          <p className="font-display font-bold">{t("noDataYet")}</p>
          <p className="text-sm text-muted-foreground font-medium">{t("runScansToSee")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="cyber-card p-5">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> {t("scansByType")}
            </h3>
            <div className="space-y-3">
              {Object.entries(data.byType).map(([k, v]) => (
                <Bar key={k} label={k} value={v} max={maxType} color="bg-primary" />
              ))}
            </div>
          </div>

          <div className="cyber-card p-5">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> {t("riskLevelDistribution")}
            </h3>
            <div className="space-y-3">
              {[{ key: "Low", label: t("low") }, { key: "Medium", label: t("medium") }, { key: "High", label: t("high") }].map(({ key, label }) => (
                <Bar key={key} label={label} value={data.byRisk[key] || 0} max={maxRisk}
                  color={key === "Low" ? "bg-success" : key === "Medium" ? "bg-warning" : "bg-destructive"} />
              ))}
            </div>
          </div>

          <div className="cyber-card p-5 md:col-span-2">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> {t("avgManipulationIndicators")}
            </h3>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { label: t("urgency"), value: data.avgManipulation.urgency },
                { label: t("fear"), value: data.avgManipulation.fear },
                { label: t("greedTrigger"), value: data.avgManipulation.greed },
                { label: t("authorityImpersonation"), value: data.avgManipulation.authority },
              ].map(({ label, value }) => (
                <div key={label} className="text-center cyber-card p-4">
                  <div className="text-2xl font-display font-bold" style={{
                    color: value < 30 ? "hsl(var(--success))" : value < 70 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                    filter: `drop-shadow(0 0 6px ${value < 30 ? "hsl(156 100% 49% / 0.3)" : value < 70 ? "hsl(38 92% 50% / 0.3)" : "hsl(0 80% 60% / 0.3)"})`
                  }}>{value}%</div>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
