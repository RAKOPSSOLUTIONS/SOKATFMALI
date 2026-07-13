import preset from "@sokatf/tokens";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  presets: [preset],
  theme: {
    extend: {
      colors: {
        // "Industrial Excellence" palette — deep navy + gold.
        navy: {
          DEFAULT: "#0f172a",
          900: "#0f172a",
          800: "#131b2e",
          700: "#1e293b",
          600: "#334155",
        },
        gold: {
          DEFAULT: "#d4af37", // brand gold (fine lines, accents)
          bright: "#fed65b", // button fill
          soft: "#ffe088", // gold text on navy
          dim: "#e9c349",
          deep: "#735c00", // gold text on light
        },
        ink: {
          DEFAULT: "#191c1e",
          soft: "#45464d",
        },
        line: "#e2e8f0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "container-max": "1280px",
      },
    },
  },
  plugins: [],
};
