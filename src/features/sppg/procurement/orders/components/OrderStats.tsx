/**
 * @fileoverview Order Statistics Component - Dashboard statistics for orders
 * @version Next.js 15.5.4 / React 19 / TypeScript 5.7.2
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Overview statistics cards
 * - Status breakdown with charts
 * - Payment status metrics
 * - Delivery status metrics
 * - Amount statistics (total, average, min, max)
 * - Trend indicators
 * - Period comparison
 * - Responsive grid layout
 * 
 * USAGE:
 * ```tsx
 * <OrderStats
 *   stats={orderStats}
 *   isLoading={isLoading}
 *   period="month"
 * />
 * ```
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown,
  Package, 
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Truck,
  CreditCard,
  FileText
} from 'lucide-react'
import { formatCurrency } from '../utils'

// ================================ TYPES ================================

interface OrderStats {
  // Overview
  totalOrders: number
  totalAmount: number
  averageAmount: number
  
  // Status breakdown
  statusBreakdown: {
    draft: number
    pendingApproval: number
    approved: number
    ordered: number
    partiallyReceived: number
    fullyReceived: number
    completed: number
    cancelled: number
    rejected: number
  }
  
  // Payment status
  paymentBreakdown: {
    unpaid: number
    partial: number
    paid: number
    overdue: number
  }
  
  // Delivery status
  deliveryBreakdown: {
    ordered: number
    shipped: number
    inTransit: number
    delivered: number
    partial: number
    cancelled: number
  }
  
  // Trends (optional)
  trends?: {
    ordersChange: number // percentage
    amountChange: number // percentage
    completionRate: number // percentage
  }
}

interface OrderStatsProps {
  stats: OrderStats | null
  isLoading?: boolean
  period?: 'week' | 'month' | 'quarter' | 'year'
}

// ================================ COMPONENT ================================

/**
 * OrderStats - Statistics dashboard component
 * 
 * Features:
 * - Overview cards (total orders, amount, average)
 * - Status breakdown with visual indicators
 * - Payment status metrics
 * - Delivery status metrics
 * - Trend indicators with percentage changes
 * - Loading states with skeletons
 * - Responsive grid layout
 */
