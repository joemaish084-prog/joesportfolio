import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { initials } from "../lib/format";
import { STATUS_LABEL, type ClientStatus } from "../lib/types";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.125rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.9375rem] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const STATUS_STYLE: Record<ClientStatus, string> = {
  active: "bg-tint text-on-tint",
  onboarding: "bg-tint/60 text-on-tint",
  prospect: "bg-secondary text-secondary-foreground",
  paused: "bg-secondary text-muted-foreground",
  ended: "bg-transparent text-muted-foreground ring-1 ring-inset ring-border",
};

export function StatusBadge({ status, className }: { status: ClientStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLE[status],
        className,
      )}
    >
      {(status === "active" || status === "onboarding") && (
        <span className={cn("h-1.5 w-1.5 rounded-full bg-primary", status === "onboarding" && "opacity-60")} />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function ProgressBar({
  done,
  total,
  showLabel = true,
  className,
}: {
  done: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{total === 0 ? "No steps yet" : `${done} of ${total} done`}</span>
          {total > 0 && <span className="hub-tabular font-medium text-on-tint">{pct}%</span>}
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-on-tint">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p className="text-[0.9375rem] font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ClientAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-sm font-semibold text-on-tint",
        className,
      )}
      aria-hidden
    >
      {initials(name) || "?"}
    </div>
  );
}

/** Grouped list section, iOS Settings style. */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="hub-section-title">{title}</h2>}
          {action && <div className="pb-2">{action}</div>}
        </div>
      )}
      <div className="hub-card overflow-hidden">{children}</div>
    </section>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 px-5 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="hub-label sm:w-44 sm:shrink-0">{label}</dt>
      <dd className="min-w-0 break-words text-[0.9375rem]">{children}</dd>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-secondary", className)} />;
}

export type PillTone = "neutral" | "accent" | "warning" | "muted" | "outline";

const PILL_TONE: Record<PillTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  accent: "bg-tint text-on-tint",
  warning: "bg-warning-soft text-warning",
  muted: "bg-secondary text-muted-foreground",
  outline: "bg-transparent text-muted-foreground ring-1 ring-inset ring-border",
};

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        PILL_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Small summary tile: label, big value, optional hint. */
export function StatTile({
  label,
  children,
  hint,
  icon: Icon,
  warn,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  warn?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("hub-card p-4 md:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="hub-label">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              warn ? "bg-warning-soft text-warning" : "bg-tint text-on-tint",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-2 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[1.75rem]",
          warn && "text-warning",
        )}
      >
        {children}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Card frame around a shadcn Table that scrolls sideways on small screens. */
export function TableCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("hub-card overflow-hidden", className)}>
      <div className="overflow-x-auto [&_td]:px-4 [&_td]:py-3 [&_th]:h-10 [&_th]:px-4 [&_th]:text-xs [&_th]:font-medium [&_tr]:border-border/60">
        {children}
      </div>
    </div>
  );
}
