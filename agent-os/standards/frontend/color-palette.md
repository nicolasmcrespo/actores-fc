---
name: Color Palette & CSS Variables
description: Official Actores FC brand colors — navy/gold palette with CSS custom properties
type: standard
---

# Color Palette & CSS Variables

Official Actores FC brand colors. Defined as CSS custom properties in `src/index.css`.

## Core Palette

```css
--navy: #0a1128       /* bg, deep sections */
--navy-light: #101d3f /* cards, elevated bg */
--navy-mid: #162040   /* subtle elevation */
--blue-royal: #1a3a8a /* actores accent */
--blue-bright: #2563eb/* actores highlights */
--gold: #c9a84c       /* primary brand accent */
--gold-light: #e2c780 /* hover, gradient end */
--gold-dim: #8a7535   /* muted gold, dividers */
```

## Usage Rules

- Gold is the primary accent — CTAs, highlights, gradient text
- Navy is the base background — never use pure black (#000)
- Blue variants are secondary — used for actores team theming
- Text sits on navy: use white/80, white/40, #b0b8c8 for hierarchy
- No palette restrictions, but new colors must not clash with navy/gold identity

## Gradient Patterns

```css
/* Gold text gradient */
.text-gold-gradient {
  background: linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dim));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Stat shimmer */
.stat-shimmer { /* same gradient + shimmer animation */ }
```
