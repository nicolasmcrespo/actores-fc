# TypeScript Code Style Standards

## Overview
Comprehensive TypeScript coding standards emphasizing type safety, maintainability, and leveraging TypeScript's advanced features for robust applications.

## Type Definition Patterns

### Interface vs Type Aliases
```typescript
// ✅ Good - Use interfaces for object shapes that might be extended
interface User {
  readonly id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

interface AdminUser extends User {
  permissions: Permission[]
  lastLogin?: Date
}

// ✅ Good - Use type aliases for unions, primitives, and computed types
type Status = 'pending' | 'approved' | 'rejected'
type UserWithStatus = User & { status: Status }
type UserKeys = keyof User
type PartialUser = Partial<User>

// ✅ Good - Use type aliases for function signatures
type EventHandler<T = void> = (event: T) => void
type AsyncOperation<T> = () => Promise<T>

// ❌ Bad - Mixing interfaces and types inconsistently
type User = {  // Should be interface
  id: string
  name: string
}

interface Status {  // Should be type alias
  value: 'pending' | 'approved'
}
```

### Generic Type Patterns
```typescript
// ✅ Good - Meaningful generic names with constraints
interface Repository<TEntity extends { id: string }> {
  findById(id: string): Promise<TEntity | null>
  create(entity: Omit<TEntity, 'id'>): Promise<TEntity>
  update(id: string, updates: Partial<TEntity>): Promise<TEntity>
  delete(id: string): Promise<void>
}

// ✅ Good - Multiple type parameters with defaults
interface ApiResponse<TData = unknown, TError = string> {
  success: boolean
  data?: TData
  error?: TError
  timestamp: Date
}

// ✅ Good - Conditional types for advanced patterns
type NonNullable<T> = T extends null | undefined ? never : T
type GetArrayType<T> = T extends (infer U)[] ? U : never
type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// ❌ Bad - Single letter generics without context
interface Repository<T> {
  get(id: string): T
  save(item: T): void
}

// ❌ Bad - Over-complex generics that hurt readability
type ComplexType<T, U, V, W> = T extends U ? V extends W ? T : never : U
```

### Utility Types Usage
```typescript
// ✅ Good - Leveraging built-in utility types
interface UserFormData extends Pick<User, 'name' | 'email'> {
  password: string
  confirmPassword: string
}

interface UserUpdateRequest extends Partial<Omit<User, 'id' | 'createdAt'>> {
  id: string
}

// ✅ Good - Custom utility types for domain logic
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Create user with required name but optional other fields
type CreateUserData = RequiredFields<Partial<User>, 'name' | 'email'>

// ✅ Good - Branded types for type safety
type UserId = string & { readonly brand: unique symbol }
type EmailAddress = string & { readonly brand: unique symbol }

const createUserId = (id: string): UserId => id as UserId
const createEmail = (email: string): EmailAddress => {
  if (!email.includes('@')) {
    throw new Error('Invalid email format')
  }
  return email as EmailAddress
}

// ❌ Bad - Overusing any or unknown without proper narrowing
const processUserData = (data: any) => {
  return data.name + data.email  // No type safety
}

// ✅ Good - Proper type narrowing
const processUserData = (data: unknown): string => {
  if (isUser(data)) {
    return `${data.name} (${data.email})`
  }
  throw new Error('Invalid user data')
}

const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  )
}
```

## Function and Method Typing

