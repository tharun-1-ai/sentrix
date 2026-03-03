import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const languages = [
    { code: "en" as const, label: "🇬🇧 English" },
    { code: "ta" as const, label: "🇮🇳 தமிழ் (Tamil)" },
    { code: "hi" as const, label: "🇮🇳 हिंदी (Hindi)" },
  ];

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border border-border hover:neon-border hover:text-primary transition-all bg-secondary/50"
      >
        <Globe className="h-3.5 w-3.5" />
        {t("language")}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 glass-strong rounded-md shadow-lg overflow-hidden animate-fade-in min-w-[160px] neon-glow"
          style={{ borderColor: "hsl(185 100% 50% / 0.15)" }}>
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => { setLanguage(code); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-primary/10 transition-all font-medium ${
                language === code ? "text-primary bg-primary/5 font-bold" : "text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
