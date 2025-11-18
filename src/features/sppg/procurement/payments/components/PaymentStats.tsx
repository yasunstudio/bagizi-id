/**
 * @fileoverview Payment Statistics Component - Dashboard cards showing payment metrics
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * FEATURES:
 * - Total outstanding amount
 * - Overdue payments alert
 * - Due this week/month
 * - Payment trends (vs last month)
 * - Aging breakdown
 * - Real-time updates via TanStack Query
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePaymentStats } from '../hooks'
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentStatsProps {
  supplierId?: string
  className?: string
}

/**
 * Payment Statistics Cards Component
 * Displays comprehensive payment metrics in a grid layout
 */
export function PaymentStats({ supplierId, className }: PaymentStatsProps) {
  const { data, isLoading, error } = usePaymentStats(
    supplierId ? { supplierId } : undefined
  )

  // Debug logging
  if (error) {
    console.error('[PaymentStats] Error:', 
      '\nError Message:', error instanceof Error ? error.message : 'Not an Error instance',
      '\nError Type:', typeof error,
      '\nError String:', String(error),
      '\nError Stack:', error instanceof Error ? error.stack : 'N/A',
      '\nSupplier ID:', supplierId,
      '\nFull Error:', error
    )
  }

  if (data) {
    console.log('[PaymentStats] Success:', {
      hasData: !!data?.data,
      dataKeys: data?.data ? Object.keys(data.data) : [],
    })
  }

  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Unknown error occurred'
    
    // Extract additional error details if available
    const errorStatus = error && typeof error === 'object' && 'status' in error 
      ? (error as { status: number }).status 
      : null
    const errorDetails = error && typeof error === 'object' && 'errorData' in error
      ? (error as { errorData: Record<string, unknown> | null }).errorData
      : null
    
    return (
      <Card className={cn('border-destructive', className)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-2 text-destructive py-8">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm font-medium">Gagal memuat statistik pembayaran</p>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              {errorMessage || 'Tidak dapat mengambil data pembayaran. Pastikan Anda sudah login dan memiliki izin yang sesuai.'}
            </p>
            {errorStatus && (
              <p className="text-xs text-muted-foreground">
                HTTP Status: {errorStatus}
              </p>
            )}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer">Info Debug</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto max-w-md">
                  Error Message: {errorMessage}{'\n'}
                  Error Type: {typeof error}{'\n'}
                  Is Error Instance: {error instanceof Error ? 'Yes' : 'No'}{'\n'}
                  HTTP Status: {errorStatus || 'N/A'}{'\n'}
                  {errorDetails && `Error Details: ${JSON.stringify(errorDetails, null, 2)}\n`}
                  {error instanceof Error && `Error Stack:\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = data?.data

  if (!stats) {
    return null
  }

  // Calculate trend percentage
  const trendPercentage = stats.trends?.changeFromLastMonth || 0
  const isPositiveTrend = trendPercentage >= 0

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Total Outstanding */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Belum Dibayar
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {stats.summary.totalOutstanding.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.summary.totalProcurements} pengadaan
          </p>
        </CardContent>
      </Card>

      {/* Overdue Payments */}
      <Card className={stats.summary.totalOverdue > 0 ? 'border-destructive' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pembayaran Terlambat
          </CardTitle>
          <AlertTriangle className={cn(
            'h-4 w-4',
            stats.summary.totalOverdue > 0 ? 'text-destructive' : 'text-muted-foreground'
          )} />
        </CardHeader>
        <CardContent>
          <div className={cn(
            'text-2xl font-bold',
            stats.summary.totalOverdue > 0 && 'text-destructive'
          )}>
            Rp {stats.summary.totalOverdue.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.summary.overdueCount} invoice terlambat
          </p>
        </CardContent>
      </Card>

      {/* Due This Week */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Jatuh Tempo Minggu Ini
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {stats.dueSoon.next7Days.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-muted-foreground">
            Perlu perhatian segera
          </p>
        </CardContent>
      </Card>

      {/* Payment Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Bulan Ini
          </CardTitle>
          {isPositiveTrend ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {stats.trends.thisMonth.amount.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPositiveTrend ? 'default' : 'destructive'} className="text-xs">
              {isPositiveTrend ? '+' : ''}{trendPercentage.toFixed(1)}%
            </Badge>
            <p className="text-xs text-muted-foreground">
              vs bulan lalu
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aging Breakdown - Full Width */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Umur Hutang Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* 0-30 Days (Current) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">0-30 Hari</span>
                <Badge variant="outline">Lancar</Badge>
              </div>
              <div className="text-2xl font-bold">
                Rp {stats.aging.current.toLocaleString('id-ID')}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ 
                    width: `${(stats.aging.current / stats.summary.totalOutstanding * 100).toFixed(0)}%` 
                  }}
                />
              </div>
            </div>

            {/* 31-60 Days */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">31-60 Hari</span>
                <Badge variant="secondary">Perhatian</Badge>
              </div>
              <div className="text-2xl font-bold">
                Rp {stats.aging.days31to60.toLocaleString('id-ID')}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500"
                  style={{ 
                    width: `${(stats.aging.days31to60 / stats.summary.totalOutstanding * 100).toFixed(0)}%` 
                  }}
                />
              </div>
            </div>

            {/* 61-90 Days */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">61-90 Hari</span>
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  Siaga
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                Rp {stats.aging.days61to90.toLocaleString('id-ID')}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500"
                  style={{ 
                    width: `${(stats.aging.days61to90 / stats.summary.totalOutstanding * 100).toFixed(0)}%` 
                  }}
                />
              </div>
            </div>

            {/* 90+ Days */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">90+ Hari</span>
                <Badge variant="destructive">Kritis</Badge>
              </div>
              <div className="text-2xl font-bold">
                Rp {stats.aging.over90.toLocaleString('id-ID')}
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500"
                  style={{ 
                    width: `${(stats.aging.over90 / stats.summary.totalOutstanding * 100).toFixed(0)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Due This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            Rp {stats.dueSoon.next30Days.toLocaleString('id-ID')}
          </div>
          <p className="text-sm text-muted-foreground">
            Plan cash flow for upcoming payments
          </p>
        </CardContent>
      </Card>

      {/* Average Payment Cycle */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Average Payment Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {stats.avgPaymentCycle} days
          </div>
          <p className="text-sm text-muted-foreground">
            From procurement date to full payment
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
