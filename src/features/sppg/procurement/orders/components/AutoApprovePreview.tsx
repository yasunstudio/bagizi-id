/**
 * @fileoverview Auto-Approve Preview Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Shows real-time auto-approve status in order form
 */

'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, CheckCircle2, Clock, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface AutoApprovePreviewProps {
  /** Current order total */
  orderTotal: number
  /** Auto-approve threshold */
  threshold?: number
  /** Show progress bar */
  showProgress?: boolean
  className?: string
}

// ================================ HELPERS ================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// ================================ COMPONENT ================================

export function AutoApprovePreview({
  orderTotal,
  threshold = 5000000,
  showProgress = true,
  className,
}: AutoApprovePreviewProps) {
  const percentage = (orderTotal / threshold) * 100
  const willAutoApprove = orderTotal > 0 && orderTotal < threshold
  const needsApproval = orderTotal >= threshold

  // Don't show if no amount yet
  if (orderTotal === 0) {
    return null
  }

  return (
    <Alert
      className={cn(
        'border-2',
        willAutoApprove && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
        needsApproval && 'border-blue-500 bg-blue-50 dark:bg-blue-950',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {willAutoApprove ? (
          <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        ) : (
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        )}

        <div className="flex-1 space-y-2">
          <AlertTitle className="flex items-center gap-2">
            {willAutoApprove ? (
              <>
                Order Akan Auto-Approved
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Langsung Disetujui
                </Badge>
              </>
            ) : (
              <>
                Perlu Approval Manual
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Menunggu Approval
                </Badge>
              </>
            )}
          </AlertTitle>

          <AlertDescription className="space-y-3">
            <div className="text-sm">
              {willAutoApprove ? (
                <p>
                  Order ini akan <strong>disetujui otomatis</strong> karena total nilai di bawah
                  threshold auto-approve ({formatCurrency(threshold)}).
                </p>
              ) : (
                <p>
                  Order ini akan masuk ke <strong>proses approval manual</strong> karena total
                  nilai melebihi threshold auto-approve.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Order:</span>
                <p className="font-semibold">{formatCurrency(orderTotal)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Threshold:</span>
                <p className="font-semibold">{formatCurrency(threshold)}</p>
              </div>
            </div>

            {showProgress && (
              <div className="space-y-2">
                <Progress
                  value={Math.min(percentage, 100)}
                  className={cn(
                    'h-2',
                    willAutoApprove && '[&>div]:bg-emerald-500',
                    needsApproval && '[&>div]:bg-blue-500'
                  )}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Math.round(percentage)}% dari threshold</span>
                  {needsApproval && (
                    <span className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Membutuhkan approval
                    </span>
                  )}
                </div>
              </div>
            )}

            {willAutoApprove && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 rounded-md p-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Order akan langsung berstatus <strong>APPROVED</strong> setelah disimpan
                </span>
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
