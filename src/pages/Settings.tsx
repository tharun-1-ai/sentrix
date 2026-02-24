import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, User, Mail } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" /> {t("settingsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("settingsDesc")}</p>
      </div>

      <div className="bg-card rounded-lg border p-5 space-y-4">
        <h3 className="font-semibold text-sm">{t("accountInfo")}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("email")}:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("accountCreated")}</span>
            <span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
