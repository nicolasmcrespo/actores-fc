# State Management Integration Standards

## Overview
Standards for integrating state management solutions with UI frameworks, focusing on predictable state updates, type safety, and performance optimization.

## Zustand Integration Patterns

### Store Architecture
```typescript
// stores/app-store.ts - Main application state
import { create } from 'zustand'
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface AppState {
  // UI State
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notifications: Notification[]

  // User State
  user: User | null
  isAuthenticated: boolean

  // App State
  loading: boolean
  error: string | null

  // Actions
  actions: {
    // Theme actions
    setTheme: (theme: AppState['theme']) => void
    toggleSidebar: () => void

    // User actions
    setUser: (user: User | null) => void
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => Promise<void>

    // Notification actions
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
    clearNotifications: () => void

    // App actions
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    reset: () => void
  }
}

const initialState = {
  theme: 'system' as const,
  sidebarOpen: true,
  notifications: [],
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          actions: {
            // Theme actions
            setTheme: (theme) => {
              set((state) => {
                state.theme = theme
              })
            },

            toggleSidebar: () => {
              set((state) => {
                state.sidebarOpen = !state.sidebarOpen
              })
            },

            // User actions
            setUser: (user) => {
              set((state) => {
                state.user = user
                state.isAuthenticated = !!user
              })
            },

            login: async (credentials) => {
              set((state) => {
                state.loading = true
                state.error = null
              })

              try {
                const user = await authService.login(credentials)
                set((state) => {
                  state.user = user
                  state.isAuthenticated = true
                  state.loading = false
                })
              } catch (error) {
                set((state) => {
                  state.error = error instanceof Error ? error.message : 'Login failed'
                  state.loading = false
                })
                throw error
              }
            },

            logout: async () => {
              await authService.logout()
              set((state) => {
                state.user = null
                state.isAuthenticated = false
              })
            },

            // Notification actions
            addNotification: (notification) => {
              const id = Math.random().toString(36).slice(2)
              set((state) => {
                state.notifications.push({ ...notification, id })
              })

              // Auto-remove after 5 seconds
              if (notification.type !== 'error') {
                setTimeout(() => {
                  get().actions.removeNotification(id)
                }, 5000)
              }
            },

            removeNotification: (id) => {
              set((state) => {
                state.notifications = state.notifications.filter(n => n.id !== id)
              })
            },

            clearNotifications: () => {
              set((state) => {
                state.notifications = []
              })
            },

            // App actions
            setLoading: (loading) => {
              set((state) => {
                state.loading = loading
              })
            },

            setError: (error) => {
              set((state) => {
                state.error = error
              })
            },

            reset: () => {
              set(initialState)
            }
          }
        }))
      ),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          // Don't persist user data, notifications, or temporary state
        }),
      }
    ),
    { name: 'app-store' }
  )
)

// Selector hooks for optimal re-rendering
export const useTheme = () => useAppStore((state) => state.theme)
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useNotifications = () => useAppStore((state) => state.notifications)
export const useAppActions = () => useAppStore((state) => state.actions)
```

