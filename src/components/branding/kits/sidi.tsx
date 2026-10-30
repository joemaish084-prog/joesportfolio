import { ArrowUpRight, AtSign, Music2, Youtube } from "lucide-react";
import type { Brand } from "@/data/brands";
import { InstagramMockup, MockupPanel, cardShape } from "../BrandMockups";
import { bodyFont, displayFont, type BrandKit } from "./shared";

const serif = { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 } as const;
const italic = { ...serif, fontStyle: "italic" } as const;
const caps = "text-[10px] font-medium uppercase tracking-[0.22em]";

/** The navy band from the cover page, edged in gold, with the kit's spaced caps. */
function Divider({ className = "" }: { brand: Brand; className?: string }) {
  return (
    <div className={`flex items-end ${className}`} aria-hidden="true">
      <div className="flex h-3/5 w-full items-center border-t-2 border-[#C9A24A] bg-brand-primary">
        <p className={`container mx-auto px-4 text-brand-on-primary/70 sm:px-6 lg:px-8 ${caps}`} style={bodyFont}>
          Beauty / Lifestyle / Storytelling
        </p>
      </div>
    </div>
  );
}

/** Small spaced caps above a page, with a navy rule and page number below. */
function RunningHeader({ left, right }: { left: string; right: string }) {
  return (
    <p className={`flex justify-between gap-4 text-brand-ink/70 ${caps}`} style={bodyFont}>
      <span>{left}</span>
      <span className="text-right">{right}</span>
    </p>
  );
}

