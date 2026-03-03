import { useState, useRef } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { FileText, Upload, Loader2, X, Scan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function OfferLetterScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { analyze, loading, result } = useScamAnalysis();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      toast({ title: t("invalidFile"), description: t("pleaseUploadPdf"), variant: "destructive" });
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const text = extractTextFromPDF(reader.result as ArrayBuffer);
      setExtractedText(text);
    };
    reader.readAsArrayBuffer(f);
  };

  const extractTextFromPDF = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let text = "";
    let current = "";
    for (let i = 0; i < bytes.length; i++) {
      const c = bytes[i];
      if (c >= 32 && c <= 126) {
        current += String.fromCharCode(c);
      } else {
        if (current.length > 4) text += current + " ";
        current = "";
      }
    }
    text = text.replace(/\s+/g, " ").replace(/[^\x20-\x7E\n]/g, "");
    const words = text.split(" ").filter(w =>
      w.length > 2 &&
      !w.match(/^(obj|endobj|stream|endstream|xref|trailer|startxref|%%EOF)$/) &&
      !w.match(/^\d+\s+\d+\s+R$/) &&
      !w.includes("/Type") &&
      !w.includes("/Font")
    );
    return words.join(" ").substring(0, 5000) || "Could not extract text from this PDF.";
  };

  const handleAnalyze = () => {
    if (!extractedText) return;
    analyze("offer_letter", extractedText);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <FileText className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("offerLetterScanner")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("offerLetterScannerDesc")}</p>
      </div>

      <div className="cyber-card p-5">
        {!file ? (
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed neon-border rounded-lg p-12 text-center cursor-pointer hover:bg-primary/5 transition-all group">
            <Upload className="h-10 w-10 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.3))" }} />
            <p className="font-bold text-sm">{t("clickToUpload")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("onlyPdf")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-secondary/50 rounded-md p-3 border border-border">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-bold">{file.name}</span>
                <span className="text-muted-foreground font-mono text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={() => { setFile(null); setExtractedText(""); }} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {extractedText && (
              <div className="bg-secondary/30 rounded-md p-3 max-h-40 overflow-y-auto border border-border">
                <p className="text-xs font-mono text-muted-foreground">{extractedText.substring(0, 500)}...</p>
              </div>
            )}
            <button onClick={handleAnalyze} disabled={loading || !extractedText}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] disabled:opacity-50 transition-all">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("analyzing")}</> : <><Scan className="h-4 w-4" /> {t("scanOfferLetter")}</>}
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} className="hidden" />
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
