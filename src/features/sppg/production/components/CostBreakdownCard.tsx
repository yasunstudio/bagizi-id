/**
 * @fileoverview Cost Breakdown Card Component  
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Display component for cost breakdown comparison (estimated vs actual)
 * 
 * Features:
 * - Side-by-side comparison of estimated vs actual costs
 * - Breakdown by category: Ingredient, Labor, Utility, Transport, Other
 * - Per-meal cost calculation  
 * - Variance indicators (over/under budget)
 * - Visual progress bars for cost categories
 * - Dark mode support
 * 
 * @example
 * ```tsx
 * <CostBreakdownCard
 *   title="Production Cost Breakdown"
 *   estimatedCost={{
 *     ingredientCost: 500000,
 *     laborCost: 200000,
 *     utilityCost: 100000,
 *     totalCost: 800000,
 *     costPerMeal: 1600
 *   }}
 *   actualCost={{
 *     ingredientCost: 520000,
 *     laborCost: 200000,
 *     utilityCost: 95000,
 *     totalCost: 815000,
 *     costPerMeal: 1630
 *   }}
 *   portions={500}
 * />
 * ```
 */

'use client'

import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// ================================ TYPES ================================

/**
 * Cost breakdown structure
 */
interface CostBreakdown {
  /** Cost of ingredients/raw materials */
  ingredientCost: number
  
  /** Labor cost */
  laborCost: number
  
  /** Utility cost (gas, electricity, water, etc.) */
  utilityCost: number
  
  /** Transport cost (for distribution) */
  transportCost?: number
  
  /** Fuel cost (for distribution) */
  fuelCost?: number
  
  /** Packaging cost (for distribution) */
  packagingCost?: number
  
  /** Other miscellaneous costs */
  otherCosts: number
  
  /** Total cost (sum of all) */
  totalCost: number
  
  /** Cost per meal/portion */
  costPerMeal: number
}

interface CostBreakdownCardProps {
  /** Card title */
  title?: string
  
  /** Card description */
  description?: string
  
  /** Estimated/planned cost breakdown */
  estimatedCost: CostBreakdown
  
  /** Actual cost breakdown (optional, for comparison) */
  actualCost?: CostBreakdown
  
  /** Number of portions for context */
  portions: number
  
  /** Custom className */
  className?: string
  
  /** Show detailed breakdown */
  showDetails?: boolean
}

// ================================ HELPER FUNCTIONS ================================

/**
 * Calculate variance percentage
 */