### Feature-Specific Stores
```typescript
// stores/todo-store.ts - Feature-specific state
interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
  loading: boolean
  error: string | null

  actions: {
    // CRUD operations
    addTodo: (text: string) => Promise<void>
    updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
    deleteTodo: (id: string) => Promise<void>
    toggleTodo: (id: string) => Promise<void>

    // Bulk operations
    markAllComplete: () => Promise<void>
    clearCompleted: () => Promise<void>

    // Filter operations
    setFilter: (filter: TodoState['filter']) => void

    // Data operations
    loadTodos: () => Promise<void>
    refresh: () => Promise<void>
  }
}

export const useTodoStore = create<TodoState>()(
  devtools(
    immer((set, get) => ({
      todos: [],
      filter: 'all',
      loading: false,
      error: null,

      actions: {
        addTodo: async (text) => {
          set((state) => { state.loading = true })

          try {
            const todo = await todoService.create({ text, completed: false })
            set((state) => {
              state.todos.push(todo)
              state.loading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to add todo'
              state.loading = false
            })
          }
        },

        updateTodo: async (id, updates) => {
          set((state) => { state.loading = true })

          try {
            const updatedTodo = await todoService.update(id, updates)
            set((state) => {
              const index = state.todos.findIndex(t => t.id === id)
              if (index !== -1) {
                state.todos[index] = updatedTodo
              }
              state.loading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update todo'
              state.loading = false
            })
          }
        },

        deleteTodo: async (id) => {
          // Optimistic update
          set((state) => {
            state.todos = state.todos.filter(t => t.id !== id)
          })

          try {
            await todoService.delete(id)
          } catch (error) {
            // Rollback on error
            await get().actions.loadTodos()
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to delete todo'
            })
          }
        },

        toggleTodo: async (id) => {
          const todo = get().todos.find(t => t.id === id)
          if (!todo) return

          await get().actions.updateTodo(id, { completed: !todo.completed })
        },

        markAllComplete: async () => {
          const incompleteTodos = get().todos.filter(t => !t.completed)
          await Promise.all(
            incompleteTodos.map(todo => get().actions.updateTodo(todo.id, { completed: true }))
          )
        },

        clearCompleted: async () => {
          const completedTodos = get().todos.filter(t => t.completed)
          await Promise.all(
            completedTodos.map(todo => get().actions.deleteTodo(todo.id))
          )
        },

        setFilter: (filter) => {
          set((state) => {
            state.filter = filter
          })
        },

        loadTodos: async () => {
          set((state) => {
            state.loading = true
            state.error = null
          })

          try {
            const todos = await todoService.getAll()
            set((state) => {
              state.todos = todos
              state.loading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load todos'
              state.loading = false
            })
          }
        },

        refresh: async () => {
          await get().actions.loadTodos()
        }
      }
    })),
    { name: 'todo-store' }
  )
)

// Computed selectors
export const useFilteredTodos = () => {
  return useTodoStore((state) => {
    const { todos, filter } = state

    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed)
      case 'completed':
        return todos.filter(todo => todo.completed)
      default:
        return todos
    }
  })
}

export const useTodoStats = () => {
  return useTodoStore((state) => ({
    total: state.todos.length,
    completed: state.todos.filter(t => t.completed).length,
    active: state.todos.filter(t => !t.completed).length
  }))
}
```

## Alternative Perspective
**Counter-point**: Complex state management with Zustand might be overkill for many applications. React's built-in useState and useContext can handle most use cases more simply, and adding external state management introduces complexity that may not be necessary.

## React Query Integration

### Optimistic Updates with Server State
```typescript
// hooks/use-todo-mutations.ts
export function useTodoMutations() {
  const queryClient = useQueryClient()
  const todoActions = useTodoStore((state) => state.actions)

  const addTodoMutation = useMutation({
    mutationFn: todoService.create,
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos'])

      // Optimistically update local state
      const optimisticTodo = {
        ...newTodo,
        id: Math.random().toString(36).slice(2), // Temporary ID
        createdAt: new Date().toISOString()
      }

      // Update both server cache and local store
      queryClient.setQueryData(['todos'], (old: Todo[]) => [...(old || []), optimisticTodo])
      todoActions.addTodo(optimisticTodo)

      return { previousTodos }
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
        todoActions.loadTodos() // Refresh local store
      }
    },
    onSettled: () => {
      // Refetch to get actual data
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Todo> }) =>
      todoService.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData(['todos'])

      // Update both caches optimistically
      queryClient.setQueryData(['todos'], (old: Todo[]) =>
        old?.map(todo => todo.id === id ? { ...todo, ...updates } : todo) || []
      )

      todoActions.updateTodo(id, updates)

      return { previousTodos }
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
        todoActions.loadTodos()
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  return {
    addTodo: addTodoMutation.mutate,
    updateTodo: updateTodoMutation.mutate,
    isAdding: addTodoMutation.isPending,
    isUpdating: updateTodoMutation.isPending
  }
}
```

### Synchronized State Pattern
```typescript
// hooks/use-synchronized-state.ts
export function useSynchronizedState<T>(
  queryKey: string[],
  storeSelector: (state: any) => T,
  storeActions: any
) {
  const queryClient = useQueryClient()
  const storeData = useAppStore(storeSelector)

  // Sync server state to local store when it changes
  useEffect(() => {
    const serverData = queryClient.getQueryData(queryKey)
    if (serverData && JSON.stringify(serverData) !== JSON.stringify(storeData)) {
      storeActions.syncFromServer(serverData)
    }
  }, [queryClient.getQueryData(queryKey), storeData, storeActions, queryKey])

  // Sync local store to server state when store changes
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey.join('.') === queryKey.join('.') && event.type === 'updated') {
        const newData = event.query.state.data
        if (newData && JSON.stringify(newData) !== JSON.stringify(storeData)) {
          storeActions.syncFromServer(newData)
        }
      }
    })

    return unsubscribe
  }, [queryClient, queryKey, storeData, storeActions])

  return storeData
}
```

