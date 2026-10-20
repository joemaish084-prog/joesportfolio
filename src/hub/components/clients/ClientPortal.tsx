import { Suspense, lazy, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  Minus,
  Sparkles,
  Store,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bestStory, billing, kpiStories, revenueStory, togetherFor, workByMonth, type KpiStory } from "../../lib/clientStory";
import { openDocument, useRows } from "../../lib/data";
import { ENGAGEMENT, durationLabel, feeOf } from "../../lib/engagement";
import { INVOICE_STATE } from "../../lib/finance";
import { formatKpi as formatKpiRaw } from "../../lib/format";
import { useKes } from "../../lib/privacy";
import { useClientKpis, useOnboardingByClient } from "../../lib/queries";
import { DOCUMENT_KIND_LABEL, WORK_CATEGORY_LABEL, type Client, type HubDocument } from "../../lib/types";
import { TimeLeft } from "../engagement";
import { BlurFade } from "../motion/blur-fade";
import { Ring } from "../overview/visuals";
import { PrivateBlur } from "../privacy";
import { Pill, SkeletonBlock } from "../ui";

const KpiTrendChart = lazy(() => import("../reports/KpiTrendChart"));

// The client dashboard: everything about one client on one page. What they
// bring in (their own sales, and what they pay you), their results since you
// started, the work behind them, billing and files.

const SECTIONS = [
  { id: "money", label: "Money" },
  { id: "results", label: "Results" },
  { id: "work", label: "Work done" },
  { id: "billing", label: "Invoices" },
  { id: "files", label: "Documents" },
] as const;

/** KPI values in KES follow the hide-amounts switch like every other amount. */
function useKpiFormat() {
  const kes = useKes();
  return (value: number | null | undefined, unit: KpiStory["kpi"]["unit"]) =>
    unit === "kes" && value !== null && value !== undefined ? kes(value) : formatKpiRaw(value, unit);
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mb-4 mt-1 text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="hub-card flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
      <p className="max-w-md">{children}</p>
      {action}
    </div>
  );
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

