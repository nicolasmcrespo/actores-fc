# SaaS Platform Standards

## Overview
Standards for building Software-as-a-Service platforms with multi-tenancy, subscription management, user authentication, and scalable architecture.

## Project Architecture

### Recommended Tech Stack
```yaml
# Core Platform
framework: Next.js 14+ (App Router)
language: TypeScript (strict mode)
database: PostgreSQL + Prisma ORM
auth: NextAuth.js / Supabase Auth
payments: Stripe
multi_tenancy: Row Level Security (RLS)

# Frontend
ui_framework: React 18+
styling: TailwindCSS + shadcn/ui
state_management: Zustand + React Query
forms: React Hook Form + Zod

# Backend Services
api: Next.js API Routes + tRPC
email: Resend / SendGrid
file_storage: AWS S3 / Supabase Storage
search: Algolia / MeiliSearch
monitoring: Sentry + Vercel Analytics

# Infrastructure
hosting: Vercel Pro
database_hosting: Supabase Pro / Railway
cdn: Vercel Edge Network
background_jobs: Inngest / Vercel Cron
```

## Alternative Perspective
**Counter-point**: This tech stack might be too modern for teams comfortable with traditional architectures. Consider that a Laravel/Django backend with separate React frontend could be more familiar and potentially more maintainable for some teams.

## Multi-Tenancy Architecture

### Database Schema Design
```sql
-- Core tenant/organization table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan_type VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Organization relationship (many-to-many)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id)
);

-- Tenant-isolated data example
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only access projects from organizations they belong to
CREATE POLICY "Users can access organization projects" ON projects
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Organization admins can manage all projects
CREATE POLICY "Admins can manage organization projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM organization_members
      WHERE organization_id = projects.organization_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
  );
```

### Organization Context Provider
```typescript
// contexts/organization-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@/hooks/useAuth'

interface Organization {
  id: string
  name: string
  slug: string
  planType: 'free' | 'pro' | 'enterprise'
  subscriptionStatus: 'active' | 'canceled' | 'past_due'
  role: 'owner' | 'admin' | 'member'
}

interface OrganizationContextType {
  currentOrg: Organization | null
  organizations: Organization[]
  switchOrganization: (orgId: string) => void
  loading: boolean
  isOwner: boolean
  isAdmin: boolean
  canManage: boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      loadUserOrganizations()
    }
  }, [user])

  const loadUserOrganizations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/organizations')
      const data = await response.json()

      setOrganizations(data.organizations)

      // Set current organization from localStorage or first org
      const savedOrgId = localStorage.getItem('currentOrgId')
      const targetOrg = savedOrgId
        ? data.organizations.find((org: Organization) => org.id === savedOrgId)
        : data.organizations[0]

      if (targetOrg) {
        setCurrentOrg(targetOrg)
        localStorage.setItem('currentOrgId', targetOrg.id)
      }
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      setCurrentOrg(org)
      localStorage.setItem('currentOrgId', orgId)
      // Trigger page refresh to update context
      window.location.reload()
    }
  }

  const isOwner = currentOrg?.role === 'owner'
  const isAdmin = currentOrg?.role === 'admin' || isOwner
  const canManage = isAdmin

  return (
    <OrganizationContext.Provider value={{
      currentOrg,
      organizations,
      switchOrganization,
      loading,
      isOwner,
      isAdmin,
      canManage
    }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
```

## Subscription Management

### Stripe Integration
```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: null,
    features: ['Up to 3 projects', 'Basic support'],
    limits: { projects: 3, users: 1, storage: 1024 * 1024 * 100 } // 100MB
  },
  pro: {
    name: 'Pro',
    price: 2900, // $29.00
    interval: 'month',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ['Unlimited projects', 'Priority support', 'Advanced analytics'],
    limits: { projects: -1, users: 10, storage: 1024 * 1024 * 1024 * 10 } // 10GB
  },
  enterprise: {
    name: 'Enterprise',
    price: 9900, // $99.00
    interval: 'month',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: ['Everything in Pro', 'SSO', 'Custom integrations', 'SLA'],
    limits: { projects: -1, users: -1, storage: -1 }
  }
} as const

export type PlanType = keyof typeof STRIPE_PLANS
```

### Subscription Service
```typescript
// services/subscription-service.ts
import { stripe, STRIPE_PLANS, PlanType } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export class SubscriptionService {
  static async createCheckoutSession(
    organizationId: string,
    planType: PlanType,
    successUrl: string,
    cancelUrl: string
  ) {
    const plan = STRIPE_PLANS[planType]
    if (!plan.priceId) {
      throw new Error('Invalid plan type')
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId,
        planType,
      },
    })

    return session
  }

  static async createBillingPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  }

  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { organizationId, planType } = session.metadata as {
      organizationId: string
      planType: PlanType
    }

    await supabase
      .from('organizations')
      .update({
        subscription_id: session.subscription as string,
        plan_type: planType,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )

    await supabase
      .from('organizations')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id)
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    await supabase
      .from('organizations')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', invoice.subscription as string)
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const planType = this.getPlanTypeFromSubscription(subscription)

    await supabase
      .from('organizations')
      .update({
        plan_type: planType,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id)
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await supabase
      .from('organizations')
      .update({
        plan_type: 'free',
        subscription_status: 'canceled',
        subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id)
  }

  private static getPlanTypeFromSubscription(subscription: Stripe.Subscription): PlanType {
    const priceId = subscription.items.data[0]?.price.id

    for (const [planType, plan] of Object.entries(STRIPE_PLANS)) {
      if (plan.priceId === priceId) {
        return planType as PlanType
      }
    }

    return 'free'
  }
}
```

