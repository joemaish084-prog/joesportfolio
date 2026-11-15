import type { TrustNumber } from "@/data/services";

/** Static figures for the hero. No count-up above the fold: the real value is the first paint. */
export function TrustNumbers({ items }: { items: TrustNumber[] }) {
  return (
    <dl className="grid grid-cols-[auto_auto_auto] justify-between gap-x-4 sm:justify-start sm:gap-x-12">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse justify-end">
          <dt className="mt-1 max-w-[6rem] text-xs leading-snug text-muted-foreground sm:max-w-none sm:text-sm">{item.label}</dt>
          <dd className="whitespace-nowrap font-display text-xl font-bold tracking-tight tabular-nums sm:text-3xl">
            {item.prefix && <span className="mr-1 text-xs font-semibold text-muted-foreground sm:text-base">{item.prefix.trim()}</span>}
            {item.value}
            {item.suffix}
          </dd>
        </div>
      ))}
    </dl>
  );
}
