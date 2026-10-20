/**
 * Copy for the ad budget calculator page, shared by the page, its FAQ schema
 * and the prerendered HTML. Every answer restates something already published
 * on the site (blog posts, agency pricing) rather than new claims.
 */

export const CALCULATOR_PATH = "/agency/ad-budget-calculator";

export const CALCULATOR_TITLE = "Ad Budget Calculator for Kenyan Businesses";

export const CALCULATOR_INTRO =
  "Work out whether a Meta or Google Ads budget can pay for itself. Enter what a customer is worth and how many leads it takes to win one, and see what you can afford to pay per lead, before you spend a shilling.";

export const CALCULATOR_METHOD = [
  "There is no single “average” cost per click or cost per lead for Kenya. It depends on your industry, your keywords and who else is bidding. So this calculator works backwards from the numbers you do know.",
  "Leads per month is your ad budget divided by your cost per lead. Customers is leads divided by how many leads it takes to make one sale. Revenue is customers multiplied by your average sale, and profit is revenue multiplied by your margin.",
  "Net profit is that profit minus everything you pay: the ad budget, which goes straight to Meta or Google, plus a management fee if you include one. The break-even figures show how far each number can move before the campaign stops paying for itself.",
];

export const CALCULATOR_FAQS: { q: string; a: string }[] = [
  {
    q: "How much should a Kenyan business spend on Meta Ads?",
    a: "For most Kenyan SMEs a workable starting point is KES 700 to KES 1,500 per day per ad set, run for at least fourteen days before judging results. Below that, the algorithm gathers data too slowly and you pay for a permanent testing phase.",
  },
  {
    q: "What is a good cost per lead in Kenya?",
    a: "It varies enormously by industry, so judge it against what a converted customer is worth rather than against a number that sounds good. If your cost per lead is KES 400 and one in eight leads becomes a KES 10,000 sale, the campaign is working even though KES 400 sounds high on its own.",
  },
  {
    q: "I don't know my cost per lead yet. What should I enter?",
    a: "Use a test figure, then replace it with your own. A short, deliberately small test campaign, even a few thousand shillings over a week, tells you more about your real costs than any benchmark, because it reflects your actual market.",
  },
  {
    q: "Does the calculator include your management fee?",
    a: "Only if you switch it on. Management starts at KES 40,000 a month for Meta Ads, KES 45,000 for Google Ads and KES 70,000 for multi-platform retainers. Ad spend is separate and goes directly to Meta or Google.",
  },
];

/** Posts that go deeper on the numbers behind the calculator. */
export const CALCULATOR_READING = [
  "how-much-should-a-kenyan-sme-spend-on-meta-ads",
  "lead-generation-campaigns-kenya-2026",
  "average-cost-per-click-google-ads-kenya-2026",
  "google-ads-cost-kenya-2026",
];

/** Blog topic hubs whose posts link to the calculator. */
export const CALCULATOR_HUBS = ["meta-ads", "paid-search", "lead-generation", "pricing-and-buying"];
