import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Users, ThumbsUp, Plus, Globe, Phone } from "lucide-react";

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
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState("website");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());

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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Report submitted", description: "Thank you for helping the community." });
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Community Reports
          </h1>
          <p className="text-sm text-muted-foreground">Report and browse community-submitted scams.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Report Scam
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg border p-5 space-y-4 animate-fade-in">
          <div className="flex gap-3">
            <button onClick={() => setReportType("website")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${reportType === "website" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Globe className="h-3 w-3" /> Website
            </button>
            <button onClick={() => setReportType("phone")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${reportType === "phone" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <Phone className="h-3 w-3" /> Phone Number
            </button>
          </div>
          <input value={value} onChange={e => setValue(e.target.value)}
            placeholder={reportType === "website" ? "https://suspicious-site.com" : "+1 234 567 8900"}
            className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Describe the scam..."
            className="w-full bg-background border rounded-md px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <button onClick={handleSubmit} disabled={loading || !value.trim()}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No reports yet</p>
            <p className="text-sm text-muted-foreground">Be the first to report a scam.</p>
          </div>
        ) : (
          reports.map(r => (
            <div key={r.id} className="bg-card rounded-lg border p-4 flex items-start gap-4">
              <button onClick={() => handleUpvote(r.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${userUpvotes.has(r.id) ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}>
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs font-medium">{r.upvotes}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {r.report_type === "website" ? <Globe className="h-3 w-3 text-primary" /> : <Phone className="h-3 w-3 text-warning" />}
                  <span className="text-sm font-mono font-medium truncate">{r.value}</span>
                </div>
                {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
