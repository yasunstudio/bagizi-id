/**
 * @fileoverview Edit Supplier Form Client Wrapper - Client Component for edit form handling
 * @version Next.js 15.5.4 / TanStack Query / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { SupplierForm } from '@/features/sppg/procurement/suppliers/components'
import { useUpdateSupplier } from '@/features/sppg/procurement/suppliers/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import type { Supplier, UpdateSupplierInput } from '@/features/sppg/procurement/suppliers/types'

interface EditSupplierFormClientProps {
  supplier: Supplier
}

/**
 * EditSupplierFormClient Component
 * 
 * Client Component that:
 * - Wraps SupplierForm component (590 lines)
 * - Handles form submission with TanStack Query
 * - UPDATE mutation to API endpoint
 * - Success/error handling with redirects
 * - Toast notifications
 * - Pre-populated form with existing data
 */
export function EditSupplierFormClient({ supplier }: EditSupplierFormClientProps) {
  const router = useRouter()
  const { mutate: updateSupplier, isPending } = useUpdateSupplier()

  const handleSubmit = (data: UpdateSupplierInput) => {
    updateSupplier(
      { id: supplier.id, data },
      {
        onSuccess: () => {
          // Redirect to supplier detail page
          router.push(`/suppliers/${supplier.id}`)
        },
      }
    )
  }

  const handleCancel = () => {
    router.push(`/suppliers/${supplier.id}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Edit Data Supplier</CardTitle>
        </div>
        <CardDescription>
          Update informasi supplier yang sudah ada. Pastikan semua data yang diubah sudah benar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 
          SupplierForm Component (590 lines)
          - Comprehensive form with all supplier fields
          - React Hook Form + Zod validation
          - 5 sections: Basic Info, Contact, Address, Documentation, Financial
          - Real-time validation
          - Field-level error messages
          - Pre-populated with existing data
        */}
        <SupplierForm 
          supplier={supplier}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isPending}
        />
      </CardContent>
    </Card>
  )
}
