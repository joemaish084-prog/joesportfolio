import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/HeroBackground";
import { ChevronDown } from "lucide-react";

const appleEase = [0.22, 1, 0.36, 1] as const;

const proofStats = [
  { value: "4M+", label: "TikTok views on a single campaign" },
  { value: "KES 500K+", label: "Monthly ad budgets managed" },
  { value: "120+", label: "Units sold in one campaign window" },
  { value: "3+", label: "Years in digital marketing" },
];

type Tag = { label: string; top?: string; left?: string; right?: string; bottom?: string };

const tags: Tag[] = [
  { label: "Content Strategy", top: "-6%", left: "-10%" },
  { label: "Meta Ads", top: "10%", right: "-14%" },
  { label: "Google Ads", bottom: "12%", left: "-16%" },
  { label: "SEO Optimization", bottom: "-6%", right: "-8%" },
];

function FloatingTag({ tag, index, mouseX, mouseY }: { tag: Tag; index: number; mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const moveX = useTransform(mouseX, (v) => v * 14);
  const moveY = useTransform(mouseY, (v) => v * 14);
  const smoothX = useSpring(moveX, { damping: 20, stiffness: 100 });
  const smoothY = useSpring(moveY, { damping: 20, stiffness: 100 });
  const { label, ...position } = tag;

  return (
    <motion.div
      style={{ position: "absolute", ...position, x: smoothX, y: smoothY }}
      className="hidden lg:block z-20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 + index * 0.1, duration: 0.5, ease: appleEase }}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3 + index * 0.2, repeat: Infinity, ease: appleEase }}
        className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-md text-xs font-medium text-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] whitespace-nowrap"
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

function ProofPanel({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const [statIndex, setStatIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStatIndex((i) => (i + 1) % proofStats.length), 2800);
    return () => clearInterval(id);
  }, []);

  const rotateX = useSpring(useTransform(mouseY, (v) => v * -6), { damping: 25, stiffness: 150 });
  const rotateY = useSpring(useTransform(mouseX, (v) => v * 6), { damping: 25, stiffness: 150 });

  const stat = proofStats[statIndex];

  return (
    <div className="relative mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
      {tags.map((tag, i) => (
        <FloatingTag key={tag.label} tag={tag} index={i} mouseX={mouseX} mouseY={mouseY} />
      ))}

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: appleEase }}
        className="relative z-10 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent" />

        <div className="relative flex items-center gap-2 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[11px] uppercase tracking-widest text-white/50 font-medium">Live results</span>
        </div>

        <div className="relative h-28 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: appleEase }}
            >
              <p className="text-5xl sm:text-6xl font-display font-bold text-white tracking-tight">{stat.value}</p>
              <p className="mt-2 text-sm text-white/50 max-w-[220px]">{stat.label}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative mt-8 flex items-center gap-1.5">
          {proofStats.map((s, i) => (
            <span key={s.value} className={`h-1 rounded-full transition-all duration-500 ${i === statIndex ? "w-6 bg-primary" : "w-1.5 bg-white/15"}`} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
    containerRef.current.style.setProperty("--spot-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    containerRef.current.style.setProperty("--spot-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="scroll-mt-20 lg:scroll-mt-24 relative w-full min-h-screen bg-[#08090a] overflow-hidden"
    >
      <HeroBackground />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 gap-16 items-center px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto py-32 lg:py-20">
        <div className="text-left">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: appleEase }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-md text-xs font-medium text-white/70 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Digital Marketing Specialist — Nairobi, Kenya
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: appleEase }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white max-w-xl"
          >
            Creative Strategy
            <span className="text-primary"> Meets </span>
            Visual Storytelling
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5, ease: appleEase }}
            className="mt-6 text-lg text-white/55 max-w-md"
          >
            I build campaigns that turn attention into measurable growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.5, ease: appleEase }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto rounded-full" asChild>
              <a href="#videos">View My Work</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <a href="#contact">Contact Me</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: appleEase }}
            className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6"
          >
            {[
              ["KES 500K+", "Ad budgets managed"],
              ["4M+", "TikTok views"],
              ["3+", "Years experience"],
            ].map(([value, label]) => (
              <div key={value}>
                <p className="text-lg font-display font-semibold text-white">{value}</p>
                <p className="text-xs text-white/45">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="hidden lg:block">
          <ProofPanel mouseX={mouseX} mouseY={mouseY} />
        </div>
      </div>

      <motion.a
        href="#videos"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
        aria-label="Scroll to see more"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: appleEase }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
