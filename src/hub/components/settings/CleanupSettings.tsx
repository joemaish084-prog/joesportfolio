import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle2, FileWarning, GitMerge, Users } from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import { useRows, useSaveRow } from "../../lib/data";
import { emailKey, nameKey, phoneKey } from "../../lib/duplicates";
import { useClients } from "../../lib/queries";
import { useMergeClients } from "../../lib/settings";
import { STATUS_LABEL, type Client } from "../../lib/types";
import { ClientPicker } from "../pickers";
import { EmptyState, SkeletonBlock, StatusBadge } from "../ui";

function useUsage() {
  const invoices = useRows("invoices", "issue_date");
  const payments = useRows("payments", "paid_on");
  const documents = useRows("documents");
  const work = useRows("work_log", "worked_on");
  return (id: string) => ({
    invoices: (invoices.data ?? []).filter((r) => r.client_id === id).length,
    payments: (payments.data ?? []).filter((r) => r.client_id === id).length,
    documents: (documents.data ?? []).filter((r) => r.client_id === id).length,
    work: (work.data ?? []).filter((r) => r.client_id === id).length,
  });
}

function MergeConfirm({ keep, drop, onClose }: { keep: Client | null; drop: Client | null; onClose: () => void }) {
  const merge = useMergeClients();
  return (
    <AlertDialog open={!!keep && !!drop} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Merge into “{keep?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Everything on the other record ({drop ? STATUS_LABEL[drop.status].toLowerCase() : ""}, added{" "}
            {drop ? format(parseISO(drop.created_at), "d MMM yyyy") : ""}) moves across: invoices, payments, documents,
            reports, work log and onboarding. Details the kept record is missing are filled in. The other record is then
            deleted. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full"
            onClick={() =>
              keep &&
              drop &&
              merge.mutate(
                { keep: keep.id, drop: drop.id },
                {
                  onSuccess: () => toast.success(`Merged into ${keep.name}`),
                  onError: (e) =>
                    toast.error(
                      /hub_merge_clients/.test(e.message)
                        ? "Merging needs the phase 3 database update first."
                        : e.message,
                    ),
                },
              )
            }
          >
            Merge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Why a group was flagged, in plain words. */
function reasons(group: Client[]) {
  const shared = (key: (c: Client) => string) => {
    const seen = new Set<string>();
    return group.some((c) => {
      const k = key(c);
      if (!k) return false;
      if (seen.has(k)) return true;
      seen.add(k);
      return false;
    });
  };
  const out = [
    shared((c) => nameKey(c.name)) && "same name",
    shared((c) => phoneKey(c.phone)) && "same phone number",
    shared((c) => emailKey(c.email)) && "same email",
  ].filter(Boolean) as string[];
  const text = out.length ? out.join(", ") : "similar details";
  return text[0].toUpperCase() + text.slice(1);
}

function DuplicateGroup({
  group,
  usage,
  onMerge,
}: {
  group: Client[];
  usage: ReturnType<typeof useUsage>;
  onMerge: (keep: Client, drop: Client) => void;
}) {
  // Suggest keeping the record with the most history, then the oldest.
  const ranked = [...group].sort((a, b) => {
    const ua = usage(a.id);
    const ub = usage(b.id);
    const score = (u: typeof ua) => u.invoices * 3 + u.payments * 3 + u.documents + u.work;
    return score(ub) - score(ua) || a.created_at.localeCompare(b.created_at);
  });
  // Follow the suggestion (which updates as usage data loads) until you pick one yourself.
  const [picked, setKeepId] = useState<string | null>(null);
  const keepId = picked && group.some((c) => c.id === picked) ? picked : ranked[0].id;
  const keep = group.find((c) => c.id === keepId)!;

  return (
    <li className="hub-card p-5">
      <p className="mb-3 text-sm text-muted-foreground">{reasons(group)} · pick the record to keep:</p>
      <ul className="space-y-2">
        {ranked.map((c) => {
          const u = usage(c.id);
          return (
            <li key={c.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-150",
                  keepId === c.id ? "border-primary/50 bg-tint/50" : "border-border/70 hover:bg-secondary/50",
                )}
              >
                <input
                  type="radio"
                  name={`keep-${group[0].id}`}
                  checked={keepId === c.id}
                  onChange={() => setKeepId(c.id)}
                  className="accent-[hsl(var(--primary))]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    Added {format(parseISO(c.created_at), "d MMM yyyy")} · {u.invoices} invoices · {u.payments} payments
                    · {u.documents} documents
                    {c.phone ? ` · ${c.phone}` : ""}
                  </span>
                </span>
                <StatusBadge status={c.status} />
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {group
          .filter((c) => c.id !== keepId)
          .map((c) => (
            <Button key={c.id} size="sm" className="rounded-full" onClick={() => onMerge(keep, c)}>
              <GitMerge className="mr-1.5 h-4 w-4" />
              Merge “{c.name}” in
            </Button>
          ))}
      </div>
    </li>
  );
}

function MisfiledDocuments() {
  const docs = useRows("documents");
  const save = useSaveRow("documents");
  const [target, setTarget] = useState<Record<string, string | null>>({});
  // Invoices and receipts are one-off documents; as templates they're almost always a mistake.
  const misfiled = (docs.data ?? []).filter((d) => d.is_template && (d.kind === "invoice" || d.kind === "receipt"));

  if (!misfiled.length) return null;
  return (
    <section>
      <h2 className="hub-section-title">Invoices saved as templates</h2>
      <ul className="hub-card divide-y divide-border/60">
        {misfiled.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <FileWarning className="h-4 w-4 shrink-0 text-warning" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{d.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{d.file_name}</span>
            </span>
            <ClientPicker
              value={target[d.id] ?? null}
              onChange={(v) => setTarget((t) => ({ ...t, [d.id]: v }))}
              className="h-9 w-48"
              placeholder="Which client?"
            />
            <Button
              size="sm"
              className="rounded-full"
              disabled={!target[d.id] || save.isPending}
              onClick={() =>
                save.mutate(
                  { id: d.id, values: { is_template: false, client_id: target[d.id]!, status: "final" } },
                  {
                    onSuccess: () => toast.success("Moved to the client's documents"),
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              Move
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Finds duplicate clients and misfiled documents, and fixes them. */
export function CleanupSettings() {
  const clients = useClients();
  const usage = useUsage();
  const [pair, setPair] = useState<{ keep: Client; drop: Client } | null>(null);
  const [manualKeep, setManualKeep] = useState<string | null>(null);
  const [manualDrop, setManualDrop] = useState<string | null>(null);

  const groups = useMemo(() => {
    const list = (clients.data ?? []).filter((c) => !c.archived_at);
    // Union clients that share a name, phone or email.
    const parent = new Map(list.map((c) => [c.id, c.id]));
    const find = (id: string): string => (parent.get(id) === id ? id : find(parent.get(id)!));
    const join = (a: string, b: string) => parent.set(find(a), find(b));
    const seen = new Map<string, string>();
    for (const c of list) {
      const keys = [
        `n:${nameKey(c.name)}`,
        c.business_name && `n:${nameKey(c.business_name)}`,
        phoneKey(c.phone) && `p:${phoneKey(c.phone)}`,
        c.email && `e:${emailKey(c.email)}`,
      ].filter((k): k is string => !!k && k.length > 2);
      for (const k of keys) {
        const other = seen.get(k);
        if (other) join(c.id, other);
        else seen.set(k, c.id);
      }
    }
    const byRoot = new Map<string, Client[]>();
    for (const c of list) (byRoot.get(find(c.id)) ?? byRoot.set(find(c.id), []).get(find(c.id))!).push(c);
    return [...byRoot.values()].filter((g) => g.length > 1);
  }, [clients.data]);

  if (clients.isLoading) return <SkeletonBlock className="h-64 rounded-[20px]" />;
  const all = clients.data ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="hub-section-title">Possible duplicate clients</h2>
        {groups.length === 0 ? (
          <div className="hub-card">
            <EmptyState
              icon={CheckCircle2}
              title="No duplicates found"
              description="No two clients share a name, phone number or email."
              className="py-8"
            />
          </div>
        ) : (
          <ul className="space-y-3">
            {groups.map((g) => (
              <DuplicateGroup
                key={g.map((c) => c.id).join()}
                group={g}
                usage={usage}
                onMerge={(keep, drop) => setPair({ keep, drop })}
              />
            ))}
          </ul>
        )}
      </section>

      <MisfiledDocuments />

      <section>
        <h2 className="hub-section-title">Merge any two clients</h2>
        <div className="hub-card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <p className="hub-label mb-1">Keep</p>
            <ClientPicker value={manualKeep} onChange={setManualKeep} />
          </div>
          <div className="flex-1">
            <p className="hub-label mb-1">Merge in and remove</p>
            <ClientPicker value={manualDrop} onChange={setManualDrop} />
          </div>
          <Button
            className="h-11 rounded-full"
            disabled={!manualKeep || !manualDrop || manualKeep === manualDrop}
            onClick={() => {
              const keep = all.find((c) => c.id === manualKeep);
              const drop = all.find((c) => c.id === manualDrop);
              if (keep && drop) setPair({ keep, drop });
            }}
          >
            <Users className="mr-1.5 h-4 w-4" /> Merge
          </Button>
        </div>
      </section>

      <MergeConfirm
        keep={pair?.keep ?? null}
        drop={pair?.drop ?? null}
        onClose={() => {
          setPair(null);
          setManualDrop(null);
        }}
      />
    </div>
  );
}
