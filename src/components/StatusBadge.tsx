import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Enums } from "@/integrations/supabase/types";

const statusConfig: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-info/15 text-info border-info/30" },
  FINANCE_REVIEW: { label: "Finance Review", className: "bg-primary/15 text-primary border-primary/30" },
  DIRECTOR_PENDING: { label: "Director Pending", className: "bg-purple-100 text-purple-700 border-purple-300" },
  VP_PENDING: { label: "VP Pending", className: "bg-amber-100 text-amber-700 border-amber-300" },
  NEEDS_CHANGES: { label: "Needs Changes", className: "bg-warning/15 text-warning border-warning/30" },
  APPROVED: { label: "Approved", className: "bg-success/15 text-success border-success/30" },
  DENIED: { label: "Denied", className: "bg-destructive/15 text-destructive border-destructive/30" },
  PAID_OUT: { label: "Paid Out", className: "bg-emerald-100 text-emerald-700 border-emerald-300" },
};

export function StatusBadge({ status }: { status: Enums<"request_status"> }) {
  const config = statusConfig[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
