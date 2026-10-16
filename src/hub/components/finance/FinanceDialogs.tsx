import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRows, useSaveRow } from "../../lib/data";
import { invoiceState, nextInvoiceNumber, paidByInvoice } from "../../lib/finance";
import { formatKES, toNumberOrNull } from "../../lib/format";
import { useClients } from "../../lib/queries";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABEL,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  type Expense,
  type ExpenseCategory,
  type Invoice,
  type InvoiceStatus,
  type Payment,
  type PaymentMethod,
} from "../../lib/types";
import { Field, FormDialog, MoneyInput, inputClass } from "../form";
import { ClientPicker, DatePicker } from "../pickers";

const today = () => format(new Date(), "yyyy-MM-dd");

// ---------------------------------------------------------------- invoice

type LineDraft = { description: string; quantity: string; unit_price: string };
const emptyLine = (): LineDraft => ({ description: "", quantity: "1", unit_price: "" });

export function InvoiceDialog({
  open,
  onOpenChange,
  invoice,
  clientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  clientId?: string;
}) {
  const save = useSaveRow("invoices");
  const invoices = useRows("invoices", "issue_date");
  const clients = useClients();
  const [client, setClient] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState<string | null>(today());
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setClient(invoice?.client_id ?? clientId ?? null);
    setNumber(invoice?.number ?? nextInvoiceNumber(invoices.data ?? []));
    setTitle(invoice?.title ?? "");
    setIssueDate(invoice?.issue_date ?? today());
    setDueDate(invoice?.due_date ?? format(addDays(new Date(), 14), "yyyy-MM-dd"));
    setLines(
      invoice?.line_items.length
        ? invoice.line_items.map((l) => ({
            description: l.description,
            quantity: String(l.quantity),
            unit_price: String(l.unit_price),
          }))
        : [emptyLine()],
    );
    setStatus(invoice?.status ?? "draft");
    setNotes(invoice?.notes ?? "");
    setError(null);
    // invoices.data omitted: the number is only suggested when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice, clientId]);

  // New invoice for a client on a retainer: start with their monthly fee as the first line.
  const selectedClient = clients.data?.find((c) => c.id === client);
  useEffect(() => {
    if (!open || invoice || !selectedClient?.monthly_fee) return;
    setLines((current) =>
      current.length === 1 && !current[0].description && !current[0].unit_price
        ? [
            {
              description: `Monthly retainer – ${format(new Date(), "MMMM yyyy")}`,
              quantity: "1",
              unit_price: String(selectedClient.monthly_fee),
            },
          ]
        : current,
    );
  }, [open, invoice, selectedClient]);

  const parsed = lines.map((l) => ({
    description: l.description.trim(),
    quantity: toNumberOrNull(l.quantity) ?? 0,
    unit_price: toNumberOrNull(l.unit_price) ?? 0,
  }));
  const total = parsed.reduce((s, l) => s + l.quantity * l.unit_price, 0);

  const setLine = (i: number, patch: Partial<LineDraft>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const submit = () => {
    if (!client) return setError("Choose a client.");
    if (!number.trim()) return setError("Give the invoice a number.");
    const items = parsed.filter((l) => l.description || l.unit_price);
    if (!items.length) return setError("Add at least one line.");
    if (items.some((l) => !l.description)) return setError("Every line needs a description.");
    save.mutate(
      {
        id: invoice?.id,
        values: {
          client_id: client,
          number: number.trim(),
          title: title.trim() || null,
          issue_date: issueDate ?? today(),
          due_date: dueDate,
          line_items: items,
          amount: Math.round(total * 100) / 100,
          status,
          notes: notes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(invoice ? "Invoice updated" : `Invoice ${number} created`);
          onOpenChange(false);
        },
        onError: (e) =>
          setError(e.message.includes("invoices_number_key") ? "That invoice number is already used." : e.message),
      },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={invoice ? `Edit ${invoice.number}` : "New invoice"}
      onSubmit={submit}
      submitLabel={invoice ? "Save" : "Create invoice"}
      pending={save.isPending}
      error={error}
      wide
      footerExtra={<span className="hub-tabular text-sm font-semibold">Total {formatKES(total)}</span>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client">
          <ClientPicker value={client} onChange={setClient} />
        </Field>
        <Field label="Invoice number" htmlFor="inv-number">
          <Input
            id="inv-number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={cn(inputClass, "hub-tabular")}
          />
        </Field>
        <Field label="Issue date">
          <DatePicker value={issueDate} onChange={setIssueDate} clearable={false} />
        </Field>
        <Field label="Due date">
          <DatePicker value={dueDate} onChange={setDueDate} placeholder="No due date" />
        </Field>
      </div>
      <Field label="Title (optional)" htmlFor="inv-title">
        <Input
          id="inv-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. October Meta Ads management"
          className={inputClass}
        />
      </Field>

      <div>
        <p className="hub-label mb-1.5">Line items</p>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] gap-2 rounded-xl bg-secondary/50 p-2 sm:grid-cols-[1fr_5rem_9rem_auto] sm:items-center"
            >
              <Input
                value={line.description}
                onChange={(e) => setLine(i, { description: e.target.value })}
                placeholder="Description"
                aria-label="Description"
                className="h-10 rounded-lg bg-card sm:col-span-1"
              />
              <button
                type="button"
                onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : [emptyLine()]))}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground sm:order-last"
                aria-label="Remove line"
              >
                <X className="h-4 w-4" />
              </button>
              <Input
                value={line.quantity}
                onChange={(e) => setLine(i, { quantity: e.target.value })}
                inputMode="decimal"
                aria-label="Quantity"
                className="hub-tabular h-10 rounded-lg bg-card"
              />
              <Input
                value={line.unit_price}
                onChange={(e) => setLine(i, { unit_price: e.target.value })}
                inputMode="decimal"
                placeholder="Price (KES)"
                aria-label="Unit price in KES"
                className="hub-tabular h-10 rounded-lg bg-card"
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 rounded-full text-primary"
          onClick={() => setLines((ls) => [...ls, emptyLine()])}
        >
          <Plus className="mr-1 h-4 w-4" /> Add line
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" hint="Paid and overdue are worked out from payments and the due date.">
          <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Notes / payment details" htmlFor="inv-notes">
          <Textarea
            id="inv-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Pay via M-Pesa Till 123456"
            className="rounded-xl bg-background"
          />
        </Field>
      </div>
    </FormDialog>
  );
}

