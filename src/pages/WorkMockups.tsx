import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Box } from "lucide-react";
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
      <div className="mt-8 space-y-5">
        <div role="group" aria-label="Filter mockups by brand" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!brand} onClick={() => setFilter("brand")} className={filterClass(!brand)}>All brands</button>
          {mockupBrands.map((item) => <button key={item.slug} type="button" aria-pressed={brand?.slug === item.slug} onClick={() => setFilter("brand", item.slug)} className={filterClass(brand?.slug === item.slug)}>{item.name}<span className="ml-2 text-xs opacity-70">{mockups.filter((scene) => scene.brandSlug === item.slug).length}</span></button>)}
        </div>
        <div role="group" aria-label="Filter mockups by application" className="flex flex-wrap items-center gap-2 border-b border-border pb-6">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application</span>
          <button type="button" aria-pressed={!category} onClick={() => setFilter("category")} className={filterClass(!category)}>All</button>
          {MOCKUP_CATEGORIES.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setFilter("category", item.toLowerCase())} className={filterClass(category === item)}>{item}</button>)}
          <button type="button" aria-pressed={only3D} onClick={() => setFilter("view", only3D ? undefined : "3d")} className={`${filterClass(only3D)} gap-2`}><Box className="h-4 w-4" />Interactive 3D</button>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Look for the 3D badge. Open a scene, then choose “Explore in 3D” to rotate a mug, bottle or card.</p>
      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">{visible.length} {visible.length === 1 ? "scene" : "scenes"}{brand ? ` for ${brand.name}` : " in the collection"}</p>
        {kitHref && <Link to={kitHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">Explore {brand.name}'s brand kit <ArrowRight className="h-4 w-4" /></Link>}
      </div>
      {visible.length > 0 ? (
        <ul className="grid items-start gap-5 md:grid-cols-2 lg:gap-8">
          {visible.map((item, index) => <li key={item.id} className={index === 0 && visible.length > 2 ? "md:col-span-2" : ""}><MockupCard item={item} featured={index === 0 && visible.length > 2} eager={index === 0} onOpen={() => setSelectedId(item.id)} /></li>)}
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
