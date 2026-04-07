import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { usePersona } from "@/contexts/PersonaContext";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";

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
      <div className="container py-6 md:py-10 max-w-5xl px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-1">My Requests</h1>
          <p className="text-muted-foreground">View and manage all credit requests for {persona.company}.</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading requests...</p>
        ) : (
          <Tabs defaultValue="all">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex w-auto min-w-full md:min-w-0">
                <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({filter("pending").length})</TabsTrigger>
                <TabsTrigger value="action" className="relative whitespace-nowrap">
                  Action ({filter("action").length})
                  {filter("action").length > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-warning" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">Done ({filter("completed").length})</TabsTrigger>
              </TabsList>
            </div>

            {["all", "pending", "action", "completed", "denied"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filter(tab).length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">No requests in this category.</p>
                ) : (
                  <div className="grid gap-3 mt-4">
                    {filter(tab).map((r) => {
                      const dealAmount = Number(r.credit_amount) * 100;
                      return (
                        <Link key={r.id} to={`/customer/status/${r.tracking_id}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-display font-bold text-sm font-mono">{r.tracking_id}</span>
                                  <StatusBadge status={r.status} />
                                  
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <div>
                                    <p className="font-display font-bold text-lg">${Number(r.credit_amount).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">of ${(dealAmount / 1000).toFixed(0)}K deal</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1.5">
                                  {r.products.map((p) => (
                                    <span key={p} className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{p}</span>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
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