function calculateVariance(estimated: number, actual: number): number {
  if (estimated === 0) return 0
  return ((actual - estimated) / estimated) * 100
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get variance badge variant based on percentage
 */
function getVarianceBadgeVariant(variance: number): 'default' | 'secondary' | 'destructive' {
  if (Math.abs(variance) < 5) return 'secondary' // Within 5%
  if (variance > 0) return 'destructive' // Over budget
  return 'default' // Under budget
}

// ================================ COMPONENT ================================

export function CostBreakdownCard({
  title = 'Rincian Biaya',
  description,
  estimatedCost,
  actualCost,
  portions,
  className,
  showDetails = true,
}: CostBreakdownCardProps) {
  const hasActual = !!actualCost
  const totalVariance = hasActual 
    ? calculateVariance(estimatedCost.totalCost, actualCost.totalCost)
    : 0

  // Cost categories for iteration
  const costCategories = [
    { key: 'ingredientCost', label: 'Bahan Baku', icon: '🥘' },
    { key: 'laborCost', label: 'Tenaga Kerja', icon: '👨‍🍳' },
    { key: 'utilityCost', label: 'Utilitas', icon: '⚡' },
    ...(estimatedCost.transportCost !== undefined || actualCost?.transportCost !== undefined
      ? [{ key: 'transportCost', label: 'Transport', icon: '🚚' }]
      : []),
    ...(estimatedCost.fuelCost !== undefined || actualCost?.fuelCost !== undefined
      ? [{ key: 'fuelCost', label: 'Bahan Bakar', icon: '⛽' }]
      : []),
    ...(estimatedCost.packagingCost !== undefined || actualCost?.packagingCost !== undefined
      ? [{ key: 'packagingCost', label: 'Kemasan', icon: '📦' }]
      : []),
    { key: 'otherCosts', label: 'Lain-lain', icon: '📋' },
  ]

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {hasActual && (
            <Badge variant={getVarianceBadgeVariant(totalVariance)} className="text-sm">
              {totalVariance > 0 && <TrendingUp className="mr-1 h-3 w-3" />}
              {totalVariance < 0 && <TrendingDown className="mr-1 h-3 w-3" />}
              {totalVariance === 0 && <Minus className="mr-1 h-3 w-3" />}
              {totalVariance > 0 ? '+' : ''}
              {totalVariance.toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Cost */}
          <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Biaya</div>
            <div className="text-2xl font-bold">
              {formatCurrency(hasActual ? actualCost.totalCost : estimatedCost.totalCost)}
            </div>
            {hasActual && (
              <div className="text-xs text-muted-foreground mt-1">
                Estimasi: {formatCurrency(estimatedCost.totalCost)}
              </div>
            )}
          </div>

          {/* Cost Per Meal */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-sm text-muted-foreground mb-1">Biaya per Porsi</div>
            <div className="text-2xl font-bold">
              {formatCurrency(hasActual ? actualCost.costPerMeal : estimatedCost.costPerMeal)}
            </div>
            {hasActual && (
              <div className="text-xs text-muted-foreground mt-1">
                Estimasi: {formatCurrency(estimatedCost.costPerMeal)}
              </div>
            )}
          </div>

          {/* Portions */}
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-sm text-muted-foreground mb-1">Jumlah Porsi</div>
            <div className="text-2xl font-bold">{portions.toLocaleString('id-ID')}</div>
            <div className="text-xs text-muted-foreground mt-1">porsi</div>
          </div>
        </div>

        {showDetails && (
          <>
            <Separator />

            {/* Detailed Breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-4">Rincian per Kategori</h4>
              <div className="space-y-4">
                {costCategories.map(({ key, label, icon }) => {
                  const estimatedAmount = estimatedCost[key as keyof CostBreakdown] as number || 0
                  const actualAmount = hasActual ? (actualCost[key as keyof CostBreakdown] as number || 0) : estimatedAmount
                  const variance = hasActual ? calculateVariance(estimatedAmount, actualAmount) : 0
                  const maxAmount = Math.max(estimatedAmount, actualAmount)
                  const progressPercentage = maxAmount > 0 ? (actualAmount / maxAmount) * 100 : 0

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium flex items-center gap-2">
                          <span>{icon}</span>
                          {label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatCurrency(actualAmount)}
                          </span>
                          {hasActual && variance !== 0 && (
                            <Badge
                              variant={getVarianceBadgeVariant(variance)}
                              className="text-xs px-1.5 py-0"
                            >
                              {variance > 0 ? '+' : ''}
                              {variance.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      {hasActual && (
                        <>
                          <Progress
                            value={progressPercentage}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Estimasi: {formatCurrency(estimatedAmount)}</span>
                            <span>
                              {actualAmount > estimatedAmount ? 'Lebih' : 'Kurang'}{' '}
                              {formatCurrency(Math.abs(actualAmount - estimatedAmount))}
                            </span>
                          </div>
                        </>
                      )}
                      {!hasActual && estimatedAmount > 0 && (
                        <Progress
                          value={100}
                          className="h-2"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Total Summary */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Keseluruhan</span>
                <span className="text-xl font-bold">
                  {formatCurrency(hasActual ? actualCost.totalCost : estimatedCost.totalCost)}
                </span>
              </div>
              {hasActual && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Estimasi: {formatCurrency(estimatedCost.totalCost)}</span>
                  <span className={cn(
                    'font-medium',
                    totalVariance > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'
                  )}>
                    {totalVariance > 0 ? 'Lebih' : 'Kurang'}{' '}
                    {formatCurrency(Math.abs(actualCost.totalCost - estimatedCost.totalCost))}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
