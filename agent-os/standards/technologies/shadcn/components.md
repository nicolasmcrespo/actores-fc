# shadcn/ui Components Standards

## Installation and Setup

### Initial Setup
```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest init

# Configure components.json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Component Installation Philosophy
```bash
# ✅ Good - Install components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog

# ❌ Avoid - Don't install everything upfront
npx shadcn-ui@latest add --all  # Too many unused components
```

## Alternative Perspective
**Counter-point**: Installing all components upfront can reduce decision fatigue and ensure consistency. Some teams prefer the "batteries included" approach for faster development.

## Customization Standards

### Theme Customization (CSS Variables)
```css
/* globals.css - Required setup */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode values */
  }
}
```

### Component Modification Guidelines
```typescript
// ✅ Good - Extend existing components
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode
  iconPosition?: "left" | "right"
}

export function IconButton({
  icon,
  iconPosition = "left",
  children,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      className={cn("gap-2", className)}
      {...props}
    >
      {iconPosition === "left" && icon}
      {children}
      {iconPosition === "right" && icon}
    </Button>
  )
}
```

### ❌ Avoid Direct Component File Modification
```typescript
// ❌ Bad - Don't modify shadcn component files directly
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Don't add custom variants here - extend instead
        custom: "bg-brand text-white" // ❌ Bad
      }
    }
  }
)
```

## Component Usage Patterns

### Form Components Integration
```typescript
// ✅ Good - Proper form integration
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Dialog/Modal Patterns
```typescript
// ✅ Good - Proper dialog composition
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function UserSettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Settings</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  )
}
```

## Alternative Perspective
**Counter-point**: shadcn's form patterns are quite verbose. Some teams prefer simpler form libraries even if they lose the design system integration.

## Data Table Patterns
```typescript
// ✅ Good - Comprehensive data table setup
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
}

interface DataTableProps {
  data: User[]
}

export function UserDataTable({ data }: DataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

## Accessibility Preservation
```typescript
// ✅ Good - Maintain accessibility when extending
export function CustomButton({
  children,
  loading = false,
  ...props
}: ButtonProps & { loading?: boolean }) {
  return (
    <Button
      {...props}
      disabled={loading || props.disabled}
      aria-disabled={loading || props.disabled}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          aria-hidden="true" // Don't let screen readers read this
        >
          {/* Spinner SVG */}
        </svg>
      )}
      {children}
    </Button>
  )
}
```

## Component Composition Patterns

### Compound Components
```typescript
// ✅ Good - Building complex components from shadcn primitives
export function StatCard({
  title,
  value,
  change,
  children
}: {
  title: string
  value: string
  change?: { value: number; type: "increase" | "decrease" }
  children?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {children}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            {change.type === "increase" ? "+" : ""}{change.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

## Performance Considerations

### Code Splitting shadcn Components
```typescript
// ✅ Good - Lazy load heavy components
import { lazy, Suspense } from "react"

const DataTable = lazy(() => import("@/components/ui/data-table"))
const Chart = lazy(() => import("@/components/ui/chart"))

export function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading table...</div>}>
        <DataTable />
      </Suspense>
    </div>
  )
}
```

## Alternative Perspective
**Counter-point**: Lazy loading UI components can create jarring experiences. Sometimes it's better to bundle critical UI components together for smoother interactions.