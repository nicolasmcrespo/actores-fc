# i18n Best Practices

## Core Principles

### 1. Never Hardcode User-Facing Text
Every string visible to users MUST use the translation system.

```tsx
// BAD
<button>Submit</button>

// GOOD
<button>{t('common.actions.submit')}</button>
```

### 2. Separate Content from Code
Translation files are content, not code. Keep them clean and organized.

```json
// BAD - mixing concerns
{
  "button_style_primary_submit": "Submit"
}

// GOOD - content-focused
{
  "actions": {
    "submit": "Submit"
  }
}
```

### 3. Context-Aware Keys
Include context in key names when the same word has different meanings.

```json
{
  "common": {
    "post_verb": "Post",
    "post_noun": "Post"
  }
}
```

## String Extraction Rules

### What MUST Be Translated
- Button labels and CTAs
- Form labels and placeholders
- Error messages and validations
- Success/info notifications
- Page titles and headings
- Navigation items
- Modal content
- Tooltips and help text
- Alt text for images
- Meta descriptions and SEO content

### What Should NOT Be Translated
- Brand names (unless regional variants exist)
- Technical identifiers
- Code/API values
- URLs and paths
- Log messages (keep in English for debugging)

## Translation-Friendly Copywriting

### Avoid Concatenation
String fragments don't translate well across languages.

```typescript
// BAD - word order varies by language
t('hello') + ' ' + name + ' ' + t('welcome')

// GOOD - full sentence with interpolation
t('greeting_message', { name })
// "greeting_message": "Hello {name}, welcome!"
```

### Handle Pluralization Properly
Use ICU MessageFormat syntax for plurals.

```json
{
  "items": "{count, plural, =0 {No items} one {# item} other {# items}}",
  "days_ago": "{days, plural, =0 {Today} one {Yesterday} other {# days ago}}"
}
```

### Account for Text Expansion
Translations often require more space than English:
- German: +30%
- French: +20%
- Spanish: +25%

Design UI with flexible containers that can accommodate longer text.

## File Organization

### One File Per Locale (Small Projects)
```
messages/
├── en.json
├── es.json
└── fr.json
```

### Namespace Split (Large Projects)
```
messages/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   └── settings.json
├── es/
│   └── ...
```

### Feature-Based Organization
Group translations by feature for easier maintenance:

```json
{
  "auth": {
    "login": { ... },
    "register": { ... },
    "forgot_password": { ... }
  },
  "dashboard": {
    "overview": { ... },
    "analytics": { ... }
  }
}
```

## Locale Detection Strategy

### Priority Order
1. User preference (stored in profile/cookie)
2. URL parameter/path (`/es/about`)
3. Accept-Language header
4. Geolocation (optional)
5. Default locale fallback

### URL Strategies
```
# Path-based (Recommended)
example.com/en/about
example.com/es/about

# Subdomain-based
en.example.com/about
es.example.com/about

# Query parameter (Not recommended)
example.com/about?lang=es
```

## Error Handling

### Missing Translation Fallbacks
```typescript
// Configure fallback chain
const i18nConfig = {
  fallbackLocale: 'en',
  missingKeyHandler: (key, locale) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation: ${key} [${locale}]`);
    }
    return key; // Show key as fallback
  }
};
```

### Development Warnings
In development, always log missing translations to catch them early.

## Performance Optimization

### Lazy Load Locales
Only load the active locale, not all translations.

```typescript
// Next.js with next-intl
export async function getMessages(locale: string) {
  return (await import(`../messages/${locale}.json`)).default;
}
```

### Static Generation
Pre-render pages for each locale at build time:

```typescript
// Next.js
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

## Translation Workflow

### Developer Responsibilities
1. Use translation keys (never hardcode)
2. Add new keys to default locale file
3. Provide context comments for translators
4. Mark strings that need translation

### Translation Management
```json
{
  "_meta": {
    "needs_review": ["new_feature.title", "new_feature.description"]
  },
  "new_feature": {
    "title": "New Feature",
    "_comment_title": "Main heading for the new feature page"
  }
}
```

## Accessibility Considerations

### Language Attribute
Always set the `lang` attribute on the HTML element:

```tsx
<html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
```

### Screen Reader Announcements
Translate ARIA labels and screen reader text:

```tsx
<button aria-label={t('common.aria.close_modal')}>
  <XIcon />
</button>
```

## Alternative Perspectives

**Argument for simpler approach**: For MVPs targeting a single market, full i18n might be overkill. Consider using a simple key-value store that can be upgraded later.

**Counter-argument**: The cost of implementing i18n properly from day one is minimal compared to retrofitting. Even single-market apps benefit from centralized string management for consistency and future updates.

**Middle ground**: Use the i18n infrastructure but start with only one locale file. This gives you the architecture without the translation overhead.
