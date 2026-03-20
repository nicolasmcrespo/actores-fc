---
name: Typography Hierarchy
description: Strict 3-font system (Bebas Neue / Oswald / Inter) — roles, sizing, and rules
type: standard
---

# Typography Hierarchy

Strict 3-font system. No additional fonts.

## Fonts & Roles

| Font         | Class          | Role                              |
|-------------|----------------|-----------------------------------|
| Bebas Neue  | `.font-bebas`  | Display headings, numbers, ratings |
| Oswald      | `.font-oswald` | Labels, nav, subtitles, CTAs       |
| Inter       | (default body) | Body text, descriptions            |

## Sizing Patterns

- **Hero titles**: `text-[80px]` → `text-[200px]` responsive
- **Section titles**: `text-[64px]` → `text-[110px]`
- **Stat numbers**: `text-[36px]` → `text-[64px]`
- **Labels/nav**: `text-[11px]`–`text-[13px]` with `tracking-[0.15em]`–`tracking-[0.4em]` uppercase
- **Body**: `text-[14px]`–`text-[16px]` font-light

## Rules

- Bebas = always uppercase naturally (all-caps font)
- Oswald labels = always `uppercase` + wide tracking
- Inter body = always `font-light`, `text-[#b0b8c8]`
- Never add a 4th font
- Ratings and large numbers always use Bebas
