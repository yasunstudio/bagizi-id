/**
 * @fileoverview Supplier Form Client Wrapper - Client Component for form handling
 * @version Next.js 15.5.4 / TanStack Query / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { SupplierForm } from '@/features/sppg/procurement/suppliers/components'
import { useCreateSupplier } from '@/features/sppg/procurement/suppliers/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import type { CreateSupplierInput } from '@/features/sppg/procurement/suppliers/types'

/**
 * SupplierFormClient Component
 * 
 * Client Component that:
 * - Wraps SupplierForm component (590 lines)
 * - Handles form submission with TanStack Query
 * - CREATE mutation to API endpoint
 * - Success/error handling with redirects
 * - Toast notifications
 */
export function SupplierFormClient() {
  const router = useRouter()
  const { mutate: createSupplier, isPending } = useCreateSupplier()

  const handleSubmit = (data: CreateSupplierInput) => {
    createSupplier(data, {
      onSuccess: (response) => {
        // Redirect to supplier detail page
        if (response.data?.id) {
          router.push(`/procurement/suppliers/${response.data.id}`)
        } else {
          router.push('/procurement/suppliers')
        }
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Form Supplier Baru</CardTitle>
        </div>
        <CardDescription>
          Lengkapi formulir berikut untuk menambahkan supplier baru ke dalam sistem
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
        */}
        <SupplierForm 
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      </CardContent>
    </Card>
  )
}
