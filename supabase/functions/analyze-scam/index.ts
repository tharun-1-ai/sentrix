import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a cybersecurity expert specializing in job scam detection, fraud analysis, and psychological manipulation detection. Analyze the provided content and return a JSON response.

IMPORTANT: You MUST return ONLY valid JSON, no markdown, no code blocks, no explanation text outside JSON.

Based on the analysis type, evaluate the content and return this exact JSON structure:
{
  "scamScore": <number 0-100>,
  "riskLevel": "<Low|Medium|High>",
  "summary": "<2-3 sentence summary of findings>",
  "detailedExplanation": "<detailed paragraph explaining the analysis>",
  "suspiciousPhrases": ["<phrase1>", "<phrase2>"],
  "manipulationIndicators": {
    "urgencyLevel": <0-100>,
    "fearLevel": <0-100>,
    "greedTrigger": <0-100>,
    "authorityImpersonation": <0-100>
  },
  "reasons": ["<reason1>", "<reason2>", "<reason3>"],
  "recommendations": ["<rec1>", "<rec2>"],
  "scamType": "<type of scam detected or 'None detected'>"
}

For "message" analysis: Focus on scam keywords, payment requests, urgency, fear tactics, authority impersonation, emotional manipulation, unrealistic promises.

For "url" analysis: Assess domain trustworthiness, HTTPS status, suspicious patterns, phishing indicators, domain age estimation, typosquatting.

For "recruiter" analysis: Check email domain legitimacy, company-email mismatch, LinkedIn presence indicators, professional patterns, and generate a trust score as the scamScore (inverted - 100 means fully trusted, 0 means scam).

For "offer_letter" analysis: Look for payment requests, unrealistic salaries, vague job descriptions, grammar issues, missing company details, suspicious formatting.

Be specific and vary your analysis based on actual content. Never give the same response for different inputs. Detect actual keywords and phrases present in the input.`;

    let userPrompt = "";
    switch (type) {
      case "message":
        userPrompt = `Analyze this job-related message for scam indicators:\n\n"${content}"`;
        break;
      case "url":
        userPrompt = `Analyze this website URL for legitimacy as a job posting or recruitment site:\n\nURL: ${content}`;
        break;
      case "recruiter":
        userPrompt = `Verify this recruiter's legitimacy:\n\n${content}`;
        break;
      case "offer_letter":
        userPrompt = `Analyze this offer letter content for scam indicators:\n\n"${content}"`;
        break;
      default:
        userPrompt = `Analyze this content for scam indicators:\n\n"${content}"`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "{}";
    
    // Clean markdown code blocks if present
    let cleaned = rawContent.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = {
        scamScore: 50,
        riskLevel: "Medium",
        summary: rawContent.substring(0, 200),
        detailedExplanation: rawContent,
        suspiciousPhrases: [],
        manipulationIndicators: { urgencyLevel: 0, fearLevel: 0, greedTrigger: 0, authorityImpersonation: 0 },
        reasons: ["Could not fully parse AI response"],
        recommendations: ["Exercise caution"],
        scamType: "Unknown",
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-scam error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
