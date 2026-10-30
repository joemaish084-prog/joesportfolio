import { ArrowUpRight, Box } from "lucide-react";
import type { Mockup } from "@/data/mockups";

export function MockupCard({ item, onOpen, featured = false, eager = false, index }: {
  item: Mockup;
  onOpen: () => void;
  featured?: boolean;
  eager?: boolean;
  index?: number;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${item.brand}: ${item.title}`}
      className="group block h-full w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-muted sm:rounded-3xl">
        <img
          src={item.thumb}
          srcSet={`${item.thumb} 768w, ${item.image} 1536w`}
          sizes={featured ? "(min-width: 1280px) 1216px, 100vw" : "(min-width: 1280px) 600px, (min-width: 768px) 48vw, 100vw"}
          width={1536}
          height={1024}
          alt={item.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.035]"
        />
        {item.model && <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm"><Box className="h-3.5 w-3.5" />3D available</span>}
        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-black shadow-sm transition-transform motion-safe:group-hover:-translate-y-1" aria-hidden="true">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
      <div className="border-b border-border px-1 pb-5 pt-4 sm:pb-6 sm:pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full" style={{ background: item.accent }} />{item.brand}</span>
          <span className="text-muted-foreground">/ {item.category}</span>
          {index !== undefined && <span className="ml-auto font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>}
        </div>
        <h3 className={`mt-2 font-display font-bold leading-tight tracking-tight transition-colors group-hover:text-primary ${featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>{item.title}</h3>
        <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Concept application</p>
      </div>
    </button>
  );
}
