import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Download, Eye, FileSignature, FileText, FolderOpen, Lightbulb, Receipt, Search, ScrollText, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DOCUMENT_KIND_LABEL, DOCUMENT_STATUS_LABEL, type DocumentKind } from "@/hub/lib/types";
import { usePortal } from "../auth/PortalData";
import { openPortalFile } from "../lib/api";
import { fileSize } from "../lib/format";
import { BlurFade, SpotlightCard } from "../components/magic/magic";
import { EmptyState, PageHeader, Pill } from "../components/ui";

const ICON: Record<DocumentKind, typeof FileText> = {
  contract: FileSignature,
  proposal: Lightbulb,
  quotation: ScrollText,
  invoice: Receipt,
  report: FileText,
  brief: StickyNote,
  receipt: Receipt,
  other: FileText,
};

export default function DocumentsPage() {
  const { documents } = usePortal();
  const [kind, setKind] = useState<DocumentKind | "all">("all");
  const [query, setQuery] = useState("");

  const kinds = useMemo(() => [...new Set(documents.map((d) => d.kind))], [documents]);
  const shown = useMemo(
    () =>
      documents.filter(
        (d) => (kind === "all" || d.kind === kind) && (!query.trim() || d.title.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [documents, kind, query],
  );
  const fail = (e: Error) => toast.error(e.message);

  if (documents.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Documents" title="Your files" />
        <EmptyState icon={FolderOpen} title="No documents shared yet">
          Contracts, proposals and other files we share with you will be kept here, safe and easy to find.
        </EmptyState>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Documents" title="Your files" description="Contracts, proposals and reports we've shared with you." />

      <BlurFade>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" aria-label="Search documents" className="h-10 rounded-xl bg-card pl-9" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["all", ...kinds] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  kind === k ? "border-primary/50 bg-tint text-on-tint" : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {k === "all" ? "All" : DOCUMENT_KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
      </BlurFade>

      {shown.length === 0 ? (
        <p className="portal-card py-12 text-center text-sm text-muted-foreground">Nothing matches that search.</p>
      ) : (
        <BlurFade delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((d) => {
              const Icon = ICON[d.kind];
              return (
                <SpotlightCard key={d.id} className="portal-card-interactive flex flex-col p-5">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint text-on-tint ring-1 ring-primary/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium leading-snug">{d.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {DOCUMENT_KIND_LABEL[d.kind]} · {format(parseISO(d.created_at), "d MMM yyyy")}
                        {d.size_bytes ? ` · ${fileSize(d.size_bytes)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Pill tone={d.status === "signed" || d.status === "approved" || d.status === "final" ? "success" : "muted"}>
                      {DOCUMENT_STATUS_LABEL[d.status]}
                    </Pill>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => openPortalFile(d).catch(fail)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Button>
                      <Button size="sm" className="h-8 rounded-lg" onClick={() => openPortalFile(d, true).catch(fail)} aria-label={`Download ${d.title}`}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </BlurFade>
      )}
    </div>
  );
}
