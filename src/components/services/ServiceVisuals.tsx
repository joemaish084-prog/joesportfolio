import { useState, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ServiceVisual, ServiceVisuals } from "@/data/serviceVisuals";
import { unsplashImageProps } from "@/lib/responsiveImage";

/** src, srcSet and size for an image: resized variants for Unsplash, the file itself otherwise. */
function imageProps(visual: ServiceVisual, sizes: string) {
  const resized = unsplashImageProps(visual.src, sizes);
  return { src: visual.src, ...resized, width: visual.width, height: visual.height, alt: visual.alt };
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hero image for a service page: the main image tilts gently towards the
 * pointer, with a second image layered over its corner. Static when the
 * visitor prefers reduced motion.
 */
export function ServiceHeroVisual({ visuals }: { visuals: ServiceVisuals }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 18 });
  const accentX = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });
  const accentY = useSpring(useTransform(y, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 });

  const track = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const { hero, accent } = visuals;
  const wideAccent = accent ? accent.width / accent.height > 1.3 : false;
  return (
    <div onPointerMove={track} onPointerLeave={reset} className="relative mx-auto w-full max-w-sm pb-10 pl-8 [perspective:1000px] lg:max-w-none">
      <motion.figure
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        className="relative overflow-hidden rounded-3xl bg-[#F3F3F3] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)]"
      >
        <img
          {...imageProps(hero, "(min-width: 1024px) 380px, 384px")}
          fetchPriority="high"
          className="aspect-[4/5] w-full object-cover"
        />
        <figcaption className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#111111] shadow-sm backdrop-blur">
          {visuals.heroLabel}
        </figcaption>
      </motion.figure>
      {accent && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          style={reduceMotion ? undefined : { x: accentX, y: accentY }}
          className={`absolute bottom-0 left-0 ${wideAccent ? "w-[68%]" : "w-[46%]"} overflow-hidden rounded-2xl border-4 border-white bg-[#F3F3F3] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]`}
        >
          <img
            {...imageProps(accent, "260px")}
            loading="lazy"
            className={`${wideAccent ? "aspect-[2/1]" : "aspect-square"} w-full object-cover`}
          />
        </motion.div>
      )}
    </div>
  );
}

/** Grid of real work. Each image opens full size; arrow keys move between them. */
export function ServiceGallery({ title, intro, items }: { title: string; intro: string; items: ServiceVisual[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const current = open === null ? undefined : items[open];
  const step = (delta: number) => setOpen((i) => (i === null ? i : (i + delta + items.length) % items.length));

  return (
    <section className="mt-20" aria-labelledby="service-gallery">
      <h2 id="service-gallery" className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#555555]">{intro}</p>
      <ul className={`mt-7 grid grid-cols-2 gap-4 ${items.length >= 4 ? "lg:grid-cols-4" : "sm:grid-cols-3"}`}>
        {items.map((item, i) => (
          <motion.li
            key={item.src}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden rounded-2xl bg-[#F3F3F3] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
              aria-label={`View full size: ${item.caption}`}
            >
              <img
                {...imageProps(item, "(min-width: 1024px) 240px, 50vw")}
                loading="lazy"
                className={`aspect-[4/5] w-full transition-transform duration-500 ease-out motion-safe:group-hover:scale-105 ${
                  item.width / item.height > 1.8 ? "bg-[#111111] object-contain" : "object-cover"
                }`}
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-10 text-xs font-medium leading-snug text-white opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                <span>{item.caption}</span>
                <Expand className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent
          className="max-w-4xl border-0 bg-[#111111] p-3 text-white sm:p-4"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          {current && (
            <figure>
              <img
                {...imageProps(current, "(min-width: 896px) 860px, 100vw")}
                className="mx-auto max-h-[75vh] w-auto rounded-lg object-contain"
              />
              <figcaption className="mt-3 flex items-center justify-between gap-4 px-1">
                <div>
                  <DialogTitle className="text-sm font-semibold">{current.caption}</DialogTitle>
                  <DialogDescription className="mt-0.5 text-xs text-[#AAAAAA]">
                    {open! + 1} of {items.length}
                  </DialogDescription>
                </div>
                {items.length > 1 && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => step(1)} aria-label="Next image" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/**
 * A photo set beside a section's content. Short and wide on phones, tall and
 * sticky beside the content on large screens.
 */
export function ServiceSideImage({ visual, className = "" }: { visual: ServiceVisual; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.figure
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`group relative overflow-hidden rounded-3xl bg-[#F3F3F3] lg:sticky lg:top-28 ${className}`}
    >
      <img
        {...imageProps(visual, "(min-width: 1024px) 340px, 100vw")}
        loading="lazy"
        className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105 lg:aspect-[4/5]"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-5 pt-14 text-sm font-medium leading-snug text-white">
        {visual.caption}
      </figcaption>
    </motion.figure>
  );
}
