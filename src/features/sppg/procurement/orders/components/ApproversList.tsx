/**
 * @fileoverview Approvers List Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Display list of required approvers with their status
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle2, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface Approver {
  role: string
  level: number
  isRequired: boolean
  status?: 'APPROVED' | 'PENDING' | 'NOT_REQUIRED'
  approverName?: string
  approvedAt?: Date | string
}

interface ApproversListProps {
  /** List of approvers with their status */
  approvers: Approver[]
  /** Show as compact list */
  compact?: boolean
  className?: string
}

// ================================ HELPERS ================================

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    SPPG_KEPALA: 'Kepala SPPG',
    SPPG_ADMIN: 'Admin SPPG',
    SPPG_AKUNTAN: 'Akuntan',
    SPPG_PRODUKSI_MANAGER: 'Manager Produksi',
    SPPG_AHLI_GIZI: 'Ahli Gizi',
  }
  return labels[role] || role
}

// ================================ COMPONENT ================================

export function ApproversList({
  approvers,
  compact = false,
  className,
}: ApproversListProps) {
  const requiredApprovers = approvers.filter((a) => a.isRequired)
  const approvedCount = requiredApprovers.filter(
    (a) => a.status === 'APPROVED'
  ).length

  return (
    <Card className={className}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <CardTitle className={compact ? 'text-base' : ''}>
          Daftar Approver
        </CardTitle>
        <CardDescription>
          {approvedCount} dari {requiredApprovers.length} level telah menyetujui
        </CardDescription>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : ''}>
        <div className={cn('space-y-3', compact && 'space-y-2')}>
          {approvers.map((approver) => (
            <div
              key={`${approver.role}-${approver.level}`}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3',
                approver.status === 'APPROVED' &&
                  'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',
                approver.status === 'PENDING' &&
                  'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
                !approver.isRequired &&
                  'border-dashed opacity-60'
              )}
            >
              {/* Avatar */}
              <Avatar className={cn('h-10 w-10', compact && 'h-8 w-8')}>
                <AvatarFallback
                  className={cn(
                    approver.status === 'APPROVED' &&
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                    approver.status === 'PENDING' &&
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  )}
                >
                  {approver.approverName
                    ? approver.approverName.substring(0, 2).toUpperCase()
                    : `L${approver.level}`}
                </AvatarFallback>
              </Avatar>

              {/* Approver Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn('font-medium', compact && 'text-sm')}>
                    Level {approver.level}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    <User className="mr-1 h-3 w-3" />
                    {getRoleLabel(approver.role)}
                  </Badge>
                </div>

                {approver.approverName && (
                  <p className="text-xs text-muted-foreground">
                    {approver.approverName}
                  </p>
                )}

                {!approver.isRequired && (
                  <p className="text-xs text-muted-foreground italic">
                    Tidak diperlukan untuk order ini
                  </p>
                )}
              </div>

              {/* Status Icon */}
              <div>
                {approver.status === 'APPROVED' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Disetujui
                    </span>
                  </div>
                ) : approver.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Menunggu
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
