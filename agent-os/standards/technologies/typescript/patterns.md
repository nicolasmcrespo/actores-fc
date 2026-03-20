# TypeScript Patterns

## Type Guards

### User-Defined Type Guards
```typescript
// ✅ Good - Type predicate for runtime safety
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  )
}

// Usage
if (isUser(data)) {
  console.log(data.email) // TypeScript knows it's a User
}
```

## Alternative Perspective
**Counter-point**: Runtime type checking adds overhead. Consider using libraries like Zod for parsing and validation instead of manual type guards.

## Exhaustive Checks

### Never Type for Completeness
```typescript
// ✅ Good - Compiler ensures all cases handled
type Status = 'pending' | 'active' | 'archived'

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending':
      return 'Waiting'
    case 'active':
      return 'Running'
    case 'archived':
      return 'Complete'
    default:
      // If you miss a case, TypeScript errors here
      const _exhaustive: never = status
      return _exhaustive
  }
}
```

## Builder Pattern with Fluent Interface
```typescript
// ✅ Good - Type-safe builder
class QueryBuilder<T = {}> {
  private query: T

  constructor(query: T = {} as T) {
    this.query = query
  }

  where<K extends string, V>(
    key: K,
    value: V
  ): QueryBuilder<T & Record<K, V>> {
    return new QueryBuilder({
      ...this.query,
      [key]: value
    })
  }

  build(): T {
    return this.query
  }
}

// Usage - TypeScript tracks the shape
const query = new QueryBuilder()
  .where('name', 'John')
  .where('age', 30)
  .build() // Type: { name: string, age: number }
```

## Branded Types for Domain Safety
```typescript
// ✅ Good - Prevent mixing different IDs
type UserId = string & { __brand: 'UserId' }
type PostId = string & { __brand: 'PostId' }

function getUserById(id: UserId) { }
function getPostById(id: PostId) { }

const userId = 'user_123' as UserId
const postId = 'post_456' as PostId

getUserById(userId) // ✅ Works
getUserById(postId) // ❌ Type error!
```

## Template Literal Types
```typescript
// ✅ Good - Type-safe string patterns
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Endpoint = `/api/${string}`
type RoutePattern = `${HTTPMethod} ${Endpoint}`

const route: RoutePattern = 'GET /api/users' // ✅ Valid
const invalid: RoutePattern = 'GET /users'   // ❌ Type error
```

## Conditional Types
```typescript
// ✅ Good - Types that adapt based on conditions
type AsyncReturn<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : T extends (...args: any[]) => infer R
  ? R
  : never

// Extracts return type whether async or not
type UserData = AsyncReturn<typeof getUser> // Works for both sync/async
```

## Alternative Perspective
**Counter-point**: These advanced patterns can make code harder for junior developers to understand. Sometimes simpler, more verbose code is better for team maintainability.

## Index Signatures with Template Literals
```typescript
// ✅ Good - Flexible but type-safe
type CSSProperties = {
  [key: `--${string}`]: string | number  // CSS variables
}

const styles: CSSProperties = {
  '--primary-color': '#007bff',
  '--spacing': 8,
  regularProp: 'value' // ❌ Type error - must start with --
}
```

## Const Assertions
```typescript
// ✅ Good - Preserve literal types
const ROUTES = {
  HOME: '/',
  USERS: '/users',
  PROFILE: '/profile'
} as const

type Route = typeof ROUTES[keyof typeof ROUTES]
// Type: "/" | "/users" | "/profile" (not just string)
```