export function OrderStats({
  stats,
  isLoading = false,
  period = 'month',
}: OrderStatsProps) {
  if (isLoading || !stats) {
    return <StatsLoadingSkeleton />
  }

  const periodLabel = {
    week: 'Minggu Ini',
    month: 'Bulan Ini',
    quarter: 'Kuartal Ini',
    year: 'Tahun Ini',
  }[period]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">
              Total Order {periodLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                {stats.trends && (
                  <TrendBadge 
                    value={stats.trends.ordersChange} 
                    label="vs periode lalu"
                  />
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">
              Total Nilai Order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalAmount)}
                </div>
                {stats.trends && (
                  <TrendBadge 
                    value={stats.trends.amountChange} 
                    label="vs periode lalu"
                  />
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Amount */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">
              Rata-rata per Order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averageAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  dari {stats.totalOrders} order
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium">
              Tingkat Penyelesaian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {stats.trends?.completionRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Order selesai
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Status Order
            </CardTitle>
            <CardDescription>Breakdown berdasarkan status order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusItem
              icon={FileText}
              label="Draft"
              count={stats.statusBreakdown.draft}
              color="gray"
            />
            <StatusItem
              icon={Clock}
              label="Menunggu Persetujuan"
              count={stats.statusBreakdown.pendingApproval}
              color="yellow"
            />
            <StatusItem
              icon={CheckCircle2}
              label="Disetujui"
              count={stats.statusBreakdown.approved}
              color="blue"
            />
            <StatusItem
              icon={ShoppingCart}
              label="Dipesan"
              count={stats.statusBreakdown.ordered}
              color="indigo"
            />
            <StatusItem
              icon={Package}
              label="Diterima Sebagian"
              count={stats.statusBreakdown.partiallyReceived}
              color="orange"
            />
            <StatusItem
              icon={CheckCircle2}
              label="Diterima Penuh"
              count={stats.statusBreakdown.fullyReceived}
              color="teal"
            />
            <StatusItem
              icon={CheckCircle2}
              label="Selesai"
              count={stats.statusBreakdown.completed}
              color="green"
            />
            <StatusItem
              icon={XCircle}
              label="Dibatalkan"
              count={stats.statusBreakdown.cancelled}
              color="red"
            />
            <StatusItem
              icon={AlertTriangle}
              label="Ditolak"
              count={stats.statusBreakdown.rejected}
              color="red"
            />
          </CardContent>
        </Card>

        {/* Payment & Delivery Status */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Status Pembayaran
              </CardTitle>
              <CardDescription>Breakdown berdasarkan status pembayaran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusItem
                icon={XCircle}
                label="Belum Dibayar"
                count={stats.paymentBreakdown.unpaid}
                color="red"
              />
              <StatusItem
                icon={AlertTriangle}
                label="Dibayar Sebagian"
                count={stats.paymentBreakdown.partial}
                color="yellow"
              />
              <StatusItem
                icon={CheckCircle2}
                label="Lunas"
                count={stats.paymentBreakdown.paid}
                color="green"
              />
              <StatusItem
                icon={Clock}
                label="Jatuh Tempo"
                count={stats.paymentBreakdown.overdue}
                color="purple"
              />
            </CardContent>
          </Card>

          {/* Delivery Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Status Pengiriman
              </CardTitle>
              <CardDescription>Breakdown berdasarkan status pengiriman</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusItem
                icon={ShoppingCart}
                label="Dipesan"
                count={stats.deliveryBreakdown.ordered}
                color="blue"
              />
              <StatusItem
                icon={Package}
                label="Dikirim"
                count={stats.deliveryBreakdown.shipped}
                color="indigo"
              />
              <StatusItem
                icon={Truck}
                label="Dalam Perjalanan"
                count={stats.deliveryBreakdown.inTransit}
                color="purple"
              />
              <StatusItem
                icon={CheckCircle2}
                label="Terkirim"
                count={stats.deliveryBreakdown.delivered}
                color="green"
              />
              <StatusItem
                icon={AlertTriangle}
                label="Terkirim Sebagian"
                count={stats.deliveryBreakdown.partial}
                color="orange"
              />
              <StatusItem
                icon={XCircle}
                label="Dibatalkan"
                count={stats.deliveryBreakdown.cancelled}
                color="red"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ================================ SUB-COMPONENTS ================================

/**
 * StatusItem - Individual status item with icon and count
 */
interface StatusItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  count: number
  color: 'gray' | 'yellow' | 'blue' | 'indigo' | 'orange' | 'teal' | 'green' | 'red' | 'purple'
}

function StatusItem({ icon: Icon, label, count, color }: StatusItemProps) {
  const colorClasses = {
    gray: 'text-gray-600 bg-gray-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    blue: 'text-blue-600 bg-blue-100',
    indigo: 'text-indigo-600 bg-indigo-100',
    orange: 'text-orange-600 bg-orange-100',
    teal: 'text-teal-600 bg-teal-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge variant="secondary" className="font-semibold">
        {count}
      </Badge>
    </div>
  )
}

/**
 * TrendBadge - Trend indicator with percentage change
 */
interface TrendBadgeProps {
  value: number
  label: string
}

function TrendBadge({ value, label }: TrendBadgeProps) {
  const isPositive = value >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className={`flex items-center gap-1 mt-1 text-xs ${
      isPositive ? 'text-green-600' : 'text-red-600'
    }`}>
      <Icon className="h-3 w-3" />
      <span className="font-medium">{Math.abs(value).toFixed(1)}%</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

/**
 * StatsLoadingSkeleton - Loading state skeleton
 */
function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
