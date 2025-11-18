/**
 * @fileoverview Program Monitoring Reports List Page
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Page: /program/[id]/monitoring
 * Purpose: Display all monitoring reports for a program with filtering and pagination
 * 
 * Features:
 * - List all monitoring reports with summary cards
 * - Filter by date range
 * - Pagination support
 * - Quick stats overview
 * - Link to create new report
 * - Link to view detail report
 */

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UtensilsCrossed,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileText,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMonitoringReports } from '@/features/sppg/program/hooks'
import { formatDate, formatCurrency } from '@/features/sppg/program/lib/programUtils'
import type { MonitoringResponse } from '@/features/sppg/program/types/monitoring.types'

export default function ProgramMonitoringListPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string

  // Filters state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [page, setPage] = useState(1)
  const [limit] = useState(12)

  // Fetch monitoring reports
  const { data, isLoading, error } = useMonitoringReports(programId, {
    page,
    limit,
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  })

  const reports = data?.data || []
  const pagination = data?.pagination

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Skeleton */}
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

        {/* Reports Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Gagal Memuat Data Monitoring</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate summary stats from all reports
  const summaryStats = reports.length > 0 ? {
    totalReports: reports.length,
    averageBudgetUtilization: reports.reduce((sum, r) => sum + (r.stats?.budgetUtilization || 0), 0) / reports.length,
    averageQualityScore: reports.reduce((sum, r) => sum + (r.stats?.averageQualityScore || 0), 0) / reports.length,
    totalMealsServed: reports.reduce((sum, r) => sum + r.totalMealsDistributed, 0),
    totalRecipients: reports.reduce((sum, r) => sum + r.activeRecipients, 0) / reports.length,
  } : null

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Monitoring</h1>
          <p className="text-muted-foreground">
            Daftar laporan monitoring bulanan untuk program ini
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/program/${programId}/monitoring/new`}>
            <Plus className="h-4 w-4" />
            Buat Laporan Baru
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Total Laporan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {reports.length} ditampilkan dari {pagination?.total || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Rata-rata Utilisasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {summaryStats.averageBudgetUtilization.toFixed(1)}%
                </p>
                {summaryStats.averageBudgetUtilization < 100 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Penggunaan anggaran rata-rata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                Total Makanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.totalMealsServed.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Porsi disajikan keseluruhan
              </p>
            </CardContent>
          </Card>

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
                  {summaryStats.averageQualityScore.toFixed(1)}
                </p>
                {summaryStats.averageQualityScore >= 85 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata skor kualitas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setPage(1)
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Belum Ada Laporan Monitoring</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Program ini belum memiliki laporan monitoring. Klik tombol di bawah untuk membuat laporan pertama.
              </p>
              <Button asChild size="lg">
                <Link href={`/program/${programId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Laporan Monitoring
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <MonitoringCard
                key={report.id}
                report={report}
                programId={programId}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Monitoring Report Card Component
 */
function MonitoringCard({
  report,
  programId
}: {
  report: MonitoringResponse
  programId: string
}) {
  const stats = report.stats

  return (
    <Link href={`/program/${programId}/monitoring/${report.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {formatDate(report.monitoringDate)}
              </CardTitle>
              <CardDescription className="mt-1">
                Dilaporkan oleh {report.reportedBy.name}
              </CardDescription>
            </div>
            <Badge variant={
              (stats?.averageQualityScore || 0) >= 85 ? 'default' : 'secondary'
            }>
              {(stats?.averageQualityScore || 0).toFixed(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Budget Utilization */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Utilisasi Anggaran</span>
            <span className="font-medium">
              {(stats?.budgetUtilization || 0).toFixed(1)}%
            </span>
          </div>

          {/* Production Efficiency */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Efisiensi Produksi</span>
            <span className="font-medium">
              {(stats?.productionEfficiency || 0).toFixed(1)}%
            </span>
          </div>

          {/* Meals Served */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Makanan Disajikan</span>
            <span className="font-medium">
              {report.totalMealsDistributed.toLocaleString('id-ID')} porsi
            </span>
          </div>

          {/* Active Recipients */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Penerima Aktif</span>
            <span className="font-medium">
              {report.activeRecipients.toLocaleString('id-ID')} siswa
            </span>
          </div>

          {/* Cost Per Meal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Biaya per Porsi</span>
            <span className="font-medium">
              {formatCurrency(stats?.costPerMeal || 0)}
            </span>
          </div>

          {/* Report Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>Dibuat: {formatDate(report.reportDate)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
