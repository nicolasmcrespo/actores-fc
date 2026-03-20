# Firebase Authentication Standards

## Overview
Standards for implementing Firebase Authentication in web applications with React/Next.js, focusing on security, UX, and type safety.

## Firebase Setup and Configuration

### Initial Setup
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const storage = getStorage(app)

// OAuth Providers
export const googleProvider = new GoogleAuthProvider()
export const facebookProvider = new FacebookAuthProvider()
export const twitterProvider = new TwitterAuthProvider()

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Development emulators (only in development)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Connect to emulators if not already connected
  if (!auth.config.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(firestore, 'localhost', 8080)
    connectStorageEmulator(storage, 'localhost', 9199)
  }
}
```

## Alternative Perspective
**Counter-point**: Firebase lock-in can be problematic for some teams. Consider that Supabase offers similar features with more control over your data and infrastructure, plus it's built on PostgreSQL which many developers are more familiar with.

## Authentication Service Implementation

### Type-Safe Auth Service
```typescript
// services/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  UserCredential,
  AuthError
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, firestore, googleProvider, facebookProvider } from '@/lib/firebase'

// Custom user profile type
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  role: 'user' | 'admin' | 'moderator'
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      push: boolean
      marketing: boolean
    }
    language: string
  }
  createdAt: Date
  updatedAt: Date
}

export const authService = {
  // Email/Password Authentication
  async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // Update display name
      await updateProfile(user, { displayName })

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        photoURL: user.photoURL || undefined,
        role: 'user',
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            marketing: false,
          },
          language: 'en',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(firestore, 'users', user.uid), userProfile)
      return userProfile
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  // OAuth Authentication
  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const { user } = await signInWithPopup(auth, googleProvider)

      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(firestore, 'users', user.uid))

      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName!,
          photoURL: user.photoURL || undefined,
          role: 'user',
          preferences: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              marketing: false,
            },
            language: 'en',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await setDoc(doc(firestore, 'users', user.uid), userProfile)
        return userProfile
      }

      return userDoc.data() as UserProfile
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  async signInWithFacebook(): Promise<UserProfile> {
    try {
      const { user } = await signInWithPopup(auth, facebookProvider)
      // Similar implementation to Google
      return this.createOrGetUserProfile(user)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  // Password Management
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      })
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        throw new Error('No authenticated user')
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  // Profile Management
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Update Firebase Auth profile if needed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user, {
          displayName: updates.displayName,
          photoURL: updates.photoURL,
        })
      }

      // Update Firestore profile
      await updateDoc(doc(firestore, 'users', user.uid), {
        ...updates,
        updatedAt: new Date(),
      })
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid))
      return userDoc.exists() ? (userDoc.data() as UserProfile) : null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  },

  // Helper Methods
  private async createOrGetUserProfile(user: User): Promise<UserProfile> {
    const userDoc = await getDoc(doc(firestore, 'users', user.uid))

    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName!,
        photoURL: user.photoURL || undefined,
        role: 'user',
        preferences: {
          theme: 'system',
          notifications: { email: true, push: true, marketing: false },
          language: 'en',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(firestore, 'users', user.uid), userProfile)
      return userProfile
    }

    return userDoc.data() as UserProfile
  },

  private handleAuthError(error: AuthError): Error {
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('No account found with this email address')
      case 'auth/wrong-password':
        return new Error('Incorrect password')
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists')
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters')
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address')
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later')
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection')
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in cancelled')
      case 'auth/popup-blocked':
        return new Error('Pop-up blocked. Please allow pop-ups and try again')
      default:
        console.error('Auth error:', error)
        return new Error('An error occurred during authentication')
    }
  }
}
```

## React Context and Hooks

### Auth Context Provider
```typescript
// contexts/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { authService, UserProfile } from '@/services/auth'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        const profile = await authService.getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signOut = async () => {
    await authService.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      const profile = await authService.getUserProfile(user.uid)
      setUserProfile(profile)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signOut,
      refreshProfile
    }}>
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

## Authentication Components

### Login Form Component
```typescript
// components/auth/login-form.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { authService } from '@/services/auth'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      await authService.signIn(data.email, data.password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await authService.signInWithGoogle()
      toast.success('Welcome!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    disabled={loading}
                    {...field}
                  />
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
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>

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

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            {/* Google icon SVG */}
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  )
}
```

## Alternative Perspective
**Counter-point**: This comprehensive auth system might be over-engineered for simple applications. Sometimes Firebase's built-in UI (FirebaseUI) can be faster to implement and maintain, even if it's less customizable.

## Security Best Practices

### Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin users can read all profiles
    match /users/{userId} {
      allow read: if request.auth != null &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Public documents (if any)
    match /public/{document=**} {
      allow read: if true;
    }
  }
}
```

### Environment Variables Security
```bash
# .env.local (never commit to version control)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Server-side only (for admin operations)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
```

## Testing Firebase Auth

### Mock Authentication for Tests
```typescript
// __mocks__/firebase/auth.ts
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((callback) => {
    callback(null) // No user by default
    return jest.fn() // Unsubscribe function
  }),
}

export const GoogleAuthProvider = jest.fn()
export const signInWithPopup = jest.fn()
```

This Firebase authentication standard provides secure, scalable authentication with comprehensive error handling and type safety.