import { defineConfig } from "astro/config";

// Static site. Tailwind is wired through PostCSS (postcss.config.cjs), so no
// framework integration is required — keeps us on Tailwind v3 to reuse the
// exact design tokens from @sokatf/tokens.
export default defineConfig({
  site: "https://sokatf.com",
  server: { port: 4321 },
});
