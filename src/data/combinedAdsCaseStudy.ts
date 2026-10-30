import type { PaidCaseStudy } from "@/data/metaTurnaroundCaseStudy";

// Anonymised figures for the combined Meta + Google Ads case study, taken from
// the client's monthly report. The client is deliberately not named.
export const combinedAds: PaidCaseStudy = {
  slug: "meta-and-google-ads-together-case-study-kenya-2026",
  platform: "Meta Ads + Google Ads",
  period: "1 Aug to 8 Oct 2026",
  attributionNote:
    "Meta revenue as reported by Meta (7-day click, 1-day view); Google revenue from the weekly log at KES 129.89 per US$. Each platform claims the orders it touched, so an order can be counted by both and the combined total may overstate actual sales.",
  unit: "order",
  unitPlural: "orders",

  // The starting point is the account owner's own account of it, not from the ad reports.
  before: { value: "Meta only", label: "no Google Ads before August 2026" },
  after: {
    value: 5427357,
    format: "kesM",
    label: "tracked revenue across both platforms, August to 8 October",
  },

  stats: [
    { value: 205601, format: "kes", label: "Total ad spend, both platforms" },
    { value: 26.4, format: "x", label: "Blended return on ad spend", note: "42.6x on Meta, 14.6x on Google" },
    { value: 938, format: "int", label: "Tracked orders", note: "KES 219 per order" },
  ],

  steps: [
    {
      title: "Meta creates the demand",
      body: "Meta took 42% of the spend and was credited with 68% of the revenue.",
    },
    {
      title: "Google catches the intent",
      body: "Search and Shopping added 303 orders from people already looking for the products.",
    },
    {
      title: "Scale what is improving",
      body: "Google spend rose 125% in September as its return went from 10.5x to 16.4x.",
    },
    {
      title: "One report, one currency",
      body: "Both platforms are reported together each month in KES, so the two can be compared directly.",
    },
  ],

  months: [
    { label: "Aug", revenue: 1761649, spend: 71810, roas: 24.5, purchases: 312 },
    { label: "Sep", revenue: 2872308, spend: 118376, roas: 24.3, purchases: 495 },
    { label: "Oct 1 to 8", revenue: 793400, spend: 15416, roas: 51.5, purchases: 130, partial: true },
  ],
  monthlyNote:
    "Revenue in KES, both platforms combined. October covers eight days and Meta only, because Google Ads were paused, so its bar is dashed.",

  campaignsTitle: "Each platform by month, ranked by return on ad spend",
  campaignsNote: "Meta figures are from Meta, Google figures from the weekly log.",
  weakBelow: 12,
  campaigns: [
    {
      label: "Meta Ads, 1 to 8 October",
      detail: "8 days",
      spend: 15416,
      purchases: 130,
      revenue: 793400,
      roas: 51.5,
      costPerPurchase: 118,
    },
    {
      label: "Meta Ads, September",
      detail: "30 days",
      spend: 35982,
      purchases: 262,
      revenue: 1518617,
      roas: 42.2,
      costPerPurchase: 137,
    },
    {
      label: "Meta Ads, August",
      detail: "31 days",
      spend: 35208,
      purchases: 243,
      revenue: 1375513,
      roas: 39.1,
      costPerPurchase: 145,
    },
    {
      label: "Google Ads, September",
      detail: "to 8 Oct in the log",
      spend: 82393,
      purchases: 233,
      revenue: 1353691,
      roas: 16.4,
      costPerPurchase: 353,
    },
    {
      label: "Google Ads, August",
      detail: "first month",
      spend: 36602,
      purchases: 70,
      revenue: 386136,
      roas: 10.5,
      costPerPurchase: 526,
    },
  ],

  best: {
    label: "Higher return",
    name: "Meta Ads",
    roas: 42.6,
    spend: 86607,
    revenue: 3687530,
    costPerPurchase: 136,
  },
  weakest: {
    label: "Lower return",
    name: "Google Ads",
    roas: 14.6,
    spend: 118995,
    revenue: 1739827,
    costPerPurchase: 393,
  },
  comparisonNote:
    "Meta returned almost three times as much per shilling. Google cost more per order but reached buyers who were already searching, in its first two months.",
};
