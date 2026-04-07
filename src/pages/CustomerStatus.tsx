import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { usePersona } from "@/contexts/PersonaContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";

import { TimelineStep } from "@/components/TimelineStep";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, DollarSign, Calendar, User, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const LIFECYCLE_STEPS = [
  { key: "SUBMITTED", label: "Request Submitted", desc: "Your credit request has been received.", estDays: 0 },
  { key: "FINANCE_REVIEW", label: "Finance Review", desc: "A finance analyst is reviewing your request.", estDays: 3 },
  { key: "DIRECTOR_PENDING", label: "Director Approval", desc: "Pending director-level sign-off.", estDays: 5 },
  { key: "VP_PENDING", label: "VP Approval", desc: "Final executive approval required.", estDays: 7 },
  { key: "APPROVED", label: "Approved", desc: "Credit approved and processing for payout.", estDays: 10 },
  { key: "PAID_OUT", label: "Paid Out", desc: "Credit has been disbursed to your account.", estDays: 30 },
];

const STATUS_ORDER: Record<string, number> = {
  SUBMITTED: 0, FINANCE_REVIEW: 1, DIRECTOR_PENDING: 2, VP_PENDING: 3,
  APPROVED: 4, PAID_OUT: 5, NEEDS_CHANGES: 1, DENIED: -1,
};

