/**
 * @fileoverview Monitoring Stats Cards Component
 * @description Summary statistics cards for monitoring report
 * @version Next.js 15.5.4
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  UtensilsCrossed,
  CheckCircle2,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react'
import { formatCurrency, formatNumberWithSeparator } from '@/features/sppg/program/lib/programUtils'

interface MonitoringStats {
  budgetUtilization: number
  savings?: number
  productionEfficiency: number
  costPerMeal: number
  averageQualityScore: number
  servingRate: number
  costPerRecipient: number
}

interface MonitoringStatsCardsProps {
  report: {
    budgetAllocated: number
    budgetUtilized: number
    totalMealsProduced: number
    totalMealsDistributed: number
    avgQualityScore: number | null
    customerSatisfaction: number | null
    hygieneScore: number | null
    activeRecipients: number
    enrolledRecipients: number
  }
  stats: MonitoringStats | null
}

export function MonitoringStatsCards({ report, stats }: MonitoringStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Budget Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Utilisasi Anggaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">
              {(stats?.budgetUtilization || 0).toFixed(1)}%
            </p>
            {(stats?.budgetUtilization || 0) < 100 ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Dialokasikan:</span>
              <span className="font-medium">{formatCurrency(report.budgetAllocated)}</span>
            </div>
            <div className="flex justify-between">
              <span>Digunakan:</span>
              <span className="font-medium">{formatCurrency(report.budgetUtilized)}</span>
            </div>
            {stats?.savings && stats.savings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Hemat:</span>
                <span className="font-medium">{formatCurrency(stats.savings)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Production Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            Efisiensi Produksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">
              {(stats?.productionEfficiency || 0).toFixed(1)}%
            </p>
            {(stats?.productionEfficiency || 0) >= 90 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Diproduksi:</span>
              <span className="font-medium">{formatNumberWithSeparator(report.totalMealsProduced)}</span>
            </div>
            <div className="flex justify-between">
              <span>Disajikan:</span>
              <span className="font-medium">{formatNumberWithSeparator(report.totalMealsDistributed)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya/Porsi:</span>
              <span className="font-medium">{formatCurrency(stats?.costPerMeal || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Skor Kualitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">
              {(stats?.averageQualityScore || 0).toFixed(1)}
            </p>
            {(stats?.averageQualityScore || 0) >= 85 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Kualitas Makanan:</span>
              <span className="font-medium">{report.avgQualityScore?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Kepuasan:</span>
              <span className="font-medium">{report.customerSatisfaction?.toFixed(1) || 'N/A'}%</span>
            </div>
            <div className="flex justify-between">
              <span>Skor Higienis:</span>
              <span className="font-medium">{report.hygieneScore?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Kehadiran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">
              {(stats?.servingRate || 0).toFixed(1)}%
            </p>
            {(stats?.servingRate || 0) >= 90 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Penerima Aktif:</span>
              <span className="font-medium">{formatNumberWithSeparator(report.activeRecipients)}</span>
            </div>
            <div className="flex justify-between">
              <span>Terdaftar:</span>
              <span className="font-medium">{formatNumberWithSeparator(report.enrolledRecipients)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya/Penerima:</span>
              <span className="font-medium">{formatCurrency(stats?.costPerRecipient || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
