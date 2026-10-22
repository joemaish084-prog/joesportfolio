import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { designs } from "@/data/designs";
import iclearEngineered from "@/assets/design-iclear-engineered.webp";
import conveyCover from "@/assets/convey-podcast-thumbnail.webp";
import iclearDishwash from "@/assets/short-iclear-dishwash.webp";
import communityEvent from "@/assets/agency/iclear-community-event.webp";
import handover from "@/assets/agency/iclear-handover.webp";

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
        initial={{ opacity: 0, scale: 0.85, rotate: 0, y: 40 }}
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
          initial={{ opacity: 0, y: 30, rotate: 0 }}
          animate={{ opacity: 1, y: i === 1 ? -12 : 0, rotate: (i - 1) * 7 }}
          transition={{ delay: 0.45 + i * 0.1, duration: 0.7, ease: EASE }}
          className={`relative w-28 sm:w-36 aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl ${i === 1 ? "z-10 -mx-4" : ""}`}
        >
          <img src={item.src} alt="" className="h-full w-full object-cover object-top" />
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fieldwork: on-the-ground proof for the "Why" section.               */
/* ------------------------------------------------------------------ */

export function FieldworkVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div ref={ref} className="relative pb-10 pr-6 sm:pr-10">
      <motion.figure
        initial={{ clipPath: "inset(10% 10% 10% 10% round 24px)", opacity: 0 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)", opacity: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1, ease: EASE }}
        className="relative aspect-[4/3] lg:aspect-square overflow-hidden rounded-3xl bg-muted"
      >
        <motion.img
          src={communityEvent}
          alt="The iClear team with Baobab School students and staff at the water purifier handover"
          loading="lazy"
          decoding="async"
          style={{ y: imgY, scale: 1.14 }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <figcaption className="absolute bottom-0 left-0 right-0 p-5 pr-32 sm:p-7 sm:pr-44 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">In the field · iClear Kenya</p>
          <p className="mt-2 max-w-sm font-display text-lg sm:text-xl font-semibold leading-snug">
            A CSR campaign that reached 90 students and earned Daily Nation coverage.
          </p>
          <Link
            to="/agency/blog/how-i-landed-national-press-coverage-for-iclear"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white"
          >
            Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </figcaption>
      </motion.figure>

      <motion.div
        initial={{ opacity: 0, x: 40, rotate: 0 }}
        whileInView={{ opacity: 1, x: 0, rotate: 4 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ delay: 0.45, duration: 0.8, ease: EASE }}
        className="absolute bottom-0 right-0 w-32 sm:w-44 overflow-hidden rounded-2xl border-4 border-background shadow-2xl"
      >
        <img
          src={handover}
          alt="iClear team handing over water purifier units at Baobab School"
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-cover"
        />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Creative showcase: two counter-scrolling rows of shipped work.      */
/* ------------------------------------------------------------------ */

const ROW_A = [
  "Fuel Your Grind", "Download PowWater Today", "TECNO x iClear Collaboration", "School Admission 2026",
  "Free Filter Campaign", "Weekend Basket Bonanza", "iClear Engineered for Home", "MKUSH Music Album Cover",
];
const ROW_B = [
  "TECNO Product Campaign", "We Handle The Heavy Lifting", "Fresh Living", "Innovative Learning",
  "Standard Water Purifier", "iClear Nakuru Location", "TECNO Mobile Promotion", "iClear Brand Campaign",
];

const pick = (titles: string[]) =>
  titles.map((t) => designs.find((d) => d.title === t)).filter((d): d is (typeof designs)[number] => Boolean(d));

function ShowcaseTile({ title, image, description }: { title: string; image: string; description: string }) {
  return (
    <figure className="group relative w-44 sm:w-56 aspect-[4/5] shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted">
      <img
        src={image}
        alt={`${title}: ${description}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/85 to-transparent p-4 pt-10 text-white transition-transform duration-300 group-hover:translate-y-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="mt-0.5 text-xs text-white/75">{description}</p>
      </figcaption>
    </figure>
  );
}

export function CreativeShowcase() {
  const rowA = pick(ROW_A);
  const rowB = pick(ROW_B);

  return (
    <section className="py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="container mx-auto px-4 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-6xl"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Creative that ships</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold">
            Ads and content I've made for <span className="text-gradient">real brands</span>
          </h2>
        </div>
        <Link to="/work/design" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all shrink-0">
          See the full portfolio <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </motion.div>

      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <Marquee pauseOnHover repeat={2} className="[--duration:60s]">
          {rowA.map((d) => <ShowcaseTile key={d.title} {...d} />)}
        </Marquee>
        <Marquee pauseOnHover reverse repeat={2} className="[--duration:70s]">
          {rowB.map((d) => <ShowcaseTile key={d.title} {...d} />)}
        </Marquee>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared image header with a hover zoom, used on service + case cards. */
/* ------------------------------------------------------------------ */

export function CardCover({ src, alt, className = "aspect-[16/10]", position = "object-center", children }: {
  src: string;
  alt: string;
  className?: string;
  position?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${position} transition-transform duration-700 ease-out group-hover:scale-105`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      {children}
    </div>
  );
}
