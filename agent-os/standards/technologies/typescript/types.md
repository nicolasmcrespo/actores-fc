# TypeScript Types Standards

## Type vs Interface

### Use Interfaces for Objects
```typescript
// ✅ Good - Object shapes should use interfaces
interface User {
  id: string
  name: string
  email: string
}

// ❌ Avoid - Don't use type for object shapes
type User = {
  id: string
  name: string
}
```

### Use Types for Unions and Primitives
```typescript
// ✅ Good - Unions and aliases use type
type Status = 'pending' | 'active' | 'archived'
type ID = string | number
type Nullable<T> = T | null

// ❌ Avoid - Can't do unions with interface
interface Status {} // Can't express union
```

## Alternative Perspective
**Counter-point**: Some teams prefer using `type` everywhere for consistency, since types can do everything interfaces can. The performance difference is negligible in modern TypeScript.

## Naming Conventions

### No "I" Prefix for Interfaces
```typescript
// ✅ Good - Clean names
interface User { }
interface ApiResponse { }

// ❌ Bad - Hungarian notation
interface IUser { }
interface IApiResponse { }
```

### Type Suffix for Complex Types
```typescript
// ✅ Good - Clear what these are
type UserMap = Map<string, User>
type UserArray = User[]
type UserGetter = () => User
```

## Generic Type Patterns

### Constrained Generics
```typescript
// ✅ Good - Constrained for safety
function updateEntity<T extends { id: string }>(entity: T): T {
  return { ...entity, updatedAt: new Date() }
}

// ❌ Bad - Too permissive
function updateEntity<T>(entity: T): T {
  return entity // Can't safely add updatedAt
}
```

### Utility Types Usage
```typescript
// Required utility types to master:
type PartialUser = Partial<User>         // All fields optional
type RequiredUser = Required<User>       // All fields required
type ReadonlyUser = Readonly<User>       // All fields readonly
type UserKeys = keyof User               // Union of keys
type NameOnly = Pick<User, 'name'>       // Subset of fields
type NoId = Omit<User, 'id'>            // Exclude fields
```

## Discriminated Unions (Required Pattern)
```typescript
// ✅ Good - Type-safe discriminated union
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data) // TypeScript knows data exists
  } else {
    console.log(result.error) // TypeScript knows error exists
  }
}
```

## Never Use 'any'
```typescript
// ❌ Never do this
function process(data: any) { }

// ✅ Use unknown for truly unknown types
function process(data: unknown) {
  // Must narrow type before use
  if (typeof data === 'string') {
    console.log(data.toUpperCase())
  }
}

// ✅ Or use generics
function process<T>(data: T) { }
```

## Alternative Perspective
**Counter-point**: In rapid prototyping, temporary `any` with `// @ts-expect-error` comments can speed development. Just ensure they're removed before production.