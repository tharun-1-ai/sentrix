import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Clock, Shield, Trash2 } from "lucide-react";
import { RiskBadge } from "@/components/AnalysisResult";
import { useLanguage } from "@/i18n/LanguageContext";

interface Report {
  id: string;
  scan_type: string;
  input_summary: string;
  scam_score: number;
  risk_level: string;
  created_at: string;
}

export default function RiskReports() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReports = () => {
    if (!user) return;
    supabase.from("scan_reports").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setReports((data as Report[]) || []); setLoading(false); });
  };

  useEffect(() => { fetchReports(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("scan_reports").delete().eq("id", id);
    if (error) {
      toast({ title: t("error"), description: t("deleteError"), variant: "destructive" });
    } else {
      setReports(prev => prev.filter(r => r.id !== id));
      toast({ title: t("reportDeleted") });
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> {t("riskReportsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("riskReportsDesc")}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loadingReports")}</p>
      ) : reports.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">{t("noReportsYet")}</p>
          <p className="text-sm text-muted-foreground">{t("noReportsDesc")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-card rounded-lg border p-4 flex items-center gap-4">
              <div className="text-2xl font-bold w-16 text-center" style={{
                color: r.scam_score < 30 ? "hsl(var(--success))" : r.scam_score < 70 ? "hsl(var(--warning))" : "hsl(var(--destructive))"
              }}>
                {r.scam_score}%
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium capitalize">{r.scan_type.replace("_", " ")}</span>
                  <RiskBadge level={r.risk_level} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{r.input_summary}</p>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {new Date(r.created_at).toLocaleDateString()}
              </div>
              <button onClick={() => setDeleteId(r.id)}
                className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg space-y-4">
            <p className="font-medium text-sm">{t("confirmDelete")}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors">
                {t("cancel")}
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-md text-sm bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
