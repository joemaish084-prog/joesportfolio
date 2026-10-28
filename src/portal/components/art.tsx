import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import { nairobiHour } from "../lib/format";

// Original artwork for the portal: a Nairobi skyline (the cylindrical KICC
// tower, Times Tower and its neighbours) with an acacia in front. The sky
// follows the actual time in Nairobi, and everything is inline SVG, so it
// costs no extra download on a mobile connection.

export type SkyPhase = "dawn" | "day" | "dusk" | "night";

export function skyPhase(date = new Date()): SkyPhase {
  const h = nairobiHour(date);
  return h >= 5 && h < 8 ? "dawn" : h >= 8 && h < 16 ? "day" : h >= 16 && h < 19 ? "dusk" : "night";
}

export function useSkyPhase(): SkyPhase {
  // Recomputed per mount: a visit never lasts long enough for the sky to need a timer.
  return useMemo(() => skyPhase(), []);
}

type Palette = {
  sky: [string, string, string, string];
  glow: string;
  sun: string;
  sunX: number;
  sunY: number;
  far: string;
  mid: string;
  near: string;
  lit: boolean;
};

const PALETTE: Record<SkyPhase, Palette> = {
  dawn: { sky: ["#1b1210", "#5c2a18", "#ff8a3d", "#ffd9a0"], glow: "#ff9a4d", sun: "#ffe3b0", sunX: 628, sunY: 352, far: "#7a3d22", mid: "#4a2415", near: "#150e0b", lit: false },
  day: { sky: ["#1d140f", "#6a3212", "#ff8f3a", "#ffe2b8"], glow: "#ffb066", sun: "#fff1d6", sunX: 830, sunY: 170, far: "#8a4a26", mid: "#5a2e18", near: "#150e0b", lit: false },
  dusk: { sky: ["#150e14", "#55202c", "#ff6a00", "#ffb27a"], glow: "#ff7a1f", sun: "#ffd2a0", sunX: 880, sunY: 300, far: "#6b2b25", mid: "#3a1a18", near: "#110b0a", lit: true },
  night: { sky: ["#090706", "#140e0c", "#2c1a11", "#5a3317"], glow: "#ff8a3d", sun: "#f4ecdc", sunX: 900, sunY: 130, far: "#2a1c14", mid: "#1d130e", near: "#0c0807", lit: true },
};

// Deterministic "stars", so the sky doesn't reshuffle on every render.
const STARS = Array.from({ length: 46 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12543.7791;
  return { x: (a - Math.floor(a)) * 1200, y: (b - Math.floor(b)) * 0.55, r: 0.8 + ((i * 7) % 5) * 0.35, d: (i * 37) % 30 };
});

// Lit windows on the taller towers, for dusk and night.
const WINDOWS: [number, number][] = [
  [412, 150], [430, 150], [448, 150], [466, 150], [412, 178], [448, 178], [430, 206], [466, 206], [412, 234], [430, 234], [448, 262],
  [543, 124], [543, 158], [558, 190], [543, 222], [558, 254], [543, 286],
  [312, 196], [330, 196], [348, 224], [312, 252], [348, 280], [330, 308],
  [688, 170], [706, 170], [724, 198], [688, 226], [706, 254], [724, 282],
  [784, 232], [802, 232], [820, 260], [784, 288], [820, 316],
];

/**
 * The scene. `bare` drops the sky and leaves only the silhouettes and the sun's
 * glow, to sit on top of any background. It fills its box and crops from the
 * bottom-centre, so it works as a banner or a full panel.
 */
