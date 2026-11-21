import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { combinedAds } from "@/data/combinedAdsCaseStudy";
import { propertyLeadFunnel } from "@/data/insightCaseStudies";
import { formatKes } from "@/data/services";
import { ComparisonBars } from "./ComparisonBars";

const money = (amount: number) => `KES ${formatKes(amount)}`;
const revenue = combinedAds.months.map(({ label, revenue, partial }) => ({
  label, value: revenue, display: money(revenue), partial,
}));
const returns = combinedAds.months.map(({ label, roas, partial }) => ({
  label, value: roas, display: `${roas}×`, partial,
}));

export default function ResultsCharts() {
  return (
    <div className="mt-5 space-y-4">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="min-w-0 p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold">Attributed revenue by period</h3>
          <p className="mb-5 text-sm text-muted-foreground">Meta Ads and Google Ads · 2026</p>
          <ComparisonBars rows={revenue} />
        </Card>
        <Card className="min-w-0 p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold">Return on ad spend</h3>
          <p className="mb-5 text-sm text-muted-foreground">Revenue attributed per KES 1 spent</p>
          <ComparisonBars rows={returns} />
          <p className="mt-4 text-sm text-muted-foreground">{combinedAds.stats[1].value}× across the full reporting period.</p>
        </Card>
        <Card className="min-w-0 p-4 sm:col-span-2 sm:p-5 lg:col-span-1">
          <h3 className="font-display text-lg font-semibold">Where the property enquiries went</h3>
          <p className="mb-5 text-sm text-muted-foreground">Kenyan residential development · October 2026</p>
          <ComparisonBars rows={propertyLeadFunnel.bars} />
          <Link to="/agency/blog/property-leads-lost-in-the-inbox-case-study-2026" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Read the property case study</Link>
        </Card>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The striped bars cover 1–8 October and reflect Meta only. Platform attribution can count the same order twice.{" "}
        <Link to={`/agency/blog/${combinedAds.slug}`} className="font-semibold text-primary hover:underline">Read the Meta and Google Ads case study</Link>
      </p>
      <div className="max-w-full overflow-x-auto rounded-xl border border-border" role="region" tabIndex={0}
        aria-label="Reported campaign data">
        <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
          <caption className="px-4 py-3 text-left font-semibold">Reported ad results by platform and period</caption>
          <thead className="border-y border-border bg-muted/40">
            <tr>
              {["Campaign and period", "Ad spend", "Attributed revenue", "Tracked orders", "ROAS"].map(label => (
                <th key={label} scope="col" className="px-4 py-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {combinedAds.campaigns.map(row => (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <th scope="row" className="px-4 py-3 font-medium">{row.label}</th>
                <td className="px-4 py-3 tabular-nums">{money(row.spend)}</td>
                <td className="px-4 py-3 tabular-nums">{money(row.revenue)}</td>
                <td className="px-4 py-3 tabular-nums">{formatKes(row.purchases)}</td>
                <td className="px-4 py-3 tabular-nums">{row.roas}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
