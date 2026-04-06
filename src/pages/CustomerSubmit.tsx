import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { usePersona } from "@/contexts/PersonaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductChip } from "@/components/ProductChip";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, HelpCircle, ArrowRight, Building2, FileText, Package, MessageSquare } from "lucide-react";

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
  { icon: FileText, label: "Deal Parameters" },
  { icon: Package, label: "Products" },
  { icon: MessageSquare, label: "Business Case" },
];

export default function CustomerSubmit() {
  const navigate = useNavigate();
  const { persona } = usePersona();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [form, setForm] = useState({
    awsAccountId: "",
    awsMarketplaceDealId: "",
    creditAmount: "",
    creditType: "Post-Deal Credit",
    dealStartDate: "",
    dealEndDate: "",
    invoiceNumber: "",
    businessJustification: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const toggleProduct = (p: string) =>
    setSelectedProducts((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const filledSections = [
    form.awsAccountId,
    form.creditAmount,
    selectedProducts.length > 0,
    form.businessJustification,
  ].filter(Boolean).length;
  const progress = (filledSections / 4) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.awsAccountId || !form.creditAmount) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const amount = parseFloat(form.creditAmount);
    const trackingId = generateTrackingId();
    const tier = getTier(amount);

    const { error } = await supabase.from("credit_requests").insert({
      tracking_id: trackingId,
      customer_name: persona.company,
      customer_email: persona.email,
      aws_account_id: form.awsAccountId,
      aws_marketplace_deal_id: form.awsMarketplaceDealId || null,
      credit_amount: amount,
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
        comments: "Credit request submitted via partner portal.",
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
            Submitting as <span className="font-medium text-foreground">{persona.company}</span>. Complete all sections below.
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
                    <Label htmlFor="creditAmount">Requested Amount (USD) *</Label>
                    <Input id="creditAmount" type="number" value={form.creditAmount} onChange={(e) => update("creditAmount", e.target.value)} placeholder="25000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Deal Start Date</Label>
                    <Input type="date" value={form.dealStartDate} onChange={(e) => update("dealStartDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Deal End Date</Label>
                    <Input type="date" value={form.dealEndDate} onChange={(e) => update("dealEndDate", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Invoice Number</Label>
                    <Input value={form.invoiceNumber} onChange={(e) => update("invoiceNumber", e.target.value)} placeholder="INV-2026-XXXX" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Target Red Hat Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTS.map((p) => (
                      <ProductChip key={p} product={p} selected={selectedProducts.includes(p)} onClick={() => toggleProduct(p)} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Marketplace Business Case
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.businessJustification}
                    onChange={(e) => update("businessJustification", e.target.value)}
                    placeholder="Describe your business justification..."
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>

              <div className="flex items-center justify-end">
                <Button type="submit" size="lg" disabled={loading} className="px-8">
                  {loading ? "Submitting..." : "Submit Marketplace Request"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

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
                    <li className="flex gap-2"><span className="text-primary font-bold">•</span>All credits are paid within 30 days of final approval</li>
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

              {form.creditAmount && (
                <Card className="border-primary/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Estimated Tier</p>
                    <p className="font-display font-bold text-2xl text-primary">
                      {parseFloat(form.creditAmount) < 10000 ? "Tier 1" : parseFloat(form.creditAmount) <= 50000 ? "Tier 2" : "Tier 3"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseFloat(form.creditAmount) < 10000 ? "Finance approval only" : parseFloat(form.creditAmount) <= 50000 ? "Finance + Director" : "Finance + Director + VP"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
}
