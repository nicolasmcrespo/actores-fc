# Supabase Authentication Standards

## Client Setup

### Environment Configuration
```typescript
// .env.local - Required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  // Server-side only
```

### Client Initialization
```typescript
// lib/supabase.ts - Standard client setup
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

## Alternative Perspective
**Counter-argument**: Creating a single global client can lead to issues in SSR environments. Consider using factory functions or context providers for better control over client instances.

## Authentication Patterns

### React Hook for Auth State
```typescript
// hooks/useAuth.ts - Centralized auth logic
import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return authState
}
```

### Authentication Methods (Standard Implementations)
```typescript
// lib/auth.ts - Auth utility functions
export const authActions = {
  // Email/Password Sign Up
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  // Email/Password Sign In
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // OAuth Sign In
  async signInWithProvider(provider: 'google' | 'github' | 'discord') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  // Sign Out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Password Reset
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return data
  }
}
```

## Row Level Security (RLS) Patterns

### Profile Table RLS
```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Insert policy for new users
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### Alternative Perspective
**Counter-point**: RLS can become complex quickly and debugging auth issues gets harder. Some teams prefer handling authorization in application logic for better visibility and testing.

### Public Content RLS
```sql
-- Posts table - public read, owner write
CREATE POLICY "Anyone can view published posts"
ON posts FOR SELECT
USING (published = true);

CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
USING (auth.uid() = author_id);

CREATE POLICY "Users can edit own posts"
ON posts FOR ALL
USING (auth.uid() = author_id);
```

### Admin/Role-Based RLS
```sql
-- Admin access pattern
CREATE POLICY "Admins can manage all posts"
ON posts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

## Authentication UI Components

### Protected Route Component
```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return <div>Loading...</div> // Or your loading component
  }

  if (!user) {
    return null // Will redirect
  }

  return <>{children}</>
}
```

### Login Form with shadcn/ui
```typescript
// components/LoginForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { authActions } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema)
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setLoading(true)
      await authActions.signIn(values.email, values.password)
      // Router will handle redirect via useAuth hook
    } catch (error) {
      console.error('Login error:', error)
      // Handle error (show toast, form error, etc.)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => authActions.signInWithProvider('google')}
        >
          Continue with Google
        </Button>
      </form>
    </Form>
  )
}
```

## Server-Side Authentication

### Next.js Middleware
```typescript
// middleware.ts - Protect API routes
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect to login if accessing protected routes without session
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*']
}
```

## Error Handling Patterns
```typescript
// lib/auth-errors.ts - Standardized error handling
export function getAuthErrorMessage(error: any): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password'
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long'
    default:
      return 'An error occurred. Please try again.'
  }
}
```

## Alternative Perspective
**Counter-point**: Supabase's built-in auth is convenient but can be limiting for complex auth flows. Consider whether you need custom auth logic that might be better served by Auth0 or custom JWT implementation.