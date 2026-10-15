import type { ReactNode } from "react";
import { Grid3x3 } from "lucide-react";
import type { Brand } from "@/data/brands";

/** Phone showing the brand's Instagram profile, with the posts as the feed. */
export function InstagramMockup({ brand }: { brand: Brand }) {
  const { colors, instagram } = brand;
  const avatar = instagram.avatarLogo === "white" ? brand.logos.white : brand.logos.mark;
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[2.6rem] bg-neutral-900 p-3 shadow-2xl ring-1 ring-black/40">
      <div className="overflow-hidden rounded-[2rem] bg-white text-neutral-900" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="flex justify-center pt-2">
          <span className="h-5 w-24 rounded-full bg-neutral-900" />
        </div>
        <p className="px-4 pt-3 text-center text-sm font-bold">{brand.contact.handle.replace("@", "")}</p>
        <div className="flex items-center gap-4 px-4 pt-4">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full p-0.5"
            style={{ background: `linear-gradient(135deg, ${colors.highlight}, ${colors.accent}, ${colors.primary})` }}
          >
            <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-white" style={{ background: instagram.avatarBg }}>
              <img src={avatar} alt="" className="h-10 w-10 object-contain" />
            </span>
          </span>
          <div className="grid flex-1 grid-cols-1 text-center">
            <span className="text-base font-bold">{brand.posts.length}</span>
            <span className="text-xs text-neutral-500">posts</span>
          </div>
        </div>
        <div className="px-4 pt-3 text-xs leading-snug">
          <p className="font-bold">{brand.name}</p>
          {instagram.bio.map((line) => (
            <p key={line} className="text-neutral-600">{line}</p>
          ))}
          <p className="font-semibold text-[#00376B]">{brand.contact.web}</p>
        </div>
        <div className="mt-3 flex justify-center border-t border-neutral-200 py-2">
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-3 gap-px bg-neutral-200">
          {brand.posts.slice(0, 9).map((p) => (
            <img key={p.title} src={p.mini} alt="" width={240} height={300} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** A coloured panel with a small label, holding one mockup. */
export function MockupPanel({ label, bg, labelColor, className = "", children }: { label: string; bg: string; labelColor: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col rounded-3xl p-6 sm:p-10 ${className}`} style={{ background: bg }}>
      <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: labelColor }}>{label}</p>
      <div className="flex flex-1 items-center pt-6">{children}</div>
    </div>
  );
}

export const cardShape = "relative aspect-[1.75/1] w-full overflow-hidden rounded-xl shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)]";
