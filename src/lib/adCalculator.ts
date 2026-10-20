/**
 * Ad budget calculator maths. Works backwards from what a customer is worth,
 * the same method the blog teaches, instead of quoting "average" Kenyan CPCs.
 *
 * Every default and threshold below comes from published site content:
 * - Defaults: the worked example in "How Much Should a Kenyan SME Spend on Meta
 *   Ads?" (KES 250 lead, 1 in 5 converts, KES 8,000 sale).
 * - Fees: the "from" prices on the agency page and service pages.
 * - Daily floor: the KES 700 per day per ad set learning floor from the same post.
 */

export type Platform = "meta" | "google" | "both";

export const PLATFORM_LABEL: Record<Platform, string> = {
  meta: "Meta (Facebook & Instagram)",
  google: "Google Ads",
  both: "Meta + Google",
};

/** Lowest monthly management fee for each option, in KES. */
export const MANAGEMENT_FEE: Record<Platform, number> = {
  meta: 40_000,
  google: 45_000,
  both: 70_000,
};

/** Below this daily spend per ad set, Meta learns too slowly to be useful. */
export const META_DAILY_FLOOR = 700;

export interface CalcInputs {
  platform: Platform;
  /** Monthly ad spend in KES, paid to the platform. */
  budget: number;
  costPerLead: number;
  /** "1 in N" leads becomes a paying customer. */
  leadsPerSale: number;
  saleValue: number;
  /** Profit kept from a sale, 1–100. */
  marginPct: number;
  includeFee: boolean;
}

export const DEFAULT_INPUTS: CalcInputs = {
  platform: "meta",
  budget: 45_000,
  costPerLead: 250,
  leadsPerSale: 5,
  saleValue: 8_000,
  marginPct: 50,
  includeFee: true,
};

export const LIMITS = {
  budget: { min: 5_000, max: 2_000_000 },
  costPerLead: { min: 10, max: 100_000 },
  leadsPerSale: { min: 1, max: 200 },
  saleValue: { min: 100, max: 50_000_000 },
  marginPct: { min: 1, max: 100 },
} as const;

export type Verdict = "profitable" | "thin" | "losing";

export interface CalcResult {
  fee: number;
  totalCost: number;
  leads: number;
  sales: number;
  revenue: number;
  grossProfit: number;
  net: number;
  /** Revenue per shilling of ad spend. */
  roas: number;
  costPerSale: number;
  /** Highest cost per lead that still covers ad spend and (if included) the fee. */
  breakEvenCpl: number;
  /** Worst close rate ("1 in N") that still breaks even at the current CPL. */
  breakEvenLeadsPerSale: number;
  /** Smallest average sale that breaks even at the current CPL and close rate. */
  breakEvenSaleValue: number;
  verdict: Verdict;
  /** Daily spend that reaches Meta, or null when Meta is not in the mix. */
  metaDailySpend: number | null;
}

export function calculate(input: CalcInputs): CalcResult {
  const margin = input.marginPct / 100;
  const fee = input.includeFee ? MANAGEMENT_FEE[input.platform] : 0;
  const totalCost = input.budget + fee;

  const leads = input.budget / input.costPerLead;
  const sales = leads / input.leadsPerSale;
  const revenue = sales * input.saleValue;
  const grossProfit = revenue * margin;
  const net = grossProfit - totalCost;

  const profitPerLead = (input.saleValue * margin) / input.leadsPerSale;

  const verdict: Verdict = net >= totalCost * 0.15 ? "profitable" : net >= 0 ? "thin" : "losing";

  // "Both" assumes an even split, which is where most two-platform tests start.
  const metaShare = input.platform === "meta" ? 1 : input.platform === "both" ? 0.5 : 0;

  return {
    fee,
    totalCost,
    leads,
    sales,
    revenue,
    grossProfit,
    net,
    roas: revenue / input.budget,
    costPerSale: input.costPerLead * input.leadsPerSale,
    breakEvenCpl: (profitPerLead * input.budget) / totalCost,
    breakEvenLeadsPerSale: (leads * input.saleValue * margin) / totalCost,
    breakEvenSaleValue: totalCost / (sales * margin),
    verdict,
    metaDailySpend: metaShare > 0 ? (input.budget * metaShare) / 30 : null,
  };
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Reads a scenario from the URL so people can share their numbers. */
export function inputsFromSearch(params: URLSearchParams): CalcInputs {
  const num = (key: string, fallback: number, limit: { min: number; max: number }) => {
    const value = Number(params.get(key));
    return Number.isFinite(value) && params.has(key) ? clamp(value, limit.min, limit.max) : fallback;
  };
  const platform = params.get("p");
  return {
    platform: platform === "google" || platform === "both" ? platform : DEFAULT_INPUTS.platform,
    budget: num("b", DEFAULT_INPUTS.budget, LIMITS.budget),
    costPerLead: num("cpl", DEFAULT_INPUTS.costPerLead, LIMITS.costPerLead),
    leadsPerSale: num("n", DEFAULT_INPUTS.leadsPerSale, LIMITS.leadsPerSale),
    saleValue: num("v", DEFAULT_INPUTS.saleValue, LIMITS.saleValue),
    marginPct: num("m", DEFAULT_INPUTS.marginPct, LIMITS.marginPct),
    includeFee: params.get("fee") !== "0",
  };
}

export function inputsToSearch(input: CalcInputs): string {
  return new URLSearchParams({
    p: input.platform,
    b: String(input.budget),
    cpl: String(input.costPerLead),
    n: String(input.leadsPerSale),
    v: String(input.saleValue),
    m: String(input.marginPct),
    fee: input.includeFee ? "1" : "0",
  }).toString();
}

export const formatKes = (n: number) =>
  `${Math.round(n) < 0 ? "−" : ""}KES ${Math.abs(Math.round(n)).toLocaleString("en-KE")}`;
