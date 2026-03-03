import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Users, ThumbsUp, Plus, Globe, Phone, Trash2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface CommunityReport {
  id: string;
  report_type: string;
  value: string;
  description: string | null;
  upvotes: number;
  created_at: string;
  user_id: string;
}

export default function CommunityReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState("website");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReports = async () => {
    const { data } = await supabase.from("community_reports").select("*").order("upvotes", { ascending: false }).limit(50);
    setReports((data as CommunityReport[]) || []);
    if (user) {
      const { data: upvotes } = await supabase.from("report_upvotes").select("report_id").eq("user_id", user.id);
      setUserUpvotes(new Set((upvotes || []).map(u => u.report_id)));
    }
  };

  useEffect(() => { fetchReports(); }, [user]);

  const handleSubmit = async () => {
    if (!value.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase.from("community_reports").insert({
      user_id: user.id, report_type: reportType, value: value.trim(), description: description.trim() || null,
    });
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("reportSubmitted"), description: t("thanksCommunity") });
      setValue(""); setDescription(""); setShowForm(false);
      fetchReports();
    }
    setLoading(false);
  };

  const handleUpvote = async (reportId: string) => {
    if (!user) return;
    if (userUpvotes.has(reportId)) {
      await supabase.from("report_upvotes").delete().eq("user_id", user.id).eq("report_id", reportId);
      await supabase.from("community_reports").update({ upvotes: reports.find(r => r.id === reportId)!.upvotes - 1 }).eq("id", reportId);
    } else {
      await supabase.from("report_upvotes").insert({ user_id: user.id, report_id: reportId });
      await supabase.from("community_reports").update({ upvotes: reports.find(r => r.id === reportId)!.upvotes + 1 }).eq("id", reportId);
    }
    fetchReports();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("community_reports").delete().eq("id", id);
    if (error) {
      toast({ title: t("error"), description: t("deleteError"), variant: "destructive" });
    } else {
      setReports(prev => prev.filter(r => r.id !== id));
      toast({ title: t("reportDeleted") });
    }
    setDeleteId(null);
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
            <Users className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("communityReportsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">{t("communityReportsDesc")}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_15px_hsl(185_100%_50%/0.3)] transition-all">
          <Plus className="h-4 w-4" /> {t("reportScamBtn")}
        </button>
      </div>

      {showForm && (
        <div className="cyber-card p-5 space-y-4 animate-fade-in">
          <div className="flex gap-3">
            <button onClick={() => setReportType("website")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${reportType === "website" ? "bg-primary text-primary-foreground" : "bg-secondary/50 border border-border hover:neon-border"}`}>
              <Globe className="h-3 w-3" /> {t("website")}
            </button>
            <button onClick={() => setReportType("phone")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${reportType === "phone" ? "bg-primary text-primary-foreground" : "bg-secondary/50 border border-border hover:neon-border"}`}>
              <Phone className="h-3 w-3" /> {t("phoneNumber")}
            </button>
          </div>
          <input value={value} onChange={e => setValue(e.target.value)}
            placeholder={reportType === "website" ? "https://suspicious-site.com" : "+1 234 567 8900"}
            className={inputClass} />
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder={t("describeScam")}
            className={`${inputClass} h-20 resize-none`} />
          <button onClick={handleSubmit} disabled={loading || !value.trim()}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_15px_hsl(185_100%_50%/0.3)] disabled:opacity-50 transition-all">
            {loading ? t("submitting") : t("submitReport")}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="cyber-card p-8 text-center">
            <Users className="h-10 w-10 text-primary mx-auto mb-3" style={{ filter: "drop-shadow(0 0 12px hsl(185 100% 50% / 0.3))" }} />
            <p className="font-display font-bold">{t("noReportsYetCommunity")}</p>
            <p className="text-sm text-muted-foreground font-medium">{t("beFirst")}</p>
          </div>
        ) : (
          reports.map(r => (
            <div key={r.id} className="cyber-card p-4 flex items-start gap-4">
              <button onClick={() => handleUpvote(r.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all ${userUpvotes.has(r.id) ? "bg-primary/10 text-primary neon-border border" : "hover:bg-muted text-muted-foreground border border-transparent"}`}>
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs font-display font-bold">{r.upvotes}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {r.report_type === "website" ? <Globe className="h-3 w-3 text-primary" /> : <Phone className="h-3 w-3 text-warning" />}
                  <span className="text-sm font-mono font-bold truncate">{r.value}</span>
                </div>
                {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                <p className="text-xs text-muted-foreground mt-1 font-mono">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              {user && user.id === r.user_id && (
                <button onClick={() => setDeleteId(r.id)}
                  className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-lg p-6 max-w-sm w-full mx-4 neon-glow space-y-4 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <p className="font-display font-bold text-sm">{t("confirmDelete")}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-md text-sm bg-secondary font-bold hover:bg-secondary/80 transition-colors">
                {t("cancel")}
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-md text-sm bg-destructive text-destructive-foreground font-bold hover:opacity-90 transition-opacity">
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