## Feature Gating and Usage Limits

### Feature Gating Hook
```typescript
// hooks/useFeatureGating.ts
import { useOrganization } from '@/contexts/organization-context'
import { STRIPE_PLANS } from '@/lib/stripe'

interface UsageLimits {
  projects: number
  users: number
  storage: number // in bytes
}

export function useFeatureGating() {
  const { currentOrg } = useOrganization()

  const planLimits = currentOrg ? STRIPE_PLANS[currentOrg.planType]?.limits : STRIPE_PLANS.free.limits
  const planFeatures = currentOrg ? STRIPE_PLANS[currentOrg.planType]?.features : STRIPE_PLANS.free.features

  const hasFeature = (feature: string): boolean => {
    return planFeatures.includes(feature)
  }

  const canExceedLimit = (resource: keyof UsageLimits, currentUsage: number): boolean => {
    const limit = planLimits[resource]
    return limit === -1 || currentUsage < limit
  }

  const getRemainingUsage = (resource: keyof UsageLimits, currentUsage: number): number => {
    const limit = planLimits[resource]
    if (limit === -1) return Infinity
    return Math.max(0, limit - currentUsage)
  }

  const getUsagePercentage = (resource: keyof UsageLimits, currentUsage: number): number => {
    const limit = planLimits[resource]
    if (limit === -1) return 0
    return Math.min(100, (currentUsage / limit) * 100)
  }

  const isNearLimit = (resource: keyof UsageLimits, currentUsage: number): boolean => {
    const percentage = getUsagePercentage(resource, currentUsage)
    return percentage >= 80
  }

  const isAtLimit = (resource: keyof UsageLimits, currentUsage: number): boolean => {
    const limit = planLimits[resource]
    return limit !== -1 && currentUsage >= limit
  }

  return {
    planLimits,
    planFeatures,
    hasFeature,
    canExceedLimit,
    getRemainingUsage,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
    currentPlan: currentOrg?.planType || 'free',
  }
}
```

### Usage Tracking Component
```typescript
// components/dashboard/UsageCard.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useFeatureGating } from '@/hooks/useFeatureGating'
import { useQuery } from '@tanstack/react-query'

interface UsageCardProps {
  organizationId: string
}

export default function UsageCard({ organizationId }: UsageCardProps) {
  const { planLimits, getUsagePercentage, isNearLimit, currentPlan } = useFeatureGating()

  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage', organizationId],
    queryFn: async () => {
      const response = await fetch(`/api/organizations/${organizationId}/usage`)
      return response.json()
    },
  })

  if (isLoading) {
    return <div>Loading usage data...</div>
  }

  const resources = [
    { key: 'projects', label: 'Projects', current: usage?.projects || 0 },
    { key: 'users', label: 'Team Members', current: usage?.users || 0 },
    { key: 'storage', label: 'Storage', current: usage?.storage || 0 },
  ]

  const formatStorage = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / (1024 * 1024)).toFixed(0)}MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Usage Overview
          <Badge variant="secondary" className="capitalize">
            {currentPlan}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {resources.map((resource) => {
          const limit = planLimits[resource.key as keyof typeof planLimits]
          const percentage = getUsagePercentage(resource.key as keyof typeof planLimits, resource.current)
          const isNear = isNearLimit(resource.key as keyof typeof planLimits, resource.current)

          return (
            <div key={resource.key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{resource.label}</span>
                <span className={isNear ? 'text-orange-600' : 'text-gray-600'}>
                  {resource.key === 'storage'
                    ? `${formatStorage(resource.current)} ${limit === -1 ? '' : `/ ${formatStorage(limit)}`}`
                    : `${resource.current} ${limit === -1 ? '' : `/ ${limit}`}`
                  }
                </span>
              </div>
              {limit !== -1 && (
                <Progress
                  value={percentage}
                  className={`h-2 ${isNear ? '[&>div]:bg-orange-500' : ''}`}
                />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
```

## Alternative Perspective
**Counter-point**: Complex usage tracking and feature gating can create a poor user experience with too many restrictions and upgrade prompts. Sometimes a simpler tiered approach with clear value propositions at each level creates better user satisfaction than granular usage limits.

## Team Management

### User Invitation System
```typescript
// services/invitation-service.ts
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class InvitationService {
  static async inviteUser(
    organizationId: string,
    email: string,
    role: 'admin' | 'member',
    invitedBy: string
  ) {
    // Check if user already exists in organization
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', (await this.getUserByEmail(email))?.id || '')
      .single()

    if (existingMember) {
      throw new Error('User is already a member of this organization')
    }

    // Generate invitation token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store invitation
    const { data: invitation } = await supabase
      .from('invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: invitedBy,
      })
      .select()
      .single()

    // Send invitation email
    await this.sendInvitationEmail(invitation)

    return invitation
  }

  static async acceptInvitation(token: string, userId: string) {
    // Verify invitation
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (!invitation) {
      throw new Error('Invalid or expired invitation')
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired')
    }

    // Add user to organization
    await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: userId,
        role: invitation.role,
      })

    // Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)
  }

  private static async getUserByEmail(email: string) {
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    return user
  }

  private static async sendInvitationEmail(invitation: any) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`

    await resend.emails.send({
      from: 'team@yourapp.com',
      to: invitation.email,
      subject: 'You've been invited to join our team',
      html: `
        <p>You've been invited to join an organization.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}">Accept Invitation</a>
        <p>This invitation expires in 7 days.</p>
      `,
    })
  }
}
```

This SaaS platform standard provides a comprehensive foundation for building scalable, multi-tenant applications with subscription management, team collaboration, and proper feature gating while maintaining security and performance.