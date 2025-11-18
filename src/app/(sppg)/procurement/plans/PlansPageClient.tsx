/**
 * @fileoverview Procurement Plans Page - Client Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * 
 * ENTERPRISE COMPONENT:
 * - Follows EXACT Suppliers pattern (TanStack Table + ProcurementTableFilters)
 * - Full state management with sorting, filtering, pagination
 * - Client-side search across multiple fields
 * - CRUD operations with confirmation dialogs
 * - Loading/Error/Empty states
 * - Professional enterprise-grade UI
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  ArrowUpDown, 
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { ProcurementTableFilters, ProcurementPagination } from '@/components/shared/procurement'
import { 
  getPlanStatusLabel, 
  getPlanStatusColor,
  formatPlanPeriod,
  formatPlanQuarter,
  formatCurrency,
  formatNumber,
} from '@/features/sppg/procurement/plans/utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ProcurementPlan } from '@prisma/client'
import type { PlanApprovalStatus } from '@/features/sppg/procurement/plans/types'


// ================================ TYPES ================================

interface PlansPageClientProps {
  plans: (ProcurementPlan & {
    program: {
      name: string
    } | null
    menuPlan: {
      id: string
      name: string
      startDate: Date
      endDate: Date
      status: string
    } | null
  })[]
}

type Plan = ProcurementPlan & {
  program: {
    name: string
  } | null
  menuPlan: {
    id: string
    name: string
    startDate: Date
    endDate: Date
    status: string
  } | null
}

// ================================ COMPONENT ================================

export function PlansPageClient({ plans }: PlansPageClientProps) {
  const router = useRouter()

  // ============ STATE MANAGEMENT (8 hooks - SAME AS SUPPLIERS) ============
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PlanApprovalStatus | 'ALL'>('ALL')
  const [yearFilter, setYearFilter] = useState<string>('ALL')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ============ CLIENT-SIDE SEARCH FILTER ============
  const filteredPlans = useMemo(() => {
    if (!search && statusFilter === 'ALL' && yearFilter === 'ALL') return plans

    return plans.filter((plan) => {
      const searchLower = search.toLowerCase()
      
      // Search across multiple fields (4 fields - planCode removed as it doesn't exist)
      const matchesSearch =
        !search ||
        plan.planName.toLowerCase().includes(searchLower) ||
        plan.program?.name.toLowerCase().includes(searchLower) ||
        plan.planYear.toString().includes(searchLower) ||
        (plan.notes && plan.notes.toLowerCase().includes(searchLower))

      // Filter by status
      const matchesStatus = statusFilter === 'ALL' || plan.approvalStatus === statusFilter

      // Filter by year
      const matchesYear = yearFilter === 'ALL' || plan.planYear.toString() === yearFilter

      return matchesSearch && matchesStatus && matchesYear
    })
  }, [plans, search, statusFilter, yearFilter])

  // ============ EVENT HANDLERS (CRUD OPERATIONS) ============
  const handleView = useCallback((id: string) => {
    router.push(`/procurement/plans/${id}`)
  }, [router])

  const handleEdit = useCallback((id: string) => {
    router.push(`/procurement/plans/${id}/edit`)
  }, [router])

  const handleDelete = useCallback((id: string, name: string) => {
    setPlanToDelete({ id, name })
    setShowDeleteDialog(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!planToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sppg/procurement/plans/${planToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Gagal menghapus rencana pengadaan')
      }

      toast.success('Rencana pengadaan berhasil dihapus')
      router.refresh()
      setShowDeleteDialog(false)
      setPlanToDelete(null)
    } catch (error) {
      console.error('Delete plan error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus rencana pengadaan'
      )
    } finally {
      setIsDeleting(false)
    }
  }, [planToDelete, router])

  // ============ COLUMN DEFINITIONS ============
  const columns = useMemo<ColumnDef<Plan>[]>(
    () => [
      {
        accessorKey: 'planName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            Nama Rencana
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{row.getValue('planName')}</div>
            <div className="text-xs text-muted-foreground">
              {formatPlanPeriod(row.original.planMonth, row.original.planYear)}
              {row.original.planQuarter && (
                <> • {formatPlanQuarter(row.original.planQuarter)}</>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'program',
        header: 'Program',
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.program?.name || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'menuPlan',
        header: 'Menu Planning',
        cell: ({ row }) => {
          const menuPlan = row.original.menuPlan
          return (
            <div className="flex flex-col gap-1">
              {menuPlan ? (
                <>
                  <div className="text-sm font-medium">{menuPlan.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(menuPlan.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(menuPlan.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Tidak terhubung</span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'approvalStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.approvalStatus as PlanApprovalStatus
          const statusLabel = getPlanStatusLabel(status)
          const color = getPlanStatusColor(status)

          return (
            <Badge
              variant="secondary"
              className={cn(
                color === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                color === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                color === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                color === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                color === 'gray' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {statusLabel}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'totalBudget',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Anggaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium text-foreground">
              {formatCurrency(row.original.totalBudget)}
            </div>
            <div className="text-xs text-muted-foreground">
              Terpakai: {formatCurrency(row.original.usedBudget || 0)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'targetRecipients',
        header: 'Target',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {formatNumber(row.original.targetRecipients)} penerima
            </div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(row.original.targetMeals)} porsi
            </div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const plan = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Buka menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleView(plan.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Rencana
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(plan.id, plan.planName)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Rencana
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [handleView, handleEdit, handleDelete]
  )

  // ============ TABLE INSTANCE ============
  const table = useReactTable<Plan>({
    data: filteredPlans,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  // ============ RENDER HELPERS ============
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Belum ada rencana pengadaan</h3>
      <p className="text-muted-foreground mb-6">
        Klik tombol &apos;Buat Rencana Baru&apos; untuk membuat rencana pengadaan pertama
      </p>
    </div>
  )

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(plans.map(p => p.planYear)))
    return years.sort((a, b) => b - a)
  }, [plans])

  // ============ RENDER ============
  return (
    <div className="space-y-4">
      {/* Enterprise-Grade Filter Bar (EXACT SAME AS SUPPLIERS) */}
      <ProcurementTableFilters
        searchValue={search}
        searchPlaceholder="Cari rencana (nama, kode, program, tahun, catatan)..."
        onSearchChange={setSearch}
        filters={[
          {
            key: 'status',
            label: 'Status',
            placeholder: 'Semua Status',
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SUBMITTED', label: 'Diajukan' },
              { value: 'APPROVED', label: 'Disetujui' },
              { value: 'REJECTED', label: 'Ditolak' },
              { value: 'CANCELLED', label: 'Dibatalkan' },
            ],
            value: statusFilter,
            onChange: (value) => setStatusFilter(value as PlanApprovalStatus | 'ALL'),
          },
          {
            key: 'year',
            label: 'Tahun',
            placeholder: 'Semua Tahun',
            options: [
              { value: 'ALL', label: 'Semua Tahun' },
              ...availableYears.map(year => ({
                value: year.toString(),
                label: year.toString(),
              })),
            ],
            value: yearFilter,
            onChange: setYearFilter,
          },
        ]}
        showClearButton
        onClearAll={() => {
          setSearch('')
          setStatusFilter('ALL')
          setYearFilter('ALL')
        }}
      />

      {/* Table Card (EXACT SAME STRUCTURE AS SUPPLIERS) */}
      <Card>
        <CardContent className="p-0">
          {filteredPlans.length === 0 ? (
            <div className="p-6">{renderEmpty()}</div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
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
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination (EXACT SAME AS SUPPLIERS) */}
              <ProcurementPagination
                currentPage={table.getState().pagination.pageIndex + 1}
                totalPages={table.getPageCount()}
                pageSize={table.getState().pagination.pageSize}
                totalItems={filteredPlans.length}
                onPageChange={(page) => table.setPageIndex(page - 1)}
                onPageSizeChange={(size) => table.setPageSize(size)}
                itemLabel="rencana"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog (EXACT SAME AS SUPPLIERS) */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rencana Pengadaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus rencana{' '}
              <span className="font-semibold">{planToDelete?.name}</span>?
              <br />
              <br />
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait rencana pengadaan ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