### Function Signatures
```typescript
// ✅ Good - Explicit function typing with proper return types
const fetchUser = async (id: string): Promise<User | null> => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    if (error.status === 404) {
      return null
    }
    throw error
  }
}

// ✅ Good - Overloaded functions for different use cases
function createElement(tag: 'div'): HTMLDivElement
function createElement(tag: 'span'): HTMLSpanElement
function createElement(tag: 'button'): HTMLButtonElement
function createElement(tag: string): HTMLElement
function createElement(tag: string): HTMLElement {
  return document.createElement(tag)
}

// ✅ Good - Higher-order function typing
const withLogging = <T extends (...args: any[]) => any>(
  fn: T
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log(`Calling ${fn.name} with args:`, args)
    const result = fn(...args)
    console.log(`${fn.name} returned:`, result)
    return result
  }
}

// ✅ Good - Event handler typing
type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void
type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void

const handleFormSubmit: FormSubmitHandler = (event) => {
  event.preventDefault()
  // Type-safe event handling
}

// ❌ Bad - Implicit any parameters and return types
const fetchUser = async (id) => {  // id is implicitly any
  const response = await api.get(`/users/${id}`)
  return response.data  // return type is any
}

// ❌ Bad - Function type without proper constraints
const processData = (callback: Function) => {  // Function is too broad
  return callback()
}
```

### Method and Class Typing
```typescript
// ✅ Good - Well-typed class with access modifiers
class UserService {
  private readonly repository: Repository<User>
  private cache = new Map<string, User>()

  constructor(repository: Repository<User>) {
    this.repository = repository
  }

  async findById(id: string): Promise<User | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!
    }

    const user = await this.repository.findById(id)
    if (user) {
      this.cache.set(id, user)
    }

    return user
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date()
    const newUser: Omit<User, 'id'> = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    }

    const user = await this.repository.create(newUser)
    this.cache.set(user.id, user)
    return user
  }

  private clearCache(): void {
    this.cache.clear()
  }
}

// ✅ Good - Abstract base class with proper typing
abstract class BaseRepository<T extends { id: string }> {
  protected abstract tableName: string

  abstract findById(id: string): Promise<T | null>
  abstract create(entity: Omit<T, 'id'>): Promise<T>

  protected validateId(id: string): asserts id is NonEmptyString {
    if (!id || id.trim().length === 0) {
      throw new Error('ID cannot be empty')
    }
  }
}

type NonEmptyString = string & { readonly brand: unique symbol }
```

## Alternative Perspective
**Counter-point**: Overly complex TypeScript patterns with advanced generics and utility types can make code harder to understand for junior developers. Sometimes using simpler, more explicit types leads to more maintainable code than leveraging every advanced TypeScript feature.

## Error Handling and Type Guards

### Discriminated Unions for Error Handling
```typescript
// ✅ Good - Result pattern with discriminated unions
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E }

const fetchUserSafely = async (id: string): Promise<Result<User, ApiError>> => {
  try {
    const user = await userService.findById(id)
    if (!user) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }
    }
    return { success: true, data: user }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Usage with type narrowing
const handleUserFetch = async (id: string) => {
  const result = await fetchUserSafely(id)

  if (result.success) {
    // TypeScript knows result.data is User
    console.log(`User: ${result.data.name}`)
  } else {
    // TypeScript knows result.error is ApiError
    console.error(`Error: ${result.error.message}`)
  }
}

// ✅ Good - Custom error types with proper inheritance
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

// Type guard for error instances
const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError
}
```

### Advanced Type Guards
```typescript
// ✅ Good - Comprehensive type guards
const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const hasProperty = <T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> => {
  return isObject(obj) && prop in obj
}

// Complex type guard for API responses
const isUserResponse = (response: unknown): response is User => {
  return (
    isObject(response) &&
    hasProperty(response, 'id') &&
    hasProperty(response, 'name') &&
    hasProperty(response, 'email') &&
    isString(response.id) &&
    isString(response.name) &&
    isString(response.email)
  )
}

// ✅ Good - Type predicate functions
const isNonEmpty = <T>(array: T[]): array is [T, ...T[]] => {
  return array.length > 0
}

const filterNullish = <T>(array: (T | null | undefined)[]): T[] => {
  return array.filter((item): item is T => item != null)
}

// Usage
const processUsers = (users: (User | null)[]) => {
  const validUsers = filterNullish(users)
  if (isNonEmpty(validUsers)) {
    // TypeScript knows validUsers is [User, ...User[]]
    const firstUser = validUsers[0] // No undefined check needed
    console.log(`First user: ${firstUser.name}`)
  }
}
```

