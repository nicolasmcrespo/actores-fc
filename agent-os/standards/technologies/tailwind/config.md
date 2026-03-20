# Tailwind CSS Configuration Standards

## tailwind.config.js Standards

### Base Configuration
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", // Include all component paths
  ],
  darkMode: "class", // Always use class-based dark mode
  theme: {
    extend: {
      // Custom design system values
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // For smooth animations
  ],
}
```

## Alternative Perspective
**Counter-argument**: CSS variables approach adds complexity. Some teams prefer hardcoded values for simplicity and better IDE autocomplete. However, CSS variables enable runtime theme switching.

### Typography Scale (Required)
```javascript
// Add to theme.extend
fontSize: {
  'xs': ['12px', { lineHeight: '16px' }],
  'sm': ['14px', { lineHeight: '20px' }],
  'base': ['16px', { lineHeight: '24px' }],
  'lg': ['18px', { lineHeight: '28px' }],
  'xl': ['20px', { lineHeight: '28px' }],
  '2xl': ['24px', { lineHeight: '32px' }],
  '3xl': ['30px', { lineHeight: '36px' }],
  '4xl': ['36px', { lineHeight: '40px' }],
}
```

### Spacing System
```javascript
// Add to theme.extend
spacing: {
  '18': '4.5rem',
  '88': '22rem',
  '128': '32rem',
}
```

### Custom Utilities (Minimal)
```javascript
// Add to plugins array
function({ addUtilities }) {
  addUtilities({
    '.scrollbar-hide': {
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }
  })
}
```

## CSS Variables Integration
```css
/* globals.css - Required for theme switching */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}
```

## JIT Mode Optimization
```javascript
// Always use JIT (enabled by default in v3+)
module.exports = {
  mode: 'jit', // Explicit for older versions
  // Purge optimization
  content: {
    files: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    options: {
      safelist: [
        'dark', // Preserve dark mode classes
        /^bg-/, // Preserve background utilities
      ]
    }
  }
}
```

## Performance Configuration
```javascript
module.exports = {
  experimental: {
    optimizeUniversalDefaults: true, // Faster builds
  },
  corePlugins: {
    preflight: true, // Keep CSS reset
    container: false, // Disable if not using
  }
}
```

## Alternative Perspective
**Counter-point**: Heavy customization can make it harder to use Tailwind documentation and community resources. Sometimes staying closer to defaults is better for team productivity.