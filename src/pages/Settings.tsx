import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, User, Mail, Shield, Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const strengthColors = [
  "bg-destructive",
  "bg-destructive",
  "bg-yellow-500",
  "bg-yellow-400",
  "bg-green-500",
  "bg-green-400",
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const passwordErrors: string[] = [];
  if (newPassword && newPassword.length < 8) passwordErrors.push(t("pwMin8"));
  if (newPassword && !/[A-Z]/.test(newPassword)) passwordErrors.push(t("pwUppercase"));
  if (newPassword && !/[a-z]/.test(newPassword)) passwordErrors.push(t("pwLowercase"));
  if (newPassword && !/[0-9]/.test(newPassword)) passwordErrors.push(t("pwNumber"));
  if (newPassword && !/[^A-Za-z0-9]/.test(newPassword)) passwordErrors.push(t("pwSpecial"));

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: t("error"), description: t("pwMismatch"), variant: "destructive" });
      return;
    }
    if (passwordErrors.length > 0) {
      toast({ title: t("error"), description: passwordErrors[0], variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });
      if (signInError) {
        toast({ title: t("error"), description: t("currentPwWrong"), variant: "destructive" });
        setLoading(false);
        return;
      }
      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: t("pwChangedTitle"), description: t("pwChangedDesc") });
      // Sign out for security
      setTimeout(() => signOut(), 1500);
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-10 py-2.5 bg-secondary/50 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all font-mono";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
          <SettingsIcon className="h-6 w-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.4))" }} /> {t("settingsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">{t("settingsDesc")}</p>
      </div>

      {/* Account Info */}
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

      {/* Password & Security */}
      <div className="cyber-card p-5 space-y-4">
        <button
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(185 100% 50% / 0.3))" }} />
            <div className="text-left">
              <p className="font-display font-bold text-sm">{t("passwordSecurity")}</p>
              <p className="text-xs text-muted-foreground font-medium">{t("passwordSecurityDesc")}</p>
            </div>
          </div>
          <Lock className={`h-4 w-4 text-muted-foreground transition-transform ${showPasswordSection ? "rotate-12" : ""}`} />
        </button>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-border animate-fade-in">
            {/* Current Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("currentPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t("currentPassword")}
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("newPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t("newPassword")}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength] : "bg-muted"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength < 3 ? "text-destructive" : "text-green-500"}`}>{strengthLabels[strength]}</p>
                </div>
              )}
              {/* Validation checklist */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  {[
                    { ok: newPassword.length >= 8, label: t("pwMin8") },
                    { ok: /[A-Z]/.test(newPassword), label: t("pwUppercase") },
                    { ok: /[a-z]/.test(newPassword), label: t("pwLowercase") },
                    { ok: /[0-9]/.test(newPassword), label: t("pwNumber") },
                    { ok: /[^A-Za-z0-9]/.test(newPassword), label: t("pwSpecial") },
                  ].map((rule, i) => (
                    <div key={i} className={`flex items-center gap-1.5 text-xs ${rule.ok ? "text-green-500" : "text-muted-foreground"}`}>
                      <CheckCircle2 className={`h-3 w-3 ${rule.ok ? "text-green-500" : "text-muted-foreground/40"}`} />
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("confirmNewPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder={t("confirmNewPassword")}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">{t("pwMismatch")}</p>
              )}
              {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t("pwMatch")}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0 || newPassword !== confirmPassword || !currentPassword}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] transition-all disabled:opacity-50"
            >
              {loading ? t("pleaseWait") : t("changePasswordBtn")}
            </button>

            <div className="text-center pt-2 border-t border-border">
              <button
                type="button"
                disabled={forgotLoading}
                onClick={async () => {
                  if (!user?.email) return;
                  setForgotLoading(true);
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) throw error;
                    toast({ title: t("resetEmailSent"), description: t("resetEmailSentDesc") });
                  } catch (err: any) {
                    toast({ title: t("error"), description: err.message, variant: "destructive" });
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
              >
                {forgotLoading ? t("pleaseWait") : t("forgotPassword")}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Card */}
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
