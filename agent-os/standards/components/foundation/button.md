# Button Component Standards

## Overview
Foundation standards for button components across all UI frameworks (React, Vue, etc.). These patterns ensure consistency, accessibility, and reusability.

## Core Button Interface

### Required Props
```typescript
interface ButtonProps {
  // Visual variants
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg'

  // States
  disabled?: boolean
  loading?: boolean

  // Content & behavior
  children: React.ReactNode
  onClick?: (event: React.MouseEvent) => void

  // Flexibility
  className?: string
  type?: 'button' | 'submit' | 'reset'
}
```

## Alternative Perspective
**Counter-point**: Too many variants can lead to decision paralysis for developers. Sometimes 2-3 well-designed variants are better than 5+ options that overlap in purpose.

## Visual Variants (Required)

### Primary Button
```css
/* Purpose: Main call-to-action */
.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--primary));
}

.btn-primary:hover {
  background: hsl(var(--primary) / 0.9);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Secondary Button
```css
/* Purpose: Secondary actions, less emphasis */
.btn-secondary {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--secondary));
}
```

### Ghost Button
```css
/* Purpose: Subtle actions, minimal visual weight */
.btn-ghost {
  background: transparent;
  color: hsl(var(--foreground));
  border: none;
}

.btn-ghost:hover {
  background: hsl(var(--accent));
}
```

## Size Variants (Required)

### Size System
```css
.btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
}

.btn-md {
  height: 40px;
  padding: 0 16px;
  font-size: 16px;
}

.btn-lg {
  height: 48px;
  padding: 0 24px;
  font-size: 18px;
}
```

## Implementation Examples

### React Implementation
```typescript
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
```

## Accessibility Standards (Required)

### ARIA and Semantic HTML
```typescript
// ✅ Good - Proper accessibility
<Button
  type="submit"
  disabled={isSubmitting}
  aria-describedby="submit-help"
>
  {isSubmitting ? 'Submitting...' : 'Submit Form'}
</Button>

// Loading state with proper ARIA
<Button loading aria-label="Saving changes">
  Save
</Button>
```

### Focus Management
```css
.btn:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Touch Targets
```css
/* Minimum 44x44px for mobile touch targets */
.btn {
  min-height: 44px;
  min-width: 44px;
}
```

## Testing Standards

### Required Test Cases
```typescript
describe('Button Component', () => {
  test('renders with correct variant classes', () => {
    render(<Button variant="secondary">Test</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')
  })

  test('handles loading state', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label')
  })

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is accessible via keyboard', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## Component Reusability Score Targets

### Scoring Criteria
- **Props Flexibility**: 20/25 (multiple variants, sizes, states)
- **Type Safety**: 25/25 (full TypeScript with proper generics)
- **Composition**: 15/25 (children support, some flexibility)
- **Documentation**: 20/25 (JSDoc, examples, tests)

**Target Score**: 80/100 (High-quality foundation component)

## Alternative Perspective
**Counter-point**: This level of abstraction might be overkill for simple projects. Sometimes a basic `<button className="...">` is sufficient and more straightforward than a complex variant system.

## Usage Guidelines

### When to Use This Pattern
- ✅ Design system components
- ✅ Shared UI library
- ✅ Multi-brand applications
- ❌ Simple prototypes
- ❌ One-off buttons with unique styles

### Customization Approach
```typescript
// ✅ Good - Extend existing variants
const IconButton = ({ icon, ...props }: ButtonProps & { icon: React.ReactNode }) => (
  <Button {...props} className={cn("gap-2", props.className)}>
    {icon}
    {props.children}
  </Button>
)

// ❌ Bad - Override core styles
<Button className="bg-red-500 hover:bg-red-600">  // Breaks variant system
```

This button standard ensures consistency across your entire application while maintaining flexibility for different use cases.