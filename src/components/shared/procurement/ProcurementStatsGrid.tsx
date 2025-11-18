/**
 * @fileoverview Procurement Statistics Cards Component
 * Reusable statistics display for consistent procurement metrics
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardData {
  /**
   * Statistic label
   */
  label: string
  
  /**
   * Main value to display
   */
  value: string | number
  
  /**
   * Optional description or subtitle
   */
  description?: string
  
  /**
   * Icon component
   */
  icon: LucideIcon
  
  /**
   * Icon color variant
   */
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'default'
  
  /**
   * Optional trend indicator
   */
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  
  /**
   * Optional click handler
   */
  onClick?: () => void
}

interface ProcurementStatsGridProps {
  /**
   * Array of statistics to display
   */
  stats: StatCardData[]
  
  /**
   * Grid columns (responsive)
   */
  columns?: 2 | 3 | 4
}

/**
 * Standardized statistics grid for procurement pages
 * Displays metric cards in a responsive grid layout
 * 
 * @example
 * ```tsx
 * <ProcurementStatsGrid
 *   stats={[
 *     {
 *       label: 'Total Orders',
 *       value: 156,
 *       icon: ShoppingCart,
 *       iconColor: 'primary',
 *       trend: { value: 12, direction: 'up', label: 'dari bulan lalu' }
 *     }
 *   ]}
 *   columns={4}
 * />
 * ```
 */
export function ProcurementStatsGrid({ stats, columns = 4 }: ProcurementStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}

/**
 * Individual statistic card component
 */
function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconColor = 'default',
  trend,
  onClick,
}: StatCardData) {
  const iconColors = {
    primary: 'text-primary',
    success: 'text-green-600 dark:text-green-500',
    warning: 'text-amber-600 dark:text-amber-500',
    danger: 'text-red-600 dark:text-red-500',
    default: 'text-muted-foreground',
  }

  const trendColors = {
    up: 'text-green-600 dark:text-green-500',
    down: 'text-red-600 dark:text-red-500',
    neutral: 'text-muted-foreground',
  }

  const TrendIcon = trend?.direction === 'up' 
    ? TrendingUp 
    : trend?.direction === 'down' 
    ? TrendingDown 
    : Minus

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg dark:hover:shadow-primary/5'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={cn('h-5 w-5', iconColors[iconColor])} />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trendColors[trend.direction])}>
              <TrendIcon className="h-3 w-3" />
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
