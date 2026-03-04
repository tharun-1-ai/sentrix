import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import CyberBackground from "@/components/CyberBackground";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    // Also check hash for type=recovery
    if (window.location.hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const strength = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[a-z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: t("error"), description: t("pwMismatch"), variant: "destructive" });
      return;
    }
    if (strength < 5) {
      toast({ title: t("error"), description: t("pwMin8"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: t("pwResetSuccess"), description: t("pwResetSuccessDesc") });
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 1500);
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-10 py-2.5 bg-secondary/50 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all font-mono";
  const strengthColors = ["bg-destructive", "bg-destructive", "bg-yellow-500", "bg-yellow-400", "bg-green-500"];

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <CyberBackground />
        <div className="w-full max-w-sm relative z-10 text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" style={{ filter: "drop-shadow(0 0 12px hsl(185 100% 50% / 0.4))" }} />
          <h2 className="text-lg font-display font-bold mb-2">{t("invalidResetLink")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("invalidResetLinkDesc")}</p>
          <Link to="/auth" className="text-primary hover:underline font-bold text-sm">{t("backToLogin")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <CyberBackground />
      <div className="w-full max-w-sm relative z-10">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <Shield className="h-8 w-8 text-primary" style={{ filter: "drop-shadow(0 0 12px hsl(185 100% 50% / 0.4))" }} />
          <span className="text-xl font-display font-bold tracking-wider">{t("brand")}</span>
        </Link>

        <div className="glass-strong rounded-xl p-6 neon-glow">
          <h2 className="text-lg font-display font-bold mb-1 tracking-tight">{t("resetPasswordTitle")}</h2>
          <p className="text-sm text-muted-foreground mb-6 font-medium">{t("resetPasswordDesc")}</p>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("newPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder={t("newPassword")} required minLength={8} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><Eye className={`h-4 w-4 ${showNew ? "hidden" : ""}`} /><EyeOff className={`h-4 w-4 ${!showNew ? "hidden" : ""}`} /></button>
              </div>
              {newPassword && (
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] || "bg-green-500" : "bg-muted"}`} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("confirmNewPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} placeholder={t("confirmNewPassword")} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><Eye className={`h-4 w-4 ${showConfirm ? "hidden" : ""}`} /><EyeOff className={`h-4 w-4 ${!showConfirm ? "hidden" : ""}`} /></button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-destructive mt-1">{t("pwMismatch")}</p>}
              {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t("pwMatch")}</p>}
            </div>

            <button type="submit" disabled={loading || strength < 5 || newPassword !== confirmPassword}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] transition-all disabled:opacity-50">
              {loading ? t("pleaseWait") : t("resetPasswordBtn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
