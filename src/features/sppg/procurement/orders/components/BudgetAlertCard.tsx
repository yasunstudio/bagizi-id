/**
 * @fileoverview Budget Alert Card Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * 
 * Real-time budget utilization warnings and category limits
 */

'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, XCircle, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

interface CategoryBudget {
  category: string
  totalBudget: number
  usedBudget: number
  remainingBudget: number
  utilizationPercent: number
}

interface BudgetAlertCardProps {
  /** Current order amount */
  orderAmount: number
  /** Category budgets */
  categoryBudgets?: CategoryBudget[]
  /** Warning threshold percentage */
  warningThreshold?: number
  /** Danger threshold percentage */
  dangerThreshold?: number
  /** Show as compact alert */
  compact?: boolean
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

export function BudgetAlertCard({
  orderAmount,
  categoryBudgets = [],
  warningThreshold = 80,
  dangerThreshold = 100,
  compact = false,
  className,
}: BudgetAlertCardProps) {
  // Calculate overall budget status
  const totalBudget = categoryBudgets.reduce((sum, cat) => sum + cat.totalBudget, 0)
  const totalUsed = categoryBudgets.reduce((sum, cat) => sum + cat.usedBudget, 0)
  const totalAfterOrder = totalUsed + orderAmount
  const overallUtilization = totalBudget > 0 ? (totalAfterOrder / totalBudget) * 100 : 0

  // Check for budget violations
  const categoriesOverBudget = categoryBudgets.filter(
    (cat) => cat.utilizationPercent >= dangerThreshold
  )
  const categoriesNearLimit = categoryBudgets.filter(
    (cat) => cat.utilizationPercent >= warningThreshold && cat.utilizationPercent < dangerThreshold
  )

  const isOverBudget = overallUtilization >= dangerThreshold
  const isNearLimit = overallUtilization >= warningThreshold && !isOverBudget
  const isHealthy = overallUtilization < warningThreshold

  if (compact) {
    // Compact alert view
    if (isOverBudget) {
      return (
        <Alert variant="destructive" className={className}>
          <XCircle className="h-4 w-4" />
          <AlertTitle>Melebihi Budget!</AlertTitle>
          <AlertDescription>
            Order ini akan melebihi budget yang tersedia (
            {Math.round(overallUtilization)}% dari total budget)
          </AlertDescription>
        </Alert>
      )
    }

    if (isNearLimit) {
      return (
        <Alert className={cn('border-amber-500 bg-amber-50 dark:bg-amber-950', className)}>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Mendekati Batas Budget</AlertTitle>
          <AlertDescription>
            Penggunaan budget: {Math.round(overallUtilization)}% dari total budget
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  // Full card view
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Tracking
            </CardTitle>
            <CardDescription>
              Monitor penggunaan budget per kategori
            </CardDescription>
          </div>

          {/* Overall Status Badge */}
          <Badge
            variant={isOverBudget ? 'destructive' : isNearLimit ? 'secondary' : 'default'}
            className={cn(
              isNearLimit &&
                'border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            )}
          >
            {isOverBudget && <XCircle className="mr-1 h-3 w-3" />}
            {isNearLimit && <AlertTriangle className="mr-1 h-3 w-3" />}
            {isHealthy && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {Math.round(overallUtilization)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Budget Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Budget</span>
            <span className="font-semibold">{formatCurrency(totalBudget)}</span>
          </div>
          <Progress
            value={overallUtilization}
            className={cn(
              'h-2',
              isOverBudget && '[&>div]:bg-destructive',
              isNearLimit && '[&>div]:bg-amber-500'
            )}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Terpakai: {formatCurrency(totalUsed)}</span>
            <span>
              Sisa: {formatCurrency(totalBudget - totalUsed)}
            </span>
          </div>
        </div>

        {/* Order Impact */}
        {orderAmount > 0 && (
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-medium">Dampak Order Ini:</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nilai Order:</span>
              <span className="font-semibold">{formatCurrency(orderAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Setelah Order:</span>
              <span
                className={cn(
                  'font-semibold',
                  isOverBudget && 'text-destructive',
                  isNearLimit && 'text-amber-600'
                )}
              >
                {formatCurrency(totalAfterOrder)} ({Math.round(overallUtilization)}%)
              </span>
            </div>
          </div>
        )}

        {/* Category Budget Status */}
        {categoryBudgets.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Budget per Kategori:</p>
            {categoryBudgets.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <Badge
                    variant={
                      cat.utilizationPercent >= dangerThreshold
                        ? 'destructive'
                        : cat.utilizationPercent >= warningThreshold
                        ? 'secondary'
                        : 'outline'
                    }
                    className={cn(
                      'text-xs',
                      cat.utilizationPercent >= warningThreshold &&
                        cat.utilizationPercent < dangerThreshold &&
                        'border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    )}
                  >
                    {Math.round(cat.utilizationPercent)}%
                  </Badge>
                </div>
                <Progress
                  value={cat.utilizationPercent}
                  className={cn(
                    'h-1.5',
                    cat.utilizationPercent >= dangerThreshold && '[&>div]:bg-destructive',
                    cat.utilizationPercent >= warningThreshold &&
                      cat.utilizationPercent < dangerThreshold &&
                      '[&>div]:bg-amber-500'
                  )}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(cat.usedBudget)}</span>
                  <span>{formatCurrency(cat.totalBudget)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {categoriesOverBudget.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Budget Kategori Terlampaui!</AlertTitle>
            <AlertDescription>
              {categoriesOverBudget.length} kategori melebihi budget:{' '}
              <strong>{categoriesOverBudget.map((c) => c.category).join(', ')}</strong>
            </AlertDescription>
          </Alert>
        )}

        {categoriesNearLimit.length > 0 && !isOverBudget && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Mendekati Batas Budget</AlertTitle>
            <AlertDescription>
              {categoriesNearLimit.length} kategori mendekati batas:{' '}
              <strong>{categoriesNearLimit.map((c) => c.category).join(', ')}</strong>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
