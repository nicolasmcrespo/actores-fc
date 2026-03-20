---
name: Scroll-Reveal Pattern
description: useInView hook + CSS transitions for section entrance animations — required on every section
type: standard
---

# Scroll-Reveal Pattern

Every section must animate in on scroll.

## Hook

```tsx
import { useInView } from '../hooks/useInView';

const { ref, isVisible } = useInView(0.05);
// threshold: 0.05–0.2 depending on section height
```

## Transition Pattern

```tsx
<section ref={ref}>
  <div className={`transition-all duration-1000
    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
  >
```

## Stagger with transitionDelay

```tsx
style={{ transitionDelay: '0.3s' }}
style={{ transitionDelay: '0.6s' }}
// Increment by 0.2–0.3s per element group
```

## For list items (cards, grid)

```tsx
style={{ transitionDelay: `${Math.min(index * 0.06, 0.6)}s` }}
// Cap at 0.6s to avoid long waits
```

## Rules

- Required on every page section
- useInView fires once (unobserves after visible)
- Prefer CSS transitions; animation libraries OK if needed for complex sequences
- Common transforms: translate-y-8, translate-x-12, scale variants
