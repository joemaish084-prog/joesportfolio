import { useState } from "react";
import { Play, Volume2, Film, Clock, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";
import { CollapsibleSection } from "./CollapsibleSection";
import featuredThumb from "@/assets/featured-showreel-thumb.jpeg";
import longJoanThumb from "@/assets/longform-joan-mbesya.jpeg";
import longAsdspThumb from "@/assets/longform-asdsp.jpeg";
import thumb1 from "@/assets/video-thumb-1.png";
import thumb2 from "@/assets/video-thumb-2.png";
import thumb3 from "@/assets/video-thumb-3.png";
import thumb4 from "@/assets/video-thumb-4.png";
import thumb5 from "@/assets/video-thumb-5.png";
import thumb6 from "@/assets/video-thumb-6.png";
import thumb7 from "@/assets/video-thumb-7.png";
import thumb8 from "@/assets/video-thumb-8.png";
import thumb9 from "@/assets/video-thumb-9.png";
import shortIclearDishwash from "@/assets/short-iclear-dishwash.png";
import shortMajiNiUhai from "@/assets/short-maji-ni-uhai.jpg";
import shortForTypography from "@/assets/short-for-typography.png";

type Platform = "Instagram" | "TikTok" | "YouTube";

interface ShortVideo {
  title: string;
  thumbnail: string;
  link: string;
  platform: Platform;
  duration: string;
  uploadDate: string;
  description?: string;
}

interface LongVideo {
  title: string;
  description: string;
  thumbnail: string;
  link: string;
  platform: Platform;
  duration: string;
  uploadDate: string;
}

const SITE_URL = "https://joesportfolio.lovable.app";

const shortVideos: ShortVideo[] = [
  { title: "iClear Water Delivery Reel", thumbnail: thumb1, link: "https://www.instagram.com/reel/DT-w2FtjTnk/", platform: "Instagram", duration: "0:30", uploadDate: "2025-09-12", description: "Short-form Instagram reel for iClear Wellife water delivery — social media marketing & video production by Joseph Maina, Digital Marketing Specialist in Nairobi, Kenya." },
  { title: "Commonly Asked Questions", thumbnail: thumb2, link: "https://www.instagram.com/reel/DUFhZLMCkI6/", platform: "Instagram", duration: "0:45", uploadDate: "2025-09-20", description: "Customer education reel answering FAQs about iClear water filters — content strategy and Meta video by Joseph Maina, Nairobi." },
  { title: "Filter Installation Tutorial", thumbnail: thumb3, link: "https://www.instagram.com/reel/DR0_0WSCKvx/", platform: "Instagram", duration: "0:38", uploadDate: "2025-07-18", description: "Step-by-step Instagram tutorial reel for installing an iClear water filter — short-form video production by Joseph Maina, Kenya." },
  { title: "Corporate Trends Recap", thumbnail: thumb4, link: "https://www.instagram.com/reel/DQ6zTmTjqlq/", platform: "Instagram", duration: "0:28", uploadDate: "2025-06-22", description: "Trend-driven corporate recap reel for social media marketing in Kenya — produced by Joseph Maina, Digital Marketing Specialist Nairobi." },
  { title: "Water Filter Setup Guide", thumbnail: thumb5, link: "https://www.instagram.com/reel/DLuTwgPCbbw/", platform: "Instagram", duration: "0:42", uploadDate: "2025-04-08", description: "Product setup guide reel — short-form Instagram video for iClear Wellife water filtration, produced by Joseph Maina." },
  { title: "Product Showcase Reel", thumbnail: thumb6, link: "https://www.instagram.com/reel/DScs6erjcfO/", platform: "Instagram", duration: "0:25", uploadDate: "2025-08-04", description: "Product showcase Instagram reel for iClear Wellife — Nairobi-based video production and content strategy by Joseph Maina." },
  { title: "On Location Shoot", thumbnail: thumb7, link: "https://www.instagram.com/reel/DQ_5aRdl2YS/", platform: "Instagram", duration: "0:35", uploadDate: "2025-06-28", description: "Behind-the-scenes on-location field shoot reel — branded video production in Nairobi, Kenya by Joseph Maina." },
  { title: "Sustainability Report Reel", thumbnail: thumb8, link: "https://www.instagram.com/reel/DP4KbNTDQj-/", platform: "Instagram", duration: "0:50", uploadDate: "2025-05-30", description: "Sustainability storytelling reel for corporate social media in Kenya — produced by Joseph Maina, Digital Marketing Specialist Nairobi." },
  { title: "Behind The Scenes", thumbnail: thumb9, link: "https://www.instagram.com/reel/DP1XkoaDsUE/", platform: "Instagram", duration: "0:33", uploadDate: "2025-05-26", description: "Behind-the-scenes reel from a Nairobi commercial shoot — video production and social media by Joseph Maina." },
  { title: "iClear Field Service Reel", thumbnail: shortIclearDishwash, link: "https://www.instagram.com/reel/DW3-G4fIMjO/", platform: "Instagram", duration: "0:30", uploadDate: "2025-11-04", description: "Field service Instagram reel for iClear Wellife — short-form brand video by Joseph Maina, Digital Marketing Specialist Nairobi Kenya." },
  { title: "Maji Ni Uhai — iClear Campaign", thumbnail: shortMajiNiUhai, link: "https://www.instagram.com/reel/DXesQTfjYnp/", platform: "Instagram", duration: "0:35", uploadDate: "2025-11-18", description: "Maji Ni Uhai campaign reel for iClear Wellife — performance marketing & creative direction by Joseph Maina, Nairobi." },
  { title: "Cinematic Typography Promo", thumbnail: shortForTypography, link: "https://www.instagram.com/reel/DVnbbkKjSRa/", platform: "Instagram", duration: "0:20", uploadDate: "2025-10-15", description: "Cinematic typography promo reel — kinetic text social media video produced by Joseph Maina, Nairobi Kenya." },
];

const longVideos: LongVideo[] = [
  {
    title: "Let Go of the Fear & Own Your Authentic Voice! — Caroline Njiru",
    description: "Featured long-form brand film with Caroline Njiru on confidence, voice and authenticity — directed and produced by Joseph Maina, Video Production Nairobi Kenya.",
    thumbnail: featuredThumb,
    link: "https://youtu.be/RREDY1htp7Q",
    platform: "YouTube",
    duration: "12:18",
    uploadDate: "2024-11-20",
  },
  {
    title: "Joan Mbesya — Full Interview",
    description: "Long-form YouTube interview feature with entrepreneur Joan Mbesya — brand storytelling and video production by Joseph Maina, Nairobi.",
    thumbnail: longJoanThumb,
    link: "https://youtu.be/lulDBOcFiCw",
    platform: "YouTube",
    duration: "18:42",
    uploadDate: "2024-08-14",
  },
  {
    title: "ASDSP Programme — A Game Changer for Nyeri Farmers",
    description: "Documentary on the ASDSP programme transforming agriculture for Nyeri farmers — produced and shot by Joseph Maina, Digital Marketing Specialist Kenya.",
    thumbnail: longAsdspThumb,
    link: "https://youtu.be/7jCqcsyXGC8",
    platform: "YouTube",
    duration: "9:54",
    uploadDate: "2023-06-30",
  },
];

function durationToISO8601(d: string): string | undefined {
  const parts = d.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => isNaN(n))) return undefined;
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  else return undefined;
  let iso = "PT";
  if (h) iso += `${h}H`;
  if (m) iso += `${m}M`;
  if (s || (!h && !m)) iso += `${s}S`;
  return iso;
}

