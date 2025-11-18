/**
 * @fileoverview Receipt Detail Page - View receipt details
 * @version Next.js 15.5.4 / App Router / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { ProcurementPageHeader } from '@/components/shared/procurement/ProcurementPageHeader'
import { PackageCheck, ArrowLeft, Edit } from 'lucide-react'
import { ReceiptDetail } from '@/features/sppg/procurement/receipts/components'

// ================================ PAGE COMPONENT ================================

function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Validate ID format
  if (!id || id.length < 10) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Detail Penerimaan Barang"
        description="Lihat detail penerimaan barang dari supplier"
        icon={PackageCheck}
        breadcrumbs={['Procurement', 'Penerimaan Barang', 'Detail']}
        action={[
          {
            label: 'Kembali',
            href: '/procurement/receipts',
            icon: ArrowLeft,
            variant: 'outline'
          },
          {
            label: 'Edit',
            href: `/procurement/receipts/${id}/edit`,
            icon: Edit
          }
        ]}
      />

      <ReceiptDetail receiptId={id} />
    </div>
  )
}

export default ReceiptDetailPage
