import { ImageIcon } from "lucide-react";
import type { ImageSlot, ProofImageSlot } from "@/data/services";

type Slot = ImageSlot | ProofImageSlot;

/** What each slot will show once the real image arrives in Step 5. */
const SLOT_LABEL: Record<Slot, string> = {
  "proof-case-1": "Results screenshot",
  "proof-case-2": "Results screenshot",
  "proof-case-3": "Results screenshot",
  "svc-meta-ads": "Meta ad creative",
  "svc-google-ads": "Google Ads dashboard",
  "svc-seo": "Search Console graph",
  "svc-social": "Social post",
  "svc-tiktok-ads": "Short-form video still",
  "svc-lead-gen": "Leads arriving",
  "svc-shopify": "Storefront screenshot",
};

interface ServiceImagePlaceholderProps {
  slot: Slot;
  /** Sets the size and ratio of the box. */
  className?: string;
  /** The box is a small thumbnail below `md`, so the label is hidden there. */
  thumbOnMobile?: boolean;
}

/** Stand-in for `ServiceImage` (Step 5). Decorative, so it is hidden from screen readers. */
export function ServiceImagePlaceholder({ slot, className = "", thumbOnMobile = false }: ServiceImagePlaceholderProps) {
  return (
    <div
      aria-hidden
      data-image-slot={slot}
      className={`relative overflow-hidden bg-gradient-to-br from-primary/25 via-primary/[0.07] to-muted ${className}`}
    >
      <div className="absolute inset-0 dot-grid" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
        <ImageIcon className="h-5 w-5 text-foreground/40" />
        <span className={`mono-accent text-[11px] uppercase tracking-[0.14em] text-foreground/60 ${thumbOnMobile ? "hidden md:block" : ""}`}>
          {SLOT_LABEL[slot]}
        </span>
      </div>
    </div>
  );
}
