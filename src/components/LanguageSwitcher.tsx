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

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-card border hover:bg-muted transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        {t("language")}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-card border rounded-md shadow-lg overflow-hidden animate-fade-in min-w-[140px]">
          <button
            onClick={() => { setLanguage("en"); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${language === "en" ? "bg-primary/10 text-primary font-medium" : ""}`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => { setLanguage("ta"); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${language === "ta" ? "bg-primary/10 text-primary font-medium" : ""}`}
          >
            🇮🇳 தமிழ் (Tamil)
          </button>
        </div>
      )}
    </div>
  );
}
