---
name: Card Interaction Pattern
description: FIFA-style card-glow + spotlight-card mouse-tracking pattern — always paired together
type: standard
---

# Card Interaction Pattern

FIFA/EA FC holographic card inspired. Always pair both classes together.

## Required Classes

```html
<div class="card-glow spotlight-card ...">
```

- `card-glow` — hover lift (-4px), gold border gradient reveal, gold box-shadow
- `spotlight-card` — radial gradient follows mouse via CSS custom properties

## Mouse Tracking (required on every card)

```tsx
onMouseMove={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
}}
```

## Rules

- Always use both classes together, never one without the other
- Cards use `rounded-sm` (not rounded-lg/xl)
- Card backgrounds: `bg-[#101d3f]/50` or custom gradients for player cards
- Border: `border border-white/5` or `border-white/[0.03]`
