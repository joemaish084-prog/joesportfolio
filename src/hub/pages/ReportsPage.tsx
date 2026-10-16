import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { BarChart3, CalendarClock, FileCheck2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientPicker } from "../components/pickers";
import { BlurFade } from "../components/motion/blur-fade";
import { NumberTicker } from "../components/motion/number-ticker";
import { ReportDialog } from "../components/reports/ReportDialog";
import { periodLabel } from "../components/reports/ProgressPanel";
import { ClientAvatar, EmptyState, PageHeader, SkeletonBlock, StatTile, TableCard } from "../components/ui";
import { useDeleteRow, useRows } from "../lib/data";
import { useClients } from "../lib/queries";
import type { Report } from "../lib/types";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const clients = useClients();
  const reports = useRows("reports", "period_end");
  const metrics = useRows("report_metrics");
  const remove = useDeleteRow("reports", ["report_metrics"]);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; clientId?: string; report?: Report | null }>({ open: false });

  useEffect(() => {
    if (params.get("new") === "report") {
      setDialog({ open: true });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const clientName = useMemo(() => new Map((clients.data ?? []).map((c) => [c.id, c.name])), [clients.data]);
  const metricCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of metrics.data ?? []) m.set(x.report_id, (m.get(x.report_id) ?? 0) + 1);
    return m;
  }, [metrics.data]);

  const rows = useMemo(
    () =>
      (reports.data ?? [])
        .filter((r) => !clientFilter || r.client_id === clientFilter)
        .sort((a, b) => b.period_end.localeCompare(a.period_end)),
    [reports.data, clientFilter],
  );

  // Active clients with nothing covering last month.
  const lastMonth = subMonths(new Date(), 1);
  const lastMonthStart = format(startOfMonth(lastMonth), "yyyy-MM-dd");
  const lastMonthEnd = format(endOfMonth(lastMonth), "yyyy-MM-dd");
  const due = useMemo(() => {
    const active = (clients.data ?? []).filter((c) => !c.archived_at && c.status === "active");
    return active.filter(
      (c) =>
        !(reports.data ?? []).some(
          (r) => r.client_id === c.id && r.period_end >= lastMonthStart && r.period_start <= lastMonthEnd,
        ),
    );
  }, [clients.data, reports.data, lastMonthStart, lastMonthEnd]);

  const thisMonthCount = (reports.data ?? []).filter(
    (r) => r.created_at.slice(0, 7) === format(new Date(), "yyyy-MM"),
  ).length;

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Reports"
          subtitle="Monthly results per client. Each report updates the client's progress charts."
          actions={
            <Button className="rounded-full px-4" onClick={() => setDialog({ open: true })}>
              <Plus className="mr-1 h-4 w-4" /> New report
            </Button>
          }
        />
      </BlurFade>

      <BlurFade delay={0.05} className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Total reports" icon={BarChart3}>
          {reports.data ? <NumberTicker value={reports.data.length} /> : "—"}
        </StatTile>
        <StatTile label="Added this month" icon={FileCheck2}>
          {reports.data ? <NumberTicker value={thisMonthCount} /> : "—"}
        </StatTile>
        <StatTile
          label={`Due for ${format(lastMonth, "MMMM")}`}
          icon={CalendarClock}
          warn={due.length > 0}
          hint={due.length ? "Active clients without a report" : "Everyone's covered"}
          className="col-span-2 md:col-span-1"
        >
          {clients.data && reports.data ? <NumberTicker value={due.length} /> : "—"}
        </StatTile>
      </BlurFade>

      {due.length > 0 && (
        <BlurFade delay={0.08} className="mb-6">
          <h2 className="hub-section-title">Waiting for a {format(lastMonth, "MMMM")} report</h2>
          <div className="hub-card divide-y divide-border/60">
            {due.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                <ClientAvatar name={c.name} className="h-8 w-8 rounded-lg text-xs" />
                <span className="flex-1 truncate font-medium">{c.name}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => setDialog({ open: true, clientId: c.id })}
                >
                  Add report
                </Button>
              </div>
            ))}
          </div>
        </BlurFade>
      )}

      <BlurFade delay={0.1}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="hub-section-title p-0">All reports</h2>
          <ClientPicker
            value={clientFilter}
            onChange={setClientFilter}
            allowNone
            noneLabel="All clients"
            className="h-10 w-52 border-transparent bg-secondary"
          />
        </div>
        {reports.isLoading ? (
          <SkeletonBlock className="h-56 rounded-[20px]" />
        ) : rows.length === 0 ? (
          <div className="hub-card">
            <EmptyState
              icon={BarChart3}
              title={clientFilter ? "No reports for this client" : "No reports yet"}
              description="Add a report with each KPI's numbers for the month."
              action={
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => setDialog({ open: true, clientId: clientFilter ?? undefined })}
                >
                  New report
                </Button>
              }
            />
          </div>
        ) : (
          <TableCard>
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Client</TableHead>
                  <TableHead>Report</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">KPIs recorded</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/hub/clients/${r.client_id}?tab=progress`)}
                  >
                    <TableCell>
                      <Link
                        to={`/hub/clients/${r.client_id}?tab=progress`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium hover:text-primary"
                      >
                        {clientName.get(r.client_id) ?? "Client"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {r.title}
                      {r.summary && (
                        <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">{r.summary}</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{periodLabel(r)}</TableCell>
                    <TableCell className="hub-tabular text-right">{metricCount.get(r.id) ?? 0}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            aria-label={`Actions for ${r.title}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onSelect={() => setDialog({ open: true, report: r, clientId: r.client_id })}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() =>
                              remove.mutate(r.id, {
                                onSuccess: () => toast.success("Report deleted"),
                                onError: (e) => toast.error(e.message),
                              })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>
        )}
      </BlurFade>

      <ReportDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        clientId={dialog.clientId}
        report={dialog.report}
      />
    </>
  );
}
