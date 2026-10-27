import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="portal-eyebrow">{eyebrow}</p>}
        <h1 className="portal-display mt-1.5 text-[1.875rem] font-bold leading-tight md:text-[2.25rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="portal-display text-xl font-semibold">{children}</h2>
      {aside}
    </div>
  );
}

export type PillTone = "neutral" | "accent" | "success" | "warning" | "muted";

const PILL: Record<PillTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  accent: "bg-tint text-on-tint ring-1 ring-inset ring-primary/20",
  success: "bg-success/15 text-success ring-1 ring-inset ring-success/25",
  warning: "bg-warning-soft text-warning ring-1 ring-inset ring-warning/25",
  muted: "bg-muted text-muted-foreground",
};

export function Pill({ tone = "neutral", children, className }: { tone?: PillTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", PILL[tone], className)}>
      {children}
    </span>
  );
}

/** A percentage change with an arrow. `good` says whether the direction is an improvement (cost KPIs improve going down). */
export function Delta({ change, good, suffix = "" }: { change: number | null; good: boolean | null; suffix?: string }) {
  if (change === null || change === 0) {
    return (
      <Pill tone="muted">
        <Minus className="h-3 w-3" /> {change === 0 ? "No change" : "New"}
      </Pill>
    );
  }
  const Icon = change > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <Pill tone={good === null ? "neutral" : good ? "success" : "warning"}>
      <Icon className="h-3 w-3" />
      <span className="portal-tabular">
        {Math.abs(change)}%{suffix}
      </span>
    </Pill>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="portal-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-on-tint ring-1 ring-primary/20">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="portal-display text-lg font-semibold">{title}</h3>
      {children && <p className="max-w-md text-sm text-muted-foreground">{children}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-portal-pulse rounded-2xl bg-secondary", className)} />;
}

/** Small round avatar with initials. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#ff9a4d] text-xs font-bold text-white",
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
}
