/**
 * @fileoverview SPPG User List Component with DataTable
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Table
 * @author Bagizi-ID Development Team
 * 
 * Features:
 * - shadcn/ui DataTable with sorting & filtering
 * - Search by name/email
 * - Filter by role, status, date range
 * - Pagination (10/25/50/100 per page)
 * - Action menu (edit, delete, reset password, toggle status)
 * - Loading skeleton & empty state
 * - Multi-tenant safe (filtered by sppgId)
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  KeyRound,
  UserX,
  UserCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

import {
  useUsers,
  useDeleteUser,
  useUpdateStatus,
  useResetPassword,
} from '@/features/sppg/user/hooks'
import type { UserListItem } from '@/features/sppg/user/types'
import type { UserRole } from '@prisma/client'

/**
 * User List Component
 * Displays all users with filtering, sorting, and actions
 */
export function UserList() {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // AlertDialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string; name: string }>({
    open: false,
    userId: '',
    name: '',
  })
  const [resetDialog, setResetDialog] = useState<{ open: boolean; userId: string; email: string }>({
    open: false,
    userId: '',
    email: '',
  })

  // Hooks
  const { data: users, isLoading } = useUsers({
    userRole: roleFilter !== 'all' ? (roleFilter as UserRole) : undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    search: globalFilter || undefined,
  })

  const { mutate: deleteUser } = useDeleteUser()
  const { mutate: updateStatus } = useUpdateStatus()
  const { mutate: resetPassword } = useResetPassword()

  // Columns definition
  const columns: ColumnDef<UserListItem>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-accent"
          >
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original
        const initials = user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage || undefined} alt={user.name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'userRole',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-accent"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const role = row.getValue('userRole') as UserRole
        return <Badge variant="outline">{getRoleLabel(role)}</Badge>
      },
    },
    {
      accessorKey: 'position',
      header: 'Posisi',
      cell: ({ row }) => {
        const position = row.original.position
        return (
          <div className="text-sm">
            {position?.positionName || '-'}
          </div>
        )
      },
    },
    {
      accessorKey: 'department',
      header: 'Departemen',
      cell: ({ row }) => {
        const department = row.original.department
        return (
          <div className="text-sm">
            {department?.departmentName || '-'}
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-accent"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'lastLogin',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-accent"
          >
            Login Terakhir
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const lastLogin = row.getValue('lastLogin') as string | null
        if (!lastLogin) return <span className="text-muted-foreground">Belum pernah</span>
        return (
          <div className="text-sm">
            {new Date(lastLogin).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/users/${user.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/users/${user.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleResetPassword(user.id, user.email)}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(user.id, !user.isActive)}
              >
                {user.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Aktifkan
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteUser(user.id, user.name)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Table instance
  const table = useReactTable({
    data: users?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  // Action handlers
  const handleResetPassword = (userId: string, email: string) => {
    setResetDialog({ open: true, userId, email })
  }

  const confirmResetPassword = () => {
    const newPassword = generateRandomPassword()
    resetPassword(
      { id: resetDialog.userId, data: { newPassword, confirmPassword: newPassword } },
      {
        onSuccess: () => {
          toast.success('Password berhasil direset', {
            description: `Password baru: ${newPassword}`,
          })
          setResetDialog({ open: false, userId: '', email: '' })
        },
      }
    )
  }

  const handleToggleStatus = (userId: string, isActive: boolean) => {
    updateStatus(
      { id: userId, isActive },
      {
        onSuccess: () => {
          toast.success(
            isActive ? 'User berhasil diaktifkan' : 'User berhasil dinonaktifkan'
          )
        },
      }
    )
  }

  const handleDeleteUser = (userId: string, name: string) => {
    setDeleteDialog({ open: true, userId, name })
  }

  const confirmDeleteUser = () => {
    deleteUser(deleteDialog.userId, {
      onSuccess: () => {
        toast.success('User berhasil dihapus')
        setDeleteDialog({ open: false, userId: '', name: '' })
      },
    })
  }

  // Loading state
  if (isLoading) {
    return <UserListSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="SPPG_KEPALA">Kepala SPPG</SelectItem>
              <SelectItem value="SPPG_ADMIN">Admin</SelectItem>
              <SelectItem value="SPPG_AHLI_GIZI">Ahli Gizi</SelectItem>
              <SelectItem value="SPPG_AKUNTAN">Akuntan</SelectItem>
              <SelectItem value="SPPG_PRODUKSI_MANAGER">Manager Produksi</SelectItem>
              <SelectItem value="SPPG_DISTRIBUSI_MANAGER">Manager Distribusi</SelectItem>
              <SelectItem value="SPPG_HRD_MANAGER">Manager HRD</SelectItem>
              <SelectItem value="SPPG_STAFF_DAPUR">Staff Dapur</SelectItem>
              <SelectItem value="SPPG_STAFF_DISTRIBUSI">Staff Distribusi</SelectItem>
              <SelectItem value="SPPG_STAFF_ADMIN">Staff Admin</SelectItem>
              <SelectItem value="SPPG_STAFF_QC">Staff QC</SelectItem>
              <SelectItem value="SPPG_VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add User Button */}
        <Button asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Link>
        </Button>
      </div>

      {/* Data Table */}
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
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p>Tidak ada user ditemukan</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/users/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah User Pertama
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} user ditemukan
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

      {/* Delete User AlertDialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, userId: '', name: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{deleteDialog.name}</strong>?
              <br />
              <br />
              User akan dinonaktifkan dan tidak bisa login lagi. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password AlertDialog */}
      <AlertDialog open={resetDialog.open} onOpenChange={(open) => !open && setResetDialog({ open: false, userId: '', email: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin reset password untuk <strong>{resetDialog.email}</strong>?
              <br />
              <br />
              Password baru akan di-generate secara otomatis dan ditampilkan setelah reset berhasil. Pastikan Anda menyimpan password baru tersebut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * Loading skeleton for UserList
 */
function UserListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Get Indonesian label for user role
 */
function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    SPPG_KEPALA: 'Kepala SPPG',
    SPPG_ADMIN: 'Admin',
    SPPG_AHLI_GIZI: 'Ahli Gizi',
    SPPG_AKUNTAN: 'Akuntan',
    SPPG_PRODUKSI_MANAGER: 'Manager Produksi',
    SPPG_DISTRIBUSI_MANAGER: 'Manager Distribusi',
    SPPG_HRD_MANAGER: 'Manager HRD',
    SPPG_STAFF_DAPUR: 'Staff Dapur',
    SPPG_STAFF_DISTRIBUSI: 'Staff Distribusi',
    SPPG_STAFF_ADMIN: 'Staff Admin',
    SPPG_STAFF_QC: 'Staff QC',
    SPPG_VIEWER: 'Viewer',
    DEMO_USER: 'Demo',
    PLATFORM_SUPERADMIN: 'Superadmin',
    PLATFORM_SUPPORT: 'Support',
    PLATFORM_ANALYST: 'Analyst',
  }
  return labels[role] || role
}

/**
 * Generate random password for reset
 */
function generateRandomPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}
