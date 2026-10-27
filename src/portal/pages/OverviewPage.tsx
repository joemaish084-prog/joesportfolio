import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  Circle,
  CircleDot,
  CreditCard,
  Download,
  ExternalLink,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { KpiStory } from "@/hub/lib/clientStory";
import { usePortal } from "../auth/PortalData";
import { useResolveAction } from "../lib/api";
import { headlineSentence, headlineStory, money, notes, openActions, roadmapProgress, storiesFor, withData } from "../lib/derive";
import { downloadPerformancePdf } from "../lib/export";
import { formatBig, formatMoney, friendlyDate, greetingFor } from "../lib/format";
import { formatKpi } from "@/hub/lib/format";
import { BorderBeam, BlurFade, DotPattern, NumberTicker, SpotlightCard } from "../components/magic/magic";
import { Spark, TrendChart, unitFormatter } from "../components/charts";
import { Delta, EmptyState, Pill, SectionTitle } from "../components/ui";
import { WORK_CATEGORY_LABEL } from "@/hub/lib/types";
import { BarChart3 } from "lucide-react";

function Hero({ story, onPdf }: { story: KpiStory; onPdf: () => void }) {
  const { kpi, latest, points } = story;
  return (
    <div className="portal-card portal-hero relative overflow-hidden p-6 md:p-8">
      <DotPattern className="text-white/[0.07] [mask-image:radial-gradient(60%_80%_at_0%_0%,#000,transparent)]" />
      <BorderBeam size={260} duration={16} />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb27a]">
            <Sparkles className="h-3.5 w-3.5" /> {kpi.name} · {points.at(-1)?.label}
          </p>
          <p className="portal-display mt-4 text-[2.75rem] font-bold leading-none tracking-tight md:text-[3.5rem]">
            <NumberTicker value={latest ?? 0} format={(n) => formatBig(n, kpi.unit)} />
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Delta change={story.change} good={story.improved} suffix=" since start" />
            {points.length > 1 && <span className="text-sm text-white/55">from {formatKpi(story.first, kpi.unit)} in {points[0]!.label}</span>}
          </div>
          <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/70">{headlineSentence(story)}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild className="h-10 rounded-xl">
              <Link to="/portal/performance">
                See all results <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button onClick={onPdf} variant="outline" className="h-10 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Download className="mr-1.5 h-4 w-4" /> Report PDF
            </Button>
          </div>
        </div>
        <div className="min-w-0">
          {points.length > 1 ? (
            <TrendChart name={kpi.name} unit={kpi.unit} points={points} height="h-56 md:h-64" />
          ) : (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-white/60">
              The trend appears after your second report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ story }: { story: KpiStory }) {
  const { kpi, latest, points, toTarget } = story;
  const fmt = unitFormatter(kpi.unit);
  return (
    <Link to="/portal/performance" className="group block focus-visible:outline-none">
      <SpotlightCard className="portal-card-interactive h-full p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">{kpi.name}</h3>
          <Delta change={story.change} good={story.improved} />
        </div>
        <p className="portal-display portal-tabular mt-2 text-[1.75rem] font-bold leading-none">{latest === null ? "—" : fmt(latest)}</p>
        <div className="mt-3 -mb-1">{points.length > 1 ? <Spark points={points} good={story.improved} /> : <div className="h-10" />}</div>
        {toTarget !== null && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[0.6875rem] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" /> Target {fmt(Number(kpi.target))}
              </span>
              <span className="portal-tabular">{Math.round(toTarget * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#ffb27a]" style={{ width: `${toTarget * 100}%` }} />
            </div>
          </div>
        )}
      </SpotlightCard>
    </Link>
  );
}

function Attention() {
  const { updates } = usePortal();
  const resolve = useResolveAction();
  const actions = openActions(updates);
  if (actions.length === 0) return null;
  return (
    <section aria-label="Needs your attention" className="portal-card relative overflow-hidden border-primary/40 p-5">
      <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-primary" />
      <div className="mb-3 flex items-center gap-2">
        <BellRing className="h-4 w-4 text-primary" />
        <h2 className="portal-display font-semibold">Needs your attention</h2>
        <Pill tone="accent">{actions.length}</Pill>
      </div>
      <ul className="space-y-3">
        {actions.map((a) => (
          <li key={a.id} className="flex flex-wrap items-start gap-3 rounded-2xl bg-secondary/50 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{a.title}</p>
              {a.body && <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>}
              <p className="mt-1.5 text-xs text-muted-foreground">{friendlyDate(a.created_at)}</p>
            </div>
            <div className="flex gap-2">
              {a.link_url && (
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <a href={a.link_url} target="_blank" rel="noopener noreferrer">
                    Open <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-xl"
                disabled={resolve.isPending}
                onClick={() =>
                  resolve.mutate(a.id, {
                    onSuccess: () => toast.success("Marked as done. Thank you!"),
                    onError: () => toast.error("Couldn't update that. Please try again."),
                  })
                }
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Done
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Roadmap() {
  const { milestones, settings } = usePortal();
  if (!settings.modules.includes("roadmap")) return null;
  const progress = roadmapProgress(milestones);
  const upcoming = milestones.filter((m) => m.status !== "done").slice(0, 3);
  return (
    <section className="portal-card p-5">
      <SectionTitle
        aside={
          <Link to="/portal/roadmap" className="text-sm font-medium text-primary hover:underline">
            Full roadmap
          </Link>
        }
      >
        What's next
      </SectionTitle>
      {milestones.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Your roadmap will appear here.</p>
      ) : (
        <>
          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>
                {progress.done} of {progress.total} milestones done
              </span>
              <span className="portal-tabular font-semibold text-foreground">{progress.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#ffb27a] transition-[width] duration-700" style={{ width: `${progress.pct}%` }} />
            </div>
          </div>
          <ul className="space-y-3">
            {upcoming.length === 0 && <li className="text-sm text-muted-foreground">Everything on the roadmap is complete. 🎉</li>}
            {upcoming.map((m) => (
              <li key={m.id} className="flex items-start gap-3">
                {m.status === "in_progress" ? (
                  <CircleDot className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.status === "in_progress" ? "In progress" : "Planned"}
                    {m.due_date && ` · ${format(parseISO(m.due_date), "d MMM yyyy")}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function LatestNote() {
  const { updates } = usePortal();
  const latest = notes(updates)[0];
  return (
    <section className="portal-card p-5">
      <SectionTitle>From us</SectionTitle>
      {latest ? (
        <>
          <p className="font-medium">{latest.title}</p>
          {latest.body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{latest.body}</p>}
          <p className="mt-3 text-xs text-muted-foreground">{friendlyDate(latest.created_at)}</p>
        </>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">Updates from your team will show up here.</p>
      )}
    </section>
  );
}

function RecentWork() {
  const { work, settings } = usePortal();
  if (!settings.modules.includes("work")) return null;
  return (
    <section className="portal-card p-5">
      <SectionTitle
        aside={
          <Link to="/portal/work" className="text-sm font-medium text-primary hover:underline">
            All work
          </Link>
        }
      >
        Recently done
      </SectionTitle>
      {work.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Completed work will be listed here.</p>
      ) : (
        <ul className="space-y-3.5">
          {work.slice(0, 5).map((w) => (
            <li key={w.id} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-success" />
              <div className="min-w-0">
                <p className="text-sm leading-snug">{w.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {WORK_CATEGORY_LABEL[w.category]} · {friendlyDate(w.worked_on)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BillingGlance() {
  const snap = usePortal();
  if (!snap.settings.modules.includes("billing")) return null;
  const m = money(snap);
  const next = m.rows.filter((r) => r.balance > 0).sort((a, b) => (a.invoice.due_date ?? "").localeCompare(b.invoice.due_date ?? ""))[0];
  return (
    <section className="portal-card p-5">
      <SectionTitle
        aside={
          <Link to="/portal/billing" className="text-sm font-medium text-primary hover:underline">
            Billing
          </Link>
        }
      >
        Billing
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary/60 p-3.5">
          <p className="text-xs text-muted-foreground">Paid so far</p>
          <p className="portal-display portal-tabular mt-1 text-lg font-bold">{formatMoney(m.received, snap.client.currency)}</p>
        </div>
        <div className={cn("rounded-2xl p-3.5", m.overdue > 0 ? "bg-warning-soft" : "bg-secondary/60")}>
          <p className="text-xs text-muted-foreground">{m.overdue > 0 ? "Overdue" : "Due"}</p>
          <p className={cn("portal-display portal-tabular mt-1 text-lg font-bold", m.overdue > 0 && "text-warning")}>
            {formatMoney(m.outstanding, snap.client.currency)}
          </p>
        </div>
      </div>
      {next ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4 shrink-0" />
          {next.invoice.number}
          {next.invoice.due_date && ` is due ${format(parseISO(next.invoice.due_date), "d MMM")}`}
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> You're all paid up
        </p>
      )}
    </section>
  );
}

function BookCard() {
  const { settings } = usePortal();
  if (!settings.modules.includes("book")) return null;
  return (
    <Link to="/portal/book" className="block">
      <section className="portal-card portal-card-interactive relative flex items-center gap-4 overflow-hidden p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#ff9a4d] text-white">
          <CalendarCheck className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="portal-display font-semibold">Book a strategy call</p>
          <p className="text-sm text-muted-foreground">Pick a time that suits you. 30 minutes, no prep needed.</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </section>
    </Link>
  );
}

export default function OverviewPage() {
  const snap = usePortal();
  const stories = storiesFor(snap, "all");
  const withNumbers = withData(stories);
  const headline = headlineStory(stories);
  const first = (snap.me.full_name || snap.client.contact_person || "").split(" ")[0];
  const others = withNumbers.filter((s) => s.kpi.id !== headline?.kpi.id);

  return (
    <div className="space-y-6">
      <BlurFade>
        <header>
          <p className="portal-eyebrow">{snap.client.business_name || snap.client.name}</p>
          <h1 className="portal-display mt-1.5 text-[1.875rem] font-bold leading-tight md:text-[2.5rem]">
            {greetingFor()}
            {first ? `, ${first}` : ""}
          </h1>
        </header>
      </BlurFade>

      <Attention />

      {headline ? (
        <BlurFade delay={0.05}>
          <Hero story={headline} onPdf={() => void downloadPerformancePdf(snap).catch(() => toast.error("Couldn't create the PDF. Please try again."))} />
        </BlurFade>
      ) : (
        <EmptyState icon={BarChart3} title="Your first report is on the way">
          Once your first monthly report is ready, your results and trends will appear right here.
        </EmptyState>
      )}

      {others.length > 0 && (
        <BlurFade delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {others.map((s) => (
              <KpiCard key={s.kpi.id} story={s} />
            ))}
          </div>
        </BlurFade>
      )}

      <BlurFade delay={0.12}>
        <div className="grid gap-4 lg:grid-cols-2">
          <LatestNote />
          <Roadmap />
        </div>
      </BlurFade>

      <BlurFade delay={0.14}>
        <div className="grid gap-4 lg:grid-cols-2">
          <RecentWork />
          <div className="space-y-4">
            <BillingGlance />
            <BookCard />
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
