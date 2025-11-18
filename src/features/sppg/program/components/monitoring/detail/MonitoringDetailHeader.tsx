/**
 * @fileoverview Monitoring Detail Header Component
 * @description Header section with title, metadata, and action buttons
 * @version Next.js 15.5.4
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Edit,
  Trash2,
  Printer,
  Download,
} from 'lucide-react'
import { formatDate } from '@/features/sppg/program/lib/programUtils'

interface MonitoringDetailHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any
  programId: string
  onEdit: () => void
  onDelete: () => void
  onPrint: () => void
  onExportPDF: () => void
}

export function MonitoringDetailHeader({
  report,
  programId,
  onEdit,
  onDelete,
  onPrint,
  onExportPDF,
}: MonitoringDetailHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push(`/program/${programId}?tab=monitoring`)
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Laporan Monitoring
            </h1>
            <Badge variant="outline">
              {report.reportPeriod}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Periode: {formatDate(report.startDate)} - {formatDate(report.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Pelapor: {report.reportedBy.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Dibuat: {formatDate(report.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Cetak
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Unduh PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>
    </div>
  )
}
