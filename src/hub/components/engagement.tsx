import { CalendarClock, FileSignature, Repeat, Rocket, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENGAGEMENT, timeLeft } from "../lib/engagement";
import type { Client, EngagementType } from "../lib/types";

export const ENGAGEMENT_ICON: Record<EngagementType, LucideIcon> = {
  retainer: Repeat,
  contract: FileSignature,
  project: Rocket,
};

/** "Retainer" / "Contract" / "Project" pill. */
export function EngagementBadge({ type, className }: { type: EngagementType | undefined; className?: string }) {
  const t = type ?? "retainer";
  const Icon = ENGAGEMENT_ICON[t];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium",
        t === "project" ? "bg-tint text-on-tint" : "bg-secondary text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {ENGAGEMENT[t].short}
    </span>
  );
}

/** "5 days left" / "Deadline passed 12 Oct", or nothing for retainers and finished work. */
export function TimeLeft({
  client,
  className,
}: {
  client: Pick<Client, "engagement_type" | "end_date" | "status">;
  className?: string;
}) {
  const left = timeLeft(client);
  if (!left) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        left.tone === "late" ? "font-medium text-warning" : left.tone === "soon" ? "font-medium text-on-tint" : "text-muted-foreground",
        className,
      )}
    >
      <CalendarClock className="h-3.5 w-3.5" />
      {left.text}
    </span>
  );
}
