import { useState } from "react";
import { Info, Brain, Globe, Shield, Cpu, Search, FileText, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const technologies = [
    { icon: Brain, label: t("aboutTechAI") },
    { icon: Cpu, label: t("aboutTechML") },
    { icon: FileText, label: t("aboutTechNLP") },
    { icon: Search, label: t("aboutTechURL") },
    { icon: Globe, label: t("aboutTechWeb") },
    { icon: Shield, label: t("aboutTechSecurity") },
  ];

  return (
    <div className="cyber-card p-5 space-y-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.4))" }} />
          <div className="text-left">
            <p className="font-display font-bold text-sm">{t("aboutTitle")}</p>
            <p className="text-xs text-muted-foreground font-medium">{t("aboutSubtitle")}</p>
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 pt-3 border-t border-border animate-fade-in">
          <div>
            <h4 className="font-display font-bold text-xs text-primary mb-2">{t("aboutWhatIs")}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("aboutWhatIsDesc")}</p>
          </div>

          <div>
            <h4 className="font-display font-bold text-xs text-primary mb-2">{t("aboutMission")}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("aboutMissionDesc")}</p>
          </div>

          <div>
            <h4 className="font-display font-bold text-xs text-primary mb-3">{t("aboutTechnologies")}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {technologies.map((tech, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors">
                  <tech.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground">{tech.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground/70 text-center">{t("aboutVersion")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
