import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { TierBadge } from "@/components/TierBadge";
import { TimelineStep } from "@/components/TimelineStep";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, DollarSign, Calendar, User } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const LIFECYCLE_STEPS = [
  { key: "SUBMITTED", label: "Request Submitted", desc: "Your credit request has been received." },
  { key: "FINANCE_REVIEW", label: "Finance Review", desc: "A finance analyst is reviewing your request." },
  { key: "DIRECTOR_PENDING", label: "Director Approval", desc: "Pending director-level sign-off." },
  { key: "VP_PENDING", label: "VP Approval", desc: "Final executive approval required." },
  { key: "APPROVED", label: "Approved", desc: "Credit approved and processing for payout." },
  { key: "PAID_OUT", label: "Paid Out", desc: "Credit has been disbursed to your account." },
];

const STATUS_ORDER: Record<string, number> = {
  SUBMITTED: 0, FINANCE_REVIEW: 1, DIRECTOR_PENDING: 2, VP_PENDING: 3,
  APPROVED: 4, PAID_OUT: 5, NEEDS_CHANGES: 1, DENIED: -1,
};

export default function StatusPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [request, setRequest] = useState<Tables<"credit_requests"> | null>(null);
  const [history, setHistory] = useState<Tables<"status_history">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackingId) return;
    (async () => {
      const { data: req } = await supabase
        .from("credit_requests")
        .select("*")
        .eq("tracking_id", trackingId)
        .single();
      setRequest(req);

      if (req) {
        const { data: hist } = await supabase
          .from("status_history")
          .select("*")
          .eq("request_id", req.id)
          .order("created_at", { ascending: true });
        setHistory(hist || []);
      }
      setLoading(false);
    })();
  }, [trackingId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <div className="animate-pulse text-muted-foreground">Loading request...</div>
        </div>
      </PublicLayout>
    );
  }

  if (!request) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <h1 className="font-display font-bold text-2xl mb-4">Request Not Found</h1>
          <p className="text-muted-foreground mb-6">No request found with tracking ID "{trackingId}".</p>
          <Button asChild><Link to="/my-requests">Search Requests</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const currentIndex = STATUS_ORDER[request.status] ?? 0;
  const stepsToShow = request.tier === "UNDER_10K"
    ? LIFECYCLE_STEPS.filter((s) => !["DIRECTOR_PENDING", "VP_PENDING"].includes(s.key))
    : request.tier === "BETWEEN_10K_50K"
    ? LIFECYCLE_STEPS.filter((s) => s.key !== "VP_PENDING")
    : LIFECYCLE_STEPS;

  return (
    <PublicLayout>
      <div className="container py-10 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Main */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display font-bold text-2xl">{request.tracking_id}</h1>
              <StatusBadge status={request.status} />
              <TierBadge tier={request.tier} />
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Last updated {new Date(request.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            {request.status === "NEEDS_CHANGES" && (
              <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 mb-8">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Action Required</p>
                  <p className="text-xs text-muted-foreground">The finance team has requested changes to your submission. Please review and resubmit.</p>
                </div>
                <Button size="sm" variant="outline" className="ml-auto shrink-0">
                  Resubmit
                </Button>
              </div>
            )}

            {request.status === "DENIED" && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 mb-8">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Request Denied</p>
                  <p className="text-xs text-muted-foreground">{request.denial_reason || "Contact your partner manager for details."}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display font-semibold text-lg mb-6">Funding Lifecycle</h2>
                <div>
                  {stepsToShow.map((step, i) => {
                    const stepIndex = STATUS_ORDER[step.key] ?? i;
                    let status: "completed" | "current" | "upcoming" = "upcoming";
                    if (request.status === "DENIED") {
                      status = stepIndex <= currentIndex ? "completed" : "upcoming";
                    } else if (stepIndex < currentIndex) {
                      status = "completed";
                    } else if (stepIndex === currentIndex) {
                      status = "current";
                    }

                    const histEntry = history.find((h) => h.to_status === step.key);
                    const timestamp = histEntry
                      ? new Date(histEntry.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : undefined;

                    return (
                      <TimelineStep
                        key={step.key}
                        label={step.label}
                        description={step.desc}
                        status={status}
                        timestamp={timestamp}
                        isLast={i === stepsToShow.length - 1}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            {history.length > 0 && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h2 className="font-display font-semibold text-lg mb-4">Activity Log</h2>
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p>
                            <span className="font-medium">{h.changed_by}</span> changed status to{" "}
                            <span className="font-medium">{h.to_status.replace(/_/g, " ")}</span>
                          </p>
                          {h.comments && <p className="text-muted-foreground text-xs mt-0.5">{h.comments}</p>}
                          <p className="text-xs text-muted-foreground">
                            {new Date(h.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Partnership Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Requested Amount</p>
                      <p className="font-display font-bold text-2xl">${request.credit_amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-semibold">{request.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fiscal Year</p>
                      <p className="font-semibold">{request.fiscal_year}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {request.products.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Products</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.products.map((p) => (
                      <span key={p} className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{p}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <p className="text-xs uppercase tracking-wider opacity-80 mb-2">Projected ROI</p>
                <p className="font-display font-bold text-3xl">2.4x</p>
                <p className="text-xs opacity-80 mt-1">Based on similar partner engagements</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
