import { BarChart } from "@tremor/react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { combinedAds } from "@/data/combinedAdsCaseStudy";
import { propertyLeadFunnel } from "@/data/insightCaseStudies";

const money = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });
const monthly = combinedAds.months.map(month => ({ period: month.label, Revenue: month.revenue, ROAS: month.roas }));
const leads = propertyLeadFunnel.bars.map(stage => ({ stage: stage.label, Enquiries: stage.value }));
const column = createColumnHelper<(typeof combinedAds.campaigns)[number]>();
const columns = [
  column.accessor("label", { header: "Campaign and period" }),
  column.accessor("spend", { header: "Ad spend", cell: row => money.format(row.getValue()) }),
  column.accessor("revenue", { header: "Attributed revenue", cell: row => money.format(row.getValue()) }),
  column.accessor("purchases", { header: "Tracked orders" }),
  column.accessor("roas", { header: "ROAS", cell: row => `${row.getValue()}x` }),
];

export default function ResultsCharts() {
  const table = useReactTable({ data: combinedAds.campaigns, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="mt-5 space-y-6">
      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold">Attributed revenue</h3>
          <p className="text-sm text-muted-foreground">{money.format(combinedAds.after.value)} · Meta Ads + Google Ads</p>
          <BarChart className="mt-4 h-56 [&_.recharts-bar-rectangle_path]:fill-primary" data={monthly} index="period"
            categories={["Revenue"]} colors={["orange"]} showLegend={false} yAxisWidth={47}
            valueFormatter={value => compact.format(value)} aria-label="Monthly attributed revenue in Kenyan shillings" />
        </Card>
        <Card className="min-w-0 p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold">Return on ad spend</h3>
          <p className="text-sm text-muted-foreground">{combinedAds.stats[1].value}x blended ROAS · Meta Ads + Google Ads</p>
          <BarChart className="mt-4 h-56 [&_.recharts-bar-rectangle_path]:fill-primary" data={monthly} index="period"
            categories={["ROAS"]} colors={["orange"]} showLegend={false} yAxisWidth={40}
            valueFormatter={value => `${value}x`} aria-label="Monthly return on ad spend" />
        </Card>
        <Card className="min-w-0 p-4 sm:p-5">
          <h3 className="font-display text-lg font-semibold">Property enquiries</h3>
          <p className="text-sm text-muted-foreground">{propertyLeadFunnel.before.value} · Kenyan residential development</p>
          <BarChart className="mt-4 h-56 [&_.recharts-bar-rectangle_path]:fill-primary" data={leads} index="stage"
            categories={["Enquiries"]} colors={["orange"]} layout="vertical" yAxisWidth={116}
            showLegend={false} aria-label="Property enquiries by funnel stage" />
        </Card>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        October covers 1–8 October and Meta only. Platform attribution can count the same order twice.
      </p>
      <div className="max-w-full overflow-x-auto rounded-xl border border-border" role="region" tabIndex={0}
        aria-label="Reported campaign data">
        <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
          <caption className="px-4 py-3 text-left font-semibold">Reported ad results by platform and period</caption>
          <thead className="border-y border-border bg-muted/40">
            {table.getHeaderGroups().map(group => <tr key={group.id}>
              {group.headers.map(header => (
                <th key={header.id} scope="col" className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>)}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                {row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3 tabular-nums">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