function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

const platformStyles: Record<Platform, string> = {
  Instagram: "bg-gradient-to-r from-[hsl(330_85%_55%)] to-[hsl(25_100%_50%)] text-white",
  TikTok: "bg-foreground text-background",
  YouTube: "bg-[hsl(0_85%_55%)] text-white",
};

function VideoSchema({ v }: { v: ShortVideo | LongVideo }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: "description" in v ? v.description : `${v.title} — video by Joseph Maina, Digital Marketing Specialist in Nairobi, Kenya.`,
    thumbnailUrl: v.thumbnail,
    uploadDate: "2024-01-01",
    contentUrl: v.link,
    publisher: { "@type": "Person", name: "Joseph Maina" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

function ShortCard({ v }: { v: ShortVideo }) {
  return (
    <a
      href={v.link}
      target="_blank"
      rel="noopener noreferrer"
      title={`Watch ${v.title} — ${v.platform} short-form video by Joseph Maina`}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.25)] hover:-translate-y-1"
    >
      <VideoSchema v={v} />
      <div className="relative aspect-[9/16] overflow-hidden">
        <img
          src={v.thumbnail}
          alt={`${v.title} — ${v.platform} short-form video thumbnail by Joseph Maina, Digital Marketing Specialist in Nairobi`}
          loading="lazy"
          width={400}
          height={711}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 transition-opacity duration-300 group-hover:from-black/90" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge className={`${platformStyles[v.platform]} border-0 shadow-elegant text-xs font-semibold`}>
            {v.platform}
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm text-xs">
            <Clock className="h-3 w-3 mr-1" /> {v.duration}
          </Badge>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-elegant transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 h-8 w-8 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="font-display text-base font-bold text-white drop-shadow-lg line-clamp-2">{v.title}</h4>
        </div>
      </div>
    </a>
  );
}

