import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Briefcase } from "lucide-react";

const rotatingLines = [
  "I turn ideas into assets and attention into revenue.",
  "Creative strategy that moves culture, and the numbers.",
  "I don't just design content. I engineer impact.",
  "From concept to conversion, I build what performs.",
  "Where storytelling meets measurable growth.",
  "I build campaigns that turn attention into measurable growth.",
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

function FloatingTag({ tag, index, mouseX, mouseY }: { tag: typeof tags[0]; index: number; mouseX: any; mouseY: any }) {
  const intensity = 40 + (index % 3) * 15;
  const moveX = useTransform(mouseX, (val: number) => val * -intensity);
  const moveY = useTransform(mouseY, (val: number) => val * -intensity);
  const smoothX = useSpring(moveX, { damping: 12 + index * 1.5, stiffness: 50 + index * 5 });
  const smoothY = useSpring(moveY, { damping: 12 + index * 1.5, stiffness: 50 + index * 5 });

  const { label, ...position } = tag;

  return (
    <motion.div
      style={{
        position: "absolute",
        ...position,
        x: smoothX,
        y: smoothY,
      }}
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % rotatingLines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen bg-background overflow-hidden"
    >
      {tags.map((tag, index) => (
        <FloatingTag key={index} tag={tag} index={index} mouseX={mouseX} mouseY={mouseY} />
      ))}

      <div className="flex flex-col items-center justify-center text-center min-h-screen px-6 relative z-20">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-sm sm:text-base font-medium text-primary mb-4 tracking-wide uppercase"
        >
          Digital Marketing Specialist · Nairobi, Kenya
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-tight"
        >
          Joseph Maina — Creative Strategy
          <span className="text-gradient"> Meets </span>
          Visual Storytelling
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 h-[2em] sm:h-[1.8em] relative overflow-hidden max-w-2xl w-full"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentLine}
              initial={{ y: isMobile ? 0 : 30, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: isMobile ? 0 : -30, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl text-muted-foreground absolute inset-0 flex items-center justify-center"
            >
              <span className="inline-block">
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-base text-muted-foreground max-w-xl"
        >
          I help brands across Kenya and beyond grow through video production, graphic design,
          social media management, and data-driven digital marketing campaigns.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button size="lg" className="w-full sm:w-auto shadow-elegant text-base" asChild>
            <a href="#graphic-design">
              View My Work
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-primary/5 text-base" asChild>
            <a href="#contact">
              <Briefcase className="mr-2 h-5 w-5" />
              Hire Me
            </a>
          </Button>
          <Button size="lg" variant="ghost" className="w-full sm:w-auto text-base" asChild>
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
