export function HeroBackground() {
  return (
    <>
      {/* Layer 0 — drifting glow blobs, theme-safe (primary token stays the same brand orange in both modes) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[5%] w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-[120px] animate-drift-a" />
        <div className="absolute bottom-[-15%] left-[0%] w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-[130px] animate-drift-b" />
      </div>

      {/* Layer 1 — grid + cursor spotlight, both theme-aware */}
      <div className="absolute inset-0 z-[1] dot-grid pointer-events-none [mask-image:radial-gradient(ellipse_90%_70%_at_50%_0%,black_40%,transparent_100%)]" />
      <div className="absolute inset-0 z-[1] hero-spotlight pointer-events-none transition-[background] duration-300" />
    </>
  );
}
