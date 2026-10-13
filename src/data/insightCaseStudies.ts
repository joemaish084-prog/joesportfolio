/** Case studies about reach and attention, where there is no revenue or ROAS to chart. */
export interface InsightCaseStudy {
  chip: string;
  /** Optional comparison point shown before the headline number. */
  before?: { value: string; label: string };
  /** Small label above the headline when there is a "before", e.g. "That week". */
  headlineTag?: string;
  headline: { value: string; label: string };
  stats: { value: string; label: string; note?: string }[];
  barsTitle: string;
  bars: { label: string; detail?: string; value: number; display: string; sub?: string; highlight?: boolean }[];
  barsNote: string;
  points: { title: string; body: string }[];
  note: string;
}

// Anonymised: the client is a Nairobi skincare clinic and is deliberately not named.
// Figures are the clinic's weekly Instagram numbers from the KPI tracker.
export const instagramSpike: InsightCaseStudy = {
  chip: "Instagram · week of 14 Sep 2026",
  before: { value: "52,700 views", label: "a typical week, the average of the seven before" },
  headlineTag: "That week",
  headline: { value: "577,300", label: "Instagram views in a single week" },
  stats: [
    { value: "239,000", label: "People reached", note: "16x a typical week" },
    { value: "1,100", label: "Link clicks", note: "6x a typical week" },
    { value: "345", label: "New followers", note: "about 3x a typical week" },
  ],
  barsTitle: "Instagram views by week",
  bars: [
    { label: "27 Jul", value: 50000, display: "50,000", sub: "9,900 reached · 189 follows" },
    { label: "3 Aug", value: 62000, display: "62,000", sub: "15,100 reached · 200 follows" },
    { label: "10 Aug", value: 65000, display: "65,000", sub: "22,800 reached · 136 follows" },
    { label: "17 Aug", value: 50600, display: "50,600", sub: "17,000 reached · 62 follows" },
    { label: "24 Aug", value: 47594, display: "47,594", sub: "11,100 reached · 93 follows" },
    { label: "31 Aug", value: 58000, display: "58,000", sub: "17,100 reached · 85 follows" },
    { label: "7 Sep", value: 35400, display: "35,400", sub: "11,700 reached · 78 follows" },
    { label: "14 Sep", value: 577300, display: "577,300", sub: "239,000 reached · 345 follows", highlight: true },
    { label: "21 Sep", value: 102037, display: "102,037", sub: "8,400 reached · 257 follows" },
    { label: "28 Sep", value: 47886, display: "47,886", sub: "11,400 reached · 94 follows" },
    { label: "5 Oct", value: 70684, display: "70,684", sub: "20,700 reached · 80 follows" },
  ],
  barsNote: "Each row is one week, labelled by its starting date.",
  points: [
    {
      title: "The spike",
      body: "577,300 views and 239,000 people reached in one week, against a usual 35,000 to 65,000 views.",
    },
    {
      title: "What carried over",
      body: "The week after, views settled at 102,037, still about double the usual, with 2,300 interactions and 257 new followers.",
    },
    {
      title: "What faded",
      body: "Two weeks later views were back to 47,886. A spike in reach does not hold on its own.",
    },
    {
      title: "What the data does not show",
      body: "The tracker does not record what caused the spike. A paid reach campaign was live on the same account that month, so some of these views are likely paid.",
    },
  ],
  note: "Weekly figures from the Instagram insights tracker. \"A typical week\" is the average of the seven weeks before the spike.",
};

// Anonymised: the client is a Nairobi beauty retailer and is deliberately not
// named. Campaign names are replaced with generic descriptions.
export const awarenessCampaigns: InsightCaseStudy = {
  chip: "Meta Ads · reach campaigns · 31 Aug to 7 Oct 2026",
  headline: { value: "513,902", label: "people reached across four awareness campaigns" },
  stats: [
    { value: "KES 8,255", label: "Total spend" },
    { value: "603,705", label: "Impressions" },
    { value: "KES 13.67", label: "Cost per 1,000 impressions" },
  ],
  barsTitle: "People reached by campaign",
  bars: [
    {
      label: "Creator collaboration",
      detail: "7 days",
      value: 166116,
      display: "166,116",
      sub: "KES 2,575 spent · KES 12.52 per 1,000 impressions",
      highlight: true,
    },
    {
      label: "Partner brand launch",
      detail: "17 days",
      value: 138479,
      display: "138,479",
      sub: "KES 2,767 spent · KES 15.56 per 1,000 impressions",
    },
    {
      label: "Product-line launch",
      detail: "14 days",
      value: 124255,
      display: "124,255",
      sub: "KES 1,416 spent · KES 11.06 per 1,000 impressions",
    },
    {
      label: "In-store awareness",
      detail: "17 days",
      value: 85052,
      display: "85,052",
      sub: "KES 1,497 spent · KES 16.24 per 1,000 impressions",
    },
  ],
  barsNote: "Campaign names are replaced with generic descriptions.",
  points: [
    {
      title: "A different yardstick",
      body: "These ran beside the sales campaigns and were judged on reach and cost, not on return on ad spend.",
    },
    {
      title: "Small budgets",
      body: "Each campaign spent between KES 1,416 and KES 2,767.",
    },
    {
      title: "The collaboration reached furthest",
      body: "The creator collaboration reached 166,116 people in seven days, the most of the four and in the shortest run.",
    },
    {
      title: "What it did not do",
      body: "Only 4 purchases, worth KES 46,100, were tracked directly to these campaigns, and click-through stayed near 0.2%.",
    },
  ],
  note: "Reach is added up across the four campaigns, so a person who saw more than one is counted more than once.",
};
