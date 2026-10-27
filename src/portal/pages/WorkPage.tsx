import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Search, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { workByMonth } from "@/hub/lib/clientStory";
import { WORK_CATEGORY_LABEL, type WorkCategory, type WorkLogEntry } from "@/hub/lib/types";
import { usePortal } from "../auth/PortalData";
import { downloadCsv, downloadTablePdf, downloadXlsx, type Cell } from "../lib/export";
import { BlurFade } from "../components/magic/magic";
import { Donut } from "../components/charts";
import { ExportMenu } from "../components/ExportMenu";
import { EmptyState, PageHeader, Pill } from "../components/ui";

export default function WorkPage() {
  const { work, client } = usePortal();
  const [category, setCategory] = useState<WorkCategory | "all">("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const counts = new Map<WorkCategory, number>();
    for (const w of work) counts.set(w.category, (counts.get(w.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [work]);

  const filtered = useMemo(
    () =>
      work.filter(
        (w) =>
          (category === "all" || w.category === category) &&
          (!query.trim() || `${w.title} ${w.details ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [work, category, query],
  );
  const months = useMemo(() => workByMonth(filtered as unknown as WorkLogEntry[]), [filtered]);

  const rows = (): Cell[][] => [
    ["Date", "Category", "What we did", "Details"],
    ...filtered.map((w) => [w.worked_on, WORK_CATEGORY_LABEL[w.category], w.title, w.details ?? ""] as Cell[]),
  ];

  if (work.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Work done" title="What we've been doing" />
        <EmptyState icon={Wrench} title="Nothing logged yet">
          As we complete work for you, it'll be listed here month by month.
        </EmptyState>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Work done"
        title="What we've been doing"
        description={`${work.length} ${work.length === 1 ? "item" : "items"} completed for ${client.business_name || client.name}.`}
        actions={
          <ExportMenu
            onPdf={() =>
              downloadTablePdf({
                title: "Work completed",
                subtitle: client.business_name || client.name,
                who: client.business_name || client.name,
                head: ["Date", "Category", "What we did"],
                body: filtered.map((w) => [format(parseISO(w.worked_on), "d MMM yyyy"), WORK_CATEGORY_LABEL[w.category], w.title]),
                fileName: `${client.name} work done`,
              })
            }
            onXlsx={() => downloadXlsx(`${client.name} work done`, [{ name: "Work done", rows: rows() }])}
            onCsv={() => downloadCsv(`${client.name} work done`, rows())}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-5">
          <BlurFade>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search work"
                  aria-label="Search work"
                  className="h-10 rounded-xl bg-card pl-9"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(["all", ...categories.map(([c]) => c)] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      category === c ? "border-primary/50 bg-tint text-on-tint" : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c === "all" ? "All" : WORK_CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
          </BlurFade>

          {months.length === 0 ? (
            <p className="portal-card py-12 text-center text-sm text-muted-foreground">Nothing matches that filter.</p>
          ) : (
            months.map((m, i) => (
              <BlurFade key={m.key} delay={Math.min(i, 4) * 0.04}>
                <section className="portal-card p-5 md:p-6">
                  <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="portal-display text-lg font-semibold">{m.label}</h2>
                    <span className="text-xs text-muted-foreground">
                      {m.items.length} {m.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {m.items.map((w) => (
                      <li key={w.id} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-success" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.9375rem] leading-snug">{w.title}</p>
                          {w.details && <p className="mt-1 text-sm text-muted-foreground">{w.details}</p>}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Pill tone="muted">{WORK_CATEGORY_LABEL[w.category]}</Pill>
                          <span className="text-xs text-muted-foreground">{format(parseISO(w.worked_on), "d MMM")}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </BlurFade>
            ))
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <BlurFade delay={0.08}>
            <div className="portal-card p-5">
              <h2 className="portal-display font-semibold">Where the effort goes</h2>
              <div className="mt-3">
                <Donut data={categories.map(([c, n]) => ({ name: WORK_CATEGORY_LABEL[c], value: n }))} valueFormatter={(n) => `${n} items`} />
              </div>
            </div>
          </BlurFade>
        </aside>
      </div>
    </div>
  );
}
