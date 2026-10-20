import { videoImageProps } from "@/lib/videoImages";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, ExternalLink, Film, Pause, Play, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FEATURED_VIDEO,
  featuredThumbnail,
  longVideos,
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

export interface FeaturedFilm {
  youtubeId: string;
  title: string;
  description: string;
  watchUrl: string;
  thumbnail: string;
  uploadDate: string;
  duration: string;
}

const defaultFeaturedFilm: FeaturedFilm = {
  ...FEATURED_VIDEO,
  thumbnail: featuredThumbnail,
  uploadDate: "2024-11-20",
  duration: "12:18",
};

function toFeaturedFilm(v: LongVideo): FeaturedFilm {
  return {
    youtubeId: getYouTubeId(v.link) ?? "",
    title: v.title,
    description: v.description,
    watchUrl: v.link,
    thumbnail: v.thumbnail,
    uploadDate: v.uploadDate,
    duration: v.duration,
  };
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
          {...videoImageProps(v.thumbnail, "(min-width: 1400px) 320px, (min-width: 1024px) 25vw, 50vw")}
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
              {...videoImageProps(v.thumbnail, "(min-width: 1024px) 50vw, 100vw")}
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

export function FeaturedVideo({
  video = defaultFeaturedFilm,
  onPlay,
}: {
  video?: FeaturedFilm;
  /** Called once the visitor starts the film with sound. */
  onPlay?: () => void;
} = {}) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (playing) onPlay?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPreviewVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const featuredSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [absUrl(video.thumbnail)],
    uploadDate: video.uploadDate,
    duration: durationToISO8601(video.duration),
    contentUrl: video.watchUrl,
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    publisher: {
      "@type": "Person",
      name: "Joseph Maina",
      url: SITE_URL,
    },
  };

  return (
    <div ref={containerRef} className="corner-brackets relative overflow-hidden rounded-2xl border border-border shadow-elegant group">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredSchema) }} />
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            <img
              src={video.thumbnail}
              {...videoImageProps(video.thumbnail, "(min-width: 1280px) 1200px, 100vw")}
              alt={`${video.title}: featured brand film thumbnail`}
              width={1280}
              height={720}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {/* Only the featured film autoplays, once it approaches the viewport. */}
            {previewVisible && <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&loop=1&controls=0&rel=0&playsinline=1&playlist=${video.youtubeId}`}
              title={`${video.title}: muted preview`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="absolute inset-0 h-full w-full pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            />}
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
              aria-label={`Play ${video.title}`}
            >
              <span className="flex h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-primary shadow-elegant group-hover/play:scale-110" style={{ transition: "transform 0.3s" }}>
                <Play className="ml-0.5 h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary-foreground" fill="currentColor" />
              </span>
            </button>

            {/* Desktop overlay title (hidden on mobile) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10 pointer-events-none hidden md:block">
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-white drop-shadow-2xl max-w-3xl">
                {video.title}
              </h3>
              <a
                href={video.watchUrl}
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
            {video.title}
          </h3>
          <a
            href={video.watchUrl}
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

const FILM_ROTATE_SECONDS = 30;

/**
 * Rotates the featured film through every long-form video: the pinned
 * featured film first, then the rest newest first. Stops for good once a
 * visitor plays one with sound.
 */
export function FeaturedVideoRotator() {
  const [films] = useState(() => {
    const pinned = longVideos.filter((v) => v.link === FEATURED_VIDEO.watchUrl);
    const rest = longVideos.filter((v) => v.link !== FEATURED_VIDEO.watchUrl);
    return [...pinned, ...rest].filter((v) => getYouTubeId(v.link)).map(toFeaturedFilm);
  });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [hovering, setHovering] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const film = films[index];
  const stopped = paused || watching;
  const running = !stopped && !hovering && !tabHidden;
  const go = (delta: number) => {
    setWatching(false);
    setIndex((i) => (i + delta + films.length) % films.length);
  };

  if (films.length < 2) return <FeaturedVideo />;

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Featured films"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovering(false);
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Featured films</p>
        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs tabular-nums text-muted-foreground">
            {index + 1} / {films.length}
          </span>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous featured film"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            disabled={watching}
            aria-label={paused ? "Resume rotating featured films" : "Pause rotating featured films"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
          >
            {stopped ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next featured film"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* The bar is the timer: when its animation finishes, the next film shows. */}
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-border" aria-hidden="true">
        {!stopped && (
          <div
            key={film.youtubeId}
            className="h-full origin-left rounded-full bg-primary"
            style={{
              animation: `featured-progress ${FILM_ROTATE_SECONDS}s linear forwards`,
              animationPlayState: running ? "running" : "paused",
            }}
            onAnimationEnd={() => go(1)}
          />
        )}
      </div>

      <div key={film.youtubeId} className="animate-fade-in" aria-live={running ? "off" : "polite"}>
        <FeaturedVideo video={film} onPlay={() => setWatching(true)} />
      </div>
    </div>
  );
}
