/**
 * @fileoverview Escalation Alert Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Display escalation warnings for pending orders
 */

'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface EscalationAlertProps {
  /** Order creation date */
  createdAt: Date | string
  /** Order status */
  status: string
  /** Escalation threshold in days */
  thresholdDays?: number
  /** Show escalate button */
  showEscalateButton?: boolean
  /** Escalate action handler */
  onEscalate?: () => void
  /** Is escalating */
  isEscalating?: boolean
  className?: string
}

// ================================ COMPONENT ================================

export function EscalationAlert({
  createdAt,
  status,
  thresholdDays = 3,
  showEscalateButton = true,
  onEscalate,
  isEscalating = false,
  className,
}: EscalationAlertProps) {
  // Only show for pending approval
  if (status !== 'PENDING_APPROVAL') {
    return null
  }

  const createdDate = new Date(createdAt)
  const now = new Date()
  const daysPending = differenceInDays(now, createdDate)

  // Calculate urgency level
  const isOverdue = daysPending >= thresholdDays
  const isNearThreshold = daysPending >= thresholdDays - 1 && !isOverdue
  const shouldAutoEscalate = daysPending >= thresholdDays + 1

  // Don't show if not near threshold
  if (daysPending < thresholdDays - 1) {
    return null
  }

  return (
    <Alert
      className={cn(
        'border-2',
        isOverdue && 'border-red-500 bg-red-50 dark:bg-red-950',
        isNearThreshold && 'border-amber-500 bg-amber-50 dark:bg-amber-950',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <AlertTriangle
          className={cn(
            'h-5 w-5 mt-0.5',
            isOverdue && 'text-red-600 dark:text-red-400',
            isNearThreshold && 'text-amber-600 dark:text-amber-400'
          )}
        />

        <div className="flex-1 space-y-2">
          <AlertTitle className="flex items-center gap-2">
            {isOverdue ? 'Eskalasi Diperlukan!' : 'Mendekati Batas Waktu'}
            <Badge
              variant={isOverdue ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              <Clock className="mr-1 h-3 w-3" />
              {daysPending} hari pending
            </Badge>
          </AlertTitle>

          <AlertDescription className="space-y-2">
            {isOverdue ? (
              <p>
                Order ini sudah pending selama <strong>{daysPending} hari</strong>{' '}
                (lebih dari threshold {thresholdDays} hari).{' '}
                {shouldAutoEscalate && (
                  <span className="font-semibold text-red-700 dark:text-red-300">
                    Auto-eskalasi akan segera dijalankan.
                  </span>
                )}
              </p>
            ) : (
              <p>
                Order ini sudah pending selama{' '}
                {formatDistanceToNow(createdDate, {
                  addSuffix: false,
                  locale: localeId,
                })}{' '}
                dan mendekati threshold eskalasi ({thresholdDays} hari).
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Dibuat: {formatDistanceToNow(createdDate, { addSuffix: true, locale: localeId })}
              </span>
              <span>•</span>
              <span>Threshold: {thresholdDays} hari</span>
            </div>
          </AlertDescription>

          {showEscalateButton && onEscalate && (
            <Button
              onClick={onEscalate}
              disabled={isEscalating}
              size="sm"
              variant={isOverdue ? 'destructive' : 'secondary'}
              className="mt-2"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {isEscalating ? 'Mengekskalasi...' : 'Eskalasi Sekarang'}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}
