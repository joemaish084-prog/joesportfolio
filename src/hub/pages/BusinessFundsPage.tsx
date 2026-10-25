import { useState } from "react";
import { CalendarDays, CheckCircle2, Pencil, PiggyBank, Plus, Repeat2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormDialog, inputClass, MoneyInput } from "../components/form";
import { Money } from "../components/privacy";
import { EmptyState, PageHeader, Pill, SkeletonBlock } from "../components/ui";
import { BusinessFundsDashboard } from "../components/funds/BusinessFundsDashboard";
import { cn } from "@/lib/utils";
import { formatDate, isOverdue } from "../lib/format";
import { usePrivacy } from "../lib/privacy";
import {
  FUND_CATEGORIES, FUND_FREQUENCIES, parseFundAmount, useBusinessFunds, useFundAction,
  type BusinessFund, type FundValues,
} from "../lib/businessFunds";

type Panel = { kind: "new" } | { kind: "edit" | "add" | "pay" | "delete"; fund: BusinessFund };
const selectClass = `${inputClass} w-full border border-input px-3 text-sm`;

export default function BusinessFundsPage() {
  const query = useBusinessFunds();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const { hidden } = usePrivacy();
  const funds = query.data?.funds ?? [];
  const shown = funds.filter((f) =>
    (filter === "all" || (filter === "completed" ? !!f.completed_at : !f.completed_at)) &&
    `${f.name} ${f.category} ${f.notes ?? ""}`.toLowerCase().includes(search.toLowerCase().trim()),
  ).sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority] || (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
  });
  const available = !query.isPending && !query.isError && !query.data?.missing;

  return (
    <div className="space-y-6">
      <PageHeader title="Business Funds" subtitle="A little today. A stronger business tomorrow."
        actions={<Button className="rounded-full" disabled={!available} onClick={() => setPanel({ kind: "new" })}><Plus className="mr-2 h-4 w-4" />New fund</Button>} />
      {query.isPending ? <SkeletonBlock className="h-64" /> : query.isError ? (
        <div role="alert" className="hub-card space-y-3 p-6"><p>Could not load your funds. Please try again.</p><Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></div>
      ) : query.data?.missing ? (
        <EmptyState icon={PiggyBank} title="Business Funds needs setup" description="The Business Funds database update needs to be applied before you can save your goals." />
      ) : <>
        <BusinessFundsDashboard funds={funds} onNew={() => setPanel({ kind: "new" })} onAdd={(fund) => setPanel({ kind: "add", fund })} />
        <div id="funds-collection" className="scroll-mt-20 space-y-4 pt-3">
          <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold tracking-tight">Your funds</h2><p className="mt-1 text-xs text-muted-foreground">Every ambition, with a plan behind it.</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">{funds.length} total</span></div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full bg-secondary p-1" aria-label="Fund status">{["active", "completed", "all"].map((status) => <button type="button" key={status} aria-pressed={filter === status} onClick={() => setFilter(status)} className={cn("rounded-full px-4 py-2 text-xs capitalize", filter === status ? "bg-card font-medium shadow-sm" : "text-muted-foreground")}>{status}</button>)}</div>
            <div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search funds" placeholder="Find a fund…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-full pl-9" /></div>
          </div>
        {!shown.length ? <div className="hub-card"><EmptyState icon={PiggyBank}
          title={funds.length ? "No matching funds" : "Give your next goal a place to grow"}
          description={funds.length ? "Try another search or status." : "Save for equipment, subscriptions, software, marketing, or whatever your business needs next."}
          action={!funds.length && <Button className="rounded-full" onClick={() => setPanel({ kind: "new" })}>Create your first fund</Button>} /></div> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {shown.map((fund) => {
              const saved = Number(fund.saved_amount);
              const target = Number(fund.target_amount);
              const pct = Math.min(100, Math.round(saved / target * 100));
              const ready = saved >= target;
              const overdue = isOverdue(fund.due_date, !!fund.completed_at || ready);
              return <article key={fund.id} className="hub-card relative flex flex-col gap-4 overflow-hidden !rounded-[24px] p-5 transition-shadow hover:shadow-hub-lg sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tint text-on-tint">{fund.completed_at ? <CheckCircle2 className="h-5 w-5" /> : fund.frequency === "once" ? <PiggyBank className="h-5 w-5" /> : <Repeat2 className="h-5 w-5" />}</div><div className="min-w-0"><h3 className="break-words text-base font-semibold">{fund.name}</h3><p className="mt-1 text-xs text-muted-foreground">{fund.category} · {FUND_FREQUENCIES[fund.frequency]}</p></div></div>
                  <div className="flex shrink-0 gap-1">
                    {!fund.completed_at && <Button variant="ghost" size="icon" aria-label={`Edit ${fund.name}`} onClick={() => setPanel({ kind: "edit", fund })}><Pencil className="h-4 w-4" /></Button>}
                    <Button variant="ghost" size="icon" aria-label={`Delete ${fund.name}`} onClick={() => setPanel({ kind: "delete", fund })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone={fund.priority === "high" ? "warning" : "neutral"}>{fund.priority.charAt(0).toUpperCase() + fund.priority.slice(1)} priority</Pill>
                  {fund.completed_at ? <Pill tone="accent">Completed</Pill> : ready ? <Pill tone="accent">Ready to use</Pill> : overdue ? <Pill tone="warning">Past due</Pill> : null}
                </div>
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{fund.completed_at ? "Balance after payment" : "Saved so far"}</p>
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><span className="text-2xl font-semibold tracking-tight"><Money value={saved} /></span><span className="text-xs text-muted-foreground">{fund.completed_at ? "Target" : "of"} <Money value={target} /></span></div>
                  {!hidden && !fund.completed_at && <><div role="progressbar" aria-label={`${fund.name} savings progress`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: `${pct}%` }} /></div><p className="mt-2 text-right text-xs font-medium text-on-tint">{pct}% funded</p></>}
                  <p className="mt-2 text-sm text-muted-foreground">{fund.completed_at ? "Balance left after payment: " : "Remaining: "}<Money value={fund.completed_at ? saved : Math.max(0, target - saved)} /></p>
                </div>
                {fund.due_date && <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{fund.frequency === "once" ? "Target date" : "Next payment"}: {formatDate(fund.due_date)}</p>}
                {fund.notes && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{fund.notes}</p>}
                {!fund.completed_at && <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <Button variant="outline" className="rounded-full" onClick={() => setPanel({ kind: "add", fund })}><Plus className="mr-2 h-4 w-4" />Add savings</Button>
                  <Button variant="ghost" className="rounded-full" disabled={!ready} onClick={() => setPanel({ kind: "pay", fund })}>
                    {fund.frequency !== "once" && <Repeat2 className="mr-2 h-4 w-4" />}Record payment
                  </Button>
                </div>}
              </article>;
            })}
          </div>
        )}
        </div>
        <p className="text-center text-xs text-muted-foreground">Private to hub admins · Manual savings records · No money is moved</p>
      </>}
      {panel && <FundPanel panel={panel} onClose={() => setPanel(null)} />}
    </div>
  );
}

