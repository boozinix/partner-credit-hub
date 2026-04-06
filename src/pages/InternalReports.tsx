import { useEffect, useState, useMemo } from "react";
import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { DollarSign, Clock, TrendingUp, BarChart3, Filter, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from "@/integrations/supabase/types";

const TIER_LABELS: Record<string, string> = {
  UNDER_10K: "Under $10K",
  BETWEEN_10K_50K: "$10K – $50K",
  OVER_50K: "Over $50K",
};

const TIER_COLORS: Record<string, string> = {
  UNDER_10K: "hsl(152, 60%, 40%)",
  BETWEEN_10K_50K: "hsl(231, 48%, 48%)",
  OVER_50K: "hsl(340, 65%, 50%)",
};

const PRODUCT_COLORS = [
  "hsl(231, 48%, 48%)",
  "hsl(152, 60%, 40%)",
  "hsl(340, 65%, 50%)",
  "hsl(45, 90%, 50%)",
  "hsl(200, 70%, 45%)",
  "hsl(280, 50%, 55%)",
  "hsl(20, 80%, 50%)",
  "hsl(170, 60%, 40%)",
];

const MONTH_OPTIONS = [
  { value: "all", label: "All Months" },
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

export default function InternalReports() {
  const [allRequests, setAllRequests] = useState<Tables<"credit_requests">[]>([]);
  const [loading, setLoading] = useState(true);
  const [productView, setProductView] = useState<"count" | "amount">("count");

  // Filters
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("credit_requests").select("*");
      setAllRequests(data || []);
      setLoading(false);
    })();
  }, []);

  // All unique products for filter dropdown
  const allProducts = useMemo(() => {
    const set = new Set<string>();
    allRequests.forEach((r) => r.products.forEach((p) => set.add(p)));
    return Array.from(set).sort();
  }, [allRequests]);

  // Filtered requests
  const requests = useMemo(() => {
    return allRequests.filter((r) => {
      if (filterMonth !== "all") {
        const m = new Date(r.created_at).getMonth();
        if (m !== parseInt(filterMonth)) return false;
      }
      if (filterProduct !== "all") {
        if (!r.products.includes(filterProduct)) return false;
      }
      const amt = Number(r.credit_amount);
      if (filterMinAmount && amt < parseFloat(filterMinAmount)) return false;
      if (filterMaxAmount && amt > parseFloat(filterMaxAmount)) return false;
      return true;
    });
  }, [allRequests, filterMonth, filterProduct, filterMinAmount, filterMaxAmount]);

  const hasFilters = filterMonth !== "all" || filterProduct !== "all" || filterMinAmount || filterMaxAmount;

  const clearFilters = () => {
    setFilterMonth("all");
    setFilterProduct("all");
    setFilterMinAmount("");
    setFilterMaxAmount("");
  };

  // Monthly bar chart (always uses full dataset for context, highlights filtered month)
  const monthlyData = useMemo(() => {
    const approved = requests.filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status));
    const months: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthNames.forEach((m) => (months[m] = 0));
    approved.forEach((r) => {
      const key = monthNames[new Date(r.created_at).getMonth()];
      months[key] += Number(r.credit_amount);
    });
    return monthNames.map((m) => ({ month: m, amount: months[m] })).filter((_, i) => i <= new Date().getMonth());
  }, [requests]);

  const productData = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    requests.forEach((r) => {
      r.products.forEach((p) => {
        if (!map[p]) map[p] = { count: 0, amount: 0 };
        map[p].count++;
        map[p].amount += Number(r.credit_amount);
      });
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, count: d.count, amount: d.amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [requests]);

  const tierData = useMemo(() => {
    const counts: Record<string, { count: number; amount: number }> = {};
    requests.forEach((r) => {
      if (!counts[r.tier]) counts[r.tier] = { count: 0, amount: 0 };
      counts[r.tier].count++;
      counts[r.tier].amount += Number(r.credit_amount);
    });
    return Object.entries(counts).map(([tier, data]) => ({
      name: TIER_LABELS[tier] || tier, tier, count: data.count, amount: data.amount,
    }));
  }, [requests]);

  const avgApprovalDays = useMemo(() => {
    const approved = requests.filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status));
    if (approved.length === 0) return 0;
    const durations = approved.map((r) => {
      return (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
    });
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }, [requests]);

  const totalApprovedYTD = useMemo(() => {
    return requests.filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status)).reduce((s, r) => s + Number(r.credit_amount), 0);
  }, [requests]);

  const totalRequests = requests.length;
  const approvalRate = totalRequests > 0
    ? Math.round((requests.filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status)).length / totalRequests) * 100)
    : 0;

  if (loading) {
    return <InternalLayout><div className="p-6 text-center text-muted-foreground py-20">Loading reports...</div></InternalLayout>;
  }

  return (
    <InternalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">FY2026 partner credit intelligence</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</span>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs text-muted-foreground ml-auto gap-1">
                  <X className="h-3 w-3" /> Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Month</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Product</Label>
                <Select value={filterProduct} onValueChange={setFilterProduct}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Products</SelectItem>
                    {allProducts.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Min Amount</Label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Max Amount</Label>
                <Input
                  type="number"
                  placeholder="No max"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            {hasFilters && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Showing {requests.length} of {allRequests.length} requests
              </p>
            )}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-success" /></div><div><p className="text-2xl font-display font-bold">${(totalApprovedYTD / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Approved YTD</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-display font-bold">{totalRequests}</p><p className="text-xs text-muted-foreground">Total Requests</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div><div><p className="text-2xl font-display font-bold">{avgApprovalDays}d</p><p className="text-xs text-muted-foreground">Avg Approval Time</p></div></div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-display font-bold">{approvalRate}%</p><p className="text-xs text-muted-foreground">Approval Rate</p></div></div></CardContent></Card>
        </div>

        {/* Monthly Credits Bar Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Credits Approved by Month</h3>
            <p className="text-sm text-muted-foreground mb-6">FY2026 year-to-date approved credit distribution</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barSize={32}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Approved"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, i) => (
                      <Cell key={i} fill={entry.amount > 0 ? "hsl(231, 48%, 48%)" : "hsl(220, 16%, 90%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row: Product + Tier */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Requests by Product</h3>
                <Tabs value={productView} onValueChange={(v) => setProductView(v as "count" | "amount")}>
                  <TabsList className="h-7">
                    <TabsTrigger value="count" className="text-[10px] px-2 h-5">Count</TabsTrigger>
                    <TabsTrigger value="amount" className="text-[10px] px-2 h-5">Dollars</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {productView === "count" ? "Number of requests per product" : "Total credit dollars per product"}
              </p>
              <div className="space-y-3">
                {productData.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No data matches current filters</p>
                )}
                {productData.map((p, i) => {
                  const maxVal = Math.max(...productData.map((x) => productView === "count" ? x.count : x.amount));
                  const val = productView === "count" ? p.count : p.amount;
                  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  return (
                    <div key={p.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }} />
                          <span className="text-xs font-medium truncate max-w-[180px]">{p.name}</span>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">
                          {productView === "count" ? `${p.count} requests` : `$${(p.amount / 1000).toFixed(0)}K`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Distribution by Tier</h3>
              <p className="text-sm text-muted-foreground mb-6">Request count and value across approval tiers</p>
              <div className="space-y-5 mt-8">
                {tierData.map((t) => {
                  const maxCount = Math.max(...tierData.map((x) => x.count));
                  const pct = maxCount > 0 ? (t.count / maxCount) * 100 : 0;
                  return (
                    <div key={t.tier}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t.name}</span>
                        <span className="text-xs text-muted-foreground">{t.count} requests · ${(t.amount / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: TIER_COLORS[t.tier] || "hsl(231, 48%, 48%)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-8">
                {tierData.map((t) => (
                  <div key={t.tier} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="font-display font-bold text-xl">{t.count}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InternalLayout>
  );
}
