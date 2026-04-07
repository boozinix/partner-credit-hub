import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { TierBadge } from "@/components/TierBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Search, Download, Plus, ExternalLink, Clock, TrendingUp, AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Send, UserX, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

function bizDaysBetween(from: string, to: Date): number {
  const d = new Date(from);
  let count = 0;
  while (d < to) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function isOverdue(updatedAt: string): boolean {
  return bizDaysBetween(updatedAt, new Date()) > 3;
}

export default function InternalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Tables<"credit_requests">[]>([]);
  const [approvers, setApprovers] = useState<Tables<"approvers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const perPage = 10;

  useEffect(() => {
    (async () => {
      const [reqRes, appRes] = await Promise.all([
        supabase.from("credit_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("approvers").select("*"),
      ]);
      setRequests(reqRes.data || []);
      setApprovers(appRes.data || []);
      setLoading(false);
    })();
  }, []);

  const budget = useMemo(() => {
    const pool = 1000000;
    const paidOut = requests.filter((r) => r.status === "PAID_OUT").reduce((s, r) => s + Number(r.credit_amount), 0);
    const inQueue = requests.filter((r) => !["PAID_OUT", "DENIED"].includes(r.status)).reduce((s, r) => s + Number(r.credit_amount), 0);
    const remaining = pool - paidOut - inQueue;
    return { pool, paidOut, inQueue, remaining };
  }, [requests]);

  // Budget runway calculation
  const runway = useMemo(() => {
    const now = new Date();
    const fyStart = new Date(2026, 0, 1); // Jan 2026
    const monthsElapsed = Math.max(1, (now.getFullYear() - fyStart.getFullYear()) * 12 + (now.getMonth() - fyStart.getMonth()));
    const monthlyBurn = budget.paidOut / monthsElapsed;
    const remaining = budget.pool - budget.paidOut;
    const monthsRemaining = monthlyBurn > 0 ? remaining / monthlyBurn : 99;
    const exhaustionDate = new Date(now);
    exhaustionDate.setMonth(exhaustionDate.getMonth() + Math.floor(monthsRemaining));
    const color = monthsRemaining > 12 ? "green" : monthsRemaining > 6 ? "amber" : "red";
    return { monthlyBurn, monthsRemaining, exhaustionDate, color };
  }, [budget]);

  // OOO crisis deals
  const crisisDeals = useMemo(() => {
    return requests.filter((r) => {
      if (!["DIRECTOR_PENDING", "VP_PENDING"].includes(r.status)) return false;
      const approver = approvers.find((a) => a.id === r.assigned_approver_id);
      if (!approver?.is_ooo) return false;
      const days = bizDaysBetween(r.updated_at, new Date());
      return days >= 5;
    }).map((r) => {
      const approver = approvers.find((a) => a.id === r.assigned_approver_id)!;
      const days = bizDaysBetween(r.updated_at, new Date());
      return { ...r, approverName: approver.name, days };
    });
  }, [requests, approvers]);

  const donutData = [
    { name: "Paid Out", value: budget.paidOut, color: "hsl(152, 60%, 40%)" },
    { name: "In Queue", value: budget.inQueue, color: "hsl(231, 48%, 48%)" },
    { name: "Remaining", value: Math.max(0, budget.remaining), color: "hsl(220, 16%, 90%)" },
  ];

  const activeRequests = requests.filter((r) => !["PAID_OUT", "DENIED"].includes(r.status));
  const avgDeal = activeRequests.length > 0 ? activeRequests.reduce((s, r) => s + Number(r.credit_amount), 0) / activeRequests.length : 0;

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (searchQuery && !r.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) && !r.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (stageFilter !== "all" && r.status !== stageFilter) return false;
      if (tierFilter !== "all" && r.tier !== tierFilter) return false;
      return true;
    });
  }, [requests, searchQuery, stageFilter, tierFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getWhyStuck = (r: Tables<"credit_requests">) => {
    const approver = approvers.find((a) => a.id === r.assigned_approver_id);
    const days = bizDaysBetween(r.updated_at, new Date());
    if (approver?.is_ooo && !approver.ooo_delegate_id) {
      return { reason: `OOO — ${approver.name} is out of office with no backup assigned`, action: "Reassign Now", type: "ooo" as const };
    }
    if (approver?.is_ooo && approver.ooo_delegate_id) {
      const delegate = approvers.find((a) => a.id === approver.ooo_delegate_id);
      return { reason: `OOO — ${approver.name} is out. Delegate: ${delegate?.name || "Unknown"}`, action: "Reassign Now", type: "ooo" as const };
    }
    if (r.status === "NEEDS_CHANGES") {
      return { reason: `Awaiting customer response since ${new Date(r.updated_at).toLocaleDateString()}`, action: "Send Reminder", type: "customer" as const };
    }
    if (["DIRECTOR_PENDING", "VP_PENDING"].includes(r.status) && days >= 5) {
      return { reason: `Approval stalled — ${approver?.name || "Unknown"} has not acted (${days} days)`, action: "Escalate", type: "stalled" as const };
    }
    return { reason: `No activity for ${days} business days`, action: "View Deal", type: "generic" as const };
  };

  const handleStuckAction = (r: Tables<"credit_requests">, type: string) => {
    if (type === "ooo" || type === "stalled") {
      navigate(`/internal/deals/${r.tracking_id}`);
    } else if (type === "customer") {
      toast({ title: "Reminder sent (demo)", description: `Customer ${r.customer_name} has been notified.` });
    } else {
      navigate(`/internal/deals/${r.tracking_id}`);
    }
  };

  const runwayColors = {
    green: { bg: "bg-green-50 border-green-200", text: "text-green-800", badge: "text-green-600" },
    amber: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", badge: "text-amber-600" },
    red: { bg: "bg-red-50 border-red-200", text: "text-red-800", badge: "text-red-600" },
  };
  const rc = runwayColors[runway.color as keyof typeof runwayColors];

  return (
    <InternalLayout>
      <div className="p-6 space-y-6">
        {/* Crisis Banner */}
        {crisisDeals.length > 0 && (
          <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">
                SLA Breach — Deal {crisisDeals[0].tracking_id} has been waiting {crisisDeals[0].days} days with no action.
              </p>
              <p className="text-xs text-destructive/80">
                {crisisDeals[0].approverName} is OOO. ${Number(crisisDeals[0].credit_amount).toLocaleString()} at risk.
                {crisisDeals.length > 1 && ` +${crisisDeals.length - 1} more deals affected.`}
              </p>
            </div>
            <Button size="sm" variant="destructive" asChild>
              <Link to={`/internal/deals/${crisisDeals[0].tracking_id}`}>
                Resolve Now <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl">Finance Queue</h1>
            <p className="text-sm text-muted-foreground">Manage and review partner credit requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button size="sm" asChild>
              <Link to="/customer/submit">
                <Plus className="h-4 w-4 mr-2" /> New Entry
              </Link>
            </Button>
          </div>
        </div>

        {/* Budget Runway Alert */}
        {!loading && (
          <Card className={`border ${rc.bg}`}>
            <CardContent className="p-4 flex items-center gap-6">
              <div className="shrink-0">
                <p className={`text-xs font-semibold uppercase tracking-wider ${rc.text} mb-1`}>Budget Runway Alert</p>
                <p className={`font-display font-bold text-2xl ${rc.badge}`}>
                  {runway.exhaustionDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
              <p className={`text-xs ${rc.text} leading-relaxed flex-1`}>
                At the current approval rate of ${Math.round(runway.monthlyBurn / 1000)}K/month, the FY2026 credit pool will be exhausted by{" "}
                {runway.exhaustionDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} — {Math.round(runway.monthsRemaining)} months
                {runway.monthsRemaining > 8 ? " of runway remaining." : " before year end."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Top Row: Budget + Queue Health */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">FY2026 Credit Pool</h3>
              <div className="flex items-center gap-8">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">TOTAL</span>
                    <span className="font-display font-bold text-lg">$1.0M</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-sm">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">${(d.value / 1000).toFixed(0)}K</span>
                        <span className="text-xs text-muted-foreground ml-2">{((d.value / budget.pool) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="text-xs uppercase tracking-wider opacity-80 mb-4">Active Queue Health</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 opacity-70">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">In Queue</span>
                  </div>
                  <p className="font-display font-bold text-3xl">{activeRequests.length}</p>
                  <p className="text-xs opacity-60 mt-0.5">${(budget.inQueue / 1000).toFixed(0)}K total</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 opacity-70">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-xs">Avg Deal</span>
                  </div>
                  <p className="font-display font-bold text-3xl">${(avgDeal / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 opacity-70">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">SLA Met</span>
                  </div>
                  <p className="font-display font-bold text-3xl">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by ID or customer..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10" />
          </div>
          <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="FINANCE_REVIEW">Finance Review</SelectItem>
              <SelectItem value="DIRECTOR_PENDING">Director Pending</SelectItem>
              <SelectItem value="VP_PENDING">VP Pending</SelectItem>
              <SelectItem value="NEEDS_CHANGES">Needs Changes</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PAID_OUT">Paid Out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="UNDER_10K">&lt; $10K</SelectItem>
              <SelectItem value="BETWEEN_10K_50K">$10K–$50K</SelectItem>
              <SelectItem value="OVER_50K">&gt; $50K</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Solution</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No requests found.</TableCell></TableRow>
              ) : (
                paginated.flatMap((r) => {
                  const overdue = !["APPROVED", "PAID_OUT", "DENIED"].includes(r.status) && isOverdue(r.updated_at);
                  const isExpanded = expandedRow === r.id;
                  const stuck = overdue ? getWhyStuck(r) : null;

                  const rows = [
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link to={`/internal/deals/${r.tracking_id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                          {r.tracking_id}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{r.customer_name}</TableCell>
                      <TableCell className="text-right font-display font-semibold">${Number(r.credit_amount).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {r.products.slice(0, 2).map((p) => (
                            <span key={p} className="inline-flex items-center rounded bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground">{p}</span>
                          ))}
                          {r.products.length > 2 && <span className="text-[11px] text-muted-foreground">+{r.products.length - 2}</span>}
                        </div>
                      </TableCell>
                      <TableCell><TierBadge tier={r.tier} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={r.status} />
                          {overdue && (
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                              className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="h-3 w-3" /> Overdue
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/internal/deals/${r.tracking_id}`}><ExternalLink className="h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>,
                  ];

                  if (isExpanded && stuck) {
                    rows.push(
                      <TableRow key={`${r.id}-stuck`} className="bg-amber-50/60 hover:bg-amber-50/80">
                        <TableCell colSpan={7} className="py-3">
                          <div className="flex items-center justify-between gap-4 px-2">
                            <div className="flex items-center gap-3">
                              <UserX className="h-4 w-4 text-amber-600 shrink-0" />
                              <p className="text-sm text-amber-800">{stuck.reason}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0"
                              onClick={() => handleStuckAction(r, stuck.type)}
                            >
                              {stuck.type === "customer" && <Send className="h-3 w-3 mr-1" />}
                              {stuck.type === "ooo" && <UserX className="h-3 w-3 mr-1" />}
                              {stuck.type === "stalled" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                              {stuck.action}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return rows;
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i + 1)} className="w-8 h-8 p-0">
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
