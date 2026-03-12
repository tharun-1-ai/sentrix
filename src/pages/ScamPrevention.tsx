import { ShieldAlert, AlertTriangle, Brain, BookOpen, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ScamPrevention() {
  const { t } = useLanguage();
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const scamTypes = [
    { title: t("advanceFeeScan"), desc: t("advanceFeeDesc") },
    { title: t("fakeCheckScam"), desc: t("fakeCheckDesc") },
    { title: t("phishingScam"), desc: t("phishingDesc") },
    { title: t("reshippingScam"), desc: t("reshippingDesc") },
    { title: t("dataEntryScam"), desc: t("dataEntryDesc") },
    { title: t("interviewImpersonation"), desc: t("interviewImpersonationDesc") },
  ];

  const manipulationTactics = [
    { icon: "⏰", title: t("urgencyTrap"), desc: t("urgencyTrapDesc"), signs: [t("unreasonableDeadlines"), t("pressureSkipDueDiligence"), t("limitedTimeOffers"), t("immediateResponseDemanded")] },
    { icon: "💰", title: t("greedTriggerTitle"), desc: t("greedTriggerDesc"), signs: [t("salaryAboveMarket"), t("getRichQuick"), t("minimalQualifications"), t("noExperienceHighPay")] },
    { icon: "😨", title: t("fearTactic"), desc: t("fearTacticDesc"), signs: [t("threatsLosingOpportunity"), t("negativeConsequences"), t("intimidationLanguage"), t("penaltyWarnings")] },
    { icon: "👔", title: t("authorityImpersonationTitle"), desc: t("authorityImpersonationDesc"), signs: [t("claimsMajorCorp"), t("govImpersonation"), t("officialTitles"), t("fakeWebsites")] },
  ];

  const quizQuestions = [
    { q: t("quiz1Q"), options: [t("quiz1A"), t("quiz1B"), t("quiz1C"), t("quiz1D")], correct: 1 },
    { q: t("quiz2Q"), options: [t("quiz2A"), t("quiz2B"), t("quiz2C"), t("quiz2D")], correct: 1 },
    { q: t("quiz3Q"), options: [t("quiz3A"), t("quiz3B"), t("quiz3C"), t("quiz3D")], correct: 2 },
    { q: t("quiz4Q"), options: [t("quiz4A"), t("quiz4B"), t("quiz4C"), t("quiz4D")], correct: 1 },
  ];

  const checklist = [t("checklist1"), t("checklist2"), t("checklist3"), t("checklist4"), t("checklist5"), t("checklist6"), t("checklist7"), t("checklist8")];

  const handleAnswer = (idx: number) => {
    const newAnswers = [...quizAnswers, idx];
    setQuizAnswers(newAnswers);
    if (quizIdx < quizQuestions.length - 1) {
      setQuizIdx(quizIdx + 1);
    } else {
      setShowResult(true);
    }
  };

  const correctCount = quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <ShieldAlert className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("scamPreventionHubTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("scamPreventionHubDesc")}</p>
      </div>

      <section>
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" /> {t("commonJobScamTypes")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {scamTypes.map(s => (
            <div key={s.title} className="cyber-card p-4">
              <h3 className="font-bold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" /> {t("psychManipulationAwareness")}
        </h2>
        <div className="space-y-4">
          {manipulationTactics.map(tc => (
            <div key={tc.title} className="cyber-card p-5">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <span className="text-xl">{tc.icon}</span> {tc.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{tc.desc}</p>
              <div className="flex flex-wrap gap-2">
                {tc.signs.map(s => (
                  <span key={s} className="text-xs bg-warning/10 text-warning px-2 py-1 rounded border border-warning/20 font-medium">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> {t("scamAwarenessQuiz")}
        </h2>
        <div className="cyber-card p-5">
          {showResult ? (
            <div className="text-center py-4">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-success" style={{ filter: "drop-shadow(0 0 10px hsl(156 100% 49% / 0.4))" }} />
              <p className="text-xl font-display font-bold">{correctCount}/{quizQuestions.length} {t("correct")}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {correctCount === quizQuestions.length ? t("perfectScore") : t("reviewGuides")}
              </p>
              <button onClick={() => { setQuizIdx(0); setQuizAnswers([]); setShowResult(false); }}
                className="mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_15px_hsl(185_100%_50%/0.3)] transition-all">
                {t("retakeQuiz")}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-mono">{t("question")} {quizIdx + 1} {t("of")} {quizQuestions.length}</p>
              <p className="font-bold mb-4">{quizQuestions[quizIdx].q}</p>
              <div className="space-y-2">
                {quizQuestions[quizIdx].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className="w-full text-left bg-secondary/50 hover:bg-primary/10 hover:neon-border rounded-md px-4 py-2.5 text-sm transition-all border border-transparent font-medium">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-display font-bold mb-4">📋 {t("safetyChecklist")}</h2>
        <div className="cyber-card p-5">
          <ul className="space-y-2 text-sm">
            {checklist.map(item => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-muted-foreground font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
