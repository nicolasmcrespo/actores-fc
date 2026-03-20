# JavaScript/TypeScript Code Style Guide

## Variable Declarations

### Use const/let, Never var
```javascript
// ✅ Good
const API_URL = 'https://api.example.com'
let userCount = 0

// ❌ Bad
var API_URL = 'https://api.example.com'
var userCount = 0
```

### Prefer const by Default
```javascript
// ✅ Good - const unless reassignment needed
const users = await fetchUsers()
const isValid = validateInput(data)

// ❌ Bad - unnecessary let
let users = await fetchUsers()  // users never reassigned
let isValid = validateInput(data)  // isValid never reassigned
```

## Alternative Perspective
**Counter-point**: Some developers prefer `let` for readability when the variable's purpose suggests it might change later, even if it doesn't in the current implementation. This can make code intentions clearer.

## Function Declarations

### Prefer Function Expressions for Consistency
```javascript
// ✅ Good - consistent arrow functions
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

const handleSubmit = async (formData) => {
  try {
    await submitForm(formData)
  } catch (error) {
    handleError(error)
  }
}

// ⚠️ Alternative - function declarations (choose one style consistently)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### Async/Await over Promises
```javascript
// ✅ Good - async/await
const fetchUserData = async (userId) => {
  try {
    const user = await api.getUser(userId)
    const profile = await api.getUserProfile(userId)
    return { user, profile }
  } catch (error) {
    throw new Error(`Failed to fetch user data: ${error.message}`)
  }
}

// ❌ Bad - promise chains
const fetchUserData = (userId) => {
  return api.getUser(userId)
    .then(user => {
      return api.getUserProfile(userId)
        .then(profile => ({ user, profile }))
    })
    .catch(error => {
      throw new Error(`Failed to fetch user data: ${error.message}`)
    })
}
```

## Object and Array Handling

### Use Destructuring
```javascript
// ✅ Good - object destructuring
const { name, email, age } = user
const { data, loading, error } = useQuery()

// ✅ Good - array destructuring
const [first, second, ...rest] = items
const [count, setCount] = useState(0)

// ❌ Bad - manual property access
const name = user.name
const email = user.email
const age = user.age
```

### Spread Operator for Immutability
```javascript
// ✅ Good - immutable updates
const updatedUser = {
  ...user,
  name: newName,
  updatedAt: new Date()
}

const newItems = [...items, newItem]
const filteredItems = items.filter(item => item.active)

// ❌ Bad - mutation
user.name = newName
user.updatedAt = new Date()
items.push(newItem)
```

## Import/Export Patterns

### Named Exports Preferred
```javascript
// ✅ Good - named exports
export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email)
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// Import with explicit names
import { validateEmail, formatCurrency } from '@/lib/utils'
```

### Default Exports for Single Responsibility
```javascript
// ✅ Good - default export for main component/function
const UserProfile = ({ user }) => {
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

export default UserProfile

// Import
import UserProfile from '@/components/UserProfile'
```

## Alternative Perspective
**Counter-point**: Default exports can make refactoring harder since import names can vary. Some teams prefer named exports everywhere for consistency and better IDE support.

### Import Ordering
```javascript
// ✅ Good - consistent import order
// 1. Node modules
import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

// 2. Internal modules (absolute paths)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

// 3. Relative imports
import './UserProfile.css'
import { validateForm } from '../utils/validation'
```

## Error Handling

### Explicit Error Handling
```javascript
// ✅ Good - explicit error handling
const submitForm = async (formData) => {
  try {
    const response = await api.post('/submit', formData)
    return { success: true, data: response.data }
  } catch (error) {
    if (error.response?.status === 400) {
      return { success: false, error: 'Invalid form data' }
    }
    if (error.response?.status === 401) {
      return { success: false, error: 'Unauthorized' }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ❌ Bad - generic error handling
const submitForm = async (formData) => {
  try {
    const response = await api.post('/submit', formData)
    return response.data
  } catch (error) {
    throw error  // No context or specific handling
  }
}
```

### Type Guards (JavaScript)
```javascript
// ✅ Good - runtime type checking
const isUser = (value) => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.email === 'string'
  )
}

const processUserData = (data) => {
  if (isUser(data)) {
    console.log(`Processing user: ${data.email}`)
  } else {
    throw new Error('Invalid user data')
  }
}
```

## Performance Patterns

### Debouncing and Throttling
```javascript
// ✅ Good - debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
const SearchInput = () => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    }
  }, [debouncedQuery])
}
```

### Lazy Loading Patterns
```javascript
// ✅ Good - code splitting
const LazyComponent = React.lazy(() => import('./HeavyComponent'))

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

## Alternative Perspective
**Counter-point**: Over-optimization with debouncing and lazy loading can add complexity for minimal benefit. Sometimes simple, direct code is more maintainable than clever optimizations.

## Array Methods and Functional Patterns

