# Tailwind CSS Utilities Standards

## Class Ordering Convention (Required)

### Consistent Order for Readability
```html
<!-- ✅ Good - Logical order -->
<div className="
  relative           /* Layout */
  flex flex-col      /* Flexbox */
  w-full h-64       /* Sizing */
  p-4 mx-auto       /* Spacing */
  bg-white          /* Background */
  border border-gray-200  /* Border */
  rounded-lg        /* Border radius */
  shadow-md         /* Effects */
  hover:shadow-lg   /* Hover states */
  dark:bg-gray-900  /* Dark mode */
">

<!-- ❌ Bad - Random order -->
<div className="shadow-md bg-white relative p-4 flex w-full rounded-lg border hover:shadow-lg">
```

### Recommended Order Categories
1. **Layout**: `relative`, `absolute`, `flex`, `grid`, `block`, `inline`
2. **Sizing**: `w-*`, `h-*`, `min-w-*`, `max-w-*`
3. **Spacing**: `p-*`, `m-*`, `gap-*`
4. **Colors**: `bg-*`, `text-*`
5. **Borders**: `border-*`, `rounded-*`
6. **Effects**: `shadow-*`, `opacity-*`
7. **Interactions**: `hover:*`, `focus:*`, `active:*`
8. **Responsive**: `sm:*`, `md:*`, `lg:*`
9. **Dark mode**: `dark:*`

## Alternative Perspective
**Counter-point**: Strict ordering rules can slow development and create bike-shedding discussions. Some teams prefer using Prettier plugins for automatic sorting instead of manual enforcement.

## Custom Utilities (Minimal Approach)

### Acceptable Custom Utilities
```css
/* Only create when Tailwind lacks the utility */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .text-balance {
    text-wrap: balance; /* Not in core Tailwind yet */
  }

  .mask-gradient {
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  }
}
```

### ❌ Avoid Custom CSS for Existing Utilities
```css
/* ❌ Bad - Tailwind already has these */
.custom-flex {
  display: flex; /* Use flex instead */
}

.my-padding {
  padding: 1rem; /* Use p-4 instead */
}
```

## @apply Usage Rules

### Safe @apply Patterns
```css
/* ✅ Good - Component-specific patterns */
.btn-primary {
  @apply inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90;
}

/* ✅ Good - Complex repeated patterns */
.card-base {
  @apply rounded-lg border bg-card p-6 text-card-foreground shadow-sm;
}
```

### ❌ Avoid @apply for Simple Cases
```css
/* ❌ Bad - Just use the class directly */
.text-center-class {
  @apply text-center; /* Just use text-center in HTML */
}

.red-text {
  @apply text-red-500; /* Use text-red-500 directly */
}
```

## Arbitrary Value Usage

### When to Use Arbitrary Values
```html
<!-- ✅ Good - Unique design values -->
<div className="bg-[#bada55]">        <!-- Brand color not in palette -->
<div className="text-[22px]">         <!-- Specific font size needed -->
<div className="grid-cols-[1fr_300px]"> <!-- Custom grid template -->
```

### ❌ Avoid for Standard Values
```html
<!-- ❌ Bad - Use standard utilities -->
<div className="w-[16px]">  <!-- Use w-4 -->
<div className="p-[8px]">   <!-- Use p-2 -->
<div className="text-[16px]"> <!-- Use text-base -->
```

## Alternative Perspective
**Counter-point**: Arbitrary values can be easier for designers who think in exact pixels. Some teams find them more readable than memorizing the scale system.

## Component Class Patterns

### Compound Classes for Reusability
```typescript
// ✅ Good - Class name utilities
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
)
```

## Performance Guidelines

### Optimize for PurgeCSS
```html
<!-- ✅ Good - Static classes that won't be purged -->
<div className={`text-${color}-500`}>  <!-- ❌ Dynamic, might be purged -->
<div className={color === 'red' ? 'text-red-500' : 'text-blue-500'}> <!-- ✅ Good -->
```

### Keep Safelist Updated
```javascript
// In tailwind.config.js
module.exports = {
  content: {
    files: ["./src/**/*.{js,jsx,ts,tsx}"],
    options: {
      safelist: [
        'text-red-500',    // Dynamic colors
        'text-blue-500',
        'bg-red-500',
        'bg-blue-500',
      ]
    }
  }
}
```

## Accessibility Utilities

### Always Include Focus States
```html
<!-- ✅ Good - Focus visible -->
<button className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
  Click me
</button>

<!-- ❌ Bad - No focus indicators -->
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click me
</button>
```

### Screen Reader Utilities
```html
<!-- ✅ Good - Screen reader considerations -->
<button>
  <span className="sr-only">Close dialog</span>
  <svg className="w-4 h-4">...</svg>
</button>
```

## Alternative Perspective
**Counter-point**: Over-focusing on Tailwind optimization can make code less readable. Sometimes a bit of redundancy is worth it for developer understanding.