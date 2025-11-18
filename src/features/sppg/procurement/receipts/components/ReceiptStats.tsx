/**
 * @fileoverview Receipt Statistics Cards Component
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  PackageCheck, 
  PackageSearch, 
  CheckCircle2, 
  XCircle, 
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useReceiptStats } from '../hooks'
import { formatCurrency, getQualityGradeLabel } from '../lib'
import { cn } from '@/lib/utils'

// ================================ COMPONENT ================================

export function ReceiptStats() {
  const { data: stats, isLoading, error } = useReceiptStats()

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-2 py-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">Gagal memuat statistik</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const passRate = stats.totalReceipts > 0
    ? Math.round((stats.qualityPassed / stats.totalReceipts) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Total Receipts */}
      <StatCard
        title="Total Penerimaan"
        value={stats.totalReceipts}
        icon={Package}
        variant="default"
      />

      {/* Pending Inspection */}
      <StatCard
        title="Menunggu QC"
        value={stats.pendingInspection}
        icon={PackageSearch}
        variant={stats.pendingInspection > 0 ? 'warning' : 'default'}
        badge={stats.pendingInspection > 5 ? 'Perlu Perhatian' : undefined}
      />

      {/* Quality Passed */}
      <StatCard
        title="Lolos QC"
        value={stats.qualityPassed}
        icon={CheckCircle2}
        variant="success"
        subtitle={`${passRate}% dari total`}
      />

      {/* Quality Failed */}
      <StatCard
        title="Gagal QC"
        value={stats.qualityFailed}
        icon={XCircle}
        variant={stats.qualityFailed > 0 ? 'destructive' : 'default'}
      />

      {/* Partial Receipts */}
      <StatCard
        title="Penerimaan Parsial"
        value={stats.partialReceipts}
        icon={PackageCheck}
        variant="secondary"
      />

      {/* Total Value */}
      <StatCard
        title="Total Nilai"
        value={formatCurrency(stats.totalValue)}
        icon={TrendingUp}
        variant="default"
        subtitle={stats.averageQualityGrade ? 
          `Grade: ${getQualityGradeLabel(stats.averageQualityGrade)}` : 
          undefined
        }
      />
    </div>
  )
}

// ================================ STAT CARD COMPONENT ================================

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
  subtitle?: string
  badge?: string
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  subtitle,
  badge
}: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-500/50 bg-green-500/5',
    warning: 'border-yellow-500/50 bg-yellow-500/5',
    destructive: 'border-red-500/50 bg-red-500/5',
    secondary: 'border-blue-500/50 bg-blue-500/5'
  }

  const iconStyles = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    destructive: 'text-red-600 dark:text-red-400',
    secondary: 'text-blue-600 dark:text-blue-400'
  }

  return (
    <Card className={cn(variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {badge && (
          <Badge variant="outline" className="mt-2">
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
