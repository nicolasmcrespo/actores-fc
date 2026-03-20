# TailwindCSS Code Style Standards

## Overview
Comprehensive TailwindCSS standards focusing on utility organization, responsive design patterns, and maintainable CSS architecture using Tailwind's utility-first approach.

## Class Organization and Ordering

### Utility Class Order
```typescript
// ✅ Good - Consistent class ordering following logical groups
const Button = ({ children, variant = 'primary' }) => (
  <button
    className={cn(
      // Layout & positioning
      "relative inline-flex items-center justify-center",

      // Size & spacing
      "px-4 py-2 min-h-[44px]",

      // Typography
      "text-sm font-medium",

      // Colors & appearance
      "bg-blue-600 text-white",

      // Borders & border radius
      "border border-transparent rounded-md",

      // Effects & transforms
      "shadow-sm transition-colors duration-200",

      // Interactive states
      "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",

      // Responsive modifiers (largest to smallest)
      "lg:px-6 lg:py-3 md:px-5 md:py-2.5 sm:px-4 sm:py-2",

      // Dark mode
      "dark:bg-blue-700 dark:hover:bg-blue-800"
    )}
  >
    {children}
  </button>
)

// ❌ Bad - Random class ordering, hard to read
const Button = ({ children }) => (
  <button
    className="hover:bg-blue-700 text-white px-4 disabled:opacity-50 inline-flex bg-blue-600 py-2 rounded-md focus:ring-2 items-center border transition-colors shadow-sm font-medium text-sm justify-center relative"
  >
    {children}
  </button>
)
```

### Class Grouping with Comments
```typescript
// ✅ Good - Logical grouping for complex components
const Card = ({ children, elevated = false }) => (
  <div
    className={cn(
      // Layout
      "relative w-full",

      // Spacing
      "p-6",

      // Background & borders
      "bg-white border border-gray-200 rounded-lg",

      // Effects
      elevated ? "shadow-lg" : "shadow-sm",
      "transition-shadow duration-200",

      // Interactive states
      "hover:shadow-md",

      // Dark mode
      "dark:bg-gray-800 dark:border-gray-700"
    )}
  >
    {children}
  </div>
)
```

## Responsive Design Patterns

### Mobile-First Responsive Design
```typescript
// ✅ Good - Mobile-first responsive approach
const ResponsiveGrid = () => (
  <div
    className={cn(
      // Mobile (default): single column
      "grid grid-cols-1 gap-4 p-4",

      // Tablet: 2 columns
      "sm:grid-cols-2 sm:gap-6 sm:p-6",

      // Desktop: 3 columns
      "lg:grid-cols-3 lg:gap-8 lg:p-8",

      // Large desktop: 4 columns
      "xl:grid-cols-4"
    )}
  >
    {/* Grid items */}
  </div>
)

// ✅ Good - Responsive typography and spacing
const Hero = () => (
  <section
    className={cn(
      // Base mobile styles
      "px-4 py-12 text-center",

      // Tablet adjustments
      "sm:px-6 sm:py-16",

      // Desktop adjustments
      "lg:px-8 lg:py-24"
    )}
  >
    <h1
      className={cn(
        // Mobile typography
        "text-3xl font-bold leading-tight",

        // Tablet typography
        "sm:text-4xl sm:leading-tight",

        // Desktop typography
        "lg:text-5xl lg:leading-tight",

        // Extra large screens
        "xl:text-6xl"
      )}
    >
      Welcome to Our Platform
    </h1>
  </section>
)

// ❌ Bad - Desktop-first, inconsistent breakpoints
const BadResponsive = () => (
  <div className="lg:grid-cols-4 md:grid-cols-2 grid-cols-1 xl:gap-8 sm:gap-4 gap-2">
    {/* Content */}
  </div>
)
```

### Container and Layout Patterns
```typescript
// ✅ Good - Consistent container patterns
const PageContainer = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </div>
)

// ✅ Good - Flexbox layout patterns
const FlexLayout = () => (
  <div className="flex min-h-screen flex-col">
    {/* Header */}
    <header className="flex-shrink-0 bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          <nav className="hidden md:flex md:space-x-8">
            <NavLinks />
          </nav>
        </div>
      </div>
    </header>

    {/* Main content area */}
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page content */}
      </div>
    </main>

    {/* Footer */}
    <footer className="flex-shrink-0 bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </footer>
  </div>
)
```

