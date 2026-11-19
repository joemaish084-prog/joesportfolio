import { Marquee } from "@/components/ui/marquee";
// Background-stripped, trimmed and size-balanced copies on a shared 480×320 canvas,
// so every logo sits the same way on the white tiles below.
import logoConvey from "@/assets/marquee/convey.webp";
import logoTechmindset from "@/assets/marquee/techmindset.webp";
import logoJoan from "@/assets/marquee/joan.webp";
import logoIclear from "@/assets/marquee/iclear.webp";
import logoNorthgate from "@/assets/marquee/northgate.webp";
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
import logoNorthgateSmall from "@/assets/marquee/northgate-240.webp";
import logoDuaraSmall from "@/assets/marquee/duara-240.webp";

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

const compactLogos = [logoIclearSmall, logoConveySmall, logoJoanSmall, logoTechmindsetSmall, logoNorthgateSmall, logoDuaraSmall];

export function BrandsLogoMarquee({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <ul className="studio-client-logos" aria-label="Selected clients">
      {brands.slice(0, compactLogos.length).map(({ name }, index) => (
        <li key={name}><img src={compactLogos[index]} alt={name} width={240} height={160} loading="lazy" decoding="async" /></li>
      ))}
    </ul>;
  }
  return (
    <section className="py-12 sm:py-16 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-sm uppercase tracking-wider text-muted-foreground">
          Brands & Clients
        </p>
      </div>
      <div className="relative [--duration:70s]">
        <Marquee pauseOnHover>
          {brands.map((brand) => (
            <div key={brand.name} className="mx-8 sm:mx-12 flex flex-col items-center gap-2">
              <div className="flex h-20 w-[7.5rem] sm:h-24 sm:w-36 items-center justify-center rounded-2xl bg-white p-2 ring-1 ring-black/5 shadow-sm">
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo - ${brand.industry}`}
                  width={480}
                  height={320}
                  loading="lazy"
                  className="h-full w-full object-contain"
                  title={brand.name}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                {brand.name}
              </span>
            </div>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
