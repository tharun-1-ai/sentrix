import { Link } from "react-router-dom";
import { Shield, Search, Globe, FileText, Brain, Users, ArrowRight, Zap, Lock, Eye } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CyberBackground from "@/components/CyberBackground";

export default function Index() {
  const { t } = useLanguage();

  const features = [
    { icon: Brain, title: t("feat1Title"), desc: t("feat1Desc") },
    { icon: Globe, title: t("feat2Title"), desc: t("feat2Desc") },
    { icon: Search, title: t("feat3Title"), desc: t("feat3Desc") },
    { icon: FileText, title: t("feat4Title"), desc: t("feat4Desc") },
    { icon: Shield, title: t("feat5Title"), desc: t("feat5Desc") },
    { icon: Users, title: t("feat6Title"), desc: t("feat6Desc") },
  ];

  const steps = [
    { num: "01", title: t("step1Title"), desc: t("step1Desc"), icon: Zap },
    { num: "02", title: t("step2Title"), desc: t("step2Desc"), icon: Eye },
    { num: "03", title: t("step3Title"), desc: t("step3Desc"), icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CyberBackground />

      {/* Nav */}
      <nav className="border-b border-border/50 glass-strong sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Shield className="h-6 w-6 text-primary" />
                <div className="absolute inset-0 animate-pulse-neon rounded-full" />
              </div>
              <span className="font-display font-bold text-sm tracking-wider text-foreground">{t("brand")}</span>
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{t("signIn")}</Link>
            <Link to="/auth" className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-md font-semibold hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] transition-all">
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-40">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 border neon-border px-4 py-1.5 rounded-full text-xs font-semibold font-mono text-primary animate-cyber-pulse">
              <Shield className="h-3 w-3" /> {t("tagline")}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight tracking-tight">
              <span className="text-foreground">{t("heroTitle").split(" ").slice(0, 3).join(" ")} </span>
              <span className="text-gradient">{t("heroTitle").split(" ").slice(3).join(" ")}</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium max-w-lg">
              {t("heroDesc")}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-md text-sm font-bold hover:shadow-[0_0_30px_hsl(185_100%_50%/0.4)] transition-all font-display tracking-wide">
                {t("analyzeNow")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard/prevention" className="inline-flex items-center gap-2 border neon-border text-foreground px-7 py-3 rounded-md text-sm font-bold hover:bg-primary/10 transition-all font-display tracking-wide">
                {t("learnPrevention")}
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative shield glow */}
        <div className="absolute top-1/2 right-10 md:right-20 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:block">
          <Shield className="h-64 w-64 text-primary animate-float" style={{ filter: "drop-shadow(0 0 40px hsl(185 100% 50% / 0.4))" }} />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: t("stat1Value"), label: t("stat1Label"), color: "text-destructive" },
              { value: t("stat2Value"), label: t("stat2Label"), color: "text-warning" },
              { value: t("stat3Value"), label: t("stat3Label"), color: "text-primary" },
            ].map(({ value, label, color }) => (
              <div key={label} className="cyber-card p-6">
                <p className={`text-4xl font-display font-bold ${color}`}>{value}</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border/50 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">{t("comprehensiveProtection")}</h2>
            <p className="text-muted-foreground font-medium">{t("comprehensiveProtectionDesc")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="cyber-card p-6 group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:neon-glow transition-all">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border/50 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">{t("howItWorks")}</h2>
            <p className="text-muted-foreground font-medium">{t("howItWorksDesc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc, icon: Icon }) => (
              <div key={num} className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 neon-border mb-6 group-hover:neon-glow-strong transition-all">
                  <span className="font-display text-2xl font-bold text-primary">{num}</span>
                  <Icon className="absolute -right-2 -top-2 h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="cyber-card p-12 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="relative z-10">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" style={{ filter: "drop-shadow(0 0 20px hsl(185 100% 50% / 0.4))" }} />
              <h2 className="text-2xl font-display font-bold mb-3">{t("ctaTitle")}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">{t("ctaDesc")}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-md text-sm font-bold hover:shadow-[0_0_30px_hsl(185_100%_50%/0.4)] transition-all font-display tracking-wide">
                  {t("getStartedFree")} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/dashboard/community" className="inline-flex items-center gap-2 border neon-border text-foreground px-7 py-3 rounded-md text-sm font-bold hover:bg-primary/10 transition-all font-display tracking-wide">
                  {t("reportScam")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-display text-xs tracking-wider">{t("brand")}</span>
          </div>
          <p className="font-medium">{t("footerText")}</p>
        </div>
      </footer>
    </div>
  );
}
