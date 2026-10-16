import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { addDays, format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  FileUp,
  Paperclip,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { downloadCsv, toCsv } from "../../lib/csv";
import { deleteWhereIn, insertMany, tableKey, uploadDocumentFile, useRows } from "../../lib/data";
import { nextInvoiceNumber } from "../../lib/finance";
import { formatDate, formatKES, toNumberOrNull } from "../../lib/format";
import { TEMPLATE_EXAMPLE, TEMPLATE_HEADERS, parseCsv, readRows, type ImportRow } from "../../lib/invoiceImport";
import { hubKeys, useClients } from "../../lib/queries";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  type ClientStatus,
  type Invoice,
  type PaymentMethod,
} from "../../lib/types";
import { Field, MoneyInput, inputClass } from "../form";
import { ClientPicker, DatePicker } from "../pickers";
import { Pill } from "../ui";
import { PdfImport } from "./PdfImport";

const IMPORT_NOTE = "Imported past invoice";
const chunk = <T,>(list: T[], size: number) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

// ---------------------------------------------------------------- spreadsheet

function SpreadsheetImport({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const clients = useClients();
  const invoices = useRows("invoices", "issue_date");
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [createMissing, setCreateMissing] = useState(true);
  const [newStatus, setNewStatus] = useState<ClientStatus>("ended");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(
    () => (text === null ? null : readRows(parseCsv(text), clients.data ?? [], invoices.data ?? [])),
    [text, clients.data, invoices.data],
  );
  const rows = parsed?.rows ?? [];
  const problems = rows.filter((r) => r.errors.length);
  const duplicates = rows.filter((r) => !r.errors.length && r.duplicate);
  const candidates = rows.filter((r) => !r.errors.length && !r.duplicate);
  const unknownNames = [...new Set(candidates.filter((r) => !r.clientId).map((r) => r.clientName.trim()))];
  const ready = candidates.filter((r) => r.clientId || createMissing);
  const total = ready.reduce((s, r) => s + (r.amount ?? 0), 0);
  const paidTotal = ready.reduce((s, r) => s + r.paid, 0);

  const read = (file: File | undefined) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setError("Please choose a .csv file. In Excel or Google Sheets use File → Download / Save as → CSV.");
      return;
    }
    setError(null);
    setFileName(file.name);
    file.text().then(setText);
  };

  const downloadTemplate = () =>
    downloadCsv(
      "past-invoices-template.csv",
      toCsv(
        TEMPLATE_EXAMPLE,
        TEMPLATE_HEADERS.map((h, i) => ({ header: h, value: (row: string[]) => row[i] })),
      ),
    );

  const runImport = async () => {
    if (!ready.length) return;
    setRunning(true);
    setError(null);
    try {
      // 1. Clients that don't exist yet. Past clients don't need an onboarding
      //    checklist, so the one the database adds automatically is removed.
      const ids = new Map<string, string>();
      if (createMissing && unknownNames.length) {
        const made = await insertMany(
          "clients",
          unknownNames.map((name) => ({
            name,
            business_name: name,
            status: newStatus,
            notes: "Added by invoice import",
          })),
        );
        await deleteWhereIn(
          "onboarding_items",
          "client_id",
          made.map((c) => c.id),
        );
        made.forEach((c) => ids.set(c.name.trim().toLowerCase(), c.id));
      }
      const clientIdFor = (r: ImportRow) => r.clientId ?? ids.get(r.clientName.trim().toLowerCase())!;

      // 2. Invoices. Rows without a number get the next one for their year.
      let known: Pick<Invoice, "number">[] = [...(invoices.data ?? [])];
      const invoiceRows = ready.map((r) => {
        const number = r.number || nextInvoiceNumber(known as Invoice[], new Date(r.issueDate!));
        known = [...known, { number }];
        return {
          client_id: clientIdFor(r),
          number,
          title: r.description || null,
          issue_date: r.issueDate!,
          due_date: r.dueDate,
          line_items: [{ description: r.description || "Services", quantity: 1, unit_price: r.amount! }],
          amount: r.amount!,
          status: "sent" as const,
          notes: IMPORT_NOTE,
        };
      });
      const created: Invoice[] = [];
      for (const part of chunk(invoiceRows, 200)) created.push(...(await insertMany("invoices", part)));

      // 3. What was already paid, so balances and charts are right.
      const byNumber = new Map(created.map((inv) => [inv.number, inv]));
      const paymentRows = ready
        .map((r, i) => ({ r, inv: byNumber.get(invoiceRows[i].number)! }))
        .filter(({ r, inv }) => r.paid > 0 && inv)
        .map(({ r, inv }) => ({
          client_id: inv.client_id,
          invoice_id: inv.id,
          amount: r.paid,
          paid_on: r.paidDate ?? r.dueDate ?? r.issueDate!,
          method: r.method,
          reference: r.reference,
          notes: IMPORT_NOTE,
        }));
      for (const part of chunk(paymentRows, 200)) await insertMany("payments", part);

      [tableKey("invoices"), tableKey("payments"), hubKeys.clients, hubKeys.onboarding].forEach((key) =>
        qc.invalidateQueries({ queryKey: key }),
      );
      toast.success(
        `Imported ${created.length} ${created.length === 1 ? "invoice" : "invoices"}` +
          (paymentRows.length
            ? ` and ${paymentRows.length} ${paymentRows.length === 1 ? "payment" : "payments"}`
            : "") +
          (ids.size ? `, added ${ids.size} ${ids.size === 1 ? "client" : "clients"}` : ""),
      );
      onDone();
    } catch (e) {
      setError(
        `Import stopped: ${(e as Error).message}. Nothing after this point was saved; fix the file and try again.`,
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <ol className="space-y-2 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">1.</span> Put your past invoices in a spreadsheet, one per row.{" "}
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> Download the template
          </button>
        </li>
        <li>
          <span className="font-medium text-foreground">2.</span> Save it as CSV (Excel or Google Sheets: File →
          Download → CSV).
        </li>
        <li>
          <span className="font-medium text-foreground">3.</span> Drop it below, check the preview, then import.
        </li>
      </ol>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setDragging(false);
          read(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-5 text-left transition-colors duration-150",
          dragging ? "border-primary bg-tint" : "border-border hover:border-primary/50 hover:bg-secondary/50",
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-on-tint">
          <FileSpreadsheet className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {fileName ?? "Drop your CSV here or click to choose"}
          </span>
          <span className="block text-xs text-muted-foreground">
            Needs columns for client, date and amount. Paid amount, paid date, method and M-Pesa code are optional.
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => read(e.target.files?.[0])}
      />

      {parsed && parsed.missingHeaders.length > 0 && (
        <p className="rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">
          Couldn't find these columns: {parsed.missingHeaders.join(", ")}. Check the first row has headings like the
          template.
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 text-xs">
            <Pill tone="accent">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> {ready.length} ready
            </Pill>
            {unknownNames.length > 0 && (
              <Pill tone="neutral">
                <UserPlus className="mr-1 h-3.5 w-3.5" /> {unknownNames.length} new{" "}
                {unknownNames.length === 1 ? "client" : "clients"}
              </Pill>
            )}
            {duplicates.length > 0 && <Pill tone="muted">{duplicates.length} already in the hub (skipped)</Pill>}
            {problems.length > 0 && (
              <Pill tone="warning">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" /> {problems.length} with problems (skipped)
              </Pill>
            )}
          </div>

          <div className="max-h-64 overflow-auto rounded-2xl border border-border/70">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="sticky top-0 bg-secondary text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Invoice</th>
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 text-right font-medium">Paid</th>
                  <th className="px-3 py-2 font-medium">Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((r) => {
                  const skipped = r.errors.length > 0 || r.duplicate || (!r.clientId && !createMissing);
                  return (
                    <tr key={r.line} className={cn(skipped && "text-muted-foreground")}>
                      <td className="hub-tabular px-3 py-2">{r.line}</td>
                      <td className="hub-tabular whitespace-nowrap px-3 py-2">
                        {r.number || <span className="text-muted-foreground">auto</span>}
                      </td>
                      <td className="px-3 py-2">
                        {r.clientName || "—"}
                        {!r.clientId && r.clientName && <Pill className="ml-1.5 px-1.5 py-0 text-[0.625rem]">new</Pill>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">{formatDate(r.issueDate, "d MMM yyyy")}</td>
                      <td className="hub-tabular whitespace-nowrap px-3 py-2 text-right">{formatKES(r.amount)}</td>
                      <td className="hub-tabular whitespace-nowrap px-3 py-2 text-right">
                        {r.paid ? formatKES(r.paid) : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {r.errors.length ? (
                          <span className="text-warning">{r.errors.join("; ")}</span>
                        ) : r.duplicate ? (
                          "Already in the hub"
                        ) : !r.clientId && !createMissing ? (
                          "Unknown client"
                        ) : (
                          <span className="text-on-tint">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {unknownNames.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-4 py-3">
              <label className="flex items-center gap-3 text-sm">
                <Switch checked={createMissing} onCheckedChange={setCreateMissing} />
                Add the {unknownNames.length} {unknownNames.length === 1 ? "client" : "clients"} I don't have yet
              </label>
              {createMissing && (
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ClientStatus)}>
                  <SelectTrigger className="h-9 w-40 rounded-lg bg-card" aria-label="Status for new clients">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ended">As past clients</SelectItem>
                    <SelectItem value="active">As active clients</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </>
      )}

      {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <span className="hub-tabular text-sm text-muted-foreground">
          {ready.length ? (
            <>
              <span className="font-semibold text-foreground">{formatKES(total)}</span> invoiced ·{" "}
              <span className="font-semibold text-foreground">{formatKES(paidTotal)}</span> paid
            </>
          ) : (
            " "
          )}
        </span>
        <Button className="rounded-full px-5" disabled={!ready.length || running} onClick={runImport}>
          <FileUp className="mr-1.5 h-4 w-4" />
          {running ? "Importing…" : `Import ${ready.length || ""} ${ready.length === 1 ? "invoice" : "invoices"}`}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- one at a time

function SingleImport({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const invoices = useRows("invoices", "issue_date");
  const fileRef = useRef<HTMLInputElement>(null);
  const [client, setClient] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [issueDate, setIssueDate] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [paidAmount, setPaidAmount] = useState("");
  const [paidDate, setPaidDate] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  // Paid in full by default; keep the paid amount in step with the total until edited.
  const [paidTouched, setPaidTouched] = useState(false);
  useEffect(() => {
    if (!paidTouched) setPaidAmount(amount);
  }, [amount, paidTouched]);

  const reset = (keepClient: boolean) => {
    if (!keepClient) setClient(null);
    setNumber("");
    setIssueDate(null);
    setDueDate(null);
    setDescription("");
    setAmount("");
    setIsPaid(true);
    setPaidAmount("");
    setPaidTouched(false);
    setPaidDate(null);
    setReference("");
    setFile(null);
    setError(null);
  };

  const save = async (another: boolean) => {
    const total = toNumberOrNull(amount);
    const paid = isPaid ? toNumberOrNull(paidAmount) : 0;
    if (!client) return setError("Choose the client.");
    if (!issueDate) return setError("Set the invoice date.");
    if (!total || total <= 0) return setError("Enter the invoice amount.");
    if (isPaid && (!paid || paid <= 0)) return setError("Enter how much was paid.");
    if (paid && paid > total) return setError("Paid can't be more than the invoice amount.");
    const num = number.trim() || nextInvoiceNumber(invoices.data ?? [], new Date(issueDate));
    if ((invoices.data ?? []).some((i) => i.number.toLowerCase() === num.toLowerCase()))
      return setError(`${num} is already in the hub.`);

    setSaving(true);
    setError(null);
    try {
      const doc = file
        ? await uploadDocumentFile({
            file,
            clientId: client,
            kind: "invoice",
            status: "final",
            title: `Invoice ${num}`,
            isTemplate: false,
            notes: IMPORT_NOTE,
          })
        : null;
      const [inv] = await insertMany("invoices", [
        {
          client_id: client,
          number: num,
          title: description.trim() || null,
          issue_date: issueDate,
          due_date: dueDate ?? format(addDays(new Date(issueDate), 14), "yyyy-MM-dd"),
          line_items: [{ description: description.trim() || "Services", quantity: 1, unit_price: total }],
          amount: total,
          status: "sent",
          notes: IMPORT_NOTE,
          document_id: doc?.id ?? null,
        },
      ]);
      if (paid && paid > 0) {
        await insertMany("payments", [
          {
            client_id: client,
            invoice_id: inv.id,
            amount: paid,
            paid_on: paidDate ?? dueDate ?? issueDate,
            method,
            reference: reference.trim() || null,
            notes: IMPORT_NOTE,
          },
        ]);
      }
      [tableKey("invoices"), tableKey("payments"), tableKey("documents")].forEach((key) =>
        qc.invalidateQueries({ queryKey: key }),
      );
      toast.success(`Added ${num}${paid ? ` (${formatKES(paid)} paid)` : ""}`);
      setCount((c) => c + 1);
      if (another) reset(true);
      else onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void save(true);
      }}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client">
          <ClientPicker value={client} onChange={setClient} />
        </Field>
        <Field label="Invoice number" htmlFor="past-number" hint="Leave empty to number it automatically.">
          <Input
            id="past-number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={cn(inputClass, "hub-tabular")}
          />
        </Field>
        <Field label="Invoice date">
          <DatePicker value={issueDate} onChange={setIssueDate} clearable={false} />
        </Field>
        <Field label="Due date">
          <DatePicker value={dueDate} onChange={setDueDate} placeholder="14 days after" />
        </Field>
        <Field label="What it was for" htmlFor="past-desc" className="sm:col-span-2">
          <Input
            id="past-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Meta Ads management – March"
            className={inputClass}
          />
        </Field>
        <Field label="Amount" htmlFor="past-amount">
          <MoneyInput id="past-amount" value={amount} onChange={setAmount} />
        </Field>
        <Field label="Original invoice (optional)">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl border border-input px-3.5 text-left text-sm hover:bg-secondary/60",
              inputClass,
              !file && "text-muted-foreground",
            )}
          >
            <Paperclip className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{file ? file.name : "Attach the PDF"}</span>
            {file && (
              <X
                className="h-4 w-4 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*,.doc,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
      </div>

      <div className="rounded-2xl bg-secondary/60 p-4">
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">This invoice was paid</span>
          <Switch checked={isPaid} onCheckedChange={setIsPaid} />
        </label>
        {isPaid && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Amount paid" htmlFor="past-paid">
              <MoneyInput
                id="past-paid"
                value={paidAmount}
                onChange={(v) => {
                  setPaidTouched(true);
                  setPaidAmount(v);
                }}
              />
            </Field>
            <Field label="Date paid">
              <DatePicker value={paidDate} onChange={setPaidDate} placeholder="Same as due date" />
            </Field>
            <Field label="Method">
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger className={cn(inputClass, "bg-card")}>
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
            <Field label={method === "mpesa" ? "M-Pesa code" : "Reference"} htmlFor="past-ref">
              <Input
                id="past-ref"
                value={reference}
                onChange={(e) => setReference(method === "mpesa" ? e.target.value.toUpperCase() : e.target.value)}
                className={cn(inputClass, "hub-tabular bg-card")}
              />
            </Field>
          </div>
        )}
      </div>

      {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <span className="text-sm text-muted-foreground">{count > 0 && `${count} added so far`}</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            disabled={saving}
            onClick={() => void save(false)}
          >
            Save & close
          </Button>
          <Button type="submit" className="rounded-full px-5" disabled={saving}>
            {saving ? "Saving…" : "Save & add another"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- dialog

/** Bring past invoices (and what was paid on them) into the hub so the numbers catch up. */
export function ImportInvoicesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = useState("pdf");
  const [pendingPdfs, setPendingPdfs] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);

  // Closing with PDFs read but not imported would throw that work away, so ask first.
  const requestOpenChange = (next: boolean) => {
    if (!next && pendingPdfs > 0) setConfirmClose(true);
    else onOpenChange(next);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestOpenChange}>
        <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl border-border/70 bg-card p-0 sm:max-w-4xl sm:rounded-3xl">
          <DialogHeader className="px-6 pb-2 pt-6 text-left">
            <DialogTitle className="text-xl">Import past invoices</DialogTitle>
            <DialogDescription>
              Bring in invoices from before the hub, with what was paid on them, so your totals, charts and balances
              catch up.
            </DialogDescription>
          </DialogHeader>
          <Tabs value={tab} onValueChange={setTab} className="px-6 pb-6 pt-2">
            <TabsList className="mb-5 h-auto rounded-xl bg-secondary p-1">
              <TabsTrigger
                value="pdf"
                className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub"
              >
                <FileText className="mr-1.5 h-4 w-4" /> From PDFs
              </TabsTrigger>
              <TabsTrigger
                value="sheet"
                className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub"
              >
                <FileSpreadsheet className="mr-1.5 h-4 w-4" /> From a spreadsheet
              </TabsTrigger>
              <TabsTrigger
                value="single"
                className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub"
              >
                <FileUp className="mr-1.5 h-4 w-4" /> One at a time
              </TabsTrigger>
            </TabsList>
            <TabsContent
              forceMount
              value="pdf"
              className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden"
            >
              {open && <PdfImport onDone={() => onOpenChange(false)} onPendingChange={setPendingPdfs} />}
            </TabsContent>
            <TabsContent
              forceMount
              value="sheet"
              className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden"
            >
              {open && <SpreadsheetImport onDone={() => onOpenChange(false)} />}
            </TabsContent>
            <TabsContent
              forceMount
              value="single"
              className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden"
            >
              {open && <SingleImport onDone={() => onOpenChange(false)} />}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingPdfs} {pendingPdfs === 1 ? "invoice isn't" : "invoices aren't"} imported yet
            </AlertDialogTitle>
            <AlertDialogDescription>
              Nothing is saved until you click Import. If you close now, the details read from your PDFs and any edits
              you made will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep reviewing</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive bg-none text-destructive-foreground shadow-none hover:bg-destructive/90"
              onClick={() => {
                setPendingPdfs(0);
                onOpenChange(false);
              }}
            >
              Close without importing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
