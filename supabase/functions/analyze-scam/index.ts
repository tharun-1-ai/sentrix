import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── TRUSTED DOMAIN WHITELIST ───
// These domains are known-safe and will always be scored LOW unless the URL
// path itself contains scam content (e.g. a phishing form hosted on a trusted CDN).
const TRUSTED_DOMAINS = new Set([
  "google.com", "google.co.in", "google.co.uk", "google.co.jp", "google.de",
  "microsoft.com", "linkedin.com", "indeed.com", "glassdoor.com",
  "amazon.com", "amazon.co.uk", "amazon.in",
  "apple.com", "facebook.com", "meta.com", "instagram.com",
  "twitter.com", "x.com", "github.com", "stackoverflow.com",
  "netflix.com", "paypal.com", "stripe.com",
  "naukri.com", "monster.com", "ziprecruiter.com", "careerbuilder.com",
  "lever.co", "greenhouse.io", "workday.com", "oracle.com",
  "ibm.com", "salesforce.com", "adobe.com", "spotify.com",
  "uber.com", "airbnb.com", "tesla.com", "nvidia.com",
  "yahoo.com", "bing.com", "reddit.com", "wikipedia.org",
  "dropbox.com", "zoom.us", "slack.com", "notion.so",
  "tcs.com", "wipro.com", "infosys.com", "hcltech.com", "cognizant.com",
  "accenture.com", "deloitte.com", "pwc.com", "ey.com", "kpmg.com",
  "gov.in", "gov.uk", "gov.us", "nih.gov", "edu",
]);

// Country-code second-level TLDs (e.g. .co.uk, .co.in, .com.au)
const CC_SECOND_LEVEL = new Set([
  "co.uk", "co.in", "co.jp", "co.kr", "co.nz", "co.za",
  "com.au", "com.br", "com.mx", "com.sg", "com.hk", "com.tw",
  "org.uk", "org.au", "net.au", "ac.uk", "ac.in",
]);

/**
 * Extract the registrable (root) domain from a hostname.
 * Handles ccTLDs like .co.uk properly.
 */
function extractRootDomain(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  // Check for country-code second-level TLD
  const lastTwo = parts.slice(-2).join(".");
  if (CC_SECOND_LEVEL.has(lastTwo)) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}

/**
 * Check if a hostname belongs to a trusted domain.
 */
function isTrustedDomain(hostname: string): boolean {
  const root = extractRootDomain(hostname);
  if (TRUSTED_DOMAINS.has(root)) return true;
  // Also check if it's a subdomain of a trusted domain (e.g. careers.google.com)
  for (const trusted of TRUSTED_DOMAINS) {
    if (hostname === trusted || hostname.endsWith(`.${trusted}`)) return true;
  }
  return false;
}

// ─── WHOIS / RDAP LOOKUP ───
async function lookupDomainAge(hostname: string): Promise<{
  ageDays: number | null; createdDate: string | null;
  registrar: string | null; privacyProtected: boolean; lookupFailed: boolean;
}> {
  const result = { ageDays: null as number | null, createdDate: null as string | null, registrar: null as string | null, privacyProtected: false, lookupFailed: false };
  try {
    const domain = extractRootDomain(hostname);
    const resp = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { "Accept": "application/rdap+json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) {
      await resp.text(); // consume body
      result.lookupFailed = true;
      return result;
    }
    const data = await resp.json();
    const regEvent = (data.events || []).find((e: any) => e.eventAction === "registration");
    if (regEvent?.eventDate) {
      const created = new Date(regEvent.eventDate);
      result.createdDate = regEvent.eventDate;
      result.ageDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    }
    const registrarEntity = (data.entities || []).find((e: any) => (e.roles || []).includes("registrar"));
    if (registrarEntity?.vcardArray?.[1]) {
      const fnEntry = registrarEntity.vcardArray[1].find((v: any) => v[0] === "fn");
      if (fnEntry) result.registrar = fnEntry[3];
    }
    const remarks = JSON.stringify(data.remarks || []).toLowerCase();
    const entityNames = JSON.stringify(data.entities || []).toLowerCase();
    if (remarks.includes("privacy") || remarks.includes("proxy") || entityNames.includes("privacy") || entityNames.includes("whoisguard") || entityNames.includes("domains by proxy")) {
      result.privacyProtected = true;
    }
  } catch {
    result.lookupFailed = true;
  }
  return result;
}

