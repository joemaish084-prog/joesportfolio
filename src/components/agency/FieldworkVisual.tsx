import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import communityEvent from "@/assets/agency/iclear-community-event.webp";
import handover from "@/assets/agency/iclear-handover.webp";

const EASE = [0.22, 1, 0.36, 1] as const;

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
