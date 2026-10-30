import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Box } from "lucide-react";
import { mockups } from "@/data/mockups";
import { MockupLightbox } from "@/components/MockupLightbox";

const collections = [
  { slug: "jm-marketing", name: "JM Marketing", lead: "jm-mug", pair: ["jm-cap", "jm-stationery"], line: "A signature that goes everywhere.", note: "Orange on black. A familiar mark, carried from the desk to the everyday.", surface: "#e8dfd1", ink: "#32271e", accent: "#b84900" },
  { slug: "duara-schools", name: "Duara Schools", lead: "duara-merch", pair: ["duara-flyers", "duara-mug"], line: "A little sunshine, wherever you go.", note: "Forest green, sunflower yellow and a warm welcome, across the school day.", surface: "#eef0df", ink: "#153f2c", accent: "#035c40" },
  { slug: "iclear", name: "iClear", lead: "iclear-bottle", pair: ["iclear-cards", "iclear-tote"], line: "Clarity, carried into every detail.", note: "Aqua, deep blue and a fluid visual language. Clean from the first impression.", surface: "#e4edf0", ink: "#15324d", accent: "#0653b1" },
  { slug: "sidi-safari", name: "Sidi Safari", lead: "sidi-stationery", pair: ["sidi-tote", "sidi-mug"], line: "A story that lives beyond the screen.", note: "Navy, blush and a touch of gold bring a personal identity into the physical world.", surface: "#f0e4dd", ink: "#302b3a", accent: "#80601f" },
];

export function MockupSpotlight() {
  const [active, setActive] = useState(collections[0].slug);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const collection = collections.find((item) => item.slug === active)!;
  const lead = mockups.find((item) => item.id === collection.lead)!;
  const supporting = collection.pair.map((id) => mockups.find((item) => item.id === id)!);
  const brandScenes = mockups.filter((item) => item.brandSlug === active);
  const number = String(collections.indexOf(collection) + 1).padStart(2, "0");
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-xs"><ArrowDownRight className="h-4 w-4 text-primary" />Choose a brand. Explore its world.</p>
        <span className="font-mono text-xs text-muted-foreground">{mockups.length} scenes / {collections.length} identities</span>
      </div>
      <div role="group" aria-label="Featured mockup brand" className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {collections.map((item) => <button key={item.slug} type="button" aria-pressed={item.slug === active} aria-controls="mockup-collection-stage" onClick={() => { setSelectedId(null); setActive(item.slug); }} className={`flex min-h-12 items-center justify-between gap-3 rounded-full border px-4 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-5 sm:px-5 ${item.slug === active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>
          <span className="inline-flex items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.accent }} />{item.name}</span>
          <span className="font-mono text-[10px] opacity-60">{String(mockups.filter((scene) => scene.brandSlug === item.slug).length).padStart(2, "0")}</span>
        </button>)}
      </div>
      <div id="mockup-collection-stage" className="overflow-hidden rounded-3xl border border-black/5 sm:rounded-[2rem]" style={{ background: collection.surface, color: collection.ink }}>
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-7"><p aria-live="polite" className="text-xs font-bold uppercase tracking-[0.14em]">{number} / {collection.name}</p><span className="font-mono text-[10px] uppercase tracking-wider opacity-60">Selected applications</span></div>
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <button type="button" onClick={() => setSelectedId(lead.id)} aria-label={`Explore ${lead.brand}: ${lead.title}`} className="group relative block w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current">
            <img key={lead.id} src={lead.thumb} srcSet={`${lead.thumb} 768w, ${lead.image} 1536w`} sizes="(min-width: 1280px) 740px, (min-width: 1024px) 58vw, 100vw" alt={lead.alt} width={1536} height={1024} loading="lazy" decoding="async" className="aspect-[3/2] h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.025]" />
            <span className="absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-3 rounded-full bg-black/75 px-4 text-xs font-semibold text-white backdrop-blur-sm sm:bottom-6 sm:left-6">View this scene <ArrowUpRight className="h-4 w-4" /></span>
            {lead.model && <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-black"><Box className="h-3.5 w-3.5" />3D available</span>}
          </button>
          <div className="flex flex-col justify-between gap-7 p-6 sm:p-8 lg:p-9">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">{lead.category} / {brandScenes.length} applications</p><h3 className="mt-4 max-w-sm font-display text-3xl font-bold leading-[1.06] tracking-tight sm:text-4xl">{collection.line}</h3><p className="mt-4 max-w-sm text-sm leading-relaxed opacity-75">{collection.note}</p><Link to={`/work/mockups?brand=${collection.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-3 text-sm font-bold underline underline-offset-8 hover:opacity-70">Explore {collection.name} <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="grid grid-cols-2 gap-3">
              {supporting.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-label={`View ${item.brand}: ${item.title}`} className="group text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"><span className="block overflow-hidden rounded-xl bg-black/5"><img src={item.thumb} width={768} height={512} alt={item.alt} loading="lazy" decoding="async" className="aspect-[3/2] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /></span><span className="mt-2 flex min-h-8 items-center justify-between gap-2 text-[11px] font-semibold">{item.category}<ArrowUpRight className="h-3.5 w-3.5" /></span></button>)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 px-5 py-3 text-[10px] sm:px-7"><span className="opacity-65">Concept applications of portfolio brand identities.</span><span className="font-mono uppercase tracking-wider opacity-65">One identity. Every detail.</span></div>
      </div>
      <MockupLightbox items={brandScenes} selectedId={selectedId} onSelect={setSelectedId} />
    </>
  );
}
