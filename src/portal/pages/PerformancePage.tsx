import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BarChart3, LineChart, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatKpi, lowerIsBetter } from "@/hub/lib/format";
import type { KpiStory } from "@/hub/lib/clientStory";
import { usePortal } from "../auth/PortalData";
import { RANGES, periodRows, storiesFor, withData, type RangeId } from "../lib/derive";
import { downloadCsv, downloadPerformancePdf, downloadXlsx, performanceSheets } from "../lib/export";
import { BlurFade } from "../components/magic/magic";
import { BarsChart, TrendChart, unitFormatter } from "../components/charts";
import { DataTable } from "../components/DataTable";
import { ExportMenu } from "../components/ExportMenu";
import { Delta, EmptyState, PageHeader, SectionTitle } from "../components/ui";

type Row = ReturnType<typeof periodRows>[number];

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="portal-display portal-tabular mt-1 text-xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Pills<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1.5 overflow-x-auto pb-1">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          type="button"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === it.id
              ? "border-primary/50 bg-tint text-on-tint"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export default function PerformancePage() {
  const snap = usePortal();
  const [range, setRange] = useState<RangeId>("12m");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"area" | "bars">("area");

  const stories = useMemo(() => withData(storiesFor(snap, range)), [snap, range]);
  const story: KpiStory | undefined = stories.find((s) => s.kpi.id === selected) ?? stories[0];
  const kpis = useMemo(() => [...snap.kpis].sort((a, b) => a.sort_order - b.sort_order), [snap.kpis]);
  const rows = useMemo(() => periodRows(snap), [snap]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "period",
        header: "Period",
        accessorFn: (r) => r.period,
        cell: ({ row }) => <span className="font-medium">{row.original.period}</span>,
        sortingFn: (a, b) => a.original.period_end.localeCompare(b.original.period_end),
      },
      ...kpis.map<ColumnDef<Row>>((k) => ({
        id: k.id,
        header: k.name,
        accessorFn: (r) => r.values[k.id] ?? -Infinity,
        cell: ({ row }) => <span className="portal-tabular">{formatKpi(row.original.values[k.id], k.unit)}</span>,
        meta: { className: "text-right" },
      })),
    ],
    [kpis],
  );

  const sheets = () => performanceSheets(snap);
  const exportMenu = (
    <ExportMenu
      onPdf={() => downloadPerformancePdf(snap)}
      onXlsx={() => downloadXlsx(`${snap.client.name} performance`, sheets())}
      onCsv={() => downloadCsv(`${snap.client.name} performance`, sheets()[0]!.rows)}
    />
  );

  if (rows.length === 0 || !story) {
    return (
      <>
        <PageHeader eyebrow="Performance" title="Your results" />
        <EmptyState icon={BarChart3} title="No results yet">
          Your numbers will appear here as soon as your first report is published.
        </EmptyState>
      </>
    );
  }

  const fmt = unitFormatter(story.kpi.unit);
  const lower = lowerIsBetter(story.kpi.name);
  const best = story.points.reduce((a, b) => ((lower ? b.value < a.value : b.value > a.value) ? b : a), story.points[0]!);
  const avg = story.points.reduce((s, p) => s + p.value, 0) / story.points.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Performance"
        title="Your results"
        description="Pick a metric and a time range. Everything here can be downloaded."
        actions={exportMenu}
      />

      <BlurFade>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Pills
            label="Metric"
            items={stories.map((s) => ({ id: s.kpi.id, label: s.kpi.name }))}
            value={story.kpi.id}
            onChange={setSelected}
          />
          <Pills<RangeId> label="Time range" items={RANGES.map((r) => ({ id: r.id, label: r.label }))} value={range} onChange={setRange} />
        </div>
      </BlurFade>

      <BlurFade delay={0.05}>
        <section className="portal-card p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="portal-display text-xl font-semibold">{story.kpi.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="portal-display portal-tabular text-3xl font-bold">{story.latest === null ? "—" : fmt(story.latest)}</span>
                <Delta change={story.change} good={story.improved} suffix=" in this range" />
              </div>
            </div>
            <div role="group" aria-label="Chart type" className="flex rounded-xl bg-secondary p-1">
              {(
                [
                  ["area", "Trend", LineChart],
                  ["bars", "Bars", BarChart3],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => setView(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    view === id ? "bg-card text-foreground shadow-portal" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {story.points.length > 1 ? (
            view === "area" ? (
              <TrendChart name={story.kpi.name} unit={story.kpi.unit} points={story.points} />
            ) : (
              <BarsChart name={story.kpi.name} unit={story.kpi.unit} points={story.points} />
            )
          ) : (
            <p className="rounded-2xl bg-secondary/50 py-16 text-center text-sm text-muted-foreground">
              A chart needs at least two reports in this range. Try a longer time range.
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Started at" value={story.first === null ? "—" : fmt(story.first)} hint={story.points[0]?.label} />
            <Stat label="Latest" value={story.latest === null ? "—" : fmt(story.latest)} hint={story.points.at(-1)?.label} />
            <Stat label="Average" value={fmt(avg)} hint={`across ${story.points.length} ${story.points.length === 1 ? "report" : "reports"}`} />
            <Stat label="Best month" value={fmt(best.value)} hint={best.label} />
          </div>

          {story.kpi.target !== null && story.toTarget !== null && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-tint p-4 text-on-tint">
              <Trophy className="h-5 w-5 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">{Math.round(story.toTarget * 100)}% of the way</span> to your target of{" "}
                {fmt(Number(story.kpi.target))}.
              </p>
            </div>
          )}
        </section>
      </BlurFade>

      <BlurFade delay={0.08}>
        <SectionTitle>Month by month</SectionTitle>
        <DataTable
          data={rows}
          columns={columns}
          searchPlaceholder="Search periods"
          initialSorting={[{ id: "period", desc: true }]}
          pageSize={8}
        />
      </BlurFade>
    </div>
  );
}