## Performance Optimization

### Selective Subscriptions
```typescript
// utils/store-selectors.ts
export const createShallowSelector = <T, U>(selector: (state: T) => U) =>
  (state: T) => {
    const result = selector(state)
    return typeof result === 'object' ? { ...result } : result
  }

// Memoized selectors for complex computations
export const createMemoizedSelector = <T, U>(
  selector: (state: T) => U,
  equalityFn?: (a: U, b: U) => boolean
) => {
  let lastResult: U
  let lastState: T

  return (state: T): U => {
    if (state !== lastState) {
      const newResult = selector(state)

      if (equalityFn ? !equalityFn(lastResult, newResult) : lastResult !== newResult) {
        lastResult = newResult
      }

      lastState = state
    }

    return lastResult
  }
}

// Usage
const selectTodoStats = createMemoizedSelector(
  (state: TodoState) => ({
    total: state.todos.length,
    completed: state.todos.filter(t => t.completed).length,
    active: state.todos.filter(t => !t.completed).length
  }),
  (a, b) => a.total === b.total && a.completed === b.completed && a.active === b.active
)

export const useTodoStats = () => useTodoStore(selectTodoStats)
```

### State Middleware Composition
```typescript
// lib/store-middleware.ts
export const logger = <T>(
  config: StateCreator<T>,
  options: { name: string }
) =>
  (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) =>
    config(
      (...args) => {
        console.log(`[${options.name}] Previous state:`, get())
        set(...args)
        console.log(`[${options.name}] New state:`, get())
      },
      get,
      api
    )

export const errorBoundary = <T>(
  config: StateCreator<T>
) =>
  (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) =>
    config(
      (...args) => {
        try {
          set(...args)
        } catch (error) {
          console.error('State update error:', error)
          // Could send to error reporting service here
        }
      },
      get,
      api
    )

// Compose middleware
export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      logger(
        errorBoundary(
          immer((set, get) => ({
            // Store implementation
          }))
        ),
        { name: 'example-store' }
      ),
      { name: 'example-store' }
    ),
    { name: 'example-store' }
  )
)
```

## Testing Patterns

### Store Testing Utilities
```typescript
// test-utils/store-testing.tsx
export function createTestStore<T>(initialState?: Partial<T>) {
  const store = create<T>()((set, get) => ({
    ...defaultState,
    ...initialState,
    // Include actions
  }))

  return store
}

export function renderWithStore<T>(
  component: React.ReactElement,
  store?: StoreApi<T>
) {
  const TestProvider = ({ children }: { children: React.ReactNode }) => {
    if (store) {
      // If custom store provided, temporarily replace the default store
      const originalStore = useAppStore.getState
      useAppStore.getState = store.getState

      return <>{children}</>
    }
    return <>{children}</>
  }

  return render(component, { wrapper: TestProvider })
}

// Usage in tests
describe('TodoList', () => {
  it('renders todos from store', () => {
    const testStore = createTestStore({
      todos: [
        { id: '1', text: 'Test todo', completed: false },
        { id: '2', text: 'Another todo', completed: true }
      ]
    })

    renderWithStore(<TodoList />, testStore)

    expect(screen.getByText('Test todo')).toBeInTheDocument()
    expect(screen.getByText('Another todo')).toBeInTheDocument()
  })

  it('handles adding todos', async () => {
    const testStore = createTestStore()

    renderWithStore(<TodoForm />, testStore)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New todo' } })
    fireEvent.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(testStore.getState().todos).toHaveLength(1)
      expect(testStore.getState().todos[0].text).toBe('New todo')
    })
  })
})
```

## Alternative Perspective
**Counter-point**: This level of state management abstraction might be overwhelming for smaller teams or simpler applications. Sometimes keeping state management simple with React's built-in hooks and lifting state up when needed leads to more maintainable code than introducing complex store patterns.

This state management standard provides a comprehensive approach to handling both local and server state while maintaining type safety, performance, and testability across your application.