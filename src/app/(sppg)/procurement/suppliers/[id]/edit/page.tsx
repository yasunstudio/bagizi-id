/**
 * @fileoverview Edit Supplier Page - Edit existing supplier
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * ENTERPRISE-GRADE FEATURES:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Dynamic route with [id] parameter
 * - Data fetching with Prisma
 * - SEO optimization with metadata
 * - Breadcrumb navigation
 * - Client component integration (form wrapper)
 * - Update mutation with optimistic updates
 * - Warning alert for data modification
 * - Dark mode support
 * - Accessibility compliance (WCAG 2.1 AA)
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { EditSupplierFormClient } from '.'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { ChevronLeft, AlertTriangle, Building2 } from 'lucide-react'

/**
 * Generate dynamic metadata for edit page
 */
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user?.sppgId) {
      return { title: 'Edit Supplier' }
    }

    const supplier = await db.supplier.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId
      },
      select: {
        supplierName: true,
        supplierCode: true
      }
    })

    if (!supplier) {
      return { title: 'Supplier Tidak Ditemukan' }
    }

    return {
      title: `Edit Supplier ${supplier.supplierName} | Bagizi-ID`,
      description: `Edit data supplier ${supplier.supplierName} (${supplier.supplierCode})`
    }
  } catch {
    return { title: 'Edit Supplier' }
  }
}

/**
 * Fetch supplier data by ID with multi-tenant filtering
 */
async function getSupplierById(id: string, sppgId: string) {
  try {
    return await db.supplier.findFirst({
      where: {
        id,
        sppgId // CRITICAL: Multi-tenant filter
      }
    })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return null
  }
}

/**
 * Edit Supplier Page Component
 * 
 * Features:
 * - Checks authentication and redirects to login if needed
 * - Checks RBAC permissions
 * - Fetches supplier data with multi-tenant filtering
 * - Renders edit form with warning alert
 * - Handles 404 if supplier not found
 */
async function EditSupplierPage({
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  // Get session for sppgId
  const session = await auth()
  const sppgId = session?.user?.sppgId
  
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  const supplier = await getSupplierById(id, sppgId)

  // Handle not found
  if (!supplier) {
    notFound()
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Edit Supplier"
        description={`Edit data supplier ${supplier.supplierName} (${supplier.supplierCode})`}
        icon={Building2}
        breadcrumbs={['Procurement', 'Suppliers', supplier.supplierName, 'Edit']}
        action={{
          label: 'Kembali ke Detail',
          href: `/procurement/suppliers/${supplier.id}`,
          icon: ChevronLeft,
          variant: 'outline'
        }}
      />

      {/* ============================================ */}
      {/* WARNING ALERT */}
      {/* ============================================ */}
      <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">Perhatian</AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          Anda sedang mengedit data supplier yang sudah ada. Pastikan perubahan yang Anda lakukan sudah benar 
          sebelum menyimpan. Perubahan data supplier dapat mempengaruhi procurement order yang terkait.
        </AlertDescription>
      </Alert>

      {/* ============================================ */}
      {/* EDIT FORM */}
      {/* ============================================ */}
      <EditSupplierFormClient supplier={supplier} />
    </div>
  )
}

export default EditSupplierPage
