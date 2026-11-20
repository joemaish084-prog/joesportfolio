import { MousePointer2 } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";

export function CustomerJourneyIntro() {
  return (
    <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <SectionLabel>THE CUSTOMER JOURNEY</SectionLabel>
        <h2 id="customer-journey-heading" className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Strangers. Visitors.<br /><span className="font-serif font-normal italic text-primary">Your next customers.</span>
        </h2>
        <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">Good marketing connects the dots. Follow the moments that turn a first impression into a purchase.</p>
      </div>
      <p className="journey-instruction"><MousePointer2 className="h-4 w-4" aria-hidden />Don't just follow the story. Try it.</p>
    </div>
  );
}
