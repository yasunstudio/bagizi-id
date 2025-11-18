# PROCUREMENT REFACTORING PLAN

**Based On**: PROCUREMENT_IMPLEMENTATION_AUDIT.md  
**Date**: January 19, 2025  
**Goal**: Align implementation with PROCUREMENT_WORKFLOW_GUIDE.md and copilot instructions  
**Approach**: Incremental refactoring dengan minimal disruption

---

## 🎯 REFACTORING STRATEGY

### Strategy: **HYBRID APPROACH** (1-2 weeks)

**Why Hybrid?**
- ✅ Fixes critical navigation issues immediately
- ✅ Completes core missing features
- ✅ Defers nice-to-have features for later
- ✅ Gets to 85% completion quickly
- ✅ Production-ready for core workflows

**Phases:**
1. 🔴 **Phase 1**: Fix Navigation (1 day) - CRITICAL
2. 🔴 **Phase 2**: Supplier Management (3 days) - CRITICAL
3. 🔴 **Phase 3**: Receipt & QC System (2 days) - CRITICAL
4. 🟡 **Phase 4**: Payment Dashboard (2 days) - DEFERRED
5. 🟡 **Phase 5**: Reporting (3 days) - DEFERRED
6. 🟡 **Phase 6**: Settings (1 day) - DEFERRED

**Total Critical Path**: 6 days of focused development

---

## 📋 PHASE 1: FIX NAVIGATION (DAY 1)

### Goal: Make all sidebar links functional

### Task 1.1: Create Placeholder Pages (2 hours)

**Create 5 placeholder pages with proper structure:**

#### 1. `/src/app/(sppg)/procurement/orders/page.tsx`
```typescript
/**
 * @fileoverview Purchase Orders Page - Active procurement orders view
 * Currently redirects to main procurement page
 * TODO: Implement separate orders view filtering by ORDERED/APPROVED status
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Purchase Orders | Procurement | Bagizi SPPG',
  description: 'Manage active purchase orders and track order status',
}

export default function ProcurementOrdersPage() {
  // Temporary redirect until separate orders view is implemented
  redirect('/procurement')
}
```

#### 2. `/src/app/(sppg)/procurement/receipts/page.tsx`
```typescript
/**
 * @fileoverview Receipts & Delivery Page - Receipt tracking and quality control
 */

import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PackageCheck, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Penerimaan Barang | Procurement | Bagizi SPPG',
  description: 'Track deliveries, perform quality control, and manage receipt documents',
}

export default async function ReceiptsPage() {
  const session = await auth()
  if (!session?.user?.sppgId) redirect('/login')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PackageCheck className="h-8 w-8" />
          Penerimaan Barang & Quality Control
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola penerimaan barang, inspeksi kualitas, dan dokumentasi delivery
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Halaman ini sedang dalam development. Fitur penerimaan barang akan segera hadir.
          <br />
          <strong>Rencana Fitur:</strong> Tracking delivery, quality inspection, photo upload, acceptance/rejection workflow
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Receipt management functionality is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>List of all deliveries awaiting receipt</li>
            <li>Quality control inspection forms</li>
            <li>Photo upload for delivery proof</li>
            <li>Accept/reject individual items</li>
            <li>Batch number and expiry date tracking</li>
            <li>Automatic inventory updates on acceptance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 3. `/src/app/(sppg)/procurement/suppliers/page.tsx`
```typescript
/**
 * @fileoverview Supplier Management Page - Vendor management and evaluation
 */

import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Supplier Management | Procurement | Bagizi SPPG',
  description: 'Manage suppliers, track performance, and maintain vendor relationships',
}

