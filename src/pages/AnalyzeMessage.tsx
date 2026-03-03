import { useState } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { MessageSquareWarning, Loader2, Scan } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AnalyzeMessage() {
  const [text, setText] = useState("");
  const { analyze, loading, result } = useScamAnalysis();
  const { t } = useLanguage();

  const handleAnalyze = () => {
    if (text.trim().length < 10) return;
    analyze("message", text);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <MessageSquareWarning className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} />
          {t("aiMessageAnalyzer")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("aiMessageAnalyzerDesc")}</p>
      </div>

      <div className="cyber-card p-5">
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder={t("pasteMessage")}
          className="w-full h-40 bg-secondary/50 border border-border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all font-mono"
        />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-muted-foreground font-mono">{text.length} {t("characters")}</p>
          <button
            onClick={handleAnalyze} disabled={loading || text.trim().length < 10}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] disabled:opacity-50 transition-all"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("analyzing")}</> : <><Scan className="h-4 w-4" /> {t("analyzeMessageBtn")}</>}
          </button>
        </div>
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
