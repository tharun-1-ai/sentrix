import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, language, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language === "ta"
      ? "You MUST respond entirely in Tamil (தமிழ்). Use professional, accurate Tamil. Do not mix English unless referring to brand names like Sentrix."
      : language === "hi"
      ? "You MUST respond entirely in Hindi (हिंदी). Use professional, accurate Hindi. Do not mix English unless referring to brand names like Sentrix."
      : "Respond in English.";

    const systemPrompt = `You are Sentrix Assistant, an AI cybersecurity intelligence bot specialized in job scam detection, fraud analysis, and cybersecurity guidance.

${langInstruction}

CORE CAPABILITIES:
- Detect and explain fake job scams, phishing, advance fee fraud, reshipping scams
- Identify psychological manipulation tactics: urgency, fear, greed triggers, authority impersonation
- Analyze suspicious messages, emails, WhatsApp texts for scam indicators
- Guide users on website verification, recruiter authentication, offer letter fraud
- Explain risk scores, manipulation breakdowns, and prevention strategies
- Provide reporting guidance for scams

KEYWORD DETECTION - When user mentions these, immediately flag as potential scam:
- processing fee, registration fee, training fee, advance payment
- urgent, immediately, limited time, act now
- Telegram job offer, WhatsApp HR
- Gmail HR (e.g., hr@gmail.com instead of company domain)
- fake offer letter, Aadhaar request during hiring
- deposit before joining, high salary no experience
- blacklist threat, legal action threat

RESPONSE FORMAT:
- Give clear, structured responses
- Include risk evaluation when relevant
- Provide actionable prevention advice
- Suggest using Sentrix analyzer tools when appropriate (e.g., "You can paste the message in the Message Analyzer for full AI risk scoring.")
- Be professional, intelligent, and human-like

TECHNICAL KNOWLEDGE (for judges):
When asked "How does your AI detect scams?", explain:
1. NLP-based text analysis - keyword clustering, semantic pattern matching
2. Behavioral pattern detection - urgency, fear, greed, authority manipulation scoring
3. Weighted scoring system - combining multiple risk factors into a 0-100 score
4. Domain forensics - email domain analysis, website legitimacy checks
5. Document scanning logic - PDF text extraction and content analysis for offer letters

BOUNDARIES:
- Only answer questions related to job scams, cybersecurity, fraud detection, and platform usage
- For unrelated questions: "I am Sentrix Assistant, specialized in job scam detection and cybersecurity guidance. I can help you with scam analysis, prevention, and reporting."
- Never provide legal advice. Always include: "Sentrix provides risk assessment guidance, not legal certification."
- Never generate unsafe or hallucinated responses

PLATFORM INTEGRATION:
- If user describes a suspicious message, suggest using the Message Analyzer
- If user asks about a website, suggest the Website Checker
- If user asks about a recruiter, suggest the Recruiter Verification tool
- If user mentions an offer letter, suggest the Offer Letter Scanner
- Reference the Scam Prevention Hub for educational content`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I apologize, I couldn't process that request.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sentrix-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