export default function CustomerStatus() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const { persona } = usePersona();
  const { toast } = useToast();
  const [request, setRequest] = useState<Tables<"credit_requests"> | null>(null);
  const [history, setHistory] = useState<Tables<"status_history">[]>([]);
  const [loading, setLoading] = useState(true);
  const [followUp, setFollowUp] = useState("");
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    if (!trackingId) return;
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
  };

  useEffect(() => { fetchData(); }, [trackingId]);

  const handleFollowUp = async () => {
    if (!request || !followUp.trim()) return;
    setSending(true);

    if (request.status === "NEEDS_CHANGES") {
      // Resubmit
      await supabase.from("credit_requests").update({ status: "FINANCE_REVIEW" as any }).eq("id", request.id);
      await supabase.from("status_history").insert({
        request_id: request.id,
        from_status: "NEEDS_CHANGES",
        to_status: "FINANCE_REVIEW" as any,
        changed_by: persona.email,
        comments: followUp,
      });
      toast({ title: "Request resubmitted", description: "Your response has been sent to the finance team." });
    } else {
      // Add a comment
      await supabase.from("status_history").insert({
        request_id: request.id,
        from_status: request.status,
        to_status: request.status,
        changed_by: persona.email,
        comments: followUp,
      });
      toast({ title: "Message sent", description: "Your follow-up has been logged." });
    }

    setFollowUp("");
    setSending(false);
    fetchData();
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container py-20 text-center text-muted-foreground">Loading request...</div>
      </CustomerLayout>
    );
  }

  if (!request) {
    return (
      <CustomerLayout>
        <div className="container py-20 text-center">
          <h1 className="font-display font-bold text-2xl mb-4">Request Not Found</h1>
          <p className="text-muted-foreground mb-6">No request found with tracking ID "{trackingId}".</p>
          <Button asChild><Link to="/customer/requests">Back to My Requests</Link></Button>
        </div>
      </CustomerLayout>
    );
  }

  const currentIndex = STATUS_ORDER[request.status] ?? 0;
  const stepsToShow = request.tier === "UNDER_10K"
    ? LIFECYCLE_STEPS.filter((s) => !["DIRECTOR_PENDING", "VP_PENDING"].includes(s.key))
    : request.tier === "BETWEEN_10K_50K"
    ? LIFECYCLE_STEPS.filter((s) => s.key !== "VP_PENDING")
    : LIFECYCLE_STEPS;

  const statusCallouts: Record<string, { color: string; borderColor: string; icon: string; text: string }> = {
    SUBMITTED: { color: "bg-blue-50", borderColor: "border-l-blue-500", icon: "📥", text: "Your request has been received and is in our queue. A Finance Analyst will begin review within 1 business day." },
    FINANCE_REVIEW: { color: "bg-blue-50", borderColor: "border-l-blue-500", icon: "🔍", text: "An AWS Finance Analyst is actively reviewing your submission. They're verifying your deal details and credit eligibility. No action needed from you right now." },
    DIRECTOR_PENDING: { color: "bg-purple-50", borderColor: "border-l-purple-500", icon: "📋", text: "Your request has passed Finance review and is now awaiting Director approval. Required for credits between $10K–$50K. Typically takes 2-3 business days." },
    VP_PENDING: { color: "bg-purple-50", borderColor: "border-l-purple-500", icon: "📋", text: "Your request is awaiting VP approval. Required for credits above $50K. Typically takes 3-5 business days." },
    NEEDS_CHANGES: { color: "bg-amber-50", borderColor: "border-l-amber-500", icon: "⚠️", text: "Action Required: Finance has reviewed your request and needs additional information. Check your email for details, then use the button below to update and resubmit." },
    APPROVED: { color: "bg-green-50", borderColor: "border-l-green-500", icon: "🎉", text: "Approved! Your credit has been approved and will be applied to your AWS account by the payout date shown below." },
    PAID_OUT: { color: "bg-green-50", borderColor: "border-l-green-500", icon: "✅", text: "Complete. Your credit has been disbursed to your AWS account. Check your AWS billing dashboard to confirm." },
    DENIED: { color: "bg-red-50", borderColor: "border-l-red-500", icon: "❌", text: "This request was not approved. See the reason below. If you believe this is an error, contact your AWS Partner Manager." },
  };

  const callout = statusCallouts[request.status];

  return (
    <CustomerLayout>
      <div className="container py-10 max-w-6xl">
        {/* Back link */}
        <Link to="/customer/requests" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to My Requests
        </Link>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Main */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display font-bold text-2xl">{request.tracking_id}</h1>
              <StatusBadge status={request.status} />
              
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Last updated {new Date(request.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            {/* What's happening right now */}
            {callout && (
              <div className={`rounded-lg border-l-4 ${callout.borderColor} ${callout.color} p-4 mb-6 flex items-start gap-3`}>
                <span className="text-lg shrink-0">{callout.icon}</span>
                <p className="text-sm leading-relaxed">{callout.text}</p>
              </div>
            )}

            {/* Status Banners */}
            {request.status === "NEEDS_CHANGES" && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 mb-8">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Action Required — Changes Requested</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The finance team has requested changes. Use the response box below to address their feedback and resubmit.
                  </p>
                </div>
              </div>
            )}

            {request.status === "APPROVED" && (
              <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4 mb-8">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Credit Approved!</p>
                  <p className="text-xs text-muted-foreground">Your credit request has been fully approved. Payout will be processed within 30 business days.</p>
                </div>
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
                      : status === "upcoming" && step.estDays > 0
                      ? `+${step.estDays} business days`
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

            {/* Follow-up / Respond */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="font-display font-semibold text-lg mb-3">
                  {request.status === "NEEDS_CHANGES" ? "Respond & Resubmit" : "Send Follow-up"}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  {request.status === "NEEDS_CHANGES"
                    ? "Address the finance team's feedback and resubmit your request."
                    : "Send a message or additional information to the review team."}
                </p>
                <Textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder={
                    request.status === "NEEDS_CHANGES"
                      ? "I've addressed the requested changes. The corrected invoice dates are..."
                      : "Additional information or follow-up question..."
                  }
                  className="min-h-[100px] mb-3"
                />
                <div className="flex justify-end">
                  <Button onClick={handleFollowUp} disabled={sending || !followUp.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {request.status === "NEEDS_CHANGES" ? "Respond & Resubmit" : "Send Message"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
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
                            <span className="font-medium">{h.changed_by}</span>
                            {h.from_status !== h.to_status && (
                              <> → <span className="font-medium">{h.to_status.replace(/_/g, " ")}</span></>
                            )}
                          </p>
                          {h.comments && <p className="text-muted-foreground text-xs mt-0.5">{h.comments}</p>}
                          <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</p>
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
                      <p className="font-display font-bold text-2xl">${Number(request.credit_amount).toLocaleString()}</p>
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
    </CustomerLayout>
  );
}
