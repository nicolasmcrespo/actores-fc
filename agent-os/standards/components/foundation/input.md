# Input Component Standards

## Overview
Foundation standards for input components that ensure consistency, accessibility, and excellent user experience across all form interactions.

## Core Input Interface

### Required Props
```typescript
interface InputProps {
  // Value and control
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent) => void
  onFocus?: (event: React.FocusEvent) => void

  // Input types
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number'

  // Visual variants
  variant?: 'default' | 'filled' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'

  // States
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  loading?: boolean

  // Content
  placeholder?: string
  label?: string
  description?: string
  error?: string

  // Enhancements
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  clearable?: boolean

  // Accessibility
  id?: string
  name?: string
  'aria-label'?: string
  'aria-describedby'?: string

  // Flexibility
  className?: string
  containerClassName?: string
}
```

## Alternative Perspective
**Counter-point**: Complex input components with many variants can lead to inconsistent usage across teams. Sometimes having fewer, well-defined input types leads to more consistent UX than providing too many customization options.

## Implementation Example

### React Implementation
```typescript
import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-input",
        filled: "bg-muted border-transparent",
        outline: "border-2 border-input",
        ghost: "border-transparent bg-transparent focus-visible:border-input",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
      state: {
        default: "",
        invalid: "border-destructive focus-visible:ring-destructive",
        valid: "border-green-500 focus-visible:ring-green-500",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>,
    VariantProps<typeof inputVariants> {
  // Custom onChange that provides string value
  onChange?: (value: string) => void

  // Enhanced props
  label?: string
  description?: string
  error?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  clearable?: boolean
  loading?: boolean
  containerClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    containerClassName,
    variant,
    size,
    type = 'text',
    label,
    description,
    error,
    startIcon,
    endIcon,
    clearable,
    loading,
    disabled,
    required,
    value,
    onChange,
    id,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '')
    const inputValue = value !== undefined ? value : internalValue

    const inputId = id || `input-${Math.random().toString(36).slice(2)}`
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      if (value === undefined) {
        setInternalValue(newValue)
      }

      onChange?.(newValue)
    }

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue('')
      }
      onChange?.('')
    }

    const state = error ? 'invalid' : 'default'
    const showClearButton = clearable && inputValue && !disabled && !readOnly

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              required && "after:content-['*'] after:text-destructive after:ml-1"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant, size, state, className }),
              startIcon && "pl-10",
              (endIcon || showClearButton || loading) && "pr-10"
            )}
            value={inputValue}
            onChange={handleChange}
            disabled={disabled || loading}
            required={required}
            aria-invalid={!!error}
            aria-describedby={cn(descriptionId, errorId)}
            ref={ref}
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
            )}

            {showClearButton && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                aria-label="Clear input"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </button>
            )}

            {endIcon && !loading && (
              <div className="text-muted-foreground">
                {endIcon}
              </div>
            )}
          </div>
        </div>

        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
```

## Specialized Input Components

### Password Input
```typescript
// components/ui/password-input.tsx
import React, { useState } from 'react'
import { Input, InputProps } from './input'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<InputProps, 'type' | 'endIcon'> {
  showStrengthIndicator?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthIndicator = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

    const calculateStrength = (password: string): 'weak' | 'medium' | 'strong' => {
      if (!password) return 'weak'

      let score = 0
      if (password.length >= 8) score++
      if (/[A-Z]/.test(password)) score++
      if (/[a-z]/.test(password)) score++
      if (/\d/.test(password)) score++
      if (/[^A-Za-z0-9]/.test(password)) score++

      if (score < 3) return 'weak'
      if (score < 4) return 'medium'
      return 'strong'
    }

    const handleChange = (newValue: string) => {
      if (showStrengthIndicator) {
        setStrength(calculateStrength(newValue))
      }
      onChange?.(newValue)
    }

    const togglePassword = () => setShowPassword(!showPassword)

    const strengthColors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-green-500'
    }

    return (
      <div>
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          endIcon={
            <button
              type="button"
              onClick={togglePassword}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {showStrengthIndicator && value && (
          <div className="mt-2 space-y-1">
            <div className="flex space-x-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded",
                    level === 1 || (level === 2 && strength !== 'weak') || (level === 3 && strength === 'strong')
                      ? strengthColors[strength]
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              Password strength: {strength}
            </p>
          </div>
        )}
      </div>
    )
  }
)
```

