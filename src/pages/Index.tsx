import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Shield, DollarSign, CheckCircle2, Clock, TrendingUp, EyeOff, FileSpreadsheet, Users } from "lucide-react";
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

    // Start immediately if visible, otherwise use observer
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startAnimation(); },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
      // Also check immediately
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
  const [stats, setStats] = useState({ pool: 1000000, processed: 0, approvalRate: 0, avgDays: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: all } = await supabase.from("credit_requests").select("status, created_at, updated_at");
      if (!all) return;
      const paidOut = all.filter(r => r.status === "PAID_OUT").length;
      const approvedOrPaid = all.filter(r => ["APPROVED", "PAID_OUT"].includes(r.status));
      const rate = all.length > 0 ? Math.round((approvedOrPaid.length / all.length) * 100) : 0;
      const avgDays = approvedOrPaid.length > 0
        ? Math.round(approvedOrPaid.reduce((sum, r) => {
            const diff = (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
            return sum + diff;
          }, 0) / approvedOrPaid.length)
        : 0;
      setStats({ pool: 1000000, processed: paidOut, approvalRate: rate, avgDays });
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

      {/* Demo Guide Banner */}
      <div className="bg-primary/5 border-b border-primary/20 py-2.5">
        <div className="container text-center text-sm text-muted-foreground">
          <span className="font-semibold text-primary">🎯 Interview Demo</span> — Start with{" "}
          <Link to="/customer" className="underline text-primary hover:text-primary/80">Customer Portal</Link> to submit a request, then switch to{" "}
          <Link to="/internal" className="underline text-primary hover:text-primary/80">Finance Dashboard</Link> to review it.
          <span className="text-xs opacity-60 ml-2">All data is fictional.</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 py-20 md:py-28">
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

      {/* Why I Built This */}
      <section className="py-16 border-b bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-4">Why I Built This</h2>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            I'm a Senior Partner Manager at AWS managing the Red Hat partnership. When customers purchase Red Hat products on AWS Marketplace and qualify for post-deal credits, the process is completely manual — Finance tracks everything in an Excel spreadsheet, customers have no visibility, and I have no idea what stage any deal is in.
          </p>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <EyeOff className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Customers Fly Blind</h3>
                <p className="text-sm text-muted-foreground">
                  After submitting a credit request, customers have zero visibility. They email Finance weekly asking "what's the status?" — and Finance doesn't have time to respond.
                </p>
              </CardContent>
            </Card>
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Partner Managers: Zero Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Once Finance takes over a request, the Partner Manager who initiated it has no idea if it's stuck in review, needs changes, or was quietly denied.
                </p>
              </CardContent>
            </Card>
            <Card className="border-info/20 bg-info/5">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-6 w-6 text-info" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Finance Runs on Spreadsheets</h3>
                <p className="text-sm text-muted-foreground">
                  The entire $1M credit pool is tracked in a shared Excel file. No audit trail, no automated routing, no SLA tracking. Things fall through the cracks.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What This Solves */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-display font-semibold text-lg text-center mb-6">What This Portal Solves</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Real-Time Status Tracking</p>
                  <p className="text-muted-foreground">Customers see exactly where their request is — from submission through payout — with estimated timelines.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Automated Tier-Based Routing</p>
                  <p className="text-muted-foreground">Requests auto-route through Finance → Director → VP based on amount. No manual handoffs, no missed approvals.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Full Audit Trail</p>
                  <p className="text-muted-foreground">Every action is logged with timestamps, comments, and approver identity. Complete compliance and accountability.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Selector Cards */}
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

      {/* Stats */}
      <section className="py-16 border-t">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { end: stats.pool, prefix: "$", label: "FY2026 Credit Pool", icon: DollarSign },
              { end: stats.processed, label: "Credits Processed", icon: CheckCircle2 },
              { end: stats.approvalRate, suffix: "%", label: "Approval Rate", icon: TrendingUp },
              { end: stats.avgDays, suffix: " days", label: "Avg. Processing Time", icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-6 w-6 text-primary/60 mx-auto mb-3" />
                <AnimatedCounter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
                <p className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">{stat.label}</p>
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
