import type { Config } from "tailwindcss";
import base from "../../tailwind.config";

// Builds the utilities for hub.css only, which ships in the lazy hub chunk.
// The main config skips src/hub, so hub-only classes add nothing to the
// public site's stylesheet.
export default {
  ...base,
  // Only the shadcn components the hub imports; add to this list when using a new one.
  content: [
    "./src/hub/**/*.{ts,tsx}",
    "./src/components/ui/{alert-dialog,button,checkbox,dropdown-menu,input,label,select,sheet,sonner,tabs,textarea}.tsx",
  ],
  theme: {
    ...base.theme,
    extend: {
      ...base.theme?.extend,
      colors: {
        ...base.theme?.extend?.colors,
        warning: {
          DEFAULT: "hsl(var(--hub-warning))",
          soft: "hsl(var(--hub-warning-soft))",
        },
        tint: "hsl(var(--hub-tint))",
        "on-tint": "hsl(var(--hub-on-tint))",
      },
      boxShadow: {
        hub: "var(--hub-shadow)",
        "hub-lg": "var(--hub-shadow-lg)",
      },
    },
  },
} satisfies Config;
