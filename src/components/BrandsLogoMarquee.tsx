import { Marquee } from "@/components/ui/marquee";
import logoConvey from "@/assets/logo-convey.webp";
import logoTechmindset from "@/assets/logo-techmindset.webp";
import logoJoan from "@/assets/logo-joan.webp";
import logoIclear from "@/assets/logo-iclear.webp";
import logoNorthgate from "@/assets/logo-northgate.webp";
import logoPowwater from "@/assets/logo-powwater.webp";
import logoGlowskin from "@/assets/logo-glowskin.jpg";
import logoBeautysquare from "@/assets/logo-beautysquare.jpg";

const brands = [
  { name: "iClear Wellife Service", industry: "Water Purification Company", logo: logoIclear },
  { name: "Convey Communications", industry: "PR Firm", logo: logoConvey },
  { name: "Joan Mbesya", industry: "Personal Brand", logo: logoJoan },
  { name: "TechMindset Africa", industry: "AI Company", logo: logoTechmindset },
  { name: "NorthGate School", industry: "Education", logo: logoNorthgate },
  { name: "PowWater", industry: "Water Services", logo: logoPowwater },
  { name: "Glow Skin Cosmetics", industry: "Skincare Retailer", logo: logoGlowskin },
  { name: "Beauty Square Kenya", industry: "Skincare Retail", logo: logoBeautysquare },
];

export function BrandsLogoMarquee() {
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
              <img
                src={brand.logo}
                alt={`${brand.name} logo - ${brand.industry}`}
                width={112}
                height={112}
                loading="lazy"
                className="h-16 sm:h-20 w-auto object-contain"
                title={brand.name}
              />
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
