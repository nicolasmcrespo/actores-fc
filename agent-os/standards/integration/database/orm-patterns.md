# ORM Integration Patterns

## Overview
Standards for integrating Object-Relational Mapping (ORM) libraries with application architecture, focusing on type safety, performance, and maintainable data access patterns.

## Supabase Integration Patterns

### Type-Safe Database Client
```typescript
// lib/database.ts - Supabase client with full type safety
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database' // Generated types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Type-safe table references
export type Tables = Database['public']['Tables']
export type UserRow = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']
```

### Repository Pattern Implementation
```typescript
// repositories/base-repository.ts
export abstract class BaseRepository<T, TInsert = Partial<T>, TUpdate = Partial<T>> {
  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new DatabaseError(`Failed to find ${this.tableName} by id`, error)
    }

    return data as T
  }

  async create(data: TInsert): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new DatabaseError(`Failed to create ${this.tableName}`, error)
    }

    return result as T
  }

  async update(id: string, data: TUpdate): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new DatabaseError(`Failed to update ${this.tableName}`, error)
    }

    return result as T
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new DatabaseError(`Failed to delete ${this.tableName}`, error)
    }
  }
}
```

### Entity-Specific Repository
```typescript
// repositories/user-repository.ts
export class UserRepository extends BaseRepository<UserRow, UserInsert, UserUpdate> {
  constructor() {
    super(supabase, 'users')
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to find user by email', error)
    }

    return data
  }

  async findWithProjects(userId: string): Promise<UserWithProjects | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        projects (
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to find user with projects', error)
    }

    return data as UserWithProjects
  }

  async createWithProfile(userData: UserInsert, profileData: ProfileInsert): Promise<UserRow> {
    const { data, error } = await this.supabase.rpc('create_user_with_profile', {
      user_data: userData,
      profile_data: profileData
    })

    if (error) {
      throw new DatabaseError('Failed to create user with profile', error)
    }

    return data
  }
}

export const userRepository = new UserRepository()
```

## Alternative Perspective
**Counter-point**: Repository patterns can add unnecessary abstraction for simple CRUD operations. Sometimes using the ORM client directly in service layers leads to more straightforward, debuggable code, especially when team members are already familiar with the ORM's API.

## Query Builder Patterns

### Complex Query Construction
```typescript
// services/query-builder.ts
export class QueryBuilder {
  static users() {
    return new UserQueryBuilder()
  }

  static projects() {
    return new ProjectQueryBuilder()
  }
}

class UserQueryBuilder {
  private query = supabase.from('users').select('*')

  withProjects() {
    this.query = supabase.from('users').select(`
      *,
      projects (
        id,
        name,
        status,
        created_at
      )
    `)
    return this
  }

  withRole(role: string) {
    this.query = this.query.eq('role', role)
    return this
  }

  activeOnly() {
    this.query = this.query.eq('status', 'active')
    return this
  }

  orderByCreated(ascending = false) {
    this.query = this.query.order('created_at', { ascending })
    return this
  }

  paginate(page: number, limit: number = 10) {
    const start = (page - 1) * limit
    const end = start + limit - 1
    this.query = this.query.range(start, end)
    return this
  }

  async execute<T = UserRow[]>(): Promise<{ data: T; count: number }> {
    const { data, error, count } = await this.query

    if (error) {
      throw new DatabaseError('Query execution failed', error)
    }

    return { data: data as T, count: count || 0 }
  }

  async first<T = UserRow>(): Promise<T | null> {
    const { data, error } = await this.query.limit(1).single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Query execution failed', error)
    }

    return data as T
  }
}

// Usage examples
const activeAdmins = await QueryBuilder.users()
  .activeOnly()
  .withRole('admin')
  .orderByCreated()
  .execute()

const userWithProjects = await QueryBuilder.users()
  .withProjects()
  .first()
```

### Real-time Subscription Patterns
```typescript
// hooks/use-realtime-data.ts
export function useRealtimeData<T>(
  table: string,
  filter?: { column: string; value: any }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(table).select('*')

        if (filter) {
          query = query.eq(filter.column, filter.value)
        }

        const { data: initialData, error: fetchError } = await query

        if (fetchError) throw fetchError

        setData(initialData as T[])
        setLoading(false)

        // Setup real-time subscription
        subscription = supabase
          .channel(`${table}-changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              ...(filter && { filter: `${filter.column}=eq.${filter.value}` })
            },
            (payload) => {
              setData(current => {
                switch (payload.eventType) {
                  case 'INSERT':
                    return [...current, payload.new as T]

                  case 'UPDATE':
                    return current.map(item =>
                      (item as any).id === payload.new.id ? payload.new as T : item
                    )

                  case 'DELETE':
                    return current.filter(item =>
                      (item as any).id !== payload.old.id
                    )

                  default:
                    return current
                }
              })
            }
          )
          .subscribe()

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [table, filter?.column, filter?.value])

  return { data, loading, error }
}

