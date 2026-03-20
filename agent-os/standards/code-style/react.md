# React Code Style Standards

## Overview
Comprehensive React coding standards focusing on functional components, hooks patterns, performance optimization, and maintainable component architecture.

## Component Declaration Patterns

### Functional Component Structure
```typescript
// ✅ Good - Arrow function with explicit return type
const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  // Hooks at the top
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Custom hooks
  const { theme } = useTheme()
  const { permissions } = usePermissions()

  // Computed values
  const displayName = useMemo(() =>
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
  , [user.firstName, user.lastName, user.email])

  // Event handlers
  const handleSubmit = useCallback(async (data: UserUpdateData) => {
    try {
      setLoading(true)
      setError(null)
      await onUpdate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }, [onUpdate])

  // Early returns
  if (!user) {
    return <div>No user data available</div>
  }

  // Main render
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  )
}

// ❌ Bad - Function declaration, inconsistent formatting
function UserProfile(props) {
  const [loading, setLoading] = useState(false)
  const handleSubmit = (data) => {
    // Logic mixed with render
  }
  if (!props.user) return <div>No user</div>
  return <div>...</div>
}
```

### Component Organization Order
```typescript
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. State hooks (useState, useReducer)
  const [state, setState] = useState(initialState)

  // 2. Effect hooks (useEffect, useLayoutEffect)
  useEffect(() => {
    // Side effects
  }, [dependencies])

  // 3. Custom hooks
  const customData = useCustomHook()

  // 4. Computed values (useMemo, derived state)
  const computedValue = useMemo(() => {
    return expensiveComputation(state)
  }, [state])

  // 5. Event handlers (useCallback)
  const handleClick = useCallback(() => {
    setState(newState)
  }, [])

  // 6. Refs (useRef)
  const inputRef = useRef<HTMLInputElement>(null)

  // 7. Early returns for conditional rendering
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  // 8. Main render return
  return (
    <div>
      {/* JSX content */}
    </div>
  )
}
```

## Props and TypeScript Integration

### Props Interface Definition
```typescript
// ✅ Good - Comprehensive interface with JSDoc
interface UserCardProps {
  /** User data object */
  user: User
  /** Whether the card is in compact mode */
  compact?: boolean
  /** Callback when user clicks on card */
  onUserClick?: (userId: string) => void
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string | null
}

// ✅ Good - Using Pick/Omit for derived interfaces
interface EditUserFormProps extends Pick<UserCardProps, 'user' | 'loading'> {
  onSubmit: (data: Partial<User>) => void
  initialValues?: Partial<User>
}

// ❌ Bad - Inline prop types, no documentation
const UserCard = ({ user, compact, onUserClick, className, loading, error }: {
  user: any
  compact?: boolean
  onUserClick?: Function
  className?: string
  loading?: boolean
  error?: any
}) => {
  // Component implementation
}
```

### Props Destructuring Patterns
```typescript
// ✅ Good - Destructure with defaults at parameter level
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className,
  ...restProps
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...restProps}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

// ❌ Bad - Destructuring inside component, manual defaults
const Button: React.FC<ButtonProps> = (props) => {
  const {
    children,
    variant,
    size,
    disabled,
    loading,
    className,
    ...restProps
  } = props

  const actualVariant = variant || 'primary'
  const actualSize = size || 'medium'

  return (
    <button {...restProps}>
      {children}
    </button>
  )
}
```

## Hooks Usage Patterns

### useState Best Practices
```typescript
// ✅ Good - Typed state, functional updates
const [user, setUser] = useState<User | null>(null)
const [formData, setFormData] = useState<FormData>(() => ({
  name: '',
  email: '',
  preferences: {
    theme: 'light',
    notifications: true,
  }
}))

// Update with functional form for safety
const updateUserName = useCallback((newName: string) => {
  setUser(prevUser =>
    prevUser ? { ...prevUser, name: newName } : prevUser
  )
}, [])

// ❌ Bad - Untyped state, direct object mutation
const [user, setUser] = useState(null)
const [formData, setFormData] = useState({})

const updateUserName = (newName) => {
  user.name = newName // Direct mutation
  setUser(user)
}
```

