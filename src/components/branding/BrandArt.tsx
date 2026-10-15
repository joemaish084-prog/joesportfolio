/** Small vector pieces of a brand's visual language, drawn live so they stay crisp at any size. */

export function Wave({ top, bottom, className = "" }: { top: string; bottom: string; className?: string }) {
  return (
    <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M0 62 C 300 -6, 720 140, 1200 34 L1200 160 L0 160 Z" fill={top} />
      <path d="M0 88 C 320 22, 740 160, 1200 64 L1200 160 L0 160 Z" fill={bottom} />
    </svg>
  );
}

export function Swoosh({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 300 20" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M4 14 C 90 3, 210 3, 296 9" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** The sticker Duara places over children's faces when there is no photo consent. */
export function Sunflower({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {petals.map((deg) => (
        <ellipse key={deg} cx="50" cy="20" rx="9" ry="20" fill="#F7C325" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="19" fill="#6B3A12" />
      <circle cx="50" cy="50" r="13" fill="#4A270B" />
    </svg>
  );
}
