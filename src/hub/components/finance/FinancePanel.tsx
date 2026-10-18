import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { endOfMonth, format, startOfMonth, startOfYear, subMonths } from "date-fns";
import {
  AlertTriangle,
  Ban,
  Banknote,
  CircleDollarSign,
  Clock,
  Copy,
  Crown,
  Download,
  FileSpreadsheet,
  FileUp,
  Mail,
  MessageCircle,
  FileText,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  Printer,
  Receipt,
  Repeat,
  Search,
  Send,
  Trash2,
  TrendingDown,
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
import { INVOICE_STATE, invoiceState, outstanding, paidByInvoice } from "../../lib/finance";
import { PERIOD_LABEL, buildDashboard, inRange, monthlySeries, periodRange, type Period } from "../../lib/financeStats";
import { formatDate } from "../../lib/format";
import { useKes } from "../../lib/privacy";
import { useClients } from "../../lib/queries";
import { invoiceReminder } from "../../lib/reminders";
import { useSettings } from "../../lib/settings";
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
import type { Insight } from "./FinanceDashboard";
import { ExpenseDialog, InvoiceDialog, PaymentDialog, RetainerRunDialog } from "./FinanceDialogs";
import { ImportInvoicesDialog } from "./ImportInvoicesDialog";
import { PrivacyToggle } from "../privacy";

// All charts live in one lazy chunk so recharts loads only with Finance.
const FinanceDashboard = lazy(() => import("./FinanceDashboard"));

type DialogState =
  | { kind: "invoice"; invoice?: Invoice | null; copyFrom?: Invoice | null }
  | { kind: "payment"; payment?: Payment | null; invoice?: Invoice | null }
  | { kind: "expense"; expense?: Expense | null }
  | { kind: "retainers" }
  | { kind: "import" }
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
  const { settings } = useSettings();
  const saveInvoice = useSaveRow("invoices");
  const deleteInvoice = useDeleteRow("invoices", ["payments"]);
  const deletePayment = useDeleteRow("payments");
  const deleteExpense = useDeleteRow("expenses");
  const [params, setParams] = useSearchParams();
  const [period, setPeriod] = useState<Period>("this_month");
  const [tab, setTab] = useState("dashboard");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [query, setQuery] = useState("");

  // ⌘K actions arrive as ?new=invoice|payment|expense.
  useEffect(() => {
    const next = params.get("new");
    if (next === "import") {
      setDialog({ kind: "import" });
      const rest = new URLSearchParams(params);
      rest.delete("new");
      setParams(rest, { replace: true });
      return;
    }
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
  const dash = useMemo(
    () =>
      buildDashboard({
        invoices: inv,
        payments: pay,
        expenses: exp,
        period,
        clientName: (id) => clientName.get(id) ?? "Client",
        categoryLabel: (c) => EXPENSE_CATEGORY_LABEL[c],
        methodLabel: (m) => PAYMENT_METHOD_LABEL[m],
      }),
    // inv/pay/exp are re-filtered each render; their sources are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invoices.data, payments.data, expenses.data, clientId, period, clientName],
  );
  const series6 = useMemo(
    () => monthlySeries(pay, exp, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments.data, expenses.data, clientId],
  );
  const series12 = useMemo(
    () => monthlySeries(pay, exp, 12),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments.data, expenses.data, clientId],
  );

  // Plain-language summary at the top of the dashboard.
  const insights: Insight[] = [];
  const when = PERIOD_LABEL[period].toLowerCase();
  if (dash.moneyIn > 0) {
    insights.push({
      icon: Wallet,
      text: (
        <>
          You received <b>{kes(dash.moneyIn)}</b> {when}
          {dash.inChange !== null && dash.compareLabel
            ? `, ${Math.abs(dash.inChange)}% ${dash.inChange >= 0 ? "more" : "less"} than at this point before.`
            : "."}
        </>
      ),
      tone: dash.inChange !== null && dash.inChange < 0 ? "bad" : "good",
    });
    insights.push({
      icon: dash.profit >= 0 ? PiggyBank : TrendingDown,
      text:
        dash.profit >= 0 ? (
          <>
            After <b>{kes(dash.moneyOut)}</b> in costs you kept <b>{kes(dash.profit)}</b> ({dash.margin}% of what came
            in).
          </>
        ) : (
          <>
            Costs were <b>{kes(dash.moneyOut)}</b>, more than came in. You're <b>{kes(-dash.profit)}</b> down {when}.
          </>
        ),
      tone: dash.profit >= 0 ? "good" : "bad",
    });
  } else {
    insights.push({ icon: Wallet, text: <>No payments recorded {when} yet.</> });
  }
  if (!clientId && dash.clients[0] && dash.clients[0].key !== "__other") {
    insights.push({
      icon: Crown,
      text: (
        <>
          <b>{dash.clients[0].label}</b> brought in {Math.round(dash.clients[0].share * 100)}% of the money {when}.
        </>
      ),
    });
  }
  insights.push(
    dash.overdueCount
      ? {
          icon: AlertTriangle,
          text: (
            <>
              <b>
                {dash.overdueCount} {dash.overdueCount === 1 ? "invoice is" : "invoices are"} overdue
              </b>{" "}
              ({kes(dash.overdueAmount)}). Worth a reminder.
            </>
          ),
          tone: "bad",
        }
      : { icon: CircleDollarSign, text: <>Nothing is overdue. Everyone's paying on time.</> },
  );
  if (dash.avgDaysToPay !== null) {
    insights.push({
      icon: Clock,
      text: (
        <>
          Invoices take <b>{dash.avgDaysToPay} days</b> on average to be paid in full.
        </>
      ),
    });
  }
  if (dash.categories[0]) {
    insights.push({
      icon: Receipt,
      text: (
        <>
          Your biggest cost was <b>{dash.categories[0].label}</b> ({kes(dash.categories[0].amount)}).
        </>
      ),
    });
  }

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
              <Button variant="secondary" className="h-10 rounded-full bg-card shadow-hub hover:bg-secondary">
                <MoreHorizontal className="mr-1.5 h-4 w-4" /> More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60 rounded-xl">
              <DropdownMenuItem onSelect={() => setDialog({ kind: "import" })}>
                <FileUp className="mr-2 h-4 w-4" /> Import past invoices
              </DropdownMenuItem>
              {!clientId && (
                <DropdownMenuItem onSelect={() => setDialog({ kind: "retainers" })}>
                  <Repeat className="mr-2 h-4 w-4" /> Bill retainers
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <Download className="h-3.5 w-3.5" /> Export CSV for {PERIOD_LABEL[period].toLowerCase()}
              </DropdownMenuLabel>
              {(["invoices", "payments", "expenses"] as const).map((k) => (
                <DropdownMenuItem key={k} onSelect={() => toast.success(`Exported ${exportCsv(k)} ${k}`)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> {k[0].toUpperCase() + k.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center rounded-full bg-card p-1 shadow-hub">
            <Button
              variant="ghost"
              className="h-8 rounded-full px-3 hover:bg-secondary"
              onClick={() => setDialog({ kind: "expense" })}
            >
              <Receipt className="mr-1.5 h-4 w-4" /> Expense
            </Button>
            <span className="h-5 w-px bg-border" aria-hidden />
            <Button
              variant="ghost"
              className="h-8 rounded-full px-3 hover:bg-secondary"
              onClick={() => setDialog({ kind: "payment" })}
            >
              <Banknote className="mr-1.5 h-4 w-4" /> Payment
            </Button>
          </div>
          <Button className="h-10 rounded-full px-4" onClick={() => setDialog({ kind: "invoice" })}>
            <Plus className="mr-1.5 h-4 w-4" /> Invoice
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList className="h-auto rounded-xl bg-secondary p-1">
              {[
                ["dashboard", "Dashboard"],
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
          {tab !== "clients" && tab !== "dashboard" && (
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

        <TabsContent value="dashboard" className="mt-4">
          <Suspense fallback={<SkeletonBlock className="h-[36rem] rounded-[20px]" />}>
            <FinanceDashboard
              dash={dash}
              series6={series6}
              series12={series12}
              periodLabel={PERIOD_LABEL[period]}
              insights={insights}
              showClients={!clientId}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          {inv.length === 0 ? (
            <div className="hub-card">
              <EmptyState
                icon={FileText}
                title="No invoices yet"
                description="Create an invoice, or bring in your past invoices so the numbers catch up."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button size="sm" className="rounded-full" onClick={() => setDialog({ kind: "invoice" })}>
                      New invoice
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => setDialog({ kind: "import" })}
                    >
                      Import past invoices
                    </Button>
                  </div>
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
                              {i.status === "sent" &&
                                p < Number(i.amount) &&
                                (() => {
                                  const r = invoiceReminder({
                                    invoice: i,
                                    client: (clients.data ?? []).find((c) => c.id === i.client_id),
                                    balance: Number(i.amount) - p,
                                    business: settings.business,
                                  });
                                  return (
                                    <>
                                      {r.whatsapp && (
                                        <DropdownMenuItem asChild>
                                          <a href={r.whatsapp} target="_blank" rel="noreferrer">
                                            <MessageCircle className="mr-2 h-4 w-4" /> Remind on WhatsApp
                                          </a>
                                        </DropdownMenuItem>
                                      )}
                                      {r.email && (
                                        <DropdownMenuItem asChild>
                                          <a href={r.email}>
                                            <Mail className="mr-2 h-4 w-4" /> Remind by email
                                          </a>
                                        </DropdownMenuItem>
                                      )}
                                    </>
                                  );
                                })()}
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
      <ImportInvoicesDialog open={dialog?.kind === "import"} onOpenChange={(o) => !o && setDialog(null)} />
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
