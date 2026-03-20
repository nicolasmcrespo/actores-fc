---
name: Section Layout Structure
description: Consistent section pattern — divider, max-width container, subtitle/title header with gold gradient
type: standard
---

# Section Layout Structure

Consistent pattern for all page sections.

## Template

```tsx
<section id="name" ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
  <div className="section-divider mx-auto mb-16" style={{ maxWidth: '80%' }} />
  <div className="max-w-[...] mx-auto px-6">
    {/* Section header */}
    <div className="mb-12 sm:mb-16">
      <span className="font-oswald text-[11px] tracking-[0.4em] uppercase text-[#c9a84c]/60">
        {subtitle}
      </span>
      <h2 className="font-bebas text-[64px] sm:text-[88px] md:text-[110px] leading-[0.85] mt-1">
        <span className="text-white">{word1} </span>
        <span className="text-gold-gradient">{word2}</span>
      </h2>
    </div>
    {/* Content */}
  </div>
</section>
```

## Max-Width Rules

- `max-w-[1400px]` for grid/card sections (Squad)
- `max-w-[1200px]` for text-heavy sections (About, Alcance)

## Section Header Pattern

- Subtitle: Oswald 11px, tracking-[0.4em], uppercase, gold/60
- Title: Bebas, split into white + gold-gradient words
- Optional: accent line + ghost count number

## Divider

```html
<div class="section-divider mx-auto mb-16" style="max-width: 80%" />
```