function KpiCard({ story }: { story: KpiStory }) {
  const { kpi, first, latest, points, toTarget } = story;
  const formatKpi = useKpiFormat();
  const chart = <KpiTrendChart data={points} unit={kpi.unit} id={`portal-${kpi.id}`} />;
  return (
    <article className="hub-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{kpi.name}</h3>
        <Change story={story} />
      </div>
      <p className="hub-tabular mt-2 text-[1.875rem] font-bold leading-none tracking-tight">{formatKpi(latest, kpi.unit)}</p>
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
            {kpi.unit === "kes" ? <PrivateBlur quiet>{chart}</PrivateBlur> : chart}
          </Suspense>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------- money summary

const IN = "#e8650e";

function MoneyBanner({
  client,
  revenue,
  money,
}: {
  client: Client;
  revenue: KpiStory | null;
  money: ReturnType<typeof billing>;
}) {
  const kes = useKes();
  const engagement = client.engagement_type ?? "retainer";
  const fee = feeOf(client);
  const since = togetherFor(client.start_date);
  const points = revenue?.points ?? [];
  const max = Math.max(1, ...points.map((p) => p.value));
  const tracked = points.reduce((s, p) => s + p.value, 0);
  // "Their revenue is 13× your fee" — only when both are monthly figures.
  const multiple =
    revenue?.latest && engagement !== "project" && client.monthly_fee
      ? revenue.latest / Number(client.monthly_fee)
      : null;

  return (
    <section
      id="money"
      className="relative scroll-mt-6 overflow-hidden rounded-[28px] border border-white/10 p-5 text-white shadow-hub-lg md:p-8"
      style={{ background: "linear-gradient(140deg, #221b16 0%, #110e0c 55%, #1b130d 100%)" }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[#ff6a00]/25 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      />

      <div className="relative grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
        {/* ---- their business */}
        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-white/55">
            <Store className="h-3.5 w-3.5" /> Their business · {revenue?.kpi.name ?? "revenue"}
          </p>
          {revenue && revenue.latest !== null ? (
            <>
              <p className="hub-tabular mt-3 text-[2.5rem] font-bold leading-none tracking-tight md:text-[3.25rem]">
                {kes(revenue.latest)}
              </p>
              <p className="mt-2 text-sm text-white/65">
                in {points.at(-1)?.label}, their latest report
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {revenue.change !== null && (
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                      revenue.change >= 0 ? "bg-[#ff6a00]/15 text-[#ffb27a] ring-[#ff6a00]/30" : "bg-white/10 text-[#ff9a9a] ring-white/10",
                    )}
                  >
                    {revenue.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {revenue.change >= 0 ? "+" : "−"}
                    {Math.abs(revenue.change)}% since we started ({kes(revenue.first)} in {points[0]?.label})
                  </span>
                )}
                {points.length > 1 && (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs ring-1 ring-inset ring-white/10">
                    {kes(tracked)} across {points.length} months
                  </span>
                )}
              </div>
              {points.length > 1 && (
                <PrivateBlur quiet className="mt-auto">
                  <div className="mt-6 flex h-24 items-end gap-1.5" role="img" aria-label={`${revenue.kpi.name} by month`}>
                    {points.map((p, i) => (
                      <div key={p.end} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${p.label}: ${kes(p.value)}`}>
                        <div
                          className="w-full max-w-10 rounded-t-[4px] transition-opacity group-hover:opacity-100"
                          style={{
                            height: `${Math.max(4, (p.value / max) * 100)}%`,
                            background: IN,
                            opacity: i === points.length - 1 ? 1 : 0.45,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 flex gap-1.5">
                    {points.map((p, i) => (
                      <span
                        key={p.end}
                        className={cn("flex-1 text-center text-[0.625rem]", i === points.length - 1 ? "text-white" : "text-white/45")}
                      >
                        {p.label.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </PrivateBlur>
              )}
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-white/[0.06] p-4 text-sm text-white/75 ring-1 ring-inset ring-white/10">
              To see how much they're bringing in, add a <span className="font-semibold text-white">Revenue</span> or{" "}
              <span className="font-semibold text-white">Sales</span> KPI in KES to this client, then fill it in with each
              monthly report.
              <Link
                to={`/hub/clients/${client.id}/edit`}
                className="mt-3 block w-fit rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#110e0c]"
              >
                Add a revenue KPI
              </Link>
            </div>
          )}
        </div>

        {/* ---- with you */}
        <div className="rounded-3xl bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-white/55">
            <Banknote className="h-3.5 w-3.5" /> What they pay you
          </p>
          <p className="hub-tabular mt-3 text-3xl font-bold tracking-tight">{kes(money.received)}</p>
          <p className="text-sm text-white/65">
            {since && since !== "less than a month" ? `paid to you in total, over ${since}` : "paid to you so far"}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <dt className="text-[0.6875rem] text-white/50">{fee.label}</dt>
              <dd className="hub-tabular mt-0.5 font-semibold">
                {fee.amount ? `${kes(fee.amount)}${fee.suffix}` : "Not set"}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <dt className="text-[0.6875rem] text-white/50">This year</dt>
              <dd className="hub-tabular mt-0.5 font-semibold">{kes(money.thisYear)}</dd>
            </div>
            <div className={cn("rounded-2xl p-3", money.overdue > 0 ? "bg-[#ff4d4d]/15" : "bg-white/[0.05]")}>
              <dt className="text-[0.6875rem] text-white/50">{money.overdue > 0 ? "Due · overdue" : "Due"}</dt>
              <dd className={cn("hub-tabular mt-0.5 font-semibold", money.overdue > 0 && "text-[#ff9a9a]")}>
                {kes(money.outstanding)}
              </dd>
            </div>
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <dt className="text-[0.6875rem] text-white/50">{ENGAGEMENT[engagement].short}</dt>
              <dd className="mt-0.5 font-semibold">
                {engagement === "retainer"
                  ? since ?? "Ongoing"
                  : client.end_date
                    ? `${engagement === "project" ? "Due" : "Ends"} ${format(parseISO(client.end_date), "d MMM")}`
                    : "No end date"}
              </dd>
            </div>
          </dl>

          {multiple !== null && multiple >= 1 && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-[#ff6a00]/15 p-3 text-sm text-white/85 ring-1 ring-inset ring-[#ff6a00]/25">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9a4d]" />
              <span>
                Their monthly {revenue?.kpi.name.toLowerCase() ?? "revenue"} is{" "}
                <span className="font-semibold text-white">{multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)}×</span>{" "}
                what they pay you.
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- documents

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

// ---------------------------------------------------------------- portal

export function ClientPortal({ client }: { client: Client }) {
  const id = client.id;
  const kpis = useClientKpis(id);
  const reports = useRows("reports", "period_end");
  const metrics = useRows("report_metrics");
  const work = useRows("work_log", "worked_on");
  const documents = useRows("documents");
  const invoices = useRows("invoices", "issue_date");
  const payments = useRows("payments", "paid_on");
  const onboarding = useOnboardingByClient();
  const kes = useKes();

  const clientReports = useMemo(() => (reports.data ?? []).filter((r) => r.client_id === id), [reports.data, id]);
  const stories = useMemo(
    () => kpiStories(kpis.data ?? [], clientReports, metrics.data ?? []),
    [kpis.data, clientReports, metrics.data],
  );
  const revenue = revenueStory(stories);
  const best = bestStory(stories);
  const months = useMemo(() => workByMonth((work.data ?? []).filter((w) => w.client_id === id)), [work.data, id]);
  const money = useMemo(
    () =>
      billing(
        (invoices.data ?? []).filter((i) => i.client_id === id),
        (payments.data ?? []).filter((p) => p.client_id === id),
      ),
    [invoices.data, payments.data, id],
  );
  const files = useMemo(
    () =>
      (documents.data ?? [])
        .filter((d) => d.client_id === id && !d.is_template)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [documents.data, id],
  );
  const highlights = useMemo(
    () => clientReports.filter((r) => r.summary?.trim()).sort((a, b) => b.period_end.localeCompare(a.period_end)),
    [clientReports],
  );
  const progress = onboarding.progressFor(id);
  const totalWork = months.reduce((s, m) => s + m.items.length, 0);
  const engagement = client.engagement_type ?? "retainer";
  const loading = kpis.isLoading || reports.isLoading || metrics.isLoading || invoices.isLoading || payments.isLoading;

  if (loading)
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-72 rounded-[28px]" />
        <SkeletonBlock className="h-56 rounded-[20px]" />
      </div>
    );

  return (
    <div className="space-y-12">
      <nav className="-mx-4 -mt-2 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Jump to">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className="shrink-0 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-sm text-muted-foreground shadow-hub transition-colors hover:text-foreground"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <BlurFade>
        <MoneyBanner client={client} revenue={revenue} money={money} />
      </BlurFade>

      <Section id="results" eyebrow="Results" title="Where we started, and where we are now">
        {best && best.kpi.id !== revenue?.kpi.id && (
          <p className="mb-4 flex w-fit items-center gap-2 rounded-full bg-tint px-3.5 py-1.5 text-sm text-on-tint">
            <Sparkles className="h-4 w-4" /> Biggest win: {best.kpi.name} {best.change! > 0 ? "up" : "down"}{" "}
            {Math.abs(best.change!)}% since we started
          </p>
        )}
        {stories.length === 0 ? (
          <Empty
            action={
              <Link to={`/hub/clients/${id}/edit`} className="text-sm font-medium text-primary hover:underline">
                Add KPIs
              </Link>
            }
          >
            No KPIs set for this client yet. Choose what you track (sales, leads, ROAS…) and add a report each month.
          </Empty>
        ) : stories.every((s) => s.points.length === 0) ? (
          <Empty
            action={
              <Link to={`/hub/clients/${id}?tab=progress`} className="text-sm font-medium text-primary hover:underline">
                Add the first report
              </Link>
            }
          >
            The KPIs are set. Results appear here once the first monthly report is in.
          </Empty>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              stories.length === 1 ? "md:max-w-xl" : "md:grid-cols-2",
              stories.length >= 3 && "xl:grid-cols-3",
            )}
          >
            {stories.map((s) => (
              <KpiCard key={s.kpi.id} story={s} />
            ))}
          </div>
        )}
        {highlights.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {highlights.slice(0, 4).map((r) => (
              <article key={r.id} className="rounded-2xl border border-border/70 bg-card/60 p-5">
                <p className="text-xs font-semibold text-primary">{r.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed">{r.summary}</p>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section id="work" eyebrow="Work done" title="What we've been doing">
        <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
          <div className="hub-card min-w-0 p-5 md:p-6">
            {months.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing logged yet.{" "}
                <Link to={`/hub/clients/${id}?tab=worklog`} className="font-medium text-primary hover:underline">
                  Log work
                </Link>{" "}
                and it shows here month by month.
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
                      {m.items.length > 8 && <li className="text-xs text-muted-foreground">and {m.items.length - 8} more</li>}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="space-y-4">
            {progress.total > 0 && (
              <Link to={`/hub/clients/${id}?tab=onboarding`} className="hub-card hub-card-interactive flex items-center gap-4 p-5">
                <Ring value={progress.done} total={progress.total} size={64} stroke={6} />
                <div>
                  <p className="font-semibold">Setup</p>
                  <p className="text-sm text-muted-foreground">
                    {progress.done} of {progress.total} onboarding steps done
                  </p>
                </div>
              </Link>
            )}
            {engagement !== "retainer" && client.end_date && (
              <div className="hub-card p-5">
                <p className="flex items-center gap-1.5 font-semibold">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  {engagement === "project" ? "Project timeline" : "Contract term"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {client.start_date ? format(parseISO(client.start_date), "d MMM") : "Start"} →{" "}
                  {format(parseISO(client.end_date), "d MMM yyyy")}
                  {durationLabel(client.start_date, client.end_date) && ` · ${durationLabel(client.start_date, client.end_date)}`}
                </p>
                {client.status === "ended" ? (
                  <p className="mt-2 flex items-center gap-1 text-sm font-medium text-on-tint">
                    <CheckCircle2 className="h-4 w-4" /> Completed
                  </p>
                ) : (
                  <TimeLeft client={client} className="mt-2" />
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

      <Section id="billing" eyebrow="Invoices" title="Billing at a glance">
        {money.rows.length === 0 ? (
          <Empty
            action={
              <Link to={`/hub/clients/${id}?tab=finance`} className="text-sm font-medium text-primary hover:underline">
                Open their finance
              </Link>
            }
          >
            No invoices sent yet.
          </Empty>
        ) : (
          <div className="hub-card overflow-hidden">
            <ul className="divide-y divide-border/60">
              {money.rows.slice(0, 12).map((r) => (
                <li key={r.invoice.id}>
                  <Link
                    to={`/hub/finance/invoices/${r.invoice.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-secondary/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{r.invoice.title || r.invoice.number}</span>
                      <span className="block text-xs text-muted-foreground">
                        {r.invoice.number} · issued {format(parseISO(r.invoice.issue_date), "d MMM yyyy")}
                        {r.invoice.due_date && r.state !== "paid" && ` · due ${format(parseISO(r.invoice.due_date), "d MMM")}`}
                      </span>
                    </span>
                    <span className="hub-tabular text-right font-semibold">{kes(Number(r.invoice.amount))}</span>
                    <Pill tone={INVOICE_STATE[r.state].tone}>{INVOICE_STATE[r.state].label}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section id="files" eyebrow="Documents" title="Contracts, proposals and reports">
        {files.length === 0 ? (
          <Empty
            action={
              <Link to={`/hub/clients/${id}?tab=documents`} className="text-sm font-medium text-primary hover:underline">
                Upload a document
              </Link>
            }
          >
            No documents filed for this client yet.
          </Empty>
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
    </div>
  );
}