export default async function SuppliersPage() {
  const session = await auth()
  if (!session?.user?.sppgId) redirect('/login')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Manajemen Supplier
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola vendor, evaluasi performa, dan maintain hubungan supplier
          </p>
        </div>
        <Button disabled>
          <Building2 className="mr-2 h-4 w-4" />
          Tambah Supplier
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Halaman ini sedang dalam development. Fitur supplier management akan segera hadir.
          <br />
          <strong>Rencana Fitur:</strong> Supplier CRUD, performance tracking, evaluation system, contract management
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Directory</CardTitle>
            <CardDescription>Complete vendor database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage supplier profiles, contact information, certifications, and compliance documents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Tracking</CardTitle>
            <CardDescription>Supplier KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track delivery rates, quality scores, pricing competitiveness, and service ratings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation System</CardTitle>
            <CardDescription>Vendor assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conduct regular supplier evaluations, audits, and compliance checks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

#### 4. `/src/app/(sppg)/procurement/payments/page.tsx`
```typescript
/**
 * @fileoverview Payment Management Page - Payment tracking and reconciliation
 */

import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Payment Management | Procurement | Bagizi SPPG',
  description: 'Track payments, manage payment terms, and reconcile accounts payable',
}

export default async function PaymentsPage() {
  const session = await auth()
  if (!session?.user?.sppgId) redirect('/login')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Manajemen Pembayaran
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola pembayaran, track payment terms, dan rekonsiliasi hutang
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Halaman ini sedang dalam development. Dashboard pembayaran akan segera hadir.
          <br />
          <strong>Note:</strong> Saat ini payment tracking dapat diakses dari detail page setiap procurement.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Centralized payment dashboard is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Payment overview dashboard</li>
            <li>Overdue payment tracking</li>
            <li>Payment reconciliation tools</li>
            <li>Payment history across all procurements</li>
            <li>Payment reminders and alerts</li>
            <li>Accounts payable aging report</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 5. `/src/app/(sppg)/procurement/reports/page.tsx`
```typescript
/**
 * @fileoverview Procurement Reports Page - Analytics and reporting
 */

import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Procurement Reports | Bagizi SPPG',
  description: 'Analytics, reports, and insights for procurement operations',
}

