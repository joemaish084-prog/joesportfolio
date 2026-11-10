import { ArrowUpRight, Instagram } from "lucide-react";
import type { Brand } from "@/data/brands";
import { displayFont, type BrandKit } from "./shared";

function Divider({ className = "" }: { brand: Brand; className?: string }) {
  return (
    <div className={`flex items-end ${className}`} aria-hidden="true">
      <div className="w-full border-t border-[#D8AF65] bg-brand-primary py-5">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.32em] text-brand-highlight sm:text-xs">
          Scents. Stories. Sensations.
        </p>
      </div>
    </div>
  );
}

function Elements({ brand }: { brand: Brand }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="col-span-full rounded-3xl bg-black p-7 sm:p-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#D8AF65]">The gold treatment</p>
        <img src={brand.logoStages[4].image} alt="Noir & Novel wordmark and tagline in gold on black" width={984} height={384} loading="lazy" className="my-6 w-full" />
        <p className="text-sm leading-relaxed text-white/65">The complete wordmark carries the identity. Gold gives the dark treatment its warmth.</p>
      </div>
      <div className="flex flex-col justify-between gap-10 rounded-3xl bg-brand-surface p-7 sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-label">A quiet signature</p>
        <div>
          <span className="block h-px w-24 bg-brand-accent" />
          <p className="mt-6 text-xs uppercase leading-loose tracking-[0.25em]">Scents.<br />Stories.<br />Sensations.</p>
        </div>
        <p className="text-sm leading-relaxed text-brand-ink/70">A fine rule and generously spaced capitals give the tagline room to breathe.</p>
      </div>
      <div className="flex flex-col justify-between gap-10 rounded-3xl border border-brand-ink/10 bg-white p-7 sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-label">The editorial turn</p>
        <p className="text-4xl leading-none sm:text-5xl" style={displayFont}>
          Some stories<br />are read.<br /><span className="italic text-brand-accent">Others are worn.</span>
        </p>
        <p className="text-sm leading-relaxed text-brand-ink/70">One statement, then an italic response. The launch message bridges books and fragrance.</p>
      </div>
    </div>
  );
}

function Mockups({ brand }: { brand: Brand }) {
  const post = brand.posts[0];
  return (
    <div className="grid items-center gap-8 rounded-3xl bg-brand-surface p-6 sm:p-10 md:grid-cols-2">
      <div className="mx-auto w-full max-w-[300px] rounded-[2.4rem] bg-[#151310] p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[1.7rem] bg-white text-neutral-900">
          <div className="mx-auto my-3 h-4 w-20 rounded-full bg-[#151310]" />
          <p className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3 text-xs font-semibold">
            <Instagram className="h-4 w-4" aria-hidden="true" />{brand.contact.handle}
          </p>
          <img src={post.thumb} alt="Noir & Novel's first Instagram post, presented in a phone frame" width={540} height={675} loading="lazy" decoding="async" className="aspect-[4/5] w-full" />
          <p className="px-4 py-4 text-[10px] uppercase tracking-[0.15em]">Scents. Stories. Sensations.</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-label">The launch, together</p>
        <h3 className="mt-4 text-4xl leading-none" style={displayFont}>A name.<br />A mood.<br /><span className="italic text-brand-accent">A first impression.</span></h3>
        <p className="mt-6 text-sm leading-relaxed text-brand-ink/75">The first post brings the identity into a warm, tactile setting. The book tells the story; the fragrance bottle gives it a new meaning.</p>
        <p className="mt-5 border-t border-brand-ink/15 pt-5 text-xs text-brand-ink/65">Logo and first-post design by Joseph Maina.</p>
        <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          Visit Noir & Novel <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

const rules: BrandKit["rules"] = (brand) => [
  {
    ok: true,
    caption: "Keep the wordmark, ampersand and tagline in their original proportions.",
    art: <img src={brand.logos.horizontal} alt="" className="max-h-24 w-full max-w-xs object-contain" />,
  },
  {
    ok: false,
    caption: "Avoid stretching the logo to fill a space. Let the layout fit the signature.",
    art: <img src={brand.logos.horizontal} alt="" className="h-20 w-full max-w-xs object-fill" />,
  },
  {
    ok: true,
    caption: "Use the supplied reversed treatment for a dark setting.",
    art: <div className="w-full max-w-xs rounded-xl bg-black p-4"><img src={brand.logos.white} alt="" className="w-full" /></div>,
  },
  {
    ok: true,
    caption: "Keep gold as the accent, with generous space around short headlines.",
    art: <p className="text-center text-3xl text-brand-ink" style={displayFont}>Some stories.<br /><span className="italic text-brand-accent">One signature.</span></p>,
  },
];

export const noirKit: BrandKit = { Divider, Elements, Mockups, rules };
