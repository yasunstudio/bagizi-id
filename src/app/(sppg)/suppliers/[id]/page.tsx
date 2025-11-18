/**
 * @fileoverview Supplier Detail Page - REFACTORED with extracted components
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * REFACTORING: Phase 7.1
 * - Reduced from 1000+ lines to ~150 lines (85% reduction)
 * - Applied thin orchestrator pattern
 * - Uses extracted components from Phase 4
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess, canManageProcurement } from '@/lib/permissions'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {
  SupplierDetailHeader,
  SupplierQuickStats,
  SupplierBasicInfo,
  SupplierContact,
  SupplierAddress,
  SupplierRatings,
  SupplierDocuments,
  SupplierProcurements
} from '@/features/sppg/procurement/suppliers/components/detail'

// ============================================
// METADATA
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Access Denied' }
  }

  try {
    const supplier = await db.supplier.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId,
      },
      select: {
        supplierName: true,
        supplierCode: true,
      },
    })

    if (!supplier) {
      return { title: 'Supplier Not Found' }
    }

    return {
      title: `${supplier.supplierName} - Detail Supplier | Bagizi`,
      description: `Detail informasi supplier ${supplier.supplierName} (${supplier.supplierCode})`,
    }
  } catch {
    return { title: 'Supplier Detail' }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/suppliers/' + id)
  }

  const sppgId = session.user.sppgId
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  const sppg = await checkSppgAccess(sppgId)
  if (!sppg) {
    redirect('/access-denied?reason=invalid-sppg')
  }

  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/access-denied?reason=insufficient-permissions')
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  const supplier = await db.supplier.findFirst({
    where: {
      id,
      sppgId,
    },
    include: {
      sppg: {
        select: {
          name: true,
        },
      },
      procurements: {
        select: {
          id: true,
          procurementCode: true,
          procurementDate: true,
          totalAmount: true,
          status: true,
          actualDelivery: true,
          paymentStatus: true,
        },
        orderBy: {
          procurementDate: 'desc',
        },
        take: 5,
      },
    },
  })

  if (!supplier) {
    notFound()
  }

  // ============================================
  // RENDER PAGE (Thin Orchestrator Pattern)
  // ============================================

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/procurement">Pengadaan</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/suppliers">Supplier</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{supplier.supplierName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with title, badges, and actions */}
      <SupplierDetailHeader supplier={supplier} />

      {/* Quick Stats Cards */}
      <SupplierQuickStats supplier={supplier} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <SupplierBasicInfo supplier={supplier} />
          <SupplierContact supplier={supplier} />
          <SupplierAddress supplier={supplier} />
          <SupplierDocuments supplier={supplier} />
        </div>

        {/* Right Column - Performance & Related Data */}
        <div className="space-y-6">
          <SupplierRatings supplier={supplier} />
          <SupplierProcurements procurements={supplier.procurements} supplierId={supplier.id} />
        </div>
      </div>
    </div>
  )
}
