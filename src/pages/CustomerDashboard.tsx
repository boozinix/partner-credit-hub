import { Link } from "react-router-dom";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { usePersona } from "@/contexts/PersonaContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowRight, Plus, FileText, Clock, CheckCircle2, AlertTriangle, Pencil } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function CustomerDashboard() {
  const { persona } = usePersona();
  const [requests, setRequests] = useState<Tables<"credit_requests">[]>([]);
  const [loading, setLoading] = useState(true);
  const [howItWorksOpen, setHowItWorksOpen] = useState(() => {
    return localStorage.getItem("howItWorksDismissed") !== "true";
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("credit_requests")
        .select("*")
        .eq("customer_email", persona.email)
        .order("created_at", { ascending: false });
      setRequests(data || []);
      setLoading(false);
    })();
  }, [persona.email]);

  const pending = requests.filter((r) => ["SUBMITTED", "FINANCE_REVIEW", "DIRECTOR_PENDING", "VP_PENDING"].includes(r.status));
  const needsAction = requests.filter((r) => r.status === "NEEDS_CHANGES");
  const approved = requests.filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status));
  const totalAmount = requests.reduce((s, r) => s + Number(r.credit_amount), 0);

  return (
    <CustomerLayout>
      <div className="container py-10 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl">Welcome back, {persona.name.split(" ")[0]}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{persona.company} · Partner Credit Dashboard</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/customer/submit">
              <Plus className="h-4 w-4 mr-2" /> New Credit Request
            </Link>
          </Button>
        </div>

        {/* How It Works */}
        <Collapsible open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 mb-8">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold text-sm">How this works</h3>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    if (howItWorksOpen) {
                      localStorage.setItem("howItWorksDismissed", "true");
                    }
                  }}
                >
                  {howItWorksOpen ? "Got it ✓" : "Show steps"}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="grid md:grid-cols-3 gap-4 mt-3">
                {[
                  { icon: Pencil, title: "Submit your request", desc: "Fill out your deal details and select which Red Hat products you purchased on AWS Marketplace." },
                  { icon: Clock, title: "Finance reviews & routes", desc: "Your request is reviewed by AWS Finance. Depending on the credit amount, it may require Director or VP approval." },
                  { icon: CheckCircle2, title: "Credit applied to your account", desc: "Once approved, credits are applied directly to your AWS account by the payout date." },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-display font-bold">{requests.length}</p>
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-display font-bold">{pending.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-display font-bold">{approved.length}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-display font-bold">{needsAction.length}</p>
                  <p className="text-xs text-muted-foreground">Action Required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Required Banner */}
        {needsAction.length > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold">{needsAction.length} request{needsAction.length > 1 ? "s" : ""} need{needsAction.length === 1 ? "s" : ""} your attention</p>
                <p className="text-xs text-muted-foreground">The finance team has requested changes. Please review and respond.</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/customer/requests">Review Now</Link>
            </Button>
          </div>
        )}

        {/* Recent Requests */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Recent Requests</h2>
          <Link to="/customer/requests" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">No requests yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Submit your first credit request to get started.</p>
              <Button asChild>
                <Link to="/customer/submit">Submit Request</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((r) => (
              <Link key={r.id} to={`/customer/status/${r.tracking_id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm font-mono">{r.tracking_id}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()} · {r.products.slice(0, 2).join(", ")}
                        {r.products.length > 2 && ` +${r.products.length - 2}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg">${Number(r.credit_amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{r.credit_type}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
