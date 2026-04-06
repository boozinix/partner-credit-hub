import { useState } from "react";
import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Layers, Clock, Bell, CalendarDays, Save } from "lucide-react";

export default function InternalSettings() {
  const { toast } = useToast();

  // Approval Thresholds
  const [tier1Max, setTier1Max] = useState("10000");
  const [tier2Max, setTier2Max] = useState("50000");

  // Annual Credit Pool
  const [creditPool, setCreditPool] = useState("1000000");

  // SLA Targets (business days)
  const [slaFinance, setSlaFinance] = useState("3");
  const [slaDirector, setSlaDirector] = useState("2");
  const [slaVP, setSlaVP] = useState("2");

  // Email Notifications
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [notifyAM, setNotifyAM] = useState(true);
  const [alertSLA, setAlertSLA] = useState(false);

  // Fiscal Year
  const [fiscalYear, setFiscalYear] = useState("FY2026");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Portal configuration has been updated successfully.",
    });
  };

  return (
    <InternalLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl">Settings</h1>
            <p className="text-sm text-muted-foreground">Portal configuration and business rules</p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Approval Thresholds */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Approval Thresholds</h3>
                  <p className="text-xs text-muted-foreground">Tier cutoffs for routing approvals</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Tier 1 Maximum (Finance Only)</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={tier1Max}
                      onChange={(e) => setTier1Max(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Requests under this amount need Finance approval only</p>
                </div>
                <div>
                  <Label className="text-xs">Tier 2 Maximum (+ Director)</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={tier2Max}
                      onChange={(e) => setTier2Max(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Requests under this need Finance + Director approval</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Tier 3 (+ VP):</span> Anything above ${Number(tier2Max).toLocaleString()} requires Finance + Director + VP approval
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Annual Credit Pool */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Annual Credit Pool</h3>
                  <p className="text-xs text-muted-foreground">Total budget for partner credits</p>
                </div>
              </div>
              <div>
                <Label className="text-xs">Total Budget ({fiscalYear})</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={creditPool}
                    onChange={(e) => setCreditPool(e.target.value)}
                    className="pl-7 text-lg font-display font-bold"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Dashboard donut chart updates based on this value</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Pool</p>
                  <p className="font-display font-bold text-lg">${(Number(creditPool) / 1000000).toFixed(1)}M</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Per Quarter</p>
                  <p className="font-display font-bold text-lg">${(Number(creditPool) / 4000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SLA Targets */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">SLA Targets</h3>
                  <p className="text-xs text-muted-foreground">Max business days per approval stage</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Finance Review</p>
                    <p className="text-[10px] text-muted-foreground">Initial assessment & validation</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={slaFinance}
                      onChange={(e) => setSlaFinance(e.target.value)}
                      className="w-16 h-8 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Director Review</p>
                    <p className="text-[10px] text-muted-foreground">Tier 2 & 3 approval</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={slaDirector}
                      onChange={(e) => setSlaDirector(e.target.value)}
                      className="w-16 h-8 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">VP Review</p>
                    <p className="text-[10px] text-muted-foreground">Tier 3 final approval</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={slaVP}
                      onChange={(e) => setSlaVP(e.target.value)}
                      className="w-16 h-8 text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">
                    Total max SLA: <span className="font-semibold text-foreground">{Number(slaFinance) + Number(slaDirector) + Number(slaVP)} business days</span> for Tier 3 requests
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications + Fiscal Year */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground">Automated alert configuration</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Customer status updates</p>
                      <p className="text-[10px] text-muted-foreground">Notify customer on status change</p>
                    </div>
                    <Switch checked={notifyCustomer} onCheckedChange={setNotifyCustomer} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">AM deal alerts</p>
                      <p className="text-[10px] text-muted-foreground">Notify AM when deal moves</p>
                    </div>
                    <Switch checked={notifyAM} onCheckedChange={setNotifyAM} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SLA breach alerts</p>
                      <p className="text-[10px] text-muted-foreground">Alert Finance when SLA exceeded</p>
                    </div>
                    <Switch checked={alertSLA} onCheckedChange={setAlertSLA} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Fiscal Year</h3>
                    <p className="text-xs text-muted-foreground">Budget period configuration</p>
                  </div>
                </div>
                <Select value={fiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FY2025">FY2025</SelectItem>
                    <SelectItem value="FY2026">FY2026</SelectItem>
                    <SelectItem value="FY2027">FY2027</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Budget resets when fiscal year changes. Current: <span className="font-semibold text-foreground">{fiscalYear}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-lg border border-muted bg-muted/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">Configuration managed by Finance Admin · Changes take effect immediately</p>
        </div>
      </div>
    </InternalLayout>
  );
}
