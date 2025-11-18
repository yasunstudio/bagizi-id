/**
 * @fileoverview Department List Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * DataTable component for displaying and managing departments
 * Features: search, filter by status, hierarchical display, actions
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useDepartments,
  useDeleteDepartment,
} from '../hooks'
import type { DepartmentFilters } from '../types/department.types'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  Briefcase,
} from 'lucide-react'

interface DepartmentListProps {
  parentId?: string
}

export function DepartmentList({ parentId }: DepartmentListProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<DepartmentFilters>({
    search: '',
    parentId,
    isActive: undefined,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Queries & Mutations
  const { data: departments, isLoading } = useDepartments(filters)
  const { mutate: deleteDepartment, isPending: isDeleting } = useDeleteDepartment()

  // Handlers
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  const handleFilterChange = (key: keyof DepartmentFilters, value: string) => {
    if (key === 'isActive') {
      setFilters((prev) => ({
        ...prev,
        isActive: value === 'all' ? undefined : value === 'true',
      }))
    } else {
      setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    }
  }

  const handleView = (id: string) => {
    router.push(`/hrd/departments/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/hrd/departments/${id}/edit`)
  }

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteDepartment(deleteId, {
        onSuccess: () => {
          setDeleteId(null)
          router.refresh()
        },
      })
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Daftar Departemen
            </CardTitle>
            <Button onClick={() => router.push('/hrd/departments/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Departemen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari departemen..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={
                filters.isActive === undefined
                  ? 'all'
                  : filters.isActive
                  ? 'true'
                  : 'false'
              }
              onValueChange={(value) => handleFilterChange('isActive', value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {departments && departments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Departemen</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="text-center">
                      <Users className="mx-auto h-4 w-4" />
                    </TableHead>
                    <TableHead className="text-center">
                      <Briefcase className="mx-auto h-4 w-4" />
                    </TableHead>
                    <TableHead className="text-center">Budget</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => {
                    const capacityPercentage = dept.maxEmployees
                      ? (dept.currentEmployees / dept.maxEmployees) * 100
                      : 0
                    const isNearCapacity = capacityPercentage >= 80

                    return (
                      <TableRow key={dept.id}>
                        {/* Department Code */}
                        <TableCell className="font-mono text-sm">
                          {dept.departmentCode}
                        </TableCell>

                        {/* Department Name */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {dept.departmentName}
                            </span>
                            {dept.description && (
                              <span className="text-xs text-muted-foreground">
                                {dept.description.length > 50
                                  ? `${dept.description.slice(0, 50)}...`
                                  : dept.description}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Parent Department */}
                        <TableCell>
                          {dept.parentId && 'parent' in dept && dept.parent ? (
                            <Badge variant="outline" className="text-xs">
                              {(dept.parent as { departmentName: string }).departmentName}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Root
                            </span>
                          )}
                        </TableCell>

                        {/* Employee Count */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">
                              {dept.currentEmployees}
                            </span>
                            {dept.maxEmployees && (
                              <span className="text-xs text-muted-foreground">
                                / {dept.maxEmployees}
                              </span>
                            )}
                            {isNearCapacity && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                {capacityPercentage.toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Position Count */}
                        <TableCell className="text-center">
                          {'_count' in dept && dept._count ? (
                            <span className="font-medium">
                              {(dept._count as { positions: number }).positions}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Budget */}
                        <TableCell className="text-center">
                          {dept.budgetAllocated ? (
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-medium">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  notation: 'compact',
                                  maximumFractionDigits: 0,
                                }).format(dept.budgetAllocated)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <Badge
                            variant={dept.isActive ? 'default' : 'secondary'}
                          >
                            {dept.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleView(dept.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(dept.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteId(dept.id)}
                                className="text-destructive focus:text-destructive"
                                disabled={dept.currentEmployees > 0}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                Tidak ada departemen
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Mulai dengan menambahkan departemen baru
              </p>
              <Button onClick={() => router.push('/hrd/departments/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Departemen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus departemen ini? Tindakan ini
              tidak dapat dibatalkan.
              <br />
              <br />
              <strong>Catatan:</strong> Departemen hanya dapat dihapus jika
              tidak memiliki karyawan, posisi, atau sub-departemen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
