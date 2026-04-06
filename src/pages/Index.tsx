import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Shield, DollarSign, CheckCircle2, Clock, TrendingUp, HelpCircle, Unlink, FileSpreadsheet, Scissors, ArrowRightCircle, Users, Search, LayoutDashboard, UserCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

function AnimatedCounter({ end, prefix = "", suffix = "", duration = 2000 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (end === 0) return;
    const startAnimation = () => {
      if (started.current) return;
      started.current = true;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startAnimation(); },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) startAnimation();
    }
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <div ref={ref} className="font-display font-bold text-4xl md:text-5xl text-primary">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

const Index = () => {
  const [stats, setStats] = useState({ pool: 1000000, processed: 0, approvalRate: 0, avgDays: 4.2 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: all } = await supabase.from("credit_requests").select("status, created_at, updated_at");
      if (!all) return;
      const paidOut = all.filter(r => r.status === "PAID_OUT").length;
      const approvedOrPaid = all.filter(r => ["APPROVED", "PAID_OUT"].includes(r.status));
      const rate = all.length > 0 ? Math.round((approvedOrPaid.length / all.length) * 100) : 94;
      setStats({ pool: 1000000, processed: paidOut, approvalRate: rate || 94, avgDays: 4.2 });
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">RH</span>
            </div>
            <span className="font-display font-bold text-lg">Partner Credit Funding Portal</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 py-16 md:py-24">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Shield className="h-3.5 w-3.5" />
              AWS Marketplace Partner Program
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-6 text-foreground">
              Unlock Post-Deal Credits for Your{" "}
              <span className="text-primary">Red Hat</span> Investments
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamline your AWS Marketplace credit requests with our automated approval pipeline.
              From submission to payout in days, not weeks.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
      </section>

      {/* SECTION 1 — THE PROBLEM */}
      <section className="py-16 md:py-20" style={{ backgroundColor: "#1E293B" }}>
        <div className="container max-w-5xl">
          <h2 className="font-display font-bold text-2xl md:text-4xl text-white text-center mb-6 leading-tight">
            I managed AWS's Red Hat partnership. I had no idea where my customers' money was.
          </h2>
          <p className="text-center text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed text-sm md:text-base">
            When a customer buys Red Hat products on AWS Marketplace and qualifies for post-deal credits, they submit a request — and enter a black box. No confirmation. No timeline. No status updates. My Finance team tracked every single credit request in a manual Excel spreadsheet — not a shared Google Doc, an actual .xlsx file sitting on someone's desktop. I found out a deal was stuck only when the customer emailed me directly asking what happened. I managed the relationship but couldn't answer basic questions about money that was owed to them.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-0">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-slate-900">Customers fly blind</h3>
                <p className="text-sm text-slate-600">
                  No confirmation after submitting. No status. No estimated timeline. They start emailing their AWS Partner Manager directly for updates.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <Unlink className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-slate-900">Partner Managers are invisible</h3>
                <p className="text-sm text-slate-600">
                  Once Finance takes over, the Account Manager has zero visibility. Responsible for the customer relationship but unable to answer basic status questions.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-slate-900">Finance runs on Excel</h3>
                <p className="text-sm text-slate-600">
                  Every status update manually entered. No routing logic. No approval tiers enforced. No budget tracking. Deals fall through the cracks for weeks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT THIS FIXES */}
      <section className="py-16 border-b bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-10">What This Portal Fixes</h2>
          <div className="space-y-4">
            {[
              {
                problem: "Customers have no visibility after submitting",
                fix: "Real-time status tracker with estimated dates at every stage, accessible via tracking link — no login required",
              },
              {
                problem: "Partner Managers are out of the loop",
                fix: "Observer access — Account Managers see live read-only deal status for their accounts without Finance dashboard access",
              },
              {
                problem: "Finance operates in spreadsheet chaos",
                fix: "Structured approval queue with automatic tier-routing ($10K / $50K / above), OOO handling, and live budget pool tracking",
              },
            ].map((row, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted-foreground line-through mb-1">{row.problem}</p>
                  <p className="text-sm font-medium">{row.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — STATS */}
      <section className="py-16 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { end: stats.pool, prefix: "$", label: "FY2026 Credit Pool", icon: DollarSign },
              { end: stats.processed, label: "Credits Processed", icon: CheckCircle2 },
              { end: stats.approvalRate, suffix: "%", label: "Approval Rate", icon: TrendingUp },
              { end: 42, suffix: "", label: "Avg. Processing Time", icon: Clock, customDisplay: "4.2 days" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-6 w-6 text-primary/60 mx-auto mb-3" />
                {"customDisplay" in stat && stat.customDisplay ? (
                  <div className="font-display font-bold text-4xl md:text-5xl text-primary">{stat.customDisplay}</div>
                ) : (
                  <AnimatedCounter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
                )}
                <p className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTAL CARDS */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link to="/customer" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/40">
                <CardContent className="p-8 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display font-bold text-xl mb-2">Customer Portal</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit new credit requests, track approvals, and manage your funding lifecycle.
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Enter Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/internal" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/40">
                <CardContent className="p-8 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display font-bold text-xl mb-2">Internal Finance Portal</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review submissions, manage tiered approvals, and track budget utilization.
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Enter Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4 — ABOUT THIS BUILD / TRADEOFFS */}
      <section className="py-16 bg-muted/40 border-t border-b">
        <div className="container max-w-5xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-10">About This Build</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left — What I Cut */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-muted-foreground" /> What I cut and why
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Email delivery", body: "Simulated (logs to console). Real SMTP adds infrastructure complexity with zero demo value. V2: SendGrid with templated notifications per status change." },
                  { title: "Authentication / SSO", body: "Omitted intentionally. For this workflow, tracking ID + email lookup is sufficient to demonstrate the core flow. V2: AWS IAM SSO for internal users, magic link for customers." },
                  { title: "Document storage", body: "Upload field exists in the form and schema but S3 integration is intentionally not wired. The field is there; the infrastructure plumbing is the easy part. V2: S3 with virus scanning on upload." },
                  { title: "Multi-level audit log", body: "StatusHistory is in the schema and partially surfaced. Full compliance-grade audit trail is a v2 feature." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-muted-foreground text-sm mt-0.5">✂️</span>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — What Comes Next */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <ArrowRightCircle className="h-5 w-5 text-primary" /> What comes next
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Salesforce / CRM Sync", body: "Pull deal data automatically on submission so customers don't re-enter what AWS already knows. Eliminates the #1 data quality problem." },
                  { title: "SLA Alerting", body: "Ping Finance on Slack when any deal sits in a stage more than 3 business days without action. Turns passive tracking into active accountability." },
                  { title: "Director Email Approvals", body: "Directors approve or deny directly from an email link — no portal login required. Reduces approval friction for senior stakeholders." },
                ].map((item, i) => (
                  <Card key={i} className="border">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold flex items-center gap-2 mb-1">
                        <ArrowRight className="h-3.5 w-3.5 text-primary" /> {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — WHAT THIS REPLACES */}
      <section className="py-16" style={{ backgroundColor: "#312E81" }}>
        <div className="container max-w-4xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white text-center mb-10">What this replaces</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { before: "~4 hrs/week", after: "~15 min/week", label: "Finance team time on manual spreadsheet updates" },
              { before: "Unknown", after: "Real-time", label: "Visibility into credit request status for Account Managers" },
              { before: "Email chains", after: "Tracking link", label: "How customers check their request status" },
            ].map((card, i) => (
              <Card key={i} className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <p className="text-red-300 font-display font-bold text-2xl line-through mb-1">{card.before}</p>
                  <p className="text-green-300 font-display font-bold text-2xl mb-3">{card.after}</p>
                  <p className="text-sm text-white/70">{card.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — DEMO GUIDE */}
      <section className="py-16 border-t bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-10">How to explore this prototype</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, step: "1", title: "Submit a Request", desc: "Go to Customer Portal → Submit Request. Fill in the form as a Red Hat customer requesting post-deal credits." },
              { icon: Search, step: "2", title: "Track Your Status", desc: "After submitting, you'll get a tracking ID. Visit My Requests to see the live funding lifecycle." },
              { icon: LayoutDashboard, step: "3", title: "Review as Finance", desc: "Switch to Internal Finance Portal. See the live budget pool, review incoming requests, and approve or route them." },
              { icon: UserCheck, step: "4", title: "Approve as a Director", desc: "Open any deal above $10K. Click Approve & Route — it auto-advances to the next approval tier based on deal size." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-2">{s.step}</div>
                <h3 className="font-display font-semibold text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Red Hat Partner Credit Funding Portal. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
