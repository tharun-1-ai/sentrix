import { Link } from "react-router-dom";
import { Shield, Search, Globe, FileText, Brain, Users, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Message Analysis", desc: "Detect scam keywords, psychological manipulation, and fraudulent patterns in job messages." },
  { icon: Globe, title: "Website Verification", desc: "Check if a job posting website is legitimate by analyzing domain, SSL, and patterns." },
  { icon: Search, title: "Recruiter Verification", desc: "Verify recruiter identity by analyzing email domains and LinkedIn presence." },
  { icon: FileText, title: "Offer Letter Scanner", desc: "Upload offer letters to detect payment requests, unrealistic terms, and fraud indicators." },
  { icon: Shield, title: "Risk Reports", desc: "Get detailed risk reports with scam probability scores and manipulation breakdowns." },
  { icon: Users, title: "Community Reports", desc: "Report and browse community-submitted scams, phone numbers, and suspicious websites." },
];

const steps = [
  { num: "01", title: "Submit Content", desc: "Paste a message, URL, recruiter details, or upload an offer letter." },
  { num: "02", title: "AI Analysis", desc: "Our AI engine analyzes patterns, keywords, and psychological manipulation tactics." },
  { num: "03", title: "Get Results", desc: "Receive a detailed risk report with scores, explanations, and recommendations." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">ScamShield AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/auth" className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground/90 px-3 py-1 rounded-full text-xs font-medium">
              <Shield className="h-3 w-3" /> AI-Powered Protection
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Stop Fake Job Scams Before They Stop Your Career
            </h1>
            <p className="text-lg text-primary-foreground/70 leading-relaxed">
              Our AI engine detects psychological manipulation, fraudulent patterns, and scam indicators 
              in job postings, emails, and offer letters — keeping you safe in your job search.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Analyze Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard/prevention" className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-foreground/20 transition-colors">
                Learn Prevention
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
              <p className="text-3xl font-bold text-destructive">14M+</p>
              <p className="text-sm text-muted-foreground mt-1">People targeted by job scams annually</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-warning">$2B+</p>
              <p className="text-sm text-muted-foreground mt-1">Lost to employment fraud each year</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">85%</p>
              <p className="text-sm text-muted-foreground mt-1">Of scams use psychological manipulation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Comprehensive Protection</h2>
            <p className="text-muted-foreground">Multiple layers of AI-powered analysis to keep you safe.</p>
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
            <h2 className="text-2xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to verify any job opportunity.</p>
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
          <h2 className="text-2xl font-bold mb-3">Ready to protect yourself?</h2>
          <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto">
            Create a free account and start analyzing suspicious job offers today.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard/community" className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-foreground/20">
              Report a Scam
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>ScamShield AI</span>
          </div>
          <p>© 2025 ScamShield AI. Protecting job seekers worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
