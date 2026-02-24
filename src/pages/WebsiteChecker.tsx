import { useState } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { Globe, Loader2 } from "lucide-react";
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" /> {t("websiteCheckerTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("websiteCheckerDescFull")}</p>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <div className="flex gap-3">
          <input
            type="url" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/job-posting"
            className="flex-1 bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleCheck} disabled={loading || !url.trim()}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("checking")}</> : t("checkUrl")}
          </button>
        </div>
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
