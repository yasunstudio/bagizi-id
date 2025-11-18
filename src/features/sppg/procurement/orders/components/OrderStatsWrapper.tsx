/**
 * @fileoverview Order Statistics Wrapper - Simplified Statistics Display
 * Fetches and displays order statistics using existing hooks
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useOrderStats } from '../hooks'
import { ProcurementStatsGrid, type StatCardData } from '@/components/shared/procurement'
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  TruckIcon,
  DollarSign,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '../utils'

/**
 * OrderStatsWrapper - Auto-fetch and display order statistics
 * Simplified component that handles data fetching internally
 */
export function OrderStatsWrapper() {
  const { data: stats, isLoading, error } = useOrderStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Statistics</CardTitle>
          <CardDescription>
            {error?.message || 'Gagal memuat statistik order'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Guard check: Ensure byStatus exists and is an array
  if (!stats.byStatus || !Array.isArray(stats.byStatus)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Invalid Statistics Data</CardTitle>
          <CardDescription>
            Data statistik tidak lengkap. Silakan refresh halaman.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Count orders by status
  const pendingCount = stats.byStatus.find(s => s.status === 'PENDING_APPROVAL')?.count || 0
  const approvedCount = stats.byStatus.find(s => s.status === 'APPROVED')?.count || 0
  const orderedCount = stats.byStatus.find(s => s.status === 'ORDERED')?.count || 0
  const partialCount = stats.byStatus.find(s => s.status === 'PARTIALLY_RECEIVED')?.count || 0
  const completedCount = stats.byStatus.find(s => s.status === 'COMPLETED')?.count || 0
  const rejectedCount = stats.byStatus.find(s => s.status === 'REJECTED')?.count || 0
  const cancelledCount = stats.byStatus.find(s => s.status === 'CANCELLED')?.count || 0

  // Prepare stats data
  const primaryStats: StatCardData[] = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      description: 'Semua order',
      icon: ShoppingBag,
      iconColor: 'primary',
    },
    {
      label: 'Total Nilai',
      value: formatCurrency(stats.totalAmount),
      description: 'Total amount',
      icon: DollarSign,
      iconColor: 'success',
    },
    {
      label: 'Rata-rata Order',
      value: formatCurrency(stats.averageOrderValue),
      description: 'Per order',
      icon: DollarSign,
      iconColor: 'default',
    },
    {
      label: 'Pending Approval',
      value: pendingCount,
      description: 'Menunggu persetujuan',
      icon: Clock,
      iconColor: 'warning',
    },
  ]

  const secondaryStats: StatCardData[] = [
    {
      label: 'Approved',
      value: approvedCount,
      description: 'Disetujui',
      icon: CheckCircle2,
      iconColor: 'success',
    },
    {
      label: 'In Transit',
      value: orderedCount + partialCount,
      description: 'Dalam pengiriman',
      icon: TruckIcon,
      iconColor: 'primary',
    },
    {
      label: 'Completed',
      value: completedCount,
      description: 'Selesai',
      icon: CheckCircle2,
      iconColor: 'success',
    },
    {
      label: 'Rejected/Cancelled',
      value: rejectedCount + cancelledCount,
      description: 'Ditolak/Dibatalkan',
      icon: XCircle,
      iconColor: 'danger',
    },
  ]

  return (
    <div className="space-y-4">
      <ProcurementStatsGrid stats={primaryStats} columns={4} />
      <ProcurementStatsGrid stats={secondaryStats} columns={4} />
    </div>
  )
}

