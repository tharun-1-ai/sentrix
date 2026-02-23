import { useState } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { Globe, Loader2 } from "lucide-react";

export default function WebsiteChecker() {
  const [url, setUrl] = useState("");
  const { analyze, loading, result } = useScamAnalysis();

  const handleCheck = () => {
    if (!url.trim()) return;
    analyze("url", url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" /> Website Checker
        </h1>
        <p className="text-sm text-muted-foreground">Enter a website URL to verify its legitimacy as a job posting site.</p>
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
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking...</> : "Check URL"}
          </button>
        </div>
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
