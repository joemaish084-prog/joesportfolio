 
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

/**
 * Build-time social card (1200x630 PNG) for a page: the title on the brand's
 * dark background, so a shared link reads as the article it points to.
 */

export const OG_CARD_SIZE = { width: 1200, height: 630 } as const;

export interface OgCard {
  /** Small orange label above the title, e.g. the topic hub. */
  eyebrow: string;
  title: string;
  /** One line under the title, e.g. "6 min read · October 2026". */
  meta?: string;
}

export interface OgAssets {
  fonts: { name: string; data: Buffer; weight: 400 | 500 | 600 | 700; style: "normal" }[];
  /** data: URI of the round JM mark. */
  logo: string;
}

const ORANGE = "#FF6A00";
const ORANGE_LIGHT = "#FF9F29";
const INK = "#0D0D0D";

// Long titles step down so they stay within four lines.
const titleSize = (title: string) => (title.length <= 45 ? 76 : title.length <= 70 ? 64 : title.length <= 95 ? 54 : 46);

// Code points covered by the @fontsource "latin" subset. Anything else (emoji,
// arrows) would render as an empty box.
const LATIN_SUBSET: [number, number][] = [
  [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc], [0x02c6, 0x02c6],
  [0x02da, 0x02da], [0x02dc, 0x02dc], [0x0304, 0x0304], [0x0308, 0x0308], [0x0329, 0x0329],
  [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193],
  [0x2212, 0x2212], [0x2215, 0x2215], [0xfeff, 0xfeff], [0xfffd, 0xfffd],
];
const hasGlyph = (char: string) => {
  const cp = char.codePointAt(0)!;
  return LATIN_SUBSET.some(([lo, hi]) => cp >= lo && cp <= hi);
};

export async function renderOgCard(card: OgCard, assets: OgAssets): Promise<Buffer> {
  const unsupported = [...new Set([...`${card.eyebrow}${card.title}${card.meta ?? ""}`])].filter((c) => !hasGlyph(c));
  if (unsupported.length > 0) {
    console.warn(`og card "${card.title}": no glyph for ${unsupported.join(" ")}`);
  }

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px 0",
        backgroundColor: INK,
        backgroundImage: `radial-gradient(circle at 100% 0%, rgba(255,106,0,0.28), rgba(13,13,13,0) 55%)`,
        color: "#FAFAFA",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={assets.logo} width={72} height={72} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 30 }}>Joseph Maina</div>
          <div style={{ fontSize: 22, color: "#A3A3A3" }}>Digital Marketing · Nairobi, Kenya</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: ORANGE,
          }}
        >
          {card.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            fontSize: titleSize(card.title),
            lineHeight: 1.08,
            letterSpacing: -1,
          }}
        >
          {card.title}
        </div>
        {card.meta && <div style={{ display: "flex", fontSize: 26, color: "#A3A3A3" }}>{card.meta}</div>}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, paddingBottom: 28 }}>
          <div style={{ display: "flex", color: "#D4D4D4" }}>josephmaina.co.ke</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: ORANGE_LIGHT, fontWeight: 600 }}>
            Book a free strategy call
            {/* Drawn rather than typed: the Latin font subset has no arrow glyph. */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={ORANGE_LIGHT} strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            height: 12,
            margin: "0 -72px",
            backgroundImage: `linear-gradient(90deg, ${ORANGE}, ${ORANGE_LIGHT})`,
          }}
        />
      </div>
    </div>,
    { ...OG_CARD_SIZE, fonts: assets.fonts },
  );

  return new Resvg(svg, { fitTo: { mode: "width", value: OG_CARD_SIZE.width } }).render().asPng();
}