export function NairobiSkyline({
  phase,
  bare = false,
  tall = false,
  contain = false,
  className,
}: {
  phase?: SkyPhase;
  bare?: boolean;
  /** A tall sky above the skyline, for filling a whole side panel. */
  tall?: boolean;
  /** Show the whole skyline, pinned to the right, instead of cropping to fill. */
  contain?: boolean;
  className?: string;
}) {
  const auto = useSkyPhase();
  const p = PALETTE[phase ?? auto];
  const night = (phase ?? auto) === "night";
  const uid = useId().replace(/:/g, "");
  const H = tall ? 1100 : 520;
  const dy = H - 520;

  return (
    <svg
      viewBox={`0 0 1200 ${H}`}
      preserveAspectRatio={contain ? "xMaxYMax meet" : "xMidYMax slice"}
      role="img"
      aria-label="Illustration of the Nairobi skyline"
      className={cn("block h-full w-full", className)}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset={tall ? 0.6 : 0.45} stopColor={p.sky[1]} />
          <stop offset={tall ? 0.88 : 0.8} stopColor={p.sky[2]} />
          <stop offset="1" stopColor={p.sky[3]} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.glow} stopOpacity={night ? 0.25 : 0.7} />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.near} stopOpacity="0" />
          <stop offset="1" stopColor={p.near} stopOpacity="1" />
        </linearGradient>
      </defs>

      {!bare && <rect width="1200" height={H} fill={`url(#${uid}-sky)`} />}

      {/* stars, only after dark */}
      {night &&
        STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y * H} r={s.r} fill="#fff4e0" opacity="0.8" className="animate-portal-pulse" style={{ animationDelay: `${s.d / 10}s` }} />
        ))}

      <g transform={`translate(0 ${dy})`}>
      {/* the sun, or the moon at night, with its glow */}
      <circle cx={p.sunX} cy={p.sunY} r="230" fill={`url(#${uid}-glow)`} />
      <circle cx={p.sunX} cy={p.sunY} r={night ? 26 : 38} fill={p.sun} opacity={night ? 0.95 : 0.92} />
      {night && <circle cx={p.sunX + 11} cy={p.sunY - 5} r="22" fill={PALETTE.night.sky[1]} opacity="0.9" />}

      {/* far hills and distant blocks */}
      <path d="M0 440 C 150 396, 280 420, 420 402 S 700 380, 860 410 S 1100 392, 1200 416 V520 H0 Z" fill={p.far} opacity="0.55" />
      <g fill={p.far} opacity="0.7">
        {[
          [40, 330, 54, 110], [104, 300, 40, 140], [154, 342, 66, 98], [236, 312, 46, 128], [900, 322, 52, 118],
          [962, 296, 44, 144], [1016, 336, 70, 104], [1100, 308, 48, 132],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h + 60} />
        ))}
      </g>

      {/* mid skyline */}
      <g fill={p.mid}>
        <rect x="282" y="268" width="26" height="200" />
        <rect x="372" y="236" width="34" height="232" />
        <rect x="652" y="262" width="28" height="206" />
        <rect x="748" y="250" width="30" height="218" />
        <polygon points="838,468 838,300 868,284 898,300 898,468" />
        <rect x="905" y="318" width="36" height="150" />
      </g>

      {/* main skyline */}
      <g fill={p.near}>
        {/* Teleposta-style tower with an angled crown */}
        <polygon points="300,470 300,196 366,170 366,470" />
        {/* Times Tower: tall slab with a stepped top */}
        <path d="M408 470 V132 H418 V118 H462 V132 H472 V470 Z" />
        {/* KICC: the cylinder, its crown plate, helipad cone and the low blocks beside it */}
        <rect x="528" y="104" width="50" height="366" rx="3" />
        <rect x="520" y="96" width="66" height="12" rx="6" />
        <polygon points="553,60 537,96 569,96" />
        <rect x="552" y="40" width="2" height="22" />
        <rect x="470" y="380" width="62" height="90" />
        <rect x="574" y="408" width="74" height="62" rx="10" />
        {/* a slanted-roof office tower and a stepped bank tower */}
        <polygon points="676,470 676,184 734,150 734,470" />
        <path d="M770 470 V226 H786 V212 H836 V226 H842 V470 Z" />
        <rect x="856" y="330" width="56" height="140" />
        <rect x="920" y="290" width="40" height="180" />
        <rect x="968" y="352" width="86" height="118" />
        <rect x="1060" y="318" width="44" height="152" />
        <rect x="1110" y="372" width="90" height="98" />
        <rect x="0" y="392" width="62" height="78" />
        <rect x="236" y="350" width="52" height="120" />
        {/* ground */}
        <rect x="0" y="466" width="1200" height="54" />
      </g>

      {/* Times Tower's vertical window lines */}
      <g stroke={p.mid} strokeWidth="1.5" opacity="0.7">
        {[426, 436, 446, 456].map((x) => (
          <line key={x} x1={x} y1="140" x2={x} y2="464" />
        ))}
      </g>

      {/* lit windows after sunset */}
      {p.lit && (
        <g fill="#ffb347" opacity="0.85">
          {WINDOWS.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="6" height="9" rx="1" className={i % 4 === 0 ? "animate-portal-pulse" : undefined} />
          ))}
        </g>
      )}

      {/* an acacia, the flat-topped tree of the savanna, in the foreground */}
      <g fill={p.near} transform="translate(160 94) scale(0.8)">
        <path d="M118 470 C 120 430, 112 410, 128 386 C 136 374, 132 364, 138 352 L 146 352 C 142 366, 148 376, 144 392 C 140 410, 150 436, 150 470 Z" />
        <path d="M130 372 C 100 366, 70 350, 38 352 L 42 346 C 76 340, 108 352, 134 362 Z" />
        <path d="M142 366 C 176 354, 216 352, 250 346 L 252 352 C 218 360, 182 366, 146 376 Z" />
        <ellipse cx="142" cy="334" rx="112" ry="24" />
        <ellipse cx="72" cy="346" rx="58" ry="17" />
        <ellipse cx="216" cy="344" rx="58" ry="17" />
        <ellipse cx="140" cy="318" rx="70" ry="14" />
      </g>

      {/* haze so the scene melts into the panel below it */}
      <rect x="0" y="380" width="1200" height="140" fill={`url(#${uid}-haze)`} />
      </g>
    </svg>
  );
}

/**
 * A quiet repeating pattern of woven-looking diamonds, in the spirit of East
 * African textiles. Used very faintly as texture.
 */
export function WeavePattern({ className }: { className?: string }) {
  const id = `weave-${useId().replace(/:/g, "")}`;
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      <defs>
        <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M18 11 L25 18 L18 25 L11 18 Z" fill="currentColor" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
