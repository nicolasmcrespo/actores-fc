# i18n Testing Standards

## Test Categories

### 1. Translation Completeness Tests
Verify all keys exist across all locales.

```typescript
// __tests__/i18n/completeness.test.ts
import en from '@/messages/en.json';
import es from '@/messages/es.json';

describe('Translation Completeness', () => {
  const getKeys = (obj: object, prefix = ''): string[] => {
    return Object.entries(obj).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return getKeys(value, path);
      }
      return [path];
    });
  };

  const enKeys = getKeys(en);
  const esKeys = getKeys(es);

  test('Spanish has all English keys', () => {
    const missingInEs = enKeys.filter(key => !esKeys.includes(key));
    expect(missingInEs).toEqual([]);
  });

  test('No orphan Spanish keys', () => {
    const orphanInEs = esKeys.filter(key => !enKeys.includes(key));
    expect(orphanInEs).toEqual([]);
  });
});
```

### 2. No Hardcoded Strings Tests
Detect hardcoded user-facing text in components.

```typescript
// __tests__/i18n/no-hardcoded.test.ts
import { render } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

// Patterns that indicate hardcoded strings
const HARDCODED_PATTERNS = [
  />\s*[A-Z][a-z]+\s+[a-z]+\s*</,  // Multi-word text in JSX
  /placeholder=["'][A-Z]/,          // Hardcoded placeholders
  /aria-label=["'][A-Z]/,           // Hardcoded ARIA labels
];

describe('No Hardcoded Strings', () => {
  const componentsDir = path.join(__dirname, '../../src/components');

  const getComponentFiles = (dir: string): string[] => {
    // Recursively find all .tsx files
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(dirent => {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) return getComponentFiles(fullPath);
      if (dirent.name.endsWith('.tsx')) return [fullPath];
      return [];
    });
  };

  getComponentFiles(componentsDir).forEach(file => {
    test(`${path.basename(file)} has no hardcoded strings`, () => {
      const content = fs.readFileSync(file, 'utf-8');
      HARDCODED_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          // Allow known exceptions
          const isException = matches.some(m =>
            m.includes('Loading') || // Allowed loading states
            m.includes('Error')      // Allowed for dev
          );
          if (!isException) {
            expect(matches).toBeNull();
          }
        }
      });
    });
  });
});
```

### 3. Translation Key Usage Tests
Ensure all defined keys are actually used.

```typescript
// __tests__/i18n/key-usage.test.ts
import en from '@/messages/en.json';
import { execSync } from 'child_process';

describe('Translation Key Usage', () => {
  const getKeys = (obj: object, prefix = ''): string[] => {
    return Object.entries(obj).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return getKeys(value, path);
      }
      return [path];
    });
  };

  test('All translation keys are used in codebase', () => {
    const keys = getKeys(en);
    const unusedKeys: string[] = [];

    keys.forEach(key => {
      // Search for key usage in source files
      try {
        execSync(`grep -r "${key}" src/ --include="*.tsx" --include="*.ts"`, {
          encoding: 'utf-8'
        });
      } catch {
        unusedKeys.push(key);
      }
    });

    // Allow some common keys that might be dynamically used
    const allowedUnused = ['_meta', '_comment'];
    const actualUnused = unusedKeys.filter(k =>
      !allowedUnused.some(allowed => k.includes(allowed))
    );

    expect(actualUnused).toEqual([]);
  });
});
```

### 4. Interpolation Tests
Verify variables are correctly interpolated.

```typescript
// __tests__/i18n/interpolation.test.ts
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { WelcomeMessage } from '@/components/WelcomeMessage';

const messages = {
  welcome: {
    greeting: 'Hello, {name}!',
    items: '{count, plural, =0 {No items} one {# item} other {# items}}'
  }
};

describe('Translation Interpolation', () => {
  const renderWithI18n = (component: React.ReactNode) => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {component}
      </NextIntlClientProvider>
    );
  };

  test('interpolates name variable', () => {
    renderWithI18n(<WelcomeMessage name="John" />);
    expect(screen.getByText('Hello, John!')).toBeInTheDocument();
  });

  test('handles plural zero', () => {
    renderWithI18n(<ItemCount count={0} />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  test('handles plural one', () => {
    renderWithI18n(<ItemCount count={1} />);
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  test('handles plural many', () => {
    renderWithI18n(<ItemCount count={5} />);
    expect(screen.getByText('5 items')).toBeInTheDocument();
  });
});
```

