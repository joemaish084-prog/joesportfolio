import { ArrowUpRight, Box } from "lucide-react";
import type { Mockup } from "@/data/mockups";

export function MockupCard({ item, onOpen, featured = false, eager = false }: {
  item: Mockup;
  onOpen: () => void;
  featured?: boolean;
  eager?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${item.brand}: ${item.title}`}
      className="group block h-full w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:rounded-3xl"
    >
      <div className={`relative overflow-hidden bg-muted ${featured ? "aspect-[3/2]" : "aspect-[4/3]"}`}>
        <img
          src={item.thumb}
          srcSet={`${item.thumb} 768w, ${item.image} 1536w`}
          sizes={featured ? "(min-width: 1280px) 760px, (min-width: 768px) 65vw, 100vw" : "(min-width: 1280px) 600px, (min-width: 768px) 45vw, 100vw"}
          width={1536}
          height={1024}
          alt={item.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.035]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">Concept application</span>
        {item.model && <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-2 text-xs font-semibold text-white"><Box className="h-3.5 w-3.5" />3D available</span>}
        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-black shadow-sm transition-transform motion-safe:group-hover:-translate-y-1" aria-hidden="true">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full" style={{ background: item.accent }} />{item.brand}</span>
          <span className="text-muted-foreground">/ {item.category}</span>
        </div>
        <h3 className={`mt-2 font-display font-bold tracking-tight ${featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>{item.title}</h3>
      </div>
    </button>
  );
}
