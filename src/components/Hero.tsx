import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Tag = {
  label: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

const tags: Tag[] = [
  { label: "Content Strategy", top: "12%", left: "8%" },
  { label: "Meta Ads", top: "10%", right: "10%" },
  { label: "Google Ads", top: "46%", left: "6%" },
  { label: "SEO Optimization", top: "50%", right: "8%" },
];

const appleEase = [0.22, 1, 0.36, 1] as const;

function FloatingTag({
  tag,
  index,
  mouseX,
  mouseY,
}: {
  tag: Tag;
  index: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const moveX = useTransform(mouseX, (v) => v * 20);
  const moveY = useTransform(mouseY, (v) => v * 20);
  const smoothX = useSpring(moveX, { damping: 20, stiffness: 100 });
  const smoothY = useSpring(moveY, { damping: 20, stiffness: 100 });

  const { label, ...position } = tag;

  return (
    <motion.div
      style={{ position: "absolute", ...position, x: smoothX, y: smoothY }}
      className="hidden md:block z-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.45, ease: appleEase }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3 + index * 0.2, repeat: Infinity, ease: appleEase }}
        className="px-4 py-2 bg-card border border-border rounded-xl shadow-sm text-sm text-muted-foreground"
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
      ref={containerRef}
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="scroll-mt-20 lg:scroll-mt-24 relative w-full min-h-screen bg-background overflow-hidden"
    >
      {tags.map((tag, index) => (
        <FloatingTag key={tag.label} tag={tag} index={index} mouseX={mouseX} mouseY={mouseY} />
      ))}

      <div className="flex flex-col items-center justify-center text-center min-h-screen px-6 relative z-20">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: appleEase }}
          className="text-large-title font-display font-bold tracking-tight max-w-4xl"
        >
          Creative Strategy
          <span className="text-primary"> Meets </span>
          Visual Storytelling
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45, ease: appleEase }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl"
        >
          I build campaigns that turn attention into measurable growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45, ease: appleEase }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button size="lg" className="w-full sm:w-auto rounded-full" asChild>
            <a href="#videos">View My Work</a>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" asChild>
            <a href="#contact">Contact Me</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
