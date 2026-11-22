import { useEffect, useRef, useState, type ComponentType } from "react";
import { Hand } from "lucide-react";
import type { LanyardProps } from "@/components/agency/Lanyard";
import type { BadgeArt } from "@/components/agency/badgeArt";
import portrait from "@/assets/responsive/1-joseph-maina-portrait-480.webp";

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/**
 * Interactive 3D lanyard badge for the "Meet Joseph" section. three.js (~600 KB)
 * only loads once the section is near the viewport. Until then, and on browsers
 * without WebGL or during prerendering, a static HTML badge shows instead.
 */
export function MeetBadge() {
  const ref = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<{ Lanyard: ComponentType<LanyardProps>; art: BadgeArt } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasWebGL()) return;
    let cancelled = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      Promise.all([import("@/components/agency/Lanyard"), import("@/components/agency/badgeArt")])
        .then(([lanyard, badge]) => badge.createBadgeArt(portrait).then(art => ({ Lanyard: lanyard.default, art })))
        .then(next => { if (!cancelled) setScene(next); })
        .catch(() => { /* keep the static badge */ });
    }, { rootMargin: "400px 0px" });
    observer.observe(el);
    return () => { cancelled = true; observer.disconnect(); };
  }, []);

  return (
    <div className="relative">
      <div
        ref={ref}
        role="img"
        aria-label="Joseph Maina's lanyard badge: Digital Marketing Manager, paid ads, SEO and content, Nairobi, Kenya"
        className="relative h-[480px] sm:h-[560px] lg:h-[620px]"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex flex-col items-center transition-opacity duration-500 ${scene ? "opacity-0" : "opacity-100"}`}
        >
          <div className="h-[22%] w-10 bg-primary" />
          <div className="-mt-1 h-5 w-14 rounded-md bg-zinc-300 shadow" />
          <div className="mt-1 w-[min(62%,260px)] -rotate-2 overflow-hidden rounded-2xl bg-zinc-900 text-center text-white shadow-2xl">
            <img src={portrait} alt="" width={480} height={480} loading="lazy" decoding="async" className="mx-auto mt-8 aspect-square w-1/2 rounded-xl border-2 border-primary object-cover" />
            <p className="mt-4 font-display text-xl font-bold">Joseph <span className="font-serif font-normal italic text-primary">Maina</span></p>
            <p className="mt-1 px-4 pb-5 text-xs text-white/70">Digital Marketing Manager</p>
            <div className="bg-primary py-2 font-display text-xs font-bold tracking-[0.2em] text-zinc-900">ALL ACCESS</div>
          </div>
        </div>
        {scene && (
          <scene.Lanyard
            frontImage={scene.art.front}
            backImage={scene.art.back}
            strapImage={scene.art.strap}
            cardColor="#111111"
            finish="glossy"
            metal="silver"
            size={0.58}
            strapLength={0.45}
            strapWidth={0.7}
            className="absolute inset-0"
          />
        )}
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Hand className="h-3.5 w-3.5" aria-hidden /> Drag the badge around. Click or tap it to flip.
      </p>
    </div>
  );
}
