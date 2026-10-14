---
name: Executive Alpha Editorial
colors:
  surface: '#fcf8f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#45464d'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0d1c2e'
  on-tertiary-container: '#77859a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#d5e3fc'
  tertiary-fixed-dim: '#b9c7df'
  on-tertiary-fixed: '#0d1c2e'
  on-tertiary-fixed-variant: '#3a485b'
  background: '#fcf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display:
    fontFamily: Inter
    fontSize: 3.75rem
    fontWeight: '800'
    lineHeight: 4.25rem
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: '800'
    lineHeight: 2.875rem
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.375rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 1.625rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  body-lead:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '400'
    lineHeight: 1.875rem
    letterSpacing: -0.01em
  body-default:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
    letterSpacing: 0em
  body-muted:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  label-executive:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.125em
  label-badge:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 2rem
  gutter-mobile: 1rem
  margin: 4rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an ultra-high-trust, authoritative editorial environment engineered for private equity managing directors, investment committee members, and principal investors. The aesthetic fuses the institutional prestige of legacy financial journals with the razor-sharp precision of high-end financial technology.

### Core Philosophy
- **Restraint & Substance:** Every visual element serves credibility. We prioritize typographic rigor, negative space, and immaculate border structure over decorative distraction.
- **Institutional Gravitas:** High-contrast text set against surgical light surfaces evokes the permanence of physical prospectus documents and terminal interfaces.
- **Targeted Luxury:** A disciplined metallic accent punctuates key conversion moments and executive statuses, avoiding frivolous ornament while broadcasting exclusivity.

## Colors

The palette operates under rigorous discipline, dominated by crisp paper whites, deep obsidian inks, structural grays, and a calibrated antique gold accent.

### Color Roles
- **Primary (`#0F172A`):** Obsidian Slate. Utilized for high-impact call-to-action buttons, key institutional icons, and dominant focal elements.
- **Secondary (`#C5A059`):** Burnished Gold. Reserved strictly for tier signifiers, micro-badges, active indicator tabs, and fine status rules. It must never be applied to large background fills.
- **Tertiary (`#475569`):** Subdued Slate. Deployed for secondary text, metadata, captions, and structural container borders that require soft hierarchy.
- **Neutral (`#0A0A0A`):** Deep Obsidian. Applied to primary headlines and body copy for maximum optical clarity and authoritative weight.
- **Background Layering:** Canvas default is `#FFFFFF`, transitioning to `#FAFAFA` for nested structural containers and cards. Hairline divides utilize `#E5E7EB` and `#F3F4F6`.

## Typography

Inter serves as the sole typographic engine, engineered for hyper-legibility across dense quantitative financial tables and high-impact marketing layouts.

### Usage Standards
- **Optical Tracking:** Headlines carry negative letter-spacing (`-0.02em` to `-0.03em`) to tighten character relationships, producing a commanding, confident editorial lockup.
- **Micro-Labels (`label-executive`):** Always render in uppercase with expansive letter spacing (`0.125em`). These serve as section category trackers, curriculum milestone indicators, and metric tags.
- **Vertical Rhythm:** Multi-line editorial copy enforces an expansive line-height (minimum 1.625x) to maintain effortless parsing for executive-level scanning.

## Layout & Spacing

The layout model adheres to a centered 12-column structural grid system anchored by a maximum content container of 1280px.

### Responsive Breakpoints & Reflow
- **Desktop (≥ 1024px):** 12-column grid, 32px gutters, 64px outer page margin. Multi-column metric panels, side-by-side curriculum breakdown, and institutional credentials.
- **Tablet (768px – 1023px):** 8-column grid, 24px gutters, 32px outer page margin. Structural grids compress from 3/4-wide arrangements to 2-column stacked pairings.
- **Mobile (< 768px):** 4-column fluid grid, 16px gutters, 20px outer margin. All elements collapse to vertical single-column stacks with consistent card rhythm.

## Elevation & Depth

Visual depth is achieved through structural layering rather than heavy skeuomorphic shading. The system utilizes low-contrast outlines coupled with ambient, diffused shadows.

