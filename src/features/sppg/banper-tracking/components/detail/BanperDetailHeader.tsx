/**
 * @fileoverview Banper Detail Header Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BanperRequestTrackingWithRelations } from '../../types'
import type { BgnRequestStatus } from '@prisma/client'

interface BanperDetailHeaderProps {
  tracking: BanperRequestTrackingWithRelations
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

const statusConfig: Record<BgnRequestStatus, { 
  label: string
  className: string
}> = {
  DRAFT_LOCAL: { 
    label: 'Draft Lokal', 
    className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
  },
  SUBMITTED_TO_BGN: { 
    label: 'Diajukan ke BGN', 
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
  },
  UNDER_REVIEW_BGN: { 
    label: 'Review BGN', 
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
  },
  APPROVED_BY_BGN: { 
    label: 'Disetujui BGN', 
    className: 'bg-green-500/10 text-green-700 dark:text-green-300'
  },
  DISBURSED: { 
    label: 'Dana Cair', 
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  },
  REJECTED_BY_BGN: { 
    label: 'Ditolak BGN', 
    className: 'bg-red-500/10 text-red-700 dark:text-red-300'
  },
  CANCELLED: { 
    label: 'Dibatalkan', 
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
  },
}

export function BanperDetailHeader({
  tracking,
  onBack,
  onEdit,
  onDelete,
}: BanperDetailHeaderProps) {
  const canEdit = tracking.bgnStatus === 'DRAFT_LOCAL'
  const canDelete = tracking.bgnStatus === 'DRAFT_LOCAL'
  
  const status = tracking.bgnStatus as BgnRequestStatus
  const statusInfo = statusConfig[status]

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tracking.bgnRequestNumber || 'Draft Banper'}
            </h1>
            <p className="text-muted-foreground">
              {tracking.program?.name || 'Tidak ada program terkait'}
            </p>
          </div>
        </div>
        
        <Badge className={statusInfo.className}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="flex gap-2">
        {canEdit && (
          <Button onClick={onEdit} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        {canDelete && (
          <Button onClick={onDelete} variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        )}
      </div>
    </div>
  )
}
