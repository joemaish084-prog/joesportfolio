import { cn } from "@/lib/utils";

/** Frame the original brand mark without the specimen sheet's caption. */
export function HubLogo({ className, alt = "" }: { className?: string; alt?: string }) {
  return (
    <span className={cn("relative inline-block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#090909]", className)}>
      <img
        src="/logo/primary_original.png"
        alt={alt}
        width={418}
        height={418}
        decoding="async"
        className="pointer-events-none absolute -left-[28.6%] -top-[25.6%] h-[157.2%] w-[157.2%] max-w-none select-none"
      />
    </span>
  );
}