### useEffect Guidelines
```typescript
// ✅ Good - Specific dependencies, cleanup
useEffect(() => {
  const controller = new AbortController()

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const userData = await api.getUser(userId, {
        signal: controller.signal
      })
      setUser(userData)
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (userId) {
    fetchUserData()
  }

  return () => {
    controller.abort()
  }
}, [userId]) // Only userId as dependency

// ❌ Bad - Missing dependencies, no cleanup
useEffect(() => {
  api.getUser(userId).then(userData => {
    setUser(userData)
    setLastFetch(new Date())
  })
}, [userId]) // Missing setUser, setLastFetch in deps
```

### Custom Hooks Patterns
```typescript
// ✅ Good - Focused, reusable custom hook
function useUserData(userId: string | null) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const userData = await userService.getById(userId)
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    user,
    loading,
    error,
    refetch,
  }
}

// Usage
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { user, loading, error, refetch } = useUserData(userId)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />
  if (!user) return <div>User not found</div>

  return <div>{user.name}</div>
}
```

## Alternative Perspective
**Counter-point**: Over-structuring React components with rigid patterns can make simple components unnecessarily complex. Sometimes a basic functional component without hooks optimization is clearer and more maintainable than following every pattern.

## JSX and Rendering Patterns

### Conditional Rendering Standards
```typescript
// ✅ Good - Explicit conditional rendering
const UserDashboard: React.FC<Props> = ({ user, permissions }) => {
  return (
    <div className="dashboard">
      {user ? (
        <div>
          <UserHeader user={user} />
          {permissions.canEdit && (
            <EditButton onEdit={handleEdit} />
          )}
          {permissions.canDelete && (
            <DeleteButton onDelete={handleDelete} />
          )}
        </div>
      ) : (
        <LoginPrompt />
      )}
    </div>
  )
}

// ✅ Good - Early returns for complex conditions
const UserDashboard: React.FC<Props> = ({ user, permissions }) => {
  if (!user) {
    return <LoginPrompt />
  }

  if (user.status === 'suspended') {
    return <SuspendedUserMessage />
  }

  if (!permissions.canView) {
    return <AccessDeniedMessage />
  }

  return (
    <div className="dashboard">
      <UserHeader user={user} />
      {/* Main content */}
    </div>
  )
}

// ❌ Bad - Nested ternary operators, hard to read
const UserDashboard = ({ user, permissions }) => (
  <div>
    {user ? (
      user.status === 'active' ? (
        permissions.canView ? (
          <div>Content</div>
        ) : (
          <div>No access</div>
        )
      ) : (
        <div>Suspended</div>
      )
    ) : (
      <div>Login</div>
    )}
  </div>
)
```

### List Rendering Patterns
```typescript
// ✅ Good - Proper key usage, error handling
const UserList: React.FC<{ users: User[] }> = ({ users }) => {
  if (users.length === 0) {
    return <EmptyState message="No users found" />
  }

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard
          key={user.id} // Use stable, unique ID
          user={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}

// ❌ Bad - Index as key, no empty state handling
const UserList = ({ users }) => (
  <div>
    {users.map((user, index) => (
      <UserCard key={index} user={user} /> // Bad: index as key
    ))}
  </div>
)
```

