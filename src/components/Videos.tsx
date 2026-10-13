import { Link } from "react-router-dom";
import { ArrowRight, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";
import { FeaturedVideo, ShortCard } from "@/components/videos/VideoCards";
import { HOME_SHORTS_COUNT, longVideos, shortVideos } from "@/data/videos";

// The homepage shows the featured film and the newest shorts; the full
// library lives at /work/videos.
const preview = shortVideos.slice(0, HOME_SHORTS_COUNT);
const total = shortVideos.length + longVideos.length;

export function Videos() {
  return (
    <section
      id="videos"
      className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider relative py-20 sm:py-32 overflow-hidden bg-background"
      aria-labelledby="videos-heading"
    >
      {/* Cinematic film-grain texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent"
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12 space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5">
              <Film className="h-3 w-3 mr-1.5" /> Video Production
            </Badge>
            <SectionLabel>VIDEOS</SectionLabel>
            <h2
              id="videos-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4"
            >
              Telling Stories <span className="text-gradient">Through Video</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From short punchy social content to full brand documentaries — every frame with purpose.
            </p>
            <p className="sr-only">Video Production Nairobi Kenya</p>
          </div>
        </ScrollReveal>

        {/* Featured video */}
        <ScrollReveal>
          <div className="mb-12 sm:mb-16">
            <FeaturedVideo />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <h3 className="mb-6 text-center font-display text-xl sm:text-2xl font-bold">Latest short-form videos</h3>
        </ScrollReveal>

        {/* Two-up on phones: a single 9:16 card per row is a full screen of scrolling each */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {preview.map((v, i) => (
            <ScrollReveal key={v.link} delay={i * 0.05}>
              <ShortCard v={v} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up">
          <div className="mt-10 sm:mt-12 flex flex-col items-center gap-3">
            <Button variant="gradient" size="lg" asChild>
              <Link to="/work/videos" className="gap-2">
                View all {total} videos
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Showing the {preview.length} newest. The full library has short-form and long-form work.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
