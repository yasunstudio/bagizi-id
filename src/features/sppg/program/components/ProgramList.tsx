/**
 * @fileoverview ProgramList Component - DataTable dengan filtering & sorting
 * @version Next.js 15.5.4 / TanStack Table v8
 * @author Bagizi-ID Development Team
 * 
 * PATTERN: Follows SupplierList pattern with optimized re-rendering
 * - Internal state for filters (no props)
 * - Filter bar inside component with React.memo
 * - Self-contained CRUD handlers
 */

'use client'

import { type FC, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ArrowUpDown,
  Calendar,
  Target
} from 'lucide-react'
import {
  formatCurrency,
  formatDateRange,
  calculateProgress,
  getStatusVariant,
  getProgramStatusLabel,
  getProgramTypeLabel,
  formatNumber,
} from '../lib'
import { useDeleteProgram } from '../hooks'
import { toast } from 'sonner'
import type { Program } from '../types'
import { ProgramTypeDisplay } from './ProgramTypeDisplay'

interface ProgramListProps {
  data: Program[]
  isLoading?: boolean
}

export const ProgramList: FC<ProgramListProps> = ({ data, isLoading }) => {
  const router = useRouter()
  
  // Convert response to array
  const programs = useMemo(() => {
    return Array.isArray(data) ? data : []
  }, [data])
  
  const { mutate: deleteProgram } = useDeleteProgram()
  
  // Handlers wrapped in useCallback to prevent re-renders
  const handleView = useCallback((id: string) => {
    router.push(`/program/${id}`)
  }, [router])

  const handleEdit = useCallback((id: string) => {
    router.push(`/program/${id}/edit`)
  }, [router])

  const handleDelete = useCallback((id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      deleteProgram(id, {
        onSuccess: () => {
          toast.success('Program berhasil dihapus')
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Gagal menghapus program')
        }
      })
    }
  }, [deleteProgram])

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo<ColumnDef<Program>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Nama Program
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const program = row.original
          return (
            <div className="space-y-1">
              <div className="font-semibold text-foreground">
                {program.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {program.programCode}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <Badge variant={getStatusVariant(status)}>
              {getProgramStatusLabel(status)}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'programType',
        header: 'Jenis Program',
        cell: ({ row }) => {
          const type = row.getValue('programType') as string
          return (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">
                {getProgramTypeLabel(type)}
              </span>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'allowedTargetGroups',
        header: 'Konfigurasi Target',
        cell: ({ row }) => {
          const program = row.original
          
          // Show multi-target configuration
          return (
            <div className="space-y-1">
              <ProgramTypeDisplay
                allowedTargetGroups={program.allowedTargetGroups}
                variant="badge"
                showTooltip={true}
              />
            </div>
          )
        },
      },
      {
        accessorKey: 'targetRecipients',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Penerima
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const program = row.original
          const progress = calculateProgress(
            program.currentRecipients,
            program.targetRecipients
          )
          
          return (
            <div className="space-y-1">
              <div className="text-sm font-medium">
                {formatNumber(program.currentRecipients)} / {formatNumber(program.targetRecipients)}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full transition-all ${
                      progress >= 100
                        ? 'bg-green-500'
                        : progress >= 75
                        ? 'bg-blue-500'
                        : progress >= 50
                        ? 'bg-yellow-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {progress}%
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'totalBudget',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Anggaran
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const budget = row.getValue('totalBudget') as number | null
          return (
            <div className="font-medium whitespace-nowrap">
              {formatCurrency(budget)}
            </div>
          )
        },
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Periode
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const program = row.original
          return (
            <div className="text-sm whitespace-nowrap">
              {formatDateRange(program.startDate, program.endDate)}
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const program = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleView(program.id)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEdit(program.id)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Program
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(program.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Program
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [handleView, handleEdit, handleDelete]
  )

  // Initialize TanStack Table
  const table = useReactTable({
    data: programs,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      Tidak ada data program.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} program ditemukan
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            <div className="text-sm">
              Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
              {table.getPageCount()}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  )
}
