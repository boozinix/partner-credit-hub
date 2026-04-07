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
import { Check, X, RotateCcw, Mail, AlertTriangle, User, Building2, Calendar, DollarSign, ArrowLeft, Send } from "lucide-react";
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
  const [sendBackModalOpen, setSendBackModalOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [acting, setActing] = useState(false);
  const [sendBackBody, setSendBackBody] = useState("");
  const [sendBackItems, setSendBackItems] = useState([
    "Verify the requested credit amount matches your invoice",
    "Provide updated business justification",
    "Confirm deal start and end dates",
  ]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [trackingId]);

  const performAction = async (action: "approve" | "deny" | "send_back", sendBackComment?: string) => {
    if (!request) return;
    setActing(true);

    let newStatus: string;
    let comment: string;

    if (action === "deny") {
      newStatus = "DENIED";
      comment = "Request denied by finance team.";
    } else if (action === "send_back") {
      newStatus = "NEEDS_CHANGES";
      comment = sendBackComment || "Changes requested. Please review and resubmit.";
    } else {
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

  const handleSendBackConfirm = () => {
    const itemsList = sendBackItems.filter(i => i.trim()).map(i => `• ${i}`).join("\n");
    const fullComment = `Changes requested:\n${itemsList}${sendBackBody ? `\n\nAdditional notes: ${sendBackBody}` : ""}`;
    setSendBackModalOpen(false);
    performAction("send_back", fullComment);
  };

  const handleSendBackClick = () => {
    setSendBackBody("");
    setSendBackItems([
      "Verify the requested credit amount matches your invoice",
      "Provide updated business justification",
      "Confirm deal start and end dates",
    ]);
    setSendBackModalOpen(true);
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

  const STATUS_ORDER: Record<string, number> = {
    SUBMITTED: 0, FINANCE_REVIEW: 1, DIRECTOR_PENDING: 2, VP_PENDING: 3,
    APPROVED: 4, PAID_OUT: 5, NEEDS_CHANGES: 1, DENIED: -1,
  };
  const currentIndex = STATUS_ORDER[request.status] ?? 0;

  const chain = [
    { role: "Finance Analyst", approver: financeApprover, needed: true, statusKey: "FINANCE_REVIEW" },
    { role: "Director", approver: directorApprover, needed: request.tier !== "UNDER_10K", statusKey: "DIRECTOR_PENDING" },
    { role: "VP", approver: vpApprover, needed: request.tier === "OVER_50K", statusKey: "VP_PENDING" },
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
            {/* OOO Alert */}
            {(() => {
              const assignedApprover = approvers.find(a => a.id === request.assigned_approver_id);
              if (!assignedApprover?.is_ooo) return null;
              const delegate = approvers.find(a => a.id === assignedApprover.ooo_delegate_id);
              const daysPending = Math.floor((Date.now() - new Date(request.updated_at).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <Card className="border-2 border-warning/40 bg-warning/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <h3 className="font-display font-bold text-sm text-warning">OOO Alert</h3>
                    </div>
                    <p className="text-sm mb-4">
                      <span className="font-semibold">{assignedApprover.name}</span> is unavailable. This deal has been pending {assignedApprover.role.toLowerCase()} approval for <span className="font-semibold">{daysPending} days</span>. Reassign to continue.
                    </p>
                    {delegate && (
                      <>
                        <div className="rounded-md border bg-card px-3 py-2 mb-3">
                          <p className="text-xs text-muted-foreground">Reassign to</p>
                          <p className="text-sm font-semibold">{delegate.name} — {delegate.role} (Available)</p>
                        </div>
                        <Button
                          className="w-full"
                          onClick={async () => {
                            setActing(true);
                            await supabase.from("credit_requests").update({ assigned_approver_id: delegate.id }).eq("id", request.id);
                            await supabase.from("status_history").insert({
                              request_id: request.id,
                              from_status: request.status,
                              to_status: request.status,
                              changed_by: "Finance Admin",
                              comments: `Reassigned from ${assignedApprover.name} (OOO) to ${delegate.name} by Finance Admin`,
                            });
                            toast({ title: "Reassigned", description: `${delegate.name} has been notified.` });
                            setActing(false);
                            fetchData();
                          }}
                          disabled={acting}
                        >
                          Reassign to {delegate.name}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Amount */}
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Requested Credit</p>
                <p className="font-display font-bold text-4xl text-primary">${Number(request.credit_amount).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">{request.fiscal_year}</p>
                <div className="border-t mt-4 pt-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Original Deal Value</p>
                  <p className="font-display font-bold text-2xl">${(Number(request.credit_amount) * 100).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Credit is ~1% of deal value</p>
                </div>
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
                    const stepStatusIndex = STATUS_ORDER[c.statusKey] ?? i;
                    const isActive = stepStatusIndex === currentIndex && canAct;
                    const isCompleted = step?.status === "APPROVED" || stepStatusIndex < currentIndex;

                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCompleted ? "bg-success text-success-foreground"
                          : isActive ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
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
                          {isActive && !isCompleted && (
                            <p className="text-xs text-primary font-medium mt-0.5">Awaiting review…</p>
                          )}
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

            {/* Observers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Observers</h3>
                <div className="space-y-3">
                  {[
                    { name: "Lisa Nguyen", role: "Account Manager", initials: "LN" },
                    { name: "David Park", role: "Partnership Manager", initials: "DP" },
                    { name: "Rachel Adams", role: "Solutions Architect", initials: "RA" },
                  ].map((o) => (
                    <div key={o.name} className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground">{o.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{o.name}</p>
                        <p className="text-[10px] text-muted-foreground">{o.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 border-t pt-3">Observers receive status notifications but cannot approve or deny.</p>
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
                <Button variant="outline" size="sm" onClick={handleSendBackClick} disabled={acting}>
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

      {/* Send Back Modal */}
      <Dialog open={sendBackModalOpen} onOpenChange={setSendBackModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-warning" />
              Send Back to Customer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Recipient</p>
              <p className="text-sm font-medium">{request?.customer_email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Subject</p>
              <p className="text-sm font-medium bg-muted px-3 py-2 rounded">Action Required: Credit Request {request?.tracking_id}</p>
            </div>
            <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
              <p className="text-xs font-semibold text-warning mb-3">Action Items Needed</p>
              <div className="space-y-2">
                {sendBackItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-warning text-xs">•</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...sendBackItems];
                        updated[idx] = e.target.value;
                        setSendBackItems(updated);
                      }}
                      className="flex-1 bg-transparent border-b border-warning/20 text-sm py-1 focus:outline-none focus:border-warning"
                    />
                    <button
                      onClick={() => setSendBackItems(sendBackItems.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-destructive text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSendBackItems([...sendBackItems, ""])}
                  className="text-xs text-warning hover:text-warning/80 font-medium mt-1"
                >
                  + Add item
                </button>
              </div>
            </div>
            <Textarea
              value={sendBackBody}
              onChange={(e) => setSendBackBody(e.target.value)}
              placeholder="Additional message to the customer..."
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendBackModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendBackConfirm} className="bg-warning text-warning-foreground hover:bg-warning/90">
              <Send className="h-4 w-4 mr-2" /> Send & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
