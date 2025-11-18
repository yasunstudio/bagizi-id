/**
 * @fileoverview Banper Allocations Tab Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useBudgetAllocations } from '../../hooks'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { BudgetAllocationListItem, BudgetAllocationStatus, BudgetSource } from '../../types'
import { DollarSign, Calendar } from 'lucide-react'

interface BanperAllocationsTabProps {
  trackingId: string
}

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

const statusConfig: Record<BudgetAllocationStatus, { 
  label: string
  className: string
}> = {
  ACTIVE: { 
    label: 'Aktif', 
    className: 'bg-green-500/10 text-green-700 dark:text-green-300'
  },
  FULLY_SPENT: { 
    label: 'Habis Terpakai', 
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
  },
  PARTIALLY_SPENT: { 
    label: 'Sebagian Terpakai', 
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  },
  FROZEN: { 
    label: 'Dibekukan', 
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
  },
  CANCELLED: { 
    label: 'Dibatalkan', 
    className: 'bg-gray-500/10 text-gray-500 dark:text-gray-500'
  },
  EXPIRED: { 
    label: 'Kadaluarsa', 
    className: 'bg-red-500/10 text-red-600 dark:text-red-400'
  },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function BanperAllocationsTab({ trackingId }: BanperAllocationsTabProps) {
  const { data: allocations, isLoading } = useBudgetAllocations()

  // Filter allocations for this tracking
  const trackingAllocations = allocations?.filter(a => a.banperTrackingId === trackingId) || []

  const columns: ColumnDef<BudgetAllocationListItem>[] = [
    {
      accessorKey: 'source',
      header: 'Sumber Dana',
      cell: ({ row }) => {
        const source = row.getValue('source') as BudgetSource
        return (
          <div>
            <div className="font-medium">{sourceLabels[source]}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.fiscalYear}
            </div>
          </div>
        )
      },
    },
    {
      id: 'allocatedAmount',
      header: 'Alokasi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{formatCurrency(row.original.allocatedAmount)}</span>
        </div>
      ),
    },
    {
      id: 'usage',
      header: 'Penggunaan',
      cell: ({ row }) => {
        const spent = row.original.spentAmount
        const total = row.original.allocatedAmount
        const percentage = (spent / total) * 100

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(spent)}</span>
              <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'allocatedDate',
      header: 'Tanggal',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(row.getValue('allocatedDate')), 'd MMM yyyy', { locale: localeId })}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as BudgetAllocationStatus
        const config = statusConfig[status]
        return (
          <Badge className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alokasi Anggaran</CardTitle>
        <CardDescription>
          Daftar alokasi anggaran yang dibuat dari permohonan banper ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Memuat data...</div>
          </div>
        ) : trackingAllocations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada alokasi anggaran dibuat</p>
            <p className="text-sm text-muted-foreground mt-2">
              Alokasi akan otomatis dibuat setelah dana dicairkan
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={trackingAllocations}
          />
        )}
      </CardContent>
    </Card>
  )
}
