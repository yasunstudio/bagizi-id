/**
 * @fileoverview Plan Statistics Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Overview statistics cards
 * - Status breakdown visualization
 * - Budget utilization metrics
 * - Target recipients/meals summary
 * - Loading states with skeleton
 * - Dark mode support
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  DollarSign,
  Users,
  UtensilsCrossed,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getPlanStatusLabel,
  getPlanStatusColor,
} from '../utils'

// ================================ TYPES ================================

/**
 * Simplified stats data for component display
 */
interface PlanStatsData {
  totalPlans: number
  totalBudget: number
  allocatedBudget: number
  usedBudget: number
  remainingBudget: number
  targetRecipients: number
  targetMeals: number
  byStatus: {
    draft: number
    submitted: number
    underReview: number
    approved: number
    rejected: number
    cancelled: number
  }
}

interface PlanStatsProps {
  stats: PlanStatsData | null
  isLoading?: boolean
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

// ================================ SUB-COMPONENTS ================================

/**
 * Stat Card Component
 * Individual statistics card with icon and optional trend
 */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 dark:border-green-800/30',
    warning: 'border-yellow-200 dark:border-yellow-800/30',
    danger: 'border-red-200 dark:border-red-800/30',
  }

  const iconStyles = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  }

  return (
    <Card className={cn('border-2', variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp
                  className={cn(
                    'h-3 w-3',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                />
                <span
                  className={cn(
                    'font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'rounded-full p-3',
              variant === 'success' && 'bg-green-100 dark:bg-green-900/30',
              variant === 'warning' && 'bg-yellow-100 dark:bg-yellow-900/30',
              variant === 'danger' && 'bg-red-100 dark:bg-red-900/30',
              variant === 'default' && 'bg-muted'
            )}
          >
            <Icon className={cn('h-5 w-5', iconStyles[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Status Breakdown Component
 * Visual breakdown of plans by approval status
 */
function StatusBreakdown({ stats }: { stats: PlanStatsData }) {
  const statusItems = [
    {
      status: 'DRAFT' as const,
      count: stats.byStatus.draft,
      icon: FileText,
    },
    {
      status: 'SUBMITTED' as const,
      count: stats.byStatus.submitted,
      icon: Clock,
    },
    {
      status: 'APPROVED' as const,
      count: stats.byStatus.approved,
      icon: CheckCircle2,
    },
    {
      status: 'REJECTED' as const,
      count: stats.byStatus.rejected,
      icon: XCircle,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Rencana</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusItems.map(({ status, count, icon: Icon }) => {
          const percentage = stats.totalPlans > 0 ? (count / stats.totalPlans) * 100 : 0
          const statusLabel = getPlanStatusLabel(status)
          const statusColor = getPlanStatusColor(status)

          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {statusLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {count}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      statusColor === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      statusColor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                      statusColor === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {formatPercentage(percentage)}
                  </Badge>
                </div>
              </div>
              <Progress
                value={percentage}
                className={cn(
                  'h-2',
                  statusColor === 'green' && '[&>div]:bg-green-600',
                  statusColor === 'blue' && '[&>div]:bg-blue-600',
                  statusColor === 'yellow' && '[&>div]:bg-yellow-600',
                  statusColor === 'red' && '[&>div]:bg-red-600'
                )}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

/**
 * Budget Overview Component
 * Budget allocation and utilization metrics
 */
function BudgetOverview({ stats }: { stats: PlanStatsData }) {
  const budgetUsagePercentage =
    stats.totalBudget > 0 ? (stats.usedBudget / stats.totalBudget) * 100 : 0
  
  const allocatedPercentage =
    stats.totalBudget > 0 ? (stats.allocatedBudget / stats.totalBudget) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Anggaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Anggaran</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(stats.totalBudget)}
            </span>
          </div>
        </div>

        {/* Allocated Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Anggaran Dialokasikan
            </span>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(stats.allocatedBudget)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(allocatedPercentage)} dari total
              </div>
            </div>
          </div>
          <Progress
            value={allocatedPercentage}
            className="h-2 [&>div]:bg-blue-600"
          />
        </div>

        {/* Used Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Anggaran Terpakai
            </span>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(stats.usedBudget)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(budgetUsagePercentage)} dari total
              </div>
            </div>
          </div>
          <Progress
            value={budgetUsagePercentage}
            className={cn(
              'h-2',
              budgetUsagePercentage < 70 && '[&>div]:bg-green-600',
              budgetUsagePercentage >= 70 &&
                budgetUsagePercentage < 90 &&
                '[&>div]:bg-yellow-600',
              budgetUsagePercentage >= 90 && '[&>div]:bg-red-600'
            )}
          />
        </div>

        {/* Remaining Budget */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Sisa Anggaran
            </span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.remainingBudget)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ================================ MAIN COMPONENT ================================

/**
 * Plan Statistics Component
 * Displays comprehensive statistics for procurement plans
 * 
 * @example
 * <PlanStats
 *   stats={statsData}
 *   isLoading={isLoading}
 * />
 */
export function PlanStats({ stats, isLoading = false, className }: PlanStatsProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Overview Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // No stats
  if (!stats) {
    return (
      <div className={cn('rounded-md border border-border p-8', className)}>
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Belum Ada Data Statistik
          </h3>
          <p className="text-sm text-muted-foreground">
            Statistik akan muncul setelah rencana pengadaan dibuat
          </p>
        </div>
      </div>
    )
  }

  // Calculate average cost per meal
  const avgCostPerMeal =
    stats.targetMeals > 0 ? stats.totalBudget / stats.targetMeals : 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Rencana"
          value={stats.totalPlans}
          subtitle={`${stats.byStatus.approved} disetujui`}
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="Total Anggaran"
          value={formatCurrency(stats.totalBudget)}
          subtitle={`${formatPercentage(
            stats.totalBudget > 0 ? (stats.usedBudget / stats.totalBudget) * 100 : 0
          )} terpakai`}
          icon={DollarSign}
          variant="default"
        />
        <StatCard
          title="Target Penerima"
          value={formatNumber(stats.targetRecipients)}
          subtitle="total penerima"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Target Makanan"
          value={formatNumber(stats.targetMeals)}
          subtitle={`~${formatCurrency(avgCostPerMeal)}/porsi`}
          icon={UtensilsCrossed}
          variant="default"
        />
      </div>

      {/* Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatusBreakdown stats={stats} />
        <BudgetOverview stats={stats} />
      </div>
    </div>
  )
}
