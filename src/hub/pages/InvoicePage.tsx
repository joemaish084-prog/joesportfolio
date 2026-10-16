import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Banknote, BellRing, ChevronLeft, Copy, FileX, Mail, MessageCircle, Pencil, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceDialog, PaymentDialog } from "../components/finance/FinanceDialogs";
import { EmptyState, Pill, SkeletonBlock } from "../components/ui";
import { useRows } from "../lib/data";
import { INVOICE_STATE, invoiceState, paidByInvoice } from "../lib/finance";
import { invoiceReminder } from "../lib/reminders";
import { paymentLines, useSettings } from "../lib/settings";
import { formatDate } from "../lib/format";
import { useKes } from "../lib/privacy";
import { RevealWhilePrinting } from "../components/privacy";
import { useClients } from "../lib/queries";
import { PAYMENT_METHOD_LABEL } from "../lib/types";

/** One invoice laid out as a document. "Print / Save PDF" uses the browser's print dialog. */
export default function InvoicePageWithPrintReveal() {
  return (
    <RevealWhilePrinting>
      <InvoicePage />
    </RevealWhilePrinting>
  );
}

function InvoicePage() {
  const kes = useKes();
  const { id } = useParams();
  const navigate = useNavigate();
  const invoices = useRows("invoices", "issue_date");
  const payments = useRows("payments", "paid_on");
  const clients = useClients();
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);

  const invoice = invoices.data?.find((i) => i.id === id);
  const client = clients.data?.find((c) => c.id === invoice?.client_id);
  const { settings } = useSettings();
  const business = settings.business;
  const invoicePayments = useMemo(() => (payments.data ?? []).filter((p) => p.invoice_id === id), [payments.data, id]);
  const paid = invoice ? (paidByInvoice(payments.data ?? []).get(invoice.id) ?? 0) : 0;

  if (invoices.isLoading || payments.isLoading)
    return <SkeletonBlock className="mx-auto h-[36rem] max-w-3xl rounded-[20px]" />;

  if (!invoice) {
    return (
      <div className="hub-card mx-auto max-w-3xl">
        <EmptyState
          icon={FileX}
          title="Invoice not found"
          action={
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link to="/hub/finance">Back to finance</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const state = INVOICE_STATE[invoiceState(invoice, paid)];
  const balance = Math.max(0, Number(invoice.amount) - paid);
  const payLines = paymentLines(business);
  // Import markers are for you, not the client: keep them off the printed invoice.
  const notes = (invoice.notes ?? "")
    .split(" · ")
    .filter((part) => part.trim() && !/^Imported past invoice/i.test(part.trim()))
    .join(" · ");
  const reminder =
    invoice.status === "sent" && balance > 0 ? invoiceReminder({ invoice, client, balance, business }) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/hub/finance"))}
          className="-ml-1 flex items-center gap-0.5 text-sm text-primary hover:opacity-80"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="rounded-full" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit
          </Button>
          {reminder && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="rounded-full">
                  <BellRing className="mr-1.5 h-4 w-4" /> Remind
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-xl">
                <DropdownMenuItem disabled={!reminder.whatsapp} asChild={!!reminder.whatsapp}>
                  {reminder.whatsapp ? (
                    <a href={reminder.whatsapp} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> Send on WhatsApp
                    </a>
                  ) : (
                    <span>
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp (no phone on client)
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!reminder.email} asChild={!!reminder.email}>
                  {reminder.email ? (
                    <a href={reminder.email}>
                      <Mail className="mr-2 h-4 w-4" /> Send by email
                    </a>
                  ) : (
                    <span>
                      <Mail className="mr-2 h-4 w-4" /> Email (no email on client)
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    navigator.clipboard
                      .writeText(reminder.text)
                      .then(() => toast.success("Reminder copied"))
                      .catch(() => toast.error("Couldn't copy"))
                  }
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {invoice.status !== "void" && balance > 0 && (
            <Button variant="secondary" className="rounded-full" onClick={() => setPaying(true)}>
              <Banknote className="mr-1.5 h-4 w-4" /> Record payment
            </Button>
          )}
          <Button className="rounded-full px-4" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <article className="hub-card p-6 sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
              JM
            </div>
            <p className="text-lg font-bold">{business.name}</p>
            {[business.tagline, business.address, business.location, business.phone, business.email, business.website]
              .filter(Boolean)
              .map((line) => (
                <p key={line} className="text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
            {business.kra_pin && <p className="text-sm text-muted-foreground">KRA PIN: {business.kra_pin}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-3xl font-bold tracking-tight">Invoice</p>
            <p className="hub-tabular mt-1 font-medium">{invoice.number}</p>
            <div className="mt-2 print:hidden">
              <Pill tone={state.tone}>{state.label}</Pill>
            </div>
            <dl className="mt-3 space-y-0.5 text-sm">
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-muted-foreground">Issued</dt>
                <dd>{formatDate(invoice.issue_date)}</dd>
              </div>
              {invoice.due_date && (
                <div className="flex gap-2 sm:justify-end">
                  <dt className="text-muted-foreground">Due</dt>
                  <dd>{formatDate(invoice.due_date)}</dd>
                </div>
              )}
            </dl>
          </div>
        </header>

        <section className="mt-8">
          <p className="hub-label mb-1">Bill to</p>
          <p className="font-semibold">{client?.business_name || client?.name || "Client"}</p>
          {client?.contact_person && <p className="text-sm">{client.contact_person}</p>}
          {client?.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
          {client?.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
        </section>

        {invoice.title && <p className="mt-6 font-medium">{invoice.title}</p>}

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Description</th>
              <th className="w-16 py-2 text-right font-medium">Qty</th>
              <th className="w-32 py-2 text-right font-medium">Price</th>
              <th className="w-32 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.line_items.map((l, i) => (
              <tr key={i} className="border-b border-border/60">
                <td className="py-3 pr-4">{l.description}</td>
                <td className="hub-tabular py-3 text-right">{l.quantity}</td>
                <td className="hub-tabular py-3 text-right">{kes(Number(l.unit_price))}</td>
                <td className="hub-tabular py-3 text-right">{kes(Number(l.quantity) * Number(l.unit_price))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="hub-tabular font-semibold">{kes(Number(invoice.amount))}</dd>
            </div>
            {paid > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Paid</dt>
                <dd className="hub-tabular">−{kes(paid)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-semibold">Balance due</dt>
              <dd className="hub-tabular font-bold">{kes(invoice.status === "void" ? 0 : balance)}</dd>
            </div>
          </dl>
        </div>

        {(payLines.length > 0 || notes) && (
          <section className="mt-8 grid gap-4 rounded-2xl bg-secondary/60 p-4 sm:grid-cols-2 print:bg-transparent print:p-0">
            {payLines.length > 0 && (
              <div>
                <p className="hub-label mb-1">How to pay</p>
                {payLines.map((l) => (
                  <p key={l} className="hub-tabular text-sm">
                    {l}
                  </p>
                ))}
                <p className="mt-1 text-xs text-muted-foreground">Please use {invoice.number} as the reference.</p>
              </div>
            )}
            {notes && (
              <div>
                <p className="hub-label mb-1">Notes</p>
                <p className="whitespace-pre-wrap text-sm">{notes}</p>
              </div>
            )}
          </section>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          {settings.invoice.footer || "Thank you for your business."}
        </p>
      </article>

      {invoicePayments.length > 0 && (
        <section className="mt-6 print:hidden">
          <h2 className="hub-section-title">Payments on this invoice</h2>
          <ul className="hub-card divide-y divide-border/60">
            {invoicePayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>
                  {formatDate(p.paid_on)} · {PAYMENT_METHOD_LABEL[p.method]}
                  {p.reference && <span className="hub-tabular ml-1 text-muted-foreground">({p.reference})</span>}
                </span>
                <span className="hub-tabular font-medium text-on-tint">+{kes(Number(p.amount))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <InvoiceDialog open={editing} onOpenChange={setEditing} invoice={invoice} />
      <PaymentDialog open={paying} onOpenChange={setPaying} invoice={invoice} />
    </div>
  );
}
