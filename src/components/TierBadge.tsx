import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Enums } from "@/integrations/supabase/types";

const tierConfig: Record<string, { label: string; className: string }> = {
  UNDER_10K: { label: "< $10K", className: "bg-success/15 text-success border-success/30" },
  BETWEEN_10K_50K: { label: "$10K–$50K", className: "bg-warning/15 text-warning border-warning/30" },
  OVER_50K: { label: "> $50K", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function TierBadge({ tier }: { tier: Enums<"request_tier"> }) {
  const config = tierConfig[tier] || { label: tier, className: "" };
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
