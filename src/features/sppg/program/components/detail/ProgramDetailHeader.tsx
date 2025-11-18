'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, ArrowLeft, Trash2 } from 'lucide-react'
import { formatDate, formatNumberWithSeparator, getTargetGroupLabel, getProgramTypeLabel, getProgramStatusLabel, getStatusVariant } from '@/features/sppg/program/lib/programUtils'
import type { Program } from '@/features/sppg/program/types/program.types'

interface ProgramDetailHeaderProps {
  program: Program
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ProgramDetailHeader({
  program,
  onBack,
  onEdit,
  onDelete,
}: ProgramDetailHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Daftar Program
      </Button>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {program.name}
            </h1>
            <Badge
              variant={getStatusVariant(program.status)}
              className="text-sm"
            >
              {getProgramStatusLabel(program.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Kode: {program.programCode}</span>
            <span>•</span>
            <span>Jenis: {getProgramTypeLabel(program.programType)}</span>
            <span>•</span>
            <span>
              Target: {program.allowedTargetGroups.length === 1 
                ? getTargetGroupLabel(program.allowedTargetGroups[0])
                : `${program.allowedTargetGroups.length} Kelompok`
              }
            </span>
            <span>•</span>
            <span>
              {formatDate(program.startDate, 'dd MMM yyyy')} -{' '}
              {program.endDate
                ? formatDate(program.endDate, 'dd MMM yyyy')
                : 'Belum ditentukan'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Program
          </Button>
          <Button onClick={onDelete} variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Target Penerima</p>
          <p className="text-2xl font-bold mt-1">{formatNumberWithSeparator(program.targetRecipients)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Terdaftar Saat Ini</p>
          <p className="text-2xl font-bold mt-1 text-primary">
            {formatNumberWithSeparator(program.currentRecipients)}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Anggaran Total</p>
          <p className="text-2xl font-bold mt-1">
            {program.totalBudget
              ? `Rp ${program.totalBudget.toLocaleString('id-ID')}`
              : '-'}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Biaya per Porsi</p>
          <p className="text-2xl font-bold mt-1">
            {program.budgetPerMeal
              ? `Rp ${program.budgetPerMeal.toLocaleString('id-ID')}`
              : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}
