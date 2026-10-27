import type { Config } from "tailwindcss";
import base from "../../tailwind.config";

// Builds the utilities for portal.css only, which ships in the lazy portal
// chunk. The main config skips src/portal, so portal-only classes add nothing
// to the public site's stylesheet.

// Tremor builds colour classes from a `color` prop at runtime, so the ones the
// portal charts can use have to be safelisted.
const TREMOR_COLORS = "orange|amber|sky|emerald|violet|rose|slate";
const SHADES = "50|100|200|300|400|500|600|700|800|900";

export default {
  ...base,
  content: [
    "./src/portal/**/*.{ts,tsx}",
    "./src/components/ui/{alert-dialog,button,checkbox,command,dialog,dropdown-menu,input,label,select,sheet,sonner,tabs,textarea,tooltip}.tsx",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: new RegExp(`^(bg|text|border|ring|stroke|fill)-(${TREMOR_COLORS})-(${SHADES})$`),
      variants: ["hover", "ui-selected", "dark"],
    },
  ],
  theme: {
    ...base.theme,
    extend: {
      ...base.theme?.extend,
      colors: {
        ...base.theme?.extend?.colors,
        tint: "hsl(var(--portal-tint))",
        "on-tint": "hsl(var(--portal-on-tint))",
        success: "hsl(var(--portal-success))",
        warning: { DEFAULT: "hsl(var(--portal-warning))", soft: "hsl(var(--portal-warning-soft))" },
        // Tremor reads these; they follow the portal tokens in both themes.
        tremor: {
          brand: {
            faint: "hsl(var(--portal-tint))",
            muted: "hsl(var(--primary) / 0.25)",
            subtle: "hsl(var(--primary) / 0.6)",
            DEFAULT: "hsl(var(--primary))",
            emphasis: "hsl(var(--primary))",
            inverted: "hsl(var(--primary-foreground))",
          },
          background: {
            muted: "hsl(var(--muted))",
            subtle: "hsl(var(--muted))",
            DEFAULT: "hsl(var(--card))",
            emphasis: "hsl(var(--foreground))",
          },
          border: { DEFAULT: "hsl(var(--border))" },
          ring: { DEFAULT: "hsl(var(--border))" },
          content: {
            subtle: "hsl(var(--muted-foreground) / 0.7)",
            DEFAULT: "hsl(var(--muted-foreground))",
            emphasis: "hsl(var(--foreground))",
            strong: "hsl(var(--foreground))",
            inverted: "hsl(var(--background))",
          },
        },
        "dark-tremor": {
          brand: {
            faint: "hsl(var(--portal-tint))",
            muted: "hsl(var(--primary) / 0.25)",
            subtle: "hsl(var(--primary) / 0.6)",
            DEFAULT: "hsl(var(--primary))",
            emphasis: "hsl(var(--primary))",
            inverted: "hsl(var(--primary-foreground))",
          },
          background: {
            muted: "hsl(var(--muted))",
            subtle: "hsl(var(--muted))",
            DEFAULT: "hsl(var(--card))",
            emphasis: "hsl(var(--foreground))",
          },
          border: { DEFAULT: "hsl(var(--border))" },
          ring: { DEFAULT: "hsl(var(--border))" },
          content: {
            subtle: "hsl(var(--muted-foreground) / 0.7)",
            DEFAULT: "hsl(var(--muted-foreground))",
            emphasis: "hsl(var(--foreground))",
            strong: "hsl(var(--foreground))",
            inverted: "hsl(var(--background))",
          },
        },
      },
      boxShadow: {
        ...base.theme?.extend?.boxShadow,
        portal: "var(--portal-shadow)",
        "portal-lg": "var(--portal-shadow-lg)",
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card": "none",
        "tremor-dropdown": "var(--portal-shadow-lg)",
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card": "none",
        "dark-tremor-dropdown": "var(--portal-shadow-lg)",
      },
      borderRadius: {
        ...base.theme?.extend?.borderRadius,
        "tremor-small": "0.375rem",
        "tremor-default": "0.75rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        ...base.theme?.extend?.fontSize,
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      keyframes: {
        ...base.theme?.extend?.keyframes,
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
        "portal-rise": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "portal-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        ...base.theme?.extend?.animation,
        "border-beam": "border-beam calc(var(--duration, 12) * 1s) infinite linear",
        "portal-rise": "portal-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "portal-pulse": "portal-pulse 2.4s ease-in-out infinite",
      },
    },
  },
} satisfies Config;
