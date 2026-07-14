---
name: Kinetic Dark
colors:
  surface: "#131315"
  surface-dim: "#131315"
  surface-bright: "#39393b"
  surface-container-lowest: "#0e0e10"
  surface-container-low: "#1c1b1d"
  surface-container: "#201f21"
  surface-container-high: "#2a2a2c"
  surface-container-highest: "#353437"
  on-surface: "#e5e1e4"
  on-surface-variant: "#e4beb1"
  inverse-surface: "#e5e1e4"
  inverse-on-surface: "#313032"
  outline: "#ab897d"
  outline-variant: "#5b4137"
  surface-tint: "#ffb59a"
  primary: "#ffb59a"
  on-primary: "#5a1b00"
  primary-container: "#ff5c00"
  on-primary-container: "#521800"
  inverse-primary: "#a73a00"
  secondary: "#d4bbff"
  on-secondary: "#41008b"
  secondary-container: "#6c04de"
  on-secondary-container: "#d4baff"
  tertiary: "#00dbe9"
  on-tertiary: "#00363a"
  tertiary-container: "#00a2ac"
  on-tertiary-container: "#003135"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#ffdbce"
  primary-fixed-dim: "#ffb59a"
  on-primary-fixed: "#370e00"
  on-primary-fixed-variant: "#802a00"
  secondary-fixed: "#ebdcff"
  secondary-fixed-dim: "#d4bbff"
  on-secondary-fixed: "#270058"
  on-secondary-fixed-variant: "#5d00c2"
  tertiary-fixed: "#7df4ff"
  tertiary-fixed-dim: "#00dbe9"
  on-tertiary-fixed: "#002022"
  on-tertiary-fixed-variant: "#004f54"
  background: "#131315"
  on-background: "#e5e1e4"
  surface-variant: "#353437"
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 72px
    fontWeight: "700"
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: "600"
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: "500"
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is engineered for a high-performance web development agency, evoking a sense of technical mastery, speed, and creative energy. The brand personality is "The Architect of the Future"—authoritative yet innovative.

The visual style is a fusion of **Corporate Modernism** and **Glassmorphism**, set against a deep, near-black canvas. It utilizes high-energy neon accents—specifically electric orange and deep violet—to draw the eye to critical actions and data visualizations. The interface relies on crisp geometry, subtle background blurs, and "light-leak" gradients to create depth without sacrificing the professional utility required by a B2B tech audience.

## Colors

This design system utilizes a "Void and Neon" strategy. The primary palette is dominated by deep neutrals to ensure the vibrant accents feel intentional and high-impact.

- **Primary (Electric Orange):** Reserved for primary CTAs, critical status indicators, and "lightning" brand elements.
- **Secondary (Vivid Violet):** Used for secondary interactive elements, hover states, and decorative gradients.
- **Backgrounds:** Use a tiered dark scale. The base layer is `#0A0A0C`, with elevated surfaces using slightly lighter, desaturated navy-grays to maintain a sophisticated atmosphere.
- **Accents:** High-contrast white (#FFFFFF) is used for maximum readability of body text against the dark backgrounds.

## Typography

Typography is clean and systematic. **Hanken Grotesk** provides a sharp, contemporary edge for headlines, while **Inter** ensures maximum legibility for complex documentation or service descriptions.

For technical data, code snippets, or small metadata labels, **JetBrains Mono** is used to reinforce the agency's "tech-first" DNA. Headlines should use tighter letter spacing and bold weights to command attention.

## Layout & Spacing

The design system employs a **Fluid Grid** model based on a 12-column architecture for desktop.

- **Desktop:** 12 columns with 24px gutters. Use wide margins (64px+) to allow the dark background to "breathe" and create a premium feel.
- **Tablet:** 8 columns with 20px gutters.
- **Mobile:** 4 columns with 16px gutters and margins.

Spacing follows an 8px linear scale. For vertical rhythm between large sections, use generous padding (80px to 120px) to maintain the minimalist, spacious aesthetic seen in high-end tech landing pages.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Backdrop Blurs** rather than traditional heavy shadows.

- **Level 1 (Base):** `#0A0A0C` (Pure background).
- **Level 2 (Cards/Navigation):** Semi-transparent `#16161A` with a 12px backdrop blur and a 1px subtle border (`#FFFFFF` at 10% opacity).
- **Level 3 (Popovers/Modals):** Lighter surface with a "glow" shadow. The shadow should use the primary or secondary color at very low opacity (5-10%) to simulate a neon light cast.
- **Interactions:** Elements should "lift" on hover using a brightness increase and a subtle outer glow in the accent color.

## Shapes

The design system uses **Soft (0.25rem)** roundedness to maintain a precise, engineered appearance. While the core UI is geometric and sharp, larger containers like cards can utilize `rounded-lg` (0.5rem) to feel more approachable.

Interactive elements like buttons and chips should remain strictly consistent with the soft-cornered aesthetic—avoid full pills unless used for specific "Status" badges.

## Components

### Buttons

- **Primary:** Solid Electric Orange background with white text. No border. On hover, add a subtle orange outer glow.
- **Secondary:** Transparent background with a 1px White border (20% opacity). On hover, background becomes 10% white.
- **Ghost:** Minimal text buttons using JetBrains Mono for a "terminal" feel.

### Input Fields

- Dark backgrounds (Level 2 elevation) with 1px borders.
- Focus state: Border changes to Primary Orange with a 2px outer glow.
- Placeholder text: Mid-gray (#888888).

### Cards & Containers

- Utilize "Glass" cards: desaturated dark fills, backdrop blur, and ultra-thin borders.
- For feature cards, use a top-border accent of 2px in Primary or Secondary colors to categorize content.

### Data Visualization

- Use the Secondary (Violet) and Tertiary (Cyan) colors for graphs and charts to ensure they pop against the dark UI without clashing with the Primary Orange CTAs.
