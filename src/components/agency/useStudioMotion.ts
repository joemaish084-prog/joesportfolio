import { useEffect, type RefObject } from "react";

export function useStudioMotion(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const scene = root.current;
    if (!scene) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)");
    const stopMobileAudit = observeAuditBar(scene);
    let teardown = () => {};

    function start() {
      teardown();
      if (!scene || !motion.matches) return;
      scene.dataset.motion = "ready";

      const running = new Map<HTMLElement, () => void>();
      const reveal = (target: Element) => {
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
      };
      const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
        if (target.hasAttribute("data-scroll-loop")) {
          target.toggleAttribute("data-loop-visible", isIntersecting);
        } else if (isIntersecting) {
          reveal(target);
          observer.unobserve(target);
        }
      }), { threshold: 0.15 });
      scene.querySelectorAll("[data-reveal], [data-count], [data-scroll-loop]").forEach(node => observer.observe(node));

      const stopDesktop = desktop.matches ? desktopMotion(scene) : () => {};
      const stopTimeline = timelineMotion(scene);
      teardown = () => {
        delete scene.dataset.motion;
        observer.disconnect();
        for (const stop of running.values()) stop();
        stopTimeline();
        stopDesktop();
      };
    }

    start();
    motion.addEventListener("change", start);
    desktop.addEventListener("change", start);
    return () => {
      teardown();
      stopMobileAudit();
      motion.removeEventListener("change", start);
      desktop.removeEventListener("change", start);
    };
  }, [root]);
}

function observeAuditBar(scene: HTMLElement) {
  const bar = scene.querySelector<HTMLElement>("[data-mobile-audit]");
  const hero = scene.querySelector(".studio-hero [data-magnetic]");
  const audit = scene.querySelector("#audit");
  if (!bar || !hero || !audit) return () => {};
  const visible = new Map<Element, boolean>([[hero, true], [audit, false]]);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target, entry.isIntersecting));
    bar.hidden = Boolean(visible.get(hero) || visible.get(audit));
  }, { rootMargin: "-64px 0px 0px" });
  observer.observe(hero);
  observer.observe(audit);
  return () => observer.disconnect();
}

function timelineMotion(scene: HTMLElement) {
  const timeline = scene.querySelector<HTMLElement>("[data-timeline]");
  if (!timeline) return () => {};
  let frame = 0;
  const scroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const { top, height } = timeline.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * .7 - top) / height));
      timeline.style.setProperty("--timeline-fill", String(progress));
    });
  };
  window.addEventListener("scroll", scroll, { passive: true });
  scroll();
  return () => { window.removeEventListener("scroll", scroll); cancelAnimationFrame(frame); };
}

function desktopMotion(scene: HTMLElement) {
  const hero = scene.querySelector<HTMLElement>(".studio-hero-photo");
  const cursor = scene.querySelector<HTMLElement>(".studio-cursor");
  const magnetic = scene.querySelectorAll<HTMLElement>("[data-magnetic]");
  let frame = 0;
  let destroyed = false;
  let destroyLenis: (() => void) | undefined;

  function enableSmoothScroll() {
    void Promise.all([import("lenis"), import("lenis/dist/lenis.css")]).then(([{ default: Lenis }]) => {
      if (destroyed) return;
      const lenis = new Lenis({
        autoRaf: true, anchors: true, stopInertiaOnNavigate: true,
        prevent: node => node.getAttribute("role") === "dialog",
      });
      destroyLenis = () => lenis.destroy();
    }).catch(() => { /* Native scrolling remains available. */ });
  }
  window.addEventListener("wheel", enableSmoothScroll, { once: true, passive: true });

  const scroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!hero) return;
      const { top, bottom } = hero.getBoundingClientRect();
      if (bottom > 0 && top < window.innerHeight) {
        hero.style.setProperty("--studio-photo-offset", `${Math.min(24, Math.max(0, window.scrollY * 0.045))}px`);
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
  const resetButtons = Array.from(magnetic, button => {
    const magnetize = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const { x, y, width, height } = button.getBoundingClientRect();
      button.style.setProperty("--studio-magnetic-x", `${(event.clientX - x - width / 2) * .12}px`);
      button.style.setProperty("--studio-magnetic-y", `${(event.clientY - y - height / 2) * .18}px`);
    };
    const reset = () => {
      button.style.removeProperty("--studio-magnetic-x");
      button.style.removeProperty("--studio-magnetic-y");
    };
    button.addEventListener("pointermove", magnetize, { passive: true });
    button.addEventListener("pointerleave", reset);
    return () => { button.removeEventListener("pointermove", magnetize); button.removeEventListener("pointerleave", reset); reset(); };
  });

  scroll();
  window.addEventListener("scroll", scroll, { passive: true });
  scene.addEventListener("pointermove", point, { passive: true });
  scene.addEventListener("pointerleave", hide);
  return () => {
    destroyed = true;
    window.removeEventListener("wheel", enableSmoothScroll);
    destroyLenis?.();
    window.removeEventListener("scroll", scroll);
    scene.removeEventListener("pointermove", point);
    scene.removeEventListener("pointerleave", hide);
    resetButtons.forEach(stop => stop());
    cancelAnimationFrame(frame);
    hero?.style.removeProperty("--studio-photo-offset");
    hide();
  };
}
