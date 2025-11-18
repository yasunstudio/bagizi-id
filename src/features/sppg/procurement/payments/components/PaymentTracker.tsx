"use client"

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Check,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { usePayments } from '@/features/sppg/procurement/payments/hooks'
import { formatPaymentStatus } from '@/features/sppg/procurement/payments/types'
import { cn } from '@/lib/utils'

interface PaymentTrackerProps {
  procurementId: string
  onAddPayment?: () => void
}

export function PaymentTracker({ procurementId, onAddPayment }: PaymentTrackerProps) {
  const { data: response, isLoading } = usePayments({
    search: procurementId,
    limit: 100,
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find the procurement we're tracking
  const procurement = response?.data?.payments?.find(p => p.procurementId === procurementId)

  if (!procurement) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Data pembayaran tidak ditemukan</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = (procurement.paidAmount / procurement.totalAmount) * 100
  const isOverdue = procurement.paymentStatus === 'OVERDUE'
  const isPaid = procurement.paymentStatus === 'PAID'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Tracker</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {procurement.procurementCode}
            </p>
          </div>
          <Badge
            variant={
              isPaid ? 'default' : isOverdue ? 'destructive' : 'secondary'
            }
            className={cn(
              isPaid && 'bg-green-500 hover:bg-green-600'
            )}
          >
            {formatPaymentStatus(procurement.paymentStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Payment Progress</span>
            <span className="text-sm text-muted-foreground">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isPaid && 'bg-green-500',
                !isPaid && !isOverdue && 'bg-primary',
                isOverdue && 'bg-destructive'
              )}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>

          {/* Amount Summary */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-sm">
                Rp {procurement.totalAmount.toLocaleString('id-ID', { notation: 'compact' })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="font-semibold text-sm text-green-600">
                Rp {procurement.paidAmount.toLocaleString('id-ID', { notation: 'compact' })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="font-semibold text-sm text-orange-600">
                Rp {procurement.remainingAmount.toLocaleString('id-ID', { notation: 'compact' })}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Payment Timeline</h4>

          <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            {/* Procurement Date */}
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                <Calendar className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium">Procurement Created</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(procurement.procurementDate).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supplier: {procurement.supplierName || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Payment Due */}
            {procurement.paymentDue && (
              <div className="relative flex items-start gap-4">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10",
                  isOverdue ? "bg-destructive" : "bg-orange-500"
                )}>
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium">
                    Payment {isOverdue ? 'Overdue' : 'Due Date'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(procurement.paymentDue).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {procurement.paymentTerms && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Terms: {procurement.paymentTerms}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Paid Status */}
            {procurement.paidAmount > 0 && (
              <div className="relative flex items-start gap-4">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10",
                  isPaid ? "bg-green-500" : "bg-blue-500"
                )}>
                  {isPaid ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium">
                    {isPaid ? 'Fully Paid' : 'Partial Payment'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rp {procurement.paidAmount.toLocaleString('id-ID')} paid
                  </p>
                  {!isPaid && (
                    <p className="text-xs text-orange-600 mt-1">
                      Rp {procurement.remainingAmount.toLocaleString('id-ID')} remaining
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {!isPaid && onAddPayment && (
          <Button onClick={onAddPayment} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
