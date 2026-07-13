/**
 * SOKATF-SARL — shared Tailwind design-system preset.
 * Source of truth: stitch_portail_multiservices_sokatf_sarl/.../DESIGN.md
 *
 * "Corporate Modernism": charcoal-on-white foundation, green/yellow/red logo
 * accents used sparingly, generous whitespace, tonal layers over heavy shadows.
 *
 * Consumed by both apps via `presets: [require('@sokatf/tokens')]`.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: "#f9f9fb",
        "surface-dim": "#d9dadc",
        "surface-bright": "#f9f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f5",
        "surface-container": "#eeeef0",
        "surface-container-high": "#e8e8ea",
        "surface-container-highest": "#e2e2e4",
        "on-surface": "#1a1c1d",
        "on-surface-variant": "#444748",
        "inverse-surface": "#2f3132",
        "inverse-on-surface": "#f0f0f2",
        outline: "#747878",
        "outline-variant": "#c4c7c7",
        "surface-tint": "#5f5e5e",
        primary: "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#1c1b1b",
        "on-primary-container": "#858383",
        "inverse-primary": "#c8c6c5",
        // Success green (logo accent)
        secondary: "#006e28",
        "on-secondary": "#ffffff",
        "secondary-container": "#6ffb85",
        "on-secondary-container": "#00732a",
        // Alert yellow (logo accent)
        tertiary: "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#241a00",
        "on-tertiary-container": "#a18000",
        // Critical red
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#e5e2e1",
        "primary-fixed-dim": "#c8c6c5",
        "on-primary-fixed": "#1c1b1b",
        "on-primary-fixed-variant": "#474646",
        "secondary-fixed": "#72fe88",
        "secondary-fixed-dim": "#53e16f",
        "on-secondary-fixed": "#002107",
        "on-secondary-fixed-variant": "#00531c",
        "tertiary-fixed": "#ffe08b",
        "tertiary-fixed-dim": "#f1c100",
        "on-tertiary-fixed": "#241a00",
        "on-tertiary-fixed-variant": "#584400",
        background: "#f9f9fb",
        "on-background": "#1a1c1d",
        "surface-variant": "#e2e2e4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Hanken Grotesk", "system-ui", "sans-serif"],
        "headline-xl": ["Hanken Grotesk", "sans-serif"],
        "headline-lg": ["Hanken Grotesk", "sans-serif"],
        "headline-md": ["Hanken Grotesk", "sans-serif"],
        "headline-lg-mobile": ["Hanken Grotesk", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      spacing: {
        unit: "8px",
        gutter: "24px",
        "margin-mobile": "16px",
        "margin-desktop": "48px",
        "container-max": "1280px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        float: "0px 4px 20px rgba(0,0,0,0.05)",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "bounce-slow": "bounce-slow 4s ease-in-out infinite",
      },
    },
  },
};
