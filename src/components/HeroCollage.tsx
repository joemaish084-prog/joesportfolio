import { type ReactNode } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Play } from "lucide-react";
import { localImageProps } from "@/lib/imageVariants";
import iclearEngineered from "@/assets/design-iclear-engineered.webp";
import conveyCover from "@/assets/convey-podcast-thumbnail.webp";
import iclearDishwash from "@/assets/short-iclear-dishwash.webp";

const EASE = [0.22, 1, 0.36, 1] as const;

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

function CollageCard({ item, mouseX, mouseY, index }: { item: CollageItem; mouseX: MotionValue<number>; mouseY: MotionValue<number>; index: number }) {
  const x = useSpring(useTransform(mouseX, (v) => v * item.depth), { damping: 25, stiffness: 120 });
  const y = useSpring(useTransform(mouseY, (v) => v * item.depth), { damping: 25, stiffness: 120 });

  return (
    <motion.div style={{ x, y }} className={`absolute ${item.className}`}>
      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1, rotate: item.rotate, y: 0 }}
        transition={{ delay: item.delay, duration: 0.8, ease: EASE }}
        className="h-full w-full"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: 1.2 + index * 0.4 }}
          className="group relative h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl"
        >
          <img
            src={item.src}
            {...localImageProps(item.src, "(min-width: 1024px) 240px, 112px")}
            alt={item.alt}
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
            {item.tag}
          </span>
          {item.video && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <Play className="ml-0.5 h-4 w-4 fill-primary text-primary" aria-hidden />
              </span>
            </span>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function HeroCollage({
  mouseX,
  mouseY,
  children,
  items = collage,
  panelClassName = "left-[6%] top-[30%] w-[19rem]",
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  children: ReactNode;
  items?: CollageItem[];
  panelClassName?: string;
}) {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-lg">
      {items.map((item, i) => (
        <CollageCard key={item.src} item={item} mouseX={mouseX} mouseY={mouseY} index={i} />
      ))}
      <div className={`absolute z-10 ${panelClassName}`}>{children}</div>
    </div>
  );
}

/** Compact fanned stack for small screens, where the full collage would crowd the CTAs. */
export function HeroCollageMobile({ items = collage }: { items?: CollageItem[] }) {
  return (
    <div className="mt-12 flex justify-center lg:hidden" aria-hidden>
      {items.map((item, i) => (
        <motion.div
          key={item.src}
          initial={false}
          animate={{ opacity: 1, y: i === 1 ? -12 : 0, rotate: (i - 1) * 7 }}
          transition={{ delay: 0.45 + i * 0.1, duration: 0.7, ease: EASE }}
          className={`relative w-28 sm:w-36 aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl ${i === 1 ? "z-10 -mx-4" : ""}`}
        >
          <img src={item.src} {...localImageProps(item.src, "(min-width: 640px) 144px, 112px")} alt="" decoding="async" className="h-full w-full object-cover object-top" />
        </motion.div>
      ))}
    </div>
  );
}

