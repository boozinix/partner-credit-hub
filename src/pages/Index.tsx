import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Shield, DollarSign, CheckCircle2, Clock, TrendingUp, HelpCircle, Unlink, FileSpreadsheet, Users, Search, LayoutDashboard, UserCheck, Zap, MessageSquare, MailX, Lock, XCircle, RefreshCw, Mail, FileText, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

const excelRows = [
  { id: "AWZ-2026-0001", customer: "TechForward Solutions", amount: "$8,500", product: "RHEL", status: "check with Sarah", updated: "3/12 - manually updated by finance", notes: "Jake emailed 2x" },
  { id: "AWZ-2026-0002", customer: "GlobalEdge Networks", amount: "$15,200", product: "OpenShift", status: "waiting on director", updated: "3/15 - ???", notes: "invoice missing" },
  { id: "AWZ-2026-0003", customer: "Apex Cloud Services", amount: "$72,000", product: "Ansible + RHEL", status: "approved? confirm", updated: "2/28 - needs VP sign off", notes: "Priya OOO???" },
  { id: "AWZ-2026-0004", customer: "Pinnacle Health", amount: "$5,800", product: "RHEL", status: "sent email", updated: "3/18 - left voicemail", notes: "" },
  { id: "AWZ-2026-0005", customer: "Vertex Financial", amount: "$34,000", product: "OpenShift + ACS", status: "unknown", updated: "3/01 - who owns this?", notes: "escalated to mgr" },
  { id: "AWZ-2026-0006", customer: "Atlas Manufacturing", amount: "$9,200", product: "Satellite", status: "check with Sarah", updated: "3/20 - manually updated", notes: "" },
  { id: "AWZ-2026-0007", customer: "GlobalEdge Networks", amount: "$28,500", product: "OpenShift", status: "approved? need PO#", updated: "3/05 - waiting on finance", notes: "2nd request this Q" },
  { id: "AWZ-2026-0008", customer: "Meridian Data", amount: "$62,000", product: "Ansible + Storage", status: "waiting on director", updated: "2/14 - stale??", notes: "deal might be dead" },
];

