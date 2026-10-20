import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Download,
  Eye,
  EyeOff,
  FileText,
  Maximize2,
  Minimize2,
  Minus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EngagementBadge, TimeLeft } from "../components/engagement";
import { BlurFade } from "../components/motion/blur-fade";
import { Ring } from "../components/overview/visuals";
import { PrivateBlur } from "../components/privacy";
import { ClientAvatar, Pill, SkeletonBlock } from "../components/ui";
import { bestStory, billing, kpiStories, togetherFor, workByMonth, type KpiStory } from "../lib/clientStory";
import { openDocument, useRows } from "../lib/data";
import { ENGAGEMENT, durationLabel, feeOf } from "../lib/engagement";
import { INVOICE_STATE } from "../lib/finance";
import { formatKpi as formatKpiRaw } from "../lib/format";
import { useKes, usePrivacy } from "../lib/privacy";
import { useClient, useClientKpis, useOnboardingByClient } from "../lib/queries";
import { useSettings } from "../lib/settings";
import { DOCUMENT_KIND_LABEL, WORK_CATEGORY_LABEL, type HubDocument } from "../lib/types";

const KpiTrendChart = lazy(() => import("../components/reports/KpiTrendChart"));

// A clean, full-screen view of one client's story for meetings: results since
// you started, the work behind them, billing and shared files. Opened from the
// client page; it's behind your login like the rest of the hub. Profit,
// expenses, private notes and other clients never appear here.

const SECTIONS = [
  { id: "results", label: "Results" },
  { id: "work", label: "Work done" },
  { id: "billing", label: "Invoices" },
  { id: "files", label: "Documents" },
] as const;

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mb-5 mt-1 text-2xl font-bold tracking-tight md:text-[1.75rem]">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="hub-card px-6 py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

function Change({ story }: { story: KpiStory }) {
  if (story.change === null)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
        {story.points.length < 2 ? "Tracking started" : "No change"}
      </span>
    );
  const Icon = story.change > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        story.improved ? "bg-tint text-on-tint" : "bg-warning-soft text-warning",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(story.change)}% since start
    </span>
  );
}

/** KPI values in KES follow the hide-amounts switch like every other amount. */
function useKpiFormat() {
  const kes = useKes();
  return (value: number | null | undefined, unit: KpiStory["kpi"]["unit"]) =>
    unit === "kes" && value !== null && value !== undefined ? kes(value) : formatKpiRaw(value, unit);
}

