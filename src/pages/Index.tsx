import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Shield, DollarSign, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function AnimatedCounter({ end, prefix = "", suffix = "", duration = 2000 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
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
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <div ref={ref} className="font-display font-bold text-4xl md:text-5xl text-primary">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

const Index = () => {
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
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Streamline your AWS Marketplace credit requests with our automated approval pipeline.
              From submission to payout in days, not weeks.
            </p>

            {/* Portal Selector Cards */}
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
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
      </section>

      {/* Stats */}
      <section className="py-16 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { end: 1000000, prefix: "$", label: "FY2026 Credit Pool", icon: DollarSign },
              { end: 847, label: "Credits Processed", icon: CheckCircle2 },
              { end: 96, suffix: "%", label: "Approval Rate", icon: TrendingUp },
              { end: 3, suffix: " days", label: "Avg. Processing Time", icon: Clock },
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
