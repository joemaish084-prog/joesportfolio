import { type ReactNode } from "react";
import { Play } from "lucide-react";
import { localImageProps } from "@/lib/imageVariants";
import iclearEngineered from "@/assets/design-iclear-engineered.webp";
import conveyCover from "@/assets/convey-podcast-thumbnail.webp";
import iclearDishwash from "@/assets/short-iclear-dishwash.webp";

/* ------------------------------------------------------------------ */
/* Hero collage: real client creative fanned behind the proof panel.  */
/* ------------------------------------------------------------------ */

export type CollageItem = {
  src: string;
  alt: string;
  tag: string;
  className: string;
  rotate: number;
  depth: number;
  delay: number;
  video?: boolean;
};

const collage: CollageItem[] = [
  {
    src: iclearEngineered,
    alt: "iClear 'Engineered for your home' holiday campaign poster",
    tag: "Meta Ads",
    className: "left-0 top-4 w-52 aspect-[4/5]",
    rotate: -7,
    depth: 14,
    delay: 0.25,
  },
  {
    src: conveyCover,
    alt: "Convey with Caroline podcast cover artwork",
    tag: "Content",
    className: "right-0 top-0 w-44 aspect-square",
    rotate: 6,
    depth: 24,
    delay: 0.35,
  },
  {
    src: iclearDishwash,
    alt: "Still from an iClear short-form installation video",
    tag: "TikTok",
    className: "right-4 bottom-0 w-40 aspect-[3/4]",
    rotate: 5,
    depth: 30,
    delay: 0.45,
    video: true,
  },
];

export function CollageArtwork({ item, loading }: { item: CollageItem; loading: "lazy" | "eager" }) {
  return <>
    <img
      src={item.src}
      {...localImageProps(item.src, "208px")}
      alt={item.alt}
      loading={loading}
      decoding="async"
      className="h-full w-full object-cover object-top"
    />
    <span className="absolute left-2.5 top-2.5 rounded-full bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
      {item.tag}
    </span>
    {item.video && (
      <span aria-hidden className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <Play className="ml-0.5 h-4 w-4 fill-primary text-primary" />
        </span>
      </span>
    )}
  </>;
}

export function HeroCollage({
  children,
  loading = "lazy",
}: {
  children: ReactNode;
  loading?: "lazy" | "eager";
}) {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-lg">
      {collage.map(item => (
        <div key={item.src} className={`absolute overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl ${item.className}`} style={{ rotate: `${item.rotate}deg` }}>
          <CollageArtwork item={item} loading={loading} />
        </div>
      ))}
      <div className="absolute left-[6%] top-[30%] z-10 w-[19rem]">{children}</div>
    </div>
  );
}

/** Compact fanned stack for small screens, where the full collage would crowd the CTAs. */
export function HeroCollageMobile({ items = collage, loading }: { items?: CollageItem[]; loading?: "lazy" | "eager" }) {
  return (
    <div className="mt-8 flex justify-center sm:mt-12 lg:hidden">
      {items.map((item, i) => (
        <div
          key={item.src}
          style={{ transform: `translateY(${i === 1 ? -12 : 0}px) rotate(${(i - 1) * 7}deg)` }}
          className={`relative w-28 sm:w-36 aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl ${i === 1 ? "z-10 -mx-4" : ""}`}
        >
          <img src={item.src} {...localImageProps(item.src, "(min-width: 640px) 144px, 112px")} alt={item.alt} loading={loading} decoding="async" className="h-full w-full object-cover object-top" />
        </div>
      ))}
    </div>
  );
}

