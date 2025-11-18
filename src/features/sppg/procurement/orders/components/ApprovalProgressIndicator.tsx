/**
 * @fileoverview Approval Progress Indicator Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Compact approval progress indicator for lists and cards
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface ApprovalProgressIndicatorProps {
  /** Number of approved */
  approvedCount: number
  /** Total required approvers */
  requiredApprovers: number
  /** Has any rejection */
  hasRejection?: boolean
  /** Show as badge only */
  badgeOnly?: boolean
  /** Show progress bar */
  showProgress?: boolean
  className?: string
}

// ================================ COMPONENT ================================

export function ApprovalProgressIndicator({
  approvedCount,
  requiredApprovers,
  hasRejection = false,
  badgeOnly = false,
  showProgress = true,
  className,
}: ApprovalProgressIndicatorProps) {
  const progressPercentage = (approvedCount / requiredApprovers) * 100
  const isFullyApproved = approvedCount >= requiredApprovers

  if (badgeOnly) {
    return (
      <Badge
        variant={
          hasRejection ? 'destructive' : isFullyApproved ? 'default' : 'secondary'
        }
        className={cn('text-xs', className)}
      >
        {hasRejection && <XCircle className="mr-1 h-3 w-3" />}
        {!hasRejection && isFullyApproved && (
          <CheckCircle2 className="mr-1 h-3 w-3" />
        )}
        {!hasRejection && !isFullyApproved && <Clock className="mr-1 h-3 w-3" />}
        {approvedCount}/{requiredApprovers}
      </Badge>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Approval:</span>
          <span className="font-medium">
            {approvedCount} / {requiredApprovers}
          </span>
        </div>

        {hasRejection ? (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="mr-1 h-3 w-3" />
            Ditolak
          </Badge>
        ) : isFullyApproved ? (
          <Badge variant="default" className="text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Lengkap
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )}
      </div>

      {showProgress && !hasRejection && !isFullyApproved && (
        <Progress value={progressPercentage} className="h-1.5" />
      )}
    </div>
  )
}