### 5. Locale Switching Tests
Verify locale changes work correctly.

```typescript
// __tests__/i18n/locale-switching.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

describe('Locale Switching', () => {
  test('switches from English to Spanish', async () => {
    render(<LocaleSwitcher />);

    // Find and click Spanish option
    const switcher = screen.getByRole('combobox');
    fireEvent.change(switcher, { target: { value: 'es' } });

    // Verify locale cookie/URL updated
    expect(document.cookie).toContain('NEXT_LOCALE=es');
  });
});
```

### 6. RTL Layout Tests
Verify RTL languages render correctly.

```typescript
// __tests__/i18n/rtl.test.ts
import { render } from '@testing-library/react';
import { RootLayout } from '@/app/layout';

describe('RTL Support', () => {
  test('applies RTL direction for Arabic', () => {
    const { container } = render(
      <RootLayout locale="ar">
        <div>Content</div>
      </RootLayout>
    );

    const html = container.closest('html');
    expect(html).toHaveAttribute('dir', 'rtl');
    expect(html).toHaveAttribute('lang', 'ar');
  });

  test('applies LTR direction for English', () => {
    const { container } = render(
      <RootLayout locale="en">
        <div>Content</div>
      </RootLayout>
    );

    const html = container.closest('html');
    expect(html).toHaveAttribute('dir', 'ltr');
  });
});
```

## CI/CD Integration

### Pre-commit Hook
```bash
#!/bin/bash
# .husky/pre-commit

# Run i18n completeness check
npm run test:i18n:completeness

# Check for hardcoded strings in staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx|ts)$')
if [ -n "$STAGED_FILES" ]; then
  npm run test:i18n:no-hardcoded -- $STAGED_FILES
fi
```

### GitHub Actions
```yaml
# .github/workflows/i18n-check.yml
name: i18n Validation

on:
  pull_request:
    paths:
      - 'src/**/*.tsx'
      - 'src/**/*.ts'
      - 'messages/**/*.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - name: Translation Completeness
        run: npm run test:i18n:completeness

      - name: No Hardcoded Strings
        run: npm run test:i18n:no-hardcoded

      - name: Key Usage Check
        run: npm run test:i18n:key-usage
```

## Package.json Scripts

```json
{
  "scripts": {
    "test:i18n": "npm run test:i18n:completeness && npm run test:i18n:no-hardcoded",
    "test:i18n:completeness": "jest __tests__/i18n/completeness.test.ts",
    "test:i18n:no-hardcoded": "jest __tests__/i18n/no-hardcoded.test.ts",
    "test:i18n:key-usage": "jest __tests__/i18n/key-usage.test.ts",
    "i18n:extract": "i18next-scanner",
    "i18n:validate": "npm run test:i18n"
  }
}
```

## Visual Regression Testing

For projects using Playwright:

```typescript
// e2e/i18n-visual.spec.ts
import { test, expect } from '@playwright/test';

const locales = ['en', 'es'];
const pages = ['/', '/about', '/contact'];

locales.forEach(locale => {
  pages.forEach(page => {
    test(`${page} renders correctly in ${locale}`, async ({ page: pw }) => {
      await pw.goto(`/${locale}${page}`);
      await expect(pw).toHaveScreenshot(`${locale}${page.replace('/', '-')}.png`);
    });
  });
});
```

## Alternative Perspectives

**Argument against extensive i18n testing**: Testing translations adds overhead and can slow down development. Some teams prefer manual QA for translation quality.

**Counter-argument**: Automated i18n tests catch common issues early (missing keys, broken interpolation) that would otherwise reach production. The initial setup cost pays off in reduced bugs and faster development.

**Middle ground**: Start with completeness tests (low effort, high value) and add more sophisticated tests as the project grows.
