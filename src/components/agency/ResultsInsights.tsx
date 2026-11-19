import { lazy, Suspense, useEffect, useRef, useState } from "react";

const ResultsCharts = lazy(() => import("./ResultsCharts"));

export function ResultsInsights() {
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!root.current) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNear(true);
      observer.disconnect();
    }, { rootMargin: "300px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={root} className="mx-auto mt-16 max-w-6xl border-y border-border py-8 sm:py-12" aria-labelledby="campaign-metrics-title">
      <h2 id="campaign-metrics-title" className="font-display text-2xl font-semibold sm:text-3xl">Campaign metrics</h2>
      {near ? <Suspense fallback={<p className="mt-4 text-muted-foreground" role="status">Loading campaign metrics…</p>}><ResultsCharts /></Suspense> : null}
    </section>
  );
}
