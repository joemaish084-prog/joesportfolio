import type { PaidCaseStudy } from "@/data/metaTurnaroundCaseStudy";

// Anonymised figures for the Google Ads launch case study. The client is
// deliberately not named: campaign and ad group labels are generic descriptions.
// Google bills in US$; KES figures use the rate in the client report (129.89).
export const googleAdsLaunch: PaidCaseStudy = {
  slug: "google-ads-launch-case-study-kenya-2026",
  platform: "Google Ads",
  period: "1 Aug to 8 Oct 2026",
  attributionNote:
    "Orders and revenue as recorded in the Google Ads reports, converted from US$ at KES 129.89. Ads were paused in early October.",
  unit: "order",
  unitPlural: "orders",

  // The starting point is the account owner's own account of it, not from the ad reports.
  before: { value: "No Google Ads", label: "no search or shopping ads before August 2026" },
  after: {
    value: 1942243,
    format: "kesM",
    label: "tracked revenue in the first ten weeks",
  },

  stats: [
    { value: 125422, format: "kes", label: "Total Google Ads spend" },
    { value: 15.5, format: "x", label: "Return on ad spend", note: "15.9x on Search, 14.9x on Shopping" },
    { value: 339, format: "int", label: "Tracked orders", note: "KES 370 per order" },
  ],

  steps: [
    {
      title: "Launch Search first",
      body: "One search campaign went live in the first week of August on a small weekly budget.",
    },
    {
      title: "Give it time to learn",
      body: "Week one returned 1.4x. By week three the same campaign was returning 27.3x.",
    },
    {
      title: "Add Shopping",
      body: "Shopping ads started delivering in the last week of August and went on to bring in 139 orders.",
    },
    {
      title: "Test a new line, honestly",
      body: "A local search campaign for skin consultations ran from mid-September. It was the weakest in the account.",
    },
  ],

  months: [
    { label: "Aug", revenue: 386136, spend: 36602, roas: 10.5, purchases: 70 },
    { label: "Sep to 8 Oct", revenue: 1353691, spend: 82393, roas: 16.4, purchases: 233 },
  ],
  monthlyNote:
    "Revenue in KES, from the weekly log. A few weeks were never logged, so these two bars add up to slightly less than the account total.",

  campaignsTitle: "Campaigns and ad groups, ranked by return on ad spend",
  weakBelow: 10,
  campaigns: [
    {
      label: "General product search",
      detail: "3,603 clicks",
      spend: 57437,
      purchases: 176,
      revenue: 1032685,
      roas: 18.0,
      costPerPurchase: 326,
    },
    {
      label: "Shopping, all products",
      detail: "10,737 clicks",
      spend: 49528,
      purchases: 139,
      revenue: 737493,
      roas: 14.9,
      costPerPurchase: 356,
    },
    {
      label: "Sister-brand search",
      detail: "528 clicks",
      spend: 8200,
      purchases: 11,
      revenue: 90798,
      roas: 11.1,
      costPerPurchase: 745,
    },
    {
      label: "Local skin consultation search",
      detail: "242 clicks",
      spend: 10257,
      purchases: 13,
      revenue: 81265,
      roas: 7.9,
      costPerPurchase: 789,
    },
  ],

  best: {
    label: "Strongest ad group",
    name: "General product search",
    roas: 18.0,
    spend: 57437,
    revenue: 1032685,
    costPerPurchase: 326,
  },
  weakest: {
    label: "Weakest campaign",
    name: "Local skin consultation search",
    roas: 7.9,
    spend: 10257,
    revenue: 81265,
    costPerPurchase: 789,
  },
  comparisonNote:
    "General product search earned more than twice the return of the consultation campaign, at under half the cost per order.",
};
