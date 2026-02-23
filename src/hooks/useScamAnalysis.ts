import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AnalysisResult {
  scamScore: number;
  riskLevel: string;
  summary: string;
  detailedExplanation: string;
  suspiciousPhrases: string[];
  manipulationIndicators: {
    urgencyLevel: number;
    fearLevel: number;
    greedTrigger: number;
    authorityImpersonation: number;
  };
  reasons: string[];
  recommendations: string[];
  scamType: string;
}

export function useScamAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyze = async (type: string, content: string) => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-scam", {
        body: { type, content },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as AnalysisResult);

      // Save report
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("scan_reports").insert({
          user_id: user.id,
          scan_type: type,
          input_summary: content.substring(0, 200),
          scam_score: data.scamScore || 0,
          risk_level: data.riskLevel || "Low",
          analysis: data,
        });
      }
      return data as AnalysisResult;
    } catch (e: any) {
      toast({
        title: "Analysis Error",
        description: e.message || "Failed to analyze content",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, result, setResult };
}
