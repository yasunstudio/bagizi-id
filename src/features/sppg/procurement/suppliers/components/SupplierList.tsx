/**
 * @fileoverview SupplierList Component - Comprehensive TanStack Table Implementation
 * @version Next.js 15.5.4 / TanStack Table v8 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @description
 * Enterprise supplier list with TanStack React Table v8+
 * Features: 6 columns, 6 SupplierType badge colors, sorting, filtering,
 * pagination, CRUD operations, client-side search, loading/error/empty states
 * 
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
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
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Users,
  Phone,
  Mail,
  MapPin,
  Star,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ProcurementPagination, ProcurementTableFilters } from '@/components/shared/procurement'
import { useSuppliers, useDeleteSupplier } from '@/features/sppg/procurement/suppliers/hooks'
import type { Supplier, SupplierType } from '@/features/sppg/procurement/suppliers/types'

// ================================ COMPONENT PROPS ================================

interface SupplierListProps {
  /** Optional supplier type filter from URL */
  type?: SupplierType
  /** Optional category filter from URL */
  category?: string
}

// ================================ MAIN COMPONENT ================================

export const SupplierList: FC<SupplierListProps> = ({
  type: typeFromUrl,
  category: categoryFromUrl
}) => {
  const router = useRouter()

  // ================================ STATE MANAGEMENT ================================

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<SupplierType | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null)

  // ================================ DATA FETCHING ================================

  // Build filters
  const filters = useMemo(
    () => ({
      ...(typeFromUrl && { supplierType: [typeFromUrl] }),
      ...(categoryFromUrl && { category: [categoryFromUrl] }),
      ...(typeFilter !== 'ALL' && { supplierType: [typeFilter] }),
      ...(categoryFilter !== 'ALL' && { category: [categoryFilter] }),
      ...(statusFilter === 'ACTIVE' && { isActive: true }),
      ...(statusFilter === 'INACTIVE' && { isActive: false }),
    }),
    [typeFromUrl, categoryFromUrl, typeFilter, categoryFilter, statusFilter]
  )

  // Fetch suppliers (API returns Supplier with sppg, procurements relations)
  // Hook already extracts data.data via queryFn, so suppliersResponse is the array
  const { data: suppliersResponse, isLoading, error } = useSuppliers(filters)
  
  // Use response directly (already an array from hook's queryFn)
  const suppliers = useMemo(
    () => Array.isArray(suppliersResponse) ? suppliersResponse : [],
    [suppliersResponse]
  )

  // Client-side search filter
  const filteredSuppliers = useMemo(() => {
    if (!search) return suppliers

    return suppliers.filter((supplier: Supplier) => {
      const searchLower = search.toLowerCase()
      return (
        supplier.supplierName.toLowerCase().includes(searchLower) ||
        supplier.supplierCode.toLowerCase().includes(searchLower) ||
        supplier.businessName?.toLowerCase().includes(searchLower) ||
        supplier.primaryContact.toLowerCase().includes(searchLower) ||
        supplier.phone.toLowerCase().includes(searchLower)
      )
    })
  }, [suppliers, search])

  // ================================ MUTATIONS ================================

  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier()

  // ================================ EVENT HANDLERS ================================

  const handleView = useCallback((id: string) => {
    router.push(`/procurement/suppliers/${id}`)
  }, [router])

  const handleEdit = useCallback((id: string) => {
    router.push(`/procurement/suppliers/${id}/edit`)
  }, [router])

  const handleDelete = useCallback((id: string, name: string) => {
    setSupplierToDelete({ id, name })
    setShowDeleteDialog(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id)
    }
    setShowDeleteDialog(false)
    setSupplierToDelete(null)
  }, [supplierToDelete, deleteSupplier])

  const handleCreateNew = useCallback(() => {
    router.push('/procurement/suppliers/new')
  }, [router])

  // ================================ BADGE HELPERS ================================

  /**
   * Get badge variant for supplier type
   * 6 SupplierType values: LOCAL, REGIONAL, NATIONAL, INTERNATIONAL, COOPERATIVE, INDIVIDUAL
   */
  const getTypeBadgeVariant = (type: SupplierType) => {
    switch (type) {
      case 'LOCAL':
        return 'default' // Blue - Local
      case 'REGIONAL':
        return 'secondary' // Gray - Regional
      case 'NATIONAL':
        return 'outline' // Outlined - National
      case 'INTERNATIONAL':
        return 'destructive' // Red - International (premium)
      case 'COOPERATIVE':
        return 'default' // Blue - Cooperative
      case 'INDIVIDUAL':
        return 'secondary' // Gray - Individual
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: SupplierType): string => {
    switch (type) {
      case 'LOCAL':
        return 'Lokal'
      case 'REGIONAL':
        return 'Regional'
      case 'NATIONAL':
        return 'Nasional'
      case 'INTERNATIONAL':
        return 'Internasional'
      case 'COOPERATIVE':
        return 'Koperasi'
      case 'INDIVIDUAL':
        return 'Perorangan'
      default:
        return type
    }
  }

  /**
   * Get category badge variant
   */
  const getCategoryBadgeVariant = (category: string) => {
    switch (category.toUpperCase()) {
      case 'PROTEIN':
        return 'default'
      case 'VEGETABLES':
        return 'secondary'
      case 'DAIRY':
        return 'outline'
      case 'GRAINS':
        return 'default'
      default:
        return 'secondary'
    }
  }

  /**
   * Format rating display with stars
   */
  const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)} / 5.0`
  }

  // ================================ COLUMN DEFINITIONS ================================

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: 'supplierName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            <Users className="mr-2 h-4 w-4" />
            Nama Supplier
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{row.getValue('supplierName')}</div>
            {row.original.businessName && (
              <div className="text-xs text-muted-foreground">
                {row.original.businessName}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {row.original.supplierCode}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'supplierType',
        header: 'Tipe',
        cell: ({ row }) => {
          const type = row.getValue('supplierType') as SupplierType
          return (
            <Badge variant={getTypeBadgeVariant(type)}>
              {getTypeLabel(type)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ row }) => {
          const category = row.getValue('category') as string
          return (
            <Badge variant={getCategoryBadgeVariant(category)}>
              {category}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'primaryContact',
        header: 'Kontak',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{row.original.phone}</span>
            </div>
            {row.original.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{row.original.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{row.original.city}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'paymentTerms',
        header: 'Termin Pembayaran',
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue('paymentTerms')}</div>
        ),
      },
      {
        accessorKey: 'overallRating',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            <Star className="mr-2 h-4 w-4" />
            Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const rating = row.getValue('overallRating') as number
          const isPreferred = row.original.isPreferred
          
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{formatRating(rating)}</span>
              </div>
              {isPreferred && (
                <Badge variant="default" className="gap-1">
                  <Award className="h-3 w-3" />
                  Pilihan
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.isActive
          const isBlacklisted = row.original.isBlacklisted
          
          if (isBlacklisted) {
            return <Badge variant="destructive">Blacklist</Badge>
          }
          
          return isActive ? (
            <Badge variant="default">Aktif</Badge>
          ) : (
            <Badge variant="secondary">Nonaktif</Badge>
          )
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const supplier = row.original

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
                <DropdownMenuItem onClick={() => handleView(supplier.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(supplier.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Supplier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(supplier.id, supplier.supplierName)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Supplier
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [handleView, handleEdit, handleDelete]
  )

  // ================================ TABLE INSTANCE ================================

  const table = useReactTable<Supplier>({
    data: filteredSuppliers,
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

  // ================================ RENDER HELPERS ================================

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )

  /**
   * Render error state
   */
  const renderError = () => (
    <Alert variant="destructive">
      <AlertDescription>
        {error instanceof Error ? error.message : 'Gagal memuat data supplier'}
      </AlertDescription>
    </Alert>
  )

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Belum ada data supplier</h3>
      <p className="text-muted-foreground mb-6">
        Klik tombol &apos;Tambah Supplier Baru&apos; untuk membuat supplier pertama
      </p>
      <Button onClick={handleCreateNew}>
        <Plus className="mr-2 h-4 w-4" />
        Tambah Supplier Baru
      </Button>
    </div>
  )

  // ================================ RENDER ================================

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daftar Supplier</h2>
          <p className="text-muted-foreground mt-1">
            Kelola data supplier dan vendor untuk pengadaan
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Supplier Baru
        </Button>
      </div> */}

      {/* Enterprise-Grade Filter Bar */}
      <ProcurementTableFilters
        searchValue={search}
        searchPlaceholder="Cari supplier (nama, kode, kontak, telepon)..."
        onSearchChange={setSearch}
        filters={[
          {
            key: 'type',
            label: 'Tipe Supplier',
            placeholder: 'Semua Tipe',
            options: [
              { value: 'ALL', label: 'Semua Tipe' },
              { value: 'LOCAL', label: 'Lokal' },
              { value: 'REGIONAL', label: 'Regional' },
              { value: 'NATIONAL', label: 'Nasional' },
              { value: 'INTERNATIONAL', label: 'Internasional' },
              { value: 'COOPERATIVE', label: 'Koperasi' },
              { value: 'INDIVIDUAL', label: 'Perorangan' },
            ],
            value: typeFilter,
            onChange: (value) => setTypeFilter(value as SupplierType | 'ALL'),
          },
          {
            key: 'category',
            label: 'Kategori',
            placeholder: 'Semua Kategori',
            options: [
              { value: 'ALL', label: 'Semua Kategori' },
              { value: 'PROTEIN', label: 'Protein' },
              { value: 'VEGETABLES', label: 'Sayuran' },
              { value: 'DAIRY', label: 'Dairy' },
              { value: 'GRAINS', label: 'Biji-bijian' },
            ],
            value: categoryFilter,
            onChange: setCategoryFilter,
          },
          {
            key: 'status',
            label: 'Status',
            placeholder: 'Semua Status',
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'ACTIVE', label: 'Aktif' },
              { value: 'INACTIVE', label: 'Nonaktif' },
            ],
            value: statusFilter,
            onChange: (value) => setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE'),
          },
        ]}
        showClearButton
        onClearAll={() => {
          setSearch('')
          setTypeFilter('ALL')
          setCategoryFilter('ALL')
          setStatusFilter('ALL')
        }}
      />

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">{renderLoading()}</div>
          ) : error ? (
            <div className="p-6">{renderError()}</div>
          ) : filteredSuppliers.length === 0 ? (
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

              {/* Pagination */}
              <ProcurementPagination
                currentPage={table.getState().pagination.pageIndex + 1}
                totalPages={table.getPageCount()}
                pageSize={table.getState().pagination.pageSize}
                totalItems={filteredSuppliers.length}
                onPageChange={(page) => table.setPageIndex(page - 1)}
                onPageSizeChange={(size) => table.setPageSize(size)}
                itemLabel="supplier"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus supplier{' '}
              <span className="font-semibold">{supplierToDelete?.name}</span>?
              <br />
              <br />
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait supplier ini.
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
