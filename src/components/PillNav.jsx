import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import "./PillNav.css";

/**
 * PillNav (React Bits style) — animated pill navigation with GSAP hover fill.
 *
 * Props:
 *  - logo (string): image src for logo. If empty, shows JM initials.
 *  - logoAlt (string)
 *  - items ({ label, href }[])
 *  - activeHref (string)
 *  - baseColor, pillColor, pillTextColor, hoveredPillTextColor (string)
 *  - ease (string) — GSAP ease
 *  - initialLoadAnimation (boolean)
 *  - onMobileMenuClick (fn)
 *  - mobileMenuOpen (boolean)
 *  - onNavigate (fn) — called with href on pill click
 */
export default function PillNav({
  logo,
  logoAlt = "Logo",
  items = [],
  activeHref,
  baseColor = "#0a0a0a",
  pillColor = "#ffffff",
  pillTextColor,
  hoveredPillTextColor = "#ffffff",
  ease = "power3.out",
  initialLoadAnimation = true,
  onMobileMenuClick,
  mobileMenuOpen = false,
  onNavigate,
}) {
  const resolvedTextColor = pillTextColor || baseColor;
  const circleRefs = useRef([]);
  const labelRefs = useRef([]);
  const hoverLabelRefs = useRef([]);
  const navRef = useRef(null);

  const setCircleRef = (el, i) => { circleRefs.current[i] = el; };
  const setLabelRef = (el, i) => { labelRefs.current[i] = el; };
  const setHoverLabelRef = (el, i) => { hoverLabelRefs.current[i] = el; };

  useEffect(() => {
    // Size hover circles to cover each pill
    items.forEach((_, i) => {
      const circle = circleRefs.current[i];
      if (!circle) return;
      const pill = circle.parentElement;
      if (!pill) return;
      const rect = pill.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height) * 1.5;
      circle.style.width = `${d}px`;
      circle.style.height = `${d}px`;
      circle.style.marginLeft = `-${d / 2}px`;
      gsap.set(circle, { y: d + 10, scale: 1 });
    });
  }, [items.length]);

  useEffect(() => {
    if (!initialLoadAnimation || !navRef.current) return;
    gsap.from(navRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease,
    });
  }, [initialLoadAnimation, ease]);

  const handleEnter = useCallback((i) => {
    const circle = circleRefs.current[i];
    const label = labelRefs.current[i];
    const hoverLabel = hoverLabelRefs.current[i];
    if (circle) gsap.to(circle, { y: 0, duration: 0.4, ease });
    if (label) gsap.to(label, { y: -20, opacity: 0, duration: 0.3, ease });
    if (hoverLabel) gsap.to(hoverLabel, { y: 0, opacity: 1, duration: 0.3, ease, delay: 0.05 });
  }, [ease]);

  const handleLeave = useCallback((i) => {
    const circle = circleRefs.current[i];
    const label = labelRefs.current[i];
    const hoverLabel = hoverLabelRefs.current[i];
    const d = circle ? parseFloat(circle.style.height || "0") : 0;
    if (circle) gsap.to(circle, { y: d + 10, duration: 0.4, ease });
    if (label) gsap.to(label, { y: 0, opacity: 1, duration: 0.3, ease });
    if (hoverLabel) gsap.to(hoverLabel, { y: 20, opacity: 0, duration: 0.25, ease });
  }, [ease]);

  const handleClick = (e, href) => {
    if (href?.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (onNavigate) onNavigate(href);
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--pill-text": resolvedTextColor,
    "--hover-text": hoveredPillTextColor,
  };

  return (
    <nav
      ref={navRef}
      className="pill-nav"
      style={cssVars}
      aria-label="Primary"
    >
      <a
        href="#home"
        className="pill-logo"
        aria-label={logoAlt}
        onClick={(e) => handleClick(e, "#home")}
      >
        {logo ? (
          <img
            src={logo}
            alt={logoAlt}
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.textContent = "JM"; }}
          />
        ) : (
          "JM"
        )}
      </a>

      <div className="pill-nav-items desktop-only">
        <ul className="pill-list">
          {items.map((item, i) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`pill ${isActive ? "is-active" : ""}`}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                  onClick={(e) => handleClick(e, item.href)}
                >
                  <span
                    className="hover-circle"
                    ref={(el) => setCircleRef(el, i)}
                    aria-hidden="true"
                  />
                  <span className="label-stack">
                    <span className="pill-label" ref={(el) => setLabelRef(el, i)}>
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover"
                      ref={(el) => setHoverLabelRef(el, i)}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        className="mobile-menu-button mobile-only"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
        onClick={onMobileMenuClick}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>
    </nav>
  );
}
