export function HeroBackground() {
  return (
    <>
      {/* Layer 0 — drifting glow blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[5%] w-[32rem] h-[32rem] rounded-full bg-primary/25 blur-[120px] animate-drift-a" />
        <div className="absolute bottom-[-15%] left-[0%] w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-[130px] animate-drift-b" />
      </div>

      {/* Layer 1 — grid, spotlight, grain */}
      <div className="absolute inset-0 z-[1] hero-grid pointer-events-none" />
      <div className="absolute inset-0 z-[1] hero-spotlight pointer-events-none transition-[background] duration-300" />
      <div className="absolute inset-0 z-[1] hero-noise opacity-[0.05] mix-blend-overlay pointer-events-none" />

      {/* Layer 2 — seam into the rest of the page, theme-adaptive */}
      <div className="absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </>
  );
}
