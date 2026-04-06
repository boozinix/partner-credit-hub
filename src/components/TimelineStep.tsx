import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TimelineStepProps {
  label: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
  isLast?: boolean;
}

export function TimelineStep({ label, description, status, timestamp, isLast }: TimelineStepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
            status === "completed" && "bg-success border-success text-success-foreground",
            status === "current" && "bg-primary border-primary text-primary-foreground animate-pulse",
            status === "upcoming" && "bg-muted border-border text-muted-foreground"
          )}
        >
          {status === "completed" ? <Check className="h-4 w-4" /> : null}
        </div>
        {!isLast && (
          <div className={cn("w-0.5 flex-1 min-h-[2rem]", status === "completed" ? "bg-success" : "bg-border")} />
        )}
      </div>
      <div className="pb-6">
        <p className={cn("text-sm font-semibold", status === "upcoming" && "text-muted-foreground")}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        {timestamp && <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>}
      </div>
    </div>
  );
}
