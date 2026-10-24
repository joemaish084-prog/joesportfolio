import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts", "supabase/functions/_shared/**/*.test.ts"],
    // Each database suite boots its own Postgres; give it room on slower machines.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
