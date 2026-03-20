---
name: Rating System
description: FIFA-style rating (76-99) derived from combined social media followers — shared utility
type: standard
---

# Rating System

FIFA-style rating derived from social media followers. Thresholds may evolve as the roster changes.

## Follower Parsing

```ts
// Parses "9.1M" → 9100000, "495K" → 495000
const parse = (s?: string) => {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  if (s.includes('M')) return n * 1000000;
  if (s.includes('K')) return n * 1000;
  return n;
};
```

## Rating Thresholds

| Combined Followers | Rating |
|-------------------|--------|
| >= 5M              | 99     |
| >= 2M              | 95     |
| >= 1M              | 92     |
| >= 500K            | 88     |
| >= 200K            | 84     |
| >= 100K            | 80     |
| < 100K             | 76     |

## Rules

- Combined = igFollowers + tkFollowers
- getRating() should be a shared utility (currently duplicated in PlayerCard + PlayerModal — extract to lib/)
- Thresholds may be adjusted as roster grows
- Rating displayed with Bebas font, team accent color, top-left of card