### Component Composition Patterns
```typescript
// ✅ Good - Compound components pattern
const Card = ({ children, className, ...props }: CardProps) => (
  <div className={cn("card", className)} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn("card-header", className)}>
    {children}
  </div>
)

const CardContent = ({ children, className }: CardContentProps) => (
  <div className={cn("card-content", className)}>
    {children}
  </div>
)

const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={cn("card-footer", className)}>
    {children}
  </div>
)

// Usage
const UserCard = ({ user }: { user: User }) => (
  <Card>
    <CardHeader>
      <h3>{user.name}</h3>
    </CardHeader>
    <CardContent>
      <p>{user.email}</p>
    </CardContent>
    <CardFooter>
      <Button>Edit</Button>
    </CardFooter>
  </Card>
)

// Export compound component
export { Card, CardHeader, CardContent, CardFooter }
```

## Performance Optimization Patterns

### Memoization Best Practices
```typescript
// ✅ Good - Memoize expensive computations
const ExpensiveComponent: React.FC<Props> = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.category === filter)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items, filter])

  const expensiveValue = useMemo(() => {
    return performExpensiveCalculation(filteredItems)
  }, [filteredItems])

  return (
    <div>
      {filteredItems.map(item => (
        <ItemCard key={item.id} item={item} value={expensiveValue} />
      ))}
    </div>
  )
}

// ✅ Good - Memoize callbacks passed to children
const ParentComponent: React.FC = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1)
  }, []) // No dependencies needed for functional updates

  const handleNameChange = useCallback((newName: string) => {
    setName(newName)
  }, [])

  return (
    <div>
      <Counter count={count} onIncrement={handleIncrement} />
      <NameInput name={name} onChange={handleNameChange} />
    </div>
  )
}

// ❌ Bad - Unnecessary memoization, recreated functions
const BadComponent = ({ items }) => {
  const trivialValue = useMemo(() => items.length, [items]) // Unnecessary

  return (
    <div>
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={() => handleClick(item.id)} // Recreated on each render
        />
      ))}
    </div>
  )
}
```

### Component Memoization
```typescript
// ✅ Good - React.memo with custom comparison
const UserCard = React.memo<UserCardProps>(
  ({ user, onEdit, theme }) => {
    return (
      <div className={`user-card user-card--${theme}`}>
        <img src={user.avatar} alt={`${user.name} avatar`} />
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <button onClick={() => onEdit(user.id)}>Edit</button>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for complex objects
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name &&
      prevProps.user.email === nextProps.user.email &&
      prevProps.user.avatar === nextProps.user.avatar &&
      prevProps.theme === nextProps.theme
    )
  }
)

// ✅ Good - Simple memo for stable props
const SimpleComponent = React.memo<SimpleProps>(({ title, description }) => (
  <div>
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
))
```

## Error Handling Patterns

### Error Boundaries
```typescript
// ✅ Good - Class component error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
    errorReportingService.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

// Usage
const App = () => (
  <ErrorBoundary fallback={CustomErrorFallback}>
    <UserDashboard />
  </ErrorBoundary>
)
```

### Async Error Handling
```typescript
// ✅ Good - Comprehensive async error handling
const useAsyncOperation = <T>(
  operation: () => Promise<T>
): {
  execute: () => Promise<T | null>
  loading: boolean
  error: string | null
  data: T | null
} => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operation()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [operation])

  return { execute, loading, error, data }
}
```

## Testing Considerations

### Component Structure for Testing
```typescript
// ✅ Good - Testable component structure
const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdate,
  onDelete,
  permissions
}) => {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async (formData: UserFormData) => {
    await onUpdate(user.id, formData)
    setIsEditing(false)
  }

  return (
    <div data-testid="user-profile">
      <div data-testid="user-info">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      {permissions.canEdit && (
        <button
          data-testid="edit-button"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
      )}

      {isEditing && (
        <UserEditForm
          user={user}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}
```

## Alternative Perspective
**Counter-point**: Over-testing React components with extensive data-testid attributes and complex mocking can make tests brittle and hard to maintain. Sometimes testing behavior through user interactions rather than implementation details leads to more valuable and maintainable tests.

This React code style standard ensures consistent, performant, and maintainable React component development while following modern React patterns and TypeScript best practices.