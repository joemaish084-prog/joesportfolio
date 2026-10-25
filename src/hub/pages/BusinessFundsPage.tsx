import { useState } from "react";
import { CheckCircle2, Pencil, PiggyBank, Plus, Repeat2, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormDialog, inputClass, MoneyInput } from "../components/form";
import { Money } from "../components/privacy";
import { EmptyState, PageHeader, Pill, SkeletonBlock, StatTile } from "../components/ui";
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
  const active = funds.filter((f) => !f.completed_at);
  const totalSaved = active.reduce((sum, f) => sum + Number(f.saved_amount), 0);
  const remaining = active.reduce((sum, f) => sum + Math.max(0, Number(f.target_amount) - Number(f.saved_amount)), 0);
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
      <PageHeader title="Business Funds" subtitle="Set money aside for the things that keep your business moving."
        actions={<Button className="rounded-full" disabled={!available} onClick={() => setPanel({ kind: "new" })}><Plus className="mr-2 h-4 w-4" />New fund</Button>} />
      <p className="text-sm text-muted-foreground">Private to hub admins. Track money you set aside manually; recording savings or payments here does not move money.</p>
      {query.isPending ? <SkeletonBlock className="h-64" /> : query.isError ? (
        <div role="alert" className="hub-card space-y-3 p-6"><p>Could not load your funds. Please try again.</p><Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></div>
      ) : query.data?.missing ? (
        <EmptyState icon={PiggyBank} title="Business Funds needs setup" description="The Business Funds database update needs to be applied before you can save your goals." />
      ) : <>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Set aside" icon={PiggyBank} hint="Across active funds"><Money value={totalSaved} /></StatTile>
          <StatTile label="Still to save" icon={Wallet} hint="Remaining to reach your targets"><Money value={remaining} /></StatTile>
          <StatTile label="Ready to use" icon={CheckCircle2} hint={`${active.length} active ${active.length === 1 ? "fund" : "funds"}`}>
            {active.filter((f) => Number(f.saved_amount) >= Number(f.target_amount)).length}
          </StatTile>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input aria-label="Search funds" placeholder="Search funds…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 max-w-sm rounded-xl" />
          <select aria-label="Fund status" className={`${selectClass} !w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="active">Active funds</option><option value="completed">Completed funds</option><option value="all">All funds</option>
          </select>
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
              return <article key={fund.id} className="hub-card flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="break-words text-lg font-semibold">{fund.name}</h2><p className="mt-1 text-sm text-muted-foreground">{fund.category} · {FUND_FREQUENCIES[fund.frequency]}</p></div>
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
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><span className="text-xl font-semibold"><Money value={saved} /></span><span className="text-sm text-muted-foreground">of <Money value={target} /></span></div>
                  {!hidden && <><div role="progressbar" aria-label={`${fund.name} savings progress`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{pct}% saved</p></>}
                  <p className="mt-2 text-sm text-muted-foreground">{fund.completed_at ? "Balance left after payment: " : "Remaining: "}<Money value={fund.completed_at ? saved : Math.max(0, target - saved)} /></p>
                </div>
                {fund.due_date && <p className="text-sm text-muted-foreground">{fund.frequency === "once" ? "Target date" : "Next payment"}: {formatDate(fund.due_date)}</p>}
                {fund.notes && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{fund.notes}</p>}
                {!fund.completed_at && <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Button variant="outline" className="rounded-full" onClick={() => setPanel({ kind: "add", fund })}><Plus className="mr-2 h-4 w-4" />Add savings</Button>
                  <Button variant="ghost" className="rounded-full" disabled={!ready} onClick={() => setPanel({ kind: "pay", fund })}>
                    {fund.frequency !== "once" && <Repeat2 className="mr-2 h-4 w-4" />}Record payment
                  </Button>
                </div>}
              </article>;
            })}
          </div>
        )}
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
