import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHubAuth } from "../../auth/HubAuthProvider";
import { Pill, type PillTone } from "../../components/ui";
import { useMembers } from "../lib/queries";
import { STAGE_LABEL, type Stage } from "../lib/types";

// Small display pieces shared across the CRM pages.

const STAGE_TONE: Record<Stage, PillTone> = {
  new: "outline",
  researching: "outline",
  qualified: "neutral",
  ready_for_outreach: "neutral",
  contacted: "neutral",
  replied: "accent",
  interested: "accent",
  meeting_booked: "accent",
  proposal_sent: "accent",
  negotiation: "accent",
  won: "accent",
  lost: "muted",
  not_interested: "muted",
  do_not_contact: "warning",
};

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <Pill tone={STAGE_TONE[stage]} className={className}>
      {stage === "won" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
      {STAGE_LABEL[stage]}
    </Pill>
  );
}

/** The spreadsheet's A/B/C priority, as it came. */
export function PriorityPill({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-muted-foreground">—</span>;
  return (
    <Pill tone={priority === "A" ? "accent" : priority === "B" ? "neutral" : "outline"} className="hub-tabular">
      {priority}
    </Pill>
  );
}

/** Prospect-fit score, or a dash when nothing has been rated yet. */
export function FitBadge({ score, known }: { score: number | null; known: number }) {
  if (score === null) return <span className="text-xs text-muted-foreground">Not scored</span>;
  return (
    <span className="hub-tabular inline-flex items-baseline gap-1 text-sm font-semibold">
      {Math.round(score)}
      <span className="text-[0.6875rem] font-normal text-muted-foreground">/100 · {known}f</span>
    </span>
  );
}

/** "You", the colleague's email, or "Unassigned". */
export function useOwnerLabel() {
  const members = useMembers();
  const me = useHubAuth().session?.user.id;
  return (userId: string | null) => {
    if (!userId) return "Unassigned";
    if (userId === me) return "You";
    return members.data?.find((x) => x.user_id === userId)?.email ?? "Someone else";
  };
}

/** Value that is "—" when unknown, so missing never reads as zero. */
export function Maybe({ value, children }: { value: unknown; children?: ReactNode }) {
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;
  return <>{children ?? String(value)}</>;
}

/** Small "Not verified" marker beside scraped or guessed data. */
export function Unverified({ className, children = "Not verified" }: { className?: string; children?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-warning-soft px-2 py-0.5 text-[0.6875rem] font-medium text-warning",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Verified({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-tint px-2 py-0.5 text-[0.6875rem] font-medium text-on-tint", className)}>
      Verified
    </span>
  );
}

/** Native select styled like the hub inputs; light and keyboard-friendly for filters. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
  id,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="sr-only">{label}</span>
      <select
        id={id}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
