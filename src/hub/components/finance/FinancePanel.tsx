import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { endOfMonth, format, startOfMonth, startOfYear, subMonths } from "date-fns";
import {
  AlertTriangle,
  Ban,
  Banknote,
  CircleDollarSign,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Receipt,
  Repeat,
  Search,
  Send,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { downloadCsv, toCsv } from "../../lib/csv";
import { useDeleteRow, useRows, useSaveRow } from "../../lib/data";
import { INVOICE_STATE, invoiceState, monthlyTotals, outstanding, paidByInvoice, sumAmounts } from "../../lib/finance";
import { formatDate } from "../../lib/format";
import { useKes } from "../../lib/privacy";
import { useClients } from "../../lib/queries";
import {
  EXPENSE_CATEGORY_LABEL,
  PAYMENT_METHOD_LABEL,
  type ExpenseCategory,
  type Expense,
  type Invoice,
  type Payment,
} from "../../lib/types";
import { BlurFade } from "../motion/blur-fade";
import { KesTicker } from "../motion/number-ticker";
import { EmptyState, Pill, SkeletonBlock, StatTile, TableCard } from "../ui";
import { ExpenseDialog, InvoiceDialog, PaymentDialog, RetainerRunDialog } from "./FinanceDialogs";
import { PrivacyToggle, PrivateBlur } from "../privacy";

const FinanceChart = lazy(() => import("./FinanceChart"));
const ExpenseBreakdownChart = lazy(() => import("./ExpenseBreakdownChart"));

type Period = "this_month" | "last_month" | "this_year" | "all";
const PERIOD_LABEL: Record<Period, string> = {
  this_month: "This month",
  last_month: "Last month",
  this_year: "This year",
  all: "All time",
};

function periodRange(period: Period): [string, string] | null {
  const now = new Date();
  const iso = (d: Date) => format(d, "yyyy-MM-dd");
  if (period === "this_month") return [iso(startOfMonth(now)), iso(endOfMonth(now))];
  if (period === "last_month") {
    const last = subMonths(now, 1);
    return [iso(startOfMonth(last)), iso(endOfMonth(last))];
  }
  if (period === "this_year") return [iso(startOfYear(now)), "9999-12-31"];
  return null;
}

const inRange = (date: string, range: [string, string] | null) => !range || (date >= range[0] && date <= range[1]);

type DialogState =
  | { kind: "invoice"; invoice?: Invoice | null; copyFrom?: Invoice | null }
  | { kind: "payment"; payment?: Payment | null; invoice?: Invoice | null }
  | { kind: "expense"; expense?: Expense | null }
  | { kind: "retainers" }
  | null;

/**
 * Money in and out. Without a clientId it's the whole business (Finance page);
 * with one it's that client's invoices, payments and costs (client Finance tab).
 */
export function FinancePanel({ clientId }: { clientId?: string }) {
  const kes = useKes();
  const invoices = useRows("invoices", "issue_date");
  const payments = useRows("payments", "paid_on");
  const expenses = useRows("expenses", "spent_on");
  const clients = useClients();
  const saveInvoice = useSaveRow("invoices");
  const deleteInvoice = useDeleteRow("invoices", ["payments"]);
  const deletePayment = useDeleteRow("payments");
  const deleteExpense = useDeleteRow("expenses");
  const [params, setParams] = useSearchParams();
  const [period, setPeriod] = useState<Period>("this_month");
  const [tab, setTab] = useState("invoices");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [query, setQuery] = useState("");

  // ⌘K actions arrive as ?new=invoice|payment|expense.
  useEffect(() => {
    const next = params.get("new");
    if (next === "invoice" || next === "payment" || next === "expense") {
      setDialog({ kind: next });
      setTab(next === "invoice" ? "invoices" : next === "payment" ? "payments" : "expenses");
      const rest = new URLSearchParams(params);
      rest.delete("new");
      setParams(rest, { replace: true });
    }
  }, [params, setParams]);

  const clientName = useMemo(() => new Map((clients.data ?? []).map((c) => [c.id, c.name])), [clients.data]);
  const mine = <T extends { client_id: string | null }>(rows: T[] | undefined) =>
    (rows ?? []).filter((r) => !clientId || r.client_id === clientId);

  const inv = mine(invoices.data);
  const pay = mine(payments.data);
  const exp = mine(expenses.data);

  // Search narrows the tables below (not the totals above).
  const q = query.trim().toLowerCase();
  const match = (...values: (string | null | undefined)[]) => !q || values.some((v) => v?.toLowerCase().includes(q));
  const invoiceNumber = (id: string | null) => (id ? invoices.data?.find((i) => i.id === id)?.number : undefined);
  const invShown = inv.filter((i) => match(i.number, i.title, clientName.get(i.client_id)));
  const payShown = pay.filter((p) =>
    match(
      p.reference,
      p.notes,
      clientName.get(p.client_id),
      invoiceNumber(p.invoice_id),
      PAYMENT_METHOD_LABEL[p.method],
    ),
  );
  const expShown = exp.filter((e) =>
    match(
      e.description,
      e.vendor,
      e.notes,
      EXPENSE_CATEGORY_LABEL[e.category],
      e.client_id ? clientName.get(e.client_id) : "General",
    ),
  );
  const paid = useMemo(() => paidByInvoice(payments.data ?? []), [payments.data]);

  const range = periodRange(period);
  const received = sumAmounts(pay.filter((p) => inRange(p.paid_on, range)));
  const spent = sumAmounts(exp.filter((e) => inRange(e.spent_on, range)));
  const owed = inv.reduce((s, i) => s + outstanding(i, paid.get(i.id) ?? 0), 0);
  const overdueCount = inv.filter((i) => invoiceState(i, paid.get(i.id) ?? 0) === "overdue").length;
  const chartData = useMemo(() => monthlyTotals(pay, exp), [pay, exp]);

  const byClient = useMemo(() => {
    if (clientId) return [];
    const rows = new Map<string, { received: number; spent: number; owed: number }>();
    const row = (id: string) => rows.get(id) ?? rows.set(id, { received: 0, spent: 0, owed: 0 }).get(id)!;
    for (const p of pay) if (inRange(p.paid_on, range)) row(p.client_id).received += Number(p.amount);
    for (const e of exp) if (e.client_id && inRange(e.spent_on, range)) row(e.client_id).spent += Number(e.amount);
    for (const i of inv) {
      const o = outstanding(i, paid.get(i.id) ?? 0);
      if (o) row(i.client_id).owed += o;
    }
    return [...rows.entries()]
      .map(([id, v]) => ({ id, ...v, profit: v.received - v.spent }))
      .sort((a, b) => b.profit - a.profit);
  }, [clientId, pay, exp, inv, paid, range]);

  const breakdown = useMemo(() => {
    const totals = new Map<ExpenseCategory, number>();
    for (const e of exp)
      if (inRange(e.spent_on, range)) totals.set(e.category, (totals.get(e.category) ?? 0) + Number(e.amount));
    return [...totals.entries()]
      .map(([key, amount]) => ({ key, label: EXPENSE_CATEGORY_LABEL[key], amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [exp, range]);

  const fileSuffix = () => {
    const who = clientId ? `${(clientName.get(clientId) ?? "client").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-` : "";
    return `${who}${period.replace("_", "-")}`;
  };

  // Exports what the table shows (search applied) for the chosen period.
  const exportCsv = (kind: "invoices" | "payments" | "expenses") => {
    if (kind === "invoices") {
      const rows = invShown.filter((i) => inRange(i.issue_date, range));
      downloadCsv(
        `invoices-${fileSuffix()}.csv`,
        toCsv(rows, [
          { header: "Number", value: (i) => i.number },
          { header: "Client", value: (i) => clientName.get(i.client_id) },
          { header: "Title", value: (i) => i.title },
          { header: "Issued", value: (i) => i.issue_date },
          { header: "Due", value: (i) => i.due_date },
          { header: "Amount (KES)", value: (i) => Number(i.amount) },
          { header: "Paid (KES)", value: (i) => paid.get(i.id) ?? 0 },
          { header: "Status", value: (i) => INVOICE_STATE[invoiceState(i, paid.get(i.id) ?? 0)].label },
        ]),
      );
      return rows.length;
    }
    if (kind === "payments") {
      const rows = payShown.filter((p) => inRange(p.paid_on, range));
      downloadCsv(
        `payments-${fileSuffix()}.csv`,
        toCsv(rows, [
          { header: "Date", value: (p) => p.paid_on },
          { header: "Client", value: (p) => clientName.get(p.client_id) },
          { header: "Invoice", value: (p) => invoiceNumber(p.invoice_id) },
          { header: "Method", value: (p) => PAYMENT_METHOD_LABEL[p.method] },
          { header: "Reference", value: (p) => p.reference },
          { header: "Amount (KES)", value: (p) => Number(p.amount) },
        ]),
      );
      return rows.length;
    }
    const rows = expShown.filter((e) => inRange(e.spent_on, range));
    downloadCsv(
      `expenses-${fileSuffix()}.csv`,
      toCsv(rows, [
        { header: "Date", value: (e) => e.spent_on },
        { header: "Description", value: (e) => e.description },
        { header: "Vendor", value: (e) => e.vendor },
        { header: "Category", value: (e) => EXPENSE_CATEGORY_LABEL[e.category] },
        { header: "Client", value: (e) => (e.client_id ? clientName.get(e.client_id) : "General") },
        { header: "Amount (KES)", value: (e) => Number(e.amount) },
      ]),
    );
    return rows.length;
  };

  const loading = invoices.isLoading || payments.isLoading || expenses.isLoading;
  const loadError = invoices.error ?? payments.error ?? expenses.error;

  const markSent = (i: Invoice) =>
    saveInvoice.mutate(
      { id: i.id, values: { status: "sent" } },
      { onSuccess: () => toast.success(`${i.number} marked as sent`) },
    );
  const voidInvoice = (i: Invoice) =>
    saveInvoice.mutate(
      { id: i.id, values: { status: "void" } },
      { onSuccess: () => toast.success(`${i.number} voided`) },
    );

  if (loading) return <SkeletonBlock className="h-80 rounded-[20px]" />;

  return (
    <div className="space-y-6">
      {loadError && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn't load finance data: {loadError.message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="h-10 w-40 rounded-xl border-transparent bg-secondary" aria-label="Period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PERIOD_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PrivacyToggle className="h-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="h-10 rounded-full">
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                CSV for {PERIOD_LABEL[period].toLowerCase()}
              </DropdownMenuLabel>
              {(["invoices", "payments", "expenses"] as const).map((k) => (
                <DropdownMenuItem key={k} onSelect={() => toast.success(`Exported ${exportCsv(k)} ${k}`)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> {k[0].toUpperCase() + k.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {!clientId && (
            <Button variant="secondary" className="h-10 rounded-full" onClick={() => setDialog({ kind: "retainers" })}>
              <Repeat className="mr-1.5 h-4 w-4" /> Bill retainers
            </Button>
          )}
          <Button variant="secondary" className="h-10 rounded-full" onClick={() => setDialog({ kind: "expense" })}>
            <Receipt className="mr-1.5 h-4 w-4" /> Expense
          </Button>
          <Button variant="secondary" className="h-10 rounded-full" onClick={() => setDialog({ kind: "payment" })}>
            <Banknote className="mr-1.5 h-4 w-4" /> Payment
          </Button>
          <Button className="h-10 rounded-full px-4" onClick={() => setDialog({ kind: "invoice" })}>
            <Plus className="mr-1.5 h-4 w-4" /> Invoice
          </Button>
        </div>
      </div>

      <BlurFade className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Received" icon={Wallet} hint={PERIOD_LABEL[period]}>
          <KesTicker value={received} />
        </StatTile>
        <StatTile label="Expenses" icon={Receipt} hint={PERIOD_LABEL[period]}>
          <KesTicker value={spent} />
        </StatTile>
        <StatTile
          label="Profit"
          icon={TrendingUp}
          warn={received - spent < 0}
          hint={received > 0 ? `${Math.round(((received - spent) / received) * 100)}% margin` : PERIOD_LABEL[period]}
        >
          {received - spent < 0 && "−"}
          <KesTicker value={Math.abs(received - spent)} />
        </StatTile>
        <StatTile
          label="Outstanding"
          icon={overdueCount ? AlertTriangle : CircleDollarSign}
          warn={overdueCount > 0}
          hint={
            overdueCount ? `${overdueCount} overdue ${overdueCount === 1 ? "invoice" : "invoices"}` : "On sent invoices"
          }
        >
          <KesTicker value={owed} />
        </StatTile>
      </BlurFade>

      <BlurFade delay={0.05} className="grid gap-4 lg:grid-cols-3">
        <div className="hub-card p-5 lg:col-span-2">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="font-semibold">Last 6 months</h3>
            <span className="text-right text-xs text-muted-foreground">Payments received vs expenses</span>
          </div>
          {chartData.every((m) => !m.revenue && !m.expenses) ? (
            <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Record payments and expenses to see the trend.
            </p>
          ) : (
            <PrivateBlur>
              <Suspense fallback={<SkeletonBlock className="h-64" />}>
                <FinanceChart data={chartData} />
              </Suspense>
            </PrivateBlur>
          )}
        </div>
        <div className="hub-card p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="font-semibold">Where it went</h3>
            <span className="text-xs text-muted-foreground">{PERIOD_LABEL[period]}</span>
          </div>
          {breakdown.length === 0 ? (
            <p className="flex h-40 items-center justify-center text-center text-sm text-muted-foreground">
              No expenses in this period.
            </p>
          ) : (
            <PrivateBlur>
              <Suspense fallback={<SkeletonBlock className="h-44" />}>
                <ExpenseBreakdownChart data={breakdown} />
              </Suspense>
            </PrivateBlur>
          )}
        </div>
      </BlurFade>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList className="h-auto rounded-xl bg-secondary p-1">
              {[
                ["invoices", `Invoices (${inv.length})`],
                ["payments", `Payments (${pay.length})`],
                ["expenses", `Expenses (${exp.length})`],
                ...(clientId ? [] : [["clients", "By client"]]),
              ].map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tab !== "clients" && (
            <div className="relative md:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  tab === "invoices"
                    ? "Search number or client"
                    : tab === "payments"
                      ? "Search M-Pesa code or client"
                      : "Search description or vendor"
                }
                aria-label="Search"
                className="h-10 rounded-xl border-transparent bg-secondary pl-10 focus-visible:bg-card"
              />
            </div>
          )}
        </div>

        <TabsContent value="invoices" className="mt-4">
          {inv.length === 0 ? (
            <div className="hub-card">
              <EmptyState
                icon={FileText}
                title="No invoices yet"
                description="Create an invoice, then print it or save it as a PDF to send."
                action={
                  <Button size="sm" className="rounded-full" onClick={() => setDialog({ kind: "invoice" })}>
                    New invoice
                  </Button>
                }
              />
            </div>
          ) : (
            <TableCard>
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice</TableHead>
                    {!clientId && <TableHead>Client</TableHead>}
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invShown.map((i) => {
                    const p = paid.get(i.id) ?? 0;
                    const state = INVOICE_STATE[invoiceState(i, p)];
                    const hasPayments = (payments.data ?? []).some((x) => x.invoice_id === i.id);
                    return (
                      <TableRow key={i.id}>
                        <TableCell>
                          <Link
                            to={`/hub/finance/invoices/${i.id}`}
                            className="hub-tabular font-medium hover:text-primary"
                          >
                            {i.number}
                          </Link>
                          {i.title && (
                            <span className="block max-w-[14rem] truncate text-xs text-muted-foreground">
                              {i.title}
                            </span>
                          )}
                        </TableCell>
                        {!clientId && (
                          <TableCell className="text-muted-foreground">{clientName.get(i.client_id) ?? "—"}</TableCell>
                        )}
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(i.issue_date, "d MMM yyyy")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(i.due_date, "d MMM yyyy")}
                        </TableCell>
                        <TableCell className="hub-tabular whitespace-nowrap text-right font-medium">
                          {kes(Number(i.amount))}
                        </TableCell>
                        <TableCell className="hub-tabular whitespace-nowrap text-right text-muted-foreground">
                          {p ? kes(p) : "—"}
                        </TableCell>
                        <TableCell>
                          <Pill tone={state.tone}>{state.label}</Pill>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                aria-label={`Actions for ${i.number}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-xl">
                              <DropdownMenuItem asChild>
                                <Link to={`/hub/finance/invoices/${i.id}`}>
                                  <Printer className="mr-2 h-4 w-4" /> View / print
                                </Link>
                              </DropdownMenuItem>
                              {i.status !== "void" && p < Number(i.amount) && (
                                <DropdownMenuItem onSelect={() => setDialog({ kind: "payment", invoice: i })}>
                                  <Banknote className="mr-2 h-4 w-4" /> Record payment
                                </DropdownMenuItem>
                              )}
                              {i.status === "draft" && (
                                <DropdownMenuItem onSelect={() => markSent(i)}>
                                  <Send className="mr-2 h-4 w-4" /> Mark as sent
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onSelect={() => setDialog({ kind: "invoice", copyFrom: i })}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setDialog({ kind: "invoice", invoice: i })}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {i.status !== "void" && (
                                <DropdownMenuItem onSelect={() => voidInvoice(i)}>
                                  <Ban className="mr-2 h-4 w-4" /> Void
                                </DropdownMenuItem>
                              )}
                              {!hasPayments && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() =>
                                    deleteInvoice.mutate(i.id, {
                                      onSuccess: () => toast.success(`${i.number} deleted`),
                                      onError: (e) => toast.error(e.message),
                                    })
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableCard>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          {pay.length === 0 ? (
            <div className="hub-card">
              <EmptyState
                icon={Banknote}
                title="No payments recorded"
                description="Record M-Pesa, bank or cash payments as they come in."
                action={
                  <Button size="sm" className="rounded-full" onClick={() => setDialog({ kind: "payment" })}>
                    Record payment
                  </Button>
                }
              />
            </div>
          ) : (
            <TableCard>
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    {!clientId && <TableHead>Client</TableHead>}
                    <TableHead>Invoice</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payShown.map((p) => {
                    const invoice = invoices.data?.find((i) => i.id === p.invoice_id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(p.paid_on, "d MMM yyyy")}</TableCell>
                        {!clientId && (
                          <TableCell className="text-muted-foreground">{clientName.get(p.client_id) ?? "—"}</TableCell>
                        )}
                        <TableCell className="hub-tabular text-muted-foreground">{invoice?.number ?? "—"}</TableCell>
                        <TableCell>
                          {PAYMENT_METHOD_LABEL[p.method]}
                          {p.reference && (
                            <span className="hub-tabular block text-xs text-muted-foreground">{p.reference}</span>
                          )}
                        </TableCell>
                        <TableCell className="hub-tabular whitespace-nowrap text-right font-medium text-on-tint">
                          +{kes(Number(p.amount))}
                        </TableCell>
                        <TableCell>
                          <RowActions
                            label={`payment of ${kes(Number(p.amount))}`}
                            onEdit={() => setDialog({ kind: "payment", payment: p })}
                            onDelete={() =>
                              deletePayment.mutate(p.id, {
                                onSuccess: () => toast.success("Payment removed"),
                                onError: (e) => toast.error(e.message),
                              })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableCard>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          {exp.length === 0 ? (
            <div className="hub-card">
              <EmptyState
                icon={Receipt}
                title="No expenses yet"
                description="Track software, ad spend, contractors and other costs to see your real profit."
                action={
                  <Button size="sm" className="rounded-full" onClick={() => setDialog({ kind: "expense" })}>
                    Add expense
                  </Button>
                }
              />
            </div>
          ) : (
            <TableCard>
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    {!clientId && <TableHead>Client</TableHead>}
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expShown.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(e.spent_on, "d MMM yyyy")}</TableCell>
                      <TableCell>
                        {e.description}
                        {e.vendor && <span className="block text-xs text-muted-foreground">{e.vendor}</span>}
                      </TableCell>
                      <TableCell>
                        <Pill tone="outline">{EXPENSE_CATEGORY_LABEL[e.category]}</Pill>
                      </TableCell>
                      {!clientId && (
                        <TableCell className="text-muted-foreground">
                          {e.client_id ? (clientName.get(e.client_id) ?? "—") : "General"}
                        </TableCell>
                      )}
                      <TableCell className="hub-tabular whitespace-nowrap text-right font-medium">
                        −{kes(Number(e.amount))}
                      </TableCell>
                      <TableCell>
                        <RowActions
                          label={e.description}
                          onEdit={() => setDialog({ kind: "expense", expense: e })}
                          onDelete={() =>
                            deleteExpense.mutate(e.id, {
                              onSuccess: () => toast.success("Expense removed"),
                              onError: (err) => toast.error(err.message),
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCard>
          )}
        </TabsContent>

        {!clientId && (
          <TabsContent value="clients" className="mt-4">
            {byClient.length === 0 ? (
              <div className="hub-card">
                <EmptyState
                  icon={TrendingUp}
                  title="Nothing to compare yet"
                  description={`No client payments or costs for ${PERIOD_LABEL[period].toLowerCase()}.`}
                />
              </div>
            ) : (
              <TableCard>
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                      <TableHead className="text-right">Costs</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byClient.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Link to={`/hub/clients/${r.id}?tab=finance`} className="font-medium hover:text-primary">
                            {clientName.get(r.id) ?? "Client"}
                          </Link>
                        </TableCell>
                        <TableCell className="hub-tabular text-right">{kes(r.received)}</TableCell>
                        <TableCell className="hub-tabular text-right text-muted-foreground">{kes(r.spent)}</TableCell>
                        <TableCell className={cn("hub-tabular text-right font-medium", r.profit < 0 && "text-warning")}>
                          {r.profit < 0 ? "−" : ""}
                          {kes(Math.abs(r.profit))}
                        </TableCell>
                        <TableCell className="hub-tabular text-right text-muted-foreground">
                          {r.received ? `${Math.round((r.profit / r.received) * 100)}%` : "—"}
                        </TableCell>
                        <TableCell className="hub-tabular text-right text-muted-foreground">
                          {r.owed ? kes(r.owed) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCard>
            )}
          </TabsContent>
        )}
      </Tabs>

      <InvoiceDialog
        open={dialog?.kind === "invoice"}
        onOpenChange={(o) => !o && setDialog(null)}
        invoice={dialog?.kind === "invoice" ? dialog.invoice : null}
        copyFrom={dialog?.kind === "invoice" ? dialog.copyFrom : null}
        clientId={clientId}
      />
      <RetainerRunDialog open={dialog?.kind === "retainers"} onOpenChange={(o) => !o && setDialog(null)} />
      <PaymentDialog
        open={dialog?.kind === "payment"}
        onOpenChange={(o) => !o && setDialog(null)}
        payment={dialog?.kind === "payment" ? dialog.payment : null}
        invoice={dialog?.kind === "payment" ? dialog.invoice : null}
        clientId={clientId}
      />
      <ExpenseDialog
        open={dialog?.kind === "expense"}
        onOpenChange={(o) => !o && setDialog(null)}
        expense={dialog?.kind === "expense" ? dialog.expense : null}
        clientId={clientId}
      />
    </div>
  );
}

function RowActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label={`Actions for ${label}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
