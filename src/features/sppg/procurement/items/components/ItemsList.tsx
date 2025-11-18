/**
 * @fileoverview Procurement Items List Component
 * Data table with filters, sorting, and actions
 * 
 * @version React 18 / shadcn/ui / TanStack Table
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC, useState, useMemo } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Search,
  Package,
} from 'lucide-react'
import { useItems, useDeleteItem } from '../hooks'
import type { ProcurementItemResponse } from '../types/item.types'

interface ItemsListProps {
  orderId: string
  items?: ProcurementItemResponse[] // Optional: use existing data instead of fetching
  onEdit?: (item: ProcurementItemResponse) => void
  onView?: (item: ProcurementItemResponse) => void
  showActions?: boolean
  // TODO: Add back when implementing conditional edit based on order status
  // canEdit?: boolean
  // orderStatus?: string
}

export const ItemsList: FC<ItemsListProps> = ({
  orderId,
  items: providedItems,
  onEdit,
  onView,
  showActions = true,
}) => {
  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [acceptanceFilter, setAcceptanceFilter] = useState<string>('all')
  const [qualityFilter, setQualityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Fetch items once (no server-side filtering for better performance)
  const { data: fetchedData, isLoading, error } = useItems(orderId)

  // Client-side filtering (no re-fetch, instant response)
  const items = useMemo(() => {
    // Get raw items (before filtering)
    const rawItems = providedItems || fetchedData || []
    let filtered = [...rawItems]

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Apply acceptance filter
    if (acceptanceFilter === 'accepted') {
      filtered = filtered.filter(item => item.isAccepted === true)
    } else if (acceptanceFilter === 'rejected') {
      filtered = filtered.filter(item => item.isAccepted === false)
    }

    // Apply quality filter (based on rejectionReason or qualityReceived)
    if (qualityFilter === 'yes') {
      filtered = filtered.filter(item => 
        item.rejectionReason !== null || 
        (item.qualityReceived && item.qualityReceived.toLowerCase().includes('issue'))
      )
    } else if (qualityFilter === 'no') {
      filtered = filtered.filter(item => 
        item.rejectionReason === null && 
        (!item.qualityReceived || !item.qualityReceived.toLowerCase().includes('issue'))
      )
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.itemName.toLowerCase().includes(query) ||
        item.itemCode?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [providedItems, fetchedData, categoryFilter, acceptanceFilter, qualityFilter, searchQuery])
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem(orderId)

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Table columns
  const columns: ColumnDef<ProcurementItemResponse>[] = [
    {
      accessorKey: 'itemName',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Item Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{item.itemName}</span>
            {item.itemCode && (
              <span className="text-xs text-muted-foreground">
                {item.itemCode}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('category')}</Badge>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => {
        const brand = row.getValue('brand') as string | undefined
        return brand ? (
          <span className="text-sm">{brand}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'orderedQuantity',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Ordered
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const item = row.original
        return (
          <span className="text-sm font-medium">
            {item.orderedQuantity} {item.unit}
          </span>
        )
      },
    },
    {
      accessorKey: 'receivedQuantity',
      header: 'Received',
      cell: ({ row }) => {
        const item = row.original
        if (!item.receivedQuantity) {
          return (
            <Badge variant="secondary" className="text-xs">
              Pending
            </Badge>
          )
        }
        
        const percent = (item.receivedQuantity / item.orderedQuantity) * 100
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {item.receivedQuantity} {item.unit}
            </span>
            <span className="text-xs text-muted-foreground">
              {percent.toFixed(0)}%
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'pricePerUnit',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Price/Unit
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <span className="text-sm font-medium">
            {formatCurrency(row.getValue('pricePerUnit'))}
          </span>
        )
      },
    },
    {
      accessorKey: 'finalPrice',
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
        return (
          <span className="text-sm font-bold">
            {formatCurrency(row.getValue('finalPrice'))}
          </span>
        )
      },
    },
    {
      accessorKey: 'isAccepted',
      header: 'Status',
      cell: ({ row }) => {
        const item = row.original
        if (!item.receivedQuantity) {
          return <Badge variant="secondary">Pending</Badge>
        }
        
        return item.isAccepted ? (
          <Badge variant="default" className="bg-green-600">
            Accepted
          </Badge>
        ) : (
          <Badge variant="destructive">Rejected</Badge>
        )
      },
    },
  ]

  // Add actions column if enabled
  if (showActions) {
    columns.push({
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original

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
              {onView && (
                <DropdownMenuItem onClick={() => onView(item)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Detail
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Item
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (
                    confirm(`Delete item "${item.itemName}"? This cannot be undone.`)
                  ) {
                    deleteItem(item.id)
                  }
                }}
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    })
  }

  // Initialize table
  const table = useReactTable({
    data: items || [],
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
  })

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Package className="h-5 w-5" />
            Error Loading Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Failed to load items'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Items List ({items?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="VEGETABLES">Vegetables</SelectItem>
                <SelectItem value="FRUITS">Fruits</SelectItem>
                <SelectItem value="GRAINS">Grains</SelectItem>
                <SelectItem value="PROTEIN">Protein</SelectItem>
                <SelectItem value="DAIRY">Dairy</SelectItem>
                <SelectItem value="SEASONING">Seasoning</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={acceptanceFilter}
              onValueChange={setAcceptanceFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="yes">Has Issues</SelectItem>
                <SelectItem value="no">No Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              {table.getRowModel().rows?.length ? (
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
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {(items?.length || 0) > 10 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * 10 + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * 10,
                items?.length || 0
              )}{' '}
              of {items?.length || 0} items
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
