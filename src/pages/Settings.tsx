import { Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ProfileSection from "@/components/settings/ProfileSection";
import SecuritySection from "@/components/settings/SecuritySection";
import AboutSection from "@/components/settings/AboutSection";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <SettingsIcon className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.4))" }} /> {t("settingsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("settingsDesc")}</p>
      </div>

      {/* Profile */}
      <ProfileSection />

      {/* Security */}
      <SecuritySection />

      {/* About */}
      <AboutSection />

      {/* Delete Account */}
      <DeleteAccountSection />
    </div>
  );
}
