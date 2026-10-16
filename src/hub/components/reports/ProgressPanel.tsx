import { Suspense, lazy, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ArrowDownRight, ArrowUpRight, FileText, LineChart, Minus, MoreHorizontal, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { openDocument, useDeleteRow, useRows } from "../../lib/data";
import { formatKpi, lowerIsBetter } from "../../lib/format";
import { useClientKpis } from "../../lib/queries";
import type { Report } from "../../lib/types";
import { BlurFade } from "../motion/blur-fade";
import { EmptyState, SkeletonBlock, TableCard } from "../ui";
import { ReportDialog } from "./ReportDialog";

const KpiTrendChart = lazy(() => import("./KpiTrendChart"));

export function periodLabel(r: Pick<Report, "period_start" | "period_end">) {
  const s = parseISO(r.period_start);
  const e = parseISO(r.period_end);
  if (format(s, "yyyy-MM") === format(e, "yyyy-MM")) return format(s, "MMM yyyy");
  return `${format(s, "d MMM")} – ${format(e, "d MMM yyyy")}`;
}

function Delta({ current, previous, name }: { current: number; previous: number | undefined; name: string }) {
  if (previous === undefined) return <span className="text-xs text-muted-foreground">First report</span>;
  if (previous === current)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  const up = current > previous;
  const good = lowerIsBetter(name) ? !up : up;
  const pct = previous === 0 ? null : Math.round(((current - previous) / Math.abs(previous)) * 100);
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", good ? "text-on-tint" : "text-warning")}>
      <Icon className="h-3.5 w-3.5" />
      {pct === null ? "from 0" : `${Math.abs(pct)}%`} vs last report
    </span>
  );
}

/** Client "Progress" tab: KPI trend cards plus the list of reports behind them. */
export function ProgressPanel({ clientId }: { clientId: string }) {
  const kpis = useClientKpis(clientId);
  const reports = useRows("reports", "period_end");
  const metrics = useRows("report_metrics");
  const docs = useRows("documents");
  const remove = useDeleteRow("reports", ["report_metrics"]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);

  const clientReports = useMemo(
    () => (reports.data ?? []).filter((r) => r.client_id === clientId).sort((a, b) => a.period_end.localeCompare(b.period_end)),
    [reports.data, clientId],
  );

  const valueFor = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of metrics.data ?? []) map.set(`${m.report_id}:${m.client_kpi_id}`, Number(m.value));
    return (reportId: string, kpiId: string) => map.get(`${reportId}:${kpiId}`);
  }, [metrics.data]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  if (kpis.isLoading || reports.isLoading || metrics.isLoading) return <SkeletonBlock className="h-64 rounded-[20px]" />;

  if (!kpis.data?.length) {
    return (
      <div className="hub-card">
        <EmptyState
          icon={Target}
          title="No KPIs to track yet"
          description="Choose the metrics you report on for this client, then add a report each month."
          action={
            <Button asChild size="sm" className="rounded-full">
              <Link to={`/hub/clients/${clientId}/edit`}>Add KPIs</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const newest = [...clientReports].reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {clientReports.length
            ? `${clientReports.length} ${clientReports.length === 1 ? "report" : "reports"} · latest ${periodLabel(newest[0])}`
            : "No reports yet"}
        </p>
        <Button className="rounded-full px-4" onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" /> Add report
        </Button>
      </div>

      {clientReports.length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={LineChart}
            title="Add your first report"
            description="Enter this period's numbers for each KPI. Charts appear once you have a couple of reports."
            action={
              <Button size="sm" className="rounded-full" onClick={openNew}>
                Add report
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {kpis.data.map((kpi, i) => {
            const series = clientReports
              .map((r) => ({ label: format(parseISO(r.period_end), "MMM"), value: valueFor(r.id, kpi.id) }))
              .filter((p): p is { label: string; value: number } => p.value !== undefined);
            const latest = series[series.length - 1];
            const previous = series[series.length - 2];
            return (
              <BlurFade key={kpi.id} delay={Math.min(i, 6) * 0.04}>
                <div className="hub-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="hub-label">{kpi.name}</p>
                      <p className="hub-tabular mt-1 text-[1.75rem] font-bold leading-tight tracking-tight">
                        {latest ? formatKpi(latest.value, kpi.unit) : "—"}
                      </p>
                    </div>
                    <div className="pt-1">{latest && <Delta current={latest.value} previous={previous?.value} name={kpi.name} />}</div>
                  </div>
                  <div className="mt-3">
                    {series.length >= 2 ? (
                      <Suspense fallback={<SkeletonBlock className="h-36" />}>
                        <KpiTrendChart data={series} unit={kpi.unit} id={kpi.id} />
                      </Suspense>
                    ) : (
                      <p className="flex h-36 items-center justify-center rounded-xl bg-secondary/50 text-center text-xs text-muted-foreground">
                        {series.length ? "The trend line appears after the next report." : "No value recorded yet."}
                      </p>
                    )}
                  </div>
                </div>
              </BlurFade>
            );
          })}
        </div>
      )}

      {newest.length > 0 && (
        <section>
          <h3 className="hub-section-title">Reports</h3>
          <TableCard>
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Period</TableHead>
                  <TableHead>Title</TableHead>
                  {kpis.data.slice(0, 4).map((k) => (
                    <TableHead key={k.id} className="text-right">
                      {k.name}
                    </TableHead>
                  ))}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {newest.map((r) => {
                  const doc = r.document_id ? docs.data?.find((d) => d.id === r.document_id) : undefined;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap font-medium">{periodLabel(r)}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          {r.title}
                          {doc && (
                            <button
                              type="button"
                              onClick={() => openDocument(doc).catch((e: Error) => toast.error(e.message))}
                              className="text-primary"
                              aria-label={`Open ${doc.title}`}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                        </span>
                        {r.summary && <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">{r.summary}</span>}
                      </TableCell>
                      {kpis.data.slice(0, 4).map((k) => (
                        <TableCell key={k.id} className="hub-tabular whitespace-nowrap text-right">
                          {formatKpi(valueFor(r.id, k.id), k.unit)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label={`Actions for ${r.title}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditing(r);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() =>
                                remove.mutate(r.id, { onSuccess: () => toast.success("Report deleted"), onError: (e) => toast.error(e.message) })
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableCard>
        </section>
      )}

      <ReportDialog open={dialogOpen} onOpenChange={setDialogOpen} clientId={clientId} report={editing} />
    </div>
  );
}
