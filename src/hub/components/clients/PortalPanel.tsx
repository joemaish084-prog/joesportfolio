import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { Check, Copy, Eye, Loader2, Mail, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useDeleteRow, useRows, useSaveRow } from "../../lib/data";
import { unwrap } from "../../lib/queries";
import {
  PORTAL_MODULES,
  type Client,
  type ClientPortalSettings,
  type MilestoneStatus,
  type PortalModuleId,
} from "../../lib/types";

// Everything that controls one client's portal: who can sign in, which
// sections they see, what you've shared, their roadmap and notes, and the
// questions they've sent. The client never sees any of this screen.

// The shared client, untyped: portal_* functions and client_portal_settings
// aren't in the hub's table typings.
const raw = supabase as unknown as {
  from: (t: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  rpc: (n: string, a?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
  functions: { invoke: (n: string, o: { body: unknown }) => Promise<{ data: unknown; error: { message: string } | null }> };
};

const portalUrl = () => `${window.location.origin}/portal`;

function Card({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="hub-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const rel = (iso: string | null) => (iso ? `${formatDistanceToNowStrict(parseISO(iso))} ago` : "never");

// ---------------------------------------------------------------- access

function AccessCard({ client }: { client: Client }) {
  const users = useRows("client_users");
  const remove = useDeleteRow("client_users");
  const qc = useQueryClient();
  const [email, setEmail] = useState(client.email ?? "");
  const [name, setName] = useState(client.contact_person ?? "");

  const mine = (users.data ?? []).filter((u) => u.client_id === client.id);

  const invite = useMutation({
    mutationFn: async () => {
      const body = { client_id: client.id, email: email.trim(), full_name: name.trim() || null };
      const res = await raw.functions.invoke("portal-invite", { body });
      if (!res.error) return (res.data as { status: "invited" | "linked" }).status;
      // The invite function isn't deployed yet: link by email instead. The person
      // needs an account made in Supabase (Authentication > Users) first.
      const fallback = await raw.rpc("portal_link_user", { p_client_id: client.id, p_email: body.email, p_full_name: body.full_name });
      if (fallback.error) throw new Error(fallback.error.message);
      return (fallback.data as { linked: boolean }).linked ? "linked" : "pending";
    },
    onSuccess: (status) => {
      void qc.invalidateQueries({ queryKey: ["hub", "client_users"] });
      setEmail("");
      setName("");
      toast.success(
        status === "invited"
          ? "Invite email sent."
          : status === "linked"
            ? "Access granted. They can sign in with an email link."
            : "Saved, but they have no account yet. Create one in Supabase, then add them again.",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const message = `Hi ${client.contact_person?.split(" ")[0] ?? "there"}, your client portal is ready: ${portalUrl()}\n\nOpen the link, enter your email (${mine[0]?.email ?? "the one I have for you"}) and choose "Email me a link". You'll see your results, reports, invoices and files in one place.`;

  return (
    <Card
      title="Who can sign in"
      hint="Only people listed here can open this client's portal."
      action={
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <a href={`/portal?preview=${client.id}`} target="_blank" rel="noreferrer">
            <Eye className="mr-1.5 h-4 w-4" /> Preview as client
          </a>
        </Button>
      }
    >
      {mine.length > 0 && (
        <ul className="mb-4 divide-y divide-border/60 rounded-2xl border border-border/70">
          {mine.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.full_name || u.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {u.full_name && `${u.email} · `}
                  {u.user_id ? `last seen ${rel(u.last_seen_at)}` : "waiting for an account"}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  u.user_id ? "bg-tint text-on-tint" : "bg-secondary text-muted-foreground",
                )}
              >
                {u.user_id ? "Active" : "Pending"}
              </span>
              <button
                type="button"
                aria-label={`Remove ${u.email}`}
                onClick={() => {
                  if (window.confirm(`Remove ${u.email}? They will no longer be able to open the portal.`)) remove.mutate(u.id);
                }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          invite.mutate();
        }}
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <div>
          <Label htmlFor="portal-invite-email" className="hub-label">
            Email
          </Label>
          <Input id="portal-invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-10 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="portal-invite-name" className="hub-label">
            Name (optional)
          </Label>
          <Input id="portal-invite-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-10 rounded-xl" />
        </div>
        <Button type="submit" disabled={invite.isPending || !email.includes("@")} className="self-end rounded-xl">
          {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="mr-1.5 h-4 w-4" />} Invite
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4" />
        <span>Message to send them:</span>
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(message).then(() => toast.success("Copied. Paste it into WhatsApp or email."))}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <Copy className="h-3.5 w-3.5" /> Copy invite message
        </button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- settings

function SettingsCard({ client }: { client: Client }) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["hub", "client_portal_settings", client.id],
    queryFn: async () =>
      unwrap(await raw.from("client_portal_settings").select("*").eq("client_id", client.id).maybeSingle()) as ClientPortalSettings | null,
  });
  const defaults: PortalModuleId[] = PORTAL_MODULES.map((m) => m.id);
  const saved = query.data;
  const [modules, setModules] = useState<PortalModuleId[] | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [call, setCall] = useState<string | null>(null);

  const current = modules ?? saved?.modules ?? defaults;
  const isEnabled = enabled ?? saved?.enabled ?? true;
  const welcomeText = welcome ?? saved?.welcome_message ?? "";
  const callText = call ?? saved?.call_link ?? "";

  const save = useMutation({
    mutationFn: async () => {
      unwrap(
        await raw.from("client_portal_settings").upsert({
          client_id: client.id,
          enabled: isEnabled,
          modules: PORTAL_MODULES.filter((m) => ("locked" in m && m.locked) || current.includes(m.id)).map((m) => m.id),
          welcome_message: welcomeText.trim() || null,
          call_link: callText.trim() || null,
        }),
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["hub", "client_portal_settings", client.id] });
      toast.success("Portal settings saved.");
    },
    onError: () => toast.error("Couldn't save the settings."),
  });

  return (
    <Card title="What they see" hint="Switch sections on or off for this client. Overview and Help are always on.">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PORTAL_MODULES.map((m) => (
          <label
            key={m.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 px-3.5 py-2.5 text-sm",
              "locked" in m && m.locked && "cursor-not-allowed opacity-60",
            )}
          >
            <Checkbox
              checked={current.includes(m.id)}
              disabled={"locked" in m && m.locked}
              onCheckedChange={(v) => setModules(v ? [...current, m.id] : current.filter((x) => x !== m.id))}
            />
            {m.label}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="portal-welcome" className="hub-label">
            Welcome message (shown in their first-visit tour)
          </Label>
          <Textarea id="portal-welcome" rows={2} value={welcomeText} onChange={(e) => setWelcome(e.target.value)} className="mt-1 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="portal-call" className="hub-label">
            Cal.com link for “Book a call”
          </Label>
          <Input
            id="portal-call"
            value={callText}
            onChange={(e) => setCall(e.target.value)}
            placeholder="your-name/strategy-call"
            className="mt-1 h-10 rounded-xl"
          />
        </div>
        <label className="flex items-center gap-3 self-end rounded-xl border border-border/70 px-3.5 py-2.5 text-sm">
          <Checkbox checked={isEnabled} onCheckedChange={(v) => setEnabled(v === true)} />
          Portal open for this client
        </label>
      </div>

      <Button onClick={() => save.mutate()} disabled={save.isPending} className="mt-5 rounded-xl">
        {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />} Save settings
      </Button>
    </Card>
  );
}

// ---------------------------------------------------------------- sharing

type Shareable = { id: string; title: string; sub: string; shared: boolean };

function ShareList({ items, onToggle, onAll, empty }: { items: Shareable[]; onToggle: (id: string, v: boolean) => void; onAll: (v: boolean) => void; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const shared = items.filter((i) => i.shared).length;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {shared} of {items.length} shared
        </span>
        <span className="flex gap-3">
          <button type="button" onClick={() => onAll(true)} className="font-medium text-primary hover:underline">
            Share all
          </button>
          <button type="button" onClick={() => onAll(false)} className="font-medium hover:underline">
            Hide all
          </button>
        </span>
      </div>
      <ul className="max-h-72 divide-y divide-border/60 overflow-y-auto rounded-2xl border border-border/70">
        {items.map((i) => (
          <li key={i.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 hover:bg-secondary/50">
              <Checkbox checked={i.shared} onCheckedChange={(v) => onToggle(i.id, v === true)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{i.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{i.sub}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SharingCard({ client }: { client: Client }) {
  const reports = useRows("reports", "period_end");
  const documents = useRows("documents");
  const work = useRows("work_log", "worked_on");
  const saveReport = useSaveRow("reports");
  const saveDoc = useSaveRow("documents");
  const saveWork = useSaveRow("work_log");

  const reportItems: Shareable[] = (reports.data ?? [])
    .filter((r) => r.client_id === client.id)
    .map((r) => ({ id: r.id, title: r.title, sub: `${format(parseISO(r.period_start), "d MMM")} to ${format(parseISO(r.period_end), "d MMM yyyy")}`, shared: r.client_visible }));
  const docItems: Shareable[] = (documents.data ?? [])
    .filter((d) => d.client_id === client.id && !d.is_template)
    .map((d) => ({ id: d.id, title: d.title, sub: `${d.kind} · ${format(parseISO(d.created_at), "d MMM yyyy")}`, shared: d.client_visible }));
  const workItems: Shareable[] = (work.data ?? [])
    .filter((w) => w.client_id === client.id)
    .map((w) => ({ id: w.id, title: w.title, sub: `${w.category} · ${format(parseISO(w.worked_on), "d MMM yyyy")}`, shared: w.client_visible }));

  const bulk = (items: Shareable[], save: { mutateAsync: (a: { id: string; values: { client_visible: boolean } }) => Promise<unknown> }) => async (v: boolean) => {
    try {
      await Promise.all(items.filter((i) => i.shared !== v).map((i) => save.mutateAsync({ id: i.id, values: { client_visible: v } })));
      toast.success(v ? "Shared with the client." : "Hidden from the client.");
    } catch {
      toast.error("Couldn't update everything. Try again.");
    }
  };

  return (
    <Card
      title="What you share"
      hint="Nothing reaches the client until you tick it here. Work minutes, notes and expenses are never shown, whatever you tick."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Reports</h4>
          <ShareList
            items={reportItems}
            empty="No reports for this client yet."
            onToggle={(id, v) => saveReport.mutate({ id, values: { client_visible: v } })}
            onAll={bulk(reportItems, saveReport)}
          />
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Documents</h4>
          <ShareList
            items={docItems}
            empty="No documents for this client yet."
            onToggle={(id, v) => saveDoc.mutate({ id, values: { client_visible: v } })}
            onAll={bulk(docItems, saveDoc)}
          />
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Work done</h4>
          <ShareList
            items={workItems}
            empty="No work logged for this client yet."
            onToggle={(id, v) => saveWork.mutate({ id, values: { client_visible: v } })}
            onAll={bulk(workItems, saveWork)}
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        A published report's PDF opens for the client automatically. Invoices show once they're marked as sent.
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------- roadmap

const STATUS_LABEL: Record<MilestoneStatus, string> = { planned: "Planned", in_progress: "In progress", done: "Done" };
const selectClass = "h-10 rounded-xl border border-input bg-background px-3 text-sm";

function RoadmapCard({ client }: { client: Client }) {
  const rows = useRows("client_milestones", "sort_order", true);
  const save = useSaveRow("client_milestones");
  const del = useDeleteRow("client_milestones");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const mine = (rows.data ?? []).filter((m) => m.client_id === client.id);

  const add = () =>
    save.mutate(
      { values: { client_id: client.id, title: title.trim(), due_date: due || null, sort_order: (mine.at(-1)?.sort_order ?? 0) + 10 } },
      { onSuccess: () => { setTitle(""); setDue(""); }, onError: () => toast.error("Couldn't add that milestone.") },
    );

  return (
    <Card title="Roadmap" hint="Milestones the client sees under Roadmap. Update the status as work moves.">
      {mine.length > 0 && (
        <ul className="mb-4 divide-y divide-border/60 rounded-2xl border border-border/70">
          {mine.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-3.5 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{m.title}</span>
                {m.due_date && <span className="text-xs text-muted-foreground">Target {format(parseISO(m.due_date), "d MMM yyyy")}</span>}
              </span>
              <select
                aria-label={`Status of ${m.title}`}
                value={m.status}
                onChange={(e) => save.mutate({ id: m.id, values: { status: e.target.value as MilestoneStatus } })}
                className={selectClass}
              >
                {(Object.keys(STATUS_LABEL) as MilestoneStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button type="button" aria-label={`Delete ${m.title}`} onClick={() => del.mutate(m.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="grid gap-3 sm:grid-cols-[1fr_11rem_auto]"
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New milestone, e.g. Festive campaign live" aria-label="Milestone title" className="h-10 rounded-xl" />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Target date" className="h-10 rounded-xl" />
        <Button type="submit" disabled={!title.trim() || save.isPending} className="rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" /> Add
        </Button>
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------- updates

function UpdatesCard({ client }: { client: Client }) {
  const rows = useRows("client_updates");
  const save = useSaveRow("client_updates");
  const del = useDeleteRow("client_updates");
  const [kind, setKind] = useState<"update" | "action">("update");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const mine = (rows.data ?? []).filter((u) => u.client_id === client.id);

  return (
    <Card title="Notes and requests" hint="An update appears under “From us”. An action shows as “Needs your attention” until the client ticks it off.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(
            { values: { client_id: client.id, kind, title: title.trim(), body: body.trim() || null } },
            { onSuccess: () => { setTitle(""); setBody(""); toast.success("Posted to the client's portal."); }, onError: () => toast.error("Couldn't post that.") },
          );
        }}
        className="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <select value={kind} onChange={(e) => setKind(e.target.value as "update" | "action")} aria-label="Type" className={selectClass}>
            <option value="update">Update</option>
            <option value="action">Needs their action</option>
          </select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" className="h-10 rounded-xl" />
        </div>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Details (optional)" aria-label="Details" className="rounded-xl" />
        <Button type="submit" disabled={!title.trim() || save.isPending} className="rounded-xl">
          <Send className="mr-1.5 h-4 w-4" /> Post to portal
        </Button>
      </form>

      {mine.length > 0 && (
        <ul className="mt-5 divide-y divide-border/60 rounded-2xl border border-border/70">
          {mine.slice(0, 12).map((u) => (
            <li key={u.id} className="flex items-start gap-3 px-3.5 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{u.title}</span>
                <span className="text-xs text-muted-foreground">
                  {u.kind === "action" ? (u.resolved_at ? `Done ${rel(u.resolved_at)}` : "Waiting on the client") : "Update"} · {rel(u.created_at)}
                </span>
              </span>
              <button type="button" aria-label={`Delete ${u.title}`} onClick={() => del.mutate(u.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------- inbox

function InboxCard({ client }: { client: Client }) {
  const rows = useRows("client_messages");
  const save = useSaveRow("client_messages");
  const mine = (rows.data ?? []).filter((m) => m.client_id === client.id);
  if (mine.length === 0) {
    return (
      <Card title="Messages from the client" hint="Questions and requests sent from their Help page land here.">
        <p className="text-sm text-muted-foreground">Nothing yet.</p>
      </Card>
    );
  }
  return (
    <Card title="Messages from the client" hint="Reply by email, then mark them answered so the client sees it.">
      <ul className="space-y-3">
        {mine.map((m) => (
          <li key={m.id} className={cn("rounded-2xl border p-4", m.status === "new" ? "border-primary/40 bg-tint/40" : "border-border/70")}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{m.subject}</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{m.kind}</span>
              <span className="text-xs text-muted-foreground">{rel(m.created_at)}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <a href={`mailto:${client.email ?? ""}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Reply by email
                </a>
              </Button>
              {m.status !== "read" && m.status !== "done" && (
                <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => save.mutate({ id: m.id, values: { status: "read" } })}>
                  Mark seen
                </Button>
              )}
              {m.status !== "done" && (
                <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => save.mutate({ id: m.id, values: { status: "done" } })}>
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Mark answered
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------- panel

export function PortalPanel({ client }: { client: Client }) {
  return (
    <div className="space-y-5">
      <AccessCard client={client} />
      <SettingsCard client={client} />
      <SharingCard client={client} />
      <div className="grid gap-5 xl:grid-cols-2">
        <RoadmapCard client={client} />
        <UpdatesCard client={client} />
      </div>
      <InboxCard client={client} />
    </div>
  );
}
