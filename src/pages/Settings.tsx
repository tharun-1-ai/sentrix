import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, User, Mail, Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <SettingsIcon className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("settingsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("settingsDesc")}</p>
      </div>

      <div className="cyber-card p-5 space-y-4">
        <h3 className="font-display font-bold text-sm">{t("accountInfo")}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground font-medium">{t("email")}:</span>
            <span className="font-mono font-bold">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground font-medium">{t("accountCreated")}</span>
            <span className="font-mono font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="cyber-card p-5">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" style={{ filter: "drop-shadow(0 0 10px hsl(185 100% 50% / 0.3))" }} />
          <div>
            <p className="font-display font-bold text-sm">Sentrix Security</p>
            <p className="text-xs text-muted-foreground font-medium">Your data is encrypted and protected by AI-powered security protocols.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
