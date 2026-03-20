# API Contract Standards

## Overview
Standards for type-safe communication between frontend and backend using shared TypeScript types and consistent API patterns.

## Type-Safe API Architecture

### Shared Type Definitions
```typescript
// shared/types/api.ts - Shared between frontend and backend
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  status: number
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}
```

### Resource Type Definitions
```typescript
// shared/types/user.ts
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  language: string
}

// Input/Output type variations
export type CreateUserRequest = Pick<User, 'email' | 'name'> & {
  password: string
}

export type UpdateUserRequest = Partial<Pick<User, 'name' | 'preferences'>>

export type UserResponse = Omit<User, 'password'>
```

## Alternative Perspective
**Counter-point**: Shared types between frontend and backend can create tight coupling and deployment dependencies. Some teams prefer keeping types separate and using runtime validation at boundaries.

## API Client Implementation

### Type-Safe API Client
```typescript
// lib/api-client.ts
import { z } from 'zod'

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Generic API method with type safety
  async request<T>(
    endpoint: string,
    options: RequestInit & {
      params?: Record<string, string>
      schema?: z.ZodSchema<T>
    } = {}
  ): Promise<ApiResponse<T>> {
    const { params, schema, ...fetchOptions } = options

    // Build URL with query parameters
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    // Add authentication header if available
    const token = localStorage.getItem('auth_token')
    const headers = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    }

    try {
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError({
          status: response.status,
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'An error occurred',
          details: data.details,
        })
      }

      // Runtime validation if schema provided
      if (schema && data.data) {
        const validatedData = schema.parse(data.data)
        return { ...data, data: validatedData }
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: { originalError: error.message },
      })
    }
  }

  // Convenience methods
  get<T>(endpoint: string, options?: { params?: Record<string, string>; schema?: z.ZodSchema<T> }) {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  post<T>(endpoint: string, body?: any, options?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    })
  }

  put<T>(endpoint: string, body?: any, options?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    })
  }

  delete<T>(endpoint: string, options?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>(endpoint, { method: 'DELETE', ...options })
  }
}

export const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL!)
```

## Resource-Specific API Services

### User Service Example
```typescript
// services/users.ts
import { z } from 'zod'
import { api } from '@/lib/api-client'
import { User, CreateUserRequest, UpdateUserRequest, UserResponse } from '@/types/user'

// Validation schemas
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.enum(['admin', 'user']),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      marketing: z.boolean(),
    }),
    language: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const userService = {
  // Get current user
  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get('/auth/me', { schema: UserSchema })
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch current user')
    }
    return response.data
  },

  // Get all users (admin only)
  async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  } = {}): Promise<PaginatedResponse<UserResponse>> {
    const queryParams = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    )

    const response = await api.get('/users', {
      params: queryParams,
      schema: z.array(UserSchema),
    })

    return response as PaginatedResponse<UserResponse>
  },

  // Create user
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await api.post('/users', userData, { schema: UserSchema })
    if (!response.success || !response.data) {
      throw new Error('Failed to create user')
    }
    return response.data
  },

  // Update user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put(`/users/${id}`, userData, { schema: UserSchema })
    if (!response.success || !response.data) {
      throw new Error('Failed to update user')
    }
    return response.data
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const response = await api.delete(`/users/${id}`)
    if (!response.success) {
      throw new Error('Failed to delete user')
    }
  },
}
```

## React Query Integration

### Type-Safe Hooks
```typescript
// hooks/users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/users'
import { CreateUserRequest, UpdateUserRequest } from '@/types/user'

// Query keys for cache management
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, 'current'] as const,
}

// Current user hook
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Users list hook
export function useUsers(params: {
  page?: number
  limit?: number
  search?: string
  role?: string
} = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    keepPreviousData: true,
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userService.createUser(userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserRequest }) =>
      userService.updateUser(id, userData),
    onSuccess: (updatedUser) => {
      // Update specific user in cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser)
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
```

## Error Handling Patterns

### Global Error Handling
```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>,
    public timestamp: string = new Date().toISOString()
  ) {
    super(message)
    this.name = 'ApiError'
  }

  // Check error type
  isValidationError(): boolean {
    return this.status === 422
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403
  }

  isNotFoundError(): boolean {
    return this.status === 404
  }

  isServerError(): boolean {
    return this.status >= 500
  }
}

// Error boundary for API errors
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again'
      case 'UNAUTHORIZED':
        return 'Please log in to continue'
      case 'FORBIDDEN':
        return "You don't have permission to perform this action"
      case 'NOT_FOUND':
        return 'The requested resource was not found'
      case 'RATE_LIMITED':
        return 'Too many requests. Please try again later'
      default:
        return error.message || 'An unexpected error occurred'
    }
  }
  return 'An unexpected error occurred'
}
```

## Alternative Perspective
**Counter-point**: Extensive error handling can make APIs complex to maintain. Sometimes it's better to have simple, generic error handling and add specific cases only when needed by real user scenarios.

## Testing API Contracts

### Mock API for Testing
```typescript
// __mocks__/api.ts
import { ApiResponse, User } from '@/types'

export const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    preferences: {
      theme: 'light',
      notifications: { email: true, push: false, marketing: false },
      language: 'en',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// Mock successful responses
mockApi.get.mockImplementation((endpoint: string) => {
  if (endpoint === '/auth/me') {
    return Promise.resolve({
      success: true,
      data: mockUsers[0],
    })
  }
  return Promise.resolve({ success: true, data: [] })
})
```

### Integration Tests
```typescript
// __tests__/user-service.test.ts
import { userService } from '@/services/users'
import { mockApi, mockUsers } from '@/__mocks__/api'

jest.mock('@/lib/api-client', () => ({ api: mockApi }))

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getCurrentUser returns typed user data', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: mockUsers[0],
    })

    const user = await userService.getCurrentUser()

    expect(mockApi.get).toHaveBeenCalledWith('/auth/me', expect.any(Object))
    expect(user).toEqual(mockUsers[0])
    expect(user.email).toBe('john@example.com') // Type-safe access
  })

  test('createUser handles validation errors', async () => {
    const validationError = {
      success: false,
      error: 'Validation failed',
      details: {
        email: ['Email is already taken'],
      },
    }

    mockApi.post.mockRejectedValue(new ApiError(422, 'VALIDATION_ERROR', 'Validation failed'))

    await expect(
      userService.createUser({
        email: 'existing@example.com',
        name: 'Test User',
        password: 'password123',
      })
    ).rejects.toThrow('Validation failed')
  })
})
```

This API contract standard ensures type safety, consistent error handling, and maintainable communication between your frontend and backend systems.