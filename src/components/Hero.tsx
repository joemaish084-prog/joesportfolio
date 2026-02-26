import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

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
  const moveX = useTransform(mouseX, (val: number) => val * 20);
  const moveY = useTransform(mouseY, (val: number) => val * 20);
  const smoothX = useSpring(moveX, { damping: 20, stiffness: 100 });
  const smoothY = useSpring(moveY, { damping: 20, stiffness: 100 });

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
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3 + index * 0.2, repeat: Infinity }}
        className="px-4 py-2 bg-card border border-border rounded-xl shadow-soft text-sm text-muted-foreground"
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
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-tight"
        >
          Creative Strategy
          <span className="text-gradient"> Meets </span>
          Visual Storytelling
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl"
        >
          I build campaigns that turn attention into measurable growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button size="lg" className="w-full sm:w-auto shadow-elegant text-base" asChild>
            <a href="#portfolio">
              View My Work
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-primary/5 text-base" asChild>
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
