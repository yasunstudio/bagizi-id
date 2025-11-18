/**
 * @fileoverview Monitoring Beneficiaries Tab Component
 * @description Displays beneficiary and nutrition metrics
 * @version Next.js 15.5.4
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { formatNumberWithSeparator } from '@/features/sppg/program/lib/programUtils'

interface MonitoringBeneficiariesTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any // Will be inferred from useMonitoringReport return type
}

export function MonitoringBeneficiariesTab({ report }: MonitoringBeneficiariesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Metrik Penerima Manfaat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recipients Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target Penerima</span>
              <Badge variant="outline">{formatNumberWithSeparator(report.targetRecipients)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Terdaftar</span>
              <Badge variant="secondary">{formatNumberWithSeparator(report.enrolledRecipients)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aktif</span>
              <Badge>{formatNumberWithSeparator(report.activeRecipients)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dropout</span>
              <Badge variant="destructive">{formatNumberWithSeparator(report.dropoutCount)}</Badge>
            </div>
          </div>

          {/* Nutrition Assessments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Asesmen Selesai</span>
              <span className="font-medium">{formatNumberWithSeparator(report.assessmentsCompleted)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gizi Membaik</span>
              <span className="font-medium text-green-600">{formatNumberWithSeparator(report.improvedNutrition)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gizi Stabil</span>
              <span className="font-medium">{formatNumberWithSeparator(report.stableNutrition)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kasus Kritis</span>
              <span className="font-medium text-red-600">{formatNumberWithSeparator(report.criticalCases)}</span>
            </div>
          </div>

          {/* Feeding & Menu Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tingkat Kehadiran</span>
              <span className="font-medium">{report.attendanceRate?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hari Makan Direncanakan</span>
              <span className="font-medium">{formatNumberWithSeparator(report.feedingDaysPlanned)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hari Makan Selesai</span>
              <span className="font-medium">{formatNumberWithSeparator(report.feedingDaysCompleted)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Variasi Menu</span>
              <span className="font-medium">{formatNumberWithSeparator(report.menuVariety)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
