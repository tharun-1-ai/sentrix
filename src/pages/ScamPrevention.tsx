import { ShieldAlert, AlertTriangle, Brain, BookOpen, CheckCircle } from "lucide-react";
import { useState } from "react";

const scamTypes = [
  { title: "Advance Fee Scam", desc: "Scammer asks for upfront payment for 'training materials', 'equipment', or 'registration fees'. Legitimate employers never charge candidates." },
  { title: "Fake Check Scam", desc: "You receive a check to buy supplies but must send back the 'extra' amount. The check bounces, and you lose your money." },
  { title: "Phishing Scam", desc: "Emails mimicking real companies asking for personal information, SSN, bank details, or login credentials." },
  { title: "Reshipping Scam", desc: "You're asked to receive packages and reship them elsewhere. These are often purchased with stolen credit cards." },
  { title: "Data Entry Scam", desc: "Promise of easy money for data entry work, but requires purchasing software or paying a membership fee." },
  { title: "Interview Impersonation", desc: "Scammers impersonate real company HR staff using similar email domains or messaging platforms." },
];

const manipulationTactics = [
  {
    icon: "⏰", title: "Urgency Trap",
    desc: "Creating artificial time pressure: 'This position must be filled today!' or 'Respond within 1 hour or lose the opportunity.'",
    signs: ["Unreasonable deadlines", "Pressure to skip due diligence", "Limited-time offers", "Immediate response demanded"],
  },
  {
    icon: "💰", title: "Greed Trigger",
    desc: "Offering unrealistically high salaries or benefits to cloud judgment: '$5000/week for part-time work!' or 'Earn $200/hour from home.'",
    signs: ["Salary far above market rate", "Get rich quick promises", "Minimal qualifications needed", "No experience required for high pay"],
  },
  {
    icon: "😨", title: "Fear Tactic",
    desc: "Using threats or consequences: 'Your application will be cancelled' or 'You will lose this opportunity forever if you don't act now.'",
    signs: ["Threats of losing the opportunity", "Negative consequences for delay", "Intimidation language", "Penalty warnings"],
  },
  {
    icon: "👔", title: "Authority Impersonation",
    desc: "Pretending to be from a well-known company or government agency to gain trust.",
    signs: ["Claims from major corporations", "Government agency impersonation", "Use of official-sounding titles", "Fake company websites"],
  },
];

const quizQuestions = [
  { q: "A recruiter emails you from a Gmail address claiming to be from Google. What should you do?", options: ["Reply immediately", "Verify via official company channels", "Send your resume", "Ignore it"], correct: 1 },
  { q: "A job posting offers $150/hour for basic data entry with no experience needed. This is likely:", options: ["A great opportunity", "A scam using greed triggers", "A normal posting", "Worth investigating"], correct: 1 },
  { q: "An employer asks you to pay $200 for 'training materials' before starting. You should:", options: ["Pay immediately", "Ask for a discount", "Refuse — legitimate employers don't charge fees", "Negotiate the price"], correct: 2 },
  { q: "You receive a job offer after a text-only interview with no video call. This is:", options: ["Normal modern hiring", "Suspicious — always verify identity", "A sign of efficiency", "Perfectly fine"], correct: 1 },
];

export default function ScamPrevention() {
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" /> Scam Prevention Hub
        </h1>
        <p className="text-sm text-muted-foreground">Learn to identify and protect yourself from job scams.</p>
      </div>

      {/* Scam Types */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" /> Common Job Scam Types
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {scamTypes.map(s => (
            <div key={s.title} className="bg-card rounded-lg border p-4">
              <h3 className="font-medium text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manipulation Tactics */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" /> Psychological Manipulation Awareness
        </h2>
        <div className="space-y-4">
          {manipulationTactics.map(t => (
            <div key={t.title} className="bg-card rounded-lg border p-5">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <span className="text-xl">{t.icon}</span> {t.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{t.desc}</p>
              <div className="flex flex-wrap gap-2">
                {t.signs.map(s => (
                  <span key={s} className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" /> Scam Awareness Quiz
        </h2>
        <div className="bg-card rounded-lg border p-5">
          {showResult ? (
            <div className="text-center py-4">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-success" />
              <p className="text-xl font-bold">{correctCount}/{quizQuestions.length} Correct</p>
              <p className="text-sm text-muted-foreground mt-1">
                {correctCount === quizQuestions.length ? "Perfect score! You're well-prepared." : "Review the prevention guides above to improve your awareness."}
              </p>
              <button onClick={() => { setQuizIdx(0); setQuizAnswers([]); setShowResult(false); }}
                className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90">
                Retake Quiz
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Question {quizIdx + 1} of {quizQuestions.length}</p>
              <p className="font-medium mb-4">{quizQuestions[quizIdx].q}</p>
              <div className="space-y-2">
                {quizQuestions[quizIdx].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className="w-full text-left bg-muted hover:bg-primary/10 rounded-md px-4 py-2.5 text-sm transition-colors">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Safety Checklist */}
      <section>
        <h2 className="text-lg font-semibold mb-4">📋 Safety Checklist</h2>
        <div className="bg-card rounded-lg border p-5">
          <ul className="space-y-2 text-sm">
            {[
              "Never pay upfront fees for a job opportunity",
              "Verify the company through official channels",
              "Check the recruiter's email domain matches the company",
              "Be wary of text-only interviews with no video call",
              "Research the company on LinkedIn and Glassdoor",
              "Don't share SSN, bank info, or passwords during hiring",
              "Beware of jobs with unrealistically high pay",
              "Trust your instincts — if it feels wrong, it probably is",
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
