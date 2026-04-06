import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { usePersona } from "@/contexts/PersonaContext";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { TierBadge } from "@/components/TierBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function CustomerRequests() {
  const { persona } = usePersona();
  const [requests, setRequests] = useState<Tables<"credit_requests">[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filter = (tab: string) => {
    if (tab === "all") return requests;
    if (tab === "pending") return requests.filter((r) => ["SUBMITTED", "FINANCE_REVIEW", "DIRECTOR_PENDING", "VP_PENDING"].includes(r.status));
    if (tab === "action") return requests.filter((r) => r.status === "NEEDS_CHANGES");
    if (tab === "completed") return requests.filter((r) => ["APPROVED", "PAID_OUT"].includes(r.status));
    if (tab === "denied") return requests.filter((r) => r.status === "DENIED");
    return requests;
  };

  return (
    <CustomerLayout>
      <div className="container py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-1">My Requests</h1>
          <p className="text-muted-foreground">View and manage all credit requests for {persona.company}.</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading requests...</p>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filter("pending").length})</TabsTrigger>
              <TabsTrigger value="action" className="relative">
                Action Required ({filter("action").length})
                {filter("action").length > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-warning" />
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed ({filter("completed").length})</TabsTrigger>
            </TabsList>

            {["all", "pending", "action", "completed", "denied"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filter(tab).length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">No requests in this category.</p>
                ) : (
                  <div className="grid gap-3 mt-4">
                    {filter(tab).map((r) => (
                      <Link key={r.id} to={`/customer/status/${r.tracking_id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-sm font-mono">{r.tracking_id}</span>
                                <StatusBadge status={r.status} />
                                <TierBadge tier={r.tier} />
                              </div>
                              <p className="text-sm text-muted-foreground">{r.credit_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(r.created_at).toLocaleDateString()} · {r.products.join(", ")}
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div>
                                <p className="font-display font-bold text-lg">${Number(r.credit_amount).toLocaleString()}</p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </CustomerLayout>
  );
}
