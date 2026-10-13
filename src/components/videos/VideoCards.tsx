import { useState } from "react";
import { Play, Volume2, Film, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FEATURED_VIDEO,
  featuredThumbnail,
  type LongVideo,
  type Platform,
  type ShortVideo,
} from "@/data/videos";

/** "2025-11-18" -> "Nov 2025" */
export function formatUploadDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

const SITE_URL = "https://www.josephmaina.co.ke";

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
  const isLong = "description" in v && !!v.description;
  const description = isLong
    ? (v as LongVideo).description
    : (v as ShortVideo).description ||
      `${v.title} — ${v.platform} video by Joseph Maina, Digital Marketing Specialist in Nairobi, Kenya.`;
  const iso = durationToISO8601(v.duration);
  const ytId = getYouTubeId(v.link);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description,
    thumbnailUrl: [absUrl(v.thumbnail)],
    uploadDate: v.uploadDate,
    contentUrl: v.link,
    publisher: {
      "@type": "Person",
      name: "Joseph Maina",
      url: SITE_URL,
    },
  };
  if (iso) schema.duration = iso;
  if (ytId) schema.embedUrl = `https://www.youtube.com/embed/${ytId}`;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function ShortCard({ v, showDate = false }: { v: ShortVideo; showDate?: boolean }) {
  return (
    <a
      href={v.link}
      target="_blank"
      rel="noopener noreferrer"
      title={`Watch ${v.title} — ${v.platform} short-form video by Joseph Maina`}
      className="corner-brackets group relative block overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.25)] hover:-translate-y-1"
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
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1">
          <Badge className={`${platformStyles[v.platform]} border-0 shadow-elegant px-2 sm:px-2.5 text-[11px] sm:text-xs font-semibold`}>
            {v.platform}
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm px-2 sm:px-2.5 text-[11px] sm:text-xs">
            <Clock className="h-3 w-3 mr-1" /> {v.duration}
          </Badge>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-11 w-11 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary shadow-elegant transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 sm:h-8 sm:w-8 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h4 className="font-display text-sm sm:text-base font-bold text-white drop-shadow-lg line-clamp-2">{v.title}</h4>
          {showDate && <p className="mt-1 text-xs text-white/70">{formatUploadDate(v.uploadDate)}</p>}
        </div>
      </div>
    </a>
  );
}

export function LongCard({ v }: { v: LongVideo }) {
  const isPlaceholder = v.link === "#";
  const youtubeId = getYouTubeId(v.link);
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="corner-brackets group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_50px_hsl(var(--primary)/0.25)] hover:-translate-y-1"
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

export function FeaturedVideo() {
  const [playing, setPlaying] = useState(false);

  const featuredSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: FEATURED_VIDEO.title,
    description: FEATURED_VIDEO.description,
    thumbnailUrl: [absUrl(featuredThumbnail)],
    uploadDate: "2024-11-20",
    duration: "PT12M18S",
    contentUrl: FEATURED_VIDEO.watchUrl,
    embedUrl: `https://www.youtube.com/embed/${FEATURED_VIDEO.youtubeId}`,
    publisher: {
      "@type": "Person",
      name: "Joseph Maina",
      url: SITE_URL,
    },
  };

  return (
    <div className="corner-brackets relative overflow-hidden rounded-2xl border border-border shadow-elegant group">
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
              src={featuredThumbnail}
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
              className="absolute top-2 right-2 sm:top-6 sm:right-6 z-20 inline-flex items-center justify-center gap-2 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded-full bg-primary px-3 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-105"
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
        <div className="md:hidden p-5 space-y-1 bg-card border-t border-border">
          <h3 className="font-display text-lg font-bold leading-snug">
            {FEATURED_VIDEO.title}
          </h3>
          <a
            href={FEATURED_VIDEO.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-11 text-sm font-medium text-primary hover:underline"
          >
            Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
