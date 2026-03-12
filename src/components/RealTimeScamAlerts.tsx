import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Users, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface ScamAlert {
  id: string;
  title: string;
  domain: string;
  reportCount: number;
  riskLevel: "High" | "Medium" | "Low";
  detectedAt: string;
}

const RISK_STYLES = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  Low: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const CARD_BORDER = {
  High: "border-destructive/30 hover:border-destructive/50",
  Medium: "border-warning/30 hover:border-warning/50",
  Low: "border-yellow-500/20 hover:border-yellow-500/40",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function inferTitle(value: string, type: string): string {
  if (type === "website" || type === "url") return `Suspicious Website: ${value}`;
  if (type === "phone") return `Scam Phone Number: ${value}`;
  if (type === "email") return `Fraudulent Email: ${value}`;
  return `Reported Scam: ${value}`;
}

const DEMO_ALERTS: ScamAlert[] = [
  { id: "demo-1", title: "Fake Amazon Recruitment Scam", domain: "amazon-career-job.com", reportCount: 12, riskLevel: "High", detectedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "demo-2", title: "Telegram Data Entry Job Scam", domain: "Telegram", reportCount: 7, riskLevel: "Medium", detectedAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: "demo-3", title: "Fake Google Interview Email", domain: "google-hiring@gmail.com", reportCount: 5, riskLevel: "High", detectedAt: new Date(Date.now() - 24 * 3600000).toISOString() },
];

export default function RealTimeScamAlerts() {
  const [alerts, setAlerts] = useState<ScamAlert[]>(DEMO_ALERTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        // Fetch recent community reports with high upvotes
        const { data: communityData } = await supabase
          .from("community_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch recent high-risk scan reports
        const { data: scanData } = await supabase
          .from("scan_reports")
          .select("*")
          .in("risk_level", ["High", "Critical"])
          .order("created_at", { ascending: false })
          .limit(10);

        const liveAlerts: ScamAlert[] = [];

        // Process community reports - group by value
        if (communityData && communityData.length > 0) {
          const grouped = new Map<string, { count: number; upvotes: number; type: string; latest: string }>();
          for (const r of communityData) {
            const key = r.value.toLowerCase().trim();
            const existing = grouped.get(key);
            if (existing) {
              existing.count++;
              existing.upvotes += r.upvotes;
              if (r.created_at > existing.latest) existing.latest = r.created_at;
            } else {
              grouped.set(key, { count: 1, upvotes: r.upvotes, type: r.report_type, latest: r.created_at });
            }
          }

          for (const [value, info] of grouped) {
            const totalSignals = info.count + info.upvotes;
            const riskLevel: "High" | "Medium" | "Low" = totalSignals >= 5 ? "High" : totalSignals >= 2 ? "Medium" : "Low";
            liveAlerts.push({
              id: `community-${value}`,
              title: inferTitle(value, info.type),
              domain: value,
              reportCount: info.count + info.upvotes,
              riskLevel,
              detectedAt: info.latest,
            });
          }
        }

        // Process scan reports
        if (scanData && scanData.length > 0) {
          for (const s of scanData) {
            const riskLevel: "High" | "Medium" | "Low" = s.scam_score >= 70 ? "High" : s.scam_score >= 40 ? "Medium" : "Low";
            liveAlerts.push({
              id: `scan-${s.id}`,
              title: `AI Detected: ${s.input_summary || s.scan_type}`,
              domain: s.input_summary || s.scan_type,
              reportCount: 1,
              riskLevel,
              detectedAt: s.created_at,
            });
          }
        }

        // Sort by date, take top 5
        liveAlerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
        const top5 = liveAlerts.slice(0, 5);

        setAlerts(top5.length > 0 ? top5 : DEMO_ALERTS);
      } catch {
        // Fallback to demo data
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  return (
    <section className="animate-fade-in">
      <h2 className="text-lg font-display font-bold mb-1 flex items-center gap-2">
        <Wifi className="h-5 w-5 text-destructive animate-pulse" /> 🚨 Real-Time Scam Alerts
      </h2>
      <p className="text-sm text-muted-foreground font-medium mb-4">
        Latest scams reported by the Sentrix community and detected by AI analysis.
      </p>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cyber-card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))
        ) : (
          alerts.map((alert, idx) => (
            <div
              key={alert.id}
              className={`cyber-card p-4 border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${CARD_BORDER[alert.riskLevel]}`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.riskLevel === "High" ? "text-destructive" : "text-warning"}`} />
                    <h3 className="font-bold text-sm truncate">{alert.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate mb-2">{alert.domain}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {alert.reportCount} {alert.reportCount === 1 ? "report" : "reports"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(alert.detectedAt)}
                    </span>
                  </div>
                </div>
                <Badge className={`shrink-0 text-[10px] font-bold border ${RISK_STYLES[alert.riskLevel]}`}>
                  {alert.riskLevel} Risk
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
