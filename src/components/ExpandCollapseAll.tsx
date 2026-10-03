import { useState } from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";

export function ExpandCollapseAll() {
  // Sections start collapsed on phones, so the first tap there should expand
  const [allOpen, setAllOpen] = useState(() => !window.matchMedia("(max-width: 767px)").matches);

  const toggle = () => {
    const next = !allOpen;
    setAllOpen(next);
    window.dispatchEvent(
      new CustomEvent("collapsibles:set-all", { detail: { open: next } })
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 min-h-11 text-sm font-medium px-4 py-2 rounded-lg bg-card/60 hover:bg-card border border-primary/30 hover:border-primary text-foreground hover:text-primary transition-all"
        aria-label={allOpen ? "Collapse all sections" : "Expand all sections"}
      >
        {allOpen ? <ChevronsUp className="h-4 w-4" /> : <ChevronsDown className="h-4 w-4" />}
        {allOpen ? "Collapse All" : "Expand All"}
      </button>
    </div>
  );
}
