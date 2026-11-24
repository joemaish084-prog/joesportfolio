import { useCallback, useRef, useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import type { LanyardProps } from "@/components/agency/Lanyard";
import type { BadgeArt } from "@/components/agency/badgeArt";
import portrait from "@/assets/responsive/1-joseph-maina-portrait-480.webp";
import portraitSmall from "@/assets/responsive/1-joseph-maina-portrait-240.webp";

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    const context = c.getContext("webgl2");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
};

/**
 * The static badge is available immediately. The 3D scene loads on request.
 */
export function MeetBadge() {
  const flip = useRef<(() => void) | null>(null);
  const [scene, setScene] = useState<{ Lanyard: ComponentType<LanyardProps>; art: BadgeArt } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const showFallback = useCallback(() => {
    setScene(null);
    setStatus("error");
  }, []);

  async function toggleScene() {
    if (scene) {
      setScene(null);
      return;
    }
    if (status === "loading") return;
    setStatus("loading");
    try {
      if (!hasWebGL()) throw new Error("WebGL unavailable");
      const [lanyard, badge] = await Promise.all([import("./Lanyard"), import("./badgeArt")]);
      const art = await badge.createBadgeArt(portrait);
      setScene({ Lanyard: lanyard.default, art });
      setStatus("idle");
    } catch {
      showFallback();
    }
  }

  return (
    <div className="relative">
      <div
        role="img"
        aria-label="Joseph Maina's lanyard badge: Digital Marketing Manager, paid ads, SEO and content, Nairobi, Kenya"
        className="relative h-[320px] sm:h-[440px] lg:h-[520px]"
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex flex-col items-center ${scene ? "opacity-0" : "opacity-100"}`}
        >
          <div className="h-[22%] w-10 bg-primary" />
          <div className="-mt-1 h-5 w-14 rounded-md bg-zinc-300 shadow" />
          <div className="mt-1 w-[min(62%,260px)] -rotate-2 overflow-hidden rounded-2xl bg-zinc-900 text-center text-white shadow-2xl">
            <img src={portraitSmall} srcSet={`${portraitSmall} 240w, ${portrait} 480w`} sizes="130px" alt="" width={240} height={240} loading="lazy" decoding="async" className="mx-auto mt-5 aspect-square w-1/2 rounded-xl border-2 border-primary object-cover" />
            <p className="mt-4 font-display text-xl font-bold">Joseph <span className="font-serif font-normal italic text-[#ff943f]">Maina</span></p>
            <p className="mt-1 px-4 pb-5 text-xs text-white/70">Digital Marketing Manager</p>
            <div className="bg-[#ff943f] py-2 font-display text-xs font-bold tracking-[0.2em] text-zinc-900">ALL ACCESS</div>
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
            intro={false}
            flipControl={flip}
            onUnavailable={showFallback}
            className="absolute inset-0"
          />
        )}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Button type="button" size="lg" variant="outline" onClick={toggleScene} aria-disabled={status === "loading"}>
          {scene ? "Close 3D badge" : status === "loading" ? "Loading 3D badge…" : "View 3D badge"}
        </Button>
        {scene && <Button type="button" size="lg" variant="outline" onClick={() => flip.current?.()}>Flip badge</Button>}
      </div>
      <p role="status" className={status === "error" || scene ? "mt-2 text-center text-sm text-muted-foreground" : "sr-only"}>
        {status === "error" ? "The 3D badge couldn’t load. The static badge is shown above." : scene ? "Drag the badge or use the Flip badge button." : ""}
      </p>
    </div>
  );
}
