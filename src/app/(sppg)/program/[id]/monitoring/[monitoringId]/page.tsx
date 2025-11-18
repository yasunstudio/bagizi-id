/**
 * @fileoverview Program Monitoring Report Detail Page - ORCHESTRATOR ONLY
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.18.0
 * @author Bagizi-ID Development Team
 * 
 * Architecture: Component-based per Copilot Instructions
 * - Page file: ~120 lines (orchestrator + routing logic only)
 * - UI Components: src/features/sppg/program/components/monitoring/detail/*
 * - Business Logic: useMonitoringReport hook
 * 
 * Page: /program/[id]/monitoring/[monitoringId]
 * Purpose: Display full details of a single monitoring report
 * 
 * Features:
 * - Complete monitoring metrics display
 * - Stats cards (budget, production, quality, attendance)
 * - Tabs for different sections (Beneficiaries, Qualitative Analysis)
 * - Edit and delete actions
 * - Responsive layout with organized sections
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMonitoringReport, useDeleteMonitoringReport } from '@/features/sppg/program/hooks'
import {
  MonitoringDetailHeader,
  MonitoringStatsCards,
  MonitoringBeneficiariesTab,
  MonitoringQualitativeTab,
} from '@/features/sppg/program/components/monitoring/detail'

export default function MonitoringDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string
  const monitoringId = params.monitoringId as string

  const { data: report, isLoading, error } = useMonitoringReport(programId, monitoringId)
  const { mutate: deleteReport } = useDeleteMonitoringReport(programId, monitoringId)

  // Loading state
  if (isLoading) {
    return <DetailPageSkeleton />
  }

  // Error state
  if (error || !report) {
    return <ErrorState error={error} onBack={() => router.push(`/program/${programId}?tab=monitoring`)} />
  }

  // Parse JSON fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const challenges = report.challenges as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const achievements = report.achievements as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recommendations = report.recommendations as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feedback = report.feedback as any

  // Calculate additional stats
  const stats = {
    budgetUtilization: report.budgetAllocated > 0 
      ? (report.budgetUtilized / report.budgetAllocated) * 100 
      : 0,
    savings: report.budgetAllocated - report.budgetUtilized,
    productionEfficiency: report.totalMealsProduced > 0
      ? (report.totalMealsDistributed / report.totalMealsProduced) * 100
      : 0,
    costPerMeal: report.totalMealsProduced > 0
      ? report.budgetUtilized / report.totalMealsProduced
      : 0,
    averageQualityScore: (
      (report.avgQualityScore || 0) +
      (report.customerSatisfaction || 0) +
      (report.hygieneScore || 0)
    ) / 3,
    servingRate: report.enrolledRecipients > 0
      ? (report.activeRecipients / report.enrolledRecipients) * 100
      : 0,
    costPerRecipient: report.activeRecipients > 0
      ? report.budgetUtilized / report.activeRecipients
      : 0,
  }

  // Action handlers
  const handleEdit = () => {
    router.push(`/program/${programId}/monitoring/${monitoringId}/edit`)
  }

  const handleDelete = () => {
    if (confirm('Yakin ingin menghapus laporan monitoring ini?')) {
      deleteReport(undefined, {
        onSuccess: () => {
          router.push(`/program/${programId}?tab=monitoring`)
        },
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('Fitur export PDF akan segera hadir')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with actions */}
      <MonitoringDetailHeader
        report={report}
        programId={programId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
      />

      {/* Summary stats cards */}
      <MonitoringStatsCards report={report} stats={stats} />

      {/* Detailed tabs */}
      <Tabs defaultValue="beneficiaries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="beneficiaries">Penerima Manfaat</TabsTrigger>
          <TabsTrigger value="qualitative">Analisis Kualitatif</TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiaries">
          <MonitoringBeneficiariesTab report={report} />
        </TabsContent>

        <TabsContent value="qualitative">
          <MonitoringQualitativeTab
            challenges={challenges}
            achievements={achievements}
            recommendations={recommendations}
            feedback={feedback}
            stockoutDays={report.stockoutDays || 0}
          />
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex items-center justify-end pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push(`/program/${programId}?tab=monitoring`)}
        >
          Kembali ke Daftar
        </Button>
      </div>
    </div>
  )
}

// Helper Components
function DetailPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({ 
  error, 
  onBack 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
  onBack: () => void 
}) {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <CardTitle className="mb-2">Laporan Tidak Ditemukan</CardTitle>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Laporan monitoring tidak dapat dimuat'}
            </p>
          </div>
          <Button onClick={onBack}>Kembali</Button>
        </CardContent>
      </Card>
    </div>
  )
}

