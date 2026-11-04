import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useHubAuth } from "../auth/HubAuthProvider";
import { Field, inputClass } from "../components/form";
import { PageHeader, SkeletonBlock } from "../components/ui";
import { db } from "../lib/db";
import { useKes } from "../lib/privacy";
import { hubKeys, unwrap, useClients } from "../lib/queries";
import { agencyDate, eligibleTimeClient, timeRange, timeSummary, type ClientTimeRow, type TimePeriod, type TimeStatus } from "../lib/time";
import { useSaveTime, useTimeAccess, useTimeActions, useTimeData } from "../lib/timeQueries";
import type { Client } from "../lib/types";
import { usePersonalTimer } from "../lib/usePersonalTimer";

const number = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 1 });
const mono = "font-mono tabular-nums";
const neutralButton = "rounded-xl bg-foreground text-background hover:bg-foreground/85";
const selectClass = "h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const errorMessage = "Could not save. Check your connection and access, then try again.";

function Card({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return <section className="hub-card min-w-0 space-y-4 p-5 sm:p-6">
    <div><h2 className="font-semibold">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
    {children}
  </section>;
}

function ClientSelect({ id, clients, value, onChange, disabled }: {
  id: string; clients: Client[]; value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  return <select id={id} className={selectClass} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} required>
    <option value="">Choose a client</option>
    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
  </select>;
}

export default function TimePage() {
  const access = useTimeAccess();
  const { session } = useHubAuth();
  if (access.isPending) return <SkeletonBlock className="h-72" />;
  if (access.isError) return <Card title="Time tracking is unavailable">
    <p className="text-sm text-muted-foreground">The private time database may need its migration applied, or your connection needs another try.</p>
    <Button variant="outline" onClick={() => void access.refetch()}>Try again</Button>
  </Card>;
  if (!access.data) return <Card title="Private page"><p className="text-sm text-muted-foreground">This page is only available to its designated account.</p><Button variant="outline" asChild><Link to="/hub">Back to overview</Link></Button></Card>;
  return <TimeDashboard key={session!.user.id} userId={session!.user.id} />;
}

export function TimeDashboard({ userId }: { userId: string }) {
  const [period, setPeriod] = useState<TimePeriod>("week");
  const kes = useKes();
  const timer = usePersonalTimer(userId);
  const today = agencyDate(new Date(timer.now));
  const range = timeRange(period, today);
  const clients = useClients();
  const data = useTimeData(range.start, range.end);
  const queries = [clients, data.settings, data.preferences, data.entries, data.recent];
  if (queries.some((query) => query.isError)) return <Card title="Could not load time tracking">
    <p className="text-sm text-muted-foreground">Check your connection and access, then reload your data. Any browser timer is kept.</p>
    <Button variant="outline" onClick={() => void Promise.all(queries.map((query) => query.refetch()))}>Try again</Button>
  </Card>;
  if (queries.some((query) => query.isPending)) return <div className="space-y-5"><SkeletonBlock className="h-14" /><SkeletonBlock className="h-64" /><SkeletonBlock className="h-80" /></div>;

  const allClients = clients.data!;
  const archived = new Set(data.preferences.data!.filter((pref) => pref.archived).map((pref) => pref.client_id));
  const available = allClients.filter((client) => eligibleTimeClient(client, today) && !archived.has(client.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  const summary = timeSummary(allClients, data.entries.data!, data.preferences.data!, Number(data.settings.data!.weekly_agency_hours), period, today);
  const worst = summary.worst;
  return <div className="hub-time mx-auto max-w-5xl space-y-6">
    <PageHeader title="Time & value" subtitle="Client Hub · Your personal hours against agency fees" actions={
      <div role="group" aria-label="Reporting period" className="flex rounded-xl bg-secondary p-1">
        {(["week", "month"] as const).map((value) => <Button key={value} size="sm" variant="ghost" aria-pressed={period === value}
          className={cn("rounded-lg", period === value && "bg-background shadow-sm")} onClick={() => setPeriod(value)}>
          {value === "week" ? "This week" : "This month"}
        </Button>)}
      </div>
    } />
    <p className="text-xs text-muted-foreground">{range.start} – {range.end} · through today · Nairobi time · weeks start Monday</p>
    {summary.totalMinutes > 0 && <p className="rounded-xl border border-border p-4 text-sm leading-relaxed" aria-live="polite">
      {summary.totalFees === 0 ? "Add monthly service fees to compare your hours with what clients pay."
        : worst ? <><strong>{worst.client.name}</strong> took <span className={mono}>{number.format(worst.timeShare * 100)}%</span> of your hours but brings in <span className={mono}>{number.format(worst.feeShare * 100)}%</span> of your agency fees. {worst.rate === null ? "Set a monthly fee to calculate their effective revenue rate." : <>That client earns you <span className={mono}>{kes(worst.rate)}</span> per hour.</>}</>
          : "Your logged hours roughly follow what clients pay."}
    </p>}
    <TrackTime clients={available} allClients={allClients} timer={timer} />
    <Card title="Clients" description="Allocated hours follow each client’s share of monthly service fees. Every bar uses the same scale; the vertical marker shows the allocation.">
      {summary.rows.length === 0 ? <p className="py-5 text-sm text-muted-foreground">No active monthly clients yet. Add one below to begin.</p>
        : <div className="divide-y divide-border">{summary.rows.map((row) => <ClientBudget key={row.client.id} row={row} scale={summary.scale} archived={archived.has(row.client.id) || !eligibleTimeClient(row.client, today)} />)}</div>}
      <p className="text-xs text-muted-foreground">KES/hour is prorated service revenue divided by logged hours, before expenses. “Under” may mean efficient work or missing time. Comparisons use current fees.</p>
    </Card>
    <ForgotTime clients={available} allClients={allClients} today={today} entries={data.recent.data!} />
    <ClientHours clients={allClients} available={available} archived={archived}
      weeklyHours={Number(data.settings.data!.weekly_agency_hours)} runningClient={timer.timer?.clientId} today={today} />
  </div>;
}

function TrackTime({ clients, allClients, timer }: {
  clients: Client[]; allClients: Client[]; timer: ReturnType<typeof usePersonalTimer>;
}) {
  const [clientId, setClientId] = useState("");
  const [note, setNote] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const save = useSaveTime();
  const running = timer.timer;
  const name = allClients.find((c) => c.id === running?.clientId)?.name ?? "Saved client";
  return <Card title="Track time" description="One timer in this browser. It survives refreshes and time spent elsewhere in the hub.">
    {running ? <div className="space-y-1"><p className="break-words font-medium">{name}</p>{running.note && <p className="break-words text-sm text-muted-foreground">{running.note}</p>}</div>
      : <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client" htmlFor="timer-client"><ClientSelect id="timer-client" clients={clients} value={clientId} onChange={setClientId} disabled={timer.busy} /></Field>
        <Field label="What are you working on?" htmlFor="timer-note"><Input id="timer-note" className={inputClass} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} disabled={timer.busy} placeholder="Optional note" /></Field>
      </div>}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <output aria-label="Elapsed time" aria-live="off" className={cn(mono, "text-4xl tracking-tight sm:text-5xl")}>{timer.clock}</output>
      <Button variant="secondary" className={cn(neutralButton, "h-11 gap-2")} disabled={!timer.ready || timer.busy || save.isPending || (!running && (!clients.some((c) => c.id === clientId) || !!timer.error))}
        onClick={() => running ? void timer.stopAndSave(async (draft) => { await save.mutateAsync(draft); toast.success("Time saved"); }) : void timer.start(clientId, note)}>
        {running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {timer.busy ? "Saving…" : running?.stoppedAt ? "Retry save" : running ? "Stop and save" : "Start"}
      </Button>
    </div>
    {running && <p className="text-xs text-muted-foreground">{running.stoppedAt ? "Stopped. Your elapsed time is kept until saving succeeds." : "Running even when this page is closed."} Time is rounded to the nearest minute (minimum 1), dated {agencyDate(new Date(running.startedAt))}, when you started.</p>}
    {timer.error && <p role="alert" className="rounded-lg border border-border p-3 text-sm">Could not complete the timer action. {running?.stoppedAt ? "Your stopped timer is kept; retry saving. " : ""}{timer.error}</p>}
    {(running || timer.error) && <div className="flex flex-wrap items-center gap-2">
      {confirmDiscard ? <><span className="text-xs text-muted-foreground">Discard the browser timer?</span><Button size="sm" variant="outline" disabled={timer.busy} onClick={() => { void timer.discard(); setConfirmDiscard(false); }}>Confirm discard</Button><Button size="sm" variant="ghost" onClick={() => setConfirmDiscard(false)}>Cancel</Button></>
        : <Button size="sm" variant="ghost" disabled={timer.busy} onClick={() => setConfirmDiscard(true)}>Discard timer</Button>}
    </div>}
    {!clients.length && !running && <p className="text-sm text-muted-foreground">Add or restore an active KES monthly client below to start tracking.</p>}
  </Card>;
}

const statusClass: Record<TimeStatus, string> = {
  "No time yet": "bg-secondary text-muted-foreground",
  "No fee set": "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  "Under": "bg-secondary text-muted-foreground",
  "On track": "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
  "Over time": "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  "Outside comparison": "bg-secondary text-muted-foreground",
};

function ClientBudget({ row, scale, archived }: { row: ClientTimeRow; scale: number; archived: boolean }) {
  const kes = useKes();
  return <div className="space-y-3 py-5 first:pt-0 last:pb-0">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0"><p className="break-words font-medium">{row.client.name}{archived && <span className="ml-2 text-xs font-normal text-muted-foreground">History only</span>}</p>
        <p className={cn(mono, "mt-1 text-xs text-muted-foreground")}>{row.comparable ? `${kes(Number(row.client.monthly_fee ?? 0))}/month` : "Outside monthly KES comparison"}</p></div>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", statusClass[row.status])}>{row.status}</span>
    </div>
    <div role="img" aria-label={`${number.format(row.hours)} hours used; ${number.format(row.fair)} hours allocated`} className="relative h-3 rounded-full bg-secondary">
      <div className="h-full rounded-full bg-foreground/35" style={{ width: `${row.hours / scale * 100}%` }} />
      <span className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 rounded bg-black dark:bg-white" style={{ left: `${Math.max(0.3, Math.min(99.7, row.fair / scale * 100))}%` }} />
    </div>
    <div className={cn(mono, "flex flex-wrap justify-between gap-2 text-xs")}>
      <span>{number.format(row.hours)} h used / {row.comparable ? number.format(row.fair) : "—"} h allocated</span>
      <span className="text-muted-foreground">{row.rate === null ? "— KES/hour" : `${kes(row.rate)}/hour`}</span>
    </div>
  </div>;
}

function ForgotTime({ clients, allClients, today, entries }: {
  clients: Client[]; allClients: Client[]; today: string; entries: import("../lib/time").TimeEntry[];
}) {
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(today);
  const [minutes, setMinutes] = useState("30");
  const [note, setNote] = useState("");
  const [entryId, setEntryId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const save = useSaveTime();
  const actions = useTimeActions();
  const change = (setter: (value: string) => void, value: string) => { setter(value); setEntryId(crypto.randomUUID()); setError(null); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!Number.isInteger(Number(minutes)) || Number(minutes) <= 0 || Number(minutes) > 525600 || !date || date > today) return setError("Use a past or current date and a positive whole number of minutes.");
    if (!clients.some((c) => c.id === clientId)) return setError("Choose an active monthly client.");
    try {
      await save.mutateAsync({ id: entryId, client_id: clientId, minutes: Number(minutes), note, entry_date: date });
      setNote(""); setEntryId(crypto.randomUUID()); setError(null); toast.success("Time saved");
    } catch { setError(errorMessage + " Your form is kept; retry the same entry safely."); }
  };
  return <Card title="Log time you forgot">
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <fieldset disabled={save.isPending} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Client" htmlFor="manual-client"><ClientSelect id="manual-client" clients={clients} value={clientId} onChange={(value) => change(setClientId, value)} /></Field>
          <Field label="Date" htmlFor="manual-date"><Input id="manual-date" className={inputClass} type="date" required max={today} value={date} onChange={(e) => change(setDate, e.target.value)} /></Field>
          <Field label="Minutes" htmlFor="manual-minutes"><Input id="manual-minutes" className={cn(inputClass, mono)} type="number" inputMode="numeric" required min="1" max="525600" step="1" value={minutes} onChange={(e) => change(setMinutes, e.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Quick minutes">{[15, 30, 60, 90, 120].map((value) => <Button key={value} type="button" size="sm" variant="outline" aria-pressed={minutes === String(value)} className={cn("rounded-lg font-mono", minutes === String(value) && "bg-secondary")} onClick={() => change(setMinutes, String(value))}>{value} min</Button>)}</div>
        <Field label="Note" htmlFor="manual-note"><Textarea id="manual-note" className="rounded-xl" maxLength={2000} rows={2} value={note} onChange={(e) => change(setNote, e.target.value)} placeholder="Optional note" /></Field>
        <Button variant="secondary" className={neutralButton} type="submit" disabled={!clients.length}>{save.isPending ? "Saving…" : "Save time"}</Button>
      </fieldset>
      {error && <p role="alert" className="text-sm">{error}</p>}
    </form>
    <div className="border-t border-border pt-5">
      <h3 className="mb-2 text-sm font-medium">Last 25 entries <span className="font-normal text-muted-foreground">· all dates</span></h3>
      {!entries.length ? <p className="py-4 text-sm text-muted-foreground">No time logged yet.</p> : <ul className="divide-y divide-border">{entries.map((entry) => <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
        <div className="min-w-0"><p className="break-words text-sm font-medium">{allClients.find((c) => c.id === entry.client_id)?.name ?? "Client"}</p>
          <p className={cn(mono, "mt-1 text-xs text-muted-foreground")}>{entry.entry_date} · {entry.minutes} min</p>{entry.note && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{entry.note}</p>}</div>
        <Button size="sm" variant="ghost" className="shrink-0" disabled={actions.remove.isPending} aria-label={`Delete ${entry.minutes} minute entry on ${entry.entry_date}`}
          onClick={() => actions.remove.mutate(entry.id, { onError: () => toast.error(errorMessage) })}>Delete</Button>
      </li>)}</ul>}
    </div>
  </Card>;
}

function ClientHours({ clients, available, archived, weeklyHours, runningClient, today }: {
  clients: Client[]; available: Client[]; archived: Set<string>; weeklyHours: number; runningClient?: string; today: string;
}) {
  const [hours, setHours] = useState(String(weeklyHours));
  const [confirm, setConfirm] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const kes = useKes();
  const actions = useTimeActions();
  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: async () => unwrap(await db.from("clients").insert({ name: name.trim(), monthly_fee: Number(fee), status: "active", currency: "KES", engagement_type: "retainer" }).select().single()),
    onSuccess: () => { setName(""); setFee(""); void qc.invalidateQueries({ queryKey: hubKeys.clients }); toast.success("Client added"); },
    onError: () => toast.error(errorMessage),
  });
  const managed = clients.filter((client) => available.some((c) => c.id === client.id) || archived.has(client.id));
  const archive = (clientId: string, value: boolean) => actions.archive.mutate({ clientId, archived: value }, {
    onSuccess: () => setConfirm(null), onError: () => toast.error(errorMessage),
  });
  return <Card title="Clients and hours" description="Track active retainers and monthly contracts billed in KES. Project fees and advertising budgets are excluded.">
    <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); actions.hours.mutate(Number(hours), { onSuccess: () => toast.success("Weekly hours saved"), onError: () => toast.error(errorMessage) }); }}>
      <Field label="Your weekly client-work hours" htmlFor="weekly-hours" hint="Capacity for client delivery; default 15 hours."><Input id="weekly-hours" type="number" inputMode="decimal" min="0.01" max="168" step="0.01" required className={cn(inputClass, mono, "w-48 max-w-full")} value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
      <Button type="submit" variant="outline" className="mb-5 rounded-xl" disabled={actions.hours.isPending}>{actions.hours.isPending ? "Saving…" : "Save hours"}</Button>
    </form>
    <div className="divide-y divide-border">{managed.map((client) => <div key={client.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0"><p className="break-words text-sm font-medium">{client.name}</p><p className={cn(mono, "text-xs text-muted-foreground")}>{client.currency === "KES" ? `${kes(Number(client.monthly_fee ?? 0))}/month` : "Outside KES comparison"}{archived.has(client.id) && " · archived from tracking"}</p></div>
      <div className="flex flex-wrap items-center gap-1">
        <Button size="sm" variant="ghost" asChild><Link to={`/hub/clients/${client.id}/edit`}>Edit name & fee</Link></Button>
        {archived.has(client.id) ? <Button size="sm" variant="outline" disabled={actions.archive.isPending || !eligibleTimeClient(client, today)} onClick={() => archive(client.id, false)}>Restore</Button>
          : confirm === client.id ? <><Button size="sm" variant="outline" disabled={actions.archive.isPending} onClick={() => archive(client.id, true)}>Confirm archive</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button></>
            : <Button size="sm" variant="ghost" disabled={runningClient === client.id} title={runningClient === client.id ? "Stop the timer first" : "Hide from new time tracking; preserve history"} onClick={() => setConfirm(client.id)}>Archive</Button>}
      </div>
    </div>)}</div>
    <p className="text-xs text-muted-foreground">Archiving only hides a client from your new time tracking. Their recorded hours stay in the period comparison. Name and fee edits update the shared client record.</p>
    <form className="space-y-4 border-t border-border pt-5" onSubmit={(event) => { event.preventDefault(); if (name.trim() && fee !== "" && Number(fee) >= 0) add.mutate(); }}>
      <h3 className="text-sm font-medium">Add a monthly client</h3>
      <fieldset disabled={add.isPending} className="flex flex-wrap items-end gap-3">
        <Field label="Client name" htmlFor="new-time-client" className="min-w-0 flex-1 basis-48"><Input id="new-time-client" className={inputClass} maxLength={200} required value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Monthly service fee (KES)" htmlFor="new-time-fee" className="min-w-0 flex-1 basis-48"><Input id="new-time-fee" className={cn(inputClass, mono)} type="number" inputMode="decimal" min="0" max="9999999999.99" step="0.01" required value={fee} onChange={(e) => setFee(e.target.value)} /></Field>
        <Button variant="secondary" className={cn(neutralButton, "h-11")} type="submit">{add.isPending ? "Adding…" : "Add client"}</Button>
      </fieldset>
      <p className="text-xs text-muted-foreground">Adds a real client to your shared hub. Manage other clients in <Link className="underline underline-offset-2" to="/hub/clients">Clients</Link>.</p>
    </form>
  </Card>;
}
