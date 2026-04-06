import { useEffect, useState } from "react";
import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const ROLE_LABELS: Record<string, string> = {
  FINANCE: "Finance Analyst",
  DIRECTOR: "Director",
  VP: "Vice President",
};

const ROLE_COLORS: Record<string, string> = {
  FINANCE: "bg-primary/10 text-primary",
  DIRECTOR: "bg-warning/10 text-warning",
  VP: "bg-destructive/10 text-destructive",
};

export default function InternalUsers() {
  const { toast } = useToast();
  const [approvers, setApprovers] = useState<Tables<"approvers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchApprovers = async () => {
    const { data } = await supabase.from("approvers").select("*").order("role");
    setApprovers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApprovers(); }, []);

  const toggleOOO = async (approver: Tables<"approvers">) => {
    setToggling(approver.id);
    const newStatus = !approver.is_ooo;
    // If turning off OOO, clear delegate
    const updates: any = { is_ooo: newStatus };
    if (!newStatus) updates.ooo_delegate_id = null;
    await supabase.from("approvers").update(updates).eq("id", approver.id);
    toast({
      title: newStatus ? `${approver.name} marked OOO` : `${approver.name} back from OOO`,
      description: newStatus
        ? "Select a delegate to handle their approvals."
        : "Requests will be routed normally.",
    });
    await fetchApprovers();
    setToggling(null);
  };

  const setDelegate = async (approverId: string, delegateId: string) => {
    await supabase.from("approvers").update({ ooo_delegate_id: delegateId }).eq("id", approverId);
    const delegate = approvers.find((a) => a.id === delegateId);
    toast({ title: "Delegate assigned", description: `Requests will be routed to ${delegate?.name}.` });
    await fetchApprovers();
  };

  const getDelegate = (id: string | null) => {
    if (!id) return null;
    return approvers.find((a) => a.id === id);
  };

  return (
    <InternalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Approval Team</h1>
          <p className="text-sm text-muted-foreground">Manage approvers and out-of-office status</p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Approver</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>OOO Delegate</TableHead>
                <TableHead className="text-center">Out of Office</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : (
                approvers.map((a) => {
                  const delegate = getDelegate(a.ooo_delegate_id);
                  const otherApprovers = approvers.filter((o) => o.id !== a.id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {a.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm flex items-center gap-2">
                              {a.name}
                              {a.is_ooo && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                                  <AlertTriangle className="h-2.5 w-2.5" /> OOO
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[a.role]}`}>
                          <Shield className="h-3 w-3" />
                          {ROLE_LABELS[a.role] || a.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                      <TableCell>
                        {a.is_ooo ? (
                          <Select
                            value={a.ooo_delegate_id || ""}
                            onValueChange={(val) => setDelegate(a.id, val)}
                          >
                            <SelectTrigger className="h-8 w-[180px] text-xs">
                              <SelectValue placeholder="Select delegate..." />
                            </SelectTrigger>
                            <SelectContent>
                              {otherApprovers.map((o) => (
                                <SelectItem key={o.id} value={o.id} className="text-xs">
                                  {o.name} ({ROLE_LABELS[o.role]})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={a.is_ooo}
                          onCheckedChange={() => toggleOOO(a)}
                          disabled={toggling === a.id}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">How OOO Delegation Works</p>
                <p className="text-xs text-muted-foreground mt-1">
                  When an approver is marked as Out of Office, select a delegate from the dropdown. 
                  Any new requests requiring their approval tier will be automatically routed to the delegate. 
                  Existing pending requests remain assigned until manually reassigned.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}
