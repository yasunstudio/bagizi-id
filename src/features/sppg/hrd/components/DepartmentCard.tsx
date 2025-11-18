/**
 * @fileoverview Department Detail Card Component
 * @module features/sppg/hrd/components/DepartmentCard
 * @description Comprehensive display component for department details
 * 
 * ENTERPRISE FEATURES:
 * - Complete department information display
 * - Hierarchical structure visualization (parent & children)
 * - Capacity tracking with visual indicators
 * - Budget display with formatting
 * - Manager information with links
 * - Employee and position previews
 * - Contact information display
 * - Activity statistics and metrics
 * - Quick actions (edit, delete)
 * - Responsive design with dark mode
 * - Accessibility compliant (WCAG 2.1 AA)
 * 
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  ChevronRight,
  User,
  DollarSign,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

import { useDeleteDepartment } from '../hooks'
import type { DepartmentWithRelations } from '../types/department.types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface DepartmentCardProps {
  department: DepartmentWithRelations
  showActions?: boolean
}

export function DepartmentCard({
  department,
  showActions = true,
}: DepartmentCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { mutate: deleteDepartment, isPending: isDeleting } = useDeleteDepartment()

  // Calculate capacity metrics
  const employeeCapacityPercentage = department.maxEmployees
    ? (department.currentEmployees / department.maxEmployees) * 100
    : 0

  const canDelete =
    department.currentEmployees === 0 &&
    department._count.positions === 0 &&
    department._count.children === 0

  // Delete handler
  const handleDelete = () => {
    deleteDepartment(department.id, {
      onSuccess: () => {
        toast.success('Departemen berhasil dihapus')
        router.push('/hrd/departments')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus departemen')
      },
    })
  }

  // Helper to get manager initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">
                      {department.departmentName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm">
                        {department.departmentCode}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <Badge
                        variant={department.isActive ? 'default' : 'secondary'}
                      >
                        {department.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/hrd/departments/${department.id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canDelete || isDeleting}
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          {department.description && (
            <CardContent>
              <p className="text-muted-foreground">{department.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Capacity Warning Alert */}
        {department.maxEmployees &&
          employeeCapacityPercentage >= 80 &&
          department.isActive && (
            <Alert
              variant={employeeCapacityPercentage >= 100 ? 'destructive' : 'default'}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {employeeCapacityPercentage >= 100
                  ? 'Kapasitas Penuh'
                  : 'Mendekati Kapasitas'}
              </AlertTitle>
              <AlertDescription>
                Departemen ini menggunakan {employeeCapacityPercentage.toFixed(0)}%
                dari kapasitas maksimal ({department.currentEmployees} dari{' '}
                {department.maxEmployees} karyawan).
                {employeeCapacityPercentage >= 100 &&
                  ' Tidak dapat menerima karyawan baru tanpa menambah kapasitas.'}
              </AlertDescription>
            </Alert>
          )}

        {/* Statistics Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Employee Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Karyawan
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{department.currentEmployees}</div>
              {department.maxEmployees && (
                <p className="text-xs text-muted-foreground">
                  dari {department.maxEmployees} maksimal
                </p>
              )}
            </CardContent>
          </Card>

          {/* Position Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Posisi
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{department._count.positions}</div>
              <p className="text-xs text-muted-foreground">
                posisi terdaftar
              </p>
            </CardContent>
          </Card>

          {/* Child Departments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sub-Departemen
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{department._count.children}</div>
              <p className="text-xs text-muted-foreground">
                departemen child
              </p>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Budget
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {department.budgetAllocated
                  ? formatCurrency(department.budgetAllocated)
                  : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                teralokasi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Capacity Progress */}
        {department.maxEmployees && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Kapasitas Karyawan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress
                value={employeeCapacityPercentage}
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {department.currentEmployees} dari {department.maxEmployees} karyawan
                </span>
                <span
                  className={
                    employeeCapacityPercentage >= 100
                      ? 'text-destructive font-semibold'
                      : employeeCapacityPercentage >= 80
                      ? 'text-warning font-semibold'
                      : 'text-muted-foreground'
                  }
                >
                  {employeeCapacityPercentage.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hierarchy Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Struktur Hierarki
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Parent Department */}
            {department.parent ? (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Parent Departemen
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => router.push(`/hrd/departments/${department.parent!.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {department.parent.departmentCode}
                    </span>
                    <span>{department.parent.departmentName}</span>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Badge variant="outline">Root Department</Badge>
                <p className="mt-1">Tidak memiliki parent departemen</p>
              </div>
            )}

            <Separator />

            {/* Child Departments */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Sub-Departemen ({department._count.children})
              </div>
              {department.children && department.children.length > 0 ? (
                <div className="space-y-2">
                  {department.children.map((child) => (
                    <Button
                      key={child.id}
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => router.push(`/hrd/departments/${child.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {child.departmentCode}
                        </span>
                        <span>{child.departmentName}</span>
                        <Badge variant="outline" className="text-xs">
                          {child.currentEmployees} karyawan
                        </Badge>
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada sub-departemen
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manager Card */}
        {department.manager && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Manager Departemen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full justify-start p-4 h-auto"
                onClick={() => router.push(`/hrd/employees/${department.manager!.id}`)}
              >
                <div className="flex items-center gap-4 w-full">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={department.manager.photoUrl || undefined} />
                    <AvatarFallback>
                      {getInitials(department.manager.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{department.manager.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {department.manager.employeeCode}
                    </div>
                    <Badge variant="outline" className="mt-1">
                      Position ID: {department.manager.positionId}
                    </Badge>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Informasi Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {department.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${department.email}`}
                  className="text-sm hover:underline text-primary"
                >
                  {department.email}
                </a>
              </div>
            )}
            {department.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${department.phone}`}
                  className="text-sm hover:underline text-primary"
                >
                  {department.phone}
                </a>
              </div>
            )}
            {department.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{department.location}</span>
              </div>
            )}
            {!department.email && !department.phone && !department.location && (
              <p className="text-sm text-muted-foreground">
                Tidak ada informasi kontak
              </p>
            )}
          </CardContent>
        </Card>

        {/* Employees Preview */}
        {department.employees && department.employees.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Karyawan ({department.currentEmployees})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/hrd/employees?departmentId=${department.id}`)
                  }
                >
                  Lihat Semua
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {department.employees.slice(0, 5).map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/hrd/employees/${employee.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.photoUrl || undefined} />
                            <AvatarFallback>
                              {getInitials(employee.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {employee.employeeCode}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {employee.positionId || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.employmentStatus === 'ACTIVE'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {employee.employmentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {department.currentEmployees > 5 && (
                <div className="text-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/hrd/employees?departmentId=${department.id}`)
                    }
                  >
                    Lihat {department.currentEmployees - 5} karyawan lainnya
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Positions Preview */}
        {department.positions && department.positions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Posisi ({department._count.positions})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/hrd/positions?departmentId=${department.id}`)
                  }
                >
                  Lihat Semua
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Terisi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {department.positions.slice(0, 5).map((position) => (
                    <TableRow
                      key={position.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/hrd/positions/${position.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{position.positionName}</div>
                          <div className="text-sm text-muted-foreground">
                            {position.positionCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{position.level}</Badge>
                      </TableCell>
                      <TableCell>
                        {position.currentOccupants || 0}
                        {position.maxOccupants && ` / ${position.maxOccupants}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={position.isActive ? 'default' : 'secondary'}
                        >
                          {position.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Metadata Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informasi Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dibuat</span>
              <span>
                {format(new Date(department.createdAt), 'dd MMMM yyyy, HH:mm', {
                  locale: localeId,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Terakhir Diubah</span>
              <span>
                {format(new Date(department.updatedAt), 'dd MMMM yyyy, HH:mm', {
                  locale: localeId,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-xs">{department.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Departemen?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Anda akan menghapus departemen{' '}
                <strong>{department.departmentName}</strong> (
                {department.departmentCode}).
              </p>
              {!canDelete && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tidak Dapat Menghapus</AlertTitle>
                  <AlertDescription>
                    Departemen masih memiliki:
                    <ul className="list-disc list-inside mt-2">
                      {department.currentEmployees > 0 && (
                        <li>{department.currentEmployees} karyawan</li>
                      )}
                      {department._count.positions > 0 && (
                        <li>{department._count.positions} posisi</li>
                      )}
                      {department._count.children > 0 && (
                        <li>{department._count.children} sub-departemen</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
