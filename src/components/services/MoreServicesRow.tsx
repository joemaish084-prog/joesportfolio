import { Link } from "react-router-dom";

interface MoreServicesRowProps {
  items: { anchorId: string; label: string; to: string }[];
}

/** Services with no tile of their own. Pricing links to these anchors, so each keeps its id. */
export function MoreServicesRow({ items }: MoreServicesRowProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
      <span>Also available:</span>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.anchorId} id={item.anchorId} className="scroll-mt-24">
            <Link
              to={item.to}
              className="inline-flex min-h-11 items-center rounded-full border border-border/70 px-4 text-foreground/90 transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