function ExcelVsPortalToggle() {
  const [showPortal, setShowPortal] = useState(true);

  return (
    <section className="py-16 border-b bg-muted/20">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`font-display font-bold text-sm uppercase tracking-wider transition-colors ${!showPortal ? "text-destructive" : "text-muted-foreground/50"}`}>Before</span>
          <Switch checked={showPortal} onCheckedChange={setShowPortal} className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-destructive scale-125" />
          <span className={`font-display font-bold text-sm uppercase tracking-wider transition-colors ${showPortal ? "text-green-600" : "text-muted-foreground/50"}`}>After</span>
        </div>

        <div className="relative min-h-[420px]">
          {/* Excel State */}
          <div className={`transition-opacity duration-300 ${!showPortal ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"}`}>
            <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive font-medium mb-3 text-center">
              ⚠ This is how it worked before. One spreadsheet. No routing. No visibility. Updated manually.
            </div>
            <div className="rounded-lg border bg-[#f0f0f0] overflow-hidden shadow-md">
              {/* Fake toolbar */}
              <div className="flex items-center gap-0 border-b bg-[#e8e8e8] px-2 py-1">
                {["File", "Edit", "View", "Insert", "Format", "Data"].map(m => (
                  <span key={m} className="px-3 py-0.5 text-xs text-gray-500 cursor-default">{m}</span>
                ))}
              </div>
              {/* Spreadsheet */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ fontFamily: "Calibri, 'Segoe UI', sans-serif" }}>
                  <thead>
                    <tr className="bg-[#d9e2f3] border-b-2 border-[#8eaadb]">
                      {["Deal ID", "Customer", "Amount", "Product", "Status", "Last Updated", "Notes"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-[#333] border border-[#b4c6e7] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelRows.map((row, i) => (
                      <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-[#f5f5f5]"}>
                        <td className="px-3 py-1.5 border border-[#d0d0d0] font-mono">{row.id}</td>
                        <td className="px-3 py-1.5 border border-[#d0d0d0]">{row.customer}</td>
                        <td className="px-3 py-1.5 border border-[#d0d0d0] text-right">{row.amount}</td>
                        <td className="px-3 py-1.5 border border-[#d0d0d0]">{row.product}</td>
                        <td className="px-3 py-1.5 border border-[#d0d0d0] text-orange-600 italic">{row.status}</td>
                        <td className="px-3 py-1.5 border border-[#d0d0d0] text-gray-500">{row.updated}</td>
                        <td className="px-3 py-1.5 border border-[#d0d0d0] text-red-500">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#e8e8e8] border-t text-[10px] text-gray-400">
                <span className="bg-white border px-4 py-0.5 text-gray-600 font-medium">FY2026 Credits</span>
                <span className="px-4 py-0.5">Sheet2</span>
                <span className="px-4 py-0.5">Sheet3</span>
              </div>
            </div>
          </div>

          {/* Portal State */}
          <div className={`transition-opacity duration-300 ${showPortal ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"}`}>
            <div className="rounded-sm border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm text-green-700 font-medium mb-3 text-center">
              ✓ Real-time. Automated. Zero spreadsheets.
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, title: "Real-Time Status Tracking", desc: "Customers see exactly where their request is — from submission through payout — with estimated timelines." },
                { icon: ArrowRight, title: "Automated Tier-Based Routing", desc: "Requests auto-route through Finance → Director → VP based on amount. No manual handoffs, no missed approvals." },
                { icon: CheckCircle2, title: "Full Audit Trail", desc: "Every action is logged with timestamps, comments, and approver identity. Complete compliance and accountability." },
              ].map((card) => (
                <Card key={card.title} className="border-green-200">
                  <CardContent className="p-5 text-center">
                    <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-3">
                      <card.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-display font-bold text-sm mb-2">{card.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

      {/* EXCEL VS PORTAL TOGGLE */}
      <ExcelVsPortalToggle />

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
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold text-center mb-6">Choose your role to get started ↓</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link to="/customer" className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/40">
                <CardContent className="p-8 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display font-bold text-xl mb-2">Customer Portal</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Submit new credit requests, track approvals, and manage your funding lifecycle.
                  </p>
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-4">
                    👤 You are: A company that purchased Red Hat products on AWS Marketplace and wants to claim post-deal credits.
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
                  <p className="text-sm text-muted-foreground mb-3">
                    Review submissions, manage tiered approvals, and track budget utilization.
                  </p>
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-4">
                    🔒 You are: An AWS Finance team member, Director, or VP who reviews and approves credit requests.
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

      {/* MERGED ROADMAP — Timeline with arrow line */}
      <section className="py-16 border-t border-b" style={{ backgroundColor: "hsl(231, 48%, 97%)" }}>
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">Implementation Timeline</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl flex items-center justify-center gap-2">
              Roadmap <ArrowRight className="h-5 w-5 text-primary" />
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-primary/20" />

            <div className="space-y-8">
              {[
                {
                  version: "V1", date: "Apr 2026", status: "live", icon: CheckCircle2,
                  title: "Core Approval Workflow",
                  body: "Customer submission → Finance review → tier-based routing → Director/VP approval → payout. Live budget tracking, OOO handling, and full status history.",
                },
                {
                  version: "V1.1", date: "May 2026", status: "next", icon: Mail,
                  title: "Email Notifications via SendGrid",
                  body: "Status change emails to customers with tracking links. Approval request emails to Directors/VPs. Estimated effort: 4 hours.",
                },
                {
                  version: "V1.2", date: "Jun 2026", status: "planned", icon: Lock,
                  title: "Authentication & SSO",
                  body: "AWS IAM SSO for Finance/Director/VP users. Magic link auth for customers with multiple requests. Tracking ID access remains for one-time users.",
                },
                {
                  version: "V2", date: "Q3 2026", status: "planned", icon: RefreshCw,
                  title: "CRM Auto-Fill & Zero-Entry Submission",
                  body: "Pull deal data from Salesforce on close, pre-populate the request. Customer pastes AWS Order ID → portal fills everything. Cuts submission from 10 min to 30 seconds.",
                },
                {
                  version: "V2", date: "Q3 2026", status: "planned", icon: Activity,
                  title: "SLA Alerting & Slack Integration",
                  body: "Ping Finance on Slack when any deal sits in a stage for 3+ business days. Turns passive tracking into active accountability.",
                },
                {
                  version: "V3", date: "Q4 2026", status: "future", icon: MessageSquare,
                  title: "Approver-in-a-Text",
                  body: "Directors reply YES/NO to an SMS with deal details. Full audit trail logged automatically. No portal login for routine approvals under $10K. Eliminates the approval bottleneck entirely.",
                },
                {
                  version: "V3", date: "Q4 2026", status: "future", icon: FileText,
                  title: "Document Storage & Compliance Audit",
                  body: "S3 upload with virus scanning. Full compliance-grade audit trail surfaced in the UI. Schema already supports both — infrastructure plumbing is the remaining work.",
                },
              ].map((item, i) => {
                const dotColor = item.status === "live" ? "bg-green-500" : item.status === "next" ? "bg-primary" : "bg-muted-foreground/30";
                const badgeColor = item.status === "live" ? "bg-green-100 text-green-700" : item.status === "next" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground";
                return (
                  <div key={i} className="relative flex gap-5 md:gap-6 pl-0">
                    {/* Dot on the line */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full ${dotColor} ring-4 ring-background shrink-0 mt-1`} />
                    </div>
                    {/* Card */}
                    <Card className="flex-1 border-l-4 border-l-primary/30">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>{item.version}</span>
                          <span className="text-xs text-muted-foreground font-medium">{item.date}</span>
                          {item.status === "live" && <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">✓ SHIPPED</span>}
                          {item.status === "next" && <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">UP NEXT</span>}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="font-display font-bold text-sm">{item.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MERGED SCOPE DECISIONS */}
      <section className="py-16 border-b">
        <div className="container max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 text-center">Intentional gaps</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-3">Scope Decisions</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">Good product judgment means knowing what not to build — yet</p>
          <div className="space-y-4">
            {[
              {
                icon: MailX, title: "Real email delivery",
                body: "The email composer modal, templates, and send flow are fully built — but emails log to the console instead of delivering via SMTP. Real email infrastructure requires domain verification, bounce handling, and deliverability testing. None of that adds demo value. The interface shows the workflow; the plumbing is straightforward. Estimated V2 effort: 4 hours with SendGrid.",
              },
              {
                icon: Lock, title: "Customer authentication",
                body: "Customers access request status via tracking ID link — no account, no password. Deliberate choice: a customer submits 1–2 credit requests per year. Login friction is not justified for that usage pattern. The tracking ID is sufficient to demonstrate the workflow. Production version would add magic link auth for customers with multiple requests and SSO (AWS IAM) for internal Finance users.",
              },
              {
                icon: FileText, title: "Document upload and storage",
                body: "The schema supports it and the form shows it — but S3 storage isn't wired. In discovery, the primary customer pain was visibility, not file management. Solving 'where is my request' came before 'where is my invoice.' Storage is a workflow optimization on top of a working approval chain, not a prerequisite for one.",
              },
              {
                icon: Activity, title: "Full compliance audit trail",
                body: "StatusHistory is in the schema and partially surfaced in the deal detail view. Full compliance-grade audit trail with export, retention policies, and tamper detection is a v2 feature — the data model is ready, the UI polish is remaining work.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-5 flex items-start gap-4 border-l-4 border-l-amber-400">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic text-center mt-6 max-w-2xl mx-auto">
            These weren't oversights — they were conscious tradeoffs to keep the prototype focused on the core approval workflow.
          </p>
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
