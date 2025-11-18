'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  UtensilsCrossed,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/features/sppg/program/lib/programUtils'
import { useMonitoringReports } from '@/features/sppg/program/hooks'
import type { 
  MonitoringChallenges, 
  MonitoringAchievements,
  MonitoringResponse 
} from '@/features/sppg/program/types/monitoring.types'
import Link from 'next/link'

interface ProgramMonitoringTabProps {
  programId: string
}

export function ProgramMonitoringTab({ programId }: ProgramMonitoringTabProps) {  
  // Fetch latest 6 months of monitoring data
  // useMonitoringReports returns MonitoringListResponse: { data: MonitoringResponse[], pagination: {...} }
  const { data: monitoringData, isLoading, error } = useMonitoringReports(programId, {
    limit: 6
  })

  const reportsList: MonitoringResponse[] = monitoringData?.data || []
  const latestReport = reportsList[0]

  // 🔍 DEBUG: Log data yang diterima
  console.log('🔍 [ProgramMonitoringTab] Debug Info:', {
    programId,
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    hasMonitoringData: !!monitoringData,
    monitoringDataStructure: monitoringData ? Object.keys(monitoringData) : null,
    hasDataProperty: monitoringData && 'data' in monitoringData,
    reportsListLength: reportsList.length,
    reportsList: reportsList,
    firstReport: latestReport ? { 
      id: latestReport.id, 
      monitoringDate: latestReport.monitoringDate 
    } : null
  })

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Gagal Memuat Data Monitoring</h4>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (reportsList.length === 0) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Belum Ada Laporan Monitoring</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Program ini belum memiliki laporan monitoring bulanan. Mulai dengan membuat laporan pertama untuk melacak progres program.
              </p>
              <Button asChild size="lg">
                <Link href={`/program/${programId}/monitoring/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Laporan Monitoring
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = latestReport?.stats || {
    budgetUtilization: 0,
    costPerMeal: 0,
    costPerRecipient: 0,
    productionEfficiency: 0,
    servingRate: 0,
    averageQualityScore: 0
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Monitoring Program</h3>
          <p className="text-sm text-muted-foreground">
            {reportsList.length} laporan bulanan tersedia
          </p>
        </div>
        <Button asChild>
          <Link href={`/program/${programId}/monitoring/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Laporan Baru
          </Link>
        </Button>
      </div>

      {/* Key Metrics Cards - Latest Report */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {stats.budgetUtilization.toFixed(1)}%
              </p>
              {stats.budgetUtilization < 100 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(latestReport.budgetUtilized)} dari {formatCurrency(latestReport.budgetAllocated)}
            </p>
          </CardContent>
        </Card>

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
                {stats.productionEfficiency.toFixed(1)}%
              </p>
              {stats.productionEfficiency >= 90 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {latestReport.totalMealsDistributed} dari {latestReport.totalMealsProduced} porsi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Tingkat Kehadiran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">
                {stats.servingRate.toFixed(1)}%
              </p>
              {stats.servingRate >= 90 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {latestReport.activeRecipients} dari {latestReport.targetRecipients} anak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Skor Kualitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">
                {stats.averageQualityScore?.toFixed(1) || '0.0'}
              </p>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rata-rata kualitas program
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Report Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Terbaru</CardTitle>
              <CardDescription>
                {formatDate(latestReport.monitoringDate, 'MMMM yyyy')}
              </CardDescription>
            </div>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(latestReport.createdAt, 'dd MMM yyyy')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Budget Summary */}
            <div>
              <h4 className="font-semibold mb-3">Ringkasan Anggaran</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Biaya per Porsi</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats.costPerMeal)}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Biaya per Penerima</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats.costPerRecipient)}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    {stats.budgetUtilization < 100 ? 'Penghematan' : 'Overbudget'}
                  </p>
                  <p className={`text-lg font-semibold ${stats.budgetUtilization < 100 ? 'text-green-600' : 'text-amber-600'}`}>
                    {formatCurrency(Math.abs(latestReport.budgetAllocated - latestReport.budgetUtilized))}
                  </p>
                </div>
              </div>
            </div>

            {/* Challenges */}
            {latestReport.challenges && (
              <div>
                <h4 className="font-semibold mb-3">Tantangan & Kendala</h4>
                <div className="space-y-2">
                  {(latestReport.challenges as MonitoringChallenges).major?.map((challenge, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{challenge.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {challenge.category}
                          </Badge>
                          <Badge variant={challenge.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
                            {challenge.status === 'resolved' ? 'Terselesaikan' : 'Berlangsung'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {latestReport.achievements && (
              <div>
                <h4 className="font-semibold mb-3">Pencapaian</h4>
                <div className="space-y-2">
                  {(latestReport.achievements as MonitoringAchievements).milestones?.map((milestone, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{milestone.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View All Reports Link */}
            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/program/${programId}/monitoring`}>
                  Lihat Semua Laporan Monitoring
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Reports Summary */}
      {reportsList.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Monitoring</CardTitle>
            <CardDescription>
              {reportsList.length - 1} laporan sebelumnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportsList.slice(1, 4).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {formatDate(report.monitoringDate, 'MMMM yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dilaporkan: {formatDate(report.createdAt, 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{report.stats?.productionEfficiency.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Efisiensi</p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/program/${programId}/monitoring/${report.id}`}>
                        Detail
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
