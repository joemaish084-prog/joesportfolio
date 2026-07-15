import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users } from "lucide-react";
import { ParticlesBackground } from "./ParticlesBackground";
import Aurora from "./Aurora";



const typingTitles = [
  "Digital Marketing Specialist",
  "SEO Expert Nairobi",
  "Content Strategist",
  "Social Media Manager Kenya",
  "Meta Ads Specialist",
  "Available for Hire 2026",
];

function useTypingEffect(titles: string[]) {
  const [display, setDisplay] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = titles[titleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && display === current) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && display === "") {
      setIsDeleting(false);
      setTitleIndex((i) => (i + 1) % titles.length);
    } else {
      const speed = isDeleting ? 30 : 60;
      timeout = setTimeout(() => {
        setDisplay(isDeleting ? current.slice(0, display.length - 1) : current.slice(0, display.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [display, isDeleting, titleIndex, titles]);

  return display;
}

function FloatingTag({ tag, index, mouseX, mouseY }: { tag: typeof tags[0]; index: number; mouseX: any; mouseY: any }) {
  const intensity = 40 + (index % 3) * 15;
  const moveX = useTransform(mouseX, (val: number) => val * -intensity);
  const moveY = useTransform(mouseY, (val: number) => val * -intensity);
  const smoothX = useSpring(moveX, { damping: 12 + index * 1.5, stiffness: 50 + index * 5 });
  const smoothY = useSpring(moveY, { damping: 12 + index * 1.5, stiffness: 50 + index * 5 });

  const { label, ...position } = tag;

  return (
    <motion.div
      style={{ position: "absolute", ...position, x: smoothX, y: smoothY }}
      className="hidden md:block z-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.1 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, index % 2 === 0 ? 4 : -4, 0] }}
        transition={{ duration: 3.5 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{
          scale: 1.12,
          boxShadow: "0 0 20px hsl(var(--orange) / 0.5), 0 0 40px hsl(var(--orange) / 0.25), 0 8px 32px hsl(var(--orange) / 0.3)",
          borderColor: "hsl(var(--orange) / 0.4)",
          transition: { duration: 0.2 },
        }}
        className="px-5 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-muted-foreground shadow-[0_2px_16px_hsl(var(--orange)/0.1)] backdrop-blur-sm cursor-default transition-shadow duration-300"
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const typedTitle = useTypingEffect(typingTitles);

  // Cache rect via ResizeObserver to avoid forced reflow on mousemove
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      rectRef.current = el.getBoundingClientRect();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = rectRef.current;
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen bg-background overflow-hidden"
    >
      {/* Aurora background */}
      <div className="absolute inset-0 z-0 opacity-60 md:opacity-80 pointer-events-none">
        <Aurora
          colorStops={["#F97316", "#0a0a0a", "#F97316"]}
          blend={0.6}
          amplitude={1.2}
          speed={0.4}
        />
      </div>

      {/* Particles */}
      <ParticlesBackground />

      {tags.map((tag, index) => (
        <FloatingTag key={index} tag={tag} index={index} mouseX={mouseX} mouseY={mouseY} />
      ))}

      <div className="flex flex-col items-center justify-center text-center min-h-screen px-4 sm:px-6 md:px-8 relative z-20">
        {/* Typing title above name */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs sm:text-sm md:text-base font-medium text-primary mb-3 sm:mb-4 tracking-wide uppercase min-h-[1.5rem] flex flex-wrap items-center justify-center gap-x-1"
        >
          <span className="whitespace-nowrap">
            {typedTitle}
            <span className="animate-pulse">|</span>
          </span>
          <span className="text-muted-foreground whitespace-nowrap">· Nairobi, Kenya</span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight leading-tight max-w-4xl"
        >
          Digital Marketing Specialist
          <span className="text-gradient"> &amp; Agency Owner </span>
          | Nairobi, Kenya
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-center px-2"
        >
          I help Kenyan brands and businesses grow online through Meta Ads, Google Ads, TikTok, SEO and Social Media Marketing. Based in Nairobi, Kenya.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col items-center gap-4 w-full sm:w-auto"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto shadow-elegant text-base btn-hover" asChild>
              <a href="#experience">
                <Briefcase className="mr-2 h-5 w-5" />
                Hire Me{"\u00a0"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-primary/5 text-base btn-hover" asChild>
              <Link to="/agency">
                <Users className="mr-2 h-5 w-5" />
                Work With Me as a Client
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xl px-4 leading-relaxed">
            Looking for a digital marketing specialist in Nairobi? Whether you need Meta Ads management, Google Ads campaigns, TikTok marketing, SEO services or a full digital marketing strategy — I deliver real measurable results for Kenyan brands and businesses.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
