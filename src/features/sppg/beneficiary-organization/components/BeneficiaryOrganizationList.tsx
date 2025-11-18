/**
 * @fileoverview Beneficiary Organization List Component with TanStack Table & Pagination
 * @version Next.js 15.5.4 / TanStack Table v8
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState, useMemo } from 'react'
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
  Building2,
  Heart,
  School,
  Users,
  MapPin,
  Phone,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowUpDown,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { Skeleton } from '@/components/ui/skeleton'
import type { BeneficiaryOrganizationResponse } from '../api/beneficiaryOrganizationApi'
import { organizationTypeLabels } from '../schemas/beneficiaryOrganizationSchema'

interface BeneficiaryOrganizationListProps {
  organizations: BeneficiaryOrganizationResponse[]
  isLoading?: boolean
  onDelete: (id: string) => void
}

export function BeneficiaryOrganizationList({
  organizations,
  isLoading = false,
  onDelete,
}: BeneficiaryOrganizationListProps) {
  const router = useRouter()
  
  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const getOrganizationIcon = (type: string) => {
    switch (type) {
      case 'SCHOOL':
        return <School className="h-5 w-5" />
      case 'HEALTH_FACILITY':
        return <Heart className="h-5 w-5" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<BeneficiaryOrganizationResponse>[]>(
    () => [
      {
        accessorKey: 'organizationName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Organisasi
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const org = row.original
          return (
            <div className="flex items-start gap-3">
              <div className="text-primary mt-1">{getOrganizationIcon(org.type)}</div>
              <div>
                <div className="font-semibold">{org.organizationName}</div>
                <div className="text-xs text-muted-foreground">{org.organizationCode}</div>
                {org.subType && (
                  <Badge variant="outline" className="mt-1">
                    {org.subType}
                  </Badge>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'type',
        header: 'Jenis & Status',
        cell: ({ row }) => {
          const org = row.original
          const type = row.getValue('type') as string
          const typeLabel = organizationTypeLabels[type as keyof typeof organizationTypeLabels] || type || '-'
          
          return (
            <div className="space-y-1">
              <div className="font-medium">{typeLabel}</div>
              {org.ownershipStatus && (
                <Badge variant="secondary" className="text-xs">
                  {org.ownershipStatus === 'NEGERI' ? 'Negeri' : 'Swasta'}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'regency.name',
        header: 'Lokasi',
        cell: ({ row }) => {
          const org = row.original
          return (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div>{org.district?.name || '-'}</div>
                <div className="text-muted-foreground">
                  {org.regency?.type === 'CITY' ? 'Kota' : 'Kab.'} {org.regency?.name || '-'}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'contactPerson',
        header: 'Kontak',
        cell: ({ row }) => {
          const org = row.original
          return (
            <div className="space-y-1 text-sm">
              {org.contactPerson && (
                <div className="font-medium">{org.contactPerson}</div>
              )}
              {org.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {org.phone}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'teachingStaffCount',
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="-ml-4"
              >
                Personel
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">Informasi Personel:</p>
                      <p>• <strong>Tenaga Pengajar:</strong> Guru/Kader/Tenaga Medis</p>
                      <p>• <strong>Tenaga Non-Pengajar:</strong> Staf Admin/Tendik</p>
                      <p>• <strong>Program Aktif:</strong> Jumlah program yang sedang berjalan</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        },
        cell: ({ row }) => {
          const org = row.original
          const totalStaff = (org.teachingStaffCount || 0) + (org.nonTeachingStaffCount || 0)
          
          return (
            <div className="space-y-2">
              {/* Total Staff */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-base">
                    {totalStaff.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    personel
                  </span>
                </div>
              </div>
              
              {/* Staff Breakdown (if available) */}
              {totalStaff > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span>Pengajar: {org.teachingStaffCount || 0}</span>
                  {org.nonTeachingStaffCount ? <span> • Tendik: {org.nonTeachingStaffCount}</span> : ''}
                </div>
              )}
              
              {/* Active Enrollments (calculated) */}
              {(org.totalEnrollments || 0) > 0 && (
                <div className="text-xs text-primary font-medium">
                  {org.totalEnrollments} program aktif
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.getValue('isActive') as boolean
          return isActive ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Aktif
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              Nonaktif
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const org = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu aksi</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => router.push(`/beneficiary-organizations/${org.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Detail
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => router.push(`/beneficiary-organizations/${org.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => onDelete(org.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  )

  // Initialize TanStack Table
  const table = useReactTable({
    data: organizations || [],
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!organizations || organizations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada organisasi penerima manfaat</p>
          <p className="text-sm mt-2">Klik tombol &quot;Tambah Organisasi&quot; untuk memulai</p>
        </CardContent>
      </Card>
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
                      Tidak ada data organisasi.
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
          {table.getFilteredRowModel().rows.length} organisasi ditemukan
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
