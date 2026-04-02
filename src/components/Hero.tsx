import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Briefcase } from "lucide-react";
import { ParticlesBackground } from "./ParticlesBackground";

const rotatingLines = [
  "I turn ideas into assets and attention into revenue.",
  "Creative strategy that moves culture, and the numbers.",
  "I don't just design content. I engineer impact.",
  "From concept to conversion, I build what performs.",
  "Where storytelling meets measurable growth.",
  "I build campaigns that turn attention into measurable growth.",
];

const typingTitles = [
  "Digital Marketing Specialist",
  "SEO Expert",
  "Content Strategist",
  "Social Media Marketer",
  "Available for Full-Time Roles",
];

const tags = [
  { label: "Content Strategy", top: "8%", left: "4%" },
  { label: "Brand Storytelling", top: "4%", left: "24%" },
  { label: "Performance Marketing", top: "10%", left: "48%" },
  { label: "Video Production", top: "20%", left: "36%" },
  { label: "Meta Ads", top: "6%", right: "22%" },
  { label: "Google Ads", top: "12%", right: "6%" },
  { label: "SEO Optimization", top: "40%", right: "8%" },
  { label: "Social Media Growth", top: "55%", right: "4%" },
  { label: "Creative Direction", bottom: "18%", left: "40%" },
  { label: "Analytics & Insights", bottom: "14%", right: "20%" },
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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isMobile = useIsMobile();
  const [currentLine, setCurrentLine] = useState(0);
  const typedTitle = useTypingEffect(typingTitles);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % rotatingLines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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
          Creative Strategy
          <span className="text-gradient"> Meets </span>
          Visual Storytelling
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-6 min-h-[3.5em] sm:min-h-[2.5em] relative overflow-visible max-w-2xl w-full"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentLine}
              initial={{ y: isMobile ? 0 : 30, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: isMobile ? 0 : -30, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground absolute inset-0 flex items-center justify-center px-2"
            >
              <span className="inline-block text-center">
                {rotatingLines[currentLine]}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
                  className="block h-[2px] mt-1 bg-gradient-to-r from-primary to-orange-light origin-left"
                />
              </span>
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <Button size="lg" className="w-full sm:w-auto shadow-elegant text-base btn-hover" asChild>
            <a href="#graphic-design">
              View My Work
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-primary/5 text-base btn-hover" asChild>
            <a href="#contact">
              <Briefcase className="mr-2 h-5 w-5" />
              Hire Me
            </a>
          </Button>
          <Button size="lg" variant="ghost" className="w-full sm:w-auto text-base btn-hover" asChild>
            <a href="#contact">
              <Mail className="mr-2 h-5 w-5" />
              Contact Me
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