function FundPanel({ panel, onClose }: { panel: Panel; onClose: () => void }) {
  const fund = "fund" in panel ? panel.fund : undefined;
  const [name, setName] = useState(fund?.name ?? "");
  const [category, setCategory] = useState(fund?.category ?? "Other");
  const [target, setTarget] = useState(fund ? String(fund.target_amount) : "");
  const [amount, setAmount] = useState(panel.kind === "new" ? "0" : "");
  const [frequency, setFrequency] = useState(fund?.frequency ?? "once");
  const [priority, setPriority] = useState(fund?.priority ?? "medium");
  const [due, setDue] = useState(fund?.due_date ?? "");
  const [notes, setNotes] = useState(fund?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const action = useFundAction();
  const editing = panel.kind === "new" || panel.kind === "edit";
  const titles = { new: "New business fund", edit: "Edit fund", add: "Add savings", pay: "Record payment", delete: "Delete fund" };

  const submit = async () => {
    setError(null);
    try {
      if (panel.kind === "new" || panel.kind === "edit") {
        const targetAmount = parseFundAmount(target);
        const opening = panel.kind === "new" ? parseFundAmount(amount) : 0;
        if (!name.trim() || name.trim().length > 120) throw new Error("Enter a fund name of up to 120 characters.");
        if (targetAmount === null || targetAmount <= 0) throw new Error("Enter a positive target amount with up to two decimal places.");
        if (opening === null) throw new Error("Enter valid opening savings (zero or more), with up to two decimal places.");
        if (frequency !== "once" && !due) throw new Error("Choose the next payment date for this recurring fund.");
        if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) throw new Error("Choose a valid date.");
        const values: FundValues = { name: name.trim(), category, target_amount: targetAmount, frequency, priority, due_date: due || null, notes: notes.trim() || null };
        await action.mutateAsync({ kind: "save", id: fund?.id, values, opening });
      } else if (panel.kind === "add") {
        const value = parseFundAmount(amount);
        if (value === null || value <= 0) throw new Error("Enter a positive savings amount with up to two decimal places.");
        await action.mutateAsync({ kind: "add", id: panel.fund.id, amount: value });
      } else {
        await action.mutateAsync({ kind: panel.kind, id: panel.fund.id });
      }
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this change. Please try again."); }
  };

  return <FormDialog open onOpenChange={(open) => { if (!open && !action.isPending) onClose(); }} title={titles[panel.kind]}
    description={editing ? "Plan for any business expense. All amounts are in KES." : fund?.name}
    onSubmit={() => void submit()} pending={action.isPending} error={error}
    submitLabel={panel.kind === "delete" ? "Delete fund" : panel.kind === "pay" ? "Confirm payment" : panel.kind === "add" ? "Add savings" : "Save fund"}>
    {editing ? <>
      <Field label="Fund name" htmlFor="fund-name"><Input id="fund-name" autoFocus maxLength={120} className={inputClass} placeholder="e.g. Annual design software" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Category" htmlFor="fund-category"><select id="fund-category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value as BusinessFund["category"])}>{FUND_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Target amount" htmlFor="fund-target" hint="For recurring funds, enter the cost of one payment."><MoneyInput id="fund-target" value={target} onChange={setTarget} /></Field>
      {panel.kind === "new" && <Field label="Already saved" htmlFor="fund-opening"><MoneyInput id="fund-opening" value={amount} onChange={setAmount} /></Field>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Schedule" htmlFor="fund-frequency"><select id="fund-frequency" className={selectClass} value={frequency} onChange={(e) => setFrequency(e.target.value as BusinessFund["frequency"])}>{Object.entries(FUND_FREQUENCIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        <Field label="Priority" htmlFor="fund-priority"><select id="fund-priority" className={selectClass} value={priority} onChange={(e) => setPriority(e.target.value as BusinessFund["priority"])}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></Field>
      </div>
      <Field label={frequency === "once" ? "Target date (optional)" : "Next payment date"} htmlFor="fund-date"><Input id="fund-date" type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} /></Field>
      <Field label="Notes (optional)" htmlFor="fund-notes"><Textarea id="fund-notes" className="rounded-xl" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What are you saving for?" /></Field>
    </> : panel.kind === "add" ? <Field label="Amount to add" htmlFor="fund-add"><MoneyInput id="fund-add" value={amount} onChange={setAmount} /></Field>
      : panel.kind === "delete" ? <p className="text-sm">Delete this fund and its saved balance from your records? This cannot be undone.</p>
      : <div className="space-y-3 text-sm"><p>Record a payment of <Money value={fund?.target_amount} /> from this fund.</p><p className="text-muted-foreground">{fund?.frequency === "once" ? "The fund will be marked completed. Any surplus stays visible in the completed fund." : "The next payment date will move forward by one billing period. Any surplus carries into the next cycle."} This does not create an expense in Finance.</p></div>}
  </FormDialog>;
}
