import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { brandHead } from "@/seo/pageHeads";
import { Swoosh } from "@/components/branding/BrandArt";
import { displayFont, kits, paintText } from "@/components/branding/kits";
import { getBrand, type Brand } from "@/data/brands";
import NotFound from "./NotFound";

/** Brand fonts are only needed here, so they load with the page instead of site-wide. */
function useBrandFonts(href: string) {
  useEffect(() => {
    if (!href || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
}

function Chapter({ n, label, title, intro, children }: { n: string; label: string; title: ReactNode; intro?: string; children: ReactNode }) {
  return (
    <section className="border-t border-brand-ink/15 py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-label">
            {n} — {label}
          </p>
          <h2 className="mt-3 text-3xl leading-[1.05] sm:text-4xl" style={displayFont}>
            {title}
          </h2>
          {intro && <p className="mt-4 max-w-sm leading-relaxed text-brand-ink/75">{intro}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function LogoSection({ brand }: { brand: Brand }) {
  const [stage, setStage] = useState(0);
  const current = brand.logoStages[stage];
  const { book } = brand;
  return (
    <Chapter n="01" label="Logo" title={book.logo.title} intro={book.logo.intro}>
      <div className="overflow-hidden rounded-3xl border border-brand-ink/10">
        <div className="flex aspect-[16/10] items-center justify-center transition-colors duration-500" style={{ background: current.bg }}>
          <img
            src={current.logo === "white" ? brand.logos.white : brand.logos.stacked}
            alt={`${brand.name} logo, ${current.label.toLowerCase()}`}
            className="h-2/5 max-h-56 w-auto object-contain transition-[filter] duration-500"
            style={{ filter: current.filter ?? "none" }}
          />
        </div>
        <div role="group" aria-label="Logo background" className="flex flex-wrap gap-2 border-t border-brand-ink/10 bg-brand-surface/60 p-3">
          {brand.logoStages.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-pressed={i === stage}
              onClick={() => setStage(i)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${
                i === stage ? "bg-brand-ink text-brand-bg" : "text-brand-ink/70 hover:bg-brand-ink/5"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full ring-1 ring-brand-ink/20" style={{ background: s.bg }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="flex aspect-[16/9] items-center justify-center rounded-3xl bg-white p-8 ring-1 ring-brand-ink/10">
          <img src={brand.logos.horizontal} alt={`${brand.name} horizontal lockup`} loading="lazy" className="max-h-full w-auto object-contain" />
        </div>
        <div className="relative flex aspect-[16/9] items-center justify-center rounded-3xl bg-white p-8 ring-1 ring-brand-ink/10">
          <div className="relative border border-dashed border-brand-accent p-6">
            <img src={brand.logos.mark} alt="" loading="lazy" className="h-16 w-16 object-contain" />
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-brand-accent">x</span>
            <span className="absolute -left-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-brand-accent">x</span>
          </div>
          <p className="absolute bottom-3 left-0 right-0 px-4 text-center text-xs text-neutral-500">{book.logo.clearSpace}</p>
        </div>
      </div>
    </Chapter>
  );
}

function ColourSection({ brand }: { brand: Brand }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      toast.success(`${hex} copied`);
      window.setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1600);
    } catch {
      toast.error("Couldn't copy. Select the code instead.");
    }
  };
  return (
    <Chapter n="02" label="Colour" title={brand.book.colour.title} intro={brand.book.colour.intro}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {brand.palette.map((c) => (
          <li key={c.hex}>
            <button
              type="button"
              onClick={() => copy(c.hex)}
              className="group flex h-full min-h-44 w-full flex-col justify-between rounded-2xl p-4 text-left ring-1 ring-brand-ink/10 transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent sm:min-h-56"
              style={{ background: c.hex, color: c.on }}
            >
              <span className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-80">
                {c.share}%
                {copied === c.hex ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />}
              </span>
              <span>
                <span className="block text-lg leading-tight" style={displayFont}>{c.name}</span>
                <span className="mt-1 block font-mono text-sm">{c.hex}</span>
                <span className="mt-2 block text-xs leading-snug opacity-80">{c.role}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-ink/60">Typical post balance</p>
      <div className="mt-3 flex h-4 overflow-hidden rounded-full ring-1 ring-brand-ink/10" role="img" aria-label={brand.palette.map((c) => `${c.name} ${c.share}%`).join(", ")}>
        {brand.palette.map((c) => (
          <span key={c.hex} style={{ background: c.hex, width: `${c.share}%` }} />
        ))}
      </div>
    </Chapter>
  );
}

function TypeSection({ brand }: { brand: Brand }) {
  const h = brand.headline;
  const [line, setLine] = useState(h.sample.line);
  const [accent, setAccent] = useState(h.sample.accent);
  const input = "min-h-11 w-full rounded-xl border border-brand-ink/15 bg-brand-bg px-4 text-base text-brand-ink outline-none focus:border-brand-accent";
  return (
    <Chapter n="03" label="Typography" title={brand.book.type.title} intro={brand.book.type.intro}>
      <div className="grid gap-5 sm:grid-cols-2">
        {brand.fonts.map((f) => {
          const style: CSSProperties = { fontFamily: f.family, fontWeight: f.weight, fontStyle: f.italic ? "italic" : "normal", color: f.color ?? "var(--ink)" };
          return (
            <div key={f.name} className="flex flex-col justify-between rounded-3xl bg-brand-surface p-6 ring-1 ring-brand-ink/10">
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-label">{f.role}</p>
                <span className="text-5xl leading-none" style={style}>Aa</span>
              </div>
              <p className="mt-8 break-words text-2xl leading-tight sm:text-3xl" style={{ ...style, letterSpacing: f.weight >= 800 ? "-0.03em" : undefined }}>
                {f.sample}
              </p>
              <p className="mt-4 border-t border-brand-ink/10 pt-3 text-sm text-brand-ink/65">{f.name}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl bg-brand-surface ring-1 ring-brand-ink/10">
        <div className="p-6 sm:p-10" style={{ background: h.panel }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: h.lineColor, opacity: 0.75 }}>Try the headline style</p>
          <p className="mt-5 break-words text-4xl leading-[0.98] sm:text-6xl" style={{ letterSpacing: h.tracking }} aria-live="polite">
            <span className="block" style={{ fontFamily: h.lineFont, fontWeight: h.lineWeight, color: h.lineColor }}>{line || " "}</span>
            <span className="inline-block">
              <span style={{ fontFamily: h.accentFont, fontWeight: h.accentWeight, fontStyle: h.accentItalic ? "italic" : "normal", ...paintText(h.accentPaint) }}>
                {accent || " "}
              </span>
              {h.underline && <Swoosh color={h.underline} className="mt-1 h-3 w-full" />}
            </span>
          </p>
        </div>
        <div className="grid gap-3 border-t border-brand-ink/10 p-4 sm:grid-cols-2">
          <label className="text-xs font-bold text-brand-ink/70">
            Headline
            <input className={`${input} mt-1`} value={line} maxLength={40} onChange={(e) => setLine(e.target.value)} />
          </label>
          <label className="text-xs font-bold text-brand-ink/70">
            Accent phrase
            <input className={`${input} mt-1`} value={accent} maxLength={30} onChange={(e) => setAccent(e.target.value)} />
          </label>
        </div>
      </div>
    </Chapter>
  );
}

function AnatomySection({ brand }: { brand: Brand }) {
  const [active, setActive] = useState(0);
  const { image, callouts } = brand.anatomy;
  return (
    <Chapter n="05" label="Layout" title="Anatomy of a post" intro={brand.book.anatomy.intro}>
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-brand-ink/10">
          <img src={image} alt={`Annotated ${brand.name} post`} width={1080} height={1350} loading="lazy" decoding="async" className="block h-auto w-full" />
          {callouts.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${i + 1}: ${c.label}`}
              aria-pressed={i === active}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-extrabold shadow-lg ring-2 ring-white transition-transform ${
                i === active ? "scale-125 bg-brand-accent text-brand-on-accent" : "bg-neutral-900 text-white hover:scale-110"
              }`}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <ol className="space-y-2">
          {callouts.map((c, i) => (
            <li key={c.label}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`flex w-full gap-4 rounded-2xl p-4 text-left transition-colors ${i === active ? "bg-brand-surface shadow-md ring-1 ring-brand-ink/10" : "hover:bg-brand-surface/60"}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${i === active ? "bg-brand-accent text-brand-on-accent" : "bg-brand-ink/10 text-brand-ink"}`}>{i + 1}</span>
                <span>
                  <span className="block text-brand-ink" style={displayFont}>{c.label}</span>
                  <span className="block text-sm text-brand-ink/70">{c.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}

function TemplatesSection({ brand }: { brand: Brand }) {
  const [filter, setFilter] = useState<string>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = useMemo(() => (filter === "All" ? brand.posts : brand.posts.filter((p) => p.template === filter)), [brand.posts, filter]);
  const options = [{ name: "All", count: brand.posts.length }, ...brand.templates.map((t) => ({ name: t.name, count: brand.posts.filter((p) => p.template === t.name).length }))];
  const selected = openIndex === null ? null : visible[openIndex];
  const step = (d: number) => setOpenIndex((i) => (i === null ? i : (i + d + visible.length) % visible.length));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };
  return (
    <Chapter n="06" label="In use" title={brand.book.templates.title} intro={brand.book.templates.intro}>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
        {brand.templates.map((t) => (
          <div key={t.name} className="rounded-2xl bg-brand-surface p-4 ring-1 ring-brand-ink/10">
            <p className="text-brand-ink" style={displayFont}>{t.name}</p>
            <p className="mt-1 text-sm text-brand-ink/70">{t.description}</p>
          </div>
        ))}
      </div>
      <div role="group" aria-label="Filter posts by template" className="mt-6 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {options.map((o) => (
          <button
            key={o.name}
            type="button"
            aria-pressed={o.name === filter}
            onClick={() => {
              setFilter(o.name);
              setOpenIndex(null);
            }}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${
              o.name === filter ? "bg-brand-primary text-brand-on-primary" : "bg-brand-surface text-brand-ink/70 ring-1 ring-brand-ink/10 hover:text-brand-ink"
            }`}
          >
            {o.name}
            <span className="opacity-60">{o.count}</span>
          </button>
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {visible.map((p, i) => (
          <li key={p.title}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`View ${p.title}`}
              className="group block w-full overflow-hidden rounded-xl ring-1 ring-brand-ink/10 transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <img src={p.thumb} alt={`${p.title}, ${p.template}`} width={540} height={675} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl w-full gap-0 overflow-hidden p-0" onKeyDown={onKey}>
          {selected && openIndex !== null && (
            <>
              <div className="relative bg-black">
                <img src={selected.image} alt={selected.title} className="mx-auto max-h-[75vh] w-auto max-w-full object-contain" />
                <button type="button" onClick={() => step(-1)} aria-label="Previous post" className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-primary">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next post" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-primary">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-start justify-between gap-6 p-5">
                <div>
                  <DialogTitle className="text-lg font-display font-bold">{selected.title}</DialogTitle>
                  <DialogDescription className="mt-1">{selected.template}</DialogDescription>
                </div>
                <p className="shrink-0 text-sm tabular-nums text-muted-foreground">{openIndex + 1} / {visible.length}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Chapter>
  );
}

function RulesSection({ brand }: { brand: Brand }) {
  const rules = kits[brand.slug].rules(brand);
  return (
    <Chapter n="08" label="Guardrails" title="Do's and don'ts" intro={brand.book.rules.intro}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {rules.map((r) => (
          <li key={r.caption} className="overflow-hidden rounded-3xl bg-brand-surface ring-1 ring-brand-ink/10">
            <div className="flex h-36 items-center justify-center bg-brand-bg px-6">{r.art}</div>
            <p className="flex items-start gap-3 p-4 text-sm text-brand-ink">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${r.ok ? "bg-[#1E8E5A]" : "bg-[#C0392B]"}`}>
                {r.ok ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
              <span>
                <span className="sr-only">{r.ok ? "Do: " : "Don't: "}</span>
                {r.caption}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}

const WorkBrand = () => {
  const { slug } = useParams();
  const brand = getBrand(slug);
  useBrandFonts(brand?.fontsHref ?? "");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const kit = brand && kits[brand.slug];
  if (!brand || !kit) return <NotFound />;
  const { colors, cover, type, book } = brand;
  const { Divider, Elements, Mockups } = kit;
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
  const vars = {
    "--brand-bg": channels(colors.background),
    "--brand-surface": channels(colors.surface),
    "--brand-ink": channels(colors.ink),
    "--brand-primary": channels(colors.primary),
    "--brand-on-primary": channels(colors.onPrimary),
    "--brand-accent": channels(colors.accent),
    "--brand-on-accent": channels(colors.onAccent),
    "--brand-highlight": channels(colors.highlight),
    "--brand-on-highlight": channels(colors.onHighlight),
    "--brand-label": channels(colors.label),
    "--brand-display": type.display,
    "--brand-display-weight": String(type.displayWeight),
    "--brand-display-tracking": type.displayTracking,
    "--brand-body": type.body,
    "--ink": colors.ink,
  } as CSSProperties;

  return (
    <>
      <Seo {...brandHead(brand)} />
      <SiteHeader />
      <main className="min-h-screen" style={{ ...vars, background: colors.background, color: colors.ink, fontFamily: type.body }}>
        {/* The site header is transparent at the top; this strip keeps its links readable over the cover. */}
        <div className="h-14 bg-background lg:h-16" />
        {/* Cover */}
        <header className="relative overflow-hidden pt-8 sm:pt-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/work/branding" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-ink/70 hover:text-brand-accent">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All brand identities
            </Link>
            <div className="grid items-center gap-10 pb-10 pt-8 lg:grid-cols-[1.3fr_1fr] lg:pb-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-label">Brand identity · {brand.year}</p>
                <h1 className="mt-4 text-5xl leading-[0.95] sm:text-7xl" style={displayFont}>
                  {cover.line}
                  <span className="block">
                    <span style={{ fontStyle: brand.headline.accentItalic ? "italic" : "normal", ...paintText(cover.accentPaint) }}>{cover.accent}</span>
                    {brand.headline.underline && <Swoosh color={colors.highlight} className="mt-1 h-4 w-2/3" />}
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-ink/80">{brand.tagline}</p>
                <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-ink/55">Sector</dt>
                    <dd className="mt-1 font-bold">{brand.sector}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-brand-ink/55">Deliverables</dt>
                    <dd className="mt-1 font-bold">{brand.scope.join(", ")}</dd>
                  </div>
                </dl>
              </div>
              <div className="relative mx-auto aspect-square w-full max-w-sm">
                <div className="absolute inset-0 rounded-full shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]" style={{ background: cover.disc }} />
                <img
                  src={cover.logo === "white" ? brand.logos.white : brand.logos.stacked}
                  alt={`${brand.name} logo`}
                  className="relative h-full w-full object-contain p-[22%]"
                />
              </div>
            </div>
          </div>
          <Divider brand={brand} className="h-20 sm:h-28" />
        </header>

        {/* Brief */}
        <section className="bg-brand-primary text-brand-on-primary">
          <div className="container mx-auto grid gap-10 px-4 pb-16 pt-6 sm:px-6 sm:pb-24 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-highlight">The brief</p>
              <p className="mt-4 text-2xl font-semibold leading-snug sm:text-[1.75rem]">{brand.brief}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-highlight">What I did</p>
              <ol className="mt-4 space-y-4">
                {brand.approach.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-highlight text-sm font-extrabold text-brand-on-highlight">{i + 1}</span>
                    <span className="leading-relaxed text-brand-on-primary/90">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LogoSection brand={brand} />
          <ColourSection brand={brand} />
          <TypeSection brand={brand} />
          <Chapter n="04" label="Brand elements" title={book.elements.title} intro={book.elements.intro}>
            <Elements brand={brand} />
          </Chapter>
          <AnatomySection brand={brand} />
          <TemplatesSection brand={brand} />
          <Chapter n="07" label="Applications" title={book.mockups.title} intro={book.mockups.intro}>
            <Mockups brand={brand} />
          </Chapter>
          <RulesSection brand={brand} />
        </div>

        <Divider brand={brand} className="mt-8 h-16 sm:h-24" />
        <section className="bg-brand-primary">
          <div className="container mx-auto px-4 pb-20 pt-6 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl text-brand-on-primary sm:text-5xl" style={displayFont}>
              Need a brand that{" "}
              <span className="text-brand-highlight" style={{ fontStyle: brand.headline.accentItalic ? "italic" : "normal" }}>holds together?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-on-primary/80">Logo, colour, type and templates your team can keep using long after launch.</p>
            <a href="/#contact" className="mt-8 inline-flex min-h-11 items-center gap-4 rounded-full bg-brand-highlight py-2 pl-6 pr-2 text-lg font-bold text-brand-on-highlight transition-transform hover:-translate-y-0.5">
              Start a project
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-on-highlight text-brand-highlight">
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default WorkBrand;
