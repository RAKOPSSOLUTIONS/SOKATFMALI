import type { Config } from "tailwindcss";
import preset from "@sokatf/tokens";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  presets: [preset],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
