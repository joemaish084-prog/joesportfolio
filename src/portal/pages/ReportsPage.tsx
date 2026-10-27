import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatKpi, lowerIsBetter } from "@/hub/lib/format";
import { usePortal } from "../auth/PortalData";
import { openPortalFile } from "../lib/api";
import { periodLabel, periodRows } from "../lib/derive";
import { downloadCsv, downloadPerformancePdf, downloadXlsx, type Cell } from "../lib/export";
import { BlurFade } from "../components/magic/magic";
import { DataTable } from "../components/DataTable";
import { ExportMenu } from "../components/ExportMenu";
import { Delta, EmptyState, PageHeader, Pill } from "../components/ui";
import type { PortalReport } from "../lib/types";

function ReportDialog({ report, onClose }: { report: PortalReport | null; onClose: () => void }) {
  const snap = usePortal();
  const rows = useMemo(() => periodRows(snap), [snap]);
  const kpis = [...snap.kpis].sort((a, b) => a.sort_order - b.sort_order);
  const idx = report ? rows.findIndex((r) => r.id === report.id) : -1;
  const current = idx >= 0 ? rows[idx] : null;
  const previous = idx >= 0 ? rows[idx + 1] : null; // rows run newest first
  const doc = report?.document_id ? snap.documents.find((d) => d.id === report.document_id) : null;

  return (
    <Dialog open={!!report} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="portal-scope max-h-[90dvh] max-w-2xl overflow-y-auto rounded-3xl border-border bg-card p-0">
        {report && current && (
          <>
            <div className="border-b border-border/70 p-6">
              <p className="portal-eyebrow">{periodLabel(report.period_start, report.period_end)}</p>
              <DialogTitle className="portal-display mt-1 text-2xl font-bold">{report.title}</DialogTitle>
              <DialogDescription className="sr-only">Results for this report period</DialogDescription>
              {report.summary && <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{report.summary}</p>}
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {kpis.map((k) => {
                const v = current.values[k.id];
                const p = previous?.values[k.id] ?? null;
                const change = v !== null && p !== null && p !== 0 ? Math.round(((v - p) / Math.abs(p)) * 100) : null;
                const good = change === null || change === 0 ? null : lowerIsBetter(k.name) ? change < 0 : change > 0;
                return (
                  <div key={k.id} className="rounded-2xl bg-secondary/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-muted-foreground">{k.name}</p>
                      <Delta change={change} good={good} suffix=" vs last" />
                    </div>
                    <p className="portal-display portal-tabular mt-1.5 text-2xl font-bold">{formatKpi(v, k.unit)}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 p-4">
              {doc && (
                <Button
                  className="rounded-xl"
                  onClick={() => openPortalFile(doc, true).catch((e: Error) => toast.error(e.message))}
                >
                  <Download className="mr-1.5 h-4 w-4" /> Download the full report
                </Button>
              )}
              <Button variant="outline" className="rounded-xl" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ReportsPage() {
  const snap = usePortal();
  const [open, setOpen] = useState<PortalReport | null>(null);
  const docFor = (r: PortalReport) => (r.document_id ? snap.documents.find((d) => d.id === r.document_id) : undefined);

  const columns = useMemo<ColumnDef<PortalReport>[]>(
    () => [
      {
        id: "title",
        header: "Report",
        accessorFn: (r) => `${r.title} ${r.summary ?? ""}`,
        cell: ({ row }) => (
          <div className="min-w-[14rem]">
            <p className="font-medium">{row.original.title}</p>
            {row.original.summary && <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground">{row.original.summary}</p>}
          </div>
        ),
      },
      {
        id: "period",
        header: "Period",
        accessorFn: (r) => r.period_end,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{periodLabel(row.original.period_start, row.original.period_end)}</span>
        ),
      },
      {
        id: "file",
        header: "Full report",
        enableSorting: false,
        cell: ({ row }) => (docFor(row.original) ? <Pill tone="accent">PDF</Pill> : <span className="text-xs text-muted-foreground">Summary only</span>),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { className: "text-right" },
        cell: ({ row }) => {
          const doc = docFor(row.original);
          return (
            <div className="flex justify-end gap-1.5">
              <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => setOpen(row.original)}>
                <Eye className="mr-1.5 h-3.5 w-3.5" /> View
              </Button>
              {doc && (
                <Button
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() => openPortalFile(doc, true).catch((e: Error) => toast.error(e.message))}
                  aria-label={`Download ${row.original.title}`}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snap.documents],
  );

  const listRows = (): Cell[][] => [
    ["Report", "Period start", "Period end", "Summary"],
    ...snap.reports.map((r) => [r.title, r.period_start, r.period_end, r.summary ?? ""] as Cell[]),
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="Monthly reports"
        description="Every report we've published for you. Open one to see the numbers, or download the full PDF."
        actions={
          snap.reports.length > 0 && (
            <ExportMenu
              label="Download all"
              onPdf={() => downloadPerformancePdf(snap)}
              onXlsx={() => downloadXlsx(`${snap.client.name} reports`, [{ name: "Reports", rows: listRows() }])}
              onCsv={() => downloadCsv(`${snap.client.name} reports`, listRows())}
            />
          )
        }
      />
      <BlurFade>
        {snap.reports.length === 0 ? (
          <EmptyState icon={FileText} title="No reports yet">
            Your first monthly report will be published here, usually in the first week after month-end.
          </EmptyState>
        ) : (
          <DataTable
            data={snap.reports}
            columns={columns}
            searchPlaceholder="Search reports"
            initialSorting={[{ id: "period", desc: true }]}
            onRowClick={(r) => setOpen(r)}
            toolbar={
              <p className="hidden text-xs text-muted-foreground sm:block">
                {snap.reports.length} {snap.reports.length === 1 ? "report" : "reports"} · latest{" "}
                {format(parseISO(snap.reports.map((r) => r.period_end).sort().at(-1)!), "MMMM yyyy")}
              </p>
            }
          />
        )}
      </BlurFade>
      <ReportDialog report={open} onClose={() => setOpen(null)} />
    </div>
  );
}
