import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { TierBadge } from "@/components/TierBadge";
import { TimelineStep } from "@/components/TimelineStep";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Shield, DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

const STATUS_ORDER: Record<string, number> = {
  SUBMITTED: 0, FINANCE_REVIEW: 1, DIRECTOR_PENDING: 2, VP_PENDING: 3, APPROVED: 4, PAID_OUT: 5,
};

export default function ApproverView() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const { toast } = useToast();
  const [request, setRequest] = useState<Tables<"credit_requests"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!trackingId) return;
    (async () => {
      const { data } = await supabase.from("credit_requests").select("*").eq("tracking_id", trackingId).single();
      setRequest(data);
      setLoading(false);
    })();
  }, [trackingId]);

  const handleAction = async (action: "approve" | "deny") => {
    if (!request) return;
    setActing(true);

    let newStatus: string;
    let comment: string;

    if (action === "deny") {
      newStatus = "DENIED";
      comment = `Rejected by approver. ${notes}`.trim();
    } else {
      if (request.status === "DIRECTOR_PENDING" && request.tier === "OVER_50K") {
        newStatus = "VP_PENDING";
        comment = `Director approved. Routing to VP. ${notes}`.trim();
      } else {
        newStatus = "APPROVED";
        comment = `Approved by reviewer. ${notes}`.trim();
      }
    }

    await supabase.from("credit_requests").update({ status: newStatus as any }).eq("id", request.id);
    await supabase.from("status_history").insert({
      request_id: request.id,
      from_status: request.status,
      to_status: newStatus as any,
      changed_by: "Approver",
      comments: comment,
    });

    toast({ title: action === "approve" ? "Request Approved" : "Request Rejected" });
    setActing(false);
    const { data } = await supabase.from("credit_requests").select("*").eq("tracking_id", trackingId!).single();
    setRequest(data);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  if (!request) return <div className="flex items-center justify-center min-h-screen">Request not found.</div>;

  const currentIndex = STATUS_ORDER[request.status] ?? 0;
  const steps = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "FINANCE_REVIEW", label: "Finance Review" },
    ...(request.tier !== "UNDER_10K" ? [{ key: "DIRECTOR_PENDING", label: "Director" }] : []),
    ...(request.tier === "OVER_50K" ? [{ key: "VP_PENDING", label: "VP" }] : []),
    { key: "APPROVED", label: "Approved" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xs">RH</span>
            </div>
            <span className="font-display font-semibold text-sm">Financial Services Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approver View</span>
          </div>
        </div>
      </header>

      <div className="container py-10 max-w-5xl">
        <Link to="/internal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to Finance Queue
        </Link>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Pending Request</p>
              <h1 className="font-display font-bold text-2xl flex items-center gap-3">
                {request.tracking_id}
                <StatusBadge status={request.status} />
              </h1>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                    <p className="font-semibold text-lg">{request.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Requested Amount</p>
                    <p className="font-display font-bold text-2xl text-primary flex items-center gap-1">
                      <DollarSign className="h-5 w-5" />
                      {Number(request.credit_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Tier</p>
                    <TierBadge tier={request.tier} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Products</p>
                    <div className="flex flex-wrap gap-1">
                      {request.products.map((p) => (
                        <span key={p} className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {request.business_justification && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Business Justification</h3>
                  <blockquote className="border-l-4 border-primary/40 pl-4 italic text-sm text-muted-foreground leading-relaxed">
                    {request.business_justification}
                  </blockquote>
                </CardContent>
              </Card>
            )}

            {/* Workflow Timeline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Mandatory Approval Workflow</h3>
                {steps.map((step, i) => {
                  const si = STATUS_ORDER[step.key] ?? i;
                  let status: "completed" | "current" | "upcoming" = "upcoming";
                  if (si < currentIndex) status = "completed";
                  else if (si === currentIndex) status = "current";
                  return (
                    <TimelineStep key={step.key} label={step.label} status={status} isLast={i === steps.length - 1} />
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-4">Reviewer Decision</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Executive notes (optional)..."
                  className="min-h-[100px] mb-4"
                />
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => handleAction("approve")} disabled={acting || !["DIRECTOR_PENDING", "VP_PENDING"].includes(request.status)}>
                    <Check className="h-4 w-4 mr-2" /> Approve Allocation
                  </Button>
                  <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/5" onClick={() => handleAction("deny")} disabled={acting || !["DIRECTOR_PENDING", "VP_PENDING"].includes(request.status)}>
                    <X className="h-4 w-4 mr-2" /> Reject Request
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
                  By approving this allocation, you confirm that the request has been reviewed in accordance with Red Hat's 
                  internal financial policies and AWS Marketplace partnership guidelines.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Supporting Materials</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">No documents attached.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t mt-16 py-6">
        <div className="container flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>Compliance Policy</span>
          <span>Audit Guidelines</span>
          <span>Internal Support</span>
        </div>
      </footer>
    </div>
  );
}
