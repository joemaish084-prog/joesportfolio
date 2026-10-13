import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkPageLayout } from "@/components/WorkPageLayout";
import { FeaturedVideo, LongCard, ShortCard } from "@/components/videos/VideoCards";
import { FEATURED_VIDEO, longVideos, shortVideos } from "@/data/videos";

type Filter = "All" | "Short form" | "Long form";

// The featured film has its own large player, so it is not repeated in the grid.
const otherLongVideos = longVideos.filter((v) => v.link !== FEATURED_VIDEO.watchUrl);
const total = shortVideos.length + longVideos.length;

const filters: { label: Filter; count: number }[] = [
  { label: "All", count: total },
  { label: "Short form", count: shortVideos.length },
  { label: "Long form", count: longVideos.length },
];

const WorkVideos = () => {
  const [filter, setFilter] = useState<Filter>("All");
  const showLong = filter !== "Short form";
  const showShort = filter !== "Long form";

  return (
    <WorkPageLayout
      seo={{
        title: "Video Production Portfolio | Joseph Maina, Nairobi",
        description:
          "Short-form reels and long-form brand films produced by Joseph Maina for Kenyan brands. Newest work first.",
        path: "/work/videos",
      }}
      backHref="/#videos"
      eyebrow="Video production"
      title={
        <>
          Stories <span className="text-gradient">Through Video</span>
        </>
      }
      intro="Short social content and full brand films, shot and edited for Kenyan brands. The newest work is always first."
      meta={[`${total} videos`, `${shortVideos.length} short form`, `${longVideos.length} long form`]}
    >
      <div
        role="group"
        aria-label="Filter videos"
        className="sticky top-14 z-20 -mx-4 mt-8 flex gap-2 overflow-x-auto bg-background/90 px-4 py-3 backdrop-blur lg:top-16 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filters.map((f) => {
          const active = f.label === filter;
          return (
            <button
              key={f.label}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.label)}
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

      {showLong && (
        <section className="mt-8" aria-labelledby="long-form-heading">
          <div className="mb-6">
            <h2 id="long-form-heading" className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Long form
            </h2>
            <p className="mt-1 text-muted-foreground">Brand films, interviews and documentaries.</p>
          </div>
          <FeaturedVideo />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {otherLongVideos.map((v) => (
              <LongCard key={v.link} v={v} />
            ))}
          </div>
        </section>
      )}

      {showShort && (
        <section className={showLong ? "mt-16" : "mt-8"} aria-labelledby="short-form-heading">
          <div className="mb-6">
            <h2 id="short-form-heading" className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Short form
            </h2>
            <p className="mt-1 text-muted-foreground">Reels and social clips. Each opens on Instagram.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {shortVideos.map((v) => (
              <ShortCard key={v.link} v={v} showDate />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 rounded-3xl border border-border bg-card/60 p-8 text-center sm:p-12">
        <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Need video for your brand?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Short-form ads, social content and brand films, planned around what you are selling.
        </p>
        <Button variant="gradient" size="lg" asChild className="mt-7">
          <a href="/#contact" className="gap-2">
            Start a project
            <ArrowRight className="h-5 w-5" />
          </a>
        </Button>
      </section>
    </WorkPageLayout>
  );
};

export default WorkVideos;
