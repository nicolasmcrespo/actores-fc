# Full-Stack Web Application Standards

## Overview
Standards for full-stack web applications that combine frontend UI, backend APIs, database, and deployment infrastructure.

## Project Architecture

### Recommended Tech Stack
```yaml
# Primary Stack
frontend_framework: Next.js 14+ (App Router)
language: TypeScript (strict mode)
styling: TailwindCSS + shadcn/ui
state_management: Zustand / React Context
data_fetching: TanStack Query (React Query)

# Backend Services
database: Supabase (PostgreSQL + Auth + Storage)
api_layer: Next.js API Routes / Supabase Edge Functions
auth: Supabase Auth
file_storage: Supabase Storage

# Development Tools
package_manager: pnpm
build_tool: Next.js (Webpack/Turbo)
linting: ESLint + Prettier
testing: Vitest + Playwright

# Deployment
hosting: Vercel / Hostinger
database: Supabase Cloud
cdn: Vercel Edge Network / Cloudflare
monitoring: Vercel Analytics / Sentry
```

## Alternative Perspective
**Counter-point**: This tech stack might be too opinionated for some teams. Consider that Firebase + Vite + React Router could be equally effective and some developers prefer the flexibility of separate tools over Next.js's batteries-included approach.

## Folder Structure Standards

### Next.js App Router Structure
```
project/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Route groups
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── users/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── api/                     # API Routes
│   │   ├── auth/route.ts
│   │   └── users/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── not-found.tsx
│
├── components/                   # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── form.tsx
│   ├── forms/                   # Form components
│   │   ├── login-form.tsx
│   │   └── user-form.tsx
│   ├── layout/                  # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── features/                # Feature-specific components
│       ├── auth/
│       └── users/
│
├── lib/                         # Utilities and configurations
│   ├── utils.ts                 # Utility functions
│   ├── validations/             # Zod schemas
│   ├── supabase.ts             # Supabase client
│   ├── auth.ts                 # Auth utilities
│   └── constants.ts            # App constants
│
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts
│   ├── use-users.ts
│   └── use-local-storage.ts
│
├── types/                       # TypeScript type definitions
│   ├── auth.ts
│   ├── user.ts
│   ├── database.ts             # Generated from Supabase
│   └── api.ts
│
├── stores/                      # State management
│   ├── auth-store.ts           # Zustand stores
│   └── ui-store.ts
│
└── __tests__/                   # Testing
    ├── components/
    ├── pages/
    └── utils/
```

## Database Schema Standards

### Supabase Table Design
```sql
-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Authentication Implementation

### Supabase Auth Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Auth utilities
export const auth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
}
```

### Auth Context Provider
```typescript
// contexts/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## API Layer Standards

### Next.js API Route Pattern
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['user', 'admin']).default('user'),
})

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    // Get auth user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100)
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: to < (count || 0) - 1,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Create user logic here
    const { data, error } = await supabase
      .from('profiles')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## State Management Patterns

### Zustand Store Example
```typescript
// stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
)
```

## Testing Strategy

### Component Testing Setup
```typescript
// __tests__/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
  },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

## Alternative Perspective
**Counter-point**: This comprehensive testing setup might be overkill for smaller applications. Sometimes starting with basic happy-path tests and adding complexity as needed leads to more maintainable test suites.

## Deployment Configuration

### Vercel Deployment
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  }
}
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

This web application standard provides a complete, production-ready foundation for modern full-stack applications with type safety, authentication, and scalability built in.