// ─── REACHABILITY CHECK ───
async function checkDomainReachability(hostname: string): Promise<{
  reachable: boolean; httpsWorks: boolean; redirectsToOther: boolean;
  finalUrl: string | null; checkFailed: boolean;
}> {
  const result = { reachable: false, httpsWorks: false, redirectsToOther: false, finalUrl: null as string | null, checkFailed: false };
  try {
    const resp = await fetch(`https://${hostname}`, {
      method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(6000),
    });
    result.reachable = true;
    result.httpsWorks = true;
    result.finalUrl = resp.url;
    try {
      const finalHost = new URL(resp.url).hostname;
      const finalRoot = extractRootDomain(finalHost);
      const origRoot = extractRootDomain(hostname);
      if (finalRoot !== origRoot) result.redirectsToOther = true;
    } catch { /* ignore */ }
  } catch {
    try {
      const resp = await fetch(`http://${hostname}`, {
        method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000),
      });
      result.reachable = true;
      result.finalUrl = resp.url;
      try {
        const finalHost = new URL(resp.url).hostname;
        const finalRoot = extractRootDomain(finalHost);
        const origRoot = extractRootDomain(hostname);
        if (finalRoot !== origRoot) result.redirectsToOther = true;
      } catch { /* ignore */ }
    } catch {
      result.checkFailed = true;
    }
  }
  return result;
}