function LongCard({ v }: { v: LongVideo }) {
  const isPlaceholder = v.link === "#";
  const youtubeId = getYouTubeId(v.link);
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_50px_hsl(var(--primary)/0.25)] hover:-translate-y-1"
    >
      <VideoSchema v={v} />
      <div className="relative aspect-video overflow-hidden bg-black">
        {playing && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            <img
              src={v.thumbnail}
              alt={`${v.title} — ${v.platform} long-form brand film thumbnail by Joseph Maina, Nairobi Kenya`}
              loading="lazy"
              width={1280}
              height={720}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/40" />
            <button
              type="button"
              onClick={() => !isPlaceholder && youtubeId && setPlaying(true)}
              disabled={isPlaceholder || !youtubeId}
              aria-label={`Play ${v.title}`}
              className="absolute inset-0 z-10 flex items-center justify-center"
            >
              <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary shadow-elegant scale-95 group-hover:scale-100 transition-transform duration-500">
                <Play className="ml-1 h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" fill="currentColor" />
              </span>
            </button>
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <Badge className={`${platformStyles[v.platform]} border-0 shadow-elegant`}>{v.platform}</Badge>
              <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1" /> {v.duration}
              </Badge>
            </div>
          </>
        )}
      </div>
      <div className="p-6 space-y-3">
        <h4 className="font-display text-xl font-bold">{v.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-1">{v.description}</p>
        <Button
          asChild={!isPlaceholder}
          disabled={isPlaceholder}
          variant="outline"
          className="w-full"
        >
          {isPlaceholder ? (
            <span><Play className="mr-2 h-4 w-4" fill="currentColor" /> Coming Soon</span>
          ) : (
            <a href={v.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Watch on YouTube
            </a>
          )}
        </Button>
      </div>
    </div>
  );
}

const FEATURED_VIDEO = {
  youtubeId: "RREDY1htp7Q",
  title: "Let Go of the Fear & Own Your Authentic Voice! — Caroline Njiru",
  description: "Featured brand film directed and produced by Joseph Maina — Caroline Njiru opens up about confidence, voice and authenticity.",
  watchUrl: "https://youtu.be/RREDY1htp7Q",
};

