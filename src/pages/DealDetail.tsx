import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { TierBadge } from "@/components/TierBadge";
import { TimelineStep } from "@/components/TimelineStep";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, RotateCcw, Mail, AlertTriangle, User, Building2, Calendar, DollarSign, ArrowLeft } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function DealDetail() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const { toast } = useToast();
  const [request, setRequest] = useState<Tables<"credit_requests"> | null>(null);
  const [history, setHistory] = useState<Tables<"status_history">[]>([]);
  const [approvalSteps, setApprovalSteps] = useState<(Tables<"approval_steps"> & { approver?: Tables<"approvers"> })[]>([]);
  const [approvers, setApprovers] = useState<Tables<"approvers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [acting, setActing] = useState(false);

  const fetchData = async () => {
    if (!trackingId) return;
    const { data: req } = await supabase.from("credit_requests").select("*").eq("tracking_id", trackingId).single();
    setRequest(req);
    if (req) {
      setInternalNotes(req.internal_notes || "");
      const [histRes, stepsRes, approversRes] = await Promise.all([
        supabase.from("status_history").select("*").eq("request_id", req.id).order("created_at", { ascending: true }),
        supabase.from("approval_steps").select("*, approver:approvers(*)").eq("request_id", req.id).order("created_at", { ascending: true }),
        supabase.from("approvers").select("*"),
      ]);
      setHistory(histRes.data || []);
      setApprovalSteps((stepsRes.data as any) || []);
      setApprovers(approversRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [trackingId]);

  const performAction = async (action: "approve" | "deny" | "send_back") => {
    if (!request) return;
    setActing(true);

    let newStatus: string;
    let comment: string;

    if (action === "deny") {
      newStatus = "DENIED";
      comment = "Request denied by finance team.";
    } else if (action === "send_back") {
      newStatus = "NEEDS_CHANGES";
      comment = "Changes requested. Please review and resubmit.";
    } else {
      // Approve: route to next level based on tier
      if (request.status === "FINANCE_REVIEW" || request.status === "SUBMITTED") {
        if (request.tier === "UNDER_10K") {
          newStatus = "APPROVED";
          comment = "Approved by Finance. No further approval needed for Tier 1.";
        } else {
          newStatus = "DIRECTOR_PENDING";
          comment = "Finance approved. Routed to Director for review.";
        }
      } else if (request.status === "DIRECTOR_PENDING") {
        if (request.tier === "BETWEEN_10K_50K") {
          newStatus = "APPROVED";
          comment = "Director approved. No further approval needed for Tier 2.";
        } else {
          newStatus = "VP_PENDING";
          comment = "Director approved. Routed to VP for final review.";
        }
      } else if (request.status === "VP_PENDING") {
        newStatus = "APPROVED";
        comment = "VP approved. Credit request fully approved.";
      } else {
        newStatus = "APPROVED";
        comment = "Request approved.";
      }
    }

    await supabase.from("credit_requests").update({ status: newStatus as any, internal_notes: internalNotes || null }).eq("id", request.id);
    await supabase.from("status_history").insert({
      request_id: request.id,
      from_status: request.status,
      to_status: newStatus as any,
      changed_by: "Sarah Lopez (Finance)",
      comments: comment,
    });

    toast({ title: action === "deny" ? "Request Denied" : action === "send_back" ? "Sent Back to Customer" : "Approved & Routed" });
    setActing(false);
    fetchData();
  };

  if (loading) {
    return <InternalLayout><div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div></InternalLayout>;
  }
  if (!request) {
    return <InternalLayout><div className="flex items-center justify-center h-64">Request not found.</div></InternalLayout>;
  }

  const financeApprover = approvers.find((a) => a.role === "FINANCE");
  const directorApprover = approvers.find((a) => a.role === "DIRECTOR");
  const vpApprover = approvers.find((a) => a.role === "VP");

  const chain = [
    { role: "Finance Analyst", approver: financeApprover, needed: true },
    { role: "Director", approver: directorApprover, needed: request.tier !== "UNDER_10K" },
    { role: "VP", approver: vpApprover, needed: request.tier === "OVER_50K" },
  ].filter((c) => c.needed);

  const canAct = ["SUBMITTED", "FINANCE_REVIEW", "DIRECTOR_PENDING", "VP_PENDING"].includes(request.status);

  return (
    <InternalLayout>
      <div className="p-6">
        <Link to="/internal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3 w-3" /> Back to Finance Queue
        </Link>
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{request.tracking_id}</span>
                <TierBadge tier={request.tier} />
                <StatusBadge status={request.status} />
              </div>
              <h1 className="font-display font-bold text-2xl mt-2">{request.customer_name}</h1>
              <p className="text-sm text-muted-foreground">
                Submitted {new Date(request.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            {/* Account Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Account Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">AWS Account ID</p>
                      <p className="text-sm font-medium font-mono">{request.aws_account_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="text-sm font-medium">{request.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deal Period</p>
                      <p className="text-sm font-medium">
                        {request.deal_start_date || "—"} → {request.deal_end_date || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Credit Type</p>
                      <p className="text-sm font-medium">{request.credit_type}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            {request.products.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Products & Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.products.map((p) => (
                      <span key={p} className="inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">{p}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Justification */}
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

            {/* Internal Notes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Internal Notes</h3>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes for the finance team..."
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            {/* Status History */}
            {history.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Status History</h3>
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p>
                            <span className="font-medium">{h.changed_by}</span> → {h.to_status.replace(/_/g, " ")}
                          </p>
                          {h.comments && <p className="text-xs text-muted-foreground">{h.comments}</p>}
                          <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Amount */}
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Requested Amount</p>
                <p className="font-display font-bold text-4xl text-primary">${Number(request.credit_amount).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{request.fiscal_year}</p>
              </CardContent>
            </Card>

            {/* Approval Chain */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Approval Chain</h3>
                <div className="space-y-4">
                  {chain.map((c, i) => {
                    const step = approvalSteps.find((s) => s.role === c.approver?.role);
                    const isOOO = c.approver?.is_ooo;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          step?.status === "APPROVED" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {step?.status === "APPROVED" ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.role}</p>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {c.approver?.name || "Unassigned"}
                            {isOOO && (
                              <span className="inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                                <AlertTriangle className="h-3 w-3 mr-1" /> OOO
                              </span>
                            )}
                          </p>
                          {step?.acted_at && (
                            <p className="text-xs text-muted-foreground">{new Date(step.acted_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Email Button */}
            <Button variant="outline" className="w-full" onClick={() => setEmailModalOpen(true)}>
              <Mail className="h-4 w-4 mr-2" /> Open Email Composer
            </Button>
          </div>
        </div>

        {/* Sticky Action Bar */}
        {canAct && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4 z-40">
            <div className="container flex items-center justify-between max-w-6xl mx-auto">
              <p className="text-sm text-muted-foreground">
                You are approving as <span className="font-semibold text-foreground">Finance Analyst</span>
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" size="sm" onClick={() => performAction("deny")} disabled={acting}>
                  <X className="h-4 w-4 mr-1" /> Deny
                </Button>
                <Button variant="outline" size="sm" onClick={() => performAction("send_back")} disabled={acting}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Send Back to Customer
                </Button>
                <Button size="sm" onClick={() => performAction("approve")} disabled={acting}>
                  <Check className="h-4 w-4 mr-1" /> Approve & Route
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Composer Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Composer
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="send-back">
            <TabsList className="w-full">
              <TabsTrigger value="send-back" className="flex-1">Send Back</TabsTrigger>
              <TabsTrigger value="approval" className="flex-1">Approval Notice</TabsTrigger>
            </TabsList>
            <TabsContent value="send-back" className="space-y-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recipient</p>
                <p className="text-sm font-medium">{request?.customer_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium">Action Required: {request?.tracking_id} — Changes Requested</p>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <p className="text-xs font-semibold text-warning mb-2">Required Action Items</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Verify the requested credit amount matches your invoice</li>
                  <li>• Provide updated business justification</li>
                  <li>• Confirm deal start and end dates</li>
                </ul>
              </div>
              <Textarea placeholder="Additional message to the customer..." className="min-h-[80px]" />
            </TabsContent>
            <TabsContent value="approval" className="space-y-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recipient</p>
                <p className="text-sm font-medium">{request?.customer_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium">Approved: {request?.tracking_id} — Credit Request Approved</p>
              </div>
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <p className="text-xs text-muted-foreground">
                  Your credit request for <span className="font-semibold">${Number(request?.credit_amount).toLocaleString()}</span> has been approved. 
                  Payout will be processed within 30 business days.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { setEmailModalOpen(false); toast({ title: "Email sent (demo)" }); }}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </InternalLayout>
  );
}