function Elements() {
  const pillars = ["Skincare journey & education", "Body care education", "Styling Diaries"];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="col-span-full overflow-hidden rounded-3xl bg-brand-bg p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Two-voice headline</p>
        <p className="mt-5 text-5xl leading-[0.95] text-brand-ink sm:text-6xl">
          <span className="block" style={displayFont}>Real routines.</span>
          <span className="block pl-[0.6em]" style={italic}>Personal stories.</span>
        </p>
        <span className="mt-5 block h-0.5 w-20 bg-[#C9A24A]" />
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-brand-primary p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A24A]">The arrow</p>
        <ArrowUpRight className="h-20 w-20 text-[#C9A24A]" strokeWidth={2.75} aria-hidden="true" />
        <p className="text-sm text-brand-on-primary/75">Gold, pointing forward, on the cover and chapter openers.</p>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#E9D7D7] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Taped photo</p>
        <div className="relative mx-auto w-40 -rotate-3 bg-[#F7F3EE] p-2 shadow-lg">
          <span className="absolute -top-3 left-1/2 h-5 w-20 -translate-x-1/2 rotate-2 bg-[#C9A24A]/90" />
          <div className="flex aspect-[3/4] items-end bg-gradient-to-br from-[#1F2940] to-[#4A5470] p-3">
            <span className="text-lg leading-tight text-[#F7F3EE]" style={italic}>A personal perspective.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Data card</p>
        <div className="bg-[#E9D7D7] p-5 text-brand-ink">
          <p className={caps} style={bodyFont}>Last 90 days</p>
          <p className="mt-3 text-4xl leading-none" style={{ ...bodyFont, fontWeight: 500, letterSpacing: "-0.04em" }}>1,223,934</p>
          <p className="mt-1 text-xs">Views</p>
          <p className="mt-4 flex justify-between border-t border-brand-ink/15 pt-3 text-xs">
            <span>Non-follower views</span>
            <span>89.8%</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Numbered pillars</p>
        <ol className="divide-y divide-brand-ink/15">
          {pillars.map((p, i) => (
            <li key={p} className="flex items-baseline gap-4 py-2.5">
              <span className="text-2xl text-[#8D6B24]" style={serif}>0{i + 1}</span>
              <span className="text-sm font-medium text-brand-ink" style={bodyFont}>{p}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="col-span-full flex flex-col gap-5 rounded-3xl bg-brand-bg p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Running header and footer, on every page</p>
        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <RunningHeader left="Sidi Safari" right="Brand essence / Media kit 2026" />
          <div className="my-6 h-10 rounded bg-brand-ink/5 sm:h-14" />
          <div className="border-t border-brand-ink pt-2">
            <RunningHeader left="Sidi Safari / Brand essence" right="03" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Handles() {
  const rows = [
    { Icon: AtSign, text: "Instagram / @sidi_safari" },
    { Icon: Music2, text: "TikTok / @sidisafari" },
    { Icon: Youtube, text: "YouTube / @sidi.safari" },
  ];
  return (
    <div className="space-y-1.5 text-[11px] text-[#F7F3EE]" style={bodyFont}>
      {rows.map(({ Icon, text }) => (
        <p key={text} className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[#C9A24A]" aria-hidden="true" />
          {text}
        </p>
      ))}
    </div>
  );
}

function BusinessCard({ brand }: { brand: Brand }) {
  return (
    <div className="relative mx-auto w-full max-w-md pb-10 pr-6">
      {/* Back: navy, handles, the italic line */}
      <div className={`${cardShape} flex items-end justify-between gap-4 bg-[#1F2940] p-5`}>
        <Handles />
        <p className="text-right text-lg leading-tight text-[#E9D7D7]" style={italic}>Beauty.<br />With a story.</p>
      </div>
      {/* Front: cream with the blush arch and the wordmark */}
      <div className={`${cardShape} absolute left-6 top-10 flex items-center justify-center bg-[#F7F3EE] sm:left-8`} style={{ width: "calc(100% - 1.5rem)" }}>
        <span className="absolute -bottom-1/3 -left-[10%] aspect-square w-3/5 rounded-full bg-[#E9D7D7]" />
        <span className="absolute inset-y-0 right-0 w-3 bg-[#C9A24A]" />
        <img src={brand.logos.stacked} alt="" className="relative h-24 w-auto object-contain" />
      </div>
    </div>
  );
}

function Mockups({ brand }: { brand: Brand }) {
  const rates = brand.posts.filter((p) => p.template === "Rates");
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <MockupPanel label="Instagram profile" bg="#1F2940" labelColor="#C9A24A" className="row-span-2">
        <InstagramMockup brand={brand} />
      </MockupPanel>
      <MockupPanel label="Business card" bg="#E9D7D7" labelColor="#1F2940">
        <BusinessCard brand={brand} />
      </MockupPanel>
      {rates.length >= 2 && (
        <MockupPanel label="Rate cards" bg="#ECE4D6" labelColor="#8D6B24">
          <div className="relative mx-auto h-64 w-full max-w-xs sm:h-72">
            {rates.slice(-2).map((p, i) => (
              <img
                key={p.title}
                src={p.thumb}
                alt={`Sidi Safari media kit: ${p.title}`}
                width={540}
                height={675}
                loading="lazy"
                decoding="async"
                className="absolute top-0 h-full w-auto rounded-md shadow-xl"
                style={{ left: i === 0 ? 0 : "auto", right: i === 1 ? 0 : "auto", transform: `rotate(${i === 0 ? -4 : 3}deg)`, zIndex: i }}
              />
            ))}
          </div>
        </MockupPanel>
      )}
    </div>
  );
}

const rules: BrandKit["rules"] = () => [
  {
    ok: true,
    caption: "A bold statement first, then a light italic line.",
    art: (
      <p className="text-3xl leading-none text-brand-ink">
        <span className="block" style={displayFont}>Beauty.</span>
        <span className="block pl-6" style={italic}>With a story.</span>
      </p>
    ),
  },
  {
    ok: false,
    caption: "Don't set both lines in the italic. The contrast is the voice.",
    art: (
      <p className="text-3xl leading-none text-brand-ink" style={italic}>
        <span className="block">Beauty.</span>
        <span className="block pl-6">With a story.</span>
      </p>
    ),
  },
  {
    ok: true,
    caption: "Give every figure its source and reporting window.",
    art: (
      <div className="bg-[#ECE4D6] px-5 py-3 text-brand-ink" style={bodyFont}>
        <p className={caps}>Instagram / Last 30 days</p>
        <p className="mt-1 text-2xl" style={{ fontWeight: 500, letterSpacing: "-0.04em" }}>122,000 views</p>
      </div>
    ),
  },
  {
    ok: false,
    caption: "Don't set copy in the bright gold. It's for arrows, rules and tape.",
    art: (
      <p className="max-w-xs text-sm leading-snug text-[#C9A24A]" style={bodyFont}>
        I weave products into relatable daily narratives, turning everyday routines into visual stories.
      </p>
    ),
  },
];

export const sidiKit: BrandKit = { Divider, Elements, Mockups, rules };
