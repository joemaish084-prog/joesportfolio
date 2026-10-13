// Anonymised figures for the Meta Ads turnaround case study. The client is
// deliberately not named: campaign labels here are generic descriptions, never
// the real campaign names.

export type MetaTurnaroundVisualKind = "hero" | "process" | "monthly" | "campaigns" | "comparison";

export type TurnaroundFormat = "kes" | "kesM" | "x" | "int";

export interface TurnaroundStat {
  value: number;
  format: TurnaroundFormat;
  label: string;
  note?: string;
}

export interface TurnaroundStep {
  title: string;
  body: string;
}

export interface TurnaroundMonth {
  label: string;
  revenue: number;
  spend: number;
  roas: number;
  purchases: number;
  partial?: boolean;
}

export interface TurnaroundCampaign {
  label: string;
  detail: string;
  spend: number;
  purchases: number;
  revenue: number;
  roas: number;
  costPerPurchase: number;
}

/** Shape shared by the paid-media case studies (Meta Ads, Google Ads). */
export interface PaidCaseStudy {
  /** Blog write-up, when there is one. */
  slug?: string;
  platform: string;
  period: string;
  attributionNote: string;
  /** What one conversion is called on this platform. */
  unit: string;
  unitPlural: string;
  before: { value: string; label: string };
  after: { value: number; format: TurnaroundFormat; label: string };
  stats: TurnaroundStat[];
  steps: TurnaroundStep[];
  months: TurnaroundMonth[];
  monthlyNote: string;
  campaignsTitle: string;
  /** Returns under this multiple are marked amber. */
  weakBelow: number;
  campaigns: TurnaroundCampaign[];
  best: TurnaroundHighlight;
  weakest: TurnaroundHighlight;
  comparisonNote: string;
}

export interface TurnaroundHighlight {
  label: string;
  name: string;
  roas: number;
  spend: number;
  revenue: number;
  costPerPurchase: number;
}

export const metaTurnaround: PaidCaseStudy = {
  slug: "meta-ads-turnaround-case-study-kenya-2026",
  platform: "Meta Ads",
  period: "3 Jul to 8 Oct 2026",
  unit: "purchase",
  unitPlural: "purchases",
  monthlyNote:
    "Revenue in KES, from the monthly report. October covers eight days only, so its bar is dashed. July is in the campaign log but not the monthly report.",
  campaignsTitle: "Sales campaigns by type, ranked by return on ad spend",
  weakBelow: 30,
  comparisonNote: "The strongest run earned 5x the return of the weakest campaign, on about 25% of the spend.",
  attributionNote:
    "Revenue as reported by Meta (7-day click, 1-day view). Platform-reported revenue usually runs higher than banked sales.",

  // The starting point is the account owner's own figure, not from the ad reports.
  before: { value: "Under KES 10,000", label: "attributable Meta revenue a month" },
  after: {
    value: 5328094,
    format: "kesM",
    label: "revenue attributed by Meta in about three months",
  },

  stats: [
    { value: 129150, format: "kes", label: "Total Meta ad spend" },
    { value: 41.3, format: "x", label: "Return on ad spend", note: "43.7x on sales campaigns" },
    { value: 953, format: "int", label: "Tracked purchases", note: "KES 127 each on sales campaigns" },
  ],

  steps: [
    {
      title: "Fix the measurement",
      body: "Install and verify the Meta Pixel so every purchase is recorded against the campaign that drove it.",
    },
    {
      title: "Restructure the account",
      body: "Replace boosted posts with sales campaigns that each have one clear objective.",
    },
    {
      title: "Build around offers",
      body: "Restocks, a product-day push, a clearance sale: one specific, trackable offer per campaign.",
    },
    {
      title: "Review weekly, cut fast",
      body: "Check the numbers every week and move budget away from whatever is not earning it.",
    },
  ],

  // From the monthly report, which starts in August. July sits in the campaign
  // log only, so it is not charted here.
  months: [
    { label: "Aug", revenue: 1375513, spend: 35208, roas: 39.1, purchases: 243 },
    { label: "Sep", revenue: 1518617, spend: 35982, roas: 42.2, purchases: 262 },
    { label: "Oct 1 to 8", revenue: 793400, spend: 15416, roas: 51.5, purchases: 130, partial: true },
  ],

  // Sales campaigns grouped by type. Together: KES 120,810 spend, 949 purchases.
  campaigns: [
    {
      label: "Always-on sales campaign",
      detail: "18 days",
      spend: 21280,
      purchases: 243,
      revenue: 1493843,
      roas: 70.2,
      costPerPurchase: 88,
    },
    {
      label: "Restock announcements",
      detail: "3 one-week runs",
      spend: 11941,
      purchases: 122,
      revenue: 756516,
      roas: 63.4,
      costPerPurchase: 98,
    },
    {
      label: "Product-day promotion",
      detail: "3 runs",
      spend: 11093,
      purchases: 136,
      revenue: 663546,
      roas: 59.8,
      costPerPurchase: 82,
    },
    {
      label: "End-month sale",
      detail: "2 one-week runs",
      spend: 4887,
      purchases: 46,
      revenue: 248074,
      roas: 50.8,
      costPerPurchase: 106,
    },
    {
      label: "Partner brand sales push",
      detail: "17 days",
      spend: 2420,
      purchases: 11,
      revenue: 104098,
      roas: 43.0,
      costPerPurchase: 220,
    },
    {
      label: "Mid-year clearance sale",
      detail: "30 days",
      spend: 39079,
      purchases: 256,
      revenue: 1331405,
      roas: 34.1,
      costPerPurchase: 153,
    },
    {
      label: "Seasonal promotion",
      detail: "2 one-week runs",
      spend: 12033,
      purchases: 73,
      revenue: 406841,
      roas: 33.8,
      costPerPurchase: 165,
    },
    {
      label: "Video sales campaign",
      detail: "69 days",
      spend: 18077,
      purchases: 62,
      revenue: 277670,
      roas: 15.4,
      costPerPurchase: 292,
    },
  ],

  best: {
    label: "Strongest single run",
    name: "Product-day promotion",
    roas: 76.8,
    spend: 4607,
    revenue: 354050,
    costPerPurchase: 69,
  },
  weakest: {
    label: "Weakest sales campaign",
    name: "Video sales campaign",
    roas: 15.4,
    spend: 18077,
    revenue: 277670,
    costPerPurchase: 292,
  },
};

export const formatKes = (n: number) => `KES ${n.toLocaleString("en-US")}`;
