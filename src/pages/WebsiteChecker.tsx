import { useState } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { Globe, Loader2, Scan } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function WebsiteChecker() {
  const [url, setUrl] = useState("");
  const { analyze, loading, result } = useScamAnalysis();
  const { t } = useLanguage();

  const handleCheck = () => {
    if (!url.trim()) return;
    analyze("url", url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <Globe className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("websiteCheckerTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("websiteCheckerDescFull")}</p>
      </div>

      <div className="cyber-card p-5">
        <div className="flex gap-3">
          <input
            type="url" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/job-posting"
            className="flex-1 bg-secondary/50 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground placeholder:text-muted-foreground font-mono transition-all"
          />
          <button
            onClick={handleCheck} disabled={loading || !url.trim()}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] disabled:opacity-50 transition-all"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("checking")}</> : <><Scan className="h-4 w-4" /> {t("checkUrl")}</>}
          </button>
        </div>
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
