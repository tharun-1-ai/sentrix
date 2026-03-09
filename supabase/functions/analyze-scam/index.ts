import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Perform WHOIS lookup for domain age
async function lookupDomainAge(hostname: string): Promise<{ ageDays: number | null; createdDate: string | null; registrar: string | null; privacyProtected: boolean }> {
  const result = { ageDays: null as number | null, createdDate: null as string | null, registrar: null as string | null, privacyProtected: false };
  try {
    // Extract registrable domain (remove subdomains)
    const parts = hostname.split(".");
    const domain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;
    
    const resp = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { "Accept": "application/rdap+json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return result;
    
    const data = await resp.json();
    
    // Extract registration date from events
    const regEvent = (data.events || []).find((e: any) => e.eventAction === "registration");
    if (regEvent?.eventDate) {
      const created = new Date(regEvent.eventDate);
      result.createdDate = regEvent.eventDate;
      result.ageDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    // Extract registrar
    const registrarEntity = (data.entities || []).find((e: any) => (e.roles || []).includes("registrar"));
    if (registrarEntity?.vcardArray?.[1]) {
      const fnEntry = registrarEntity.vcardArray[1].find((v: any) => v[0] === "fn");
      if (fnEntry) result.registrar = fnEntry[3];
    }
    
    // Check for privacy/proxy registration
    const remarks = JSON.stringify(data.remarks || []).toLowerCase();
    const entityNames = JSON.stringify(data.entities || []).toLowerCase();
    if (remarks.includes("privacy") || remarks.includes("proxy") || entityNames.includes("privacy") || entityNames.includes("whoisguard") || entityNames.includes("domains by proxy")) {
      result.privacyProtected = true;
    }
  } catch {
    // WHOIS lookup failed silently
  }
  return result;
}

// Check if domain resolves and responds
async function checkDomainReachability(hostname: string): Promise<{ reachable: boolean; httpsWorks: boolean; redirectsToOther: boolean; finalUrl: string | null }> {
  const result = { reachable: false, httpsWorks: false, redirectsToOther: false, finalUrl: null as string | null };
  try {
    const resp = await fetch(`https://${hostname}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    result.reachable = true;
    result.httpsWorks = true;
    const finalUrl = resp.url;
    result.finalUrl = finalUrl;
    // Check if it redirected to a completely different domain
    try {
      const finalHost = new URL(finalUrl).hostname;
      if (finalHost !== hostname && !finalHost.endsWith(`.${hostname}`) && !hostname.endsWith(`.${finalHost}`)) {
        result.redirectsToOther = true;
      }
    } catch {}
  } catch {
    // HTTPS failed, try HTTP
    try {
      const resp = await fetch(`http://${hostname}`, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });
      result.reachable = true;
      result.finalUrl = resp.url;
      try {
        const finalHost = new URL(resp.url).hostname;
        if (finalHost !== hostname && !finalHost.endsWith(`.${hostname}`) && !hostname.endsWith(`.${finalHost}`)) {
          result.redirectsToOther = true;
        }
      } catch {}
    } catch {
      // Not reachable at all
    }
  }
  return result;
}

// Pre-analysis feature extraction for URLs (now async with live checks)
async function extractUrlFeatures(url: string): Promise<string> {
  const features: string[] = [];
  
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = parsed.hostname;
    const fullUrl = parsed.href;
    
    // URL length analysis
    features.push(`URL length: ${fullUrl.length} characters${fullUrl.length > 75 ? " (SUSPICIOUS: unusually long)" : ""}`);
    
    // Special character count
    const specialChars = (fullUrl.match(/[@!#$%^&*()=+\[\]{}|\\;:'",<>?]/g) || []).length;
    features.push(`Special characters: ${specialChars}${specialChars > 5 ? " (SUSPICIOUS: excessive special characters)" : ""}`);
    
    // Enhanced suspicious keyword detection in domain AND path
    const domainKeywords = ["login", "secure", "account", "verify", "update", "confirm", "banking", "signin", "support", "helpdesk", "recover", "unlock"];
    const urlKeywords = ["job", "offer", "urgent", "payment", "registration-fee", "fee", "apply-now", "immediate", "hiring", "work-from-home", "earn", "income", "salary", "bonus", "free", "guarantee", "winner", "click-here", "verify", "confirm", "update-account", "suspended", "limited-time"];
    
    const foundDomainKw = domainKeywords.filter(kw => hostname.toLowerCase().includes(kw));
    if (foundDomainKw.length > 0) {
      features.push(`DOMAIN KEYWORDS (HIGH RISK): Domain contains suspicious words: ${foundDomainKw.join(", ")} — often used in phishing domains`);
    }
    
    const foundUrlKw = urlKeywords.filter(kw => fullUrl.toLowerCase().includes(kw));
    if (foundUrlKw.length > 0) {
      features.push(`Suspicious URL keywords found: ${foundUrlKw.join(", ")} (HIGH RISK)`);
    }
    
    // Homograph / character substitution detection
    const homographPatterns = /[0-9]/.test(hostname.replace(/\.[a-z]+$/, "").replace(/^www\./, ""));
    const leetSpeak = hostname.match(/[0o][0o]gl|f[a4]c[e3]b[o0][o0]k|l[i1]nk[e3]d|m[i1]cr[o0]s[o0]ft|[a4]m[a4]z[o0]n|p[a4]yp[a4]l/i);
    if (leetSpeak) {
      features.push(`HOMOGRAPH ATTACK: Domain uses character substitution to mimic a known brand (CRITICAL RISK)`);
    } else if (homographPatterns && !(/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname))) {
      features.push(`MIXED CHARS: Domain contains numbers mixed with letters (MEDIUM RISK: possible brand impersonation)`);
    }
    
    // Domain length analysis
    const domainWithoutTld = hostname.split(".").slice(0, -1).join(".");
    if (domainWithoutTld.length > 30) {
      features.push(`DOMAIN LENGTH: ${domainWithoutTld.length} chars (SUSPICIOUS: excessively long domain name)`);
    }
    
    // Hyphen count in domain
    const hyphenCount = (hostname.match(/-/g) || []).length;
    if (hyphenCount >= 3) {
      features.push(`HYPHENS: ${hyphenCount} hyphens in domain (SUSPICIOUS: excessive hyphens common in phishing)`);
    }
    
    // Subdomain depth
    const subdomainParts = hostname.split(".");
    const subdomainDepth = subdomainParts.length - 2;
    if (subdomainDepth > 2) {
      features.push(`Subdomain depth: ${subdomainDepth} levels (SUSPICIOUS: excessive subdomains often used in phishing)`);
    } else {
      features.push(`Subdomain depth: ${subdomainDepth} levels`);
    }
    
    // IP-based URL detection
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      features.push("HOST TYPE: IP address instead of domain name (HIGH RISK: legitimate sites use domain names)");
    }
    
    // HTTPS check
    if (parsed.protocol !== "https:") {
      features.push("PROTOCOL: HTTP only, no SSL/TLS encryption (MEDIUM RISK)");
    } else {
      features.push("PROTOCOL: HTTPS present");
    }
    
    // Typosquatting detection patterns
    const knownBrands = ["google", "facebook", "linkedin", "indeed", "glassdoor", "microsoft", "apple", "amazon", "paypal", "netflix"];
    for (const brand of knownBrands) {
      if (hostname.includes(brand) && !hostname.match(new RegExp(`^(www\\.)?${brand}\\.(com|org|net|co\\.[a-z]{2})$`))) {
        features.push(`TYPOSQUATTING RISK: Domain contains "${brand}" but is not the official domain (HIGH RISK)`);
      }
    }
    
    // Suspicious TLDs
    const suspiciousTlds = [".xyz", ".top", ".club", ".work", ".click", ".loan", ".download", ".stream", ".gq", ".ml", ".cf", ".tk", ".ga", ".buzz", ".icu", ".info", ".biz", ".cc", ".pw", ".ws"];
    const tld = "." + hostname.split(".").slice(-1)[0];
    if (suspiciousTlds.includes(tld)) {
      features.push(`TLD: ${tld} (SUSPICIOUS: commonly associated with scam/spam sites)`);
    }
    
    // Path analysis
    if (parsed.pathname.split("/").length > 6) {
      features.push("URL PATH: Excessively deep path structure (SUSPICIOUS)");
    }
    
    // Query parameter analysis
    const params = parsed.searchParams;
    if ([...params.keys()].length > 5) {
      features.push("URL PARAMS: Excessive query parameters (SUSPICIOUS: possible tracking/redirect chain)");
    }
    
    // Encoded characters
    if (fullUrl.includes("%") && (fullUrl.match(/%[0-9A-Fa-f]{2}/g) || []).length > 3) {
      features.push("ENCODING: Multiple URL-encoded characters detected (SUSPICIOUS: possible obfuscation)");
    }
    
    // Redirect indicators
    if (fullUrl.toLowerCase().includes("redirect") || fullUrl.toLowerCase().includes("url=") || fullUrl.toLowerCase().includes("goto=") || fullUrl.toLowerCase().includes("next=")) {
      features.push("REDIRECT: URL contains redirect parameters (MEDIUM RISK: possible open redirect exploit)");
    }

    // === LIVE CHECKS (parallel) ===
    const [whois, reachability] = await Promise.all([
      lookupDomainAge(hostname),
      checkDomainReachability(hostname),
    ]);
    
    // Domain age results
    if (whois.ageDays !== null) {
      if (whois.ageDays < 30) {
        features.push(`DOMAIN AGE: ${whois.ageDays} days old, registered ${whois.createdDate} (CRITICAL RISK: brand new domain, very likely fraudulent)`);
      } else if (whois.ageDays < 180) {
        features.push(`DOMAIN AGE: ${whois.ageDays} days old, registered ${whois.createdDate} (HIGH RISK: recently registered domain)`);
      } else if (whois.ageDays < 365) {
        features.push(`DOMAIN AGE: ${whois.ageDays} days old, registered ${whois.createdDate} (MEDIUM RISK: relatively new domain)`);
      } else {
        features.push(`DOMAIN AGE: ${whois.ageDays} days old, registered ${whois.createdDate} (LOW RISK: established domain)`);
      }
    } else {
      features.push("DOMAIN AGE: Could not determine (WHOIS lookup failed — treat with caution)");
    }
    
    if (whois.registrar) {
      features.push(`REGISTRAR: ${whois.registrar}`);
    }
    
    if (whois.privacyProtected) {
      features.push("WHOIS PRIVACY: Domain registration is privacy-protected (MEDIUM RISK: ownership hidden)");
    }
    
    // Reachability results
    if (!reachability.reachable) {
      features.push("REACHABILITY: Website is NOT reachable (HIGH RISK: domain may be parked, expired, or taken down)");
    } else {
      if (!reachability.httpsWorks) {
        features.push("SSL CHECK: HTTPS connection FAILED, only HTTP works (HIGH RISK: no valid SSL certificate)");
      } else {
        features.push("SSL CHECK: HTTPS connection successful (valid SSL certificate)");
      }
      if (reachability.redirectsToOther) {
        features.push(`REDIRECT DETECTED: Site redirects to a different domain (${reachability.finalUrl}) (HIGH RISK: possible phishing redirect)`);
      }
    }

  } catch {
    features.push("URL PARSE ERROR: Could not parse URL structure (SUSPICIOUS)");
  }
  
  return features.join("\n");
}

// Pre-analysis feature extraction for text content
function extractTextFeatures(text: string): string {
  const features: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Urgency language detection
  const urgencyPhrases = ["act now", "immediately", "urgent", "asap", "right away", "don't delay", "limited time", "deadline", "expires", "last chance", "hurry", "time sensitive", "respond immediately", "within 24 hours", "today only"];
  const foundUrgency = urgencyPhrases.filter(p => lowerText.includes(p));
  if (foundUrgency.length > 0) {
    features.push(`URGENCY LANGUAGE (${foundUrgency.length} indicators): ${foundUrgency.join(", ")}`);
  }
  
  // Payment/fee request detection
  const paymentPhrases = ["registration fee", "processing fee", "advance payment", "pay first", "wire transfer", "western union", "money order", "gift card", "cryptocurrency", "bitcoin", "send money", "bank transfer", "upfront payment", "training fee", "equipment fee", "background check fee", "application fee"];
  const foundPayment = paymentPhrases.filter(p => lowerText.includes(p));
  if (foundPayment.length > 0) {
    features.push(`PAYMENT REQUESTS (${foundPayment.length} indicators, HIGH RISK): ${foundPayment.join(", ")}`);
  }
  
  // Unrealistic salary detection
  const salaryMatches = text.match(/\$[\d,]+(?:\s*(?:per|\/)\s*(?:hour|hr|day|week|month))?/gi) || [];
  if (salaryMatches.length > 0) {
    features.push(`SALARY MENTIONS: ${salaryMatches.join(", ")} — verify if realistic for the role`);
  }
  const earningClaims = text.match(/earn\s+\$?[\d,]+\+?\s*(?:per|\/|a)?\s*(?:hour|day|week|month|year)?/gi) || [];
  if (earningClaims.length > 0) {
    features.push(`EARNING CLAIMS: ${earningClaims.join(", ")} — often exaggerated in scams`);
  }
  
  // Grammar anomaly indicators
  const grammarIssues: string[] = [];
  if ((text.match(/!{2,}/g) || []).length > 2) grammarIssues.push("excessive exclamation marks");
  if ((text.match(/\b[A-Z]{4,}\b/g) || []).length > 3) grammarIssues.push("excessive capitalization");
  if ((text.match(/\.{3,}/g) || []).length > 2) grammarIssues.push("excessive ellipses");
  if (text.split(/[.!?]/).some(s => s.trim().split(" ").length > 60)) grammarIssues.push("extremely long run-on sentences");
  if (grammarIssues.length > 0) {
    features.push(`GRAMMAR ANOMALIES: ${grammarIssues.join(", ")}`);
  }
  
  // Authority impersonation
  const authorityPhrases = ["government", "official", "certified", "authorized", "verified company", "registered business", "license number", "compliance", "federal", "ministry"];
  const foundAuthority = authorityPhrases.filter(p => lowerText.includes(p));
  if (foundAuthority.length > 0) {
    features.push(`AUTHORITY CLAIMS: ${foundAuthority.join(", ")} — verify legitimacy`);
  }
  
  // Personal information requests
  const personalInfoPhrases = ["social security", "ssn", "bank account", "routing number", "credit card", "passport", "driver's license", "date of birth", "mother's maiden", "national id"];
  const foundPersonal = personalInfoPhrases.filter(p => lowerText.includes(p));
  if (foundPersonal.length > 0) {
    features.push(`PERSONAL INFO REQUESTS (HIGH RISK): ${foundPersonal.join(", ")}`);
  }
  
  // Vague job description indicators
  const vagueTerms = ["easy work", "no experience", "no skills required", "anyone can do", "work from home", "be your own boss", "unlimited earning", "flexible hours", "part time", "simple tasks"];
  const foundVague = vagueTerms.filter(p => lowerText.includes(p));
  if (foundVague.length > 0) {
    features.push(`VAGUE JOB DESCRIPTIONS: ${foundVague.join(", ")}`);
  }
  
  // Contact method red flags
  const contactFlags = ["whatsapp", "telegram", "personal email", "gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
  const foundContact = contactFlags.filter(p => lowerText.includes(p));
  if (foundContact.length > 0) {
    features.push(`INFORMAL CONTACT METHODS: ${foundContact.join(", ")} — legitimate companies use corporate email`);
  }
  
  // Text statistics
  features.push(`Text length: ${text.length} chars, ${text.split(/\s+/).length} words`);
  
  return features.join("\n");
}

// Extract recruiter-specific features
function extractRecruiterFeatures(content: string): string {
  const features: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Email domain analysis
  const emailMatch = content.match(/[\w.-]+@([\w.-]+\.\w+)/i);
  if (emailMatch) {
    const domain = emailMatch[1].toLowerCase();
    const freeEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "mail.com", "protonmail.com", "icloud.com", "yandex.com", "zoho.com"];
    if (freeEmailDomains.includes(domain)) {
      features.push(`EMAIL DOMAIN: ${domain} (FREE EMAIL - MEDIUM RISK: legitimate recruiters typically use corporate email domains)`);
    } else {
      features.push(`EMAIL DOMAIN: ${domain} (corporate domain - verify it matches the claimed company)`);
    }
    
    // Check for company name in email domain
    const nameMatch = content.match(/(?:recruiter\s*name|name)\s*:\s*(.+)/i);
    if (nameMatch) {
      const recruiterName = nameMatch[1].trim().toLowerCase();
      if (!domain.includes(recruiterName.split(" ")[0]) && !freeEmailDomains.includes(domain)) {
        features.push("NAME-DOMAIN MISMATCH: Recruiter name does not appear related to email domain");
      }
    }
  }
  
  // LinkedIn URL validation
  const linkedinMatch = content.match(/linkedin\.com\/in\/([\w-]+)/i);
  if (linkedinMatch) {
    features.push(`LINKEDIN: Profile URL provided (${linkedinMatch[0]}) — verify profile exists and matches claimed identity`);
  } else if (lowerContent.includes("not provided") || !lowerContent.includes("linkedin")) {
    features.push("LINKEDIN: No profile provided (MEDIUM RISK: legitimate recruiters typically have LinkedIn profiles)");
  }
  
  return features.join("\n");
}

const systemPrompt = `You are an advanced cybersecurity threat analyst specializing in employment fraud detection, phishing analysis, and social engineering attack identification. You have deep expertise in OSINT, domain intelligence, NLP-based deception detection, and behavioral analysis.

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code blocks, no text outside the JSON object.
2. Every analysis must be unique and specific to the actual input content.
3. Never return generic or template responses. Reference specific elements from the input.
4. Base your scamScore on cumulative weighted evidence, not gut feeling.

RESPONSE FORMAT (strict JSON):
{
  "scamScore": <number 0-100>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "summary": "<2-3 sentence executive summary with specific findings>",
  "detailedExplanation": "<comprehensive 3-5 sentence analysis citing specific evidence>",
  "suspiciousPhrases": ["<exact quotes from the input that are suspicious>"],
  "manipulationIndicators": {
    "urgencyLevel": <0-100>,
    "fearLevel": <0-100>,
    "greedTrigger": <0-100>,
    "authorityImpersonation": <0-100>
  },
  "reasons": ["<specific evidence-based reason 1>", "<reason 2>", "<reason 3>"],
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "scamType": "<specific scam type or 'None detected'>",
  "confidenceLevel": <0-100>,
  "featureBreakdown": {
    "urlRisk": <0-100 or null>,
    "contentRisk": <0-100 or null>,
    "domainRisk": <0-100 or null>,
    "sslRisk": <0-100 or null>,
    "nlpRisk": <0-100 or null>
  }
}

RISK SCORING METHODOLOGY — use weighted cumulative scoring:
- Suspicious URL patterns (length, special chars, IP-based, deep subdomains): +5-15 points each
- Suspicious/free TLD (.xyz, .tk, .top, etc.): +10-20 points
- Missing or invalid SSL / HTTP only: +15 points
- Recently registered domain (< 6 months): +15-25 points
- Hidden WHOIS / privacy protected: +5-10 points
- Typosquatting of known brands: +25-35 points
- Payment/fee requests before employment: +30-40 points (CRITICAL indicator)
- Personal information requests (SSN, bank details): +25-35 points
- Urgency/pressure language: +10-20 points based on intensity
- Unrealistic salary/earning promises: +15-25 points
- Vague job descriptions with no specifics: +10-15 points
- Free email domain for recruiter: +10-15 points
- No LinkedIn or web presence: +10-15 points
- Grammar anomalies / poor formatting: +5-10 points
- Authority impersonation claims: +10-20 points

RISK LEVEL THRESHOLDS:
- 0-20: Low (likely legitimate)
- 21-50: Medium (some concerns, exercise caution)
- 51-75: High (strong scam indicators present)
- 76-100: Critical (almost certainly fraudulent)

CALIBRATION RULES to reduce false positives/negatives:
- A single weak indicator alone should NOT produce a high score. Require multiple corroborating signals.
- Legitimate companies CAN have long URLs, subdomains, or urgency language in isolation. Context matters.
- Well-known company domains (linkedin.com, indeed.com, glassdoor.com, google.com) should receive LOW base risk.
- If the content is clearly professional, well-structured, and from a verifiable source, bias toward LOW risk even if 1-2 minor flags exist.
- If 3+ strong indicators converge (payment request + urgency + free email + vague description), score should be HIGH or CRITICAL.
- Set confidenceLevel based on how much evidence is available: sparse input = lower confidence (40-60), rich input = higher confidence (70-95).

SCAM TYPE CLASSIFICATIONS:
- Advance Fee Fraud: Requires payment before employment
- Phishing: Attempts to harvest personal/financial information
- Fake Recruiter: Impersonates legitimate company/recruiter
- Money Mule: Involves receiving/forwarding money or packages
- Equipment Scam: Requires purchasing equipment via specific vendor
- Overpayment Scam: Sends excess payment, asks for refund
- Pyramid/MLM: Recruitment-based income model
- Data Harvesting: Collects personal data for identity theft
- None detected: No clear scam indicators found`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Pre-extract features based on analysis type
    let preAnalysis = "";
    let userPrompt = "";
    
    switch (type) {
      case "message": {
        preAnalysis = extractTextFeatures(content);
        userPrompt = `Analyze this job-related message for scam indicators.

PRE-EXTRACTED FEATURES (use these as evidence in your analysis):
${preAnalysis}

ORIGINAL MESSAGE:
"${content}"

Apply the weighted scoring methodology. Cross-reference multiple indicators before assigning a high score. Be specific about which phrases and patterns triggered each risk factor.`;
        break;
      }
      case "url": {
        preAnalysis = extractUrlFeatures(content);
        userPrompt = `Analyze this URL for legitimacy as a job posting or recruitment site.

PRE-EXTRACTED URL FEATURES (use these as evidence):
${preAnalysis}

URL: ${content}

Perform comprehensive domain intelligence analysis:
1. DOMAIN ANALYSIS: Assess domain reputation, estimate registration age, check for typosquatting of known brands
2. SSL/SECURITY: Evaluate HTTPS enforcement, predict SSL certificate status, check for suspicious redirect patterns
3. URL STRUCTURE: Analyze path depth, query parameters, encoded characters, suspicious keywords
4. HOSTING INDICATORS: Check if IP-based, assess TLD reputation, evaluate subdomain structure
5. PHISHING INDICATORS: Compare against known phishing patterns, check for brand impersonation

Apply weighted scoring based on cumulative findings. A single weak indicator should not produce a high score.`;
        break;
      }
      case "recruiter": {
        const recruiterFeatures = extractRecruiterFeatures(content);
        const textFeatures = extractTextFeatures(content);
        preAnalysis = `${recruiterFeatures}\n${textFeatures}`;
        userPrompt = `Verify this recruiter's legitimacy and trustworthiness.

PRE-EXTRACTED FEATURES:
${preAnalysis}

RECRUITER INFORMATION:
${content}

Perform comprehensive recruiter verification:
1. EMAIL ANALYSIS: Verify domain legitimacy, check if corporate or free email, assess domain-company match
2. IDENTITY VERIFICATION: Cross-reference name with email domain, evaluate LinkedIn presence
3. PROFESSIONAL INDICATORS: Check for standard recruitment communication patterns
4. RED FLAGS: Look for urgency, vague company details, unusual contact methods

IMPORTANT: For recruiter verification, scamScore represents RISK (0 = no risk/fully trusted, 100 = definite scam). Apply weighted evidence-based scoring.`;
        break;
      }
      case "offer_letter": {
        preAnalysis = extractTextFeatures(content);
        userPrompt = `Analyze this offer letter for scam indicators.

PRE-EXTRACTED TEXT FEATURES:
${preAnalysis}

OFFER LETTER CONTENT:
"${content}"

Perform comprehensive offer letter analysis:
1. COMPENSATION ANALYSIS: Check if salary/benefits are realistic for the claimed role and industry
2. COMPANY VERIFICATION: Look for verifiable company details (address, registration, website)
3. LEGAL COMPLIANCE: Check for standard employment terms, proper legal language, benefit details
4. PAYMENT RED FLAGS: Any requests for upfront payments, fees, or financial commitments from the candidate
5. FORMATTING & LANGUAGE: Assess professionalism, grammar quality, formatting consistency
6. CONTACT METHODS: Verify if official channels are used (corporate email, official phone numbers)

Apply weighted scoring. Payment requests in offer letters are CRITICAL red flags (+30-40 points). Missing company details and vague job descriptions are MEDIUM risk.`;
        break;
      }
      default:
        preAnalysis = extractTextFeatures(content);
        userPrompt = `Analyze this content for scam indicators:\n\nPRE-EXTRACTED FEATURES:\n${preAnalysis}\n\nCONTENT:\n"${content}"`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent, reliable outputs
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
      
      // Post-processing: validate and clamp scores
      analysis.scamScore = Math.max(0, Math.min(100, Math.round(analysis.scamScore || 0)));
      
      // Ensure risk level matches score thresholds
      if (analysis.scamScore <= 20) analysis.riskLevel = "Low";
      else if (analysis.scamScore <= 50) analysis.riskLevel = "Medium";
      else if (analysis.scamScore <= 75) analysis.riskLevel = "High";
      else analysis.riskLevel = "Critical";
      
      // Clamp manipulation indicators
      if (analysis.manipulationIndicators) {
        for (const key of Object.keys(analysis.manipulationIndicators)) {
          analysis.manipulationIndicators[key] = Math.max(0, Math.min(100, Math.round(analysis.manipulationIndicators[key] || 0)));
        }
      }
      
      // Ensure arrays exist
      if (!Array.isArray(analysis.suspiciousPhrases)) analysis.suspiciousPhrases = [];
      if (!Array.isArray(analysis.reasons)) analysis.reasons = [];
      if (!Array.isArray(analysis.recommendations)) analysis.recommendations = [];
      
      // Ensure confidence level
      analysis.confidenceLevel = Math.max(0, Math.min(100, Math.round(analysis.confidenceLevel || 50)));
      
    } catch {
      analysis = {
        scamScore: 50,
        riskLevel: "Medium",
        summary: rawContent.substring(0, 200),
        detailedExplanation: rawContent,
        suspiciousPhrases: [],
        manipulationIndicators: { urgencyLevel: 0, fearLevel: 0, greedTrigger: 0, authorityImpersonation: 0 },
        reasons: ["Could not fully parse AI response"],
        recommendations: ["Exercise caution and verify independently"],
        scamType: "Unknown",
        confidenceLevel: 30,
        featureBreakdown: { urlRisk: null, contentRisk: null, domainRisk: null, sslRisk: null, nlpRisk: null },
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
