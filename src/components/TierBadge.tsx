import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Enums } from "@/integrations/supabase/types";

const tierConfig: Record<string, { label: string; className: string; tooltip: string }> = {
  UNDER_10K: { label: "< $10K", className: "bg-success/15 text-success border-success/30", tooltip: "Finance Analyst approves directly. No escalation required. Typically resolved in 1-2 days." },
  BETWEEN_10K_50K: { label: "$10K–$50K", className: "bg-warning/15 text-warning border-warning/30", tooltip: "Requires Finance review + Director approval. Two-step process. Typically 3-5 days." },
  OVER_50K: { label: "> $50K", className: "bg-destructive/15 text-destructive border-destructive/30", tooltip: "Requires Finance review, Director approval, and VP sign-off. Three-step process. Typically 5-7 days." },
};

export function TierBadge({ tier }: { tier: Enums<"request_tier"> }) {
  const config = tierConfig[tier] || { label: tier, className: "", tooltip: "" };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={cn("font-medium text-xs cursor-help", config.className)}>
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs">
        {config.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
