import { AtSign, BookOpen, ChevronRight, Globe, Lightbulb, Phone, Users } from "lucide-react";
import type { Brand } from "@/data/brands";
import { Sunflower, Wave } from "../BrandArt";
import { InstagramMockup, MockupPanel, cardShape } from "../BrandMockups";
import { bodyFont, displayFont, type BrandKit } from "./shared";

function Divider({ brand, className = "" }: { brand: Brand; className?: string }) {
  return <Wave top={brand.colors.highlight} bottom={brand.colors.primary} className={`block w-full ${className}`} />;
}

function Elements({ brand }: { brand: Brand }) {
  const icons = [
    { Icon: BookOpen, label: "Strong foundations" },
    { Icon: Lightbulb, label: "Future skills" },
    { Icon: Users, label: "Nurturing community" },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="relative col-span-full overflow-hidden rounded-3xl bg-brand-bg ring-1 ring-brand-ink/10">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">The wave</p>
          <p className="mt-2 max-w-md text-sm text-brand-ink/70">A Sunflower edge riding on a Duara Green swell. It frames photos and carries the footer.</p>
        </div>
        <Wave top={brand.colors.highlight} bottom={brand.colors.primary} className="block h-24 w-full sm:h-32" />
      </div>

      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-primary p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-highlight">Pill button</p>
        <span className="inline-flex items-center gap-4 rounded-full bg-brand-highlight py-2 pl-6 pr-2 text-lg text-brand-on-highlight sm:text-xl" style={displayFont}>
          Come visit and meet us
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ink text-brand-highlight">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </span>
        </span>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Icon circles</p>
        <div className="flex justify-between gap-2">
          {icons.map(({ Icon, label }) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-highlight text-brand-on-highlight">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold leading-tight text-brand-ink">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Level line</p>
        <p className="text-lg font-bold text-brand-ink sm:text-xl" style={bodyFont}>
          Playgroup <span className="text-brand-highlight">•</span> PP1 <span className="text-brand-highlight">•</span> PP2 <span className="text-brand-highlight">•</span> Grade 1 + 2
        </p>
      </div>

      <div className="flex items-center gap-5 rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10 sm:p-8">
        <Sunflower className="h-16 w-16 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">Child privacy</p>
          <p className="mt-1 text-sm text-brand-ink/75">Where there's no photo consent, a sunflower covers the child's face. The privacy rule doubles as part of the brand.</p>
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ brand }: { brand: Brand }) {
  const { colors, contact } = brand;
  return (
    <div className="relative mx-auto w-full max-w-md pb-10 pr-6">
      {/* Back */}
      <div className={`${cardShape} flex flex-col justify-end p-5`} style={{ background: colors.primary }}>
        <div className="space-y-1.5 text-[13px]" style={{ color: colors.background, ...bodyFont }}>
          <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" style={{ color: colors.highlight }} aria-hidden="true" />{contact.phone}</p>
          <p className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" style={{ color: colors.highlight }} aria-hidden="true" />{contact.web}</p>
          <p className="flex items-center gap-2"><AtSign className="h-3.5 w-3.5" style={{ color: colors.highlight }} aria-hidden="true" />{contact.handle.replace("@", "")}</p>
        </div>
      </div>
      {/* Front, offset over the back */}
      <div className={`${cardShape} absolute left-6 top-10 flex items-center gap-4 p-5 sm:left-8`} style={{ background: colors.background, width: "calc(100% - 1.5rem)" }}>
        <img src={brand.logos.stacked} alt="" className="h-20 w-20 object-contain" />
        <div style={displayFont}>
          <p className="text-xl leading-tight" style={{ color: colors.ink }}>Quality learning.</p>
          <p className="text-xl italic leading-tight" style={{ color: colors.accent }}>Within reach.</p>
        </div>
        <Wave top={colors.highlight} bottom={colors.primary} className="absolute inset-x-0 bottom-0 h-7 w-full" />
      </div>
    </div>
  );
}

/** Orange tee, matching the uniforms the children already wear in Duara's photos. */
function Tee({ brand }: { brand: Brand }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 300 320" className="w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]" aria-hidden="true">
        <path
          d="M95 18 C 115 40, 185 40, 205 18 L 270 50 L 296 120 L 248 138 L 240 112 L 240 306 L 60 306 L 60 112 L 52 138 L 4 120 L 30 50 Z"
          fill={brand.colors.accent}
        />
        <path d="M95 18 C 115 40, 185 40, 205 18" stroke="#00000022" strokeWidth="6" fill="none" />
      </svg>
      <div className="absolute left-1/2 top-[30%] flex -translate-x-1/2 flex-col items-center">
        <img src={brand.logos.mark} alt="" className="h-16 w-16 object-contain brightness-0 invert" />
        <p className="mt-1 text-center text-sm leading-tight text-white" style={displayFont}>
          DUARA
          <br />
          SCHOOL
        </p>
      </div>
    </div>
  );
}

function Mockups({ brand }: { brand: Brand }) {
  const { colors } = brand;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <MockupPanel label="Instagram profile" bg={colors.highlight} labelColor={colors.ink} className="row-span-2">
        <InstagramMockup brand={brand} />
      </MockupPanel>
      <MockupPanel label="Business card" bg="#E9E2D0" labelColor={colors.ink}>
        <BusinessCard brand={brand} />
      </MockupPanel>
      <MockupPanel label="Uniform tee" bg={colors.primary} labelColor={colors.highlight}>
        <Tee brand={brand} />
      </MockupPanel>
    </div>
  );
}

const rules: BrandKit["rules"] = (brand) => [
  {
    ok: true,
    caption: "One italic Marigold phrase per headline.",
    art: (
      <p className="text-2xl leading-none" style={displayFont}>
        <span className="block text-brand-ink">Big ideas</span>
        <span className="italic text-brand-accent">begin here.</span>
      </p>
    ),
  },
  {
    ok: false,
    caption: "Don't put the accent on every line. Then nothing stands out.",
    art: (
      <p className="text-2xl italic leading-none text-brand-accent" style={displayFont}>
        <span className="block">Big ideas</span>
        begin here.
      </p>
    ),
  },
  {
    ok: false,
    caption: "Don't stretch or recolour the logo.",
    art: <img src={brand.logos.stacked} alt="" className="h-16 w-16 object-contain" style={{ transform: "scaleX(1.6)", filter: "hue-rotate(150deg)" }} />,
  },
  {
    ok: false,
    caption: "Don't set Sunflower text on cream. It disappears.",
    art: (
      <p className="text-2xl leading-none text-brand-highlight" style={displayFont}>
        Admissions ongoing
      </p>
    ),
  },
];

export const duaraKit: BrandKit = { Divider, Elements, Mockups, rules };
