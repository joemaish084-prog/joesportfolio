import { useEffect, useState, type ElementType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TYPE_PAIRS, TYPE_PAIR_IDS, typePairFontUrl, type TypePairId } from "@/lib/typePairs";

const LAB_FLAG = "typelab";
const overrideKey = (path: string) => `typepair:${path}`;

function readSession(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function writeSession(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch { /* storage blocked: the lab still works for this view */ }
}
function isPairId(value: string | null): value is TypePairId {
  return value !== null && value in TYPE_PAIRS;
}

/**
 * Wraps a page's content in its font pairing. Headings, `.font-display` and
 * body copy inside take the pairing's faces; navigation and footer outside
 * keep the site fonts. With no `pair`, it renders a plain element.
 */
export function TypePairScope({
  pair,
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  pair?: TypePairId;
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<`data-${string}`, string | boolean | undefined>) {
  const { pathname, search } = useLocation();
  const [labOpen, setLabOpen] = useState(false);
  const [override, setOverride] = useState<TypePairId | null>(null);

  // Read after mount, so prerendered HTML and the first client render match.
  useEffect(() => {
    if (!pair) return;
    if (new URLSearchParams(search).has(LAB_FLAG)) writeSession(LAB_FLAG, "1");
    setLabOpen(readSession(LAB_FLAG) === "1");
    const saved = readSession(overrideKey(pathname));
    setOverride(isPairId(saved) ? saved : null);
  }, [pair, pathname, search]);

  if (!pair) return <Tag className={className} {...rest}>{children}</Tag>;

  const active = override ?? pair;
  const choose = (id: TypePairId) => {
    setOverride(id === pair ? null : id);
    writeSession(overrideKey(pathname), id === pair ? null : id);
  };

  return (
    <Tag className={cn("type-pair", className)} data-type-pair={active} {...rest}>
      {/* Rendered in the markup (not injected later) so prerendered pages start loading the faces at once. */}
      <link rel="stylesheet" href={typePairFontUrl(active)} />
      {children}
      {labOpen && (
        <TypeLab
          active={active}
          assigned={pair}
          onChoose={choose}
          onClose={() => { writeSession(LAB_FLAG, null); setLabOpen(false); }}
        />
      )}
    </Tag>
  );
}

/** A headline in two voices: the display words, then the accent words.
 * Both stay in one heading, so the text reads and indexes as before. */
export function PairedTitle({
  main,
  accent,
  as: Tag = "h1",
  className,
}: {
  main: ReactNode;
  accent?: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag className={cn("pair-title", className)}>
      <span className="pair-main">{main}</span>
      {accent ? <>{" "}<span className="pair-accent">{accent}</span></> : null}
    </Tag>
  );
}

/** Corner switcher for auditioning pairings. Only shown after visiting a page with `?typelab`. */
function TypeLab({
  active,
  assigned,
  onChoose,
  onClose,
}: {
  active: TypePairId;
  assigned: TypePairId;
  onChoose: (id: TypePairId) => void;
  onClose: () => void;
}) {
  const index = TYPE_PAIR_IDS.indexOf(active);
  const step = (by: number) => onChoose(TYPE_PAIR_IDS[(index + by + TYPE_PAIR_IDS.length) % TYPE_PAIR_IDS.length]);
  const info = TYPE_PAIRS[active];

  return createPortal(
    <aside className="type-lab" aria-label="Font pairing switcher">
      <div className="type-lab-head">
        <strong>Type lab</strong>
        <button type="button" onClick={onClose} aria-label="Close type lab">×</button>
      </div>
      <label className="type-lab-select">
        <span className="sr-only">Pairing</span>
        <select value={active} onChange={(e) => onChoose(e.target.value as TypePairId)}>
          {TYPE_PAIR_IDS.map((id) => (
            <option key={id} value={id}>
              {TYPE_PAIRS[id].name}{id === assigned ? " (assigned)" : ""}
            </option>
          ))}
        </select>
      </label>
      <dl>
        <div><dt>Display</dt><dd>{info.display}</dd></div>
        <div><dt>Accent</dt><dd>{info.accent}</dd></div>
        <div><dt>Body</dt><dd>{info.body}</dd></div>
        <div><dt>After</dt><dd>{info.inspiredBy}</dd></div>
      </dl>
      <div className="type-lab-actions">
        <button type="button" onClick={() => step(-1)}>← Prev</button>
        <button type="button" onClick={() => onChoose(assigned)} disabled={active === assigned}>Reset</button>
        <button type="button" onClick={() => step(1)}>Next →</button>
      </div>
    </aside>,
    document.body,
  );
}
