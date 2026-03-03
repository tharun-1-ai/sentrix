import { useState } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { UserSearch, Loader2, Scan } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function RecruiterVerification() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const { analyze, loading, result } = useScamAnalysis();
  const { t } = useLanguage();

  const handleVerify = () => {
    if (!name.trim() || !email.trim()) return;
    const content = `Recruiter Name: ${name}\nEmail: ${email}\nLinkedIn: ${linkedin || "Not provided"}`;
    analyze("recruiter", content);
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <UserSearch className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("recruiterVerificationTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("recruiterVerificationDesc")}</p>
      </div>

      <div className="cyber-card p-5 space-y-4">
        <div>
          <label className="text-sm font-bold block mb-1.5">{t("recruiterName")}</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-bold block mb-1.5">{t("emailAddress")}</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="recruiter@company.com" type="email" className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-bold block mb-1.5">{t("linkedinUrl")}</label>
          <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" className={inputClass} />
        </div>
        <button onClick={handleVerify} disabled={loading || !name.trim() || !email.trim()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] disabled:opacity-50 transition-all">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("verifying")}</> : <><Scan className="h-4 w-4" /> {t("verifyRecruiter")}</>}
        </button>
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
