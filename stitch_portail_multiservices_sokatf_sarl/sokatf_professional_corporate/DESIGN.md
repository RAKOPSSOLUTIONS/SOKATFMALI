---
name: SOKATF Professional Corporate
colors:
  surface: '#f9f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f9f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e4'
  on-surface: '#1a1c1d'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f0f0f2'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#006e28'
  on-secondary: '#ffffff'
  secondary-container: '#6ffb85'
  on-secondary-container: '#00732a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#241a00'
  on-tertiary-container: '#a18000'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#72fe88'
  secondary-fixed-dim: '#53e16f'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#00531c'
  tertiary-fixed: '#ffe08b'
  tertiary-fixed-dim: '#f1c100'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f9f9fb'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e4'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system for SOKATF-SARL is rooted in **Corporate Modernism**. It prioritizes reliability, institutional strength, and multi-sector versatility. The visual language conveys a "stable foundation" through structured layouts and a refined use of the logo’s vibrant primary palette as precise accents against a neutral, high-end backdrop.

The emotional response is one of **trust and efficiency**. By utilizing ample whitespace and high-contrast charcoal-on-white foundations, the UI feels organized and authoritative, while the strategic pops of green, yellow, and red act as directional cues for success, attention, and urgency.

## Colors
The palette is anchored by a sophisticated **Dark Charcoal (#121212)** for typography and primary structural elements, providing a modern alternative to pure black. The background strategy utilizes **Soft White (#FFFFFF)** and **Light Gray (#F5F5F7)** to create a clean, professional canvas.

The logo colors are utilized as functional accents:
- **Success Green (#34C759):** Growth, approvals, and positive progress indicators.
- **Alert Yellow (#FFCC00):** Notifications, warnings, and highlighting key data points.
- **Critical Red (#FF3B30):** Error states, critical alerts, and high-importance actions.

## Typography
The system uses **Hanken Grotesk** for headlines to provide a sharp, contemporary, and geometric edge that mirrors the architectural quality of the logo. **Inter** is used for body text and UI labels due to its exceptional legibility and systematic, neutral feel.

- **Headlines:** Use Bold/SemiBold weights with tighter letter-spacing for a confident, news-worthy impact.
- **Body:** Standardized at 16px for optimal readability across industrial and corporate reports.
- **Labels:** Utilize uppercase and increased letter-spacing for category headers and table headers to ensure clear information architecture.

## Layout & Spacing
The design system follows a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. It uses an **8px base unit** to ensure mathematical harmony across all components.

- **Density:** Professional/Medium density. Components are given room to breathe to maintain a premium feel.
- **Alignment:** Strict left-alignment for all text content to reinforce the sense of order and reliability.
- **Reflow:** On mobile, side-by-side elements (like cards or inputs) stack vertically to maintain readability.

## Elevation & Depth
This design system avoids heavy shadows, instead using **Tonal Layers** and **Low-Contrast Outlines** to define hierarchy.

- **Base Level:** White (#FFFFFF) for primary content areas.
- **Surface Level:** Light Gray (#F5F5F7) for background containers and section differentiation.
- **Stroke:** 1px borders in a soft gray (#E5E5E7) are used for cards and inputs.
- **Active State Elevation:** Only "floating" elements like modals or dropdowns use a soft, ultra-diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) to suggest they are above the base layer.

## Shapes
To align with the professional and industrial nature of SOKATF, the system uses a **Soft (0.25rem)** roundedness. This provides enough softening to feel modern and accessible, without losing the precision and "engineered" feel of sharp corners.

- **Standard Buttons/Inputs:** 4px (0.25rem) corner radius.
- **Cards/Containers:** 8px (0.5rem) corner radius.
- **Indicators (Status Dots):** Fully circular (pill) for immediate recognition.

## Components
- **Buttons:** Primary buttons are Solid Charcoal (#121212) with white text. Secondary buttons use a 1px Charcoal border. Small success/action buttons use the Green or Yellow accent colors sparingly.
- **Input Fields:** Minimalist with a 1px light gray border. On focus, the border transitions to Charcoal or Green. Labels are always visible above the field in `label-sm`.
- **Cards:** White background with a 1px stroke. No shadow. Used for grouping related data or project summaries.
- **Chips/Badges:** Used for status (e.g., "In Progress" in Yellow, "Completed" in Green). Text is SemiBold and set in `label-sm`.
- **Data Tables:** Highly structured with light gray dividers. Header row is filled with the background gray (#F5F5F7) to distinguish from data rows.
- **Navigation:** Top-level navigation uses `label-md` with a subtle green underline for the active state, signifying "forward movement."