/**
 * @fileoverview New Receipt Page - Create new receipt
 * @version Next.js 15.5.4 / App Router / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { redirect } from 'next/navigation'
import { ProcurementPageHeader } from '@/components/shared/procurement/ProcurementPageHeader'
import { PackagePlus, ArrowLeft } from 'lucide-react'
import { ReceiptForm } from '@/features/sppg/procurement/receipts/components'

// ================================ PAGE COMPONENT ================================

function NewReceiptPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProcurementPageHeader
        title="Tambah Penerimaan Baru"
        description="Catat penerimaan barang dari supplier"
        icon={PackagePlus}
        breadcrumbs={['Procurement', 'Penerimaan Barang', 'Tambah Baru']}
        action={{
          label: 'Kembali',
          href: '/procurement/receipts',
          icon: ArrowLeft,
          variant: 'outline'
        }}
      />

      <ReceiptForm
        onSuccess={() => {
          redirect('/procurement/receipts')
        }}
      />
    </div>
  )
}

export default NewReceiptPage
