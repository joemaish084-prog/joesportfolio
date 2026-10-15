import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Copy, Lightbulb, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Wave, Swoosh, Sunflower } from "@/components/branding/BrandArt";
import { BusinessCardMockup, InstagramMockup, TeeMockup } from "@/components/branding/BrandMockups";
import { getBrand, type Brand } from "@/data/brands";
import NotFound from "./NotFound";

const display = "'Plus Jakarta Sans', sans-serif";
const body = "'Lato', sans-serif";

/** Brand fonts are only needed here, so they load with the page instead of site-wide. */
function useBrandFonts(href: string) {
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return;
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
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-primary" style={{ fontFamily: body }}>
            {n} — {label}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl" style={{ fontFamily: display }}>
            {title}
          </h2>
          {intro && <p className="mt-4 max-w-sm leading-relaxed text-brand-ink/75">{intro}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

const logoStages = [
  { label: "Full colour", bg: "var(--bg)", filter: "none" },
  { label: "On white", bg: "#FFFFFF", filter: "none" },
  { label: "Reversed", bg: "var(--primary)", filter: "brightness(0) invert(1)" },
  { label: "One colour", bg: "var(--highlight)", filter: "brightness(0)" },
];

function LogoSection({ brand }: { brand: Brand }) {
  const [stage, setStage] = useState(0);
  const current = logoStages[stage];
  return (
    <Chapter n="01" label="Logo" title="The sunflower mark" intro="The dotted spiral grows outward like a sunflower head: many small parts becoming one community. It keeps its colours wherever the background allows.">
      <div className="overflow-hidden rounded-3xl border border-brand-ink/10">
        <div className="flex aspect-[16/10] items-center justify-center transition-colors duration-500" style={{ background: current.bg }}>
          <img src={brand.logos.stacked} alt={`${brand.name} logo, ${current.label.toLowerCase()}`} className="h-2/5 max-h-56 w-auto object-contain transition-[filter] duration-500" style={{ filter: current.filter }} />
        </div>
        <div role="group" aria-label="Logo background" className="flex flex-wrap gap-2 border-t border-brand-ink/10 bg-white/60 p-3">
          {logoStages.map((s, i) => (
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
          <img src={brand.logos.horizontal} alt={`${brand.name} horizontal lockup`} className="max-h-full w-auto object-contain" />
        </div>
        <div className="relative flex aspect-[16/9] items-center justify-center rounded-3xl bg-white p-8 ring-1 ring-brand-ink/10">
          <div className="relative border border-dashed border-brand-accent p-6">
            <img src={brand.logos.mark} alt="" className="h-16 w-16 object-contain" />
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-brand-accent">x</span>
            <span className="absolute -left-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-brand-accent">x</span>
          </div>
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-brand-ink/60">Clear space: keep one dot-ring (x) free on every side</p>
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
    <Chapter n="02" label="Colour" title="Pulled from the logo" intro="Every colour comes from the sunflower mark, so posts feel related to the logo even before you see it. Tap a swatch to copy its code.">
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
                <span className="block text-lg font-extrabold leading-tight" style={{ fontFamily: display }}>{c.name}</span>
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
  const [line, setLine] = useState("A school that");
  const [accent, setAccent] = useState("feels like home.");
  const input = "min-h-11 w-full rounded-xl border border-brand-ink/15 bg-white px-4 text-base text-brand-ink outline-none focus:border-brand-accent";
  return (
    <Chapter n="03" label="Typography" title="One loud voice, one warm accent" intro="Headlines are heavy and tightly set in Forest Ink. One phrase per headline switches to the italic in Marigold. That one phrase is where the feeling goes.">
      <div className="grid gap-5 sm:grid-cols-2">
        {brand.fonts.map((f) => (
          <div key={f.name} className="flex flex-col justify-between rounded-3xl bg-white p-6 ring-1 ring-brand-ink/10">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">{f.role}</p>
              <span className="text-5xl leading-none" style={{ fontFamily: f.family, fontWeight: f.weight, fontStyle: f.italic ? "italic" : "normal", color: f.italic ? "var(--accent)" : "var(--ink)" }}>
                Aa
              </span>
            </div>
            <p className="mt-8 break-words text-2xl leading-tight sm:text-3xl" style={{ fontFamily: f.family, fontWeight: f.weight, fontStyle: f.italic ? "italic" : "normal", color: f.italic ? "var(--accent)" : "var(--ink)", letterSpacing: f.weight >= 800 ? "-0.03em" : undefined }}>
              {f.sample}
            </p>
            <p className="mt-4 border-t border-brand-ink/10 pt-3 text-sm text-brand-ink/65">{f.name}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl bg-white ring-1 ring-brand-ink/10">
        <div className="p-6 sm:p-10" style={{ background: "var(--bg)" }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Try the headline style</p>
          <p className="mt-5 break-words text-4xl font-extrabold leading-[0.98] sm:text-6xl" style={{ fontFamily: display, letterSpacing: "-0.035em" }} aria-live="polite">
            <span className="block text-brand-ink">{line || " "}</span>
            <span className="inline-block italic text-brand-accent">
              {accent || " "}
              <Swoosh color="var(--accent)" className="mt-1 h-3 w-full" />
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

function ElementsSection({ brand }: { brand: Brand }) {
  const icons = [
    { Icon: BookOpen, label: "Strong foundations" },
    { Icon: Lightbulb, label: "Future skills" },
    { Icon: Users, label: "Nurturing community" },
  ];
  return (
    <Chapter n="04" label="Brand elements" title="Pieces that repeat everywhere" intro="A small kit of shapes that shows up on every post. They are what make the feed read as one family.">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="relative col-span-full overflow-hidden rounded-3xl bg-brand-bg ring-1 ring-brand-ink/10">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">The wave</p>
            <p className="mt-2 max-w-md text-sm text-brand-ink/70">A Sunflower edge riding on a Duara Green swell. It frames photos and carries the footer.</p>
          </div>
          <Wave top={brand.colors.highlight} bottom={brand.colors.primary} className="block h-24 w-full sm:h-32" />
        </div>

        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-primary p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-highlight">Pill button</p>
          <span className="inline-flex items-center gap-4 rounded-full bg-brand-highlight py-2 pl-6 pr-2 text-lg font-extrabold text-brand-ink sm:text-xl" style={{ fontFamily: display }}>
            Come visit and meet us
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ink text-brand-highlight">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </span>
          </span>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-white p-6 ring-1 ring-brand-ink/10 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Icon circles</p>
          <div className="flex justify-between gap-2">
            {icons.map(({ Icon, label }) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-2 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-highlight text-brand-ink">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold leading-tight text-brand-ink">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-white p-6 ring-1 ring-brand-ink/10 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Level line</p>
          <p className="text-lg font-bold text-brand-ink sm:text-xl" style={{ fontFamily: body }}>
            Playgroup <span className="text-brand-highlight">•</span> PP1 <span className="text-brand-highlight">•</span> PP2 <span className="text-brand-highlight">•</span> Grade 1 + 2
          </p>
        </div>

        <div className="flex items-center gap-5 rounded-3xl bg-white p-6 ring-1 ring-brand-ink/10 sm:p-8">
          <Sunflower className="h-16 w-16 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Child privacy</p>
            <p className="mt-1 text-sm text-brand-ink/75">Where there's no photo consent, a sunflower covers the child's face. The privacy rule doubles as part of the brand.</p>
          </div>
        </div>
      </div>
    </Chapter>
  );
}

function AnatomySection({ brand }: { brand: Brand }) {
  const [active, setActive] = useState(0);
  const { image, callouts } = brand.anatomy;
  return (
    <Chapter n="05" label="Layout" title="Anatomy of a post" intro="Every Admissions post is built on the same skeleton. Tap a number to see what each part does.">
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-brand-ink/10">
          <img src={image} alt="Annotated Duara post" className="block w-full" />
          {callouts.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${i + 1}: ${c.label}`}
              aria-pressed={i === active}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-extrabold shadow-lg ring-2 ring-white transition-transform ${
                i === active ? "scale-125 bg-brand-accent text-white" : "bg-brand-ink text-white hover:scale-110"
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
                className={`flex w-full gap-4 rounded-2xl p-4 text-left transition-colors ${i === active ? "bg-white shadow-md ring-1 ring-brand-ink/10" : "hover:bg-white/60"}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${i === active ? "bg-brand-accent text-white" : "bg-brand-ink/10 text-brand-ink"}`}>{i + 1}</span>
                <span>
                  <span className="block font-extrabold text-brand-ink" style={{ fontFamily: display }}>{c.label}</span>
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
    <Chapter n="06" label="In use" title="One system, three templates" intro="Admissions, Parent Voices and Events. Each has its own job, and all of them are built from the same parts.">
      <div className="grid gap-3 sm:grid-cols-3">
        {brand.templates.map((t) => (
          <div key={t.name} className="rounded-2xl bg-white p-4 ring-1 ring-brand-ink/10">
            <p className="font-extrabold text-brand-ink" style={{ fontFamily: display }}>{t.name}</p>
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
              o.name === filter ? "bg-brand-primary text-brand-bg" : "bg-white text-brand-ink/70 ring-1 ring-brand-ink/10 hover:text-brand-ink"
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
              <img src={p.image} alt={`${p.title}, ${p.template} template`} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
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
                  <DialogDescription className="mt-1">{selected.template} template</DialogDescription>
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

function MockupsSection({ brand }: { brand: Brand }) {
  return (
    <Chapter n="07" label="Applications" title="Beyond the feed" intro="The same system carried onto the profile, print and uniforms, so the brand looks the same online and at the school gate.">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="row-span-2 flex flex-col rounded-3xl bg-brand-highlight p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-ink">Instagram profile</p>
          <div className="flex flex-1 items-center pt-6">
            <InstagramMockup brand={brand} />
          </div>
        </div>
        <div className="flex flex-col rounded-3xl bg-[#E9E2D0] p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-ink">Business card</p>
          <div className="flex flex-1 items-center pt-6">
            <BusinessCardMockup brand={brand} />
          </div>
        </div>
        <div className="flex flex-col rounded-3xl bg-brand-primary p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-highlight">Uniform tee</p>
          <div className="flex flex-1 items-center pt-6">
            <TeeMockup brand={brand} />
          </div>
        </div>
      </div>
    </Chapter>
  );
}

function RulesSection({ brand }: { brand: Brand }) {
  const rules: { ok: boolean; caption: string; art: ReactNode }[] = [
    {
      ok: true,
      caption: "One italic Marigold phrase per headline.",
      art: (
        <p className="text-2xl font-extrabold leading-none tracking-tight" style={{ fontFamily: display }}>
          <span className="block text-brand-ink">Big ideas</span>
          <span className="italic text-brand-accent">begin here.</span>
        </p>
      ),
    },
    {
      ok: false,
      caption: "Don't put the accent on every line. Then nothing stands out.",
      art: (
        <p className="text-2xl font-extrabold italic leading-none tracking-tight text-brand-accent" style={{ fontFamily: display }}>
          <span className="block">Big ideas</span>
          begin here.
        </p>
      ),
    },
    {
      ok: false,
      caption: "Don't stretch or recolour the logo.",
      art: <img src={brand.logos.stacked} alt="" className="h-16 w-16 object-contain" style={{ transform: "scaleX(1.6)", filter: "hue-rotate(150deg)" }} />,
    },
    {
      ok: false,
      caption: "Don't set Sunflower text on cream. It disappears.",
      art: (
        <p className="text-2xl font-extrabold leading-none tracking-tight text-brand-highlight" style={{ fontFamily: display }}>
          Admissions ongoing
        </p>
      ),
    },
  ];
  return (
    <Chapter n="08" label="Guardrails" title="Do's and don'ts" intro="A few rules that keep the system intact when the school's own team makes posts.">
      <ul className="grid gap-4 sm:grid-cols-2">
        {rules.map((r) => (
          <li key={r.caption} className="overflow-hidden rounded-3xl bg-white ring-1 ring-brand-ink/10">
            <div className="flex h-36 items-center justify-center bg-brand-bg px-6">{r.art}</div>
            <p className="flex items-start gap-3 p-4 text-sm text-brand-ink">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${r.ok ? "bg-brand-primary" : "bg-[#C0392B]"}`}>
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

  if (!brand) return <NotFound />;
  const { colors } = brand;
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
  const vars = {
    "--brand-bg": channels(colors.background),
    "--brand-ink": channels(colors.ink),
    "--brand-primary": channels(colors.primary),
    "--brand-accent": channels(colors.accent),
    "--brand-highlight": channels(colors.highlight),
    "--bg": colors.background,
    "--ink": colors.ink,
    "--primary": colors.primary,
    "--accent": colors.accent,
    "--highlight": colors.highlight,
  } as CSSProperties;

  return (
    <>
      <Seo
        title={`${brand.name} Brand Identity | Joseph Maina`}
        description={`${brand.name}: ${brand.tagline} Logo system, colour palette, typography, social templates and mockups by Joseph Maina.`}
        path={`/work/branding/${brand.slug}`}
      />
      <SiteHeader />
      <main className="min-h-screen" style={{ ...vars, background: colors.background, color: colors.ink, fontFamily: body }}>
        {/* The site header is transparent at the top; this strip keeps its links readable over the cream cover. */}
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
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-primary">Brand identity · {brand.year}</p>
                <h1 className="mt-4 text-5xl font-extrabold leading-[0.95] sm:text-7xl" style={{ fontFamily: display, letterSpacing: "-0.04em" }}>
                  {brand.name.split(" ")[0]}
                  <span className="block italic text-brand-accent">
                    {brand.name.split(" ").slice(1).join(" ")}.
                    <Swoosh color={colors.highlight} className="mt-1 h-4 w-2/3" />
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
                <div className="absolute inset-0 rounded-full bg-white shadow-[0_30px_80px_-30px_rgba(14,59,36,0.45)]" />
                <img src={brand.logos.stacked} alt={`${brand.name} logo`} className="relative h-full w-full object-contain p-[22%]" />
              </div>
            </div>
          </div>
          <Wave top={colors.highlight} bottom={colors.primary} className="block h-20 w-full sm:h-28" />
        </header>

        {/* Brief */}
        <section className="bg-brand-primary text-brand-bg">
          <div className="container mx-auto grid gap-10 px-4 pb-16 pt-6 sm:px-6 sm:pb-24 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-highlight">The brief</p>
              <p className="mt-4 text-2xl font-bold leading-snug sm:text-3xl" style={{ fontFamily: display }}>{brand.brief}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-highlight">What I did</p>
              <ol className="mt-4 space-y-4">
                {brand.approach.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-highlight text-sm font-extrabold text-brand-ink">{i + 1}</span>
                    <span className="leading-relaxed text-brand-bg/90">{step}</span>
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
          <ElementsSection brand={brand} />
          <AnatomySection brand={brand} />
          <TemplatesSection brand={brand} />
          <MockupsSection brand={brand} />
          <RulesSection brand={brand} />
        </div>

        <Wave top={colors.highlight} bottom={colors.primary} className="mt-8 block h-16 w-full sm:h-24" />
        <section className="bg-brand-primary">
          <div className="container mx-auto px-4 pb-20 pt-6 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-brand-bg sm:text-5xl" style={{ fontFamily: display, letterSpacing: "-0.03em" }}>
              Need a brand that <span className="italic text-brand-highlight">holds together?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-bg/80">Logo, colour, type and templates your team can keep using long after launch.</p>
            <a href="/#contact" className="mt-8 inline-flex min-h-11 items-center gap-4 rounded-full bg-brand-highlight py-2 pl-6 pr-2 text-lg font-extrabold text-brand-ink transition-transform hover:-translate-y-0.5" style={{ fontFamily: display }}>
              Start a project
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ink text-brand-highlight">
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
