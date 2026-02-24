import { useState } from "react";
import { useScamAnalysis } from "@/hooks/useScamAnalysis";
import { AnalysisResultCard } from "@/components/AnalysisResult";
import { UserSearch, Loader2 } from "lucide-react";
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserSearch className="h-6 w-6 text-primary" /> {t("recruiterVerificationTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("recruiterVerificationDesc")}</p>
      </div>

      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">{t("recruiterName")}</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith"
            className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">{t("emailAddress")}</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="recruiter@company.com" type="email"
            className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">{t("linkedinUrl")}</label>
          <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username"
            className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button onClick={handleVerify} disabled={loading || !name.trim() || !email.trim()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("verifying")}</> : t("verifyRecruiter")}
        </button>
      </div>

      {result && <AnalysisResultCard result={result} />}
    </div>
  );
}