### Search Input
```typescript
// components/ui/search-input.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { Input, InputProps } from './input'
import { Search, X } from 'lucide-react'
import { debounce } from 'lodash'

interface SearchInputProps extends Omit<InputProps, 'startIcon' | 'onChange'> {
  onSearch?: (query: string) => void
  onClear?: () => void
  debounceMs?: number
  showClearButton?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    onSearch,
    onClear,
    debounceMs = 300,
    showClearButton = true,
    placeholder = "Search...",
    value,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '')
    const searchValue = value !== undefined ? value : internalValue

    // Debounced search function
    const debouncedSearch = useCallback(
      debounce((query: string) => {
        onSearch?.(query)
      }, debounceMs),
      [onSearch, debounceMs]
    )

    useEffect(() => {
      debouncedSearch(searchValue)
      return () => {
        debouncedSearch.cancel()
      }
    }, [searchValue, debouncedSearch])

    const handleChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      // Don't call onSearch directly - let the debounced effect handle it
    }

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue('')
      }
      onClear?.()
      debouncedSearch.cancel()
      onSearch?.('')
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        startIcon={<Search className="h-4 w-4" />}
        endIcon={
          showClearButton && searchValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
      />
    )
  }
)
```

## Form Integration Patterns

### React Hook Form Integration
```typescript
// components/forms/FormInput.tsx
import React from 'react'
import { useController, UseControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Input, InputProps } from '@/components/ui/input'

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'error'>,
    UseControllerProps<TFieldValues, TName> {}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, control, rules, defaultValue, ...inputProps }: FormInputProps<TFieldValues, TName>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  })

  return (
    <Input
      {...inputProps}
      ref={ref}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      invalid={invalid}
      error={error?.message}
    />
  )
}

// Usage in forms
function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput
        name="email"
        control={form.control}
        type="email"
        label="Email"
        placeholder="Enter your email"
        required
      />

      <FormInput
        name="password"
        control={form.control}
        type="password"
        label="Password"
        placeholder="Enter your password"
        required
      />
    </form>
  )
}
```

## Accessibility Standards

### Keyboard Navigation
```typescript
// Enhanced input with keyboard navigation support
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  switch (e.key) {
    case 'Escape':
      if (clearable && inputValue) {
        e.preventDefault()
        handleClear()
      }
      break

    case 'Enter':
      e.preventDefault()
      onSubmit?.(inputValue)
      break

    default:
      break
  }

  onKeyDown?.(e)
}
```

### Screen Reader Support
```typescript
// Proper ARIA attributes for different states
const getAriaAttributes = () => {
  const baseAttributes = {
    'aria-invalid': invalid || !!error,
    'aria-required': required,
    'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
  }

  if (loading) {
    baseAttributes['aria-busy'] = true
  }

  if (type === 'search') {
    baseAttributes['role'] = 'searchbox'
  }

  return baseAttributes
}
```

## Testing Standards

### Component Tests
```typescript
describe('Input Component', () => {
  test('renders with label and description', () => {
    render(
      <Input
        label="Email"
        description="Enter your email address"
        placeholder="email@example.com"
      />
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument()
  })

  test('shows error state', () => {
    render(<Input label="Email" error="Email is required" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  test('handles controlled value changes', () => {
    const handleChange = jest.fn()
    render(<Input value="test" onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })

    expect(handleChange).toHaveBeenCalledWith('new value')
  })

  test('supports clearable functionality', () => {
    const handleChange = jest.fn()
    render(<Input value="test" onChange={handleChange} clearable />)

    const clearButton = screen.getByLabelText('Clear input')
    fireEvent.click(clearButton)

    expect(handleChange).toHaveBeenCalledWith('')
  })
})
```

## Alternative Perspective
**Counter-point**: This comprehensive input component might be too complex for simpler applications. Sometimes using basic HTML inputs with minimal styling leads to better performance and easier maintenance, especially when form requirements are straightforward.

This input component standard ensures consistent, accessible, and feature-rich input experiences across your application while maintaining flexibility for different use cases and integration patterns.