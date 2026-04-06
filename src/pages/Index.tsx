import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, Clock, TrendingUp, DollarSign, CheckCircle2, FileText, Users } from "lucide-react";

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
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 py-20 md:py-32">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/submit">
                  Submit Credit Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/my-requests">Track Existing Request</Link>
              </Button>
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
              { end: 3.2, suffix: " days", label: "Avg. Processing Time", icon: Clock },
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

      {/* Problem Cards */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4">Why Partners Choose Our Portal</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Traditional credit processing is slow, opaque, and frustrating. We fix that.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Weeks → Days",
                description: "Automated tier routing eliminates manual handoffs. Credits under $10K are approved within 24 hours.",
              },
              {
                icon: FileText,
                title: "Full Audit Trail",
                description: "Every status change, every approval, every note — timestamped and traceable for compliance teams.",
              },
              {
                icon: Users,
                title: "Smart Routing",
                description: "Requests auto-route to the right approver tier. OOO detection ensures no deal stalls in a queue.",
              },
            ].map((card) => (
              <Card key={card.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-3">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Approval Tiers Table */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4">Tiered Approval Workflow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Credits are automatically routed based on value, ensuring the right level of oversight.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Credit Range</th>
                      <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Approval Chain</th>
                      <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Target SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-semibold text-success">Under $10,000</td>
                      <td className="p-4 text-sm text-muted-foreground">Finance Analyst</td>
                      <td className="p-4 text-sm">24 hours</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold text-warning">$10,000 – $50,000</td>
                      <td className="p-4 text-sm text-muted-foreground">Finance → Director</td>
                      <td className="p-4 text-sm">3 business days</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-destructive">Over $50,000</td>
                      <td className="p-4 text-sm text-muted-foreground">Finance → Director → VP</td>
                      <td className="p-4 text-sm">5 business days</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display font-bold text-3xl mb-4">Ready to Submit Your Credit Request?</h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of AWS Marketplace partners who have streamlined their Red Hat credit process.
            </p>
            <Button asChild size="lg" className="text-base px-8">
              <Link to="/submit">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