function FeaturedVideo() {
  const [playing, setPlaying] = useState(false);

  const featuredSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: FEATURED_VIDEO.title,
    description: FEATURED_VIDEO.description,
    thumbnailUrl: featuredThumb,
    uploadDate: "2024-01-01",
    contentUrl: FEATURED_VIDEO.watchUrl,
    embedUrl: `https://www.youtube.com/embed/${FEATURED_VIDEO.youtubeId}`,
    publisher: { "@type": "Person", name: "Joseph Maina" },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-elegant group">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredSchema) }} />
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${FEATURED_VIDEO.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={FEATURED_VIDEO.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            {/* Muted autoplay preview via YouTube embed (desktop) */}
            <iframe
              src={`https://www.youtube.com/embed/${FEATURED_VIDEO.youtubeId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1&playlist=${FEATURED_VIDEO.youtubeId}`}
              title={`${FEATURED_VIDEO.title} — muted preview`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="absolute inset-0 h-full w-full hidden md:block pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            />
            {/* Mobile poster fallback */}
            <img
              src={featuredThumb}
              alt={`${FEATURED_VIDEO.title} — featured brand film thumbnail by Joseph Maina, Video Production Nairobi Kenya`}
              className="absolute inset-0 h-full w-full object-cover md:hidden"
              loading="lazy"
            />
            {/* Overlay gradient — desktop only so mobile thumbnail stays clean */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none hidden md:block" />

            <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-10">
              <Badge className="bg-primary text-primary-foreground border-0 shadow-elegant text-xs">
                <Film className="h-3 w-3 mr-1" /> Featured Showreel
              </Badge>
            </div>

            <button
              onClick={() => setPlaying(true)}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-105"
              style={{ transition: "transform 0.2s" }}
              aria-label="Watch featured video with sound"
            >
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Watch with Sound</span>
            </button>

            {/* Center play button — smaller on mobile */}
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 z-10 flex items-center justify-center group/play"
              aria-label={`Play ${FEATURED_VIDEO.title}`}
            >
              <span className="flex h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-primary shadow-elegant group-hover/play:scale-110" style={{ transition: "transform 0.3s" }}>
                <Play className="ml-0.5 h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary-foreground" fill="currentColor" />
              </span>
            </button>

            {/* Desktop overlay title (hidden on mobile) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10 pointer-events-none hidden md:block">
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-white drop-shadow-2xl max-w-3xl">
                {FEATURED_VIDEO.title}
              </h3>
              <a
                href={FEATURED_VIDEO.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm sm:text-base text-white/80 hover:text-primary pointer-events-auto"
              >
                Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Mobile-only title block below the video */}
      {!playing && (
        <div className="md:hidden p-5 space-y-3 bg-card border-t border-border">
          <h3 className="font-display text-lg font-bold leading-snug">
            {FEATURED_VIDEO.title}
          </h3>
          <a
            href={FEATURED_VIDEO.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

export function Videos() {
  return (
    <section
      id="videos"
      className="relative py-20 sm:py-32 overflow-hidden bg-background"
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
          <div className="mb-16">
            <FeaturedVideo />
          </div>
        </ScrollReveal>

        {/* Tabs */}
        <Tabs defaultValue="short" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-card border border-border p-1 h-auto">
              <TabsTrigger
                value="short"
                className="px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant transition-all"
              >
                Short Form
              </TabsTrigger>
              <TabsTrigger
                value="long"
                className="px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-elegant transition-all"
              >
                Long Form
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="short" className="animate-fade-in">
            <CollapsibleSection
              id="short-form"
              title="Short Form Content"
              subtitle="Reels, TikToks & Social Clips"
              defaultOpen
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortVideos.map((v, i) => (
                  <ScrollReveal key={v.link} delay={i * 0.05}>
                    <ShortCard v={v} />
                  </ScrollReveal>
                ))}
              </div>
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="long" className="animate-fade-in">
            <CollapsibleSection
              id="long-form"
              title="Long Form Content"
              subtitle="Brand Films, Documentaries & Campaign Videos"
              defaultOpen
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {longVideos.map((v, i) => (
                  <ScrollReveal key={v.title} delay={i * 0.08}>
                    <LongCard v={v} />
                  </ScrollReveal>
                ))}
              </div>
            </CollapsibleSection>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
