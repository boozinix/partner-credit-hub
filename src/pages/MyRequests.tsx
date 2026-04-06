import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { TierBadge } from "@/components/TierBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Search, ExternalLink } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function MyRequestsPage() {
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<Tables<"credit_requests">[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!email) return;
    setLoading(true);
    const { data } = await supabase
      .from("credit_requests")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setSearched(true);
    setLoading(false);
  };

  const filter = (tab: string) => {
    if (tab === "all") return requests;
    if (tab === "pending") return requests.filter((r) => ["SUBMITTED", "FINANCE_REVIEW", "DIRECTOR_PENDING", "VP_PENDING", "NEEDS_CHANGES"].includes(r.status));
    if (tab === "approved") return requests.filter((r) => r.status === "APPROVED");
    if (tab === "completed") return requests.filter((r) => r.status === "PAID_OUT");
    return requests;
  };

  return (
    <PublicLayout>
      <div className="container py-10 max-w-4xl">
        <h1 className="font-display font-bold text-3xl mb-2">My Requests</h1>
        <p className="text-muted-foreground mb-8">Look up your credit requests by email address.</p>

        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="pl-10"
            />
          </div>
          <Button onClick={search} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {searched && (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filter("pending").length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({filter("approved").length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({filter("completed").length})</TabsTrigger>
            </TabsList>

            {["all", "pending", "approved", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filter(tab).length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">No requests found.</p>
                ) : (
                  <div className="grid gap-4 mt-4">
                    {filter(tab).map((r) => (
                      <Card key={r.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm">{r.tracking_id}</span>
                              <StatusBadge status={r.status} />
                              <TierBadge tier={r.tier} />
                            </div>
                            <p className="text-sm text-muted-foreground">{r.customer_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString()} · {r.products.join(", ")}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="font-display font-bold text-lg">${r.credit_amount.toLocaleString()}</p>
                            </div>
                            <Button asChild variant="ghost" size="icon">
                              <Link to={`/status/${r.tracking_id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </PublicLayout>
  );
}
