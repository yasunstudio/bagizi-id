/**
 * @fileoverview Banper Request Tracking List Component
 * @version Next.js 15.5.4 / shadcn/ui with Dark Mode
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Data table untuk menampilkan semua Banper Request Tracking
 * dengan filtering, sorting, dan actions
 */

'use client'

import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Send,
  CheckCircle2,
  DollarSign,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { useBanperTrackings, useDeleteBanperTracking } from '../hooks'
import type { BanperRequestTrackingListItem } from '../types'
import type { BgnRequestStatus } from '@prisma/client'

/**
 * Status badge variants dengan dark mode support
 */
const statusConfig: Record<BgnRequestStatus, { 
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}> = {
  DRAFT_LOCAL: { 
    label: 'Draft Lokal', 
    variant: 'secondary',
    className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
  },
  SUBMITTED_TO_BGN: { 
    label: 'Diajukan ke BGN', 
    variant: 'default',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
  },
  UNDER_REVIEW_BGN: { 
    label: 'Review BGN', 
    variant: 'default',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
  },
  APPROVED_BY_BGN: { 
    label: 'Disetujui BGN', 
    variant: 'default',
    className: 'bg-green-500/10 text-green-700 dark:text-green-300'
  },
  DISBURSED: { 
    label: 'Dana Cair', 
    variant: 'default',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  },
  REJECTED_BY_BGN: { 
    label: 'Ditolak BGN', 
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-700 dark:text-red-300'
  },
  CANCELLED: { 
    label: 'Dibatalkan', 
    variant: 'outline',
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
  },
}

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

interface BanperTrackingListProps {
  onCreateNew?: () => void
}

export function BanperTrackingList({ onCreateNew }: BanperTrackingListProps) {
  const router = useRouter()
  const { data: trackings, isLoading } = useBanperTrackings()
  const { mutate: deleteTracking } = useDeleteBanperTracking()

  const handleView = (id: string) => {
    router.push(`/banper-tracking/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/banper-tracking/${id}/edit`)
  }

  const handleDelete = (id: string, trackingData: BanperRequestTrackingListItem) => {
    if (trackingData.bgnStatus !== 'DRAFT_LOCAL') {
      alert('Hanya tracking dengan status Draft Lokal yang dapat dihapus')
      return
    }

    if (confirm(`Hapus tracking "${trackingData.bgnRequestNumber || 'Draft'}"?\n\nData akan dihapus permanen.`)) {
      deleteTracking(id)
    }
  }

  const columns: ColumnDef<BanperRequestTrackingListItem>[] = [
    {
      accessorKey: 'bgnRequestNumber',
      header: 'Nomor Permohonan',
      cell: ({ row }) => {
        const number = row.getValue('bgnRequestNumber') as string | null
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {number || <span className="text-muted-foreground italic">Draft</span>}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }) => {
        const program = row.original.program
        return program ? (
          <div>
            <div className="font-medium">{program.name}</div>
            <div className="text-sm text-muted-foreground">{program.programCode}</div>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Tidak ada program</span>
        )
      },
    },
    {
      accessorKey: 'requestedAmount',
      header: 'Jumlah Diajukan',
      cell: ({ row }) => {
        const amount = row.getValue('requestedAmount') as number
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{formatCurrency(amount)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'bgnStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('bgnStatus') as BgnRequestStatus
        const config = statusConfig[status]
        return (
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'bgnSubmissionDate',
      header: 'Tanggal Pengajuan',
      cell: ({ row }) => {
        const date = row.getValue('bgnSubmissionDate') as Date | null
        return date ? (
          <span className="text-sm">
            {format(new Date(date), 'dd MMM yyyy', { locale: localeId })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">-</span>
        )
      },
    },
    {
      accessorKey: 'disbursedAmount',
      header: 'Dana Cair',
      cell: ({ row }) => {
        const amount = row.getValue('disbursedAmount') as number | null
        return amount ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold text-sm">{formatCurrency(amount)}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const tracking = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(tracking.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              {tracking.bgnStatus === 'DRAFT_LOCAL' && (
                <>
                  <DropdownMenuItem onClick={() => handleEdit(tracking.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/banper-tracking/${tracking.id}/submit`)}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit ke BGN
                  </DropdownMenuItem>
                </>
              )}
              {tracking.bgnStatus === 'APPROVED_BY_BGN' && (
                <DropdownMenuItem onClick={() => router.push(`/banper-tracking/${tracking.id}/disburse`)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Catat Pencairan
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {tracking.bgnStatus === 'DRAFT_LOCAL' && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(tracking.id, tracking)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tracking Anggaran Pemerintah (BANPER)</CardTitle>
            <CardDescription>
              Kelola permohonan dan tracking anggaran bantuan pemerintah
            </CardDescription>
          </div>
          <Button onClick={onCreateNew}>
            <FileText className="mr-2 h-4 w-4" />
            Buat Permohonan Baru
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Memuat data...</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={trackings || []}
            searchKey="bgnRequestNumber"
            searchPlaceholder="Cari nomor permohonan..."
          />
        )}
      </CardContent>
    </Card>
  )
}
