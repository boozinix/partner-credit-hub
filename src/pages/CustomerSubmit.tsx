import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { usePersona } from "@/contexts/PersonaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Lightbulb, HelpCircle, ArrowRight, Building2, FileText,
  Package, MessageSquare, Plus, Trash2, AlertTriangle, Info,
} from "lucide-react";

const PRODUCTS = [
  "RHEL Enterprise Linux",
  "OpenShift Container Platform",
  "Ansible Automation Platform",
  "Red Hat AI/ML Suite",
  "JBoss Enterprise Application",
  "Red Hat Satellite",
  "Advanced Cluster Security",
  "Red Hat Storage",
];

interface LineItem {
  product: string;
  purchaseAmount: string;
  creditAmount: string;
}

const emptyLine = (): LineItem => ({ product: "", purchaseAmount: "", creditAmount: "" });

function generateTrackingId() {
  const num = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `AWZ-2026-${num}`;
}

function getTier(amount: number) {
  if (amount < 10000) return "UNDER_10K" as const;
  if (amount <= 50000) return "BETWEEN_10K_50K" as const;
  return "OVER_50K" as const;
}

const sections = [
  { icon: Building2, label: "AWS Account" },
  { icon: FileText, label: "Deal Info" },
  { icon: Package, label: "Products" },
  { icon: MessageSquare, label: "Business Case" },
];