function KpiCard({ story }: { story: KpiStory }) {
  const { kpi, first, latest, points, toTarget } = story;
  const formatKpi = useKpiFormat();
  return (
    <article className="hub-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{kpi.name}</h3>
        <Change story={story} />
      </div>
      <p className="hub-tabular mt-2 text-[2rem] font-bold leading-none tracking-tight">
        {formatKpi(latest, kpi.unit)}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {points.length >= 2 ? (
          <>
            Started at <span className="hub-tabular font-medium text-foreground">{formatKpi(first, kpi.unit)}</span> in{" "}
            {points[0].label}
          </>
        ) : points.length === 1 ? (
          `First measured ${points[0].label}`
        ) : (
          "No numbers yet"
        )}
      </p>
      {toTarget !== null && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[0.6875rem] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" /> Target {formatKpi(kpi.target, kpi.unit)}
            </span>
            <span className="hub-tabular">{Math.round(toTarget * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full" style={{ width: `${toTarget * 100}%`, background: "var(--chart-in)" }} />
          </div>
        </div>
      )}
      {points.length >= 2 && (
        <div className="-mx-1 mt-4">
          <Suspense fallback={<SkeletonBlock className="h-36" />}>
            {kpi.unit === "kes" ? (
              <PrivateBlur quiet>
                <KpiTrendChart data={points} unit={kpi.unit} id={`present-${kpi.id}`} />
              </PrivateBlur>
            ) : (
              <KpiTrendChart data={points} unit={kpi.unit} id={`present-${kpi.id}`} />
            )}
          </Suspense>
        </div>
      )}
    </article>
  );
}

function DocumentRow({ doc }: { doc: HubDocument }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => void openDocument(doc)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-150 hover:bg-secondary/60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-on-tint">
          <FileText className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{doc.title}</span>
          <span className="block text-xs text-muted-foreground">
            {DOCUMENT_KIND_LABEL[doc.kind]} · {format(parseISO(doc.created_at), "d MMM yyyy")}
          </span>
        </span>
        <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
}

export default function ClientPresentPage() {
  const { id } = useParams();
  const client = useClient(id);
  const kpis = useClientKpis(id);
  const reports = useRows("reports", "period_end");
  const metrics = useRows("report_metrics");
  const work = useRows("work_log", "worked_on");
  const documents = useRows("documents");
  const invoices = useRows("invoices", "issue_date");
  const payments = useRows("payments", "paid_on");
  const onboarding = useOnboardingByClient();
  const { settings } = useSettings();
  const privacy = usePrivacy();
  const kes = useKes();
  const formatKpi = useKpiFormat();
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const c = client.data;
  const mine = <T extends { client_id: string | null }>(rows: T[] | undefined) => (rows ?? []).filter((r) => r.client_id === id);

  const clientReports = useMemo(() => mine(reports.data), [reports.data, id]); // eslint-disable-line react-hooks/exhaustive-deps
  const stories = useMemo(
    () => kpiStories(kpis.data ?? [], clientReports, metrics.data ?? []),
    [kpis.data, clientReports, metrics.data],
  );
  const best = bestStory(stories);
  const months = useMemo(() => workByMonth(mine(work.data)), [work.data, id]); // eslint-disable-line react-hooks/exhaustive-deps
  const money = useMemo(
    () => billing(mine(invoices.data), mine(payments.data)),
    [invoices.data, payments.data, id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const files = useMemo(
    () =>
      mine(documents.data)
        .filter((d) => !d.is_template)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [documents.data, id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const highlights = useMemo(
    () => [...clientReports].filter((r) => r.summary?.trim()).sort((a, b) => b.period_end.localeCompare(a.period_end)),
    [clientReports],
  );
  const progress = id ? onboarding.progressFor(id) : null;
  const totalWork = months.reduce((s, m) => s + m.items.length, 0);

  if (client.isLoading)
    return (
      <div className="hub-root bg-background p-10">
        <SkeletonBlock className="mx-auto h-72 max-w-5xl rounded-[28px]" />
      </div>
    );
  if (!c)
    return (
      <div className="hub-root flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Client not found.{" "}
          <Link to="/hub/clients" className="text-primary">
            Back to clients
          </Link>
        </p>
      </div>
    );

  const engagement = c.engagement_type ?? "retainer";
  const fee = feeOf(c);
  const since = togetherFor(c.start_date);
  const business = settings.business;

  return (
    <div className="hub-root bg-background text-foreground">
      {/* ---- top bar */}
      <header className="hub-glass sticky top-0 z-30 border-b border-border/60 print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            to={`/hub/clients/${c.id}`}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Exit
          </Link>
          <nav className="hidden flex-1 justify-center gap-1 md:flex" aria-label="Sections">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button
              type="button"
              onClick={privacy.toggle}
              aria-pressed={privacy.hidden}
              title={privacy.hidden ? "Show amounts" : "Hide amounts (e.g. on a shared screen)"}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
                privacy.hidden ? "bg-tint text-on-tint" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {privacy.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">{privacy.hidden ? "Amounts hidden" : "Hide amounts"}</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              title={fullscreen ? "Exit full screen" : "Full screen"}
              className="flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{fullscreen ? "Exit full screen" : "Full screen"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-4 pb-24 pt-8 sm:px-6 md:space-y-16 md:pt-10">
        {/* ---- hero */}
        <BlurFade>
          <section
            className="relative overflow-hidden rounded-[28px] border border-white/10 p-6 text-white shadow-hub-lg md:p-10"
            style={{ background: "linear-gradient(140deg, #221b16 0%, #110e0c 55%, #1b130d 100%)" }}
          >
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[#ff6a00]/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#ff6a00]/10 blur-3xl" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <div className="flex items-center gap-4">
                  <ClientAvatar name={c.name} className="h-16 w-16 rounded-2xl bg-white/10 text-xl text-white ring-1 ring-white/15" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">Client review</p>
                    <h1 className="truncate text-3xl font-bold tracking-tight md:text-[2.75rem] md:leading-[1.1]">{c.name}</h1>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/70">
                  <EngagementBadge type={engagement} className="bg-white/10 text-white" />
                  {since && <span>Working together {since}</span>}
                  {c.start_date && <span className="text-white/45">· since {format(parseISO(c.start_date), "MMMM yyyy")}</span>}
                </div>
                {c.services.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.services.map((s) => (
                      <span key={s} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs ring-1 ring-inset ring-white/10">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10 backdrop-blur-sm">
                {best ? (
                  <>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                      <Sparkles className="h-3.5 w-3.5 text-[#ff9a4d]" /> Biggest win so far
                    </p>
                    <p className="hub-tabular mt-2 text-5xl font-bold tracking-tight text-[#ff9a4d]">
                      {best.change! > 0 ? "+" : "−"}
                      {Math.abs(best.change!)}%
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      {best.kpi.name}: {formatKpi(best.first, best.kpi.unit)} → {formatKpi(best.latest, best.kpi.unit)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                      <TrendingUp className="h-3.5 w-3.5 text-[#ff9a4d]" /> At a glance
                    </p>
                    <p className="hub-tabular mt-2 text-4xl font-bold tracking-tight">{totalWork}</p>
                    <p className="mt-1 text-sm text-white/75">
                      {totalWork === 1 ? "piece of work logged" : "pieces of work logged"} so far
                    </p>
                  </>
                )}
                <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-white/50">{engagement === "project" ? "Project" : "Plan"}</dt>
                    <dd className="mt-0.5 font-medium">
                      {fee.amount ? `${kes(fee.amount)}${fee.suffix}` : ENGAGEMENT[engagement].short}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/50">{engagement === "retainer" ? "Reports" : ENGAGEMENT[engagement].endLabel}</dt>
                    <dd className="mt-0.5 font-medium">
                      {engagement === "retainer"
                        ? clientReports.length
                        : c.end_date
                          ? format(parseISO(c.end_date), "d MMM yyyy")
                          : "Not set"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        </BlurFade>

        {/* ---- results */}
        <Section id="results" eyebrow="Results" title="Where we started, and where we are now">
          {stories.length === 0 ? (
            <Empty>No KPIs set for this client yet. Add them on the client page and they'll show here.</Empty>
          ) : stories.every((s) => s.points.length === 0) ? (
            <Empty>The KPIs are set. Results will appear here once the first monthly report is added.</Empty>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                stories.length === 1 ? "md:max-w-xl" : "md:grid-cols-2",
                stories.length >= 3 && "lg:grid-cols-3",
              )}
            >
              {stories.map((s) => (
                <KpiCard key={s.kpi.id} story={s} />
              ))}
            </div>
          )}

          {highlights.length > 0 && (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {highlights.slice(0, 4).map((r) => (
                <article key={r.id} className="rounded-2xl border border-border/70 bg-card/60 p-5">
                  <p className="text-xs font-semibold text-primary">{r.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{r.summary}</p>
                </article>
              ))}
            </div>
          )}
        </Section>

        {/* ---- work */}
        <Section id="work" eyebrow="Work done" title="What we've been doing">
          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="hub-card p-5 md:p-6">
              {months.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nothing logged yet. Entries from the client's work log appear here month by month.
                </p>
              ) : (
                <ol className="space-y-7">
                  {months.slice(0, 6).map((m, i, shown) => (
                    <li key={m.key} className="relative pl-6">
                      <span aria-hidden className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-tint" />
                      {i < shown.length - 1 && (
                        <span aria-hidden className="absolute bottom-[-1.75rem] left-[4.5px] top-5 w-px bg-border" />
                      )}
                      <p className="flex items-baseline gap-2">
                        <span className="font-semibold">{m.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {m.items.length} {m.items.length === 1 ? "item" : "items"}
                        </span>
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {m.items.slice(0, 8).map((w) => (
                          <li key={w.id} className="flex items-start gap-2 text-sm">
                            <span className="mt-0.5 shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
                              {WORK_CATEGORY_LABEL[w.category]}
                            </span>
                            <span className="leading-relaxed">{w.title}</span>
                          </li>
                        ))}
                        {m.items.length > 8 && (
                          <li className="text-xs text-muted-foreground">and {m.items.length - 8} more</li>
                        )}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="space-y-4">
              {progress && progress.total > 0 && (
                <div className="hub-card flex items-center gap-4 p-5">
                  <Ring value={progress.done} total={progress.total} size={64} stroke={6} />
                  <div>
                    <p className="font-semibold">Setup</p>
                    <p className="text-sm text-muted-foreground">
                      {progress.done} of {progress.total} onboarding steps done
                    </p>
                  </div>
                </div>
              )}
              {engagement !== "retainer" && c.end_date && (
                <div className="hub-card p-5">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    {engagement === "project" ? "Project timeline" : "Contract term"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.start_date ? format(parseISO(c.start_date), "d MMM") : "Start"} → {format(parseISO(c.end_date), "d MMM yyyy")}
                    {durationLabel(c.start_date, c.end_date) && ` · ${durationLabel(c.start_date, c.end_date)}`}
                  </p>
                  {c.status === "ended" ? (
                    <p className="mt-2 flex items-center gap-1 text-sm font-medium text-on-tint">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </p>
                  ) : (
                    <TimeLeft client={c} className="mt-2" />
                  )}
                </div>
              )}
              <div className="hub-card p-5">
                <p className="font-semibold">In numbers</p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-secondary/60 p-3">
                    <dd className="hub-tabular text-xl font-bold">{totalWork}</dd>
                    <dt className="text-xs text-muted-foreground">things done</dt>
                  </div>
                  <div className="rounded-2xl bg-secondary/60 p-3">
                    <dd className="hub-tabular text-xl font-bold">{clientReports.length}</dd>
                    <dt className="text-xs text-muted-foreground">{clientReports.length === 1 ? "report" : "reports"}</dt>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </Section>

        {/* ---- billing */}
        <Section id="billing" eyebrow="Invoices" title="Billing at a glance">
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { label: "Paid to date", value: kes(money.received) },
              {
                label: money.overdue > 0 ? "Balance due · overdue" : "Balance due",
                value: kes(money.outstanding),
                warn: money.overdue > 0,
              },
              { label: "Invoices", value: String(money.rows.length) },
            ].map((t) => (
              <div key={t.label} className={cn("hub-card p-4 md:p-5", t.warn && "ring-1 ring-warning/30")}>
                <p className="hub-label">{t.label}</p>
                <p className={cn("hub-tabular mt-1 text-xl font-bold tracking-tight md:text-2xl", t.warn && "text-warning")}>
                  {t.value}
                </p>
              </div>
            ))}
          </div>
          {money.rows.length === 0 ? (
            <Empty>No invoices yet.</Empty>
          ) : (
            <div className="hub-card overflow-hidden">
              <ul className="divide-y divide-border/60">
                {money.rows.slice(0, 12).map((r) => (
                  <li key={r.invoice.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{r.invoice.title || r.invoice.number}</span>
                      <span className="block text-xs text-muted-foreground">
                        {r.invoice.number} · issued {format(parseISO(r.invoice.issue_date), "d MMM yyyy")}
                        {r.invoice.due_date && r.state !== "paid" && ` · due ${format(parseISO(r.invoice.due_date), "d MMM")}`}
                      </span>
                    </span>
                    <span className="hub-tabular text-right font-semibold">{kes(Number(r.invoice.amount))}</span>
                    <Pill tone={INVOICE_STATE[r.state].tone}>{INVOICE_STATE[r.state].label}</Pill>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* ---- documents */}
        <Section id="files" eyebrow="Documents" title="Contracts, proposals and reports">
          {files.length === 0 ? (
            <Empty>No documents filed for this client yet.</Empty>
          ) : (
            <div className="hub-card p-2">
              <ul className="grid md:grid-cols-2">
                {files.slice(0, 12).map((d) => (
                  <DocumentRow key={d.id} doc={d} />
                ))}
              </ul>
            </div>
          )}
        </Section>

        <footer className="flex flex-col items-center gap-1 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{business.name}</span>
          <span>{[business.tagline, business.website].filter(Boolean).join(" · ")}</span>
          <span className="text-xs">Prepared {format(new Date(), "d MMMM yyyy")}</span>
        </footer>
      </main>
    </div>
  );
}
