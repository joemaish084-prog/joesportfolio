import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Box, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Mockup } from "@/data/mockups";

const MockupModelViewer = lazy(() => import("@/components/MockupModelViewer"));

export function MockupLightbox({ items, selectedId, onSelect }: {
  items: Mockup[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const index = items.findIndex((item) => item.id === selectedId);
  const selected = items[index];
  const [modelFor, setModelFor] = useState<string | null>(null);
  const showModel = !!selected?.model && modelFor === selected.id;
  const step = (delta: number) => onSelect(items[(index + delta + items.length) % items.length].id);
  return (
    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setModelFor(null); onSelect(null); } }}>
      <DialogContent
        className="max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-5xl gap-0 overflow-y-auto rounded-2xl p-0 [&>button]:rounded-full [&>button]:bg-background [&>button]:p-2 [&>button]:opacity-100"
        onKeyDown={(event) => {
          if (!selected || items.length < 2 || showModel) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            step(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {selected && (
          <>
            {selected.model && (
              <div role="group" aria-label="Mockup view" className="flex gap-2 border-b border-border p-3 pr-16">
                <button type="button" aria-pressed={!showModel} onClick={() => setModelFor(null)} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ${!showModel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Image className="h-4 w-4" />Photo</button>
                <button type="button" aria-pressed={showModel} onClick={() => setModelFor(selected.id)} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ${showModel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Box className="h-4 w-4" />Explore in 3D</button>
              </div>
            )}
            {showModel && selected.model ? (
              <Suspense fallback={<div role="status" className="flex h-72 items-center justify-center bg-muted text-sm text-muted-foreground">Preparing the 3D view…</div>}>
                <MockupModelViewer key={selected.id} model={selected.model} brand={selected.brand} poster={selected.thumb} />
              </Suspense>
            ) : <div className="relative bg-black">
              <img src={selected.image} alt={selected.alt} width={1536} height={1024} className="max-h-[62dvh] w-full object-contain" />
              {items.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous mockup" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ChevronLeft className="h-5 w-5" /></button>
                  <button type="button" onClick={() => step(1)} aria-label="Next mockup" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ChevronRight className="h-5 w-5" /></button>
                </>
              )}
            </div>}
            <div className="p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{selected.brand} / {selected.category} · {index + 1} of {items.length}</p>
              <DialogTitle className="mt-2 font-display text-2xl">{selected.title}</DialogTitle>
              <DialogDescription className="mt-3 max-w-2xl">{selected.description} Concept visualisation.</DialogDescription>
              {showModel && <p className="mt-2 text-xs text-muted-foreground">A simplified 3D concept of the shape and branding. Materials and details differ from the photo.</p>}
              {selected.kitHref && <Link to={selected.kitHref} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">View brand kit <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