### Prefer Functional Methods
```javascript
// ✅ Good - functional approach
const activeUsers = users
  .filter(user => user.isActive)
  .map(user => ({
    id: user.id,
    name: user.name,
    lastSeen: formatDate(user.lastSeen)
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

// ❌ Bad - imperative approach
const activeUsers = []
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push({
      id: users[i].id,
      name: users[i].name,
      lastSeen: formatDate(users[i].lastSeen)
    })
  }
}
activeUsers.sort((a, b) => a.name.localeCompare(b.name))
```

### Reduce for Complex Transformations
```javascript
// ✅ Good - reduce for grouping
const usersByRole = users.reduce((acc, user) => {
  const role = user.role || 'guest'
  if (!acc[role]) {
    acc[role] = []
  }
  acc[role].push(user)
  return acc
}, {})

// ✅ Good - reduce for counting
const statusCounts = orders.reduce((counts, order) => {
  counts[order.status] = (counts[order.status] || 0) + 1
  return counts
}, {})
```

## String Handling

### Template Literals for Interpolation
```javascript
// ✅ Good - template literals
const greeting = `Hello, ${user.name}! You have ${unreadCount} unread messages.`
const apiUrl = `${baseUrl}/api/v1/users/${userId}`

// ❌ Bad - string concatenation
const greeting = 'Hello, ' + user.name + '! You have ' + unreadCount + ' unread messages.'
const apiUrl = baseUrl + '/api/v1/users/' + userId
```

### Multiline Strings
```javascript
// ✅ Good - template literals for multiline
const emailTemplate = `
  Dear ${customerName},

  Thank you for your order #${orderNumber}.
  Your items will be shipped within 2-3 business days.

  Best regards,
  The Team
`

// ❌ Bad - string concatenation
const emailTemplate = 'Dear ' + customerName + ',\n\n' +
  'Thank you for your order #' + orderNumber + '.\n' +
  'Your items will be shipped within 2-3 business days.\n\n' +
  'Best regards,\nThe Team'
```

## Conditional Logic

### Ternary for Simple Conditions
```javascript
// ✅ Good - simple ternary
const statusColor = isActive ? 'green' : 'gray'
const displayName = user.name || 'Anonymous'

// ✅ Good - logical AND for conditional rendering
const ErrorMessage = ({ error }) => (
  <div>
    {error && <p className="error">{error.message}</p>}
  </div>
)
```

### Early Returns for Complex Logic
```javascript
// ✅ Good - early returns
const calculateDiscount = (user, order) => {
  if (!user) return 0
  if (!order || order.total < 50) return 0
  if (user.isPremium) return order.total * 0.15
  if (user.isReturning) return order.total * 0.1
  return order.total * 0.05
}

// ❌ Bad - nested conditions
const calculateDiscount = (user, order) => {
  let discount = 0
  if (user) {
    if (order && order.total >= 50) {
      if (user.isPremium) {
        discount = order.total * 0.15
      } else if (user.isReturning) {
        discount = order.total * 0.1
      } else {
        discount = order.total * 0.05
      }
    }
  }
  return discount
}
```

## JSDoc Documentation (When Needed)

### Document Complex Functions
```javascript
/**
 * Calculates the optimal batch size for processing items
 * @param {number} totalItems - Total number of items to process
 * @param {number} memoryLimit - Available memory in MB
 * @param {number} itemSize - Average size per item in KB
 * @returns {number} Optimal batch size
 */
const calculateBatchSize = (totalItems, memoryLimit, itemSize) => {
  const availableMemoryKB = memoryLimit * 1024
  const maxItemsInMemory = Math.floor(availableMemoryKB / itemSize)
  return Math.min(totalItems, maxItemsInMemory, 1000) // Max 1000 per batch
}
```

## Alternative Perspective
**Counter-point**: JSDoc can become outdated quickly and add maintenance overhead. In TypeScript projects, good type definitions often provide better documentation than comments.

## Common Anti-Patterns to Avoid

### Don't Use == (Use ===)
```javascript
// ✅ Good - strict equality
if (user.age === 18) { }
if (response.status === 200) { }

// ❌ Bad - loose equality
if (user.age == 18) { }  // Could match '18' string
if (response.status == 200) { }
```

### Don't Mutate Props/Parameters
```javascript
// ✅ Good - create new objects
const addTimestamp = (user) => {
  return {
    ...user,
    createdAt: new Date()
  }
}

// ❌ Bad - mutating parameter
const addTimestamp = (user) => {
  user.createdAt = new Date()  // Mutates original object
  return user
}
```

### Don't Use Magic Numbers
```javascript
// ✅ Good - named constants
const MAX_RETRY_ATTEMPTS = 3
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

const retryOperation = async (operation) => {
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    // Implementation
  }
}

// ❌ Bad - magic numbers
const retryOperation = async (operation) => {
  for (let attempt = 1; attempt <= 3; attempt++) { // What's 3?
    // Implementation
  }
}
```

This JavaScript style guide works for both vanilla JavaScript and TypeScript projects, with TypeScript-specific patterns covered in the separate TypeScript standards files.
