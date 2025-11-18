/**
 * @fileoverview Plan Card Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Display plan summary in card format
 * - Status badge with color coding
 * - Budget utilization progress bar
 * - Quick actions menu
 * - Dark mode support
 * - Responsive design
 */

'use client'

import { MoreHorizontal, Eye, Edit, Trash2, Send, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  getPlanStatusLabel,
  getPlanStatusColor,
  formatPlanPeriod,
  formatPlanQuarter,
  formatCurrency,
  formatNumber,
} from '../utils'
import type { PlanApprovalStatus } from '../types'

// ================================ TYPES ================================

interface PlanCardProps {
  plan: {
    id: string
    planName: string
    planMonth: string
    planYear: number
    planQuarter: number | null
    approvalStatus: string
    totalBudget: number
    allocatedBudget: number
    usedBudget: number
    remainingBudget: number
    targetRecipients: number
    targetMeals: number
  }
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onSubmit?: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  variant?: 'default' | 'compact'
  showActions?: boolean
  className?: string
}

// ================================ COMPONENT ================================

/**
 * Plan Card Component
 * Displays plan information in a card format with actions
 * 
 * @example
 * <PlanCard
 *   plan={planData}
 *   onView={(id) => router.push(`/procurement/plans/${id}`)}
 *   onEdit={(id) => router.push(`/procurement/plans/${id}/edit`)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */
export function PlanCard({
  plan,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  variant = 'default',
  showActions = true,
  className,
}: PlanCardProps) {
  // Calculate budget usage percentage
  const budgetUsagePercent = plan.totalBudget > 0 
    ? Math.round((plan.usedBudget / plan.totalBudget) * 100)
    : 0

  // Calculate allocation percentage
  const allocationPercent = plan.totalBudget > 0
    ? Math.round((plan.allocatedBudget / plan.totalBudget) * 100)
    : 0

  // Get status info
  const statusLabel = getPlanStatusLabel(plan.approvalStatus as PlanApprovalStatus)
  const statusColor = getPlanStatusColor(plan.approvalStatus as PlanApprovalStatus)

  // Determine budget status color
  const getBudgetStatusColor = () => {
    if (budgetUsagePercent >= 90) return 'text-red-600 dark:text-red-400'
    if (budgetUsagePercent >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  // Check permissions for actions
  const canEdit = plan.approvalStatus === 'DRAFT'
  const canDelete = plan.approvalStatus === 'DRAFT'
  const canSubmit = plan.approvalStatus === 'DRAFT'
  const canApprove = ['SUBMITTED', 'UNDER_REVIEW'].includes(plan.approvalStatus)
  const canReject = ['SUBMITTED', 'UNDER_REVIEW'].includes(plan.approvalStatus)

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-lg dark:hover:shadow-primary/5',
        variant === 'compact' && 'p-4',
        className
      )}
    >
      {/* Header */}
      <CardHeader className={cn('pb-3', variant === 'compact' && 'p-4 pb-2')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className={cn(
              'font-semibold text-foreground line-clamp-2',
              variant === 'compact' ? 'text-base' : 'text-lg'
            )}>
              {plan.planName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatPlanPeriod(plan.planMonth, plan.planYear)}</span>
              {plan.planQuarter && (
                <>
                  <span>•</span>
                  <span>{formatPlanQuarter(plan.planQuarter)}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn(
              'shrink-0',
              statusColor === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              statusColor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
              statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              statusColor === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              statusColor === 'gray' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            )}>
              {statusLabel}
            </Badge>

            {/* Actions Menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(plan.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </DropdownMenuItem>
                  )}
                  
                  {canEdit && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(plan.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  
                  {canSubmit && onSubmit && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onSubmit(plan.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Ajukan untuk Ditinjau
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {canApprove && onApprove && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onApprove(plan.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Setujui
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {canReject && onReject && (
                    <DropdownMenuItem onClick={() => onReject(plan.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak
                    </DropdownMenuItem>
                  )}
                  
                  {canDelete && onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(plan.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className={cn('space-y-4', variant === 'compact' && 'px-4 py-2')}>
        {/* Budget Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Anggaran</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(plan.totalBudget)}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Terpakai</span>
              <span className={cn('font-medium', getBudgetStatusColor())}>
                {formatCurrency(plan.usedBudget)} ({budgetUsagePercent}%)
              </span>
            </div>
            <Progress value={budgetUsagePercent} className="h-2" />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Penerima Target</div>
            <div className="text-lg font-semibold text-foreground">
              {formatNumber(plan.targetRecipients)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Target Makanan</div>
            <div className="text-lg font-semibold text-foreground">
              {formatNumber(plan.targetMeals)}
            </div>
          </div>
        </div>

        {/* Budget Details */}
        {variant !== 'compact' && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-sm">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Dialokasikan</div>
              <div className="font-medium text-foreground">
                {formatCurrency(plan.allocatedBudget)}
              </div>
              <div className="text-xs text-muted-foreground">
                {allocationPercent}% dari total
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Tersisa</div>
              <div className="font-medium text-foreground">
                {formatCurrency(plan.remainingBudget)}
              </div>
              <div className="text-xs text-muted-foreground">
                {100 - budgetUsagePercent}% dari total
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      {variant !== 'compact' && onView && (
        <CardFooter className="pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onView(plan.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail Lengkap
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
