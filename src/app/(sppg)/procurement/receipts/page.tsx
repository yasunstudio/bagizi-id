/**
 * @fileoverview Receipt List Page
 * @version Next.js 15.5.4 / App Router / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { Suspense } from 'react'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Package } from 'lucide-react'
import {
  ReceiptStats,
  ReceiptList,
  ReceiptFilters,
  ReceiptActions,
} from '@/features/sppg/procurement/receipts/components'

// ================================ LOADING COMPONENTS ================================

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  )
}

function TableLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

// ================================ PAGE COMPONENT ================================

function ReceiptsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-end justify-between gap-4">
        <ProcurementPageHeader
          title="Penerimaan Barang"
          description="Kelola penerimaan dan quality control barang dari supplier"
          icon={Package}
          breadcrumbs={['Procurement', 'Receipts']}
          action={{
            label: 'Tambah Penerimaan',
            href: '/procurement/receipts/new',
            icon: Plus
          }}
        />
        <ReceiptFilters />
      </div>

      {/* Statistics Cards */}
      <Suspense fallback={<StatsLoading />}>
        <ReceiptStats />
      </Suspense>

      {/* Receipt List Table */}
      <div className="rounded-lg border bg-card">
        <Suspense fallback={<TableLoading />}>
          <ReceiptList />
        </Suspense>
      </div>

      {/* Bulk Actions Toolbar (appears when items selected) */}
      <ReceiptActions />
    </div>
  )
}

export default ReceiptsPage
