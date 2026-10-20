import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, Calculator, Calendar, Check, ChevronRight, Link2, MessageCircle } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { calculatorHead } from "@/seo/heads";
import { blogPosts, type BlogPost } from "@/data/blogPosts";
import {
  CALCULATOR_FAQS,
  CALCULATOR_INTRO,
  CALCULATOR_METHOD,
  CALCULATOR_READING,
  CALCULATOR_TITLE,
} from "@/data/adCalculatorContent";
import {
  LIMITS,
  MANAGEMENT_FEE,
  META_DAILY_FLOOR,
  PLATFORM_LABEL,
  calculate,
  formatKes,
  inputsFromSearch,
  inputsToSearch,
  type CalcInputs,
  type Platform,
} from "@/lib/adCalculator";
import { CALENDLY_URL, WHATSAPP_NUMBER } from "@/lib/chatLead";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

const PLATFORMS: Platform[] = ["meta", "google", "both"];

const formatNumber = (n: number) => Math.round(n).toLocaleString("en-KE");
const formatOne = (n: number) => (n >= 10 ? formatNumber(n) : n.toFixed(1).replace(/\.0$/, ""));

/**
 * Numeric field that shows thousands separators. Typing updates the result as
 * soon as the value is in range; leaving the field snaps it back into range.
 */
