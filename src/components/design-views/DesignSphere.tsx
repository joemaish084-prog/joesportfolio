import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Design } from "@/data/designs";
import "./design-views.css";

interface DesignSphereProps {
  items: Design[];
  /** Called with the index into `items` when the visitor opens the design in front. */
  onSelect: (index: number) => void;
}

interface Tile {
  lon: number;
  lat: number;
  item: number;
}

// Rings of tiles, equator first so the first designs sit in front.
const RING_LATS = [0, 22, -22, 44, -44];
const RING_STEP = 22;
const LAT_LIMIT = 50;
const DEG_PER_PX = 0.12;
const FRICTION = 0.93;
const SNAP_EASE = 0.12;
const PULL_BACK = 0.5; // how far the camera backs off while spinning, as a share of the radius

const rad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function buildGeometry(width: number, n: number) {
  const tileW = Math.round(clamp(width * 0.3, 140, 270));
  const tileH = Math.round(tileW * 1.25);
  const radius = Math.round((tileH * 1.18) / rad(RING_STEP));
  const tiles: Tile[] = [];
  for (const lat of RING_LATS) {
    const count = Math.max(6, Math.round((2 * Math.PI * radius * Math.cos(rad(lat))) / (tileW * 1.4)));
    const offset = (Math.abs(lat) / RING_STEP) % 2 === 1 ? 180 / count : 0;
    for (let i = 0; i < count; i++) {
      tiles.push({ lon: offset + (i * 360) / count, lat, item: tiles.length % n });
    }
  }
  return { tileW, tileH, radius, tiles };
}

/** How far a tile faces the viewer for a given scene rotation (1 = dead centre). */
const facing = (t: Tile, ax: number, ay: number) =>
  -Math.sin(rad(ax)) * Math.sin(rad(t.lat)) + Math.cos(rad(ax)) * Math.cos(rad(t.lat)) * Math.cos(rad(ay + t.lon));

