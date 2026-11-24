import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group shared raster URL modules. The images themselves still load
          // independently through srcset and native lazy loading.
          if (/\/src\/assets\/(?:responsive\/|marquee\/|showcase\/|design-)[^?]+\.webp$/.test(id)) {
            return "creative-image-urls";
          }
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
