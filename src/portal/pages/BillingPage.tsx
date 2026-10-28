import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { CreditCard, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { INVOICE_STATE } from "@/hub/lib/finance";
import { PAYMENT_METHOD_LABEL } from "@/hub/lib/types";
import { usePortal } from "../auth/PortalData";
import { openPortalFile } from "../lib/api";
import { money } from "../lib/derive";
import { downloadCsv, downloadTablePdf, downloadXlsx, type Cell } from "../lib/export";
import { formatMoney } from "../lib/format";
import { BlurFade } from "../components/magic/magic";
import { DataTable } from "../components/DataTable";
import { ExportMenu } from "../components/ExportMenu";
import { PayCard, hasPaymentDetails } from "../components/people";
import { EmptyState, PageHeader, Pill, type PillTone } from "../components/ui";

type Row = ReturnType<typeof money>["rows"][number];

const TONE: Record<string, PillTone> = { muted: "muted", neutral: "neutral", accent: "success", warning: "warning", outline: "muted" };
const stateOf = (r: Row) => INVOICE_STATE[r.state];

function Summary({ label, value, tone }: { label: string; value: string; tone?: "warning" | "success" }) {
  return (
    <div className="portal-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`portal-display portal-tabular mt-1.5 text-2xl font-bold ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function InvoiceDialog({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const snap = usePortal();
  const cur = row?.invoice.currency ?? snap.client.currency;
  const doc = row?.invoice.document_id ? snap.documents.find((d) => d.id === row.invoice.document_id) : undefined;
  const payments = row ? snap.payments.filter((p) => p.invoice_id === row.invoice.id) : [];

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="portal-scope max-h-[90dvh] max-w-xl overflow-y-auto rounded-3xl border-border bg-card p-0">
        {row && (
          <>
            <div className="border-b border-border/70 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="portal-eyebrow">{row.invoice.number}</p>
                <Pill tone={TONE[stateOf(row).tone] ?? "neutral"}>{stateOf(row).label}</Pill>
              </div>
              <DialogTitle className="portal-display mt-1 text-2xl font-bold">{row.invoice.title || row.invoice.number}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Issued {format(parseISO(row.invoice.issue_date), "d MMM yyyy")}
                {row.invoice.due_date && ` · due ${format(parseISO(row.invoice.due_date), "d MMM yyyy")}`}
              </DialogDescription>
            </div>
            <div className="space-y-5 p-6">
              {row.invoice.line_items.length > 0 && (
                <ul className="divide-y divide-border/60 rounded-2xl border border-border/70">
                  {row.invoice.line_items.map((li, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                      <span>
                        {li.description}
                        {li.quantity !== 1 && <span className="text-muted-foreground"> × {li.quantity}</span>}
                      </span>
                      <span className="portal-tabular font-medium">{formatMoney(li.quantity * li.unit_price, cur)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="portal-tabular font-semibold">{formatMoney(Number(row.invoice.amount), cur)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Paid</dt>
                  <dd className="portal-tabular font-semibold text-success">{formatMoney(row.paid, cur)}</dd>
                </div>
                <div className="flex justify-between border-t border-border/70 pt-2">
                  <dt className="font-semibold">Balance</dt>
                  <dd className="portal-tabular font-bold">{formatMoney(row.balance, cur)}</dd>
                </div>
              </dl>
              {row.balance > 0 && (snap.business.mpesa_till || snap.business.mpesa_paybill) && (
                <p className="rounded-2xl bg-tint p-3.5 text-sm text-on-tint">
                  Pay with M-Pesa{" "}
                  {snap.business.mpesa_till
                    ? `Till ${snap.business.mpesa_till}`
                    : `Paybill ${snap.business.mpesa_paybill}, account ${snap.business.mpesa_account || row.invoice.number}`}
                  . Mention <span className="font-semibold">{row.invoice.number}</span> so we match it right away.
                </p>
              )}
              {payments.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payments</p>
                  <ul className="space-y-1.5 text-sm">
                    {payments.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          {format(parseISO(p.paid_on), "d MMM yyyy")} · {PAYMENT_METHOD_LABEL[p.method]}
                          {p.reference && ` · ${p.reference}`}
                        </span>
                        <span className="portal-tabular font-medium">{formatMoney(Number(p.amount), cur)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 p-4">
              {doc ? (
                <Button className="rounded-xl" onClick={() => openPortalFile(doc, true).catch((e: Error) => toast.error(e.message))}>
                  <Download className="mr-1.5 h-4 w-4" /> Download invoice
                </Button>
              ) : (
                <Button
                  className="rounded-xl"
                  onClick={() =>
                    void downloadTablePdf({
                      title: `Invoice ${row.invoice.number}`,
                      subtitle: `${snap.client.business_name || snap.client.name} · issued ${format(parseISO(row.invoice.issue_date), "d MMM yyyy")}`,
                      who: "JM Creative",
                      head: ["Description", "Qty", "Unit price", "Amount"],
                      body: [
                        ...row.invoice.line_items.map((li) => [
                          li.description,
                          li.quantity,
                          formatMoney(li.unit_price, cur),
                          formatMoney(li.quantity * li.unit_price, cur),
                        ]),
                        ["Total", "", "", formatMoney(Number(row.invoice.amount), cur)],
                        ["Paid", "", "", formatMoney(row.paid, cur)],
                        ["Balance", "", "", formatMoney(row.balance, cur)],
                      ],
                      fileName: row.invoice.number,
                    }).catch(() => toast.error("Couldn't create the PDF. Please try again."))
                  }
                >
                  <Download className="mr-1.5 h-4 w-4" /> Download summary PDF
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

export default function BillingPage() {
  const snap = usePortal();
  const m = useMemo(() => money(snap), [snap]);
  const cur = snap.client.currency;
  const [open, setOpen] = useState<Row | null>(null);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "number",
        header: "Invoice",
        accessorFn: (r) => `${r.invoice.number} ${r.invoice.title ?? ""}`,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.invoice.title || row.original.invoice.number}</p>
            <p className="text-xs text-muted-foreground">{row.original.invoice.number}</p>
          </div>
        ),
        sortingFn: (a, b) => a.original.invoice.number.localeCompare(b.original.invoice.number),
      },
      {
        id: "issued",
        header: "Issued",
        accessorFn: (r) => r.invoice.issue_date,
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{format(parseISO(row.original.invoice.issue_date), "d MMM yyyy")}</span>,
      },
      {
        id: "due",
        header: "Due",
        accessorFn: (r) => r.invoice.due_date ?? "",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {row.original.invoice.due_date ? format(parseISO(row.original.invoice.due_date), "d MMM yyyy") : "—"}
          </span>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        accessorFn: (r) => Number(r.invoice.amount),
        cell: ({ row }) => <span className="portal-tabular font-semibold">{formatMoney(Number(row.original.invoice.amount), row.original.invoice.currency)}</span>,
        meta: { className: "text-right" },
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (r) => stateOf(r).label,
        cell: ({ row }) => <Pill tone={TONE[stateOf(row.original).tone] ?? "neutral"}>{stateOf(row.original).label}</Pill>,
      },
      {
        id: "open",
        header: "",
        enableSorting: false,
        meta: { className: "text-right" },
        cell: ({ row }) => (
          <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => setOpen(row.original)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Open
          </Button>
        ),
      },
    ],
    [],
  );

  const sheets = () => [
    {
      name: "Invoices",
      rows: [
        ["Invoice", "Title", "Issued", "Due", "Amount", "Paid", "Balance", "Status"],
        ...m.rows.map(
          (r) =>
            [r.invoice.number, r.invoice.title ?? "", r.invoice.issue_date, r.invoice.due_date ?? "", Number(r.invoice.amount), r.paid, r.balance, stateOf(r).label] as Cell[],
        ),
      ],
    },
    {
      name: "Payments",
      rows: [
        ["Date", "Amount", "Method", "Reference", "Invoice"],
        ...snap.payments.map(
          (p) =>
            [p.paid_on, Number(p.amount), PAYMENT_METHOD_LABEL[p.method], p.reference ?? "", snap.invoices.find((i) => i.id === p.invoice_id)?.number ?? ""] as Cell[],
        ),
      ],
    },
  ];

  if (m.rows.length === 0 && snap.payments.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Billing" title="Invoices and payments" />
        <EmptyState icon={CreditCard} title="No invoices yet">
          Your invoices and payment history will be listed here.
        </EmptyState>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices and payments"
        description="Everything you've been billed and everything you've paid."
        actions={
          <ExportMenu
            onPdf={() =>
              downloadTablePdf({
                title: "Invoices",
                subtitle: snap.client.business_name || snap.client.name,
                who: "JM Creative",
                head: ["Invoice", "Issued", "Due", "Amount", "Paid", "Status"],
                body: m.rows.map((r) => [
                  r.invoice.number,
                  r.invoice.issue_date,
                  r.invoice.due_date ?? "",
                  formatMoney(Number(r.invoice.amount), r.invoice.currency),
                  formatMoney(r.paid, r.invoice.currency),
                  stateOf(r).label,
                ]),
                fileName: `${snap.client.name} invoices`,
              })
            }
            onXlsx={() => downloadXlsx(`${snap.client.name} billing`, sheets())}
            onCsv={() => downloadCsv(`${snap.client.name} invoices`, sheets()[0]!.rows)}
          />
        }
      />

      <BlurFade>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Summary label="Paid in total" value={formatMoney(m.received, cur)} />
          <Summary label="Paid this year" value={formatMoney(m.thisYear, cur)} />
          <Summary label="Outstanding" value={formatMoney(m.outstanding, cur)} />
          <Summary label="Overdue" value={formatMoney(m.overdue, cur)} tone={m.overdue > 0 ? "warning" : "success"} />
        </div>
      </BlurFade>

      <BlurFade
        delay={0.06}
        className={`grid items-start gap-5 ${hasPaymentDetails(snap.business) ? "lg:grid-cols-[minmax(0,1fr)_21rem]" : ""}`}
      >
        <DataTable
          data={m.rows}
          columns={columns}
          searchPlaceholder="Search invoices"
          initialSorting={[{ id: "issued", desc: true }]}
          onRowClick={(r) => setOpen(r)}
          empty="No invoices yet."
        />
        <PayCard reference={m.rows.find((r) => r.balance > 0)?.invoice.number} />
      </BlurFade>
      <InvoiceDialog row={open} onClose={() => setOpen(null)} />
    </div>
  );
}
