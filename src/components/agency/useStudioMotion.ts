import { useEffect, type RefObject } from "react";
import { inView } from "framer-motion";

export function useStudioMotion(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const scene = root.current;
    if (!scene) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)");
    let teardown = () => {};

    function start() {
      teardown();
      if (!scene || !motion.matches) return;
      scene.dataset.motion = "ready";

      const running = new Map<HTMLElement, () => void>();
      const targets = scene.querySelectorAll<HTMLElement>("[data-reveal], [data-count]");
      const stopObserving = inView(targets, (target) => {
        if (!(target instanceof HTMLElement) || target.hasAttribute("data-revealed")) return;
        target.setAttribute("data-revealed", "");
        const metric = target.dataset.count;
        const match = metric?.match(/^(\D*)([\d,.]+)(.*)$/);
        if (!match) return;
        const [, prefix, digits, suffix] = match;
        const final = Number(digits.replace(/,/g, ""));
        const decimals = digits.split(".")[1]?.length ?? 0;
        const formatter = new Intl.NumberFormat("en-KE", {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        });
        let frame = 0;
        const from = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - from) / 780);
          if (progress === 1) {
            target.textContent = metric;
            running.delete(target);
          } else {
            target.textContent = `${prefix}${formatter.format(final * (1 - (1 - progress) ** 3))}${suffix}`;
            frame = requestAnimationFrame(tick);
          }
        };
        running.set(target, () => {
          cancelAnimationFrame(frame);
          target.textContent = metric;
        });
        frame = requestAnimationFrame(tick);
      }, { amount: 0.25 });

      const stopDesktop = desktop.matches ? desktopMotion(scene) : () => {};
      teardown = () => {
        delete scene.dataset.motion;
        stopObserving();
        for (const stop of running.values()) stop();
        stopDesktop();
      };
    }

    start();
    motion.addEventListener("change", start);
    desktop.addEventListener("change", start);
    return () => {
      teardown();
      motion.removeEventListener("change", start);
      desktop.removeEventListener("change", start);
    };
  }, [root]);
}

function desktopMotion(scene: HTMLElement) {
  const hero = scene.querySelector<HTMLElement>(".studio-hero-photo");
  const cursor = scene.querySelector<HTMLElement>(".studio-cursor");
  const magnetic = scene.querySelector<HTMLElement>("[data-magnetic]");
  let frame = 0;

  const scroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!hero) return;
      const { top, bottom } = hero.getBoundingClientRect();
      if (bottom > 0 && top < window.innerHeight) {
        hero.style.setProperty("--studio-photo-offset", `${Math.min(26, Math.max(0, window.scrollY * 0.075))}px`);
      }
    });
  };
  const point = (event: PointerEvent) => {
    if (!cursor || event.pointerType !== "mouse") return;
    const active = event.target instanceof Element && event.target.closest("[data-studio-cursor]");
    cursor.toggleAttribute("data-active", Boolean(active));
    if (active) cursor.style.transform = `translate3d(${event.clientX + 10}px, ${event.clientY + 10}px, 0)`;
  };
  const hide = () => cursor?.removeAttribute("data-active");
  const magnetize = (event: PointerEvent) => {
    if (!magnetic || event.pointerType !== "mouse") return;
    const { x, y, width, height } = magnetic.getBoundingClientRect();
    magnetic.style.setProperty("--studio-magnetic-x", `${(event.clientX - x - width / 2) * .12}px`);
    magnetic.style.setProperty("--studio-magnetic-y", `${(event.clientY - y - height / 2) * .18}px`);
  };
  const reset = () => {
    magnetic?.style.removeProperty("--studio-magnetic-x");
    magnetic?.style.removeProperty("--studio-magnetic-y");
  };

  scroll();
  window.addEventListener("scroll", scroll, { passive: true });
  scene.addEventListener("pointermove", point, { passive: true });
  scene.addEventListener("pointerleave", hide);
  magnetic?.addEventListener("pointermove", magnetize, { passive: true });
  magnetic?.addEventListener("pointerleave", reset);
  return () => {
    window.removeEventListener("scroll", scroll);
    scene.removeEventListener("pointermove", point);
    scene.removeEventListener("pointerleave", hide);
    magnetic?.removeEventListener("pointermove", magnetize);
    magnetic?.removeEventListener("pointerleave", reset);
    cancelAnimationFrame(frame);
    hero?.style.removeProperty("--studio-photo-offset");
    hide();
    reset();
  };
}
