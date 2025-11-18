/**
 * @fileoverview Approval Tracking Card Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * CRITICAL: Displays parallel approval workflow tracking
 * - Real-time approval progress
 * - Approver status indicators
 * - Escalation history
 * - Comments and timestamps
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface ApprovalTracking {
  id: string
  approverName: string
  approverRole: string
  action: 'APPROVED' | 'REJECTED' | 'ESCALATED'
  comments?: string | null
  approvedAt: Date | string
  isEscalated: boolean
  escalatedFrom?: string | null
  escalatedReason?: string | null
}

interface ApprovalTrackingCardProps {
  /** Current approval tracking records */
  approvals: ApprovalTracking[]
  /** Total required approvers */
  requiredApprovers?: number
  /** Current order status */
  orderStatus: string
  /** Show compact view */
  compact?: boolean
  className?: string
}

// ================================ COMPONENT ================================

export function ApprovalTrackingCard({
  approvals,
  requiredApprovers = 3,
  orderStatus,
  compact = false,
  className,
}: ApprovalTrackingCardProps) {
  // Calculate approval progress
  const approvedCount = approvals.filter((a) => a.action === 'APPROVED').length
  const rejectedCount = approvals.filter((a) => a.action === 'REJECTED').length
  const escalatedCount = approvals.filter((a) => a.isEscalated).length
  const progressPercentage = (approvedCount / requiredApprovers) * 100

  // Determine overall status
  const hasRejection = rejectedCount > 0
  const isFullyApproved = approvedCount >= requiredApprovers
  const isPending = orderStatus === 'PENDING_APPROVAL'

  return (
    <Card className={cn('', className)}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={compact ? 'text-lg' : ''}>
              Status Persetujuan
            </CardTitle>
            <CardDescription>
              {approvedCount} dari {requiredApprovers} approver telah menyetujui
            </CardDescription>
          </div>

          {/* Overall Status Badge */}
          <Badge
            variant={
              hasRejection
                ? 'destructive'
                : isFullyApproved
                ? 'default'
                : 'secondary'
            }
            className="text-xs"
          >
            {hasRejection && (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Ditolak
              </>
            )}
            {!hasRejection && isFullyApproved && (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Disetujui
              </>
            )}
            {!hasRejection && !isFullyApproved && isPending && (
              <>
                <Clock className="mr-1 h-3 w-3" />
                Menunggu
              </>
            )}
          </Badge>
        </div>

        {/* Progress Bar */}
        {!compact && isPending && (
          <div className="mt-4 space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Progress persetujuan: {Math.round(progressPercentage)}%
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : ''}>
        {/* Escalation Alert */}
        {escalatedCount > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">
                {escalatedCount} Eskalasi
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                Order ini telah dieskalasi ke level approval lebih tinggi
              </p>
            </div>
          </div>
        )}

        {/* Approval Timeline */}
        <div className="space-y-3">
          {approvals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Belum ada approval
              </p>
            </div>
          ) : (
            approvals.map((approval, index) => (
              <div key={approval.id}>
                {index > 0 && <Separator className="my-3" />}

                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={cn(
                        'text-xs',
                        approval.action === 'APPROVED' &&
                          'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
                        approval.action === 'REJECTED' &&
                          'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                        approval.action === 'ESCALATED' &&
                          'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      )}
                    >
                      {approval.approverName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Approval Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {approval.approverName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        <User className="mr-1 h-3 w-3" />
                        {approval.approverRole}
                      </Badge>
                    </div>

                    {/* Action Badge */}
                    <div className="flex items-center gap-2">
                      {approval.action === 'APPROVED' && (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Disetujui
                        </Badge>
                      )}
                      {approval.action === 'REJECTED' && (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Ditolak
                        </Badge>
                      )}
                      {approval.action === 'ESCALATED' && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        >
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Dieskalasi
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(approval.approvedAt), {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </span>
                    </div>

                    {/* Comments */}
                    {approval.comments && (
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="mt-0.5 h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {approval.comments}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Escalation Details */}
                    {approval.isEscalated && approval.escalatedFrom && (
                      <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-900 dark:bg-amber-950">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          <strong>Dieskalasi dari:</strong>{' '}
                          {approval.escalatedFrom}
                        </p>
                        {approval.escalatedReason && (
                          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                            <strong>Alasan:</strong> {approval.escalatedReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pending Approvers Info */}
        {isPending && approvedCount < requiredApprovers && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Menunggu {requiredApprovers - approvedCount} approver lagi
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Order akan otomatis diproses setelah semua approver menyetujui
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