// Usage
const { data: messages, loading } = useRealtimeData<Message>('messages', {
  column: 'channel_id',
  value: channelId
})
```

## Transaction Management

### Database Transaction Wrapper
```typescript
// lib/transaction.ts
export class TransactionManager {
  static async execute<T>(
    operations: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    // Note: Supabase doesn't support traditional transactions via client
    // This is a pattern for when using with server-side operations
    const client = supabase

    try {
      const result = await operations(client)
      return result
    } catch (error) {
      // Handle rollback logic here if needed
      throw new DatabaseError('Transaction failed', error)
    }
  }

  // For complex operations, use RPC functions
  static async rpc<T>(
    functionName: string,
    parameters: Record<string, any>
  ): Promise<T> {
    const { data, error } = await supabase.rpc(functionName, parameters)

    if (error) {
      throw new DatabaseError(`RPC function ${functionName} failed`, error)
    }

    return data as T
  }
}

// Example RPC function for complex operations
await TransactionManager.rpc('transfer_credits', {
  from_user_id: 'user1',
  to_user_id: 'user2',
  amount: 100
})
```

### Optimistic Updates Pattern
```typescript
// hooks/use-optimistic-mutation.ts
export function useOptimisticMutation<T, TVariables>(
  mutationFn: (variables: TVariables) => Promise<T>,
  updateKey: string[]
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: updateKey })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(updateKey)

      // Optimistically update the cache
      queryClient.setQueryData(updateKey, (old: T[]) => {
        // Apply optimistic update based on mutation type
        return applyOptimisticUpdate(old, variables)
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(updateKey, context.previousData)
      }
    },
    onSettled: () => {
      // Refetch to get the actual data
      queryClient.invalidateQueries({ queryKey: updateKey })
    }
  })
}

function applyOptimisticUpdate<T>(data: T[], variables: any): T[] {
  // Implement optimistic update logic based on your needs
  return data
}
```

## Error Handling Patterns

### Database Error Classification
```typescript
// lib/database-errors.ts
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'DatabaseError'
    this.code = originalError?.code || code
  }

  static fromSupabaseError(error: any, context: string): DatabaseError {
    const errorMap: Record<string, string> = {
      '23505': 'Duplicate entry - this record already exists',
      '23503': 'Referenced record not found',
      '23514': 'Data validation failed',
      'PGRST116': 'Record not found',
      '42501': 'Permission denied'
    }

    const message = errorMap[error.code] || `Database operation failed: ${context}`

    return new DatabaseError(message, error, error.code)
  }

  isConstraintViolation(): boolean {
    return this.code?.startsWith('23') || false
  }

  isNotFound(): boolean {
    return this.code === 'PGRST116'
  }

  isPermissionDenied(): boolean {
    return this.code === '42501'
  }
}

// Usage in repositories
try {
  const user = await userRepository.create(userData)
  return user
} catch (error) {
  const dbError = DatabaseError.fromSupabaseError(error, 'creating user')

  if (dbError.isConstraintViolation()) {
    throw new ValidationError('Email already exists')
  }

  throw dbError
}
```

## Alternative Perspective
**Counter-point**: Extensive error handling and abstraction layers can make debugging database issues more difficult. Sometimes letting database errors bubble up with clear error messages is more helpful than trying to abstract them into generic application errors.

## Performance Optimization Patterns

### Query Optimization Strategies
```typescript
// lib/query-optimizer.ts
export class QueryOptimizer {
  // Batch similar queries together
  static async batchLoad<T>(
    table: string,
    ids: string[],
    selectFields: string = '*'
  ): Promise<T[]> {
    if (ids.length === 0) return []

    const { data, error } = await supabase
      .from(table)
      .select(selectFields)
      .in('id', ids)

    if (error) {
      throw new DatabaseError(`Failed to batch load from ${table}`, error)
    }

    return data as T[]
  }

  // Use proper indexes for filtering
  static buildIndexOptimizedQuery(table: string, filters: Record<string, any>) {
    let query = supabase.from(table).select('*')

    // Apply filters in order of selectivity (most selective first)
    const orderedFilters = Object.entries(filters)
      .sort(([, a], [, b]) => {
        // Prioritize exact matches over ranges
        if (typeof a === 'string' && typeof b !== 'string') return -1
        if (typeof b === 'string' && typeof a !== 'string') return 1
        return 0
      })

    orderedFilters.forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    })

    return query
  }

  // Pagination with cursor-based approach for better performance
  static async paginateWithCursor<T>(
    table: string,
    cursorField: string = 'created_at',
    cursor?: string,
    limit: number = 20
  ): Promise<{ data: T[]; nextCursor: string | null }> {
    let query = supabase
      .from(table)
      .select('*')
      .order(cursorField, { ascending: false })
      .limit(limit + 1) // Fetch one extra to determine if there's a next page

    if (cursor) {
      query = query.lt(cursorField, cursor)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError(`Failed to paginate ${table}`, error)
    }

    const hasNext = data.length > limit
    const results = hasNext ? data.slice(0, -1) : data
    const nextCursor = hasNext ? data[data.length - 1][cursorField] : null

    return {
      data: results as T[],
      nextCursor
    }
  }
}
```

This ORM integration standard provides type-safe, performant, and maintainable patterns for working with databases in modern applications while leveraging the full power of TypeScript and modern JavaScript features.