/**
 * @fileoverview Edit Receipt Page - Update receipt information
 * @version Next.js 15.5.4 / App Router / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { ProcurementPageHeader } from '@/components/shared/procurement/ProcurementPageHeader'
import { Pencil, ArrowLeft } from 'lucide-react'
import { ReceiptForm } from '@/features/sppg/procurement/receipts/components'
import { useReceipt } from '@/features/sppg/procurement/receipts/hooks'
import { Skeleton } from '@/components/ui/skeleton'

// ================================ PAGE COMPONENT ================================

function EditReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: receipt, isLoading } = useReceipt(id)

  // Validate ID format
  if (!id || id.length < 10) {
    notFound()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Show not found if receipt doesn't exist
  if (!receipt) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Edit Penerimaan Barang"
        description={`Update informasi penerimaan - ${receipt.procurementCode || 'N/A'}`}
        icon={Pencil}
        breadcrumbs={['Procurement', 'Penerimaan Barang', 'Detail', 'Edit']}
        action={{
          label: 'Kembali ke Detail',
          href: `/procurement/receipts/${id}`,
          icon: ArrowLeft,
          variant: 'outline'
        }}
      />

      <ReceiptForm
        receipt={receipt}
        onSuccess={() => {
          router.push(`/procurement/receipts/${id}`)
        }}
      />
    </div>
  )
}

export default EditReceiptPage
