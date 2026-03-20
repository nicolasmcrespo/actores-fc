# shadcn/ui Performance Standards

## Context

Performance optimization guidelines for shadcn/ui components to ensure fast, responsive applications.

## Bundle Size Optimization

### Selective Imports
```tsx
// Good: Import only needed components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Bad: Importing entire library
import * as UI from "@/components/ui"
```

### Component Lazy Loading
```tsx
// Good: Lazy load heavy components
const DataTable = lazy(() => import("@/components/ui/data-table"))
const Chart = lazy(() => import("@/components/ui/chart"))

// Use with Suspense
<Suspense fallback={<Skeleton />}>
  <DataTable data={data} />
</Suspense>
```

### Tree Shaking
- Ensure components are properly tree-shakeable
- Avoid default exports for component collections
- Use named exports for individual components
- Keep component dependencies minimal

## Runtime Performance

### Memoization Strategies
```tsx
// Good: Memoize expensive computations
const processedData = useMemo(() => {
  return heavyDataProcessing(data)
}, [data])

// Good: Memoize component props
const MemoizedTable = memo(({ data, columns }) => {
  return <DataTable data={data} columns={columns} />
})
```

### Event Handler Optimization
```tsx
// Good: Stable callback references
const handleSubmit = useCallback((data: FormData) => {
  onSubmit(data)
}, [onSubmit])

// Good: Debounced input handlers
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    onSearch(value)
  }, 300),
  [onSearch]
)
```

### State Management
```tsx
// Good: Optimize state updates
const [formState, setFormState] = useState(initialState)

// Use functional updates for complex state
setFormState(prev => ({
  ...prev,
  [field]: value
}))

// Good: Separate frequently changing state
const [isLoading, setIsLoading] = useState(false)
const [data, setData] = useState(null)
```

## Rendering Optimization

### Virtual Scrolling
For large lists using shadcn components:

```tsx
// Good: Virtual scrolling for large datasets
import { FixedSizeList as List } from 'react-window'

const VirtualizedTable = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TableRow>
        <TableCell>{items[index].name}</TableCell>
      </TableRow>
    </div>
  )

  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {Row}
    </List>
  )
}
```

### Image Optimization
```tsx
// Good: Optimized images with shadcn Avatar
<Avatar>
  <AvatarImage
    src={optimizedImageUrl}
    alt={alt}
    loading="lazy"
    decoding="async"
  />
  <AvatarFallback>{fallback}</AvatarFallback>
</Avatar>
```

### Skeleton Loading
```tsx
// Good: Meaningful loading states
const ProductSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-32 w-full" />
    </CardContent>
  </Card>
)
```

## Animation Performance

### CSS-based Animations
Prefer CSS animations over JavaScript for shadcn components:

```tsx
// Good: CSS transitions for smooth animations
const slideIn = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.2, ease: "easeOut" }
}

// Use with shadcn components
<motion.div {...slideIn}>
  <Card>Content</Card>
</motion.div>
```

### Transform Optimizations
```css
/* Good: Use transform for animations */
.slide-enter {
  transform: translateX(-100%);
  transition: transform 200ms ease-out;
}

.slide-enter-active {
  transform: translateX(0);
}
```

## Form Performance

### Field-level Validation
```tsx
// Good: Optimize form validation
const FormField = ({ name, validate }) => {
  const [error, setError] = useState("")

  const debouncedValidate = useMemo(
    () => debounce(async (value) => {
      const result = await validate(value)
      setError(result.error || "")
    }, 300),
    [validate]
  )

  return (
    <FormItem>
      <FormControl>
        <Input
          onChange={(e) => debouncedValidate(e.target.value)}
          aria-invalid={!!error}
        />
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  )
}
```

### Form State Optimization
```tsx
// Good: Minimize re-renders
const useFormField = (name) => {
  const form = useFormContext()
  const fieldState = form.getFieldState(name)

  return {
    value: form.getValues(name),
    onChange: form.setValue.bind(null, name),
    error: fieldState.error?.message,
    isDirty: fieldState.isDirty
  }
}
```

## Monitoring & Metrics

### Performance Budgets
- Set bundle size limits for component collections
- Monitor Core Web Vitals for pages with heavy shadcn usage
- Track rendering times for complex forms/tables
- Measure interaction responsiveness

### Profiling Tools
```tsx
// Good: Wrap expensive components for profiling
const ProfiledDataTable = React.memo(
  ({ data, columns }) => (
    <DataTable data={data} columns={columns} />
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.data.length === nextProps.data.length &&
      JSON.stringify(prevProps.columns) === JSON.stringify(nextProps.columns)
    )
  }
)
```

### Error Boundaries
```tsx
// Good: Error boundaries for component stability
const ComponentErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <Alert variant="destructive">
          <AlertDescription>
            Something went wrong loading this component.
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Performance Checklist

Before shipping shadcn components:
- [ ] Bundle size impact analyzed
- [ ] Critical rendering path optimized
- [ ] Unnecessary re-renders eliminated
- [ ] Event handlers properly memoized
- [ ] Large lists virtualized when needed
- [ ] Images and assets optimized
- [ ] Animation performance validated
- [ ] Error boundaries implemented
- [ ] Performance metrics tracked