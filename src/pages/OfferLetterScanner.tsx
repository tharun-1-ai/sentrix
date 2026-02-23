import { useState, useRef } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { FileText, Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OfferLetterScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { analyze, loading, result } = useScamAnalysis();
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      toast({ title: "Invalid file", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    setFile(f);
    // Extract text from PDF using FileReader
    const reader = new FileReader();
    reader.onload = () => {
      const text = extractTextFromPDF(reader.result as ArrayBuffer);
      setExtractedText(text);
    };
    reader.readAsArrayBuffer(f);
  };

  // Simple PDF text extraction (extracts visible text strings)
  const extractTextFromPDF = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let text = "";
    // Extract readable ASCII text segments
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
    // Clean up common PDF artifacts
    text = text.replace(/\s+/g, " ").replace(/[^\x20-\x7E\n]/g, "");
    // Filter out PDF structural commands
    const words = text.split(" ").filter(w =>
      w.length > 2 &&
      !w.match(/^(obj|endobj|stream|endstream|xref|trailer|startxref|%%EOF)$/) &&
      !w.match(/^\d+\s+\d+\s+R$/) &&
      !w.includes("/Type") &&
      !w.includes("/Font")
    );
    return words.join(" ").substring(0, 5000) || "Could not extract text from this PDF. The file may be image-based.";
  };

  const handleAnalyze = () => {
    if (!extractedText) return;
    analyze("offer_letter", extractedText);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Offer Letter Scanner
        </h1>
        <p className="text-sm text-muted-foreground">Upload a PDF offer letter to scan for scam indicators.</p>
      </div>

      <div className="bg-card rounded-lg border p-5">
        {!file ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-sm">Click to upload PDF</p>
            <p className="text-xs text-muted-foreground mt-1">Only PDF files accepted</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted rounded-md p-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={() => { setFile(null); setExtractedText(""); }} className="p-1 hover:bg-background rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            {extractedText && (
              <div className="bg-background rounded-md p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-mono text-muted-foreground">{extractedText.substring(0, 500)}...</p>
              </div>
            )}
            <button onClick={handleAnalyze} disabled={loading || !extractedText}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : "Scan Offer Letter"}
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} className="hidden" />
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
