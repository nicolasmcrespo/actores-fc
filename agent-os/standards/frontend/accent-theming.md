---
name: Accent Theming
description: Dual-team color theming (blue=actores, gold=actrices) — extensible for future teams
type: standard
---

# Accent Theming

Dual-team color theming. Currently 2 teams, designed to be extensible.

## Current Teams

| Team     | Accent Color   | Prop Value       |
|---------|---------------|------------------|
| Actores  | Blue #2563eb  | `accent="blue"`  |
| Actrices | Gold #c9a84c  | `accent="gold"`  |

## Implementation Pattern

```tsx
const isActriz = player.type === 'actriz';

// Conditional styles
className={isActriz ? 'text-[#c9a84c]/70' : 'text-[#2563eb]/70'}

// Card backgrounds
style={{
  background: isActriz
    ? 'linear-gradient(160deg, #1a1505 0%, #0f0d04 40%, #0a1128 100%)'
    : 'linear-gradient(160deg, #0d1a3d 0%, #080e24 40%, #050510 100%)'
}}
```

## Squad Component Accent Prop

```tsx
<Squad accent="blue" ... />  // Actores
<Squad accent="gold" ... />  // Actrices
```

## Rules

- `type` field in Player data drives theming
- Card bg gradients differ per team
- Rating badge color matches team accent
- Bottom accent line color matches team
- Pattern extensible for future teams
