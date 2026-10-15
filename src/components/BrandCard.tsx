import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Brand } from "@/data/brands";

/**
 * A brand shown as a cover in its own colours, so it reads as a brand book rather
 * than another poster tile. Shared by the homepage section and /work/branding.
 */
export function BrandCard({ brand }: { brand: Brand }) {
  const { colors } = brand;
  const fan = brand.posts.slice(0, 3);
  return (
    <Link
      to={`/work/branding/${brand.slug}`}
      className="group grid overflow-hidden rounded-3xl ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1fr_1.1fr]"
      style={{ background: colors.background, color: colors.ink }}
    >
      <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
        <div>
          <img src={brand.logos.horizontal} alt={`${brand.name} logo`} className="h-10 w-auto sm:h-12" />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: colors.primary }}>
            Brand identity · {brand.sector}
          </p>
          <h3 className="mt-2 text-2xl font-display font-bold leading-tight sm:text-3xl">{brand.tagline}</h3>
        </div>
        <div>
          <ul className="flex gap-1.5" aria-label="Brand palette">
            {brand.palette.map((c) => (
              <li key={c.hex} title={`${c.name} ${c.hex}`} className="h-8 w-8 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
            ))}
          </ul>
          <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            {brand.scope.map((s) => (
              <li key={s} className="rounded-full border px-3 py-1.5" style={{ borderColor: `${colors.ink}33` }}>
                {s}
              </li>
            ))}
          </ul>
          <span className="mt-6 inline-flex items-center gap-2 font-bold" style={{ color: colors.primary }}>
            Open the brand book
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px]" style={{ background: colors.primary }}>
        <div className="absolute inset-x-0 top-0 h-6" style={{ background: colors.highlight, borderRadius: "0 0 50% 50% / 0 0 100% 100%" }} />
        {fan.map((p, i) => (
          <img
            key={p.title}
            src={p.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute top-1/2 w-[38%] rounded-lg shadow-2xl ring-1 ring-black/20 transition-transform duration-500"
            style={{
              left: `${8 + i * 27}%`,
              transform: `translateY(-50%) rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? -6 : 6}%)`,
              zIndex: i === 1 ? 2 : 1,
            }}
          />
        ))}
      </div>
    </Link>
  );
}
