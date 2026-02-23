import { AnalysisResult } from "@/hooks/useScamAnalysis";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 140 }: ScoreRingProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score < 30 ? "hsl(var(--success))" : score < 70 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="score-ring"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-muted-foreground">Risk</span>
      </div>
    </div>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const cls = level === "Low" ? "bg-success/10 text-success" : level === "Medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{level} Risk</span>;
}

export function ManipulationBar({ label, value }: { label: string; value: number }) {
  const color = value < 30 ? "bg-success" : value < 70 ? "bg-warning" : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function AnalysisResultCard({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-6 flex-wrap">
        <ScoreRing score={result.scamScore} />
        <div className="space-y-2">
          <RiskBadge level={result.riskLevel} />
          <p className="text-sm text-muted-foreground max-w-md">{result.summary}</p>
          {result.scamType && result.scamType !== "None detected" && (
            <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">Type: {result.scamType}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-4 space-y-3">
          <h4 className="font-semibold text-sm">Psychological Manipulation</h4>
          <ManipulationBar label="Urgency" value={result.manipulationIndicators.urgencyLevel} />
          <ManipulationBar label="Fear" value={result.manipulationIndicators.fearLevel} />
          <ManipulationBar label="Greed Trigger" value={result.manipulationIndicators.greedTrigger} />
          <ManipulationBar label="Authority Impersonation" value={result.manipulationIndicators.authorityImpersonation} />
        </div>

        <div className="space-y-4">
          {result.suspiciousPhrases.length > 0 && (
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-2">Suspicious Phrases</h4>
              <div className="flex flex-wrap gap-2">
                {result.suspiciousPhrases.map((p, i) => (
                  <span key={i} className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded font-mono">"{p}"</span>
                ))}
              </div>
            </div>
          )}
          {result.reasons.length > 0 && (
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-2">Key Findings</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {result.reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-warning">•</span>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h4 className="font-semibold text-sm mb-2">Detailed Analysis</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.detailedExplanation}</p>
      </div>

      {result.recommendations.length > 0 && (
        <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
          <h4 className="font-semibold text-sm mb-2 text-primary">Recommendations</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {result.recommendations.map((r, i) => <li key={i} className="flex gap-2"><span className="text-primary">→</span>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