// ---------------------------------------------------------------- payment

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  clientId,
  invoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
  clientId?: string;
  /** Pre-select an invoice (the "Record payment" action on an invoice). */
  invoice?: Invoice | null;
}) {
  const save = useSaveRow("payments", ["invoices"]);
  const invoices = useRows("invoices", "issue_date");
  const payments = useRows("payments", "paid_on");
  const [client, setClient] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState<string | null>(today());
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const paid = useMemo(() => paidByInvoice(payments.data ?? []), [payments.data]);

  useEffect(() => {
    if (!open) return;
    const inv = invoice ?? null;
    setClient(payment?.client_id ?? inv?.client_id ?? clientId ?? null);
    setInvoiceId(payment?.invoice_id ?? inv?.id ?? null);
    setAmount(
      payment ? String(payment.amount) : inv ? String(Math.max(0, Number(inv.amount) - (paid.get(inv.id) ?? 0))) : "",
    );
    setPaidOn(payment?.paid_on ?? today());
    setMethod(payment?.method ?? "mpesa");
    setReference(payment?.reference ?? "");
    setNotes(payment?.notes ?? "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payment, invoice, clientId]);

  const openInvoices = (invoices.data ?? []).filter(
    (i) =>
      i.client_id === client &&
      (i.id === invoiceId || !["paid", "void"].includes(invoiceState(i, paid.get(i.id) ?? 0))),
  );

  const chooseInvoice = (id: string | null) => {
    setInvoiceId(id);
    const inv = invoices.data?.find((i) => i.id === id);
    if (inv && !payment) setAmount(String(Math.max(0, Number(inv.amount) - (paid.get(inv.id) ?? 0))));
  };

  const submit = () => {
    if (!client) return setError("Choose the client who paid.");
    const value = toNumberOrNull(amount);
    if (!value || value <= 0) return setError("Enter the amount received.");
    save.mutate(
      {
        id: payment?.id,
        values: {
          client_id: client,
          invoice_id: invoiceId,
          amount: value,
          paid_on: paidOn ?? today(),
          method,
          reference: reference.trim() || null,
          notes: notes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(payment ? "Payment updated" : `Recorded ${formatKES(value)}`);
          onOpenChange(false);
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={payment ? "Edit payment" : "Record payment"}
      onSubmit={submit}
      submitLabel={payment ? "Save" : "Record"}
      pending={save.isPending}
      error={error}
    >
      <Field label="Client">
        <ClientPicker
          value={client}
          onChange={(v) => {
            setClient(v);
            setInvoiceId(null);
          }}
        />
      </Field>
      {client && (
        <Field label="For invoice">
          <Select value={invoiceId ?? "__none"} onValueChange={(v) => chooseInvoice(v === "__none" ? null : v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Not linked to an invoice</SelectItem>
              {openInvoices.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.number} · {formatKES(Number(i.amount) - (paid.get(i.id) ?? 0))} due
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" htmlFor="pay-amount">
          <MoneyInput id="pay-amount" value={amount} onChange={setAmount} />
        </Field>
        <Field label="Date received">
          <DatePicker value={paidOn} onChange={setPaidOn} clearable={false} />
        </Field>
        <Field label="Method">
          <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {PAYMENT_METHOD_LABEL[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={method === "mpesa" ? "M-Pesa code" : "Reference"} htmlFor="pay-ref">
          <Input
            id="pay-ref"
            value={reference}
            onChange={(e) => setReference(method === "mpesa" ? e.target.value.toUpperCase() : e.target.value)}
            placeholder={method === "mpesa" ? "e.g. SJK4XY12AB" : ""}
            className={cn(inputClass, "hub-tabular")}
          />
        </Field>
      </div>
      <Field label="Notes" htmlFor="pay-notes">
        <Textarea
          id="pay-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl bg-background"
        />
      </Field>
    </FormDialog>
  );
}

// ---------------------------------------------------------------- expense

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  clientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  clientId?: string;
}) {
  const save = useSaveRow("expenses");
  const [client, setClient] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("software");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState<string | null>(today());
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setClient(expense?.client_id ?? clientId ?? null);
    setDescription(expense?.description ?? "");
    setCategory(expense?.category ?? (clientId ? "ad_spend" : "software"));
    setAmount(expense ? String(expense.amount) : "");
    setSpentOn(expense?.spent_on ?? today());
    setVendor(expense?.vendor ?? "");
    setNotes(expense?.notes ?? "");
    setError(null);
  }, [open, expense, clientId]);

  const submit = () => {
    if (!description.trim()) return setError("What was it for?");
    const value = toNumberOrNull(amount);
    if (!value || value <= 0) return setError("Enter the amount spent.");
    save.mutate(
      {
        id: expense?.id,
        values: {
          client_id: client,
          description: description.trim(),
          category,
          amount: value,
          spent_on: spentOn ?? today(),
          vendor: vendor.trim() || null,
          notes: notes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(expense ? "Expense updated" : "Expense added");
          onOpenChange(false);
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={expense ? "Edit expense" : "Add expense"}
      onSubmit={submit}
      submitLabel={expense ? "Save" : "Add"}
      pending={save.isPending}
      error={error}
    >
      <Field label="Description" htmlFor="exp-desc">
        <Input
          id="exp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Canva Pro"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" htmlFor="exp-amount">
          <MoneyInput id="exp-amount" value={amount} onChange={setAmount} />
        </Field>
        <Field label="Date">
          <DatePicker value={spentOn} onChange={setSpentOn} clearable={false} />
        </Field>
        <Field label="Category">
          <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {EXPENSE_CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Vendor" htmlFor="exp-vendor">
          <Input
            id="exp-vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. Safaricom"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Client" hint="Link costs like ad spend or a freelancer to the client they were for.">
        <ClientPicker value={client} onChange={setClient} allowNone noneLabel="General business cost" />
      </Field>
      <Field label="Notes" htmlFor="exp-notes">
        <Textarea
          id="exp-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl bg-background"
        />
      </Field>
    </FormDialog>
  );
}
