// Anonymised figures for the Meta Ads turnaround case study. The client is
// deliberately not named: campaign labels here are generic descriptions, never
// the real campaign names.

export type MetaTurnaroundVisualKind = "stats" | "monthly" | "campaigns" | "comparison";

export interface TurnaroundStat {
  value: string;
  label: string;
  note?: string;
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

export const metaTurnaround = {
  slug: "meta-ads-turnaround-case-study-kenya-2026",
  period: "3 Jul to 8 Oct 2026",
  attributionNote:
    "Revenue as reported by Meta (7-day click, 1-day view). Platform-reported revenue usually runs higher than banked sales.",

  stats: [
    { value: "KES 129,150", label: "Total Meta ad spend" },
    { value: "KES 5.33M", label: "Revenue attributed by Meta" },
    { value: "41.3x", label: "Return on ad spend", note: "43.7x on sales campaigns" },
    { value: "953", label: "Tracked purchases", note: "KES 127 each on sales campaigns" },
  ] satisfies TurnaroundStat[],

  // From the monthly report, which starts in August. July sits in the campaign
  // log only, so it is not charted here.
  months: [
    { label: "Aug", revenue: 1375513, spend: 35208, roas: 39.1, purchases: 243 },
    { label: "Sep", revenue: 1518617, spend: 35982, roas: 42.2, purchases: 262 },
    { label: "Oct 1 to 8", revenue: 793400, spend: 15416, roas: 51.5, purchases: 130, partial: true },
  ] satisfies TurnaroundMonth[],

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
  ] satisfies TurnaroundCampaign[],

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
