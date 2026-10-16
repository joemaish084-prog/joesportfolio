import { useEffect, useMemo, useState } from "react";
import { format, isSameMonth, parseISO } from "date-fns";
import { Clock, MoreHorizontal, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteRow, useRows, useSaveRow } from "../../lib/data";
import { WORK_CATEGORIES, WORK_CATEGORY_LABEL, type WorkCategory, type WorkLogEntry } from "../../lib/types";
import { BlurFade } from "../motion/blur-fade";
import { DatePicker, Field, FormDialog, inputClass } from "../form";
import { EmptyState, Pill, SkeletonBlock, StatTile } from "../ui";

export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** "1h 30m", "90", "1.5h", "45m" → minutes. */
function parseDuration(text: string): number | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const hm = t.match(/^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+)\s*m)?$/);
  if (hm && (hm[1] || hm[2])) return Math.round(Number(hm[1] ?? 0) * 60 + Number(hm[2] ?? 0));
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : NaN;
}

function EntryDialog({
  open,
  onOpenChange,
  clientId,
  entry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  entry: WorkLogEntry | null;
}) {
  const save = useSaveRow("work_log");
  const [date, setDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WorkCategory>("ads");
  const [duration, setDuration] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDate(entry?.worked_on ?? format(new Date(), "yyyy-MM-dd"));
    setTitle(entry?.title ?? "");
    setCategory(entry?.category ?? "ads");
    setDuration(entry?.minutes ? formatMinutes(entry.minutes) : "");
    setDetails(entry?.details ?? "");
    setError(null);
  }, [open, entry]);

  const submit = () => {
    if (!title.trim()) return setError("Say what you did.");
    const minutes = parseDuration(duration);
    if (Number.isNaN(minutes)) return setError("Time should look like 45m, 1h 30m or 90.");
    save.mutate(
      {
        id: entry?.id,
        values: {
          client_id: clientId,
          worked_on: date ?? format(new Date(), "yyyy-MM-dd"),
          title: title.trim(),
          category,
          minutes,
          details: details.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(entry ? "Entry updated" : "Work logged");
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
      title={entry ? "Edit entry" : "Log work"}
      onSubmit={submit}
      submitLabel={entry ? "Save" : "Log it"}
      pending={save.isPending}
      error={error}
    >
      <Field label="What did you do?" htmlFor="wl-title">
        <Input
          id="wl-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Launched October sales campaign"
          className={inputClass}
          autoFocus
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date">
          <DatePicker value={date} onChange={setDate} clearable={false} />
        </Field>
        <Field label="Category">
          <Select value={category} onValueChange={(v) => setCategory(v as WorkCategory)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORK_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {WORK_CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Time spent" htmlFor="wl-time">
          <Input id="wl-time" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1h 30m" className={inputClass} />
        </Field>
      </div>
      <Field label="Details" htmlFor="wl-details">
        <Textarea id="wl-details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className="rounded-xl bg-background" />
      </Field>
    </FormDialog>
  );
}

export function WorkLogPanel({ clientId }: { clientId: string }) {
  const log = useRows("work_log", "worked_on");
  const remove = useDeleteRow("work_log");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkLogEntry | null>(null);

  const entries = useMemo(
    () =>
      (log.data ?? [])
        .filter((e) => e.client_id === clientId)
        .sort((a, b) => b.worked_on.localeCompare(a.worked_on) || b.created_at.localeCompare(a.created_at)),
    [log.data, clientId],
  );

  const groups = useMemo(() => {
    const out: { month: string; items: WorkLogEntry[]; minutes: number }[] = [];
    for (const e of entries) {
      const month = format(parseISO(e.worked_on), "MMMM yyyy");
      let g = out[out.length - 1];
      if (!g || g.month !== month) out.push((g = { month, items: [], minutes: 0 }));
      g.items.push(e);
      g.minutes += e.minutes ?? 0;
    }
    return out;
  }, [entries]);

  const now = new Date();
  const thisMonth = entries.filter((e) => isSameMonth(parseISO(e.worked_on), now));
  const monthMinutes = thisMonth.reduce((s, e) => s + (e.minutes ?? 0), 0);
  const totalMinutes = entries.reduce((s, e) => s + (e.minutes ?? 0), 0);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  if (log.isLoading) return <SkeletonBlock className="h-56 rounded-[20px]" />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="This month" icon={NotebookPen} hint={`${thisMonth.length} ${thisMonth.length === 1 ? "entry" : "entries"}`}>
          {formatMinutes(monthMinutes)}
        </StatTile>
        <StatTile label="All time" icon={Clock} hint={`${entries.length} entries`}>
          {formatMinutes(totalMinutes)}
        </StatTile>
        <div className="col-span-2 flex items-end justify-end md:col-span-1">
          <Button className="rounded-full px-4" onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> Log work
          </Button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={NotebookPen}
            title="Nothing logged yet"
            description="Note what you did for this client and how long it took. Handy for reports and pricing."
            action={
              <Button size="sm" className="rounded-full" onClick={openNew}>
                Log work
              </Button>
            }
          />
        </div>
      ) : (
        groups.map((group, gi) => (
          <BlurFade key={group.month} delay={Math.min(gi, 4) * 0.04}>
            <section>
              <div className="flex items-baseline justify-between px-1 pb-2">
                <h3 className="hub-section-title p-0">{group.month}</h3>
                {group.minutes > 0 && <span className="hub-tabular text-xs text-muted-foreground">{formatMinutes(group.minutes)}</span>}
              </div>
              <ol className="hub-card relative py-2">
                {group.items.map((e, i) => (
                  <li key={e.id} className="relative flex gap-4 px-5 py-3">
                    {/* timeline rail */}
                    {i < group.items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[35px] top-9 w-px bg-border" />}
                    <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0 translate-x-[5px] rounded-full bg-primary ring-4 ring-tint" />
                    <div className="min-w-0 flex-1 pl-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-medium">{e.title}</p>
                        <Pill tone="outline">{WORK_CATEGORY_LABEL[e.category]}</Pill>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {format(parseISO(e.worked_on), "EEE d MMM")}
                        {e.minutes ? ` · ${formatMinutes(e.minutes)}` : ""}
                      </p>
                      {e.details && <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">{e.details}</p>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg" aria-label={`Actions for ${e.title}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(e);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() =>
                            remove.mutate(e.id, { onSuccess: () => toast.success("Entry removed"), onError: (err) => toast.error(err.message) })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ol>
            </section>
          </BlurFade>
        ))
      )}

      <EntryDialog open={dialogOpen} onOpenChange={setDialogOpen} clientId={clientId} entry={editing} />
    </div>
  );
}
