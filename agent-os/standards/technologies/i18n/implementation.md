# i18n Implementation Standards

## Context

Internationalization (i18n) is **required by default** in all Agent OS projects. This ensures every application is built for global reach from day one.

## Framework Selection by Tech Stack

### React / Next.js Projects
```yaml
Primary Choice: next-intl
Alternative: react-i18next
Routing: next-intl-router (for App Router)
```

### Ruby on Rails Projects
```yaml
Primary Choice: rails-i18n (built-in)
Gem: i18n-js (for JavaScript integration)
Format: YAML locale files
```

### General JavaScript/TypeScript
```yaml
Primary Choice: i18next
Format Handling: intl-messageformat
Date/Time: date-fns with locale support
Numbers: Intl.NumberFormat (native)
```

## Required Project Structure

### React/Next.js Structure
```
src/
├── i18n/
│   ├── config.ts           # i18n configuration
│   ├── request.ts          # Server-side locale handling
│   └── routing.ts          # URL-based locale routing
├── messages/
│   ├── en.json             # English (default)
│   ├── es.json             # Spanish
│   └── [locale].json       # Additional locales
└── components/
    └── LocaleSwitcher.tsx  # Language selector component
```

### Rails Structure
```
config/
├── locales/
│   ├── en.yml              # English (default)
│   ├── es.yml              # Spanish
│   └── [locale].yml        # Additional locales
├── i18n.rb                 # i18n configuration
app/
├── javascript/
│   └── i18n/
│       └── translations.js # JS-accessible translations
```

## Configuration Standards

### Next.js with next-intl
```typescript
// src/i18n/config.ts
export const locales = ['en', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Locale metadata for UI
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Espanol'
};
```

### Rails Configuration
```ruby
# config/application.rb
config.i18n.default_locale = :en
config.i18n.available_locales = [:en, :es]
config.i18n.fallbacks = true
```

## Translation Key Naming Conventions

### Hierarchical Structure (Required)
```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "labels": {
      "email": "Email",
      "password": "Password"
    }
  },
  "pages": {
    "home": {
      "title": "Welcome",
      "description": "Get started with..."
    }
  },
  "components": {
    "navbar": {
      "links": {
        "home": "Home",
        "about": "About"
      }
    }
  }
}
```

### Key Naming Rules
- Use **snake_case** for all keys
- Organize by **feature/page/component**
- Keep keys **descriptive but concise**
- Never use **dynamic key interpolation** (hardcode full paths)

```typescript
// GOOD
t('pages.dashboard.welcome_message')

// BAD - Don't do this
t(`pages.${page}.title`)
```

## Component Patterns

### React Components with i18n
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function WelcomeCard() {
  const t = useTranslations('pages.home');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Server Components (Next.js App Router)
```tsx
import { getTranslations } from 'next-intl/server';

export async function HomePage() {
  const t = await getTranslations('pages.home');

  return <h1>{t('title')}</h1>;
}
```

### Rails Views
```erb
<h1><%= t('pages.home.title') %></h1>
<p><%= t('pages.home.description') %></p>
```

## Dynamic Content & Interpolation

### Variables
```json
{
  "greeting": "Hello, {name}!"
}
```
```tsx
t('greeting', { name: user.name })
```

### Pluralization
```json
{
  "items_count": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```
```tsx
t('items_count', { count: items.length })
```

### Date/Time Formatting
```tsx
import { useFormatter } from 'next-intl';

function DateDisplay({ date }) {
  const format = useFormatter();
  return <time>{format.dateTime(date, { dateStyle: 'long' })}</time>;
}
```

## RTL (Right-to-Left) Support

### Required for RTL Languages
```typescript
// src/i18n/config.ts
export const rtlLocales = ['ar', 'he', 'fa'] as const;

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as any);
}
```

### CSS Direction Handling
```css
/* Use logical properties */
.card {
  margin-inline-start: 1rem;  /* Instead of margin-left */
  padding-inline-end: 1rem;   /* Instead of padding-right */
}

[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}
```

## Alternative Perspectives

**Trade-off**: Implementing i18n from day one adds initial complexity. Some teams prefer launching with a single language and adding i18n later.

**Counter-argument**: Retrofitting i18n is significantly more expensive. Hardcoded strings spread throughout the codebase, and architectural decisions made without i18n consideration often require major refactoring.

**Recommendation**: Even if launching with one language, use the i18n infrastructure from the start. It's easier to add translations to an existing system than to add the system later.

## Migration Path for Existing Projects

If adding i18n to an existing project:

1. **Audit** all hardcoded strings
2. **Install** i18n framework
3. **Create** initial locale files
4. **Replace** strings incrementally (page by page)
5. **Add** locale switcher component
6. **Configure** URL-based routing
