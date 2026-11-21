import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Design } from "@/data/designs";
import "./design-views.css";

interface DriftWallProps {
  items: Design[];
  /** Called with the index into `items` of the tile the visitor picked. */
  onSelect: (index: number) => void;
}

const MIN_ROWS = 7;
// Each column drifts at its own pace so the wall never looks like one moving sheet.
const DURATIONS = [46, 36, 52, 40, 48, 38];

/** An endless, tilted wall of designs drifting past. Hover pauses it and lifts a tile. */
export function DriftWall({ items, onSelect }: DriftWallProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(5);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setColumns(w < 520 ? 3 : w < 900 ? 4 : 5);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Deal designs into columns. The shift by floor(k / n) stops small sets from
  // stacking the same design down one column.
  const grid = useMemo(() => {
    const n = items.length;
    const rows = Math.max(MIN_ROWS, Math.ceil(n / columns));
    return Array.from({ length: columns }, (_, c) =>
      Array.from({ length: rows }, (_, r) => {
        const k = r * columns + c;
        return { index: (k + Math.floor(k / n)) % n, focusable: k < n };
      }),
    );
  }, [items.length, columns]);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !planeRef.current || !rootRef.current) return;
    const box = rootRef.current.getBoundingClientRect();
    planeRef.current.style.setProperty("--px", ((e.clientX - box.left) / box.width - 0.5).toFixed(3));
    planeRef.current.style.setProperty("--py", ((e.clientY - box.top) / box.height - 0.5).toFixed(3));
  };
  const onPointerLeave = () => {
    planeRef.current?.style.setProperty("--px", "0");
    planeRef.current?.style.setProperty("--py", "0");
  };

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="drift-wall relative h-[min(78vh,760px)] min-h-[460px] overflow-hidden rounded-3xl border border-border bg-card/40"
    >
      <div ref={planeRef} className="drift-wall__plane absolute inset-0 flex gap-[var(--gap)] px-[var(--gap)]">
        {grid.map((column, c) => (
          <div key={c} className="drift-wall__column min-w-0 flex-1">
            <div
              className="drift-wall__track"
              data-reverse={c % 2 === 1}
              style={{ "--duration": `${DURATIONS[c % DURATIONS.length]}s` } as CSSProperties}
            >
              {[0, 1].map((copy) =>
                column.map(({ index, focusable }, r) => {
                  const design = items[index];
                  const reachable = copy === 0 && focusable;
                  return (
                    <button
                      key={`${copy}-${r}`}
                      type="button"
                      onClick={() => onSelect(index)}
                      tabIndex={reachable ? 0 : -1}
                      aria-hidden={reachable ? undefined : true}
                      aria-label={reachable ? `View ${design.title}` : undefined}
                      className="drift-wall__tile group relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/60 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <img
                        src={design.image}
                        alt=""
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/85 to-transparent p-2.5 pt-8 text-left text-xs font-semibold leading-snug text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:text-sm">
                        {design.title}
                      </span>
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edge fades, in the page colour so they work in light and dark themes. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent sm:w-16" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent sm:w-16" />

      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
        Hover to pause · tap a design to open it
      </p>
    </div>
  );
}
