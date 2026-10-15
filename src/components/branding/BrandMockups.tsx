import { Grid3x3, Phone, Globe, AtSign } from "lucide-react";
import type { Brand } from "@/data/brands";
import { Wave } from "./BrandArt";

const display = "'Plus Jakarta Sans', sans-serif";
const body = "'Lato', sans-serif";

/** The brief was the social feed, so the lead mockup is the feed itself. */
export function InstagramMockup({ brand }: { brand: Brand }) {
  const { colors } = brand;
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[2.6rem] bg-neutral-900 p-3 shadow-2xl ring-1 ring-black/40">
      <div className="overflow-hidden rounded-[2rem] bg-white text-neutral-900" style={{ fontFamily: body }}>
        <div className="flex justify-center pt-2">
          <span className="h-5 w-24 rounded-full bg-neutral-900" />
        </div>
        <p className="px-4 pt-3 text-center text-sm font-bold">{brand.contact.handle.replace("@", "")}</p>
        <div className="flex items-center gap-4 px-4 pt-4">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full p-0.5"
            style={{ background: `linear-gradient(135deg, ${colors.highlight}, ${colors.accent}, ${colors.primary})` }}
          >
            <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-white" style={{ background: colors.background }}>
              <img src={brand.logos.mark} alt="" className="h-10 w-10 object-contain" />
            </span>
          </span>
          <div className="grid flex-1 grid-cols-1 text-center">
            <span className="text-base font-bold">{brand.posts.length}</span>
            <span className="text-xs text-neutral-500">posts</span>
          </div>
        </div>
        <div className="px-4 pt-3 text-xs leading-snug">
          <p className="font-bold">{brand.name}</p>
          <p className="text-neutral-600">Community microschools. Quality learning, affordably.</p>
          <p className="text-neutral-600">CBC • IB • Montessori</p>
          <p className="font-semibold" style={{ color: colors.primary }}>{brand.contact.web}</p>
        </div>
        <div className="mt-3 flex justify-center border-t border-neutral-200 py-2">
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-3 gap-px bg-neutral-200">
          {brand.posts.slice(0, 9).map((p) => (
            <img key={p.title} src={p.image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BusinessCardMockup({ brand }: { brand: Brand }) {
  const { colors, contact } = brand;
  const card = "relative aspect-[1.75/1] w-full overflow-hidden rounded-xl shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)]";
  return (
    <div className="relative mx-auto w-full max-w-md pb-10 pr-6">
      {/* Back */}
      <div className={`${card} flex flex-col justify-end p-5`} style={{ background: colors.primary }}>
        <div className="space-y-1.5 text-[13px]" style={{ color: colors.background, fontFamily: body }}>
          <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" style={{ color: colors.highlight }} aria-hidden="true" />{contact.phone}</p>
          <p className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" style={{ color: colors.highlight }} aria-hidden="true" />{contact.web}</p>
          <p className="flex items-center gap-2"><AtSign className="h-3.5 w-3.5" style={{ color: colors.highlight }} aria-hidden="true" />{contact.handle.replace("@", "")}</p>
        </div>
      </div>
      {/* Front, offset over the back */}
      <div className={`${card} absolute left-6 top-10 flex items-center gap-4 p-5 sm:left-8`} style={{ background: colors.background, width: "calc(100% - 1.5rem)" }}>
        <img src={brand.logos.stacked} alt="" className="h-20 w-20 object-contain" />
        <div>
          <p className="text-xl font-extrabold leading-tight" style={{ color: colors.ink, fontFamily: display }}>
            Quality learning.
          </p>
          <p className="text-xl font-extrabold italic leading-tight" style={{ color: colors.accent, fontFamily: display }}>
            Within reach.
          </p>
        </div>
        <Wave top={colors.highlight} bottom={colors.primary} className="absolute inset-x-0 bottom-0 h-7 w-full" />
      </div>
    </div>
  );
}

/** Orange tee, matching the uniforms the children already wear in Duara's photos. */
export function TeeMockup({ brand }: { brand: Brand }) {
  const { colors } = brand;
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 300 320" className="w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]" aria-hidden="true">
        <path
          d="M95 18 C 115 40, 185 40, 205 18 L 270 50 L 296 120 L 248 138 L 240 112 L 240 306 L 60 306 L 60 112 L 52 138 L 4 120 L 30 50 Z"
          fill={colors.accent}
        />
        <path d="M95 18 C 115 40, 185 40, 205 18" stroke="#00000022" strokeWidth="6" fill="none" />
      </svg>
      <div className="absolute left-1/2 top-[30%] flex -translate-x-1/2 flex-col items-center">
        <img src={brand.logos.mark} alt="" className="h-16 w-16 object-contain brightness-0 invert" />
        <p className="mt-1 text-center text-sm font-extrabold leading-tight text-white" style={{ fontFamily: display }}>
          DUARA
          <br />
          SCHOOL
        </p>
      </div>
    </div>
  );
}
