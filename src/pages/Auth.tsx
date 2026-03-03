import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, Lock, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CyberBackground from "@/components/CyberBackground";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: t("checkEmail"), description: t("confirmationLink") });
      }
    } catch (e: any) {
      toast({ title: t("error"), description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <CyberBackground />
      <div className="absolute top-4 left-4 z-20">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <Shield className="h-8 w-8 text-primary" style={{ filter: "drop-shadow(0 0 12px hsl(185 100% 50% / 0.4))" }} />
          <span className="text-xl font-display font-bold tracking-wider">{t("brand")}</span>
        </Link>

        <div className="glass-strong rounded-xl p-6 neon-glow">
          <h2 className="text-lg font-display font-bold mb-1 tracking-tight">{isLogin ? t("welcomeBack") : t("createAccount")}</h2>
          <p className="text-sm text-muted-foreground mb-6 font-medium">
            {isLogin ? t("signInToAccount") : t("startProtecting")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder={t("fullName")} value={fullName} onChange={e => setFullName(e.target.value)}
                  className={inputClass} required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input type="email" placeholder={t("email")} value={email} onChange={e => setEmail(e.target.value)}
                className={inputClass} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input type="password" placeholder={t("password")} value={password} onChange={e => setPassword(e.target.value)}
                className={inputClass} required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-display font-bold tracking-wide hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] transition-all disabled:opacity-50">
              {loading ? t("pleaseWait") : isLogin ? t("signIn") : t("createAccount")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5 font-medium">
            {isLogin ? t("dontHaveAccount") : t("alreadyHaveAccount")}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-bold">
              {isLogin ? t("signUp") : t("signIn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