export default async function ReportsPage() {
  const session = await auth()
  if (!session?.user?.sppgId) redirect('/login')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart2 className="h-8 w-8" />
          Laporan & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Analisis spending, supplier performance, dan budget utilization
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Halaman ini sedang dalam development. Reporting dashboard akan segera hadir.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Spending Analysis</CardTitle>
            <CardDescription>Budget tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track spending by category, supplier, and time period.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>Vendor metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analyze supplier delivery rates, quality scores, and pricing trends.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>Plan vs actual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Compare planned budget with actual spending across programs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

#### 6. `/src/app/(sppg)/procurement/settings/page.tsx`
```typescript
/**
 * @fileoverview Procurement Settings Page - Configuration and preferences
 */

import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Procurement Settings | Bagizi SPPG',
  description: 'Configure procurement preferences, approval workflows, and system settings',
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.sppgId) redirect('/login')

  // Check permission - only SPPG_KEPALA and SPPG_ADMIN
  const canManageSettings = ['SPPG_KEPALA', 'SPPG_ADMIN'].includes(session.user.userRole || '')
  if (!canManageSettings) {
    redirect('/procurement')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Pengaturan Procurement
        </h1>
        <p className="text-muted-foreground mt-2">
          Konfigurasi approval workflow, kategori, dan preferensi sistem
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Halaman ini sedang dalam development. Settings akan segera hadir.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Procurement configuration page is being developed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will include:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Approval workflow configuration</li>
            <li>Procurement category management</li>
            <li>Notification preferences</li>
            <li>Default payment terms</li>
            <li>Quality control thresholds</li>
            <li>Integration settings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Task 1.2: Update Navigation Badge Counts (1 hour)

**Current**: Static badge values  
**Update**: Keep static for now, document API requirements

Create `/src/features/sppg/procurement/lib/constants.ts`:
```typescript
/**
 * Procurement module constants
 * 
 * TODO: Replace static badge values with dynamic API calls
 * See: /docs/PROCUREMENT_NAVIGATION_IMPLEMENTATION.md - Badge Count System
 */

export const PROCUREMENT_BADGE_PLACEHOLDERS = {
  totalPending: 3,
  pendingApproval: 2,
  ordered: 3,
  awaitingQc: 1,
  overduePayment: 2,
} as const

export const PROCUREMENT_ROUTES = {
  DASHBOARD: '/procurement',
  PLANS: '/procurement/plans',
  ORDERS: '/procurement/orders',
  RECEIPTS: '/procurement/receipts',
  SUPPLIERS: '/procurement/suppliers',
  PAYMENTS: '/procurement/payments',
  REPORTS: '/procurement/reports',
  SETTINGS: '/procurement/settings',
} as const

export const PROCUREMENT_API = {
  BASE: '/api/sppg/procurement',
  PLANS: '/api/sppg/procurement/plans',
  SUPPLIERS: '/api/sppg/procurement/suppliers',
  RECEIPTS: '/api/sppg/procurement/receipts',
  PAYMENTS: '/api/sppg/procurement/payments',
  REPORTS: '/api/sppg/procurement/reports',
  SETTINGS: '/api/sppg/procurement/settings',
  BADGES: '/api/sppg/procurement/badges',
} as const
```

### Task 1.3: Test Navigation (30 min)

**Test Checklist:**
- [ ] All 8 sidebar links are clickable
- [ ] No 404 errors
- [ ] Placeholder pages show "Coming Soon" message
- [ ] Breadcrumbs work correctly
- [ ] Mobile navigation works
- [ ] Dark mode displays correctly
- [ ] Role-based access control works (settings page)

---

## 📋 PHASE 2: SUPPLIER MANAGEMENT (DAYS 2-4)

### Goal: Complete supplier CRUD and basic features

### Task 2.1: Database Check (30 min)

**Verify Supplier model is ready:**
```bash
# Check Prisma schema
grep -A 60 "model Supplier" prisma/schema.prisma
```

Expected: ✅ Supplier model with 60+ fields already exists in schema

### Task 2.2: Create Supplier API (Day 2 - 4 hours)

#### `/src/app/api/sppg/procurement/suppliers/route.ts`

```typescript
/**
 * @fileoverview Supplier Management API - CRUD operations
 * Multi-tenant safe, RBAC protected
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { supplierSchema } from '@/features/sppg/procurement/schemas'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const isPreferred = searchParams.get('isPreferred')

    // Build where clause with multi-tenant safety
    const where: any = {
      sppgId: session.user.sppgId,
    }

    if (category) where.category = category
    if (isActive !== null) where.isActive = isActive === 'true'
    if (isPreferred !== null) where.isPreferred = isPreferred === 'true'

    // Fetch suppliers
    const suppliers = await db.supplier.findMany({
      where,
      orderBy: [
        { isPreferred: 'desc' },
        { overallRating: 'desc' },
        { supplierName: 'asc' }
      ],
      select: {
        id: true,
        supplierCode: true,
        supplierName: true,
        businessName: true,
        supplierType: true,
        category: true,
        primaryContact: true,
        phone: true,
        email: true,
        city: true,
        province: true,
        isActive: true,
        isPreferred: true,
        isHalalCertified: true,
        isFoodSafetyCertified: true,
        overallRating: true,
        qualityRating: true,
        deliveryRating: true,
        totalOrders: true,
        onTimeDeliveryRate: true,
        totalPurchaseValue: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return Response.json({ success: true, data: suppliers })
  } catch (error) {
    console.error('GET /api/sppg/procurement/suppliers error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    const canCreate = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'].includes(session.user.userRole || '')
    if (!canCreate) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse and validate
    const body = await request.json()
    const validated = supplierSchema.safeParse(body)

    if (!validated.success) {
      return Response.json({
        error: 'Validation failed',
        details: validated.error.errors
      }, { status: 400 })
    }

    // Generate supplier code if not provided
    const supplierCode = validated.data.supplierCode || await generateSupplierCode(session.user.sppgId)

    // Create supplier
    const supplier = await db.supplier.create({
      data: {
        ...validated.data,
        supplierCode,
        sppgId: session.user.sppgId,
      }
    })

    return Response.json({ success: true, data: supplier }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sppg/procurement/suppliers error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateSupplierCode(sppgId: string): Promise<string> {
  const count = await db.supplier.count({ where: { sppgId } })
  return `SUP-${String(count + 1).padStart(4, '0')}`
}
```

#### `/src/app/api/sppg/procurement/suppliers/[id]/route.ts`

```typescript
/**
 * @fileoverview Supplier Detail API - GET, PUT, DELETE
 */

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { supplierSchema } from '@/features/sppg/procurement/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const supplier = await db.supplier.findUnique({
      where: {
        id,
        sppgId: session.user.sppgId, // Multi-tenant safety
      },
      include: {
        supplierContracts: {
          orderBy: { contractStartDate: 'desc' },
          take: 5
        },
        supplierEvaluations: {
          orderBy: { evaluationDate: 'desc' },
          take: 10
        },
        procurements: {
          select: {
            id: true,
            procurementCode: true,
            procurementDate: true,
            totalAmount: true,
            status: true,
          },
          orderBy: { procurementDate: 'desc' },
          take: 20
        }
      }
    })

    if (!supplier) {
      return Response.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: supplier })
  } catch (error) {
    console.error('GET /api/sppg/procurement/suppliers/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canEdit = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'].includes(session.user.userRole || '')
    if (!canEdit) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = supplierSchema.partial().safeParse(body)

    if (!validated.success) {
      return Response.json({
        error: 'Validation failed',
        details: validated.error.errors
      }, { status: 400 })
    }

    const supplier = await db.supplier.update({
      where: {
        id,
        sppgId: session.user.sppgId,
      },
      data: validated.data
    })

    return Response.json({ success: true, data: supplier })
  } catch (error) {
    console.error('PUT /api/sppg/procurement/suppliers/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canDelete = ['SPPG_KEPALA', 'SPPG_ADMIN'].includes(session.user.userRole || '')
    if (!canDelete) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    // Check if supplier has active procurements
    const activeProcurements = await db.procurement.count({
      where: {
        supplierId: id,
        status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED'] }
      }
    })

    if (activeProcurements > 0) {
      return Response.json({
        error: 'Cannot delete supplier with active procurements',
        details: { activeProcurements }
      }, { status: 400 })
    }

    await db.supplier.delete({
      where: {
        id,
        sppgId: session.user.sppgId,
      }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/sppg/procurement/suppliers/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Task 2.3: Create Supplier Schema (Day 2 - 1 hour)

Add to `/src/features/sppg/procurement/schemas/index.ts`:

```typescript
import { z } from 'zod'

export const supplierSchema = z.object({
  supplierCode: z.string().optional(),
  supplierName: z.string().min(3, 'Supplier name must be at least 3 characters'),
  businessName: z.string().optional(),
  supplierType: z.enum(['LOCAL', 'REGIONAL', 'NATIONAL', 'INTERNATIONAL']),
  category: z.string().min(1, 'Category is required'),
  primaryContact: z.string().min(1, 'Primary contact is required'),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional(),
  whatsapp: z.string().optional(),
  website: z.string().url('Invalid URL').optional(),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().optional(),
  coordinates: z.string().optional(),
  deliveryRadius: z.number().optional(),
  businessLicense: z.string().optional(),
  taxId: z.string().optional(),
  hallaLicense: z.string().optional(),
  foodSafetyLicense: z.string().optional(),
  isHalalCertified: z.boolean().default(false),
  isFoodSafetyCertified: z.boolean().default(false),
  isISOCertified: z.boolean().default(false),
  certifications: z.array(z.string()).default([]),
  paymentTerms: z.string().default('CASH_ON_DELIVERY'),
  creditLimit: z.number().optional(),
  currency: z.string().default('IDR'),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  minOrderValue: z.number().optional(),
  maxOrderCapacity: z.number().optional(),
  leadTimeHours: z.number().default(24),
  deliveryDays: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isPreferred: z.boolean().default(false),
  partnershipLevel: z.enum(['STANDARD', 'SILVER', 'GOLD', 'PLATINUM']).default('STANDARD'),
  contractStartDate: z.date().optional(),
  contractEndDate: z.date().optional(),
  relationshipManager: z.string().optional(),
})

export type SupplierInput = z.infer<typeof supplierSchema>
```

### Task 2.4: Create Supplier Components (Days 2-3 - 8 hours)

Create components following the same pattern as existing procurement components.

### Task 2.5: Create Supplier Pages (Day 3-4 - 6 hours)

Replace placeholder `/procurement/suppliers/page.tsx` with functional component.

**Total Phase 2 Effort**: 3 days

---

## 📋 PHASE 3: RECEIPT & QC SYSTEM (DAYS 5-6)

### Goal: Implement delivery tracking and quality control

### Task 3.1: Create Receipt API (Day 5 - 3 hours)

**Approach**: Receipts are essentially Procurements with status filtering.

Create `/src/app/api/sppg/procurement/receipts/route.ts`:

```typescript
/**
 * @fileoverview Receipts API - Delivery tracking and receipt management
 * Returns procurements with ORDERED/RECEIVED status
 */

import { NextRequest } from 'next'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Receipts are procurements awaiting delivery or recently received
    const receipts = await db.procurement.findMany({
      where: {
        sppgId: session.user.sppgId,
        status: status ? status as any : { in: ['ORDERED', 'RECEIVED'] },
      },
      include: {
        items: {
          select: {
            id: true,
            itemName: true,
            orderedQuantity: true,
            receivedQuantity: true,
            unit: true,
            gradeRequested: true,
            gradeReceived: true,
            isAccepted: true,
          }
        },
        supplier: {
          select: {
            id: true,
            supplierName: true,
            phone: true,
          }
        }
      },
      orderBy: { expectedDelivery: 'asc' }
    })

    return Response.json({ success: true, data: receipts })
  } catch (error) {
    console.error('GET /api/sppg/procurement/receipts error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Task 3.2: Refactor QC Endpoint (Day 5 - 2 hours)

**Current**: `/api/sppg/procurement/items/[itemId]/inspect/route.ts`  
**New**: `/api/sppg/procurement/receipts/[id]/qc/route.ts`

Move and enhance the existing inspection logic.

### Task 3.3: Create Receipt Components (Day 6 - 6 hours)

Components needed:
- `ReceiptList.tsx`
- `ReceiptCard.tsx`
- `QualityControlForm.tsx`
- `DeliveryPhotoUpload.tsx`

### Task 3.4: Update Receipt Page (Day 6 - 2 hours)

Replace placeholder with functional receipt management page.

**Total Phase 3 Effort**: 2 days

---

## ✅ COMPLETION CHECKLIST

### Phase 1: Fix Navigation ✅
- [ ] Create 6 placeholder pages
- [ ] All links work (no 404)
- [ ] Create constants file
- [ ] Test on mobile
- [ ] Test dark mode
- [ ] Test role permissions

### Phase 2: Supplier Management ⏳
- [ ] Create suppliers API (GET, POST, PUT, DELETE)
- [ ] Create supplier schema
- [ ] Create SupplierList component
- [ ] Create SupplierForm component
- [ ] Create SupplierCard component
- [ ] Create supplier detail page
- [ ] Test CRUD operations
- [ ] Test multi-tenant safety

### Phase 3: Receipt & QC ⏳
- [ ] Create receipts API
- [ ] Refactor QC endpoint
- [ ] Create ReceiptList component
- [ ] Create QualityControlForm component
- [ ] Update receipt page
- [ ] Test QC workflow
- [ ] Test photo upload

---

## 📊 PROGRESS TRACKING

| Phase | Status | Progress | ETA |
|-------|--------|----------|-----|
| Phase 1: Navigation | 🟢 Ready | 0% | Day 1 |
| Phase 2: Suppliers | ⏳ Pending | 0% | Days 2-4 |
| Phase 3: Receipts/QC | ⏳ Pending | 0% | Days 5-6 |
| Phase 4: Payments | 🟡 Deferred | 0% | TBD |
| Phase 5: Reports | 🟡 Deferred | 0% | TBD |
| Phase 6: Settings | 🟡 Deferred | 0% | TBD |

---

## 🎯 SUCCESS CRITERIA

**After completing Phases 1-3:**

✅ **Navigation**:
- All 8 sidebar links functional
- No 404 errors
- Clear "Coming Soon" messages for deferred features

✅ **Supplier Management**:
- Full CRUD operations working
- Multi-tenant data isolation verified
- Role-based permissions enforced
- Performance tracking visible

✅ **Receipt & QC**:
- Delivery tracking functional
- Quality control workflow working
- Photo uploads supported
- Accept/reject items operational

✅ **Code Quality**:
- TypeScript strict mode passing
- All APIs follow copilot instructions patterns
- Feature-based architecture maintained
- Centralized API clients used

✅ **Documentation**:
- Implementation aligned with PROCUREMENT_WORKFLOW_GUIDE.md
- API documentation updated
- Component documentation complete

---

**Refactoring Plan Ready**: ✅  
**Estimated Total Effort**: 6 days (Phases 1-3)  
**Next Action**: Begin Phase 1 implementation

