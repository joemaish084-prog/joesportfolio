import { ImageIcon } from "lucide-react";
import type { ProofImageSlot } from "@/data/services";

interface ServiceImagePlaceholderProps {
  slot: ProofImageSlot;
  /** Sets the size and ratio of the box. */
  className?: string;
}

/** Decorative fallback when a case study image cannot load. */
export function ServiceImagePlaceholder({ slot, className = "" }: ServiceImagePlaceholderProps) {
  return (
    <div
      aria-hidden
      data-image-slot={slot}
      className={`relative overflow-hidden bg-gradient-to-br from-primary/25 via-primary/[0.07] to-muted ${className}`}
    >
      <div className="absolute inset-0 dot-grid" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
        <ImageIcon className="h-5 w-5 text-foreground/40" />
      </div>
    </div>
  );
}
