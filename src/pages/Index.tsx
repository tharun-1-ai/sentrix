import { Link } from "react-router-dom";
import { Shield, Search, Globe, FileText, Brain, Users, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
    { num: "01", title: t("step1Title"), desc: t("step1Desc") },
    { num: "02", title: t("step2Title"), desc: t("step2Desc") },
    { num: "03", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">{t("brand")}</span>
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("signIn")}</Link>
            <Link to="/auth" className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">{t("getStarted")}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground/90 px-3 py-1 rounded-full text-xs font-medium">
              <Shield className="h-3 w-3" /> {t("tagline")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-lg text-primary-foreground/70 leading-relaxed">
              {t("heroDesc")}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                {t("analyzeNow")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard/prevention" className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-foreground/20 transition-colors">
                {t("learnPrevention")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-destructive">{t("stat1Value")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("stat1Label")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-warning">{t("stat2Value")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("stat2Label")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{t("stat3Value")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("stat3Label")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">{t("comprehensiveProtection")}</h2>
            <p className="text-muted-foreground">{t("comprehensiveProtectionDesc")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-lg border p-5 hover:card-glow transition-shadow">
                <Icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">{t("howItWorks")}</h2>
            <p className="text-muted-foreground">{t("howItWorksDesc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">{num}</div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">{t("ctaTitle")}</h2>
          <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto">{t("ctaDesc")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90">
              {t("getStartedFree")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard/community" className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-foreground/20">
              {t("reportScam")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>{t("brand")}</span>
          </div>
          <p>{t("footerText")}</p>
        </div>
      </footer>
    </div>
  );
}