## Component Variant Systems

### Class Variance Authority Integration
```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ✅ Good - Comprehensive variant system
const buttonVariants = cva(
  // Base classes that always apply
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### Complex Variant Combinations
```typescript
// ✅ Good - Advanced variant system with compound variants
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-border shadow-md",
        outlined: "border-2 border-primary",
        ghost: "border-transparent shadow-none",
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
      },
      interactive: {
        none: "",
        hover: "hover:shadow-md hover:-translate-y-0.5",
        click: "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
      },
    },
    compoundVariants: [
      {
        variant: "elevated",
        interactive: "hover",
        class: "hover:shadow-lg",
      },
      {
        variant: "outlined",
        interactive: "hover",
        class: "hover:border-primary/60",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: "none",
    },
  }
)
```

## Dark Mode and Theme Patterns

### Dark Mode Implementation
```typescript
// ✅ Good - Comprehensive dark mode support
const ThemeAwareComponent = () => (
  <div
    className={cn(
      // Light mode
      "bg-white text-gray-900 border-gray-200",

      // Dark mode
      "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800",

      // Interactive states for both themes
      "hover:bg-gray-50 dark:hover:bg-gray-800",
      "focus:ring-blue-500 dark:focus:ring-blue-400",

      // Transitions
      "transition-colors duration-200"
    )}
  >
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      Theme Aware Heading
    </h2>

    <p className="text-gray-600 dark:text-gray-400">
      This text adapts to the theme
    </p>

    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium",
        "bg-blue-600 text-white",
        "hover:bg-blue-700",
        "dark:bg-blue-700 dark:hover:bg-blue-600",
        "transition-colors duration-200"
      )}
    >
      Action Button
    </button>
  </div>
)

// ✅ Good - CSS custom properties for complex theming
const CustomThemeComponent = () => (
  <div
    className={cn(
      "bg-[var(--background)] text-[var(--foreground)]",
      "border border-[var(--border)]",
      "shadow-[var(--shadow)]"
    )}
    style={{
      '--background': 'hsl(var(--background))',
      '--foreground': 'hsl(var(--foreground))',
      '--border': 'hsl(var(--border))',
      '--shadow': 'var(--shadow-sm)',
    } as React.CSSProperties}
  >
    Content with custom theme variables
  </div>
)
```

## Animation and Transition Patterns

### Tailwind Animation Classes
```typescript
// ✅ Good - Smooth animations and transitions
const AnimatedCard = ({ isVisible, children }) => (
  <div
    className={cn(
      // Base transition
      "transition-all duration-300 ease-in-out",

      // Transform and opacity based on visibility
      isVisible
        ? "translate-y-0 opacity-100 scale-100"
        : "translate-y-4 opacity-0 scale-95",

      // Additional styling
      "bg-white rounded-lg shadow-sm border border-gray-200",
      "hover:shadow-md hover:-translate-y-1",
      "active:scale-[0.98]"
    )}
  >
    {children}
  </div>
)

// ✅ Good - Loading states with animations
const LoadingButton = ({ loading, children, ...props }) => (
  <button
    className={cn(
      "relative inline-flex items-center justify-center",
      "px-4 py-2 rounded-md font-medium",
      "bg-blue-600 text-white",
      "transition-all duration-200",
      "hover:bg-blue-700",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      loading && "cursor-wait"
    )}
    disabled={loading}
    {...props}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    )}

    <span className={cn("transition-opacity duration-200", loading && "opacity-0")}>
      {children}
    </span>
  </button>
)

