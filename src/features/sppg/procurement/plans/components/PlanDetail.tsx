/**
 * @fileoverview Plan Detail Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Complete plan information display
 * - Budget breakdown visualization
 * - Status and approval information
 * - Target metrics display
 * - Related orders/receipts list
 * - Action buttons integration
 * - Loading states
 * - Dark mode support
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  Calendar,
  Users,
  UtensilsCrossed,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPlanPeriod,
  formatPlanQuarter,
  getPlanStatusLabel,
  getPlanStatusColor,
  getPlanStatusIcon,
} from '../utils'
import type { PlanWithRelations, PlanApprovalStatus } from '../types'

// ================================ TYPES ================================

interface PlanDetailProps {
  plan: PlanWithRelations | null
  isLoading?: boolean
  className?: string
}

interface InfoItemProps {
  label: string
  value: string | number | React.ReactNode
  icon?: React.ElementType
  className?: string
}

// ================================ SUB-COMPONENTS ================================

/**
 * Info Item Component
 * Display label-value pair with optional icon
 */
function InfoItem({ label, value, icon: Icon, className }: InfoItemProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-base font-semibold text-foreground">{value}</div>
    </div>
  )
}

/**
 * Budget Category Item Component
 * Display individual budget category allocation
 */
function BudgetCategoryItem({
  label,
  amount,
  percentage,
  color,
}: {
  label: string
  amount: number
  percentage: number
  color: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="text-right">
          <div className="text-sm font-semibold text-foreground">
            {formatCurrency(amount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatPercentage(percentage)}
          </div>
        </div>
      </div>
      <Progress value={percentage} className={cn('h-2', color)} />
    </div>
  )
}

// ================================ MAIN COMPONENT ================================

/**
 * Plan Detail Component
 * Displays comprehensive plan information with all details
 * 
 * @example
 * <PlanDetail
 *   plan={planData}
 *   isLoading={isLoading}
 * />
 */
export function PlanDetail({ plan, isLoading = false, className }: PlanDetailProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header Skeleton */}
        <Card>
          <CardHeader>
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardHeader>
        </Card>

        {/* Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // No plan data
  if (!plan) {
    return (
      <div className={cn('rounded-md border border-border p-8', className)}>
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Data Tidak Ditemukan
          </h3>
          <p className="text-sm text-muted-foreground">
            Rencana pengadaan tidak dapat ditemukan atau telah dihapus
          </p>
        </div>
      </div>
    )
  }

  // Calculate metrics
  const budgetUsagePercent =
    plan.totalBudget > 0 ? (plan.usedBudget / plan.totalBudget) * 100 : 0
  
  const allocatedPercent =
    plan.totalBudget > 0 ? (plan.allocatedBudget / plan.totalBudget) * 100 : 0

  const costPerMeal =
    plan.targetMeals > 0 ? plan.totalBudget / plan.targetMeals : 0

  // Budget categories
  const budgetCategories = [
    {
      label: 'Protein',
      amount: plan.proteinBudget || 0,
      percentage: plan.totalBudget > 0 ? ((plan.proteinBudget || 0) / plan.totalBudget) * 100 : 0,
      color: '[&>div]:bg-blue-600',
    },
    {
      label: 'Karbohidrat',
      amount: plan.carbBudget || 0,
      percentage: plan.totalBudget > 0 ? ((plan.carbBudget || 0) / plan.totalBudget) * 100 : 0,
      color: '[&>div]:bg-green-600',
    },
    {
      label: 'Sayuran',
      amount: plan.vegetableBudget || 0,
      percentage: plan.totalBudget > 0 ? ((plan.vegetableBudget || 0) / plan.totalBudget) * 100 : 0,
      color: '[&>div]:bg-emerald-600',
    },
    {
      label: 'Buah',
      amount: plan.fruitBudget || 0,
      percentage: plan.totalBudget > 0 ? ((plan.fruitBudget || 0) / plan.totalBudget) * 100 : 0,
      color: '[&>div]:bg-orange-600',
    },
    {
      label: 'Lainnya',
      amount: plan.otherBudget || 0,
      percentage: plan.totalBudget > 0 ? ((plan.otherBudget || 0) / plan.totalBudget) * 100 : 0,
      color: '[&>div]:bg-gray-600',
    },
  ]

  // Status information
  const statusLabel = getPlanStatusLabel(plan.approvalStatus as PlanApprovalStatus)
  const statusColor = getPlanStatusColor(plan.approvalStatus as PlanApprovalStatus)
  const StatusIcon = getPlanStatusIcon(plan.approvalStatus as PlanApprovalStatus)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">
                  {plan.planName}
                </h2>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-sm',
                    statusColor === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    statusColor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    statusColor === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    statusColor === 'gray' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatPlanPeriod(plan.planMonth, plan.planYear)}
                  {plan.planQuarter && (
                    <> • {formatPlanQuarter(plan.planQuarter)}</>
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        {plan.notes && (
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-foreground">{plan.notes}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <InfoItem
              label="Total Anggaran"
              value={formatCurrency(plan.totalBudget)}
              icon={DollarSign}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <InfoItem
              label="Target Penerima"
              value={formatNumber(plan.targetRecipients)}
              icon={Users}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <InfoItem
              label="Target Makanan"
              value={formatNumber(plan.targetMeals)}
              icon={UtensilsCrossed}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <InfoItem
              label="Biaya per Porsi"
              value={formatCurrency(costPerMeal)}
              icon={TrendingUp}
            />
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget Overview */}
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
                  {formatCurrency(plan.totalBudget)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Allocated Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Anggaran Dialokasikan
                </span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">
                    {formatCurrency(plan.allocatedBudget)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPercentage(allocatedPercent)}
                  </div>
                </div>
              </div>
              <Progress
                value={allocatedPercent}
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
                    {formatCurrency(plan.usedBudget)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPercentage(budgetUsagePercent)}
                  </div>
                </div>
              </div>
              <Progress
                value={budgetUsagePercent}
                className={cn(
                  'h-2',
                  budgetUsagePercent < 70 && '[&>div]:bg-green-600',
                  budgetUsagePercent >= 70 &&
                    budgetUsagePercent < 90 &&
                    '[&>div]:bg-yellow-600',
                  budgetUsagePercent >= 90 && '[&>div]:bg-red-600'
                )}
              />
            </div>

            <Separator />

            {/* Remaining Budget */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Sisa Anggaran
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(plan.remainingBudget)}
                </span>
              </div>
            </div>

            {/* Budget Status Alert */}
            {budgetUsagePercent >= 90 && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive mt-0.5" />
                <div className="text-sm text-destructive">
                  <strong>Perhatian:</strong> Penggunaan anggaran sudah mencapai{' '}
                  {formatPercentage(budgetUsagePercent)}. Segera evaluasi pengeluaran.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Allocation by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Alokasi Anggaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetCategories.map((category) => (
              <BudgetCategoryItem
                key={category.label}
                label={category.label}
                amount={category.amount}
                percentage={category.percentage}
                color={category.color}
              />
            ))}
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span className="text-sm font-semibold text-foreground">
                Total Dialokasikan
              </span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(plan.allocatedBudget)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Program Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              label="Program Gizi"
              value={plan.program?.name || 'N/A'}
              icon={Package}
            />
            <Separator />
            <InfoItem
              label="Periode"
              value={`${formatPlanPeriod(plan.planMonth, plan.planYear)}${
                plan.planQuarter ? ` • ${formatPlanQuarter(plan.planQuarter)}` : ''
              }`}
              icon={Calendar}
            />
            <Separator />
            <InfoItem
              label="Status Persetujuan"
              value={
                <Badge
                  variant="secondary"
                  className={cn(
                    statusColor === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    statusColor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    statusColor === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    statusColor === 'gray' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusLabel}
                </Badge>
              }
              icon={plan.approvalStatus === 'APPROVED' ? CheckCircle2 : Clock}
            />
          </CardContent>
        </Card>

        {/* Target & Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Target & Metrik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              label="Jumlah Penerima"
              value={`${formatNumber(plan.targetRecipients)} orang`}
              icon={Users}
            />
            <Separator />
            <InfoItem
              label="Jumlah Makanan"
              value={`${formatNumber(plan.targetMeals)} porsi`}
              icon={UtensilsCrossed}
            />
            <Separator />
            <InfoItem
              label="Estimasi Biaya per Porsi"
              value={formatCurrency(costPerMeal)}
              icon={DollarSign}
            />
            <Separator />
            <InfoItem
              label="Rata-rata Porsi per Penerima"
              value={
                plan.targetRecipients > 0
                  ? `${(plan.targetMeals / plan.targetRecipients).toFixed(1)} porsi`
                  : 'N/A'
              }
              icon={TrendingUp}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
