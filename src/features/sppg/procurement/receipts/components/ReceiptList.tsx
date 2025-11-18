/**
 * @fileoverview Receipt List Component with Data Table
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Table / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ClipboardCheck,
  ArrowUpDown,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { ProcurementPagination } from '@/components/shared/procurement'
import { useReceipts, useDeleteReceipt } from '../hooks'
import { useReceiptStore } from '../stores'
import type { ReceiptListItem } from '../types'
import {
  formatCurrency,
  formatDeliveryDate,
  getDeliveryStatusLabel,
  getDeliveryStatusVariant,
  getQualityGradeLabel,
  getQualityGradeVariant,
} from '../lib'

// ================================ COMPONENT ================================

export function ReceiptList() {
  const router = useRouter()
  const { filters, sort } = useReceiptStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [receiptToDelete, setReceiptToDelete] = useState<{
    id: string
    code: string
  } | null>(null)

  // Fetch receipts
  const { data: receipts = [], isLoading } = useReceipts(filters, sort)
  const { mutate: deleteReceipt, isPending: isDeleting } = useDeleteReceipt()

  // Actions
  const handleView = useCallback((id: string) => {
    router.push(`/procurement/receipts/${id}`)
  }, [router])

  const handleEdit = useCallback((id: string) => {
    router.push(`/procurement/receipts/${id}/edit`)
  }, [router])

  const handleDelete = useCallback((id: string, code: string) => {
    setReceiptToDelete({ id, code })
  }, [])

  const confirmDelete = useCallback(() => {
    if (receiptToDelete) {
      deleteReceipt(receiptToDelete.id)
      setReceiptToDelete(null)
    }
  }, [receiptToDelete, deleteReceipt])

  const handleQualityControl = useCallback((id: string) => {
    router.push(`/procurement/receipts/${id}?tab=quality-control`)
  }, [router])

  // Columns definition
  const columns: ColumnDef<ReceiptListItem>[] = [
    {
      accessorKey: 'procurementCode',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Kode Procurement
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('procurementCode')}</div>
      ),
    },
    {
      accessorKey: 'receiptNumber',
      header: 'No. Terima',
      cell: ({ row }) => {
        const receiptNumber = row.getValue('receiptNumber') as string | null
        return (
          <div className="text-sm text-muted-foreground">
            {receiptNumber || '-'}
          </div>
        )
      },
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.getValue('supplierName') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'actualDelivery',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Tanggal Terima
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const dateValue = row.getValue('actualDelivery')
        // Convert string to Date if needed
        const date = dateValue 
          ? (dateValue instanceof Date ? dateValue : new Date(dateValue as string))
          : null
        return (
          <div className="text-sm">
            {formatDeliveryDate(date, null)}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount') as number
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        )
      },
    },
    {
      accessorKey: 'deliveryStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('deliveryStatus') as string
        return (
          <Badge variant={getDeliveryStatusVariant(status)}>
            {getDeliveryStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'qualityGrade',
      header: 'Kualitas',
      cell: ({ row }) => {
        const grade = row.original.qualityGrade
        return grade ? (
          <Badge variant={getQualityGradeVariant(grade)}>
            {getQualityGradeLabel(grade)}
          </Badge>
        ) : (
          <Badge variant="outline">Belum QC</Badge>
        )
      },
    },
    {
      accessorKey: 'inspectedBy',
      header: 'Pemeriksa',
      cell: ({ row }) => {
        const inspector = row.getValue('inspectedBy') as string | null
        return (
          <div className="text-sm text-muted-foreground">
            {inspector || '-'}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const receipt = row.original
        const needsQC = !receipt.inspectedBy && receipt.deliveryStatus === 'DELIVERED'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => handleView(receipt.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>

              {needsQC && (
                <DropdownMenuItem onClick={() => handleQualityControl(receipt.id)}>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Quality Control
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => handleEdit(receipt.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDelete(receipt.id, receipt.procurementCode)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Table instance
  const table = useReactTable({
    data: receipts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Search filter
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    table.getColumn('procurementCode')?.setFilterValue(value)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode procurement..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Button asChild>
          <Link href="/procurement/receipts/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Penerimaan
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data penerimaan barang
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <ProcurementPagination
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        pageSize={table.getState().pagination.pageSize}
        totalItems={table.getFilteredRowModel().rows.length}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        itemLabel="receipt"
        showPageSize={false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!receiptToDelete} 
        onOpenChange={(open) => !open && setReceiptToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penerimaan Barang?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus penerimaan barang{' '}
              <strong>{receiptToDelete?.code}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
