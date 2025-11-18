/**
 * @fileoverview Pending Duration Badge Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Compact badge showing how long order has been pending
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle } from 'lucide-react'
import { differenceInDays, differenceInHours } from 'date-fns'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface PendingDurationBadgeProps {
  /** Order creation date or status change date */
  startDate: Date | string
  /** Current status */
  status: string
  /** Threshold in days for warning */
  warningThreshold?: number
  /** Show icon */
  showIcon?: boolean
  className?: string
}

// ================================ COMPONENT ================================

export function PendingDurationBadge({
  startDate,
  status,
  warningThreshold = 3,
  showIcon = true,
  className,
}: PendingDurationBadgeProps) {
  // Only show for pending status
  if (status !== 'PENDING_APPROVAL') {
    return null
  }

  const start = new Date(startDate)
  const now = new Date()
  const daysPending = differenceInDays(now, start)
  const hoursPending = differenceInHours(now, start)

  // Determine urgency
  const isOverdue = daysPending >= warningThreshold
  const isWarning = daysPending >= warningThreshold - 1 && !isOverdue

  // Format duration text
  let durationText: string
  if (daysPending === 0) {
    durationText = hoursPending === 0 ? 'Baru saja' : `${hoursPending} jam`
  } else if (daysPending === 1) {
    durationText = '1 hari'
  } else {
    durationText = `${daysPending} hari`
  }

  return (
    <Badge
      variant={isOverdue ? 'destructive' : isWarning ? 'secondary' : 'outline'}
      className={cn(
        'text-xs',
        isWarning && 'border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        className
      )}
    >
      {showIcon && (
        <>
          {isOverdue ? (
            <AlertTriangle className="mr-1 h-3 w-3" />
          ) : (
            <Clock className="mr-1 h-3 w-3" />
          )}
        </>
      )}
      {durationText}
    </Badge>
  )
}
