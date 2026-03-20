# shadcn/ui Code Style Standards

## Overview
Comprehensive standards for using shadcn/ui components effectively, focusing on customization patterns, component composition, and maintaining design system consistency.

## Component Installation and Setup

### Initial Setup Patterns
```bash
# ✅ Good - Install shadcn/ui with proper configuration
npx shadcn-ui@latest init

# Configure components.json properly
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}

# Install components selectively
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
```

### CSS Variables Configuration
```css
/* ✅ Good - Comprehensive CSS variables setup */
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Component Usage Patterns

### Basic Component Usage
```typescript
// ✅ Good - Proper shadcn/ui component usage
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" type="submit">
          Sign In
        </Button>
        <Button variant="ghost" className="w-full">
          Forgot password?
        </Button>
      </CardFooter>
    </Card>
  )
}

// ❌ Bad - Improper component usage
const BadLoginForm = () => (
  <div className="border rounded p-4">  {/* Should use Card */}
    <h2>Login</h2>  {/* Should use CardTitle */}
    <input type="email" />  {/* Should use Input component */}
    <button>Submit</button>  {/* Should use Button component */}
  </div>
)
```

### Form Components Integration
```typescript
// ✅ Good - Form integration with React Hook Form
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(160, { message: "Bio must not exceed 160 characters." }),
  role: z.string({ required_error: "Please select a role." }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const ProfileForm = () => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief description for your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
```

## Component Customization Patterns

### Extending Base Components
```typescript
// ✅ Good - Extending shadcn/ui components properly
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading = false, loadingText, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(className)}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? loadingText || children : children}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

// ✅ Good - Creating composite components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    status: 'active' | 'inactive'
  }
  onEdit?: (userId: string) => void
}

export const UserCard = ({ user, onEdit }: UserCardProps) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-row items-center space-y-0 space-x-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <CardTitle className="text-base">{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>

        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
          {user.status}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Role: {user.role}</span>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(user.id)}>
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Theme Customization
```typescript
// ✅ Good - Custom theme variants
import { cva } from "class-variance-authority"
import { Button } from "@/components/ui/button"

// Extend button variants for brand-specific styling
export const brandButtonVariants = cva(
  "", // Base classes handled by shadcn Button
  {
    variants: {
      brand: {
        primary: "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500",
        secondary: "bg-brand-100 text-brand-900 hover:bg-brand-200 focus:ring-brand-500",
        gradient: "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700",
      }
    }
  }
)

interface BrandButtonProps extends React.ComponentProps<typeof Button> {
  brand?: 'primary' | 'secondary' | 'gradient'
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ brand, className, ...props }, ref) => {
    if (brand) {
      return (
        <Button
          ref={ref}
          className={cn(brandButtonVariants({ brand }), className)}
          {...props}
        />
      )
    }

    return <Button ref={ref} className={className} {...props} />
  }
)
```

## Alternative Perspective
**Counter-point**: Heavy customization of shadcn/ui components can defeat the purpose of using a design system. Sometimes it's better to embrace the default design patterns and focus on functionality rather than creating too many visual variations that complicate the design system.

## Data Display Patterns

### Table Implementation
```typescript
// ✅ Good - Data table with shadcn/ui components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: string
}

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  return (
    <Table>
      <TableCaption>A list of your team members.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>{user.lastLogin}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                    Copy user ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit user
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete user
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total Users</TableCell>
          <TableCell className="text-right">{users.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
```

### Dialog and Modal Patterns
```typescript
// ✅ Good - Dialog implementation with proper form handling
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface CreateUserDialogProps {
  onCreateUser: (userData: { name: string; email: string }) => Promise<void>
}

export const CreateUserDialog = ({ onCreateUser }: CreateUserDialogProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onCreateUser(formData)
      setFormData({ name: '', email: '' })
      setOpen(false)
    } catch (error) {
      console.error('Failed to create user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>
            Create a new user account. They will receive an email invitation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Navigation and Layout Patterns

### Navigation Components
```typescript
// ✅ Good - Navigation with shadcn/ui components
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Users, Settings, BarChart3 } from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export const Sidebar = () => {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-16 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Your App</h2>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <span
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// Mobile navigation with Sheet
export const MobileNav = () => {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex h-16 items-center">
          <h2 className="text-lg font-semibold">Your App</h2>
        </div>

        <nav className="mt-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

## Component Testing Patterns

### Testing shadcn/ui Components
```typescript
// ✅ Good - Testing custom components built with shadcn/ui
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateUserDialog } from './CreateUserDialog'

describe('CreateUserDialog', () => {
  const mockOnCreateUser = jest.fn()

  beforeEach(() => {
    mockOnCreateUser.mockClear()
  })

  test('opens dialog when trigger button is clicked', async () => {
    const user = userEvent.setup()

    render(<CreateUserDialog onCreateUser={mockOnCreateUser} />)

    const triggerButton = screen.getByRole('button', { name: /add user/i })
    await user.click(triggerButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Add new user')).toBeInTheDocument()
  })

  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockOnCreateUser.mockResolvedValue(undefined)

    render(<CreateUserDialog onCreateUser={mockOnCreateUser} />)

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add user/i }))

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')

    // Submit form
    await user.click(screen.getByRole('button', { name: /create user/i }))

    expect(mockOnCreateUser).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  test('shows loading state during submission', async () => {
    const user = userEvent.setup()

    // Mock slow API call
    mockOnCreateUser.mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<CreateUserDialog onCreateUser={mockOnCreateUser} />)

    await user.click(screen.getByRole('button', { name: /add user/i }))
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /create user/i }))

    expect(screen.getByText('Creating...')).toBeInTheDocument()
  })
})
```

## Alternative Perspective
**Counter-point**: The abstraction layer of shadcn/ui components can sometimes make debugging and customization more difficult than working with plain HTML and CSS. For teams that need highly customized designs, building components from scratch might provide better control and performance.

This shadcn/ui code style standard ensures consistent, accessible, and maintainable component usage while leveraging the full power of the shadcn/ui design system and component library.