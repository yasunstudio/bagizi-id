/**
 * @fileoverview Position List Component with Data Table
 * Displays positions with filters, sorting, and actions
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Building2,
  Users,
  DollarSign,
} from 'lucide-react'
import { usePositions, useDeletePosition } from '../hooks/usePositions'
import { useDepartments } from '../hooks/useDepartments'
import type { PositionWithCount } from '../types/position.types'
import { EMPLOYEE_LEVEL_LABELS, EMPLOYEE_LEVEL_COLORS } from '../types/position.types'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { EmployeeLevel } from '@prisma/client'

export function PositionList() {
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState<string>('')
  const [level, setLevel] = useState<EmployeeLevel | ''>('')
  const [isActive, setIsActive] = useState<boolean | ''>('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch positions with filters
  const { data: positions, isLoading, error } = usePositions({
    search: search || undefined,
    departmentId: departmentId || undefined,
    level: level || undefined,
    isActive: isActive === '' ? undefined : isActive,
  })

  // Debug logging
  console.log('🔍 PositionList Debug:', {
    isLoading,
    hasError: !!error,
    error: error?.message,
    positionsCount: positions?.length,
    positions: positions?.slice(0, 2), // First 2 items for inspection
  })

  // Fetch departments for filter
  const { data: departments } = useDepartments()

  // Delete mutation
  const { mutate: deletePosition, isPending: isDeleting } = useDeletePosition()

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteId) {
      deletePosition(deleteId)
      setDeleteId(null)
    }
  }

  // Calculate occupancy percentage
  const getOccupancyPercentage = (current: number, max: number) => {
    if (max === 0) return 0
    return Math.round((current / max) * 100)
  }

  // Get occupancy color based on percentage
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400'
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  // Table columns definition
  const columns: ColumnDef<PositionWithCount>[] = [
    {
      accessorKey: 'positionCode',
      header: 'Kode',
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.getValue('positionCode')}
        </div>
      ),
    },
    {
      accessorKey: 'positionName',
      header: 'Nama Posisi',
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <div className="font-medium truncate">
            {row.getValue('positionName')}
          </div>
          {row.original.jobDescription && (
            <div className="text-sm text-muted-foreground truncate">
              {row.original.jobDescription}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Departemen',
      cell: ({ row }) => {
        const dept = row.original.department
        return (
          <Link
            href={`/hrd/departments/${dept.id}`}
            className="flex items-center gap-2 hover:underline"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{dept.departmentName}</span>
          </Link>
        )
      },
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => {
        const level = row.getValue('level') as EmployeeLevel
        return (
          <Badge variant={EMPLOYEE_LEVEL_COLORS[level]}>
            {EMPLOYEE_LEVEL_LABELS[level]}
          </Badge>
        )
      },
    },
    {
      id: 'salary',
      header: 'Rentang Gaji',
      cell: ({ row }) => {
        const position = row.original
        const formatter = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: position.currency || 'IDR',
          minimumFractionDigits: 0,
        })

        return (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {formatter.format(position.minSalary || 0)} - {formatter.format(position.maxSalary || 0)}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'occupancy',
      header: 'Terisi',
      cell: ({ row }) => {
        const position = row.original
        const percentage = getOccupancyPercentage(
          position.currentOccupants,
          position.maxOccupants
        )
        const colorClass = getOccupancyColor(percentage)

        return (
          <div className="w-[120px] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={colorClass}>
                {position.currentOccupants}/{position.maxOccupants}
              </span>
              <span className={colorClass}>{percentage}%</span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${
                percentage >= 100
                  ? '[&>div]:bg-red-600'
                  : percentage >= 80
                  ? '[&>div]:bg-yellow-600'
                  : '[&>div]:bg-blue-600'
              }`}
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive')
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const position = row.original
        const hasEmployees = position.currentOccupants > 0

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
              <DropdownMenuItem asChild>
                <Link href={`/hrd/positions/${position.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/hrd/positions/${position.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Posisi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteId(position.id)}
                disabled={hasEmployees}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Posisi
              </DropdownMenuItem>
              {hasEmployees && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Tidak dapat dihapus: {position.currentOccupants} pegawai aktif
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daftar Posisi</h2>
          <p className="text-muted-foreground">
            Kelola posisi jabatan dalam organisasi Anda
          </p>
        </div>
        <Button asChild>
          <Link href="/hrd/positions/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Posisi
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      {positions && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posisi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{positions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posisi Aktif</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {positions.filter((p) => p.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slot</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {positions.reduce((sum, p) => sum + p.maxOccupants, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terisi</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {positions.reduce((sum, p) => sum + p.currentOccupants, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari</label>
              <Input
                placeholder="Cari nama atau kode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departemen</label>
              <Select value={departmentId || 'ALL'} onValueChange={(value) => setDepartmentId(value === 'ALL' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua departemen</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select
                value={level || 'ALL'}
                onValueChange={(value) => setLevel(value === 'ALL' ? '' : (value as EmployeeLevel))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua level</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="SENIOR_MANAGER">Senior Manager</SelectItem>
                  <SelectItem value="DIRECTOR">Director</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={isActive === '' ? 'ALL' : isActive.toString()}
                onValueChange={(value) =>
                  setIsActive(value === 'ALL' ? '' : value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua status</SelectItem>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-destructive font-semibold">Error memuat data</div>
              <div className="text-sm text-muted-foreground">{error.message}</div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          ) : !positions || positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-muted-foreground">Tidak ada data posisi</div>
              <Button asChild size="sm">
                <Link href="/hrd/positions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Posisi Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={positions}
              searchKey="positionName"
              searchPlaceholder="Cari posisi..."
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Posisi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus posisi ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
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
    </div>
  )
}