// ✅ Good - Micro-interactions
const InteractiveCard = () => (
  <div
    className={cn(
      "group cursor-pointer rounded-lg border border-gray-200 bg-white p-6",
      "transition-all duration-300 ease-out",

      // Hover effects
      "hover:border-blue-300 hover:shadow-lg hover:-translate-y-1",

      // Focus effects
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",

      // Active effects
      "active:scale-[0.98] active:transition-transform active:duration-75"
    )}
    tabIndex={0}
  >
    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
      Interactive Card
    </h3>

    <p className="mt-2 text-gray-600">
      This card responds to user interactions
    </p>

    <div className="mt-4 transform translate-x-0 group-hover:translate-x-2 transition-transform duration-200">
      <ArrowRightIcon className="h-5 w-5 text-blue-500" />
    </div>
  </div>
)
```

## Alternative Perspective
**Counter-point**: Extensive use of Tailwind utilities can create very long class strings that become hard to read and maintain. Sometimes writing custom CSS or using CSS-in-JS solutions provides better organization and maintainability, especially for complex components with many states.

## Performance and Optimization

### Class Conditional Patterns
```typescript
// ✅ Good - Efficient conditional classes
const ConditionalStyling = ({ variant, size, disabled, active }) => {
  return (
    <div
      className={cn(
        // Base classes
        "rounded-md border transition-colors duration-200",

        // Variant-based classes
        {
          "bg-blue-50 border-blue-200 text-blue-900": variant === 'info',
          "bg-green-50 border-green-200 text-green-900": variant === 'success',
          "bg-red-50 border-red-200 text-red-900": variant === 'error',
          "bg-yellow-50 border-yellow-200 text-yellow-900": variant === 'warning',
        },

        // Size-based classes
        {
          "px-2 py-1 text-xs": size === 'sm',
          "px-3 py-2 text-sm": size === 'md',
          "px-4 py-3 text-base": size === 'lg',
        },

        // State-based classes
        disabled && "opacity-50 cursor-not-allowed",
        active && "ring-2 ring-blue-500 ring-offset-2"
      )}
    >
      Content
    </div>
  )
}

// ❌ Bad - Repetitive conditional logic
const BadConditionalStyling = ({ variant, size, disabled, active }) => {
  let className = "rounded-md border transition-colors duration-200"

  if (variant === 'info') {
    className += " bg-blue-50 border-blue-200 text-blue-900"
  } else if (variant === 'success') {
    className += " bg-green-50 border-green-200 text-green-900"
  }
  // ... more repetitive logic

  return <div className={className}>Content</div>
}
```

### Utility Organization for Maintainability
```typescript
// ✅ Good - Extract complex styling to utility functions
const getStatusStyles = (status: 'active' | 'inactive' | 'pending') => {
  const statusMap = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  }

  return statusMap[status] || statusMap.inactive
}

const getBadgeStyles = (size: 'sm' | 'md' | 'lg') => {
  const sizeMap = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  }

  return sizeMap[size] || sizeMap.md
}

const StatusBadge = ({ status, size = 'md', className, ...props }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border font-medium",
      getBadgeStyles(size),
      getStatusStyles(status),
      className
    )}
    {...props}
  >
    {status}
  </span>
)
```

### Custom CSS Integration
```typescript
// ✅ Good - When to use custom CSS with Tailwind
// styles/components.css
.glass-effect {
  @apply backdrop-blur-sm bg-white/10 border border-white/20;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.text-gradient {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
}

// Component usage
const GlassMorphismCard = ({ children }) => (
  <div className="glass-effect rounded-xl p-6 shadow-xl">
    <h2 className="text-gradient text-2xl font-bold mb-4">
      Glass Effect Card
    </h2>
    {children}
  </div>
)

// ✅ Good - Complex animations that need keyframes
// styles/animations.css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

// Component usage
const FloatingElement = () => (
  <div className="animate-float rounded-full bg-blue-500 w-16 h-16" />
)
```

## Alternative Perspective
**Counter-point**: Complex class organization and utility extraction can sometimes make Tailwind code as verbose as traditional CSS, defeating the purpose of utility-first CSS. Sometimes accepting longer class strings in exchange for better locality of behavior leads to more maintainable components.

## Testing and Development Patterns

### Class Testing Utilities
```typescript
// ✅ Good - Testing utility class application
import { render, screen } from '@testing-library/react'
import { cn } from '@/lib/utils'

describe('Button Component', () => {
  test('applies correct variant classes', () => {
    render(<Button variant="destructive" data-testid="button">Delete</Button>)

    const button = screen.getByTestId('button')
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('text-destructive-foreground')
    expect(button).toHaveClass('hover:bg-destructive/90')
  })

  test('combines custom classes with variant classes', () => {
    render(
      <Button
        variant="outline"
        className="custom-class"
        data-testid="button"
      >
        Custom Button
      </Button>
    )

    const button = screen.getByTestId('button')
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('bg-background')
    expect(button).toHaveClass('custom-class')
  })
})
```

This TailwindCSS code style standard ensures consistent, maintainable, and performant utility-first CSS development while leveraging Tailwind's full potential for responsive design, theming, and component variants.