/** A draggable globe of designs. Letting go snaps the nearest one to the front. */
export function DesignSphere({ items, onSelect }: DesignSphereProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(true);
  const [dragging, setDragging] = useState(false);

  const geometry = useMemo(
    () => (width > 0 && items.length > 0 ? buildGeometry(width, items.length) : null),
    [width, items.length],
  );

  const motion = useRef({
    ax: 0,
    ay: 0,
    pull: 0,
    vax: 0,
    vay: 0,
    tax: 0,
    tay: 0,
    target: 0,
    mode: "idle" as "idle" | "drag" | "inertia" | "snap",
    frame: 0,
    // pointer bookkeeping
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastMove: 0,
    moved: false,
    downTile: -1,
  });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      // Only rebuild for real width changes, not the mobile URL bar resizing the height.
      const w = Math.round(entry.contentRect.width / 16) * 16;
      setWidth((prev) => (prev === w ? prev : w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const apply = useCallback(() => {
    const m = motion.current;
    if (!sceneRef.current || !geometry) return;
    sceneRef.current.style.transform = `translateZ(${-(geometry.radius + m.pull)}px) rotateX(${m.ax}deg) rotateY(${m.ay}deg)`;
  }, [geometry]);

  const nearestTile = useCallback(() => {
    if (!geometry) return 0;
    const m = motion.current;
    let best = 0;
    let bestScore = -Infinity;
    geometry.tiles.forEach((t, i) => {
      const score = facing(t, m.ax, m.ay);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    return best;
  }, [geometry]);

  const tick = useCallback(() => {
    const m = motion.current;
    if (!geometry) return;

    if (m.mode === "inertia") {
      m.ay += m.vay;
      m.ax = clamp(m.ax + m.vax, -LAT_LIMIT, LAT_LIMIT);
      m.vax *= FRICTION;
      m.vay *= FRICTION;
      if (Math.hypot(m.vax, m.vay) < 0.05) {
        snapTo(nearestTile());
      }
    } else if (m.mode === "snap") {
      m.ax += (m.tax - m.ax) * SNAP_EASE;
      m.ay += (m.tay - m.ay) * SNAP_EASE;
      if (Math.abs(m.tax - m.ax) < 0.05 && Math.abs(m.tay - m.ay) < 0.05) {
        m.ax = m.tax;
        m.ay = m.tay;
        m.mode = "idle";
        setActive(m.target);
        setMoving(false);
      }
    }

    const pullTarget = m.mode === "drag" || m.mode === "inertia" ? geometry.radius * PULL_BACK : 0;
    m.pull += (pullTarget - m.pull) * 0.1;
    apply();

    if (m.mode !== "idle" || Math.abs(pullTarget - m.pull) > 0.5) {
      m.frame = requestAnimationFrame(tick);
    } else {
      m.pull = pullTarget;
      apply();
      m.frame = 0;
    }
    // snapTo is defined below and only reads refs, so it is safe to leave out here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, apply, nearestTile]);

  const run = useCallback(() => {
    if (!motion.current.frame) motion.current.frame = requestAnimationFrame(tick);
  }, [tick]);

  const snapTo = useCallback(
    (index: number) => {
      if (!geometry) return;
      const m = motion.current;
      const t = geometry.tiles[index];
      // Turn the short way round to the tile's longitude.
      m.tay = -t.lon + 360 * Math.round((m.ay + t.lon) / 360);
      m.tax = -t.lat;
      m.target = index;
      m.mode = "snap";
      setMoving(true);
      run();
    },
    [geometry, run],
  );

  // Spin in on load, and settle again whenever the set of designs or the size changes.
  useEffect(() => {
    if (!geometry) return;
    const m = motion.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cancelAnimationFrame(m.frame);
    m.frame = 0;
    if (reduced) {
      m.ax = 0;
      m.ay = 0;
      m.mode = "idle";
      apply();
      setActive(0);
      setMoving(false);
    } else {
      m.ay = -120;
      m.ax = 18;
      apply();
      snapTo(0);
    }
    return () => {
      cancelAnimationFrame(m.frame);
      m.frame = 0;
    };
  }, [geometry, apply, snapTo]);

  const step = (delta: number) => {
    if (!geometry) return;
    const m = motion.current;
    const n = items.length;
    const wanted = (geometry.tiles[active].item + delta + n) % n;
    // Of the tiles showing that design, pick the one closest to the front.
    let best = -1;
    let bestScore = -Infinity;
    geometry.tiles.forEach((t, i) => {
      if (t.item !== wanted) return;
      const score = facing(t, m.ax, m.ay);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    if (best >= 0) snapTo(best);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-sphere-ui]")) return;
    const m = motion.current;
    const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-tile]");
    m.downTile = tile ? Number(tile.dataset.tile) : -1;
    m.startX = m.lastX = e.clientX;
    m.startY = m.lastY = e.clientY;
    m.lastMove = performance.now();
    m.moved = false;
    m.vax = m.vay = 0;
    m.mode = "drag";
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    run();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const m = motion.current;
    if (m.mode !== "drag") return;
    const dx = e.clientX - m.lastX;
    const dy = e.clientY - m.lastY;
    m.lastX = e.clientX;
    m.lastY = e.clientY;
    m.lastMove = performance.now();
    if (!m.moved && Math.hypot(e.clientX - m.startX, e.clientY - m.startY) > 6) {
      m.moved = true;
      setMoving(true);
    }
    const day = dx * DEG_PER_PX;
    const dax = -dy * DEG_PER_PX;
    m.ay += day;
    m.ax = clamp(m.ax + dax, -LAT_LIMIT, LAT_LIMIT);
    m.vay = m.vay * 0.6 + day * 0.4;
    m.vax = m.vax * 0.6 + dax * 0.4;
  };

  const endDrag = (cancelled: boolean) => {
    const m = motion.current;
    if (m.mode !== "drag") return;
    setDragging(false);
    if (!m.moved && !cancelled) {
      // A tap: open the design in front, or bring a side tile forward.
      if (m.downTile === active && !moving) {
        m.mode = "idle";
        onSelect(geometry!.tiles[active].item);
      } else {
        snapTo(m.downTile >= 0 ? m.downTile : nearestTile());
      }
      return;
    }
    if (performance.now() - m.lastMove > 80) m.vax = m.vay = 0;
    m.mode = "inertia";
    run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if ((e.key === "Enter" || e.key === " ") && geometry) {
      e.preventDefault();
      onSelect(geometry.tiles[active].item);
    }
  };

  const current = geometry ? items[geometry.tiles[active]?.item ?? 0] : items[0];
  const currentIndex = geometry ? (geometry.tiles[active]?.item ?? 0) : 0;

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Design sphere. Use the left and right arrow keys to turn it, Enter to open the design in front."
      data-dragging={dragging}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => endDrag(false)}
      onPointerCancel={() => endDrag(true)}
      onKeyDown={onKeyDown}
      className="design-sphere design-bleed relative h-[min(88vh,900px)] min-h-[540px] overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {geometry && (
        <div
          className="design-sphere__stage design-fade absolute inset-0"
          style={{ perspective: `${Math.round(geometry.radius * 1.5)}px` }}
        >
        <div ref={sceneRef} className="design-sphere__scene" aria-hidden="true">
          {geometry.tiles.map((t, i) => {
            const design = items[t.item];
            return (
              <div
                key={i}
                data-tile={i}
                data-dim={!moving && i !== active}
                className="design-sphere__tile overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-soft"
                style={{
                  width: geometry.tileW,
                  height: geometry.tileH,
                  marginLeft: -geometry.tileW / 2,
                  marginTop: -geometry.tileH / 2,
                  transform: `rotateY(${t.lon}deg) rotateX(${t.lat}deg) translateZ(${geometry.radius}px)`,
                }}
              >
                <img
                  src={design.image}
                  alt=""
                  decoding="async"
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>
        </div>
      )}

      <p className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
        Drag to spin · tap the front design to open it
      </p>

      {current && (
        <div
          data-sphere-ui
          aria-live="polite"
          className={`absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-5 text-center transition-all duration-300 sm:pb-7 ${
            moving ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"
          }`}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {current.group === "More" ? "Brand work" : current.group} · {currentIndex + 1} / {items.length}
            </p>
            <p className="mt-1 font-display text-lg font-bold leading-snug sm:text-2xl">{current.title}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{current.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-full" onClick={() => step(-1)} aria-label="Previous design">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button type="button" variant="gradient" className="h-11 gap-2 rounded-full px-5" onClick={() => onSelect(currentIndex)}>
              <Expand className="h-4 w-4" />
              View design
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-full" onClick={() => step(1)} aria-label="Next design">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
