/**
 * @fileoverview Employee List Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * DataTable component for displaying and managing employees
 * Features: search, filter, sort, pagination, actions
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useEmployees,
  useDeleteEmployee,
  useUpdateEmployeeStatus,
} from '../hooks'
import type { EmployeeFiltersInput } from '../schemas/employeeSchema'
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
  UserCheck,
  UserX,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface EmployeeListProps {
  departmentId?: string
  positionId?: string
}

export function EmployeeList({ departmentId, positionId }: EmployeeListProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<EmployeeFiltersInput>({
    search: '',
    departmentId,
    positionId,
    page: 1,
    limit: 10,
    sortBy: 'fullName',
    sortOrder: 'asc',
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Queries & Mutations
  const { data: result, isLoading } = useEmployees(filters)
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee()
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEmployeeStatus()

  // Handlers
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }

  const handleFilterChange = (
    key: keyof EmployeeFiltersInput,
    value: EmployeeFiltersInput[keyof EmployeeFiltersInput]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column as EmployeeFiltersInput['sortBy'],
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteEmployee(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  const handleStatusToggle = (id: string, currentStatus: boolean) => {
    updateStatus({ id, isActive: !currentStatus })
  }

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const employees = result?.data || []
  const pagination = result?.pagination

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Daftar Karyawan
            </CardTitle>
            <Button onClick={() => router.push('/hrd/employees/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Karyawan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau kode karyawan..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Employment Type Filter */}
            <Select
              value={filters.employmentType || 'all'}
              onValueChange={(value) =>
                handleFilterChange('employmentType', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipe Kerja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="PERMANENT">Tetap</SelectItem>
                <SelectItem value="CONTRACT">Kontrak</SelectItem>
                <SelectItem value="TEMPORARY">Sementara</SelectItem>
                <SelectItem value="INTERN">Magang</SelectItem>
                <SelectItem value="FREELANCE">Freelance</SelectItem>
              </SelectContent>
            </Select>

            {/* Employment Status Filter */}
            <Select
              value={filters.employmentStatus || 'all'}
              onValueChange={(value) =>
                handleFilterChange('employmentStatus', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status Kerja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="PROBATION">Probation</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="TERMINATED">Diberhentikan</SelectItem>
                <SelectItem value="RESIGNED">Resign</SelectItem>
                <SelectItem value="RETIRED">Pensiun</SelectItem>
              </SelectContent>
            </Select>

            {/* Active Status Filter */}
            <Select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onValueChange={(value) =>
                handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status Aktif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('employeeCode')}
                  >
                    Kode Karyawan
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('fullName')}
                  >
                    Nama Lengkap
                  </TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('department')}
                  >
                    Departemen
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('position')}
                  >
                    Posisi
                  </TableHead>
                  <TableHead>Tipe Kerja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('joinDate')}
                  >
                    Tanggal Bergabung
                  </TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Tidak ada data karyawan
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-mono text-sm">
                        {employee.employeeCode || '-'}
                      </TableCell>
                      <TableCell className="font-medium">{employee.fullName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{employee.email || '-'}</div>
                          <div className="text-muted-foreground">{employee.phone || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department.departmentName}</TableCell>
                      <TableCell>
                        <div>
                          <div>{employee.position.positionName}</div>
                          <Badge variant="outline" className="text-xs">
                            {employee.position.level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.employmentType === 'PERMANENT'
                              ? 'default'
                              : employee.employmentType === 'CONTRACT'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {employee.employmentType === 'PERMANENT' && 'Tetap'}
                          {employee.employmentType === 'CONTRACT' && 'Kontrak'}
                          {employee.employmentType === 'TEMPORARY' && 'Sementara'}
                          {employee.employmentType === 'INTERN' && 'Magang'}
                          {employee.employmentType === 'FREELANCE' && 'Freelance'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              employee.employmentStatus === 'ACTIVE'
                                ? 'default'
                                : employee.employmentStatus === 'PROBATION'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {employee.employmentStatus === 'ACTIVE' && 'Aktif'}
                            {employee.employmentStatus === 'PROBATION' && 'Probation'}
                            {employee.employmentStatus === 'TERMINATED' && 'Diberhentikan'}
                            {employee.employmentStatus === 'RESIGNED' && 'Resign'}
                            {employee.employmentStatus === 'RETIRED' && 'Pensiun'}
                          </Badge>
                          {!employee.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Nonaktif
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(employee.joinDate), 'dd MMM yyyy', {
                          locale: idLocale,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/hrd/employees/${employee.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/hrd/employees/${employee.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusToggle(employee.id, employee.isActive)}
                              disabled={isUpdatingStatus}
                            >
                              {employee.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(employee.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} karyawan
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Karyawan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus karyawan ini? Jika karyawan memiliki data terkait
              (absensi, cuti, payroll), karyawan akan dinonaktifkan. Jika tidak, karyawan akan
              dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
