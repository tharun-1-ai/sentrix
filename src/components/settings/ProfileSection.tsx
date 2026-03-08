import { Mail, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProfileSection() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="cyber-card p-5 space-y-4">
      <h3 className="font-display font-bold text-sm flex items-center gap-2">
        <User className="h-4 w-4 text-primary" style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }} />
        {t("accountInfo")}
      </h3>
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
  );
}
