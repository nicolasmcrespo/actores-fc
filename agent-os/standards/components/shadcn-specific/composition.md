# shadcn/ui Component Composition Standards

## Context

Guidelines for composing and extending shadcn/ui components while maintaining design system consistency.

## Composition Principles

### Component Extension
- Extend shadcn components through composition, not modification
- Use className merging for style customization
- Preserve original component APIs
- Maintain TypeScript interfaces

### Variant Management
```tsx
// Good: Extend existing variants
const buttonVariants = cva(
  // ... existing shadcn button variants
  {
    variants: {
      variant: {
        ...defaultButtonVariants.variants.variant,
        gradient: "bg-gradient-to-r from-blue-500 to-purple-600",
      }
    }
  }
)

// Bad: Overwriting shadcn variants completely
const buttonVariants = cva("completely-new-styles")
```

### Compound Components
Create related component families that work together:

```tsx
// Card composition following shadcn patterns
const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
}

// Usage maintains shadcn's composition API
<Card.Root>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
</Card.Root>
```

## Custom Component Guidelines

### Wrapper Components
When creating wrappers around shadcn components:

```tsx
// Good: Transparent wrapper preserving all props
interface CustomInputProps extends ComponentProps<typeof Input> {
  label?: string
  error?: string
}

const CustomInput = ({ label, error, className, ...props }: CustomInputProps) => {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <Input
        className={cn(error && "border-red-500", className)}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
```

### Form Components
Maintain shadcn's form integration patterns:

```tsx
// Good: Integrates with shadcn form patterns
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <CustomInput {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Design System Consistency

### Color Usage
- Use CSS variables from shadcn's color system
- Reference colors as `hsl(var(--primary))` not hardcoded values
- Maintain dark mode compatibility
- Follow shadcn's semantic color naming

### Spacing & Sizing
- Use shadcn's spacing scale (Tailwind defaults)
- Maintain consistent sizing with existing components
- Follow established responsive patterns
- Use same border radius values

### Animation & Transitions
- Use shadcn's animation utilities
- Maintain consistent timing functions
- Preserve reduced-motion preferences
- Follow established animation patterns

## Integration Patterns

### State Management
```tsx
// Good: Follows shadcn controlled/uncontrolled patterns
interface ToggleGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

// Maintains shadcn's state patterns
const [value, setValue] = useState(defaultValue)
const controlled = value !== undefined
```

### Ref Forwarding
```tsx
// Good: Proper ref forwarding like shadcn components
const CustomButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn("custom-styles", className)}
      {...props}
    />
  )
})
CustomButton.displayName = "CustomButton"
```

## Testing Composite Components

### Component Testing
- Test composition behavior, not internal shadcn logic
- Verify custom props are handled correctly
- Test accessibility of composed elements
- Validate TypeScript interfaces

### Integration Testing
- Test with shadcn form components
- Verify theme system integration
- Test responsive behavior
- Validate dark mode compatibility

## Anti-Patterns

### Avoid These Patterns
```tsx
// Bad: Modifying shadcn component internals
const BadButton = ({ children }) => {
  return <button className="completely-custom">{children}</button>
}

// Bad: Breaking shadcn's composition patterns
const BadCard = ({ title, content }) => {
  return <div>{title}{content}</div> // No flexibility
}

// Bad: Hardcoded values instead of theme tokens
const BadInput = styled.input`
  border: 1px solid #e5e7eb; // Should use theme colors
`
```

### Component Naming
- Prefix custom components to avoid conflicts
- Use descriptive names that indicate purpose
- Maintain shadcn's naming conventions for similar patterns
- Document component purpose and usage