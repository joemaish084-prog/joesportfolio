import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
// Background-stripped, trimmed and size-balanced copies on a shared 480×320 canvas,
// so every logo sits the same way on the white tiles below.
import logoConvey from "@/assets/marquee/convey.webp";
import logoTechmindset from "@/assets/marquee/techmindset.webp";
import logoJoan from "@/assets/marquee/joan.webp";
import logoIclear from "@/assets/marquee/iclear.webp";
import logoNorthgate from "@/assets/marquee/northgate-crest.webp";
import logoPowwater from "@/assets/marquee/powwater.webp";
import logoGlowskin from "@/assets/marquee/glowskin.webp";
import logoBeautysquare from "@/assets/marquee/beautysquare.webp";
import logoDuara from "@/assets/marquee/duara.webp";
import logoDansar from "@/assets/marquee/dansar.webp";
import logoBeulah from "@/assets/marquee/beulah.webp";
import logoSurbubia from "@/assets/marquee/surbubia.webp";
import logoConveySmall from "@/assets/marquee/convey-240.webp";
import logoTechmindsetSmall from "@/assets/marquee/techmindset-240.webp";
import logoJoanSmall from "@/assets/marquee/joan-240.webp";
import logoIclearSmall from "@/assets/marquee/iclear-240.webp";
import logoDuaraSmall from "@/assets/marquee/duara-240.webp";
import logoNorthgateSmall from "@/assets/marquee/northgate-crest-96.webp";
import logoPowwaterSmall from "@/assets/marquee/powwater-240.webp";
import logoGlowskinSmall from "@/assets/marquee/glowskin-240.webp";
import logoBeautysquareSmall from "@/assets/marquee/beautysquare-240.webp";
import logoDansarSmall from "@/assets/marquee/dansar-240.webp";
import logoBeulahSmall from "@/assets/marquee/beulah-240.webp";
import logoSurbubiaSmall from "@/assets/marquee/surbubia-240.webp";

const brands = [
  { name: "iClear Wellife Service", industry: "Water Purification Company", logo: logoIclear },
  { name: "Convey Communications", industry: "PR Firm", logo: logoConvey },
  { name: "Joan Mbesya", industry: "Personal Brand", logo: logoJoan },
  { name: "TechMindset Africa", industry: "AI Company", logo: logoTechmindset },
  { name: "NorthGate School", industry: "Education", logo: logoNorthgate },
  { name: "Duara Schools", industry: "Education", logo: logoDuara },
  { name: "PowWater", industry: "Water Services", logo: logoPowwater },
  { name: "Glow Skin Cosmetics", industry: "Skincare Retailer", logo: logoGlowskin },
  { name: "Beauty Square Kenya", industry: "Skincare Retail", logo: logoBeautysquare },
  { name: "Dansar Babyshop", industry: "Baby Products Retailer", logo: logoDansar },
  { name: "Beulah Wellness Solutions", industry: "Health & Wellness", logo: logoBeulah },
  { name: "Surbubia Homes", industry: "Real Estate", logo: logoSurbubia },
];

const compactLogos = [logoIclearSmall, logoConveySmall, logoJoanSmall, logoTechmindsetSmall, logoNorthgate, logoDuaraSmall];
const smallLogos = [logoIclearSmall, logoConveySmall, logoJoanSmall, logoTechmindsetSmall, logoNorthgateSmall,
  logoDuaraSmall, logoPowwaterSmall, logoGlowskinSmall, logoBeautysquareSmall, logoDansarSmall, logoBeulahSmall, logoSurbubiaSmall];

function StudioLogos() {
  const [paused, setPaused] = useState(false);
  const Icon = paused ? Play : Pause;
  return (
    <div className="studio-client-logos" data-paused={paused} data-scroll-loop data-lenis-prevent role="region" aria-label="Selected clients">
      <div className="studio-logo-heading">
        <p className="studio-kicker">Selected clients</p>
        <button type="button" className="studio-motion-control" onClick={() => setPaused(current => !current)}
          aria-label={paused ? "Play logo marquee" : "Pause logo marquee"}>
          <Icon size={15} aria-hidden />
        </button>
      </div>
      <Marquee pauseOnHover repeat={2} className="studio-logo-marquee">
        {brands.slice(0, compactLogos.length).map(({ name }, index) => (
          <div key={name} className="studio-logo-tile" data-brand={index === 4 ? "northgate" : undefined}>
            <img src={compactLogos[index]} alt={name} width={index === 4 ? 160 : 240}
              height={index === 4 ? 256 : 160} loading="lazy" decoding="async" />
          </div>
        ))}
      </Marquee>
    </div>
  );
}

export function BrandsLogoMarquee({ compact = false }: { compact?: boolean }) {
  if (compact) return <StudioLogos />;
  return (
    <section id="client-brands" className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-sm uppercase tracking-wider text-muted-foreground">
          Brands & Clients
        </p>
      </div>
      <div role="region" tabIndex={0} aria-label="Client logos"
        className="overflow-x-auto overscroll-x-contain rounded-lg pb-3">
        <ul className="flex w-max gap-4">
          {brands.map((brand, index) => {
            const crest = brand.logo === logoNorthgate;
            return (
            <li key={brand.name} className="flex w-[7.5rem] shrink-0 flex-col items-center gap-2 text-center sm:w-36">
              <div className="flex h-20 w-[7.5rem] sm:h-24 sm:w-36 items-center justify-center rounded-2xl bg-white p-2 ring-1 ring-black/5 shadow-sm">
                <img
                  src={smallLogos[index]}
                  srcSet={crest ? `${logoNorthgateSmall} 96w, ${logoNorthgate} 160w` : `${smallLogos[index]} 240w, ${brand.logo} 480w`}
                  sizes={crest ? "(min-width: 640px) 50px, 40px" : "(min-width: 640px) 128px, 104px"}
                  alt=""
                  width={crest ? 160 : 240}
                  height={crest ? 256 : 160}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-medium leading-snug text-muted-foreground">
                {brand.name}
              </span>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