### Layering Hierarchy
- **Level 0 (Base Canvas):** Pure white (`#FFFFFF`) or off-white tone (`#FAFAFA`) ground.
- **Level 1 (Structural Cards & Modules):** Raised via a crisp 1px perimeter border (`rgba(229, 231, 235, 0.8)`) and an ultra-diffused shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Interactive Floating & Modals):** Accentuated with a refined elevation profile: `0 12px 32px -4px rgba(15, 23, 42, 0.06), 0 4px 16px -2px rgba(15, 23, 42, 0.03)` with matching 1px border.
- **Gold Accent Elevation:** Critical conversion elements may pair a faint gold perimeter glow: `0 0 0 1px rgba(197, 160, 89, 0.25), 0 8px 24px -4px rgba(197, 160, 89, 0.12)`.

## Shapes

The interface embraces a tailored modern shape language that balances corporate precision with contemporary digital product design.

### Border Radius Rules
- **Base Components (Buttons, Inputs, Metric Badges):** 8px (`0.5rem`) for compact structural integrity.
- **Cards, Content Modules & Curriculums:** 16px to 24px (`rounded-2xl` to `rounded-3xl`), introducing a soft, architectural framing to dense business information.
- **Avatars & Status Pills:** Full circular pill radius (`rounded-full`) to distinctly separate micro-indicators from structural blocks.

## Components

### Buttons
- **Primary Action (Executive CTA):** Background `#0F172A`, text `#FFFFFF`, border 1px solid `#0F172A`. Radius: `0.5rem`. Padding: `0.875rem 1.75rem`. Typography: `Inter`, weight 600, letter-spacing `-0.01em`. Hover state shifts background to `#1E293B` with subtle elevation lift.
- **Secondary Action (Syllabus/Prospectus Download):** Background `#FFFFFF`, text `#0F172A`, border 1px solid `#E5E7EB`. Hover state applies `#F8FAFC` background and `#CBD5E1` border color.
- **Exclusive Accent Action:** Background `#C5A059`, text `#FFFFFF`, border 1px solid `#B48A3C`. Used exclusively for final seat reservations or direct managing director inquiries.

### Badges & Chips
- **Curriculum / Cohort Status Pill:** Background `rgba(197, 160, 89, 0.08)`, border 1px solid `rgba(197, 160, 89, 0.3)`, text `#9A7B38`. Typography: `label-executive` (uppercase, tracked).
- **Metric Verification Chip:** Background `#F1F5F9`, border 1px solid `#E2E8F0`, text `#334155`. Displays institutional parameters (e.g., "AUM > $500M").

### Cards & Modules
- **Masterclass Cohort Card:** Pure `#FFFFFF` background, 1px border (`#E5E7EB`), border radius `1.25rem` (`rounded-2xl`), padding `2rem`. Header features a category micro-label followed by high-contrast headline typography.
- **Curriculum Pillar Card:** Includes a left-aligned numerical index (e.g., "01", "02") set in `Inter` semi-bold in `#C5A059` at 0.875rem, followed by a dividing rule in `#F3F4F6`.

### Executive Data Inputs
- **Application Field:** Height 48px, background `#FFFFFF`, border 1px solid `#D1D5DB`, radius `0.5rem`, padding `0 1rem`. Focus state: border-color `#0F172A`, outline none, box-shadow `0 0 0 3px rgba(15, 23, 42, 0.08)`. Placeholder text in `#94A3B8`.

### Lists & Curriculum Timelines
- **Feature & Outcome List:** Horizontal row spacing with 16px gaps. Bullet points are replaced with a crisp 16px gold-tinted SVG verification shield or checkmark icon encased in a 24px circular container (`rgba(197, 160, 89, 0.12)`).

### Metric Callouts (KPI Blocks)
- **Quantitative Result Block:** Displays institutional metrics (e.g., "4.2x", "82%"). Number set in `display` size at 800 weight, obsidian tone `#0A0A0A`. Supporting label set directly underneath in `label-executive`, color `#64748B`.