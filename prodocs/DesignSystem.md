# Design System — Rumour

This document captures the core visual tokens used across Web and Mobile.

## Colour Palette
Colors are sourced from the Web Tailwind config and the Mobile theme file.

- Primary (Tailwind): `#667eea` (frontend/tailwind.config.cjs)
- Secondary (Tailwind): `#764ba2`

Mobile surface tokens (`mobile/src/theme/colors.js`):
- background: `#09090b` (deep black)
- surface: `#111827` (primary dark surface)
- surfaceElevated: `#18181b` (elevated surface)
- border: `#27272a` (subtle borders)

Usage guidance:
- Use `background` for app chrome and full-screen surfaces.
- Use `surface` for cards, drawers, and modals.
- Use `surfaceElevated` for active sheets and interactive elements.
- Use `border` for separators and subtle outlines.

## Typography
- Weight scale: Heavy display headings use 700–900; body text ranges 400–700 for emphasis.
- Heading scale (recommended):
  - H1: 36–48px, heavy, tight letter-spacing (app title)
  - H2: 20–28px
  - Body: 12–16px
  - UI labels: 8–11px uppercase, bold

The web app relies on Tailwind utility classes for typography. Mobile uses React Native default fonts with bold/weight where `fontWeight` is applied.

## Spacing and Layout
- Base spacing unit: 4px.
- Common scales: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Border radius: 12–20px for cards and input fields; 20–28px for modals and sheets.

## Components
- Buttons: high-contrast with strong primary background (`#667eea`) or inverted white on dark backgrounds.
- Chips: use uppercase micro labels with tight padding and small radius.
- Modal/sheet: use `surface` background with `surfaceElevated` for headers and a soft border using `border` token.

## Accessibility notes
- Ensure contrast ratios for text over `surface` meet AA where possible. Use semi-opaque overlays for modals to maintain legibility.
- Use safe-area insets for mobile to avoid clipping on notched devices.

## How to update tokens
- Web tokens: edit `frontend/tailwind.config.cjs` under `theme.extend.colors`.
- Mobile tokens: edit `mobile/src/theme/colors.js` and restart Expo.

