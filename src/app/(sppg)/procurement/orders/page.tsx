/**
 * @fileoverview Orders List Page - Client Component
 * Displays list of procurement orders with filtering and actions
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { ShoppingBag, Plus } from 'lucide-react'
import { ProcurementPageHeader } from '@/components/shared/procurement'
import { OrderList, OrderStatsWrapper } from '@/features/sppg/procurement/orders/components'

// ============================================================================
// Main Page Component
// ============================================================================

function OrdersPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header with Breadcrumb */}
      <ProcurementPageHeader
        title="Orders"
        description="Kelola order pembelian bahan makanan dari supplier"
        icon={ShoppingBag}
        breadcrumbs={['Procurement', 'Orders']}
        action={{
          label: 'Buat Order Baru',
          href: '/procurement/orders/new',
          icon: Plus,
        }}
      />

      {/* Order Statistics */}
      <OrderStatsWrapper />

      {/* Orders List */}
      <OrderList />
    </div>
  )
}

// ============================================================================
// Export with Auth Protection
// ============================================================================

export default OrdersPage
