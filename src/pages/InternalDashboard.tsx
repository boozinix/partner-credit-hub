import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
import { Search, Download, Plus, ExternalLink, Clock, TrendingUp, AlertCircle } from "lucide-react";
import type { Tables, Enums } from "@/integrations/supabase/types";

export default function InternalDashboard() {
  const [requests, setRequests] = useState<Tables<"credit_requests">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("credit_requests").select("*").order("created_at", { ascending: false });
      setRequests(data || []);
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

  return (
    <InternalLayout>
      <div className="p-6 space-y-6">
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
              <Link to="/submit">
                <Plus className="h-4 w-4 mr-2" /> New Entry
              </Link>
            </Button>
          </div>
        </div>

        {/* Top Row: Budget + Queue Health */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">FY2026 Credit Pool</h3>
              <div className="flex items-center gap-8">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--card))"
                      >
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
                        <span className="text-xs text-muted-foreground ml-2">
                          {((d.value / budget.pool) * 100).toFixed(0)}%
                        </span>
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
                    <span className="text-xs">Pending</span>
                  </div>
                  <p className="font-display font-bold text-3xl">{activeRequests.length}</p>
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
                paginated.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link to={`/internal/deals/${r.tracking_id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                        {r.tracking_id}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{r.customer_name}</TableCell>
                    <TableCell className="text-right font-display font-semibold">${Number(r.credit_amount).toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{r.products[0] || "—"}</TableCell>
                    <TableCell><TierBadge tier={r.tier} /></TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/internal/deals/${r.tracking_id}`}><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-8 h-8 p-0"
                >
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
