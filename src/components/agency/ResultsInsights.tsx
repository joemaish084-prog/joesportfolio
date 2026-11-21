import ResultsCharts from "./ResultsCharts";

export function ResultsInsights() {
  return (
    <section id="campaign-metrics" className="container mx-auto scroll-mt-20 px-4 pt-14 sm:pt-20" aria-labelledby="campaign-metrics-title">
      <div className="mx-auto max-w-6xl">
        <h2 id="campaign-metrics-title" className="font-display text-2xl font-semibold sm:text-3xl">Campaign metrics</h2>
        <ResultsCharts />
      </div>
    </section>
  );
}
