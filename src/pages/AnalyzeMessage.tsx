import { useState } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { MessageSquareWarning, Loader2 } from "lucide-react";

export default function AnalyzeMessage() {
  const [text, setText] = useState("");
  const { analyze, loading, result } = useScamAnalysis();

  const handleAnalyze = () => {
    if (text.trim().length < 10) return;
    analyze("message", text);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquareWarning className="h-6 w-6 text-primary" />
          AI Message Analyzer
        </h1>
        <p className="text-sm text-muted-foreground">Paste a job message, WhatsApp message, or email content to analyze for scam indicators.</p>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste the suspicious message here..."
          className="w-full h-40 bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-muted-foreground">{text.length} characters</p>
          <button
            onClick={handleAnalyze} disabled={loading || text.trim().length < 10}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Message"}
          </button>
        </div>
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
