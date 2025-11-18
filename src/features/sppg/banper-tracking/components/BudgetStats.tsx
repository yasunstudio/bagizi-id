/**
 * @fileoverview Budget Statistics Dashboard Component
 * @version Next.js 15.5.4 / shadcn/ui with Dark Mode
 * @author Bagizi-ID Development Team
 * 
 * Dashboard cards menampilkan statistik anggaran pemerintah:
 * - Total alokasi anggaran
 * - Total penggunaan anggaran
 * - Sisa anggaran
 * - Total pending disbursement
 * - Statistik per sumber anggaran (APBN, APBD, dll)
 */

'use client'

import { useMemo } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useBudgetAllocations, useBanperTrackings } from '../hooks'

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate percentage with safety check
 */
function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: typeof Wallet
  trend?: {
    value: number
    isPositive: boolean
  }
  progress?: {
    value: number
    max: number
  }
  badge?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

function StatCard({ title, value, subtitle, icon: Icon, trend, progress, badge }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            trend.isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}

        {progress && (
          <div className="mt-3 space-y-1">
            <Progress value={calculatePercentage(progress.value, progress.max)} />
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(progress.value, progress.max)}% terpakai
            </p>
          </div>
        )}

        {badge && (
          <Badge 
            variant={badge.variant} 
            className="mt-2"
          >
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export function BudgetStats() {
  const { data: allocations, isLoading: allocationsLoading } = useBudgetAllocations()
  const { data: banperRequests, isLoading: banperLoading } = useBanperTrackings()

  const stats = useMemo(() => {
    if (!allocations || !banperRequests) {
      return {
        totalAllocated: 0,
        totalSpent: 0,
        totalRemaining: 0,
        pendingDisbursement: 0,
        approvedRequests: 0,
        disbursedRequests: 0,
        activeAllocations: 0,
        depletedAllocations: 0,
        bySource: {} as Record<string, { allocated: number; spent: number }>,
      }
    }

    // Calculate allocation statistics
    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
    const totalSpent = allocations.reduce((sum, a) => sum + a.spentAmount, 0)
    const totalRemaining = totalAllocated - totalSpent

    // Count active and fully spent allocations
    const activeAllocations = allocations.filter(a => a.status === 'ACTIVE').length
    const depletedAllocations = allocations.filter(a => a.status === 'FULLY_SPENT').length

    // Calculate pending disbursement (approved but not disbursed)
    const approvedNotDisbursed = banperRequests.filter(
      r => r.bgnStatus === 'APPROVED_BY_BGN'
    )
    const pendingDisbursement = approvedNotDisbursed.reduce(
      (sum, r) => sum + r.requestedAmount, 
      0
    )

    // Count request statuses
    const approvedRequests = banperRequests.filter(
      r => r.bgnStatus === 'APPROVED_BY_BGN' || r.bgnStatus === 'DISBURSED'
    ).length
    const disbursedRequests = banperRequests.filter(
      r => r.bgnStatus === 'DISBURSED'
    ).length

    // Group by budget source
    const bySource = allocations.reduce((acc, allocation) => {
      const source = allocation.source
      if (!acc[source]) {
        acc[source] = { allocated: 0, spent: 0 }
      }
      acc[source].allocated += allocation.allocatedAmount
      acc[source].spent += allocation.spentAmount
      return acc
    }, {} as Record<string, { allocated: number; spent: number }>)

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      pendingDisbursement,
      approvedRequests,
      disbursedRequests,
      activeAllocations,
      depletedAllocations,
      bySource,
    }
  }, [allocations, banperRequests])

  const isLoading = allocationsLoading || banperLoading

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const usagePercentage = calculatePercentage(stats.totalSpent, stats.totalAllocated)
  const remainingPercentage = 100 - usagePercentage

  return (
    <div className="space-y-4">
      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Alokasi Anggaran"
          value={formatCurrency(stats.totalAllocated)}
          subtitle={`${stats.activeAllocations} alokasi aktif`}
          icon={Wallet}
          badge={{
            text: `${stats.depletedAllocations} habis`,
            variant: stats.depletedAllocations > 0 ? 'secondary' : 'default',
          }}
        />

        <StatCard
          title="Total Penggunaan"
          value={formatCurrency(stats.totalSpent)}
          subtitle={`${usagePercentage}% dari total alokasi`}
          icon={TrendingUp}
          progress={{
            value: stats.totalSpent,
            max: stats.totalAllocated,
          }}
        />

        <StatCard
          title="Sisa Anggaran"
          value={formatCurrency(stats.totalRemaining)}
          subtitle={`${remainingPercentage}% tersisa`}
          icon={DollarSign}
          badge={{
            text: remainingPercentage < 20 ? 'Low Budget' : 'Sufficient',
            variant: remainingPercentage < 20 ? 'destructive' : 'default',
          }}
        />

        <StatCard
          title="Pending Disbursement"
          value={formatCurrency(stats.pendingDisbursement)}
          subtitle={`${banperRequests?.filter(r => r.bgnStatus === 'APPROVED_BY_BGN').length || 0} permintaan disetujui`}
          icon={Clock}
          badge={{
            text: stats.pendingDisbursement > 0 ? 'Perlu Tindakan' : 'Tidak Ada',
            variant: stats.pendingDisbursement > 0 ? 'secondary' : 'default',
          }}
        />
      </div>

      {/* Banper Request Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Permintaan Banper"
          value={banperRequests?.length.toString() || '0'}
          subtitle="Semua status"
          icon={FileText}
        />

        <StatCard
          title="Permintaan Disetujui"
          value={stats.approvedRequests.toString()}
          subtitle="Approved + Disbursed"
          icon={CheckCircle2}
          badge={{
            text: `${calculatePercentage(stats.approvedRequests, banperRequests?.length || 1)}%`,
            variant: 'default',
          }}
        />

        <StatCard
          title="Sudah Dicairkan"
          value={stats.disbursedRequests.toString()}
          subtitle="Status DISBURSED"
          icon={TrendingUp}
          badge={{
            text: `${calculatePercentage(stats.disbursedRequests, banperRequests?.length || 1)}%`,
            variant: 'default',
          }}
        />

        <StatCard
          title="Pending Approval"
          value={(banperRequests?.filter(r => 
            r.bgnStatus === 'SUBMITTED_TO_BGN' || 
            r.bgnStatus === 'UNDER_REVIEW_BGN'
          ).length || 0).toString()}
          subtitle="Menunggu persetujuan BGN"
          icon={AlertCircle}
          badge={{
            text: 'In Progress',
            variant: 'secondary',
          }}
        />
      </div>

      {/* Budget by Source */}
      {Object.keys(stats.bySource).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anggaran per Sumber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.bySource).map(([source, data]) => {
                const percentage = calculatePercentage(data.spent, data.allocated)
                
                return (
                  <div key={source} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{source}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(data.spent)} / {formatCurrency(data.allocated)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
