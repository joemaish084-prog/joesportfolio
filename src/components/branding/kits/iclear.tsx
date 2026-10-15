import { AtSign, Globe, Phone } from "lucide-react";
import type { Brand } from "@/data/brands";
import { InstagramMockup, MockupPanel, cardShape } from "../BrandMockups";
import { bodyFont, displayFont, type BrandKit } from "./shared";

/** The radial glow every iClear product shot sits in. */
const spotlight = "radial-gradient(ellipse at 50% 60%, #8FE6F2 0%, #2C8FE0 22%, #0A3A8C 50%, #021A47 82%)";

/** A soft line of light instead of Duara's wave. */
function Divider({ className = "" }: { brand: Brand; className?: string }) {
  return (
    <div className={`relative w-full ${className}`} aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#60D4E3] to-transparent" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 45% 100% at 50% 50%, rgba(96,212,227,0.28), transparent 70%)" }} />
    </div>
  );
}

function ContactStrip({ brand, size = "md" }: { brand: Brand; size?: "sm" | "md" }) {
  const { contact } = brand;
  const icon = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-white ${size === "sm" ? "text-[10px]" : "text-sm"}`} style={{ ...bodyFont, fontWeight: 300 }}>
      <span className="flex items-center gap-1.5"><Globe className={icon} aria-hidden="true" />{contact.web}</span>
      <span className="flex items-center gap-1.5"><Phone className={icon} aria-hidden="true" />{contact.phone}</span>
      <span className="flex items-center gap-1.5"><AtSign className={icon} aria-hidden="true" />{contact.handle.replace("@", "")}</span>
    </div>
  );
}

function Elements({ brand }: { brand: Brand }) {
  const features = ["6 Temp options", "No piping", "Heating in 3 secs"];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="relative col-span-full flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8" style={{ background: spotlight }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-highlight">The spotlight</p>
          <p className="mt-2 max-w-sm text-sm text-white/80">Every product sits in a pool of light: navy at the edges, cyan at the centre. It makes a white plastic unit look premium.</p>
        </div>
        <img src={brand.logos.white} alt="" className="mx-auto mt-6 h-24 w-auto object-contain opacity-95 sm:h-28" />
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl p-6 sm:p-8" style={{ background: "linear-gradient(180deg, #3E5257 0%, #0C868B 100%)" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Feature bar</p>
        <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-white/70 text-center text-xs text-white sm:text-sm" style={{ ...bodyFont, fontWeight: 400 }}>
          {features.map((f, i) => (
            <span key={f} className={`px-2 py-3 ${i === 1 ? "bg-[#72BDB6]" : ""}`}>{f}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Price line</p>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-white" style={{ ...bodyFont, fontWeight: 300 }}>
          <span className="text-sm">Then:</span>
          <span className="text-2xl line-through decoration-[#60D4E3] decoration-2">Ksh 40,000</span>
          <span className="text-sm">Now:</span>
          <span className="text-3xl" style={{ fontWeight: 400 }}>Ksh 32,000</span>
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#EAF2FA] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0653B1]">Gradient word</p>
        <p className="leading-none" style={bodyFont}>
          <span className="block text-lg font-semibold text-[#1A1A1A]">YOUR WORKOUT</span>
          <span className="block text-5xl sm:text-6xl" style={{ ...displayFont, backgroundImage: "linear-gradient(90deg, #60D4E3, #0653B1)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            WATER
          </span>
          <span className="block text-right text-lg font-semibold text-[#1A1A1A]">BUDDY</span>
        </p>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Brand line</p>
        <div>
          <p className="text-3xl text-white" style={displayFont}>#Waterissweet</p>
          <p className="mt-2 text-sm text-brand-ink/70">The same line printed on the purifier itself: "iClear, water is sweet."</p>
        </div>
      </div>

      <div className="col-span-full flex flex-col gap-5 rounded-3xl bg-brand-primary p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-highlight">Contact strip, on every post</p>
        <ContactStrip brand={brand} />
      </div>
    </div>
  );
}

function BusinessCard({ brand }: { brand: Brand }) {
  const { contact } = brand;
  return (
    <div className="relative mx-auto w-full max-w-md pb-10 pr-6">
      {/* Back: white, colour logo, contact details */}
      <div className={`${cardShape} flex items-end justify-between gap-4 bg-white p-5`}>
        <div className="space-y-1.5 text-[12px] text-[#01227B]" style={{ ...bodyFont, fontWeight: 400 }}>
          <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[#08E6BE]" aria-hidden="true" />{contact.phone}</p>
          <p className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-[#08E6BE]" aria-hidden="true" />{contact.web}</p>
          <p className="flex items-center gap-2"><AtSign className="h-3.5 w-3.5 text-[#08E6BE]" aria-hidden="true" />{contact.handle.replace("@", "")}</p>
        </div>
        <img src={brand.logos.horizontal} alt="" className="h-7 w-auto" />
      </div>
      {/* Front: the spotlight with the white logo */}
      <div className={`${cardShape} absolute left-6 top-10 flex items-center justify-center sm:left-8`} style={{ background: spotlight, width: "calc(100% - 1.5rem)" }}>
        <img src={brand.logos.white} alt="" className="h-24 w-auto object-contain" />
        <p className="absolute bottom-3 right-4 text-[10px] tracking-[0.2em] text-white/80" style={{ ...bodyFont, fontWeight: 300 }}>WATER IS SWEET</p>
      </div>
    </div>
  );
}

function Mockups({ brand }: { brand: Brand }) {
  const rollup = brand.posts.find((p) => p.template === "Print");
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <MockupPanel label="Instagram profile" bg={spotlight} labelColor="#FFFFFF" className="row-span-2">
        <InstagramMockup brand={brand} />
      </MockupPanel>
      <MockupPanel label="Business card" bg="#EAF2FA" labelColor="#0653B1">
        <BusinessCard brand={brand} />
      </MockupPanel>
      {rollup && (
        <MockupPanel label="Roll-up banners" bg="#C9CDD2" labelColor="#022967">
          <img src={rollup.thumb} alt="iClear roll-up banners: product range and how the service works" width={540} height={675} loading="lazy" decoding="async" className="mx-auto w-full max-w-xs rounded-xl" />
        </MockupPanel>
      )}
    </div>
  );
}

const rules: BrandKit["rules"] = (brand) => [
  {
    ok: true,
    caption: "White logo on navy, colour logo on light backgrounds.",
    art: (
      <div className="flex gap-3">
        <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#022967]"><img src={brand.logos.white} alt="" className="h-12 w-auto" /></span>
        <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#EAF2FA]"><img src={brand.logos.stacked} alt="" className="h-12 w-auto" /></span>
      </div>
    ),
  },
  {
    ok: false,
    caption: "Don't put the colour logo on navy. The wordmark disappears.",
    art: (
      <span className="flex h-20 w-24 items-center justify-center rounded-xl bg-[#022967]"><img src={brand.logos.stacked} alt="" className="h-12 w-auto" /></span>
    ),
  },
  {
    ok: true,
    caption: "Keep the same contact strip at the bottom of every post.",
    art: (
      <div className="w-full max-w-xs rounded-lg bg-[#0653B1] px-3 py-2">
        <ContactStrip brand={brand} size="sm" />
      </div>
    ),
  },
  {
    ok: false,
    caption: "Don't set long copy in the serif. Keep it for short headlines.",
    art: (
      <p className="max-w-xs text-sm leading-snug text-white" style={displayFont}>
        Our purifiers remove bacteria and odours so your family can enjoy fresh, safe water every single day.
      </p>
    ),
  },
];

export const iclearKit: BrandKit = { Divider, Elements, Mockups, rules };
