import type { MouseEvent } from "react";

// React Bits-style spotlight for `.spotlight` cards. The pointer position goes
// through CSS variables, so moving the mouse never re-renders the card.
export function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
  el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
}