// ─── URL FEATURE EXTRACTION ───
async function extractUrlFeatures(url: string): Promise<{ features: string; trusted: boolean; hostname: string }> {
  const features: string[] = [];
  let trusted = false;
  let hostname = "";

  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    hostname = parsed.hostname;
    const fullUrl = parsed.href;
    const rootDomain = extractRootDomain(hostname);
    trusted = isTrustedDomain(hostname);

    // ── Whitelist check (first!) ──
    if (trusted) {
      features.push(`TRUSTED DOMAIN: ${rootDomain} is a verified well-known domain (SAFE)`);
      features.push(`WHITELIST STATUS: WHITELISTED — this domain is on the Sentrix trusted list`);
    }

    // URL structural analysis (objective, no risk labels for neutral features)
    features.push(`URL length: ${fullUrl.length} characters`);

    const specialChars = (fullUrl.match(/[@!#$%^&*()=+\[\]{}|\\;:'",<>?]/g) || []).length;
    if (specialChars > 5) features.push(`Special characters: ${specialChars} (elevated — unusual for standard URLs)`);

    // Suspicious keywords IN the domain name itself (not the path)
    const domainKeywords = ["login", "secure", "account", "verify", "update", "confirm", "banking", "signin", "support", "helpdesk", "recover", "unlock"];
    const foundDomainKw = domainKeywords.filter(kw => hostname.toLowerCase().includes(kw));
    if (foundDomainKw.length > 0 && !trusted) {
      features.push(`DOMAIN KEYWORDS: Domain contains words often seen in phishing: ${foundDomainKw.join(", ")}`);
    }

    // Homograph / leet-speak detection
    const leetSpeak = hostname.match(/[0o][0o]gl|f[a4]c[e3]b[o0][o0]k|l[i1]nk[e3]d|m[i1]cr[o0]s[o0]ft|[a4]m[a4]z[o0]n|p[a4]yp[a4]l/i);
    if (leetSpeak && !trusted) {
      features.push(`HOMOGRAPH ATTACK: Domain uses character substitution to mimic a known brand (CRITICAL)`);
    }

    // Domain length
    const domainWithoutTld = hostname.split(".").slice(0, -1).join(".");
    if (domainWithoutTld.length > 30 && !trusted) {
      features.push(`DOMAIN LENGTH: ${domainWithoutTld.length} chars (unusually long)`);
    }

    // Hyphens
    const hyphenCount = (hostname.match(/-/g) || []).length;
    if (hyphenCount >= 3 && !trusted) features.push(`HYPHENS: ${hyphenCount} hyphens in domain`);

    // Subdomain depth
    const subdomainDepth = hostname.split(".").length - 2;
    if (subdomainDepth > 2 && !trusted) features.push(`Subdomain depth: ${subdomainDepth} levels (deep)`);

    // IP-based URL
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      features.push("HOST TYPE: IP address instead of domain name");
    }

    // Protocol
    features.push(parsed.protocol === "https:" ? "PROTOCOL: HTTPS present" : "PROTOCOL: HTTP only, no encryption");

    // Typosquatting — FIXED: only flag if it's NOT the real brand domain
    const knownBrands = ["google", "facebook", "linkedin", "indeed", "glassdoor", "microsoft", "apple", "amazon", "paypal", "netflix"];
    if (!trusted) {
      for (const brand of knownBrands) {
        if (hostname.includes(brand) && rootDomain !== `${brand}.com` && !rootDomain.startsWith(`${brand}.`)) {
          features.push(`TYPOSQUATTING RISK: Domain contains "${brand}" but is NOT the official ${brand}.com domain`);
        }
      }
    }

    // Suspicious TLDs
    const suspiciousTlds = [".xyz", ".top", ".club", ".work", ".click", ".loan", ".download", ".stream", ".gq", ".ml", ".cf", ".tk", ".ga", ".buzz", ".icu", ".biz", ".cc", ".pw", ".ws"];
    const tld = "." + hostname.split(".").slice(-1)[0];
    if (suspiciousTlds.includes(tld) && !trusted) {
      features.push(`TLD: ${tld} (commonly associated with spam/scam sites)`);
    }

    // Path depth
    if (parsed.pathname.split("/").length > 6) features.push("URL PATH: Deeply nested path structure");

    // Query params
    if ([...parsed.searchParams.keys()].length > 5) features.push("URL PARAMS: Many query parameters");

    // Redirect indicators in URL
    if (/redirect|url=|goto=|next=/i.test(fullUrl)) {
      features.push("REDIRECT PARAMS: URL contains redirect parameters");
    }

    // ═══ LIVE CHECKS (parallel) ═══
    const [whois, reachability] = await Promise.all([
      lookupDomainAge(hostname),
      checkDomainReachability(hostname),
    ]);

    // Domain age
    if (whois.lookupFailed) {
      features.push("DOMAIN AGE: Unknown (WHOIS lookup unavailable — do NOT penalize heavily)");
    } else if (whois.ageDays !== null) {
      if (whois.ageDays < 30) {
        features.push(`DOMAIN AGE: ${whois.ageDays} days old, registered ${whois.createdDate} (very new domain)`);
      } else if (whois.ageDays < 180) {
        features.push(`DOMAIN AGE: ${whois.ageDays} days old, registered ${whois.createdDate} (recently registered)`);
      } else if (whois.ageDays < 365) {
        features.push(`DOMAIN AGE: ${whois.ageDays} days old, registered ${whois.createdDate} (under 1 year)`);
      } else {
        const years = Math.floor(whois.ageDays / 365);
        features.push(`DOMAIN AGE: ${years}+ years old, registered ${whois.createdDate} (established domain)`);
      }
    } else {
      features.push("DOMAIN AGE: Could not determine from WHOIS (inconclusive — treat as Unknown)");
    }

    if (whois.registrar) features.push(`REGISTRAR: ${whois.registrar}`);
    if (whois.privacyProtected && !trusted) features.push("WHOIS PRIVACY: Registration is privacy-protected");

    // Reachability & SSL
    if (reachability.checkFailed) {
      features.push("REACHABILITY: Check failed (network error — do NOT assume malicious)");
    } else if (!reachability.reachable) {
      features.push("REACHABILITY: Website is not responding");
    } else {
      features.push(reachability.httpsWorks
        ? "SSL CHECK: HTTPS connection successful (valid SSL certificate)"
        : "SSL CHECK: HTTPS failed, only HTTP works (no valid SSL certificate)");
      if (reachability.redirectsToOther) {
        features.push(`REDIRECT: Site redirects to a different domain (${reachability.finalUrl})`);
      }
    }

  } catch {
    features.push("URL PARSE ERROR: Could not parse URL structure");
  }

  return { features: features.join("\n"), trusted, hostname };
}

// ─── TEXT FEATURE EXTRACTION ───
function extractTextFeatures(text: string): string {
  const features: string[] = [];
  const lowerText = text.toLowerCase();

  const urgencyPhrases = ["act now", "immediately", "urgent", "asap", "right away", "don't delay", "limited time", "deadline", "expires", "last chance", "hurry", "time sensitive", "respond immediately", "within 24 hours", "today only"];
  const foundUrgency = urgencyPhrases.filter(p => lowerText.includes(p));
  if (foundUrgency.length > 0) features.push(`URGENCY LANGUAGE (${foundUrgency.length}): ${foundUrgency.join(", ")}`);

  const paymentPhrases = ["registration fee", "processing fee", "advance payment", "pay first", "wire transfer", "western union", "money order", "gift card", "cryptocurrency", "bitcoin", "send money", "bank transfer", "upfront payment", "training fee", "equipment fee", "background check fee", "application fee"];
  const foundPayment = paymentPhrases.filter(p => lowerText.includes(p));
  if (foundPayment.length > 0) features.push(`PAYMENT REQUESTS (${foundPayment.length}): ${foundPayment.join(", ")}`);

  const salaryMatches = text.match(/\$[\d,]+(?:\s*(?:per|\/)\s*(?:hour|hr|day|week|month))?/gi) || [];
  if (salaryMatches.length > 0) features.push(`SALARY MENTIONS: ${salaryMatches.join(", ")}`);

  const earningClaims = text.match(/earn\s+\$?[\d,]+\+?\s*(?:per|\/|a)?\s*(?:hour|day|week|month|year)?/gi) || [];
  if (earningClaims.length > 0) features.push(`EARNING CLAIMS: ${earningClaims.join(", ")}`);

  const grammarIssues: string[] = [];
  if ((text.match(/!{2,}/g) || []).length > 2) grammarIssues.push("excessive exclamation marks");
  if ((text.match(/\b[A-Z]{4,}\b/g) || []).length > 3) grammarIssues.push("excessive capitalization");
  if ((text.match(/\.{3,}/g) || []).length > 2) grammarIssues.push("excessive ellipses");
  if (grammarIssues.length > 0) features.push(`GRAMMAR ANOMALIES: ${grammarIssues.join(", ")}`);

  const authorityPhrases = ["government", "official", "certified", "authorized", "verified company", "registered business", "license number", "compliance", "federal", "ministry"];
  const foundAuthority = authorityPhrases.filter(p => lowerText.includes(p));
  if (foundAuthority.length > 0) features.push(`AUTHORITY CLAIMS: ${foundAuthority.join(", ")}`);

  const personalInfoPhrases = ["social security", "ssn", "bank account", "routing number", "credit card", "passport", "driver's license", "date of birth", "mother's maiden", "national id"];
  const foundPersonal = personalInfoPhrases.filter(p => lowerText.includes(p));
  if (foundPersonal.length > 0) features.push(`PERSONAL INFO REQUESTS: ${foundPersonal.join(", ")}`);

  const vagueTerms = ["easy work", "no experience", "no skills required", "anyone can do", "work from home", "be your own boss", "unlimited earning", "flexible hours", "simple tasks"];
  const foundVague = vagueTerms.filter(p => lowerText.includes(p));
  if (foundVague.length > 0) features.push(`VAGUE DESCRIPTIONS: ${foundVague.join(", ")}`);

  const contactFlags = ["whatsapp", "telegram"];
  const foundContact = contactFlags.filter(p => lowerText.includes(p));
  if (foundContact.length > 0) features.push(`INFORMAL CONTACT: ${foundContact.join(", ")}`);

  features.push(`Text length: ${text.length} chars, ${text.split(/\s+/).length} words`);
  return features.join("\n");
}

// ─── RECRUITER FEATURE EXTRACTION ───
function extractRecruiterFeatures(content: string): string {
  const features: string[] = [];
  const lowerContent = content.toLowerCase();

  const emailMatch = content.match(/[\w.-]+@([\w.-]+\.\w+)/i);
  if (emailMatch) {
    const domain = emailMatch[1].toLowerCase();
    const freeEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "mail.com", "protonmail.com", "icloud.com", "yandex.com", "zoho.com"];
    features.push(freeEmailDomains.includes(domain)
      ? `EMAIL DOMAIN: ${domain} (free email provider — recruiters typically use corporate email)`
      : `EMAIL DOMAIN: ${domain} (corporate domain)`);
  }

  const linkedinMatch = content.match(/linkedin\.com\/in\/([\w-]+)/i);
  if (linkedinMatch) {
    features.push(`LINKEDIN: Profile provided (${linkedinMatch[0]})`);
  } else if (lowerContent.includes("not provided") || !lowerContent.includes("linkedin")) {
    features.push("LINKEDIN: No profile provided");
  }

  return features.join("\n");
}

