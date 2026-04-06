import { useEffect, useState, useMemo } from "react";
import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { DollarSign, Clock, TrendingUp, BarChart3 } from "lucide-react";
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

export default function InternalReports() {
  const [requests, setRequests] = useState<Tables<"credit_requests">[]>([]);
  const [history, setHistory] = useState<Tables<"status_history">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [reqRes, histRes] = await Promise.all([
        supabase.from("credit_requests").select("*"),
        supabase.from("status_history").select("*"),
      ]);
      setRequests(reqRes.data || []);
      setHistory(histRes.data || []);
      setLoading(false);
    })();
  }, []);

  // YTD approved credits by month
  const monthlyData = useMemo(() => {
    const approved = requests.filter((r) =>
      ["APPROVED", "PAID_OUT"].includes(r.status)
    );
    const months: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize all months
    monthNames.forEach((m) => (months[m] = 0));

    approved.forEach((r) => {
      const d = new Date(r.created_at);
      const key = monthNames[d.getMonth()];
      months[key] += Number(r.credit_amount);
    });

    return monthNames.map((m) => ({ month: m, amount: months[m] })).filter((_, i) => i <= new Date().getMonth());
  }, [requests]);

  // Product breakdown
  const productData = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      r.products.forEach((p) => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [requests]);

  // Tier breakdown
  const tierData = useMemo(() => {
    const counts: Record<string, { count: number; amount: number }> = {};
    requests.forEach((r) => {
      if (!counts[r.tier]) counts[r.tier] = { count: 0, amount: 0 };
      counts[r.tier].count++;
      counts[r.tier].amount += Number(r.credit_amount);
    });
    return Object.entries(counts).map(([tier, data]) => ({
      name: TIER_LABELS[tier] || tier,
      tier,
      count: data.count,
      amount: data.amount,
    }));
  }, [requests]);

  // Average time to approval (for APPROVED/PAID_OUT requests)
  const avgApprovalDays = useMemo(() => {
    const approved = requests.filter((r) =>
      ["APPROVED", "PAID_OUT"].includes(r.status)
    );
    if (approved.length === 0) return 0;

    const durations = approved.map((r) => {
      const created = new Date(r.created_at).getTime();
      const updated = new Date(r.updated_at).getTime();
      return (updated - created) / (1000 * 60 * 60 * 24);
    });

    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }, [requests]);

  const totalApprovedYTD = useMemo(() => {
    return requests
      .filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status))
      .reduce((s, r) => s + Number(r.credit_amount), 0);
  }, [requests]);

  const totalRequests = requests.length;
  const approvalRate = totalRequests > 0
    ? Math.round((requests.filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status)).length / totalRequests) * 100)
    : 0;

  if (loading) {
    return (
      <InternalLayout>
        <div className="p-6 text-center text-muted-foreground py-20">Loading reports...</div>
      </InternalLayout>
    );
  }

  return (
    <InternalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">FY2026 partner credit intelligence</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">${(totalApprovedYTD / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Approved YTD</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{totalRequests}</p>
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{avgApprovalDays}d</p>
                  <p className="text-xs text-muted-foreground">Avg Approval Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{approvalRate}%</p>
                  <p className="text-xs text-muted-foreground">Approval Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Approved"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.amount > 0 ? "hsl(231, 48%, 48%)" : "hsl(220, 16%, 90%)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row: Product + Tier */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Breakdown */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Requests by Product</h3>
              <p className="text-sm text-muted-foreground mb-6">Which Red Hat products drive credit requests</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                      label={({ name, percent }) =>
                        `${name.length > 15 ? name.slice(0, 15) + "…" : name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {productData.map((_, i) => (
                        <Cell key={i} fill={PRODUCT_COLORS[i % PRODUCT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} requests`, "Count"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {productData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{p.name}</span>
                    <span className="font-semibold ml-auto">{p.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tier Breakdown */}
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
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: TIER_COLORS[t.tier] || "hsl(231, 48%, 48%)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tier summary cards */}
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