export default function CustomerSubmit() {
  const navigate = useNavigate();
  const { persona } = usePersona();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLine()]);
  const [form, setForm] = useState({
    awsAccountId: "",
    awsMarketplaceDealId: "",
    creditType: "Post-Deal Credit",
    dealStartDate: "",
    dealEndDate: "",
    invoiceNumber: "",
    businessJustification: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const updateLine = (idx: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLine = () => {
    if (lineItems.length < 7) setLineItems((p) => [...p, emptyLine()]);
  };

  const removeLine = (idx: number) => {
    if (lineItems.length > 1) setLineItems((p) => p.filter((_, i) => i !== idx));
  };

  const totalPurchase = useMemo(
    () => lineItems.reduce((s, l) => s + (parseFloat(l.purchaseAmount) || 0), 0),
    [lineItems]
  );

  const totalCredit = useMemo(
    () => lineItems.reduce((s, l) => s + (parseFloat(l.creditAmount) || 0), 0),
    [lineItems]
  );

  const creditRatio = totalPurchase > 0 ? (totalCredit / totalPurchase) * 100 : 0;
  const ratioWarning = totalPurchase > 0 && creditRatio > 5;
  const manualApprovalWarning = totalCredit >= 10000;
  const dealSizeWarning = totalPurchase > 100_000_000;

  const selectedProducts = lineItems.filter((l) => l.product).map((l) => l.product);
  const hasProducts = selectedProducts.length > 0;

  const filledSections = [
    form.awsAccountId,
    totalCredit > 0,
    hasProducts,
    form.businessJustification,
  ].filter(Boolean).length;
  const progress = (filledSections / 4) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.awsAccountId) {
      toast({ title: "Missing fields", description: "Please provide your AWS Account ID.", variant: "destructive" });
      return;
    }
    if (totalCredit <= 0) {
      toast({ title: "Missing fields", description: "Please add at least one product with a credit amount.", variant: "destructive" });
      return;
    }
    if (dealSizeWarning) {
      toast({ title: "Invalid amount", description: "Total deal size cannot exceed $100M.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const trackingId = generateTrackingId();
    const tier = getTier(totalCredit);

    const { error } = await supabase.from("credit_requests").insert({
      tracking_id: trackingId,
      customer_name: persona.company,
      customer_email: persona.email,
      aws_account_id: form.awsAccountId,
      aws_marketplace_deal_id: form.awsMarketplaceDealId || null,
      credit_amount: totalCredit,
      credit_type: form.creditType,
      tier,
      status: "SUBMITTED",
      products: selectedProducts,
      business_justification: form.businessJustification || null,
      deal_start_date: form.dealStartDate || null,
      deal_end_date: form.dealEndDate || null,
      invoice_number: form.invoiceNumber || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: req } = await supabase
      .from("credit_requests")
      .select("id")
      .eq("tracking_id", trackingId)
      .single();

    if (req) {
      await supabase.from("status_history").insert({
        request_id: req.id,
        to_status: "SUBMITTED",
        changed_by: persona.email,
        comments: `Credit request submitted via partner portal. ${lineItems.filter(l => l.product).length} product line item(s). Total deal value: $${totalPurchase.toLocaleString()}.`,
      });
    }

    setLoading(false);
    toast({ title: "Request Submitted!", description: `Tracking ID: ${trackingId}` });
    navigate(`/customer/status/${trackingId}`);
  };

  return (
    <CustomerLayout>
      <div className="container py-10 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Submit Credit Request</h1>
          <p className="text-muted-foreground">
            Submitting as <span className="font-medium text-foreground">{persona.company}</span>
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {sections.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${i < filledSections ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <s.icon className="h-3 w-3" />
                </div>
                <span className={i < filledSections ? "font-medium text-foreground" : "text-muted-foreground"}>{s.label}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-8">
              {/* AWS Account */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    AWS Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={persona.company} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input value={persona.email} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awsAccountId">AWS Account ID *</Label>
                    <Input id="awsAccountId" value={form.awsAccountId} onChange={(e) => update("awsAccountId", e.target.value)} placeholder="123456789012" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="awsMarketplaceDealId">AWS Marketplace Deal ID</Label>
                    <Input id="awsMarketplaceDealId" value={form.awsMarketplaceDealId} onChange={(e) => update("awsMarketplaceDealId", e.target.value)} placeholder="MPD-xxxxxxx" />
                  </div>
                </CardContent>
              </Card>

              {/* Deal Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Deal Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credit Type</Label>
                    <Select value={form.creditType} onValueChange={(v) => update("creditType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Post-Deal Credit">Post-Deal Credit</SelectItem>
                        <SelectItem value="Migration Credit">Migration Credit</SelectItem>
                        <SelectItem value="POC Credit">POC Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Number</Label>
                    <Input value={form.invoiceNumber} onChange={(e) => update("invoiceNumber", e.target.value)} placeholder="INV-2026-XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Deal Start Date</Label>
                    <Input type="date" value={form.dealStartDate} onChange={(e) => update("dealStartDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Deal End Date</Label>
                    <Input type="date" value={form.dealEndDate} onChange={(e) => update("dealEndDate", e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              {/* Products as Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Products Purchased
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">{lineItems.length}/7 line items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_140px_140px_36px] gap-3 px-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Product</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Purchase ($)</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Credit ($)</p>
                    <div />
                  </div>

                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_140px_140px_36px] gap-3 items-center">
                      <Select value={item.product} onValueChange={(v) => updateLine(idx, "product", v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCTS.filter(
                            (p) => !lineItems.some((l, i) => i !== idx && l.product === p)
                          ).map((p) => (
                            <SelectItem key={p} value={p} className="text-sm">{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="500,000"
                        value={item.purchaseAmount}
                        onChange={(e) => updateLine(idx, "purchaseAmount", e.target.value)}
                        className="h-9 text-sm"
                        max={100000000}
                      />
                      <Input
                        type="number"
                        placeholder="5,000"
                        value={item.creditAmount}
                        onChange={(e) => updateLine(idx, "creditAmount", e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeLine(idx)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  {lineItems.length < 7 && (
                    <Button type="button" variant="outline" size="sm" onClick={addLine} className="mt-2 gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Line Item
                    </Button>
                  )}

                  {/* Totals */}
                  {(totalPurchase > 0 || totalCredit > 0) && (
                    <div className="border-t pt-3 mt-3">
                      <div className="grid grid-cols-[1fr_140px_140px_36px] gap-3 px-1">
                        <p className="text-sm font-semibold">Totals</p>
                        <p className="text-sm font-semibold">${totalPurchase.toLocaleString()}</p>
                        <p className="text-sm font-semibold text-primary">${totalCredit.toLocaleString()}</p>
                        <div />
                      </div>
                      {totalPurchase > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1 px-1">
                          Credit-to-deal ratio: {creditRatio.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}

                  {/* Warnings */}
                  {ratioWarning && (
                    <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3 mt-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      <p className="text-xs text-warning">
                        Credit request exceeds 5% of total deal value. This may require additional justification and extended review.
                      </p>
                    </div>
                  )}

                  {dealSizeWarning && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 mt-2">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-destructive">
                        Total deal size cannot exceed $100,000,000.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Case */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Business Case
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.businessJustification}
                    onChange={(e) => update("businessJustification", e.target.value)}
                    placeholder="Describe your business justification for the credit request..."
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>

              <div className="flex items-center justify-end">
                <Button type="submit" size="lg" disabled={loading} className="px-8">
                  {loading ? "Submitting..." : "Submit Request"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-accent/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold">Submission Guidelines</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2"><span className="text-primary font-bold">•</span>Credits under $10K are auto-approved within 24 hours</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">•</span>Include an AWS Marketplace Deal ID for faster processing</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">•</span>Business justification is required for credits over $50K</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">•</span>Credit requests are typically ~1% of total deal value</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-semibold">Need Help?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact your AWS Partner Manager or reach out to our support team.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">Contact Support</Button>
                </CardContent>
              </Card>

              {/* Live Tier + Warning */}
              {totalCredit > 0 && (
                <Card className="border-primary/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Estimated Tier</p>
                    <p className="font-display font-bold text-2xl text-primary">
                      {totalCredit < 10000 ? "Tier 1" : totalCredit <= 50000 ? "Tier 2" : "Tier 3"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalCredit < 10000 ? "Finance approval only" : totalCredit <= 50000 ? "Finance + Director" : "Finance + Director + VP"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {manualApprovalWarning && (
                <div className="flex items-start gap-2 rounded-lg border border-info/40 bg-info/5 p-4">
                  <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Note:</span> Credit requests of $10,000 or more are subject to manual multi-tier approvals and may have longer approval cycles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
}
