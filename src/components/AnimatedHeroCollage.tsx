import type { ReactNode } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { CollageArtwork, type CollageItem } from "./HeroCollage";

function CollageCard({
  item, mouseX, mouseY, index, loading,
}: {
  item: CollageItem;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  index: number;
  loading: "lazy" | "eager";
}) {
  const x = useSpring(useTransform(mouseX, value => value * item.depth), { damping: 25, stiffness: 120 });
  const y = useSpring(useTransform(mouseY, value => value * item.depth), { damping: 25, stiffness: 120 });
  return (
    <motion.div style={{ x, y }} className={`absolute ${item.className}`}>
      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1, rotate: item.rotate, y: 0 }}
        transition={{ delay: item.delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: 1.2 + index * 0.4 }}
          className="group relative h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl"
        >
          <CollageArtwork item={item} loading={loading} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function AnimatedHeroCollage({
  mouseX, mouseY, children, items, loading = "eager", panelClassName,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  children: ReactNode;
  items: CollageItem[];
  loading?: "lazy" | "eager";
  panelClassName: string;
}) {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-lg">
      {items.map((item, index) => <CollageCard key={item.src} item={item} mouseX={mouseX} mouseY={mouseY} index={index} loading={loading} />)}
      <div className={`absolute z-10 ${panelClassName}`}>{children}</div>
    </div>
  );
}
