/**
 * @fileoverview Overdue Payments Component - Alert list of overdue payments
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * FEATURES:
 * - List of overdue payments with days overdue
 * - Aging category badges (Current, 31-60, 61-90, 90+)
 * - Supplier contact information
 * - Quick payment action
 * - Sort by most overdue first
 * - Real-time updates via TanStack Query
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useOverduePayments } from '../hooks'
import { formatPaymentStatus, getPaymentStatusBadgeVariant } from '../types'
import { 
  AlertTriangle, 
  Clock, 
  Phone, 
  ExternalLink,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OverduePaymentsProps {
  limit?: number
  className?: string
  onPayClick?: (procurementId: string) => void
}

/**
 * Overdue Payments Alert Component
 * Shows list of payments past due date
 */
export function OverduePayments({ limit, className, onPayClick }: OverduePaymentsProps) {
  const { data, isLoading, error } = useOverduePayments()
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
    
    console.error('[OverduePayments] Error:',
      '\nError Message:', error instanceof Error ? error.message : 'Not an Error instance',
      '\nError Type:', typeof error,
      '\nError String:', String(error),
      '\nError Stack:', error instanceof Error ? error.stack : 'N/A',
      '\nFull Error:', error
    )
    
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Gagal memuat pembayaran terlambat</AlertTitle>
        <AlertDescription>
          {errorMessage || 'Tidak dapat mengambil data pembayaran terlambat. Pastikan Anda sudah login dan memiliki izin yang sesuai.'}
          {errorStatus && ` (HTTP ${errorStatus})`}
        </AlertDescription>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">Info Debug</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
              Error Message: {errorMessage}{'\n'}
              Error Type: {typeof error}{'\n'}
              Is Error Instance: {error instanceof Error ? 'Yes' : 'No'}{'\n'}
              HTTP Status: {errorStatus || 'N/A'}{'\n'}
              {errorDetails && `Error Details: ${JSON.stringify(errorDetails, null, 2)}\n`}
              {error instanceof Error && `Error Stack:\n${error.stack}`}
            </pre>
          </details>
        )}
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const overduePayments = data?.data?.payments || []
  const summary = data?.data?.summary || {}
  const displayPayments = limit ? overduePayments.slice(0, limit) : overduePayments

  if (overduePayments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Clock className="h-5 w-5" />
            Tidak Ada Pembayaran Terlambat
          </CardTitle>
          <CardDescription>
            Semua pembayaran tepat waktu. Kerja bagus! 🎉
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  /**
   * Get aging badge variant based on category
   */
  const getAgingBadgeVariant = (category: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (category) {
      case 'CURRENT': return 'secondary'
      case 'DAYS_31_60': return 'outline'
      case 'DAYS_61_90': return 'destructive'
      case 'OVER_90': return 'destructive'
      default: return 'outline'
    }
  }

  /**
   * Get aging label
   */
  const getAgingLabel = (category: string): string => {
    switch (category) {
      case 'CURRENT': return '0-30 hari'
      case 'DAYS_31_60': return '31-60 hari'
      case 'DAYS_61_90': return '61-90 hari'
      case 'OVER_90': return '90+ hari'
      default: return category
    }
  }

  return (
    <Card className={cn('border-destructive', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Peringatan Pembayaran Terlambat
        </CardTitle>
        <CardDescription>
          {(summary as Record<string, number>).totalCount} pembayaran lewat jatuh tempo · Total: Rp {((summary as Record<string, number>).totalOverdueAmount as number)?.toLocaleString('id-ID') || '0'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayPayments.map((payment) => (
          <div
            key={payment.procurementId}
            className={cn(
              'border rounded-lg p-4 space-y-3 transition-colors',
              'hover:bg-muted/50',
              payment.daysOverdue > 90 && 'border-destructive bg-destructive/5'
            )}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/procurement/orders/${payment.procurementId}`}
                    className="font-semibold hover:underline"
                  >
                    {payment.procurementCode}
                  </Link>
                  <Badge variant={getPaymentStatusBadgeVariant(payment.paymentStatus)}>
                    {formatPaymentStatus(payment.paymentStatus)}
                  </Badge>
                  <Badge variant={getAgingBadgeVariant(payment.agingCategory)}>
                    {getAgingLabel(payment.agingCategory)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {payment.supplierName}
                  {payment.invoiceNumber && (
                    <span className="ml-2">· Invoice: {payment.invoiceNumber}</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground">Sisa Belum Dibayar</div>
                <div className="text-lg font-bold text-destructive">
                  Rp {payment.remainingAmount.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Details Row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="font-semibold text-destructive">
                  {payment.daysOverdue} hari terlambat
                </span>
              </div>
              <div>
                Jatuh Tempo: {new Date(payment.paymentDue).toLocaleDateString('id-ID')}
              </div>
              {payment.paymentTerms && (
                <div>Termin: {payment.paymentTerms}</div>
              )}
            </div>

            {/* Amount Breakdown */}
            <div className="flex items-center gap-4 text-sm pt-2 border-t">
              <div>
                <span className="text-muted-foreground">Total:</span>{' '}
                <span className="font-medium">
                  Rp {payment.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Dibayar:</span>{' '}
                <span className="font-medium">
                  Rp {payment.paidAmount.toLocaleString('id-ID')}
                </span>
              </div>
              {payment.lastPaymentDate && (
                <div>
                  <span className="text-muted-foreground">Pembayaran Terakhir:</span>{' '}
                  <span className="font-medium">
                    {new Date(payment.lastPaymentDate).toLocaleDateString('id-ID')}
                    {' '}(Rp {payment.lastPaymentAmount?.toLocaleString('id-ID')})
                  </span>
                </div>
              )}
            </div>

            {/* Supplier Contact (Expandable) */}
            {payment.supplierContact && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === payment.procurementId ? null : payment.procurementId)}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {expandedId === payment.procurementId ? 'Sembunyikan' : 'Tampilkan'} kontak supplier
                </Button>
                
                {expandedId === payment.procurementId && (
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    {payment.supplierContact && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${payment.supplierContact}`} className="hover:underline">
                          {payment.supplierContact}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onPayClick?.(payment.procurementId)}
                className="gap-1"
              >
                <DollarSign className="h-4 w-4" />
                Catat Pembayaran
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
              >
                <Link href={`/procurement/orders/${payment.procurementId}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Lihat Detail
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {/* Show More Link */}
        {limit && overduePayments.length > limit && (
          <Button
            variant="link"
            asChild
            className="w-full"
          >
            <Link href="/procurement/payments?filter=overdue">
              Lihat semua {overduePayments.length} pembayaran terlambat →
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