function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  prefix,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
}) {
  const [draft, setDraft] = useState(formatNumber(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(formatNumber(value));
  }, [value]);

  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="mt-2 flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        {prefix && <span className="whitespace-nowrap pl-3 text-sm text-muted-foreground">{prefix}</span>}
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          className="h-11 w-full min-w-0 bg-transparent px-3 text-base font-semibold outline-none"
          value={draft}
          onFocus={() => (focused.current = true)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "");
            setDraft(digits ? formatNumber(Number(digits)) : "");
            const n = Number(digits);
            if (digits && n >= min && n <= max) onChange(n);
          }}
          onBlur={() => {
            focused.current = false;
            const n = Number(draft.replace(/[^\d]/g, ""));
            const clamped = Math.min(max, Math.max(min, n || min));
            onChange(clamped);
            setDraft(formatNumber(clamped));
          }}
        />
        {suffix && <span className="whitespace-nowrap pr-3 text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold xl:text-xl">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const VERDICT_STYLE = {
  profitable: {
    box: "border-emerald-500/40 bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    title: "This budget can pay for itself",
  },
  thin: {
    box: "border-amber-500/40 bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    title: "Close to break-even",
  },
  losing: {
    box: "border-red-500/40 bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    title: "At these numbers, the ads lose money",
  },
} as const;

const AgencyCalculator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputs, setInputs] = useState<CalcInputs>(() => inputsFromSearch(searchParams));
  const [copied, setCopied] = useState(false);
  const interacted = useRef(false);
  const result = useMemo(() => calculate(inputs), [inputs]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const update = (patch: Partial<CalcInputs>) => {
    const next = { ...inputs, ...patch };
    setInputs(next);
    // Keeps the scenario in the address bar so it can be shared or bookmarked.
    setSearchParams(inputsToSearch(next), { replace: true });
    if (!interacted.current) {
      interacted.current = true;
      track("calculator_used", { platform: next.platform });
    }
  };

  const shareUrl = () => `${window.location.origin}${window.location.pathname}?${inputsToSearch(inputs)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", shareUrl());
    }
    track("calculator_share");
  };

  const whatsappText = [
    "Hi Joseph! I used your ad budget calculator.",
    `Platform: ${PLATFORM_LABEL[inputs.platform]}`,
    `Monthly ad budget: ${formatKes(inputs.budget)}`,
    `Cost per lead: ${formatKes(inputs.costPerLead)}`,
    `1 in ${inputs.leadsPerSale} leads buys, average sale ${formatKes(inputs.saleValue)}`,
    `Estimated net: ${formatKes(result.net)}/month`,
    "Can we talk about a plan for these numbers?",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  const verdict = VERDICT_STYLE[result.verdict];
  const belowFloor = result.metaDailySpend !== null && result.metaDailySpend < META_DAILY_FLOOR;
  const reading = CALCULATOR_READING.map((slug) => blogPosts.find((p) => p.slug === slug)).filter(
    (p): p is BlogPost => Boolean(p),
  );
  const costBar = Math.min(100, (result.totalCost / Math.max(result.totalCost, result.grossProfit)) * 100);
  const profitBar = Math.min(100, (result.grossProfit / Math.max(result.totalCost, result.grossProfit)) * 100);

  return (
    <>
      <Seo {...calculatorHead()} />
      <SiteHeader />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link to="/agency" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Agency
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            <span>Ad Budget Calculator</span>
          </nav>

          <header className="mt-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <Calculator className="h-4 w-4" aria-hidden="true" /> Free tool
            </p>
            <h1 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {CALCULATOR_TITLE}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{CALCULATOR_INTRO}</p>
          </header>

          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
            {/* Inputs */}
            <section aria-labelledby="calc-inputs" className="surface-card rounded-2xl p-5 sm:p-7">
              <h2 id="calc-inputs" className="font-display text-xl font-semibold">
                Your numbers
              </h2>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium">Where will you advertise?</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={inputs.platform === p}
                      onClick={() => update({ platform: p })}
                      className={cn(
                        "rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors sm:text-sm",
                        inputs.platform === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {p === "meta" ? "Meta" : p === "google" ? "Google" : "Both"}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 space-y-6">
                <div>
                  <NumberField
                    id="calc-budget"
                    label="Monthly ad budget"
                    prefix="KES"
                    value={inputs.budget}
                    min={LIMITS.budget.min}
                    max={LIMITS.budget.max}
                    onChange={(budget) => update({ budget })}
                    hint={`About ${formatKes(inputs.budget / 30)} a day. Paid directly to the platform.`}
                  />
                  <Slider
                    className="mt-3"
                    aria-label="Monthly ad budget"
                    min={5_000}
                    max={500_000}
                    step={5_000}
                    value={[Math.min(inputs.budget, 500_000)]}
                    onValueChange={([budget]) => update({ budget })}
                  />
                </div>

                <NumberField
                  id="calc-cpl"
                  label="Cost per lead"
                  prefix="KES"
                  value={inputs.costPerLead}
                  min={LIMITS.costPerLead.min}
                  max={LIMITS.costPerLead.max}
                  onChange={(costPerLead) => update({ costPerLead })}
                  hint="A lead is an enquiry: a call, form or WhatsApp message. Don't know yours yet? Start with a test figure."
                />

                <NumberField
                  id="calc-n"
                  label="How many leads does it take to win one customer?"
                  prefix="1 in"
                  suffix="leads buys"
                  value={inputs.leadsPerSale}
                  min={LIMITS.leadsPerSale.min}
                  max={LIMITS.leadsPerSale.max}
                  onChange={(leadsPerSale) => update({ leadsPerSale })}
                />


                <NumberField
                  id="calc-sale"
                  label="Average sale value"
                  prefix="KES"
                  value={inputs.saleValue}
                  min={LIMITS.saleValue.min}
                  max={LIMITS.saleValue.max}
                  onChange={(saleValue) => update({ saleValue })}
                  hint="What one customer spends with you. Use the lifetime value if customers come back."
                />

                <div>
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor="calc-margin" className="text-sm font-medium">
                      Profit margin on a sale
                    </Label>
                    <span className="font-semibold">{inputs.marginPct}%</span>
                  </div>
                  <Slider
                    id="calc-margin"
                    className="mt-3"
                    aria-label="Profit margin on a sale"
                    min={LIMITS.marginPct.min}
                    max={LIMITS.marginPct.max}
                    step={1}
                    value={[inputs.marginPct]}
                    onValueChange={([marginPct]) => update({ marginPct })}
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    What you keep after the cost of the product or service. 50% is only a starting point, so set
                    your own.
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                  <div>
                    <Label htmlFor="calc-fee" className="text-sm font-medium">
                      Include management fee
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      My fee for {PLATFORM_LABEL[inputs.platform]} starts at{" "}
                      {formatKes(MANAGEMENT_FEE[inputs.platform])}/month.
                    </p>
                  </div>
                  <Switch
                    id="calc-fee"
                    checked={inputs.includeFee}
                    onCheckedChange={(includeFee) => update({ includeFee })}
                  />
                </div>
              </div>
            </section>

            {/* Results */}
            <section
              aria-labelledby="calc-results"
              aria-live="polite"
              className="surface-card rounded-2xl p-5 sm:p-7 lg:sticky lg:top-28"
            >
              <h2 id="calc-results" className="sr-only">
                Results
              </h2>

              <div className={cn("rounded-xl border p-5", verdict.box)}>
                <p className={cn("text-sm font-semibold", verdict.text)}>{verdict.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Estimated net profit per month
                </p>
                <p className={cn("mt-1 font-display text-4xl font-bold sm:text-5xl", verdict.text)}>
                  {formatKes(result.net)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  After {formatKes(inputs.budget)} ad spend
                  {result.fee > 0 ? ` and a ${formatKes(result.fee)} management fee` : ""}.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                <Stat label="Leads" value={formatOne(result.leads)} sub="per month" />
                <Stat label="Customers" value={formatOne(result.sales)} sub="per month" />
                <Stat label="Revenue" value={formatKes(result.revenue)} sub="per month" />
                <Stat label="Cost per customer" value={formatKes(result.costPerSale)} sub="in ad spend" />
                <Stat label="Return on ad spend" value={`${result.roas.toFixed(1)}x`} sub="revenue ÷ ad spend" />
                <Stat label="Profit from sales" value={formatKes(result.grossProfit)} sub={`at ${inputs.marginPct}% margin`} />
              </div>

              <div className="mt-6 space-y-3" aria-hidden="true">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>What you pay</span>
                    <span>{formatKes(result.totalCost)}</span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-foreground/60" style={{ width: `${costBar}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Profit it brings in</span>
                    <span>{formatKes(result.grossProfit)}</span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-orange-horizontal" style={{ width: `${profitBar}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">To break even, you need any one of these</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      A cost per lead of <strong className="text-foreground">{formatKes(result.breakEvenCpl)}</strong>{" "}
                      or less
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {result.breakEvenLeadsPerSale >= 1 ? (
                      <span>
                        At least <strong className="text-foreground">1 in {formatOne(result.breakEvenLeadsPerSale)}</strong>{" "}
                        leads buying
                      </span>
                    ) : (
                      <span>
                        A better close rate alone won't fix it: even if{" "}
                        <strong className="text-foreground">every lead bought</strong>, sales wouldn't cover the cost
                      </span>
                    )}
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      An average sale of <strong className="text-foreground">{formatKes(result.breakEvenSaleValue)}</strong>{" "}
                      or more
                    </span>
                  </li>
                </ul>
              </div>

              {belowFloor && (
                <div className="mt-4 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <p>
                    About {formatKes(result.metaDailySpend ?? 0)} a day reaches Meta
                    {inputs.platform === "both" ? " (assuming an even split)" : ""}. Below{" "}
                    {formatKes(META_DAILY_FLOOR)} a day per ad set, Meta learns too slowly to give reliable results.{" "}
                    <Link
                      to="/agency/blog/how-much-should-a-kenyan-sme-spend-on-meta-ads"
                      className="font-semibold text-primary hover:underline"
                    >
                      Why the floor matters
                    </Link>
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="ad_budget_calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Send me these numbers
                </a>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="ad_budget_calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" /> Book a free call
                </a>
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" /> Link copied
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" aria-hidden="true" /> Copy a link to these numbers
                  </>
                )}
              </button>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Estimates from the numbers you entered, not a promise of results. Real costs depend on your market,
                offer and creative.
              </p>
            </section>
          </div>

          {/* How it works */}
          <section className="mx-auto mt-24 max-w-3xl">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">How the calculator works</h2>
            {CALCULATOR_METHOD.map((p) => (
              <p key={p} className="mt-4 text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>

          <section className="mx-auto mt-16 max-w-3xl">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Questions</h2>
            <div className="mt-6 divide-y divide-border border-y border-border">
              {CALCULATOR_FAQS.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {reading.length > 0 && (
            <section className="mx-auto mt-16 max-w-3xl">
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Go deeper on the numbers</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {reading.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/agency/blog/${p.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-border p-5 transition-colors hover:border-primary/40"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.category}</span>
                      <span className="mt-2 font-semibold group-hover:text-primary">{p.title}</span>
                      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm text-muted-foreground">
                        Read <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AgencyCalculator;
