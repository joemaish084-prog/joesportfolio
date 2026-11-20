import { useEffect, useRef, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { CustomerJourneyIntro } from "./CustomerJourneyIntro";
import "./customer-journey.css";

export function AgencyJourney() {
  const placeholder = useRef<HTMLElement>(null);
  const [Roadmap, setRoadmap] = useState<ComponentType>();

  useEffect(() => {
    const section = placeholder.current;
    if (!section) return;
    let active = true;
    const load = () => {
      void import("./CustomerJourney").then(({ CustomerJourney }) => {
        if (active) setRoadmap(() => CustomerJourney);
      }).catch(() => { /* The static timeline and overview link remain available. */ });
    };
    if (window.location.hash === "#customer-journey" || !("IntersectionObserver" in window)) {
      load();
      return () => { active = false; };
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      load();
    }, { rootMargin: "700px" });
    observer.observe(section);
    return () => { active = false; observer.disconnect(); };
  }, []);

  if (Roadmap) return <Roadmap />;
  return (
    <section ref={placeholder} id="customer-journey" aria-labelledby="customer-journey-heading"
      className="customer-journey container mx-auto min-h-[46rem] scroll-mt-24 px-4 py-16 sm:min-h-[57rem] sm:py-20">
      <div className="mx-auto max-w-6xl">
        <CustomerJourneyIntro />
        <ol className="surface-card grid gap-4 p-6 font-display text-lg sm:grid-cols-5">
          {["Discover", "Explore", "Compare", "Enquire", "Purchase"].map((stage, index) => (
            <li key={stage}><span className="mr-2 font-mono text-sm text-primary">{String(index + 1).padStart(2, "0")}</span>{stage}</li>
          ))}
        </ol>
        <Link to="/agency/overview#customer-journey" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
          Explore the roadmap on the Agency overview
        </Link>
      </div>
    </section>
  );
}
