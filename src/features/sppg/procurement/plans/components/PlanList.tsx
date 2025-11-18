/**
 * @fileoverview Plan List Component
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/PROCUREMENT_WORKFLOW_GUIDE.md} Procurement Documentation
 * 
 * COMPONENT FEATURES:
 * - Display plans in table format
 * - Sortable columns
 * - Pagination controls
 * - Inline quick actions
 * - Empty state handling
 * - Loading state with skeleton
 * - Dark mode support
 */

'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProcurementPagination } from '@/components/shared/procurement'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getPlanStatusLabel,
  getPlanStatusColor,
  formatPlanPeriod,
  formatPlanQuarter,
  formatCurrency,
  formatNumber,
} from '../utils'
import type { PlanListItem, PlanApprovalStatus } from '../types'

// ================================ TYPES ================================

interface PlanListProps {
  plans: PlanListItem[]
  isLoading?: boolean
  pagination?: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onSubmit?: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  emptyMessage?: string
  className?: string
}

// ================================ COMPONENT ================================

/**
 * Plan List Component
 * Displays plans in a sortable table with pagination
 * 
 * @example
 * <PlanList
 *   plans={plansData}
 *   isLoading={isLoading}
 *   pagination={paginationData}
 *   onPageChange={(page) => setPage(page)}
 *   onView={(id) => router.push(`/procurement/plans/${id}`)}
 * />
 */
export function PlanList({
  plans,
  isLoading = false,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  emptyMessage = 'Tidak ada rencana pengadaan ditemukan',
  className,
}: PlanListProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Define columns
  const columns: ColumnDef<PlanListItem>[] = [
    {
      accessorKey: 'planName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Nama Rencana
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="font-medium text-foreground truncate">
            {row.original.planName}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatPlanPeriod(row.original.planMonth, row.original.planYear)}
            {row.original.planQuarter && (
              <> • {formatPlanQuarter(row.original.planQuarter)}</>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.approvalStatus as PlanApprovalStatus
        const statusLabel = getPlanStatusLabel(status)
        const statusColor = getPlanStatusColor(status)

        return (
          <Badge
            variant="secondary"
            className={cn(
              statusColor === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              statusColor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
              statusColor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              statusColor === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              statusColor === 'gray' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
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
          className="-ml-4"
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
            Terpakai: {formatCurrency(row.original.usedBudget)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'targetRecipients',
      header: 'Target',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm text-foreground">
            {formatNumber(row.original.targetRecipients)} penerima
          </div>
          <div className="text-xs text-muted-foreground">
            {formatNumber(row.original.targetMeals)} makanan
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const plan = row.original
        const canEdit = plan.approvalStatus === 'DRAFT'
        const canDelete = plan.approvalStatus === 'DRAFT'
        const canSubmit = plan.approvalStatus === 'DRAFT'
        const canApprove = ['SUBMITTED', 'UNDER_REVIEW'].includes(plan.approvalStatus)
        const canReject = ['SUBMITTED', 'UNDER_REVIEW'].includes(plan.approvalStatus)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onView && (
                <DropdownMenuItem onClick={() => onView(plan.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
              )}

              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(plan.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}

              {canSubmit && onSubmit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSubmit(plan.id)}>
                    <Send className="mr-2 h-4 w-4" />
                    Ajukan
                  </DropdownMenuItem>
                </>
              )}

              {canApprove && onApprove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onApprove(plan.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Setujui
                  </DropdownMenuItem>
                </>
              )}

              {canReject && onReject && (
                <DropdownMenuItem onClick={() => onReject(plan.id)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Tolak
                </DropdownMenuItem>
              )}

              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(plan.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Initialize table
  const table = useReactTable({
    data: plans,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Empty state
  if (!plans.length) {
    return (
      <div className={cn('rounded-md border border-border', className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {emptyMessage}
          </h3>
          <p className="text-sm text-muted-foreground">
            Mulai dengan membuat rencana pengadaan baru
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="rounded-md border border-border">
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <ProcurementPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          onPageChange={onPageChange || (() => {})}
          itemLabel="rencana"
          showPageSize={false}
        />
      )}
    </div>
  )
}
