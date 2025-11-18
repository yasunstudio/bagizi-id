/**
 * @fileoverview Budget Allocation List Component
 * @version Next.js 15.5.4 / shadcn/ui with Dark Mode
 * @author Bagizi-ID Development Team
 * 
 * Data table untuk menampilkan semua Program Budget Allocations
 * dengan filtering, sorting, dan progress tracking
 */

'use client'

import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  Calendar,
  Building2,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { useBudgetAllocations, useDeleteBudgetAllocation } from '../hooks'
import type { BudgetAllocationListItem } from '../types'
import type { BudgetAllocationStatus, BudgetSource } from '@prisma/client'

/**
 * Status badge configuration
 */
const statusConfig: Record<BudgetAllocationStatus, { 
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}> = {
  ACTIVE: { 
    label: 'Aktif', 
    variant: 'default',
    className: 'bg-green-500/10 text-green-700 dark:text-green-300'
  },
  FULLY_SPENT: { 
    label: 'Habis Terpakai', 
    variant: 'secondary',
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
  },
  PARTIALLY_SPENT: { 
    label: 'Sebagian Terpakai', 
    variant: 'default',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  },
  FROZEN: { 
    label: 'Dibekukan', 
    variant: 'outline',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
  },
  CANCELLED: { 
    label: 'Dibatalkan', 
    variant: 'outline',
    className: 'bg-gray-500/10 text-gray-500 dark:text-gray-500'
  },
  EXPIRED: { 
    label: 'Kadaluarsa', 
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400'
  },
}

/**
 * Budget source labels
 */
const sourceLabels: Record<BudgetSource, string> = {
  APBN_PUSAT: 'APBN Pusat',
  APBN_DEKONSENTRASI: 'APBN Dekonsentrasi',
  APBD_PROVINSI: 'APBD Provinsi',
  APBD_KABUPATEN: 'APBD Kabupaten',
  APBD_KOTA: 'APBD Kota',
  DAK: 'DAK',
  HIBAH: 'Hibah',
  MIXED: 'Campuran',
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

interface BudgetAllocationListProps {
  onCreateNew?: () => void
}

export function BudgetAllocationList({ onCreateNew }: BudgetAllocationListProps) {
  const router = useRouter()
  const { data: allocations, isLoading } = useBudgetAllocations()
  const { mutate: deleteAllocation } = useDeleteBudgetAllocation()

  const handleView = (id: string) => {
    router.push(`/sppg/budget-allocations/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/sppg/budget-allocations/${id}/edit`)
  }

  const handleDelete = (id: string, allocationData: BudgetAllocationListItem) => {
    if (allocationData.spentAmount > 0) {
      alert('Alokasi dengan transaksi tidak dapat dihapus')
      return
    }

    if (confirm(`Hapus alokasi untuk program "${allocationData.program.name}"?\n\nData akan dihapus permanen.`)) {
      deleteAllocation(id)
    }
  }

  const columns: ColumnDef<BudgetAllocationListItem>[] = [
    {
      id: 'programName',
      accessorFn: (row) => row.program.name, // Custom accessor for nested field
      header: 'Program',
      cell: ({ row }) => {
        const program = row.original.program
        return (
          <div>
            <div className="font-medium">{program.name}</div>
            <div className="text-sm text-muted-foreground">{program.programCode}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'source',
      header: 'Sumber Anggaran',
      cell: ({ row }) => {
        const source = row.getValue('source') as BudgetSource
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{sourceLabels[source]}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'fiscalYear',
      header: 'Tahun Anggaran',
      cell: ({ row }) => {
        const year = row.getValue('fiscalYear') as number
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{year}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'allocatedAmount',
      header: 'Total Alokasi',
      cell: ({ row }) => {
        const amount = row.getValue('allocatedAmount') as number
        return (
          <span className="font-semibold">{formatCurrency(amount)}</span>
        )
      },
    },
    {
      id: 'usage',
      header: 'Penggunaan',
      cell: ({ row }) => {
        const allocated = row.original.allocatedAmount
        const spent = row.original.spentAmount
        const remaining = row.original.remainingAmount
        const percentage = (spent / allocated) * 100

        return (
          <div className="space-y-2 min-w-[200px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terpakai:</span>
              <span className="font-medium">{formatCurrency(spent)}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sisa:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as BudgetAllocationStatus
        const config = statusConfig[status]
        return (
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'allocatedDate',
      header: 'Tanggal Alokasi',
      cell: ({ row }) => {
        const date = row.getValue('allocatedDate') as Date
        return (
          <span className="text-sm">
            {format(new Date(date), 'dd MMM yyyy', { locale: localeId })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const allocation = row.original

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
              <DropdownMenuItem onClick={() => handleView(allocation.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(allocation.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/sppg/budget-transactions?allocationId=${allocation.id}`)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Lihat Transaksi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {allocation.spentAmount === 0 && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(allocation.id, allocation)}
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
            <CardTitle>Alokasi Anggaran Program</CardTitle>
            <CardDescription>
              Kelola alokasi anggaran untuk program gizi
            </CardDescription>
          </div>
          <Button onClick={onCreateNew}>
            <Building2 className="mr-2 h-4 w-4" />
            Tambah Alokasi Manual
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
            data={allocations || []}
            searchKey="programName"
            searchPlaceholder="Cari program..."
          />
        )}
      </CardContent>
    </Card>
  )
}