## API and External Data Typing

### API Response Typing
```typescript
// ✅ Good - Comprehensive API typing with validation
interface ApiResponse<T> {
  data: T
  status: number
  message?: string
  timestamp: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Runtime validation with Zod
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

type User = z.infer<typeof UserSchema>

const validateUser = (data: unknown): User => {
  return UserSchema.parse(data)
}

// ✅ Good - API client with proper typing
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (schema) {
      return schema.parse(data)
    }

    return data as T
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (schema) {
      return schema.parse(data)
    }

    return data as T
  }
}

// Usage with validation
const api = new ApiClient('https://api.example.com')

const getUser = async (id: string): Promise<User> => {
  return api.get(`/users/${id}`, UserSchema)
}
```

### Environment and Configuration Typing
```typescript
// ✅ Good - Environment variable validation
const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().transform(Number).pipe(z.number().positive()),
  API_URL: z.string().url(),
})

type Environment = z.infer<typeof EnvironmentSchema>

const env: Environment = EnvironmentSchema.parse(process.env)

// ✅ Good - Configuration with defaults
interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  auth: {
    tokenKey: string
    refreshTokenKey: string
    expirationTime: number
  }
  features: {
    enableAnalytics: boolean
    enableNotifications: boolean
    maxFileSize: number
  }
}

const createConfig = (overrides: DeepPartial<AppConfig> = {}): AppConfig => {
  const defaultConfig: AppConfig = {
    api: {
      baseUrl: env.API_URL,
      timeout: 10000,
      retries: 3,
    },
    auth: {
      tokenKey: 'auth_token',
      refreshTokenKey: 'refresh_token',
      expirationTime: 3600000, // 1 hour
    },
    features: {
      enableAnalytics: env.NODE_ENV === 'production',
      enableNotifications: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  }

  return mergeDeep(defaultConfig, overrides)
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

## Module and Import/Export Patterns

### Export Strategies
```typescript
// ✅ Good - Named exports with clear interface
// user.types.ts
export interface User {
  id: string
  name: string
  email: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

// user.service.ts
export class UserService {
  // Implementation
}

export const userService = new UserService()

// user.utils.ts
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const formatUserName = (user: User): string => {
  return `${user.name} <${user.email}>`
}

// index.ts - Barrel export
export type { User, CreateUserRequest, UpdateUserRequest } from './user.types'
export { UserService, userService } from './user.service'
export { validateEmail, formatUserName } from './user.utils'

// ✅ Good - Default exports for single-purpose modules
// Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
export type { ButtonProps }

// ❌ Bad - Mixing default and named exports inconsistently
export default class UserService {}
export const userService = new UserService()  // Confusing
```

### Import Organization
```typescript
// ✅ Good - Organized import structure
// 1. Node modules
import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { clsx } from 'clsx'

// 2. Internal libraries/utilities
import { cn } from '@/lib/utils'
import { api } from '@/lib/api-client'

// 3. Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/common/loading-spinner'

// 4. Types
import type { User, CreateUserRequest } from '@/types/user'
import type { ApiResponse } from '@/types/api'

// 5. Local imports
import { validateUserData } from './utils'
import { useUserForm } from './hooks'

// ❌ Bad - Unorganized imports
import { Button } from '@/components/ui/button'
import React from 'react'
import type { User } from '@/types/user'
import { api } from '@/lib/api-client'
import { useState } from 'react'
```

## Alternative Perspective
**Counter-point**: Extensive type validation and complex type patterns can significantly impact bundle size and runtime performance. Sometimes trusting your API contracts and using simpler types leads to better performance, especially in resource-constrained environments.

This TypeScript code style standard ensures type-safe, maintainable, and robust applications while leveraging TypeScript's powerful type system effectively.