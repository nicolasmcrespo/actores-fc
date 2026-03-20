# Form Component Patterns

## Overview
Standardized patterns for form components that ensure consistency, validation, accessibility, and great UX across all applications.

## Form Architecture Pattern

### Core Form Structure
```typescript
interface FormProps<T extends Record<string, any>> {
  // Schema-driven validation
  schema: ZodSchema<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => Promise<void> | void

  // UX Enhancement
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode

  // Flexibility
  className?: string
}
```

## Alternative Perspective
**Counter-point**: Schema-driven forms can be overkill for simple forms. Sometimes a basic controlled component with useState is more straightforward and easier to debug.

## Validation Strategy (Zod + React Hook Form)

### Schema Definition Pattern
```typescript
import { z } from 'zod'

// ✅ Good - Comprehensive schema with custom messages
const userFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'),

  confirmPassword: z.string().min(1, 'Please confirm your password'),

  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Please enter a valid age'),

  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.boolean(),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type UserFormData = z.infer<typeof userFormSchema>
```

## Form Component Implementation

### Base Form Component
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

interface BaseFormProps<T extends Record<string, any>> {
  schema: ZodSchema<T>
  onSubmit: (data: T) => Promise<void>
  defaultValues?: Partial<T>
  className?: string
  children: (form: UseFormReturn<T>) => React.ReactNode
}

export function BaseForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  defaultValues,
  className,
  children
}: BaseFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: T) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      // Handle submission errors
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
        noValidate // We handle validation with Zod
      >
        {children({ ...form, isSubmitting })}
      </form>
    </Form>
  )
}
```

## Field Component Patterns

### Text Input Field
```typescript
interface TextFieldProps {
  name: string
  label: string
  placeholder?: string
  description?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  disabled?: boolean
  required?: boolean
}

export function TextField({
  name,
  label,
  placeholder,
  description,
  type = 'text',
  disabled,
  required
}: TextFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className={required ? "after:content-['*'] after:text-red-500" : ""}>
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              aria-describedby={description ? `${name}-description` : undefined}
            />
          </FormControl>
          {description && (
            <p id={`${name}-description`} className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

### Select Field Pattern
```typescript
interface SelectFieldProps {
  name: string
  label: string
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  disabled?: boolean
  required?: boolean
}

export function SelectField({
  name,
  label,
  placeholder = "Select an option",
  options,
  disabled,
  required
}: SelectFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={required ? "after:content-['*'] after:text-red-500" : ""}>
            {label}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

## Complex Form Example

### User Registration Form
```typescript
export function UserRegistrationForm() {
  const handleSubmit = async (data: UserFormData) => {
    // Type-safe submission
    const response = await api.post('/auth/register', data)

    if (response.success) {
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } else {
      toast.error(response.error || 'Registration failed')
    }
  }

  return (
    <BaseForm
      schema={userFormSchema}
      onSubmit={handleSubmit}
      className="max-w-md mx-auto"
    >
      {({ isSubmitting }) => (
        <>
          <div className="space-y-4">
            <TextField
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
            />

            <TextField
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              description="Must be at least 8 characters with uppercase, lowercase, and number"
              required
            />

            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              required
            />

            <TextField
              name="age"
              label="Age"
              type="number"
              placeholder="Enter your age"
              required
            />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Preferences</h3>

              <CheckboxField
                name="preferences.newsletter"
                label="Subscribe to newsletter"
                description="Get updates about new features and products"
              />

              <CheckboxField
                name="preferences.notifications"
                label="Enable notifications"
                description="Receive important account notifications"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              loading={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/login')}
            >
              Sign In Instead
            </Button>
          </div>
        </>
      )}
    </BaseForm>
  )
}
```

## Form State Management Patterns

### Loading States
```typescript
// ✅ Good - Multiple loading states
interface FormState {
  isSubmitting: boolean
  isValidating: boolean
  isDirty: boolean
  isValid: boolean
}

// Show different UX for different states
{isValidating && <div>Validating...</div>}
{isSubmitting && <div>Saving changes...</div>}
```

### Error Handling Strategy
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await submitForm(data)
  } catch (error) {
    if (error.status === 422) {
      // Field-specific errors from server
      error.fields.forEach(({ field, message }) => {
        form.setError(field, { message })
      })
    } else if (error.status === 409) {
      // Duplicate email, etc.
      form.setError('email', { message: 'Email already exists' })
    } else {
      // Generic error
      toast.error('Something went wrong. Please try again.')
    }
  }
}
```

## Alternative Perspective
**Counter-point**: Heavy error handling can make forms complex. Sometimes it's better to show generic error messages and handle edge cases as they come up rather than over-engineering upfront.

## Accessibility Standards

### Screen Reader Support
```typescript
// ✅ Good - Proper ARIA labels and descriptions
<FormField
  name="password"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel htmlFor="password">Password</FormLabel>
      <FormControl>
        <Input
          {...field}
          id="password"
          type="password"
          aria-invalid={fieldState.invalid}
          aria-describedby={`password-description ${fieldState.error ? 'password-error' : ''}`}
        />
      </FormControl>
      <p id="password-description" className="text-sm text-muted-foreground">
        Must be at least 8 characters
      </p>
      {fieldState.error && (
        <p id="password-error" className="text-sm text-red-500" role="alert">
          {fieldState.error.message}
        </p>
      )}
    </FormItem>
  )}
/>
```

### Keyboard Navigation
```typescript
// Auto-focus first field
useEffect(() => {
  const firstField = document.querySelector('input, select, textarea')
  if (firstField instanceof HTMLElement) {
    firstField.focus()
  }
}, [])

// Enter key handling
<form onSubmit={handleSubmit} onKeyDown={(e) => {
  if (e.key === 'Enter' && e.target.type !== 'textarea') {
    e.preventDefault()
    handleSubmit()
  }
}}>
```

## Performance Optimization

### Debounced Validation
```typescript
// For expensive validation (API calls)
const debouncedValidateEmail = useMemo(
  () => debounce(async (email: string) => {
    const exists = await api.checkEmailExists(email)
    return exists ? 'Email already exists' : true
  }, 500),
  []
)

// In field definition
email: z.string().email().refine(debouncedValidateEmail, {
  message: 'Email already exists'
})
```

### Field-Level Validation
```typescript
// Only validate changed fields, not entire form
const { trigger } = useForm()

<Input
  onChange={(e) => {
    field.onChange(e)
    trigger(field.name) // Only validate this field
  }}
/>
```

## Testing Patterns

### Form Testing Standards
```typescript
describe('UserRegistrationForm', () => {
  test('validates required fields', async () => {
    render(<UserRegistrationForm />)

    fireEvent.click(screen.getByText('Create Account'))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument()
  })

  test('submits valid form data', async () => {
    const mockSubmit = jest.fn()
    render(<UserRegistrationForm onSubmit={mockSubmit} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'ValidPass123' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'ValidPass123' }
    })

    fireEvent.click(screen.getByText('Create Account'))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
        // ... other fields
      })
    })
  })
})
```

This form pattern ensures consistent, accessible, and type-safe forms across your entire application while providing excellent UX and DX.