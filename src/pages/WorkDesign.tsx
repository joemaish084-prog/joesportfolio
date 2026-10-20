import { useMemo, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkPageLayout } from "@/components/WorkPageLayout";
import { DESIGN_GROUPS, LATEST_COUNT, designs, type DesignGroup } from "@/data/designs";
import { STATIC_HEADS } from "@/seo/heads";

type Filter = "All" | DesignGroup;

const latest = new Set(designs.slice(0, LATEST_COUNT).map((d) => d.title));

const WorkDesign = () => {
  // The filter lives in the URL (?group=more) so the nav dropdown can link straight to one.
  const [params, setParams] = useSearchParams();
  const groupParam = params.get("group")?.toLowerCase();
  const filter: Filter = DESIGN_GROUPS.find((g) => g.toLowerCase() === groupParam) ?? "All";
  const setFilter = (next: Filter) =>
    setParams(next === "All" ? {} : { group: next.toLowerCase() }, { replace: true });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filtering keeps the list order, so the newest work stays on top.
  const visible = useMemo(
    () => (filter === "All" ? designs : designs.filter((d) => d.group === filter)),
    [filter],
  );
  const filters: { label: Filter; count: number }[] = [
    { label: "All", count: designs.length },
    ...DESIGN_GROUPS.map((g) => ({ label: g, count: designs.filter((d) => d.group === g).length })),
  ];

  const selected = openIndex === null ? null : visible[openIndex];
  const step = (delta: number) =>
    setOpenIndex((i) => (i === null ? i : (i + delta + visible.length) % visible.length));
  const onLightboxKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  // The newest piece gets a double-size tile when there is enough work to fill around it.
  const featureFirst = visible.length >= 6;

  return (
    <WorkPageLayout
      seo={STATIC_HEADS.workDesign}
      backHref="/#graphic-design"
      eyebrow="Design"
      title={
        <>
          Graphic <span className="text-gradient">Design</span>
        </>
      }
      intro="Campaign creatives, social content and brand artwork made for Kenyan brands. The newest work is always first."
      meta={[`${designs.length} designs`, `${DESIGN_GROUPS.length} collections`, "Newest first"]}
    >
      <div
        role="group"
        aria-label="Filter designs"
        className="sticky top-14 z-20 -mx-4 mt-8 flex gap-2 overflow-x-auto bg-background/90 px-4 py-3 backdrop-blur lg:top-16 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filters.map((f) => {
          const active = f.label === filter;
          return (
            <button
              key={f.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(f.label);
                setOpenIndex(null);
              }}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {f.label}
              <span className={active ? "opacity-80" : "opacity-60"}>{f.count}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {visible.map((design, i) => {
          const featured = featureFirst && i === 0;
          return (
            <li key={design.title} className={featured ? "col-span-2 md:row-span-2" : ""}>
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`View ${design.title}`}
                className={`group relative block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  featured ? "aspect-[4/5] md:aspect-auto md:h-full" : "aspect-[4/5]"
                }`}
              >
                <img
                  src={design.image}
                  alt={`${design.title}: ${design.description}`}
                  loading={i < 4 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3 pt-14 sm:p-5 sm:pt-20">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                    {design.group === "More" ? "Brand work" : design.group}
                  </p>
                  <p
                    className={`mt-1 font-display font-bold leading-snug text-white ${
                      featured ? "text-lg sm:text-2xl" : "text-sm sm:text-base"
                    }`}
                  >
                    {design.title}
                  </p>
                  <p className="mt-1 hidden text-sm text-white/80 sm:group-hover:block sm:group-focus-visible:block">
                    {design.description}
                  </p>
                </div>
                {latest.has(design.title) && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                    New
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <section className="mt-16 rounded-3xl border border-border bg-card/60 p-8 text-center sm:p-12">
        <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Need designs like these?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Social graphics, ad creatives and campaign artwork, built to match your brand and your offer.
        </p>
        <Button variant="gradient" size="lg" asChild className="mt-7">
          <a href="/#contact" className="gap-2">
            Start a project
            <ArrowRight className="h-5 w-5" />
          </a>
        </Button>
      </section>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-4xl w-full gap-0 overflow-hidden p-0" onKeyDown={onLightboxKey}>
          {selected && openIndex !== null && (
            <>
              <div className="relative bg-black">
                <img
                  src={selected.image}
                  alt={selected.title}
                  decoding="async"
                  className="mx-auto max-h-[72vh] w-auto max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous design"
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-primary"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next design"
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-primary"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-start justify-between gap-6 p-5 sm:p-6">
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-display font-bold">{selected.title}</DialogTitle>
                  <DialogDescription className="mt-1">{selected.description}</DialogDescription>
                </div>
                <p className="flex-shrink-0 text-sm tabular-nums text-muted-foreground">
                  {openIndex + 1} / {visible.length}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </WorkPageLayout>
  );
};

export default WorkDesign;
