import { AnalysisResult } from "@/hooks/useScamAnalysis";
import { useLanguage } from "@/i18n/LanguageContext";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 140 }: ScoreRingProps) {
  const { t } = useLanguage();
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score < 30 ? "hsl(var(--success))" : score < 70 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const glowColor = score < 30 ? "hsl(156 100% 49% / 0.3)" : score < 70 ? "hsl(38 92% 50% / 0.3)" : "hsl(0 80% 60% / 0.3)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size, filter: `drop-shadow(0 0 12px ${glowColor})` }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} className="score-ring" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-display font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-muted-foreground font-medium">{t("risk")}</span>
      </div>
    </div>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const { t } = useLanguage();
  const cls = level === "Low"
    ? "bg-success/10 text-success border-success/20"
    : level === "Medium"
    ? "bg-warning/10 text-warning border-warning/20"
    : "bg-destructive/10 text-destructive border-destructive/20";
  return <span className={`px-3 py-1 rounded-full text-sm font-bold border ${cls}`}>{level} {t("riskSuffix")}</span>;
}

export function ManipulationBar({ label, value }: { label: string; value: number }) {
  const color = value < 30 ? "bg-success" : value < 70 ? "bg-warning" : "bg-destructive";
  const glowColor = value < 30 ? "shadow-[0_0_8px_hsl(156_100%_49%/0.3)]" : value < 70 ? "shadow-[0_0_8px_hsl(38_92%_50%/0.3)]" : "shadow-[0_0_8px_hsl(0_80%_60%/0.3)]";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-display font-bold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color} ${glowColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function AnalysisResultCard({ result }: { result: AnalysisResult }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-6 flex-wrap">
        <ScoreRing score={result.scamScore} />
        <div className="space-y-2">
          <RiskBadge level={result.riskLevel} />
          <p className="text-sm text-muted-foreground max-w-md font-medium">{result.summary}</p>
          {result.scamType && result.scamType !== "None detected" && (
            <p className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded inline-block border neon-border">Type: {result.scamType}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="cyber-card p-4 space-y-3">
          <h4 className="font-display font-bold text-sm">{t("psychManipulation")}</h4>
          <ManipulationBar label={t("urgency")} value={result.manipulationIndicators.urgencyLevel} />
          <ManipulationBar label={t("fear")} value={result.manipulationIndicators.fearLevel} />
          <ManipulationBar label={t("greedTrigger")} value={result.manipulationIndicators.greedTrigger} />
          <ManipulationBar label={t("authorityImpersonation")} value={result.manipulationIndicators.authorityImpersonation} />
        </div>

        <div className="space-y-4">
          {result.suspiciousPhrases.length > 0 && (
            <div className="cyber-card p-4">
              <h4 className="font-display font-bold text-sm mb-2">{t("suspiciousPhrases")}</h4>
              <div className="flex flex-wrap gap-2">
                {result.suspiciousPhrases.map((p, i) => (
                  <span key={i} className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded font-mono border border-destructive/20">"{p}"</span>
                ))}
              </div>
            </div>
          )}
          {result.reasons.length > 0 && (
            <div className="cyber-card p-4">
              <h4 className="font-display font-bold text-sm mb-2">{t("keyFindings")}</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {result.reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-warning">•</span>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="cyber-card p-4">
        <h4 className="font-display font-bold text-sm mb-2">{t("detailedAnalysis")}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.detailedExplanation}</p>
      </div>

      {result.recommendations.length > 0 && (
        <div className="cyber-card p-4" style={{ borderColor: "hsl(185 100% 50% / 0.2)" }}>
          <h4 className="font-display font-bold text-sm mb-2 text-primary">{t("recommendations")}</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {result.recommendations.map((r, i) => <li key={i} className="flex gap-2"><span className="text-primary">→</span>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