// ─── SYSTEM PROMPT ───
const systemPrompt = `You are an advanced cybersecurity threat analyst specializing in employment fraud detection, phishing analysis, and social engineering attack identification.

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code blocks, no text outside the JSON object.
2. Every analysis must be unique and specific to the actual input content.
3. Base your scamScore on CUMULATIVE WEIGHTED EVIDENCE, not gut feeling.
4. **If a domain is marked WHITELISTED/TRUSTED in the features, the scamScore MUST be 0-10 and riskLevel MUST be "Low" unless the URL path itself contains clear phishing indicators.**
5. **If data is marked "Unknown" or a check failed, do NOT treat it as a risk signal. Mark the corresponding featureBreakdown value as null and reduce confidenceLevel.**
6. A SINGLE weak indicator must NEVER produce a score above 25. Require 3+ converging signals for High/Critical.

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
  "reasons": ["<specific evidence-based reason 1>", "<reason 2>"],
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>"],
  "scamType": "<specific scam type or 'None detected'>",
  "confidenceLevel": <0-100>,
  "featureBreakdown": {
    "urlRisk": <0-100 or null if not applicable>,
    "contentRisk": <0-100 or null>,
    "domainRisk": <0-100 or null>,
    "sslRisk": <0-100 or null>,
    "nlpRisk": <0-100 or null>
  }
}

WEIGHTED SCORING MODEL (use these weights):
  Domain Trust (30%):
    - Whitelisted/trusted domain → 0 points
    - Domain age > 1 year → 0 pts | 180-365 days → 5 pts | 30-180 days → 15 pts | <30 days → 30 pts
    - WHOIS unknown → 0 pts (do NOT penalize missing data)
    - Privacy-protected WHOIS → 3 pts
    - Suspicious TLD → 10 pts
    - Typosquatting/homograph → 25 pts
  
  Content/NLP Analysis (40%):
    - Payment/fee requests → 30 pts
    - Personal info requests → 25 pts
    - Urgency language (3+ phrases) → 15 pts, (1-2 phrases) → 5 pts
    - Unrealistic salary → 15 pts
    - Vague job description → 10 pts
    - Authority impersonation → 10 pts
    - Grammar anomalies → 5 pts
  
  Technical/Threat Intelligence (30%):
    - SSL failed → 15 pts
    - SSL unknown/check failed → 0 pts (do NOT penalize)
    - Unreachable site → 10 pts
    - Redirects to different domain → 15 pts
    - IP-based host → 10 pts
    - Suspicious URL keywords in domain → 10 pts
    - Excessive hyphens/subdomains → 5 pts

RISK LEVEL THRESHOLDS:
  0-20: Low | 21-50: Medium | 51-75: High | 76-100: Critical

FALSE POSITIVE PREVENTION:
  - Well-known domains (google.com, linkedin.com, indeed.com, etc.) MUST score Low.
  - Legitimate companies CAN have long URLs, subdomains, job-related path keywords. Don't flag these.
  - If only 1 weak signal exists, score ≤ 15. Confidence should be low (30-50).
  - If 2 moderate signals exist, score 20-40. Confidence 50-70.
  - If 3+ strong signals converge, score 50+. Confidence 70-95.

CONFIDENCE CALIBRATION:
  - Sparse input with few signals → 30-50%
  - Moderate evidence → 50-75%
  - Rich, multi-signal evidence → 75-95%
  - Whitelisted domain → 95% confidence at Low risk

CRITICAL — EXPLANATIONS FOR SAFE/LOW-RISK RESULTS:
  You MUST ALWAYS provide detailed, rich explanations — even when the result is SAFE/Low Risk.
  For trusted/safe websites, the "detailedExplanation" MUST explain WHY the site is safe. Include:
    - Domain trust status (e.g. "well-established domain with X+ years of registration")
    - SSL/HTTPS status (e.g. "valid SSL certificate present, connection is encrypted")
    - Blacklist check result (e.g. "no blacklist records found")
    - Content authenticity (e.g. "content matches official business purpose")
    - Company reputation summary
  For trusted domains, "reasons" should contain POSITIVE findings prefixed with context, e.g.:
    - "Domain is on the Sentrix trusted whitelist"
    - "Well-established domain registered for 20+ years"
    - "Valid HTTPS/SSL certificate verified"
    - "No blacklist or threat intelligence matches"
    - "Content aligns with legitimate corporate operations"
  The "summary" for safe sites should clearly state: "This is a legitimate and trusted website." followed by key positive signals.
  The "recommendations" for safe sites should be helpful (e.g. "This website is safe to use", "You can proceed with confidence").
  NEVER return a bare or minimal explanation for safe sites. Judges/users need to see WHY it is safe.

SCAM TYPE CLASSIFICATIONS:
  Advance Fee Fraud | Phishing | Fake Recruiter | Money Mule | Equipment Scam | Overpayment Scam | Pyramid/MLM | Data Harvesting | None detected`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let preAnalysis = "";
    let userPrompt = "";
    let isTrusted = false;

    switch (type) {
      case "message": {
        preAnalysis = extractTextFeatures(content);
        userPrompt = `Analyze this job-related message for scam indicators.\n\nPRE-EXTRACTED FEATURES:\n${preAnalysis}\n\nORIGINAL MESSAGE:\n"${content}"\n\nApply weighted scoring. Cross-reference multiple indicators. Be specific about which phrases triggered each risk factor.`;
        break;
      }
      case "url": {
        const urlResult = await extractUrlFeatures(content);
        preAnalysis = urlResult.features;
        isTrusted = urlResult.trusted;
        userPrompt = `Analyze this URL for legitimacy as a job posting or recruitment site.\n\nPRE-EXTRACTED URL FEATURES (includes LIVE WHOIS, SSL, reachability results):\n${preAnalysis}\n\nURL: ${content}\n\n${isTrusted ? "IMPORTANT: This domain is WHITELISTED as a trusted domain. Score MUST be 0-10 with riskLevel 'Low' unless the URL path contains explicit phishing content.\n\n" : ""}Apply the weighted scoring model. Unknown/failed checks should NOT increase the score — mark them null in featureBreakdown and lower confidenceLevel instead.`;
        break;
      }
      case "recruiter": {
        const recruiterFeatures = extractRecruiterFeatures(content);
        const textFeatures = extractTextFeatures(content);
        preAnalysis = `${recruiterFeatures}\n${textFeatures}`;
        userPrompt = `Verify this recruiter's legitimacy.\n\nPRE-EXTRACTED FEATURES:\n${preAnalysis}\n\nRECRUITER INFORMATION:\n${content}\n\nApply weighted evidence-based scoring. scamScore = RISK (0=safe, 100=scam).`;
        break;
      }
      case "offer_letter": {
        preAnalysis = extractTextFeatures(content);
        userPrompt = `Analyze this offer letter for scam indicators.\n\nPRE-EXTRACTED TEXT FEATURES:\n${preAnalysis}\n\nOFFER LETTER CONTENT:\n"${content}"\n\nApply weighted scoring. Payment requests are CRITICAL. Missing company details are MEDIUM risk.`;
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
        temperature: 0.2,
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

    let cleaned = rawContent.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let analysis;
    try {
      analysis = JSON.parse(cleaned);

      // ── POST-PROCESSING ──

      // Clamp scores
      analysis.scamScore = Math.max(0, Math.min(100, Math.round(analysis.scamScore || 0)));

      // ★ WHITELIST OVERRIDE: Force low score for trusted domains
      if (isTrusted) {
        analysis.scamScore = Math.min(analysis.scamScore, 10);
        analysis.riskLevel = "Low";
        analysis.confidenceLevel = Math.max(analysis.confidenceLevel || 90, 90);
        if (!analysis.reasons.some((r: string) => /trusted|whitelist/i.test(r))) {
          analysis.reasons.unshift("Domain is on the Sentrix trusted whitelist");
        }
      }

      // Enforce risk level matches score thresholds
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

      // Ensure arrays
      if (!Array.isArray(analysis.suspiciousPhrases)) analysis.suspiciousPhrases = [];
      if (!Array.isArray(analysis.reasons)) analysis.reasons = [];
      if (!Array.isArray(analysis.recommendations)) analysis.recommendations = [];

      // Ensure confidence
      analysis.confidenceLevel = Math.max(0, Math.min(100, Math.round(analysis.confidenceLevel || 50)));

      // Ensure featureBreakdown
      if (!analysis.featureBreakdown) {
        analysis.featureBreakdown = { urlRisk: null, contentRisk: null, domainRisk: null, sslRisk: null, nlpRisk: null };
      }

    } catch {
      analysis = {
        scamScore: isTrusted ? 5 : 50,
        riskLevel: isTrusted ? "Low" : "Medium",
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
