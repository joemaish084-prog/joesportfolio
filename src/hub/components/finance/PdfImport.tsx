import { memo, useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { addDays, format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  FileUp,
  Loader2,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { deleteWhereIn, insertMany, tableKey, uploadDocumentFile, useRows } from "../../lib/data";
import { nextInvoiceNumber } from "../../lib/finance";
import { formatKES, toNumberOrNull } from "../../lib/format";
import { readInvoicePdf, type ReadInvoice } from "../../lib/pdfInvoice";
import { hubKeys, useClients } from "../../lib/queries";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  type ClientStatus,
  type Invoice,
  type PaymentMethod,
} from "../../lib/types";
import { MoneyInput } from "../form";
import { ClientPicker, DatePicker } from "../pickers";
import { Pill } from "../ui";

const IMPORT_NOTE = "Imported past invoice (PDF)";
const MAX_FILES = 50;
const MAX_BYTES = 25 * 1024 * 1024;
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

type Draft = {
  id: string;
  file: File;
  url: string;
  status: "waiting" | "reading" | "ready";
  read: ReadInvoice | null;
  aiError: string | null;
  include: boolean;
  clientId: string | null;
  newClientName: string;
  number: string;
  issueDate: string | null;
  dueDate: string | null;
  amount: string;
  paid: boolean;
  paidAmount: string;
  paidDate: string | null;
  method: PaymentMethod;
  reference: string;
};

function problemsOf(d: Draft, takenNumbers: Set<string>) {
  const out: string[] = [];
  if (!d.clientId && !d.newClientName.trim()) out.push("Choose the client");
  if (!d.issueDate) out.push("Add the invoice date");
  const amount = toNumberOrNull(d.amount);
  if (!amount || amount <= 0) out.push("Add the amount");
  if (d.paid) {
    const paid = toNumberOrNull(d.paidAmount);
    if (!paid || paid <= 0) out.push("Add the amount paid");
    else if (amount && paid > amount) out.push("Paid is more than the total");
  }
  if (d.number.trim() && takenNumbers.has(norm(d.number))) out.push("This invoice number is already in the hub");
  return out;
}

export function PdfImport({
  onDone,
  onPendingChange,
}: {
  onDone: () => void;
  /** How many PDFs are on screen but not imported yet (to warn before closing). */
  onPendingChange?: (count: number) => void;
}) {
  const qc = useQueryClient();
  const clients = useClients();
  const invoices = useRows("invoices", "issue_date");
  const inputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [dragging, setDragging] = useState(false);
  const [allPaid, setAllPaid] = useState(true);
  const [newStatus, setNewStatus] = useState<ClientStatus>("ended");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const liveClients = useMemo(() => (clients.data ?? []).filter((c) => !c.archived_at), [clients.data]);
  const clientNames = useMemo(() => liveClients.map((c) => c.name), [liveClients]);
  const takenNumbers = useMemo(() => new Set((invoices.data ?? []).map((i) => norm(i.number))), [invoices.data]);

  // Release the PDF preview links when the dialog closes.
  const urls = useRef<string[]>([]);

  // Nothing here is saved until Import: tell the dialog, and warn before the tab is closed or reloaded.
  useEffect(() => {
    onPendingChange?.(drafts.length);
    if (!drafts.length) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [drafts.length, onPendingChange]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  // Stable callbacks so each card only re-renders when its own draft changes.
  const update = useCallback(
    (id: string, patch: Partial<Draft>) => setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d))),
    [],
  );
  const remove = useCallback((id: string) => setDrafts((ds) => ds.filter((x) => x.id !== id)), []);

  const matchClient = (name: string | null) => {
    if (!name) return null;
    const n = norm(name);
    return (
      liveClients.find((c) => norm(c.name) === n || (c.business_name && norm(c.business_name) === n)) ??
      liveClients.find((c) => n.includes(norm(c.name)) || norm(c.name).includes(n))
    );
  };

  // Turns what was read into an editable draft.
  const fromRead = (d: Draft, read: ReadInvoice, aiError: string | null): Draft => {
    const match = matchClient(read.clientName);
    const amount =
      read.total ?? (read.lineItems.length ? read.lineItems.reduce((s, l) => s + l.quantity * l.unit_price, 0) : null);
    const paidKnown = read.amountPaid != null && read.amountPaid > 0;
    return {
      ...d,
      status: "ready",
      read,
      aiError,
      clientId: match?.id ?? null,
      newClientName: match ? "" : (read.clientName ?? ""),
      number: read.number ?? "",
      issueDate: read.issueDate,
      dueDate: read.dueDate,
      amount: amount != null ? String(amount) : "",
      paid: paidKnown || allPaid,
      paidAmount: String(paidKnown ? read.amountPaid : (amount ?? "")),
      paidDate: read.paidDate ?? read.dueDate ?? read.issueDate,
      method: read.method ?? "mpesa",
      reference: read.reference ?? "",
    };
  };

  // Read files two at a time, in the order they were added.
  const reading = useRef(false);
  useEffect(() => {
    if (reading.current) return;
    const next = drafts.filter((d) => d.status === "waiting").slice(0, 2);
    if (!next.length) return;
    reading.current = true;
    next.forEach((d) => update(d.id, { status: "reading" }));
    Promise.all(
      next.map(async (d) => {
        try {
          const { invoice, aiError } = await readInvoicePdf(d.file, clientNames);
          setDrafts((ds) => ds.map((x) => (x.id === d.id ? fromRead(x, invoice, aiError) : x)));
        } catch (e) {
          setDrafts((ds) =>
            ds.map((x) =>
              x.id === d.id
                ? {
                    ...x,
                    status: "ready",
                    aiError: `Couldn't open this PDF (${(e as Error).message}). Fill in the details by hand.`,
                  }
                : x,
            ),
          );
        }
      }),
    ).finally(() => {
      reading.current = false;
      // Trigger the next batch.
      setDrafts((ds) => [...ds]);
    });
    // fromRead/clientNames are read at call time on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const files = [...list].filter((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
    const tooBig = files.filter((f) => f.size > MAX_BYTES);
    const room = MAX_FILES - drafts.length;
    const accepted = files.filter((f) => f.size <= MAX_BYTES).slice(0, Math.max(0, room));
    if (files.length < list.length) toast.error("Only PDF files can be read here.");
    if (tooBig.length) toast.error(`${tooBig.length} file(s) over 25 MB skipped.`);
    if (accepted.length < files.length - tooBig.length) toast.error(`Up to ${MAX_FILES} PDFs at a time.`);
    const added: Draft[] = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      return {
        id: crypto.randomUUID(),
        file,
        url,
        status: "waiting",
        read: null,
        aiError: null,
        include: true,
        clientId: null,
        newClientName: "",
        number: "",
        issueDate: null,
        dueDate: null,
        amount: "",
        paid: allPaid,
        paidAmount: "",
        paidDate: null,
        method: "mpesa",
        reference: "",
      };
    });
    setDrafts((ds) => [...ds, ...added]);
  };

  // Numbers already taken by other drafts count as duplicates too.
  const draftProblems = useMemo(() => {
    const seen = new Set(takenNumbers);
    const map = new Map<string, string[]>();
    for (const d of drafts) {
      map.set(d.id, problemsOf(d, seen));
      if (d.number.trim()) seen.add(norm(d.number));
    }
    return map;
  }, [drafts, takenNumbers]);

  const readyDrafts = drafts.filter((d) => d.status === "ready" && d.include && !draftProblems.get(d.id)?.length);
  const pending = drafts.filter((d) => d.status !== "ready").length;
  const total = readyDrafts.reduce((s, d) => s + (toNumberOrNull(d.amount) ?? 0), 0);
  const newNames = [...new Set(readyDrafts.filter((d) => !d.clientId).map((d) => d.newClientName.trim()))];

  const setAllPaidFlag = (paid: boolean) => {
    setAllPaid(paid);
    setDrafts((ds) => ds.map((d) => (d.read?.amountPaid ? d : { ...d, paid, paidAmount: d.paidAmount || d.amount })));
  };

  const runImport = async () => {
    if (!readyDrafts.length) return;
    setError(null);
    let done = 0;
    try {
      // 1. New clients, without the automatic onboarding checklist.
      const ids = new Map<string, string>();
      if (newNames.length) {
        setSaving("Adding new clients…");
        const made = await insertMany(
          "clients",
          newNames.map((name) => ({ name, business_name: name, status: newStatus, notes: "Added by invoice import" })),
        );
        await deleteWhereIn(
          "onboarding_items",
          "client_id",
          made.map((c) => c.id),
        );
        made.forEach((c) => ids.set(norm(c.name), c.id));
      }

      // 2. One invoice at a time: file into Documents, then the invoice, then any payment.
      let known: Pick<Invoice, "number">[] = [...(invoices.data ?? [])];
      for (const d of readyDrafts) {
        setSaving(`Saving ${done + 1} of ${readyDrafts.length}…`);
        const clientId = d.clientId ?? ids.get(norm(d.newClientName))!;
        const amount = toNumberOrNull(d.amount)!;
        const number = d.number.trim() || nextInvoiceNumber(known as Invoice[], new Date(d.issueDate!));
        known = [...known, { number }];
        const doc = await uploadDocumentFile({
          file: d.file,
          clientId,
          kind: "invoice",
          status: "final",
          title: `Invoice ${number}`,
          isTemplate: false,
          notes: IMPORT_NOTE,
        });
        // Keep the read line items only when they add up to the total.
        const items = d.read?.lineItems ?? [];
        const itemsTotal = items.reduce((s, l) => s + l.quantity * l.unit_price, 0);
        const lineItems =
          items.length && Math.abs(itemsTotal - amount) < 1
            ? items
            : [{ description: items[0]?.description ?? "Services", quantity: 1, unit_price: amount }];
        const [inv] = await insertMany("invoices", [
          {
            client_id: clientId,
            number,
            title: items.length === 1 ? items[0].description : null,
            issue_date: d.issueDate!,
            due_date: d.dueDate ?? format(addDays(new Date(d.issueDate!), 14), "yyyy-MM-dd"),
            line_items: lineItems,
            amount,
            currency: "KES",
            status: "sent",
            notes: [
              IMPORT_NOTE,
              d.read?.currency && d.read.currency !== "KES" ? `Original currency: ${d.read.currency}` : null,
            ]
              .filter(Boolean)
              .join(" · "),
            document_id: doc.id,
          },
        ]);
        if (d.paid) {
          await insertMany("payments", [
            {
              client_id: clientId,
              invoice_id: inv.id,
              amount: toNumberOrNull(d.paidAmount)!,
              paid_on: d.paidDate ?? d.dueDate ?? d.issueDate!,
              method: d.method,
              reference: d.reference.trim() || null,
              notes: IMPORT_NOTE,
            },
          ]);
        }
        done += 1;
      }

      [tableKey("invoices"), tableKey("payments"), tableKey("documents"), hubKeys.clients, hubKeys.onboarding].forEach(
        (key) => qc.invalidateQueries({ queryKey: key }),
      );
      setDrafts([]);
      onPendingChange?.(0);
      toast.success(
        `Imported ${done} ${done === 1 ? "invoice" : "invoices"}${ids.size ? `, added ${ids.size} new ${ids.size === 1 ? "client" : "clients"}` : ""}`,
      );
      onDone();
    } catch (e) {
      [tableKey("invoices"), tableKey("payments"), tableKey("documents"), hubKeys.clients].forEach((key) =>
        qc.invalidateQueries({ queryKey: key }),
      );
      // Drop the ones already saved so a retry doesn't duplicate them.
      const savedIds = new Set(readyDrafts.slice(0, done).map((d) => d.id));
      setDrafts((ds) => ds.filter((d) => !savedIds.has(d.id)));
      setError(`Saved ${done}, then stopped: ${(e as Error).message}. The rest are still here; try again.`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
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
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-6 text-left transition-colors duration-150",
          dragging ? "border-primary bg-tint" : "border-border hover:border-primary/50 hover:bg-secondary/50",
        )}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint text-on-tint">
          <FileText className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium">
            Drop your invoice PDFs here, or click to choose (many at once is fine)
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Each one is read for you: client, number, dates and amounts. You check
            them before anything is saved.
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {drafts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-4 py-3">
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={allPaid} onCheckedChange={setAllPaidFlag} />
            These invoices were paid
            <span className="text-xs text-muted-foreground">(you can change each one)</span>
          </label>
          {newNames.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              {newNames.length} new {newNames.length === 1 ? "client" : "clients"}, added
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ClientStatus)}>
                <SelectTrigger className="h-8 w-36 rounded-lg bg-card" aria-label="Status for new clients">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ended">as past clients</SelectItem>
                  <SelectItem value="active">as active clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <ul className="max-h-[52dvh] space-y-3 overflow-y-auto pr-1">
        {drafts.map((d) => (
          <DraftCard
            key={d.id}
            draft={d}
            problems={(draftProblems.get(d.id) ?? []).join("|")}
            onChange={update}
            onRemove={remove}
          />
        ))}
      </ul>

      {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <span className="text-sm text-muted-foreground">
          {pending > 0 ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading {pending} {pending === 1 ? "PDF" : "PDFs"}…
            </span>
          ) : readyDrafts.length ? (
            <>
              <span className="hub-tabular font-semibold text-foreground">{readyDrafts.length}</span> ready ·{" "}
              <span className="hub-tabular font-semibold text-foreground">{formatKES(total)}</span>
            </>
          ) : (
            " "
          )}
        </span>
        <Button
          className="rounded-full px-5"
          disabled={!readyDrafts.length || !!saving || pending > 0}
          onClick={runImport}
        >
          {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileUp className="mr-1.5 h-4 w-4" />}
          {saving ?? `Import ${readyDrafts.length || ""} ${readyDrafts.length === 1 ? "invoice" : "invoices"}`}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- one PDF

const DraftCard = memo(function DraftCard({
  draft: d,
  problems: problemText,
  onChange: onChangeById,
  onRemove: onRemoveById,
}: {
  draft: Draft;
  /** "|"-joined, so an unchanged list doesn't break memoisation. */
  problems: string;
  onChange: (id: string, patch: Partial<Draft>) => void;
  onRemove: (id: string) => void;
}) {
  const problems = problemText ? problemText.split("|") : [];
  const onChange = (patch: Partial<Draft>) => onChangeById(d.id, patch);
  const onRemove = () => onRemoveById(d.id);
  const [pickExisting, setPickExisting] = useState(false);
  const isNew = !d.clientId;
  const busy = d.status !== "ready";
  const confidence = d.read?.confidence;

  return (
    <li
      className={cn("rounded-2xl border border-border/70 bg-card p-4 transition-opacity", !d.include && "opacity-50")}
    >
      <div className="mb-3 flex items-center gap-3">
        <Checkbox
          checked={d.include}
          onCheckedChange={(v) => onChange({ include: v === true })}
          aria-label={`Include ${d.file.name}`}
          disabled={busy}
        />
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{d.file.name}</span>
        {busy ? (
          <Pill tone="muted">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> {d.status === "reading" ? "Reading…" : "Waiting"}
          </Pill>
        ) : problems.length ? (
          <Pill tone="warning">
            <AlertTriangle className="mr-1 h-3 w-3" /> Check
          </Pill>
        ) : (
          <Pill tone="accent">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {d.read?.source === "ai" ? (confidence === "high" ? "Read" : "Read · check") : "Ready"}
          </Pill>
        )}
        <a
          href={d.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${d.file.name}`}
          className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {busy ? (
        <div className="grid gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="hub-label mb-1 flex items-center justify-between">
                Client
                <button
                  type="button"
                  className="text-[0.6875rem] font-medium text-primary hover:underline"
                  onClick={() => {
                    if (isNew) setPickExisting(true);
                    else onChange({ clientId: null, newClientName: d.read?.clientName ?? "" });
                  }}
                >
                  {isNew ? "Pick existing" : "New client"}
                </button>
              </p>
              {isNew && !pickExisting ? (
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={d.newClientName}
                    onChange={(e) => onChange({ newClientName: e.target.value })}
                    placeholder="New client's name"
                    className="h-10 rounded-xl bg-background pl-8"
                    aria-label="New client name"
                  />
                </div>
              ) : (
                <ClientPicker
                  value={d.clientId}
                  onChange={(v) => {
                    onChange({ clientId: v });
                    setPickExisting(false);
                  }}
                  className="h-10"
                />
              )}
            </div>
            <div>
              <p className="hub-label mb-1">Invoice number</p>
              <Input
                value={d.number}
                onChange={(e) => onChange({ number: e.target.value })}
                placeholder="Auto"
                className="hub-tabular h-10 rounded-xl bg-background"
                aria-label="Invoice number"
              />
            </div>
            <div>
              <p className="hub-label mb-1">Date</p>
              <DatePicker
                value={d.issueDate}
                onChange={(v) => onChange({ issueDate: v })}
                clearable={false}
                className="[&_button]:h-10"
              />
            </div>
            <div>
              <p className="hub-label mb-1">Amount</p>
              <MoneyInput
                value={d.amount}
                onChange={(v) => onChange({ amount: v, paidAmount: d.paidAmount === d.amount ? v : d.paidAmount })}
                className="[&_input]:h-10"
              />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-secondary/50 px-3 py-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={d.paid}
                onCheckedChange={(v) => onChange({ paid: v, paidAmount: d.paidAmount || d.amount })}
              />
              Paid
            </label>
            {d.paid && (
              <>
                <MoneyInput
                  value={d.paidAmount}
                  onChange={(v) => onChange({ paidAmount: v })}
                  className="w-36 [&_input]:h-9 [&_input]:bg-card"
                />
                <DatePicker
                  value={d.paidDate}
                  onChange={(v) => onChange({ paidDate: v })}
                  placeholder="Date paid"
                  className="w-40 [&_button]:h-9 [&_button]:bg-card"
                />
                <Select value={d.method} onValueChange={(v) => onChange({ method: v as PaymentMethod })}>
                  <SelectTrigger className="h-9 w-32 rounded-lg bg-card" aria-label="Payment method">
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
                <Input
                  value={d.reference}
                  onChange={(e) =>
                    onChange({ reference: d.method === "mpesa" ? e.target.value.toUpperCase() : e.target.value })
                  }
                  placeholder={d.method === "mpesa" ? "M-Pesa code" : "Reference"}
                  className="hub-tabular h-9 w-36 rounded-lg bg-card"
                  aria-label="Payment reference"
                />
              </>
            )}
          </div>

          {(d.aiError || problems.length > 0 || (d.read?.currency && d.read.currency !== "KES") || d.read?.notes) && (
            <div className="mt-2 space-y-1 text-xs">
              {problems.map((p) => (
                <p key={p} className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" /> {p}
                </p>
              ))}
              {d.read?.currency && d.read.currency !== "KES" && (
                <p className="text-warning">
                  This invoice is in {d.read.currency}. Enter the amount in KES before importing.
                </p>
              )}
              {d.aiError && <p className="text-muted-foreground">{d.aiError}</p>}
              {d.read?.notes && <p className="text-muted-foreground">Note: {d.read.notes}</p>}
            </div>
          )}
        </>
      )}
    </li>
  );
});
