import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Box, SlidersHorizontal, X } from "lucide-react";
import { WorkPageLayout } from "@/components/WorkPageLayout";
import { MockupCard } from "@/components/MockupCard";
import { MockupLightbox } from "@/components/MockupLightbox";
import { Button } from "@/components/ui/button";
import { MOCKUP_CATEGORIES, mockupBrands, mockups } from "@/data/mockups";
import { STATIC_HEADS } from "@/seo/heads";

export default function WorkMockups() {
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const brand = mockupBrands.find((item) => item.slug === params.get("brand"));
  const category = MOCKUP_CATEGORIES.find((item) => item.toLowerCase() === params.get("category"));
  const only3D = params.get("view") === "3d";
  const hasFilters = !!brand || !!category || only3D;
  const visible = mockups.filter((item) => (!brand || item.brandSlug === brand.slug) && (!category || item.category === category) && (!only3D || item.model));
  const kitHref = brand && mockups.find((item) => item.brandSlug === brand.slug)?.kitHref;
  const setFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setSelectedId(null);
    setParams(next, { replace: true });
  };
  const filterClass = (active: boolean) => `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"}`;
  return (
    <WorkPageLayout seo={STATIC_HEADS.workMockups} backHref="/#mockups" eyebrow="Mockups / Brand applications"
      title={<>Design, out in <span className="text-gradient">the world.</span></>}
      intro="Brand identities imagined on paper, fabric and everyday objects. Explore the details that make a brand feel like itself, wherever it appears."
      meta={[`${mockups.length} scenes`, `${mockupBrands.length} brands`, `${mockups.filter((item) => item.model).length} interactive 3D views`]}>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Browse mockup collections">
        {mockupBrands.map((item) => {
          const scenes = mockups.filter((scene) => scene.brandSlug === item.slug);
          const cover = scenes[0];
          const active = brand?.slug === item.slug;
          return <button key={item.slug} type="button" aria-pressed={active} onClick={() => setFilter("brand", active ? undefined : item.slug)} className={`group overflow-hidden rounded-2xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <div className="aspect-[2/1] overflow-hidden bg-muted"><img src={cover.thumb} alt={`${item.name} mockup collection`} width={768} height={512} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /></div>
            <span className="flex items-center justify-between gap-2 px-3 py-4 sm:px-4"><span><span className="block text-sm font-bold">{item.name}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{scenes.length} scenes</span></span><ArrowUpRight className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} /></span>
          </button>;
        })}
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <div className="mb-3 flex min-h-11 items-center justify-between gap-3"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><SlidersHorizontal className="h-3.5 w-3.5 text-primary" />Filter collection</p>{hasFilters && <button type="button" onClick={() => { setSelectedId(null); setParams({}, { replace: true }); }} className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">Clear filters <X className="h-3.5 w-3.5" /></button>}</div>
        <div role="group" aria-label="Filter mockups by application" className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application</span>
          <button type="button" aria-pressed={!category} onClick={() => setFilter("category")} className={filterClass(!category)}>All</button>
          {MOCKUP_CATEGORIES.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setFilter("category", item.toLowerCase())} className={filterClass(category === item)}>{item}</button>)}
          <button type="button" aria-pressed={only3D} onClick={() => setFilter("view", only3D ? undefined : "3d")} className={`${filterClass(only3D)} gap-2`}><Box className="h-4 w-4" />Interactive 3D</button>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><Box className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Scenes marked 3D include a model you can rotate. Open a scene to explore.</p>
      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">{visible.length} {visible.length === 1 ? "scene" : "scenes"}{brand ? ` for ${brand.name}` : " in the collection"}</p>
        {kitHref && <Link to={kitHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">Explore {brand.name}'s brand kit <ArrowRight className="h-4 w-4" /></Link>}
      </div>
      {visible.length > 0 ? (
        <ul className="grid items-start gap-x-5 gap-y-8 md:grid-cols-2 lg:gap-x-8 lg:gap-y-12">
          {visible.map((item, index) => <li key={item.id}><MockupCard item={item} index={index} eager={index < 2} onOpen={() => setSelectedId(item.id)} /></li>)}
        </ul>
      ) : (
        <div className="rounded-3xl border border-border bg-card/50 px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-bold">No scenes in this combination yet.</h2>
          <p className="mt-3 text-muted-foreground">Try another application or explore the full collection.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setSelectedId(null); setParams({}, { replace: true }); }}>Show all mockups</Button>
        </div>
      )}
      <section className="mt-16 flex flex-col justify-between gap-6 rounded-3xl border border-border bg-card/50 p-7 sm:p-10 md:flex-row md:items-center">
        <div><h2 className="font-display text-2xl font-bold sm:text-3xl">Your brand. In every detail.</h2><p className="mt-3 max-w-xl text-muted-foreground">Let's build an identity that carries through from your first post to your next printed piece.</p></div>
        <Button variant="gradient" size="lg" asChild><a href="/#contact" className="gap-2">Start a project <ArrowRight className="h-5 w-5" /></a></Button>
      </section>
      <MockupLightbox items={visible} selectedId={selectedId} onSelect={setSelectedId} />
    </WorkPageLayout>
  );
}
